#!/usr/bin/env node
// 由 Ancient Echoes 的 OpenAPI 文档生成 DSH 工具定义（src/tools.generated.ts）。
//
// 用法：
//   node scripts/generate-tools.mjs                 # 用仓库内 schema/openapi.json 快照
//   AE_OPENAPI_URL=... node scripts/generate-tools.mjs --refresh   # 重新抓取并更新快照
//
// 规则：
// - AE 工具名 `bazi.calculate_chart` → DSH 工具名 `bazi_calculate_chart`（非字母数字换成下划线）。
// - 只透传参数结构：DSH schema DSL 没有 pattern/minimum/maxLength，这些约束写进 description，
//   服务端仍按原契约校验，避免模型丢字段语义。
// - 条件约束（oneOf/anyOf/allOf 里的 required 组合）折成 description 末尾的「条件约束」。
// - 所有 object 节点显式 additionalProperties，符合 defineTool 的 DSL 硬规则。

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const snapshotPath = path.join(root, 'schema/openapi.json')
const outPath = path.join(root, 'src/tools.generated.ts')
const refresh = process.argv.includes('--refresh')

async function loadSpec() {
  if (!refresh) return JSON.parse(await readFile(snapshotPath, 'utf8'))
  const url = process.env.AE_OPENAPI_URL ?? 'https://www.ancientechoes.ai/api/v1/tools/openapi.json'
  const response = await fetch(url, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`刷新失败 ${response.status} ${url}`)
  const text = await response.text()
  JSON.parse(text)
  await writeFile(snapshotPath, text)
  return JSON.parse(text)
}

function describe(node) {
  const parts = []
  if (typeof node.description === 'string' && node.description.trim()) parts.push(node.description.trim())
  if (typeof node.pattern === 'string') parts.push(`pattern: ${node.pattern}`)
  if (typeof node.minimum === 'number' || typeof node.maximum === 'number') {
    parts.push(`range: ${node.minimum ?? '-inf'}..${node.maximum ?? '+inf'}`)
  }
  if (typeof node.minLength === 'number') parts.push(`minLength: ${node.minLength}`)
  if (typeof node.maxLength === 'number') parts.push(`maxLength: ${node.maxLength}`)
  if (typeof node.minItems === 'number') parts.push(`minItems: ${node.minItems}`)
  if (typeof node.maxItems === 'number') parts.push(`maxItems: ${node.maxItems}`)
  return parts.join('；')
}

/** 把 oneOf/anyOf/allOf 的 required 组合折成一行条件约束说明。 */
function conditionalNote(schema) {
  if (!schema || typeof schema !== 'object') return ''
  const groups = []
  for (const key of ['oneOf', 'anyOf']) {
    const branches = schema[key]
    if (!Array.isArray(branches)) continue
    const requiredGroups = branches.map((branch) => branch?.required).filter(Array.isArray)
    if (!requiredGroups.length || requiredGroups.length !== branches.length) continue
    groups.push(requiredGroups.map((group) => `[${group.join(', ')}]`).join(' 或 '))
  }
  if (Array.isArray(schema.allOf)) {
    for (const branch of schema.allOf) {
      const nested = conditionalNote(branch)
      if (nested) groups.push(nested)
    }
  }
  return groups.length ? `条件约束：${groups.join('；')}。` : ''
}

