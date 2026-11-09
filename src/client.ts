/** Ancient Echoes Tools API 的薄 HTTP 客户端：只做透传、错误归一和超时/取消。 */

export interface ToolInvokeSuccess {
  api_version: string
  request_id: string
  /** 计算能力与版本；没有计算溯源的工具为空对象。 */
  calculation: Record<string, string>
  /** 工具输出（结构由各工具自己的契约决定）。 */
  data: unknown
}

export interface InvokeOptions {
  baseUrl: string
  apiKey: string
  /** AE 侧工具 ID，例如 `bazi.calculate_chart`。 */
  aeName: string
  args: Record<string, unknown>
  timeoutMs: number
  signal?: AbortSignal
  userAgent: string
}

/** 远端返回的结构化失败，保留机器可读错误码，便于模型如实转告。 */
export class AncientEchoesToolError extends Error {
  readonly code: string
  readonly status: number
  readonly requestId?: string
  readonly docsUrl?: string
  readonly details?: unknown

  constructor(input: {
    code: string
    message: string
    status: number
    requestId?: string
    docsUrl?: string
    details?: unknown
  }) {
    super(AncientEchoesToolError.format(input))
    this.name = 'AncientEchoesToolError'
    this.code = input.code
    this.status = input.status
    this.requestId = input.requestId
    this.docsUrl = input.docsUrl
    this.details = input.details
  }

  private static format(input: { code: string; message: string; status: number; requestId?: string }): string {
    const hint = ERROR_HINTS[input.code]
    const suffix = hint ? ` 处理建议：${hint}` : ''
    const requestId = input.requestId ? ` request_id=${input.requestId}` : ''
    return `[${input.code}] ${input.message}（HTTP ${input.status}${requestId}）${suffix}`
  }
}

/** 已知错误码的可执行提示，与服务端 tool_api_controller 的错误码保持一致。 */
const ERROR_HINTS: Record<string, string> = {
  tool_entitlement_required: '当前账号权益不包含该工具；如实告知用户需要对应付费权益，不要改写结果或换算法替代。',
  tool_quota_exceeded: '已触发每日/每分钟配额；按 Retry-After 等待后重试，或提示用户明天再试。',
  tool_scope_required: '该 API Key 缺少 tools:read / tools:invoke scope，需要在 AE 开发者设置重新签发。',
  tool_invocation_failed: '参数或内部执行失败；检查必填字段、条件约束与取值枚举后重试。',
  invalid_argument: '入参不符合工具契约；按错误信息修正字段。',
  unauthorized: '缺少或无效的 API Key；设置 ANCIENT_ECHOES_TOKEN 或插件 config.apiKey。',
  rag_service_unavailable: 'RAG 检索后端暂不可用；稍后重试，不要伪造引用。',
}

interface ErrorBody {
  success?: boolean
  code?: string
  message?: string
  request_id?: string
  docs_url?: string
  data?: unknown
}

/** 组合调用方取消信号与插件超时；Node 20+ 提供 AbortSignal.any。 */
function composeSignal(timeoutMs: number, outer?: AbortSignal): { signal: AbortSignal; dispose: () => void } {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new Error(`请求超时（${timeoutMs}ms）`)), timeoutMs)
  const onAbort = () => controller.abort(outer?.reason)
  if (outer) {
    if (outer.aborted) onAbort()
    else outer.addEventListener('abort', onAbort, { once: true })
  }
  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timer)
      outer?.removeEventListener('abort', onAbort)
    },
  }
}

export async function invokeTool(options: InvokeOptions): Promise<ToolInvokeSuccess> {
  const baseUrl = options.baseUrl.replace(/\/+$/u, '')
  const url = `${baseUrl}/api/v1/tools/${options.aeName}`
  const { signal, dispose } = composeSignal(options.timeoutMs, options.signal)

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${options.apiKey}`,
        'content-type': 'application/json',
        accept: 'application/json',
        'user-agent': options.userAgent,
      },
      body: JSON.stringify(options.args),
      signal,
    })
  } catch (error) {
    if (signal.aborted) {
      throw new AncientEchoesToolError({
        code: 'request_aborted',
        message: signal.reason instanceof Error ? signal.reason.message : '调用被取消',
        status: 0,
      })
    }
    throw new AncientEchoesToolError({
      code: 'network_error',
      message: `无法连接 ${url}：${error instanceof Error ? error.message : String(error)}`,
      status: 0,
    })
  } finally {
    dispose()
  }

  const text = await response.text()
  let body: (ToolInvokeSuccess & ErrorBody) | undefined
  try {
    body = text ? (JSON.parse(text) as ToolInvokeSuccess & ErrorBody) : undefined
  } catch {
    throw new AncientEchoesToolError({
      code: 'invalid_response',
      message: `服务端返回了非 JSON 响应：${text.slice(0, 200)}`,
      status: response.status,
    })
  }

  if (!response.ok || body?.success === false || !body) {
    throw new AncientEchoesToolError({
      code: body?.code ?? `http_${response.status}`,
      message: body?.message ?? `远程工具调用失败（HTTP ${response.status}）`,
      status: response.status,
      requestId: body?.request_id,
      docsUrl: body?.docs_url,
      details: body?.data,
    })
  }

  return {
    api_version: body.api_version ?? '',
    request_id: body.request_id ?? '',
    calculation: body.calculation ?? {},
    data: body.data,
  }
}
