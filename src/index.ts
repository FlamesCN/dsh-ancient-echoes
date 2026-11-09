import { createRequire } from 'node:module'
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { defineTool, type ParameterSchemaSpec } from '@deepseek-ai/dsh-tools'
import { AE_TOOLS } from './tools.generated.js'
import { invokeTool } from './client.js'
import { GUIDE_TEXT } from './guide.js'

const packageJson = createRequire(import.meta.url)('../package.json') as { version: string }

/** 插件 ID，必须与 cordis.patch.yml 里的 id 一致。 */
export const name = 'dsh-ancient-echoes'
export const inject = ['tools']

/**
 * 默认注册的核心工具：覆盖排盘、命盘对照、紫微、RAG 检索与黄历择日。
 * `tools: 'all'` 可一次注册 registry 全部 38 个工具。
 */
const CORE_TOOLS: readonly string[] = [
  'bazi.calculate_chart',
  'bazi.compare_charts',
  'bazi.analyze_wealth',
  'ziwei.calculate_chart',
  'lingxi.rag_search',
  'lingxi.rag_query',
  'almanac.get_day',
  'election.find_good_days',
  'divination.preview_liuyao',
  'divination.preview_meihua',
]

/**
 * DSH 凭据服务的最小接口：`resolve` 按引用名取回密钥（store > 环境变量 > .env）。
 * 只取我们需要的部分，避免把整个凭据包变成运行时依赖。
 */
interface CredentialService {
  resolve(ref: string): Promise<{ value?: string; source?: string } | undefined>
}

export interface Config {
  /** 直写密钥（仅本地临时用）。留空时按 apiKeyRef 从 DSH 凭据库/环境变量解析。 */
  apiKey?: string
  /** 凭据引用名（POSIX 环境变量名），默认 ANCIENT_ECHOES_TOKEN。 */
  apiKeyRef: string
  baseUrl: string
  /** 'core' | 'all' | 显式工具名数组（AE 名或 DSH 名均可）。 */
  tools: 'core' | 'all' | string[]
  /** DSH 工具名前缀，避免与其他插件重名。 */
  toolPrefix: string
  timeoutMs: number
  /** 单次结果回传模型的最大字符数，超出截断并标注。 */
  maxResultChars: number
}

export const Config: Schema<Config> = Schema.object({
  apiKey: Schema.string()
    .description('直写 Web API Key（sk-…）；留空时按 apiKeyRef 从 DSH 凭据库或环境变量解析')
    .default(''),
  apiKeyRef: Schema.string()
    .description('凭据引用名；在 dsh 设置里保存同名凭据，配置里只出现名字')
    .default('ANCIENT_ECHOES_TOKEN'),
  baseUrl: Schema.string().description('AE 站点根地址').default('https://www.ancientechoes.ai'),
  tools: Schema.union(['core', 'all', Schema.array(Schema.string())])
    .description("注册哪些工具：'core' 默认核心集，'all' 全量，或显式工具名数组")
    .default('core'),
  toolPrefix: Schema.string().description('注册到 DSH 的工具名前缀').default(''),
  timeoutMs: Schema.number().description('单次远端调用超时（毫秒）').default(45000),
  maxResultChars: Schema.number().description('回传模型的最大字符数').default(60000),
})

/** 把配置解析成要注册的 AE 工具名集合；未知名字直接加载失败，避免静默漏注册。 */
function resolveSelection(selection: Config['tools']): Set<string> {
  if (selection === 'all') return new Set(AE_TOOLS.map((tool) => tool.aeName))
  if (selection === 'core') return new Set(CORE_TOOLS)
  const known = new Map<string, string>()
  for (const tool of AE_TOOLS) {
    known.set(tool.aeName, tool.aeName)
    known.set(tool.dshName, tool.aeName)
  }
  const resolved = new Set<string>()
  for (const entry of selection) {
    const aeName = known.get(entry.trim())
    if (!aeName) {
      throw new Error(
        `dsh-ancient-echoes: 未知工具 "${entry}"。可用 ${known.size / 2} 个工具：${AE_TOOLS.map((tool) => tool.aeName).join(', ')}`,
      )
    }
    resolved.add(aeName)
  }
  return resolved
}

