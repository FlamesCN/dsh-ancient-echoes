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

export interface Config {
  /** AE Web API Key（sk-…）。留空时读 ANCIENT_ECHOES_TOKEN。 */
  apiKey?: string
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
  apiKey: Schema.string().description('Ancient Echoes Web API Key（sk-…）；留空则读环境变量 ANCIENT_ECHOES_TOKEN').default(''),
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

export function apply(ctx: Context, config: Config) {
  const apiKey = (config.apiKey ?? '').trim() || (process.env.ANCIENT_ECHOES_TOKEN ?? '').trim()
  const userAgent = `dsh-ancient-echoes/${packageJson.version}`
  const prefix = config.toolPrefix ?? ''
  const selected = resolveSelection(config.tools ?? 'core')

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
          if (!apiKey) {
            throw new Error(
              'Ancient Echoes API Key 未配置：设置环境变量 ANCIENT_ECHOES_TOKEN，或在 profile 的 cordis.patch.yml 中给 dsh-ancient-echoes 行配置 config.apiKey（Web API Key，sk-…）。',
            )
          }
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
