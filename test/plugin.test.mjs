import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { after, before, test } from 'node:test'
import { apply, name as pluginName, Config } from '../lib/index.js'
import { AE_TOOLS } from '../lib/tools.generated.js'

/** 起一个最小 AE Tools API 假服务，记录收到的请求。 */
const requests = []
let responder = () => ({ status: 200, body: {} })
let server
let baseUrl

before(async () => {
  server = createServer((req, res) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      requests.push({ method: req.method, url: req.url, headers: req.headers, body: raw })
      const { status, body } = responder(req)
      res.writeHead(status, { 'content-type': 'application/json' })
      res.end(JSON.stringify(body))
    })
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  await new Promise((resolve) => server.close(resolve))
})

/**
 * 启动插件。`credentialStore` 模拟 dsh 凭据服务（ctx.get('credentials')）。
 * 传 `null` 表示组合里没有该服务。
 */
function boot(overrides = {}, credentialStore = null) {
  const registered = new Map()
  const ctx = {
    tools: { register: (definition) => registered.set(definition.name, definition) },
    get: (serviceName) => (serviceName === 'credentials' ? credentialStore ?? undefined : undefined),
  }
  apply(ctx, { ...Config(), apiKey: 'sk-test', baseUrl, tools: ['almanac.get_day'], ...overrides })
  return registered
}

const exec = () => ({ signal: new AbortController().signal })

/** 按编译后的 JSON Schema 造最小合法入参：只为通过 defineTool 的入参校验。 */
function minimalArgs(schema) {
  const value = (node) => {
    if (Array.isArray(node.enum) && node.enum.length) return node.enum[0]
    if (typeof node.const !== 'undefined') return node.const
    if (node.type === 'string') return 'x'
    if (node.type === 'integer' || node.type === 'number') return 1
    if (node.type === 'boolean') return true
    if (node.type === 'array') return []
    if (node.type === 'object') return minimalArgs(node)
    return null
  }
  const properties = schema.properties ?? {}
  const required = new Set(Array.isArray(schema.required) ? schema.required : [])
  return Object.fromEntries(
    Object.entries(properties)
      .filter(([key]) => required.has(key))
      .map(([key, node]) => [key, value(node)]),
  )
}

test('默认注册核心集并始终带使用指南', () => {
  const tools = boot({ tools: 'core' })
  assert.equal(pluginName, 'dsh-ancient-echoes')
  assert.ok(tools.size >= 10)
  assert.ok(tools.has('bazi_calculate_chart'))
  assert.ok(tools.has('ancient_echoes_guide'))
})

test("tools: 'all' 注册 registry 全量工具", () => {
  const tools = boot({ tools: 'all' })
  assert.equal(tools.size, 39) // 38 个 AE 工具 + 使用指南
})

test('工具名带前缀时同步生效', () => {
  const tools = boot({ tools: ['bazi.calculate_chart'], toolPrefix: 'ae_' })
  assert.deepEqual([...tools.keys()].sort(), ['ae_ancient_echoes_guide', 'ae_bazi_calculate_chart'])
})

test('未知工具名在加载期失败，不静默漏注册', () => {
  assert.throws(() => boot({ tools: ['bazi.nope'] }), /未知工具 "bazi\.nope"/)
})

test('execute 透传参数、鉴权头与 AE 路径，并保留计算版本', async () => {
  requests.length = 0
  responder = () => ({
    status: 200,
    body: {
      success: true,
      api_version: '1.3.0',
      request_id: 'req_1',
      calculation: { capability: 'almanac.day', version: 'v3.2' },
      data: { favorable: ['开市'] },
    },
  })
  const tool = boot().get('almanac_get_day')
  const value = await tool.execute({ date: '2026-11-09' }, exec())

  assert.deepEqual(value, {
    api_version: '1.3.0',
    request_id: 'req_1',
    calculation: { capability: 'almanac.day', version: 'v3.2' },
    data: { favorable: ['开市'] },
  })
  assert.equal(requests.length, 1)
  assert.equal(requests[0].url, '/api/v1/tools/almanac.get_day')
  assert.equal(requests[0].method, 'POST')
  assert.equal(requests[0].headers.authorization, 'Bearer sk-test')
  assert.deepEqual(JSON.parse(requests[0].body), { date: '2026-11-09' })

  const [block] = tool.output.render({ date: '2026-11-09' }, value)
  assert.match(block.text, /tool=almanac\.get_day/)
  assert.match(block.text, /api_version=1\.3\.0/)
  assert.match(block.text, /calculation=almanac\.day@v3\.2/)
  assert.match(block.text, /开市/)
})

test('结果超长时截断并标注原始长度', async () => {
  responder = () => ({
    status: 200,
    body: {
      success: true,
      api_version: '1.3.0',
      request_id: 'req_2',
      calculation: {},
      data: { note: 'x'.repeat(500) },
    },
  })
  const tool = boot({ maxResultChars: 100 }).get('almanac_get_day')
  const value = await tool.execute({ date: '2026-11-09' }, exec())
  const [block] = tool.output.render({}, value)
  assert.match(block.text, /结果已截断：共 \d+ 字符/)
})

