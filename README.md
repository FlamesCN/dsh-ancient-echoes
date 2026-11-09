# dsh-ancient-echoes

Deterministic BaZi / Chinese metaphysics tools for **DeepSeek Harness (dsh)**.

This is a thin, read-only pass-through plugin: every dsh tool calls the hosted
Ancient Echoes Tools API (`POST /api/v1/tools/<tool>`) and returns the same
structured result the AE web app, the REST API and the AE MCP server use. No
calculation is re-implemented locally, and no chart is cached.

- Website / docs: <https://www.ancientechoes.ai/developers>
- MCP alternative: `https://www.ancientechoes.ai/api/v1/mcp` (Streamable HTTP)
- Skill / agent plugin repo: <https://github.com/FlamesCN/ancient-echoes-mcp>

## Install

```sh
dsh plugin --profile web add dsh-ancient-echoes
dsh --profile web --dump-config | grep -A2 dsh-ancient-echoes
```

From a checkout:

```sh
dsh plugin --profile web add ./path/to/dsh-ancient-echoes
```

Then give the plugin an API key (Web API Key, `sk-…`, from
<https://www.ancientechoes.ai/user/lingxi/devices>):

```sh
export ANCIENT_ECHOES_TOKEN=sk-...
```

or pin it in the profile's own `~/.dsh/profiles/<name>/cordis.patch.yml`:

```yaml
- id: dsh-ancient-echoes
  name: dsh-ancient-echoes
  config:
    apiKey: sk-...
```

A user-level `$DSH_HOME/cordis.patch.yml` works the same way for every profile.

## Configuration

| Key | Default | Meaning |
|---|---|---|
| `apiKey` | `''` → `$ANCIENT_ECHOES_TOKEN` | Bearer Web API Key. Never baked into the package. |
| `baseUrl` | `https://www.ancientechoes.ai` | Site root; point at a local backend for development. |
| `tools` | `core` | `core`, `all` (all 38 registry tools), or an explicit array of AE/dsh tool names. |
| `toolPrefix` | `''` | Prefix every registered tool name, e.g. `ae_`. |
| `timeoutMs` | `45000` | Per-call deadline; forwards cancellation from the harness. |
| `maxResultChars` | `60000` | Model-facing result cap; the canonical value is kept intact. |

The plugin adds one extra tool, `<prefix>ancient_echoes_guide`, that returns the
condensed usage guide (field conventions, error codes, privacy bounds).

## Tools

`tools: core` registers:

| dsh tool | AE tool |
|---|---|
| `bazi_calculate_chart` | `bazi.calculate_chart` |
| `bazi_compare_charts` | `bazi.compare_charts` |
| `bazi_analyze_wealth` | `bazi.analyze_wealth` |
| `ziwei_calculate_chart` | `ziwei.calculate_chart` |
| `lingxi_rag_search` | `lingxi.rag_search` |
| `lingxi_rag_query` | `lingxi.rag_query` |
| `almanac_get_day` | `almanac.get_day` |
| `election_find_good_days` | `election.find_good_days` |
| `divination_preview_liuyao` | `divination.preview_liuyao` |
| `divination_preview_meihua` | `divination.preview_meihua` |

`tools: all` registers every tool the AE registry exposes (BaZi, Ziwei, Qimen,
Qizheng, Vedic, Western astrology, 13 divination methods, election, almanac,
RAG). Tool names and parameter schemas are generated from the AE OpenAPI
document (`schema/openapi.json` snapshot, `AE Tools API 1.3.0`).

Every successful result carries `api_version`, `request_id`,
`calculation { capability, version }` and `data`. Quote the calculation version
when you relay a result; different versions must not be mixed.

## Errors

Errors keep the AE machine-readable code and add an actionable hint:

| Code | Meaning |
|---|---|
| `tool_entitlement_required` | The account's plan does not include this tool. Tell the user; do not swap in another tool. |
| `tool_quota_exceeded` | 200 calls/day, 30 calls/minute. Honour `Retry-After`. |
| `tool_scope_required` | The key lacks `tools:read` / `tools:invoke`; re-issue it in AE developer settings. |
| `unauthorized` | Missing or invalid key. |
| `invalid_argument`, `tool_invocation_failed` | Fix the arguments; not a service outage. |

## Scope and safety

- Read-only: the plugin registers tools only. It never writes files, runs
  shells, or reaches the network except `baseUrl`.
- The API key is read from config or the environment and never echoed into tool
  output. Birth data travels only as the arguments of one call.
- Results are reference material: structured evidence plus calculation
  versions. No deterministic predictions, no medical / legal / investment
  advice.
- dsh is pre-1.0 and will break compatibility; `engines.dsh` is pinned to
  `<0.3.0` and every release should be validated against a concrete dsh
  version.

## Development

```sh
npm install
npm run build
npm test                     # mock AE server: registration, pass-through, errors
npm run generate             # regenerate src/tools.generated.ts from the snapshot
npm run refresh-schema       # refetch the snapshot from production, then generate
```

`dsh.bundle.patch` points at `cordis.patch.yml`, which inserts one row with
`id` equal to the plugin's exported `name` (`dsh-ancient-echoes`).

Local harness check:

```sh
dsh --profile dev --dump-config | grep -A2 dsh-ancient-echoes
ANCIENT_ECHOES_TOKEN=sk-... dsh --profile dev
```

## License

MIT
