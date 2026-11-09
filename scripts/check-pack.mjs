#!/usr/bin/env node
// 发布前守卫：确认 tarball 只含编译产物与文案，不含源码、测试、schema 快照或任何密钥。
//
// 用法：node scripts/check-pack.mjs

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const ALLOWED = [/^lib\/.+\.js(\.map)?$/, /^lib\/.+\.d\.ts$/, /^LICENSE$/, /^README\.md$/, /^cordis\.patch\.yml$/, /^package\.json$/]
const FORBIDDEN = [/^src\//, /^test\//, /^scripts\//, /^schema\//, /(^|\/)\.env/, /\.tgz$/, /credentials/i]
const SECRET_PATTERNS = [
  [/sk-[A-Za-z0-9]{16,}/, '疑似 API Key（sk-…）'],
  [/ghp_[A-Za-z0-9]{30,}/, '疑似 GitHub token'],
  [/AKIA[0-9A-Z]{16}/, '疑似 AWS key'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY/, '私钥块'],
  [/\/Users\/[A-Za-z0-9._-]+\//, '本机绝对路径'],
]

// npm 11 输出 `[{…}]`，npm 12 输出 `{ "<name>": {…} }`；prepare 的输出只可能出现在 JSON 之前。
const raw = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: root, encoding: 'utf8' })

/** 从混合输出里截出第一个完整 JSON 值（字符串感知的括号配对）。 */
function extractJson(text) {
  const start = text.search(/[[{]/)
  if (start < 0) throw new Error('npm pack 没有输出 JSON')
  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < text.length; i += 1) {
    const char = text[i]
    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }
    if (char === '"') inString = true
    else if (char === '[' || char === '{') depth += 1
    else if (char === ']' || char === '}') {
      depth -= 1
      if (depth === 0) return JSON.parse(text.slice(start, i + 1))
    }
  }
  throw new Error('npm pack 的 JSON 不完整')
}

const parsed = extractJson(raw)
const { files } = Array.isArray(parsed) ? parsed[0] : Object.values(parsed)[0]
const problems = []

for (const file of files) {
  const filePath = file.path
  if (!ALLOWED.some((pattern) => pattern.test(filePath))) problems.push(`未列入白名单：${filePath}`)
  if (FORBIDDEN.some((pattern) => pattern.test(filePath))) problems.push(`禁止发布：${filePath}`)
  if (!/\.(js|map|ts|json|md|yml)$/.test(filePath)) continue
  const text = readFileSync(path.join(root, filePath), 'utf8')
  for (const [pattern, label] of SECRET_PATTERNS) {
    if (pattern.test(text)) problems.push(`${filePath} 命中${label}`)
  }
}

if (problems.length) {
  console.error('[check-pack] 发布内容不合格：')
  for (const problem of problems) console.error(` - ${problem}`)
  process.exit(1)
}
console.log(`[check-pack] ${files.length} 个文件全部符合发布白名单，未发现密钥或源码泄漏`)