test('权益类错误保留错误码与处理建议', async () => {
  responder = () => ({
    status: 403,
    body: {
      success: false,
      code: 'tool_entitlement_required',
      message: '当前会员等级不包含该工具',
      api_version: '1.3.0',
      request_id: 'req_3',
      docs_url: 'https://www.ancientechoes.ai/developers',
    },
  })
  const tool = boot().get('almanac_get_day')
  await assert.rejects(tool.execute({ date: '2026-11-09' }, exec()), (error) => {
    assert.equal(error.code, 'tool_entitlement_required')
    assert.equal(error.status, 403)
    assert.match(error.message, /当前会员等级不包含该工具/)
    assert.match(error.message, /如实告知用户/)
    return true
  })
})

test('配额错误提示重试而不是换工具', async () => {
  responder = () => ({
    status: 429,
    body: { success: false, code: 'tool_quota_exceeded', message: '每分钟 30 次已用尽', request_id: 'req_4' },
  })
  const tool = boot().get('almanac_get_day')
  await assert.rejects(tool.execute({ date: '2026-11-09' }, exec()), /Retry-After/)
})

test('缺少 API Key 时给出可执行的配置提示', async () => {
  delete process.env.ANCIENT_ECHOES_TOKEN
  const tool = boot({ apiKey: '' }).get('almanac_get_day')
  await assert.rejects(tool.execute({ date: '2026-11-09' }, exec()), /ANCIENT_ECHOES_TOKEN/)
})

test('环境变量可作为 API Key 回退', async () => {
  requests.length = 0
  process.env.ANCIENT_ECHOES_TOKEN = 'sk-env'
  responder = () => ({
    status: 200,
    body: { success: true, api_version: '1.3.0', request_id: 'r', calculation: {}, data: {} },
  })
  const tool = boot({ apiKey: '' }).get('almanac_get_day')
  await tool.execute({ date: '2026-11-09' }, exec())
  assert.equal(requests[0].headers.authorization, 'Bearer sk-env')
  delete process.env.ANCIENT_ECHOES_TOKEN
})

test('网络不可达时归一为 network_error', async () => {
  const tool = boot({ baseUrl: 'http://127.0.0.1:1' }).get('almanac_get_day')
  await assert.rejects(tool.execute({ date: '2026-11-09' }, exec()), (error) => {
    assert.equal(error.code, 'network_error')
    return true
  })
})

test('凭据库中的 key 生效，且轮换后无需重启即可用新值', async () => {
  requests.length = 0
  delete process.env.ANCIENT_ECHOES_TOKEN
  const store = { value: 'sk-store-1', resolve: async () => ({ value: store.value, source: 'store' }) }
  responder = () => ({
    status: 200,
    body: { success: true, api_version: '1.3.0', request_id: 'r', calculation: {}, data: {} },
  })
  const tool = boot({ apiKey: '' }, store).get('almanac_get_day')

  await tool.execute({ date: '2026-11-09' }, exec())
  assert.equal(requests[0].headers.authorization, 'Bearer sk-store-1')

  store.value = 'sk-store-2'
  await tool.execute({ date: '2026-11-09' }, exec())
  assert.equal(requests[1].headers.authorization, 'Bearer sk-store-2')
})

test('凭据引用名可配置，非法引用名在加载期失败', async () => {
  requests.length = 0
  delete process.env.AE_TEST_TOKEN
  const store = { resolve: async (ref) => (ref === 'AE_TEST_TOKEN' ? { value: 'sk-ref' } : undefined) }
  responder = () => ({
    status: 200,
    body: { success: true, api_version: '1.3.0', request_id: 'r', calculation: {}, data: {} },
  })
  const tool = boot({ apiKey: '', apiKeyRef: 'AE_TEST_TOKEN' }, store).get('almanac_get_day')
  await tool.execute({ date: '2026-11-09' }, exec())
  assert.equal(requests[0].headers.authorization, 'Bearer sk-ref')

  assert.throws(() => boot({ apiKeyRef: 'bad-ref' }, store), /POSIX 环境变量名/)
})

test('没有任何凭据时，所有远端工具都拒绝且不发请求', async () => {
  requests.length = 0
  delete process.env.ANCIENT_ECHOES_TOKEN
  const tools = boot({ tools: 'all', apiKey: '' }, { resolve: async () => undefined })
  const remote = AE_TOOLS.map((tool) => tools.get(tool.dshName))
  assert.equal(remote.length, 38)
  for (const tool of remote) {
    assert.ok(tool, '每个 AE 工具都应注册')
    await assert.rejects(
      tool.execute(minimalArgs(tool.parameters ?? {}), exec()),
      (error) => {
        assert.match(error.message, /Ancient Echoes 未鉴权/)
        assert.match(error.message, /ANCIENT_ECHOES_TOKEN/)
        return true
      },
    )
  }
  assert.equal(requests.length, 0, '未鉴权时不得发出任何远端请求')
})

test('使用指南是本地工具，不需要凭据也不发请求', async () => {
  requests.length = 0
  delete process.env.ANCIENT_ECHOES_TOKEN
  const guide = boot({ apiKey: '' }, { resolve: async () => undefined }).get('ancient_echoes_guide')
  const text = await guide.execute({}, exec())
  assert.match(text, /Ancient Echoes 工具使用指南/)
  assert.equal(requests.length, 0)
})