/** 取 DSH 凭据服务；自定义组合没有该服务时返回 undefined，退回环境变量。 */
function credentialsOf(ctx: Context): CredentialService | undefined {
  const candidate = ctx.get('credentials') as CredentialService | undefined
  return candidate && typeof candidate.resolve === 'function' ? candidate : undefined
}

export function apply(ctx: Context, config: Config) {
  const userAgent = `dsh-ancient-echoes/${packageJson.version}`
  const prefix = config.toolPrefix ?? ''
  const selected = resolveSelection(config.tools ?? 'core')
  const ref = (config.apiKeyRef ?? '').trim()
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(ref)) {
    throw new Error(`dsh-ancient-echoes: apiKeyRef "${ref}" 必须是 POSIX 环境变量名（字母/数字/下划线，且不以数字开头）`)
  }
  const explicitKey = (config.apiKey ?? '').trim()

  /**
   * 每次调用都解析一次凭据：dsh 凭据库里的值轮换后立即生效，无需重启。
   * 解析顺序：config.apiKey（显式覆盖）> 凭据服务（store > env > .env）> 进程环境兜底。
   */
  async function requireApiKey(): Promise<string> {
    if (explicitKey) return explicitKey
    // 每次调用重新取服务：插件 apply 时凭据服务可能尚未挂载（自定义组合/加载顺序）。
    const stored = ((await credentialsOf(ctx)?.resolve(ref))?.value ?? '').trim()
    if (stored) return stored
    const fallback = (process.env[ref] ?? '').trim()
    if (fallback) return fallback
    throw new Error(
      `Ancient Echoes 未鉴权：没有可用的凭据 ${ref}。在 dsh 设置里保存该凭据（配置只出现名字，不落明文），或 export ${ref}=sk-…；临时也可给插件 config.apiKey。`,
    )
  }

  for (const spec of AE_TOOLS) {
    if (!selected.has(spec.aeName)) continue
    ctx.tools.register(
      defineTool({
        name: `${prefix}${spec.dshName}`,
        description: `${spec.description}\n\nAE 工具：${spec.aeName}。成功结果必须带 calculation 版本一起转述；失败按错误码如实转告，不要用别的工具替代。`,
        parameters: spec.parameters as unknown as ParameterSchemaSpec,
        output: {
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              api_version: { type: 'string', required: true },
              request_id: { type: 'string', required: true },
              calculation: { type: 'object', additionalProperties: true, properties: {} },
              data: { type: 'json', required: true },
            },
          },
          render: (_args, value) => {
            const calculation = value.calculation?.capability
              ? `${String(value.calculation.capability)}@${String(value.calculation.version ?? '')}`
              : 'none'
            const payload = JSON.stringify(value.data) ?? 'null'
            const text =
              payload.length > config.maxResultChars
                ? `${payload.slice(0, config.maxResultChars)}…[结果已截断：共 ${payload.length} 字符]`
                : payload
            return [
              {
                type: 'text',
                text: `tool=${spec.aeName} api_version=${value.api_version} calculation=${calculation} request_id=${value.request_id}\n${text}`,
              },
            ]
          },
        },
        async execute(args, exec) {
          const apiKey = await requireApiKey()
          const result = await invokeTool({
            baseUrl: config.baseUrl,
            apiKey,
            aeName: spec.aeName,
            args: args as unknown as Record<string, unknown>,
            timeoutMs: config.timeoutMs,
            signal: exec.signal,
            userAgent,
          })
          return {
            api_version: result.api_version,
            request_id: result.request_id,
            calculation: result.calculation,
            data: result.data as never,
          }
        },
      }),
    )
  }

  ctx.tools.register(
    defineTool({
      name: `${prefix}ancient_echoes_guide`,
      description:
        '返回 Ancient Echoes 工具使用指南：调用顺序、时刻与出生资料的显式口径、错误码处理与隐私边界。首次使用 AE 工具或遇到错误码时先调用它。',
      parameters: {},
      output: {
        schema: { type: 'string' },
        render: (_args, value) => [{ type: 'text', text: value }],
      },
      async execute() {
        return GUIDE_TEXT
      },
    }),
  )
}