/** OpenAPI 值 schema → DSH DSL 值 schema（普通 JS 对象）。 */
function toDsl(node) {
  if (!node || typeof node !== 'object') return { type: 'json' }
  const description = describe(node)

  if (Array.isArray(node.enum) && node.enum.length) {
    const first = node.enum[0]
    const type = typeof first === 'number' ? 'number' : typeof first === 'boolean' ? 'boolean' : 'string'
    return { type, enum: node.enum, ...(description ? { description } : {}) }
  }
  if (typeof node.const !== 'undefined') {
    const type = typeof node.const === 'number' ? 'number' : typeof node.const === 'boolean' ? 'boolean' : 'string'
    return { type, const: node.const, ...(description ? { description } : {}) }
  }

  switch (node.type) {
    case 'string':
    case 'number':
    case 'integer':
    case 'boolean':
      return { type: node.type, ...(description ? { description } : {}) }
    case 'array': {
      const items = node.items ? toDsl(node.items) : { type: 'json' }
      return { type: 'array', items, ...(description ? { description } : {}) }
    }
    case 'object': {
      const properties = node.properties ?? {}
      const keys = Object.keys(properties)
      if (!keys.length && node.additionalProperties === undefined) return { type: 'json' }
      const required = new Set(Array.isArray(node.required) ? node.required : [])
      const mapped = {}
      for (const key of keys) {
        const child = toDsl(properties[key])
        mapped[key] = required.has(key) ? { ...child, required: true } : child
      }
      return {
        type: 'object',
        additionalProperties: node.additionalProperties !== false,
        properties: mapped,
        ...(description ? { description } : {}),
      }
    }
    default:
      return { type: 'json' }
  }
}

/** OpenAPI 请求体 → DSH 隐式参数根（属性级 required）。 */
function toParameterRoot(schema) {
  const properties = schema?.properties ?? {}
  const required = new Set(Array.isArray(schema?.required) ? schema.required : [])
  const root = {}
  for (const key of Object.keys(properties)) {
    const child = toDsl(properties[key])
    root[key] = required.has(key) ? { ...child, required: true } : child
  }
  return root
}

function toDshName(toolName) {
  return toolName.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

const spec = await loadSpec()
const seen = new Map()
const entries = []

for (const [route, operations] of Object.entries(spec.paths ?? {})) {
  const operation = operations.post
  if (!route.startsWith('/tools/') || !operation) continue
  const aeName = route.slice('/tools/'.length)
  const dshName = toDshName(aeName)
  if (seen.has(dshName)) throw new Error(`DSH 工具名冲突：${aeName} 与 ${seen.get(dshName)}`)
  seen.set(dshName, aeName)
  const schema = operation.requestBody?.content?.['application/json']?.schema ?? { type: 'object', properties: {} }
  const description = [operation.description ?? operation.summary ?? aeName, conditionalNote(schema)]
    .filter(Boolean)
    .join('\n\n')
  entries.push({ aeName, dshName, description, parameters: toParameterRoot(schema) })
}

entries.sort((a, b) => a.aeName.localeCompare(b.aeName))

const serialized = entries
  .map(
    (entry) => `  {
    aeName: ${JSON.stringify(entry.aeName)},
    dshName: ${JSON.stringify(entry.dshName)},
    description: ${JSON.stringify(entry.description)},
    parameters: ${JSON.stringify(entry.parameters, null, 2)
      .split('\n')
      .map((line, index) => (index === 0 ? line : `    ${line}`))
      .join('\n')},
  },`,
  )
  .join('\n')

const header = `// 本文件由 scripts/generate-tools.mjs 从 schema/openapi.json 生成，请勿手改。
// 源：${spec.info?.title ?? 'Ancient Echoes Tools API'} ${spec.info?.version ?? ''}
/* eslint-disable */

export interface GeneratedTool {
  /** AE 侧工具 ID，直接作为 POST /api/v1/tools/<id> 的路径段。 */
  readonly aeName: string
  /** DSH 侧工具名（模型可见）。 */
  readonly dshName: string
  /** 模型可见描述（原文 + 条件约束）。 */
  readonly description: string
  readonly parameters: Record<string, unknown>
}

export const AE_API_VERSION = ${JSON.stringify(spec.info?.version ?? '')}

export const AE_TOOLS: readonly GeneratedTool[] = [
`

await writeFile(outPath, `${header}${serialized}\n]\n`)
console.log(`[generate-tools] ${entries.length} tools → ${path.relative(root, outPath)}`)
