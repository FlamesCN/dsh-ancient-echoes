/**
 * 随包分发的精简 Skill 文本：DSH 没有 Claude 式一等 Skill 对象，
 * 把工作流压进一个零入参工具，模型需要时自取，全文由 README 与 AE 仓库承接。
 */
export const GUIDE_TEXT = `# Ancient Echoes 工具使用指南（DSH 精简版）

## 1. 调用顺序
1. 先看当前可用工具名与描述，选最贴近问题的那一个；不要用相近工具"替代"另一个工具的能力。
2. 只传最小必填字段与确实需要的可选项。所有时刻都必须由你显式给出，服务端从不读取当前时间。
3. 同一问题优先一次调用拿全量结构，不要反复试探性调用消耗配额。

## 2. 参数口径
- 出生资料：公历用 birth_datetime（YYYY-MM-DDTHH:mm）或 year/month/day/hour/minute；农历必须用年月日时分字段 + calendar_type=lunar + is_leap_month。
- 时区：要么 timezone_id（IANA），要么 timezone_offset_minutes；不要两者都给，也不要用本地隐式时区。
- 真太阳时、DST、晚子时归属都必须显式声明（use_true_time / apply_dst / split_zi_hour），默认值不保证符合用户口径。
- 记录类工具（compare/analyze/prepare_*）只接受当前用户的 record_id 或 use_profile=true，不接受任意他人资料。

## 3. 结果口径
- 成功响应含 api_version、request_id、calculation{capability, version}、data。转述结果时必须带上 calculation 版本；版本不同不得混用结论。
- 只报可复核的结构化证据（干支、十神、神煞、节气、宜忌等），不做确定性预测，不转述医疗/法律/投资建议。

## 4. 错误码处理
- tool_entitlement_required：账号权益不含该工具。如实告知用户需要对应权益，不要换个工具糊弄过去。
- tool_quota_exceeded：每日 200 次 / 每分钟 30 次用尽。按 Retry-After 等待后重试。
- tool_scope_required：API Key 缺 tools:read 或 tools:invoke scope，需要在 AE 开发者设置重新签发。
- unauthorized：API Key 缺失或无效；提示用户设置 ANCIENT_ECHOES_TOKEN 或插件 config.apiKey。
- invalid_argument / tool_invocation_failed：入参不符合契约，按错误信息修正字段后再试，不要把它当服务故障。

## 5. 隐私
- 出生资料只进当次 tool 参数，不写入通用日志，不请求用户提供无关身份信息。
- 插件的 API Key 只从 config.apiKey 或环境变量读取，不要在任何输出中回显。
`
