// 本文件由 scripts/generate-tools.mjs 从 schema/openapi.json 生成，请勿手改。
// 源：Ancient Echoes Tools API 1.3.0
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

export const AE_API_VERSION = "1.3.0"

export const AE_TOOLS: readonly GeneratedTool[] = [
  {
    aeName: "almanac.convert_lunar_date",
    dshName: "almanac_convert_lunar_date",
    description: "将明确的农历年月日转换为公历日期；校验年份范围、闰月是否存在、当月天数与转换回显一致性。",
    parameters: {
      "year": {
        "type": "integer",
        "description": "range: 1..9999",
        "required": true
      },
      "month": {
        "type": "integer",
        "description": "农历月使用正数 1-12；是否闰月由 is_leap_month 单独声明。；range: 1..12",
        "required": true
      },
      "day": {
        "type": "integer",
        "description": "range: 1..30",
        "required": true
      },
      "is_leap_month": {
        "type": "boolean"
      }
    },
  },
  {
    aeName: "almanac.get_day",
    dshName: "almanac_get_day",
    description: "按明确的 YYYY-MM-DD 北京时间民用日期查询黄历、节气与宜忌日级证据；不接受时分或时区，不返回用户提醒，不合成整体吉凶。",
    parameters: {
      "date": {
        "type": "string",
        "description": "排除 1582-10-05 至 1582-10-14；0001-01-01 到 9999-12-31 的北京时间民用日期；只接受 YYYY-MM-DD，不得附带时分、时区或 UTC offset。；pattern: ^[0-9]{4}-[0-9]{2}-[0-9]{2}$",
        "required": true
      }
    },
  },
  {
    aeName: "almanac.get_solar_terms",
    dshName: "almanac_get_solar_terms",
    description: "查询明确年份的二十四节气北京时间精确到秒时刻；时刻来自 lunar-go 寿星天文历核心表，缺失时返回错误而不是伪造正午。",
    parameters: {
      "year": {
        "type": "integer",
        "description": "明确公历年份；服务端不会用当前年份补齐。；range: 1..9999",
        "required": true
      }
    },
  },
  {
    aeName: "astrology.calculate_chart",
    dshName: "astrology_calculate_chart",
    description: "按完整出生历法、民用时刻、时区、坐标、宫制与行运时刻计算 1800-2100 年低精度西方占星本命盘；行运行星叠加本命宫位，可选独立问事时空起盘预览、合盘、显式地点太阳返照及带独立时区坐标的非传统候选相对排序。\n\n条件约束：条件约束：[birth_datetime] 或 [birth_year, birth_month, birth_day, birth_hour, birth_minute]。；条件约束：[timezone_id] 或 [birth_timezone] 或 [timezone_offset_minutes]。。",
    parameters: {
      "name": {
        "type": "string"
      },
      "birth_datetime": {
        "type": "string",
        "description": "公历出生日期、小时和分钟；农历必须改用完整年月日时分字段；pattern: ^\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}(:\\d{2})?([+-]\\d{2}:\\d{2}|Z)?$"
      },
      "birth_year": {
        "type": "integer",
        "description": "range: 1800..2100"
      },
      "birth_month": {
        "type": "integer",
        "description": "range: 1..12"
      },
      "birth_day": {
        "type": "integer",
        "description": "range: 1..31"
      },
      "birth_hour": {
        "type": "integer",
        "description": "range: 0..23"
      },
      "birth_minute": {
        "type": "integer",
        "description": "range: 0..59"
      },
      "timezone_id": {
        "type": "string",
        "description": "minLength: 1"
      },
      "birth_timezone": {
        "type": "string",
        "description": "minLength: 1"
      },
      "timezone_offset_minutes": {
        "type": "integer",
        "description": "range: -840..840"
      },
      "birth_place": {
        "type": "string"
      },
      "birth_longitude": {
        "type": "number",
        "description": "range: -180..180",
        "required": true
      },
      "birth_latitude": {
        "type": "number",
        "description": "range: -90..90",
        "required": true
      },
      "calendar_type": {
        "type": "string",
        "enum": [
          "solar",
          "lunar"
        ],
        "required": true
      },
      "is_leap_month": {
        "type": "boolean"
      },
      "house_system": {
        "type": "string",
        "enum": [
          "equal",
          "whole_sign"
        ],
        "required": true
      },
      "locale": {
        "type": "string"
      },
      "question": {
        "type": "string",
        "description": "仅在明确请求卜卦起盘预览时提供；当前不含完整传统裁决"
      },
      "focus_area": {
        "type": "string"
      },
      "transit_datetime": {
        "type": "string",
        "description": "显式行运瞬间；行运行星叠加到本命宫位，不使用服务器当前时间或出生地重建行运宫位；pattern: ^\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}(:\\d{2})?([+-]\\d{2}:\\d{2}|Z)?$",
        "required": true
      },
      "horary_datetime": {
        "type": "string",
        "description": "pattern: ^\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}(:\\d{2})?([+-]\\d{2}:\\d{2}|Z)?$"
      },
      "horary_timezone_id": {
        "type": "string",
        "description": "minLength: 1"
      },
      "horary_timezone_offset_minutes": {
        "type": "integer",
        "description": "range: -840..840"
      },
      "horary_place": {
        "type": "string"
      },
      "horary_longitude": {
        "type": "number",
        "description": "range: -180..180"
      },
      "horary_latitude": {
        "type": "number",
        "description": "range: -90..90"
      },
      "solar_return_year": {
        "type": "integer",
        "description": "公历生日周年年份，实际返照 UTC 可跨公历年；range: 1800..2100"
      },
      "solar_return_place": {
        "type": "string"
      },
      "solar_return_longitude": {
        "type": "number",
        "description": "range: -180..180"
      },
      "solar_return_latitude": {
        "type": "number",
        "description": "range: -90..90"
      },
      "partner": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string"
          },
          "birth_datetime": {
            "type": "string",
            "description": "pattern: ^\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}(:\\d{2})?([+-]\\d{2}:\\d{2}|Z)?$"
          },
          "birth_year": {
            "type": "integer",
            "description": "range: 1800..2100"
          },
          "birth_month": {
            "type": "integer",
            "description": "range: 1..12"
          },
          "birth_day": {
            "type": "integer",
            "description": "range: 1..31"
          },
          "birth_hour": {
            "type": "integer",
            "description": "range: 0..23"
          },
          "birth_minute": {
            "type": "integer",
            "description": "range: 0..59"
          },
          "timezone_id": {
            "type": "string",
            "description": "minLength: 1"
          },
          "birth_timezone": {
            "type": "string",
            "description": "minLength: 1"
          },
          "timezone_offset_minutes": {
            "type": "integer",
            "description": "range: -840..840"
          },
          "birth_place": {
            "type": "string"
          },
          "birth_longitude": {
            "type": "number",
            "description": "range: -180..180",
            "required": true
          },
          "birth_latitude": {
            "type": "number",
            "description": "range: -90..90",
            "required": true
          },
          "calendar_type": {
            "type": "string",
            "enum": [
              "solar",
              "lunar"
            ],
            "required": true
          },
          "is_leap_month": {
            "type": "boolean"
          }
        }
      },
      "electional_candidates": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "label": {
              "type": "string"
            },
            "datetime": {
              "type": "string",
              "description": "pattern: ^\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}(:\\d{2})?([+-]\\d{2}:\\d{2}|Z)?$",
              "required": true
            },
            "timezone_id": {
              "type": "string",
              "description": "minLength: 1"
            },
            "timezone_offset_minutes": {
              "type": "integer",
              "description": "range: -840..840"
            },
            "longitude": {
              "type": "number",
              "description": "range: -180..180",
              "required": true
            },
            "latitude": {
              "type": "number",
              "description": "range: -90..90",
              "required": true
            }
          }
        },
        "description": "maxItems: 32"
      }
    },
  },
  {
    aeName: "bazi.analyze_entrepreneurship",
    dshName: "bazi_analyze_entrepreneurship",
    description: "把当前用户命盘的事业财运结构证据、显式目标年份和用户填写的职业/资源/约束分层整理为创业决策辅助；返回无评分、无排名的起步结构条件与仅由用户文本命中的业务候选，不根据命盘裁决公司形态、赛道、城市或成功率。\n\n条件约束：[record_id] 或 [use_profile]。",
    parameters: {
      "record_id": {
        "type": "integer",
        "description": "range: 1..+inf"
      },
      "use_profile": {
        "type": "boolean"
      },
      "target_year": {
        "type": "integer",
        "description": "range: 1..9999",
        "required": true
      },
      "context": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "current_profession": {
            "type": "string"
          },
          "work_details": {
            "type": "string"
          },
          "past_experience": {
            "type": "string"
          },
          "strengths": {
            "type": "string"
          },
          "city": {
            "type": "string"
          },
          "daily_patterns": {
            "type": "string"
          },
          "available_resources": {
            "type": "string"
          },
          "risk_preference": {
            "type": "string",
            "enum": [
              "稳健",
              "平衡",
              "进取",
              "conservative",
              "aggressive"
            ]
          },
          "preferred_setup": {
            "type": "string"
          },
          "target_timeline": {
            "type": "string"
          },
          "additional_context": {
            "type": "string"
          }
        },
        "required": true
      }
    },
  },
  {
    aeName: "bazi.analyze_wealth",
    dshName: "bazi_analyze_wealth",
    description: "整理当前用户命盘的财星透藏、十神同现、格局与日主强弱上下文，并在调用方显式年份窗口内列出大运流年财星触发和对原局财星所在干支的直接关系；无评分、无排名，不推断职业、风险偏好、投资或地域。\n\n条件约束：[record_id] 或 [use_profile]。",
    parameters: {
      "record_id": {
        "type": "integer",
        "description": "range: 1..+inf"
      },
      "use_profile": {
        "type": "boolean"
      },
      "start_year": {
        "type": "integer",
        "description": "range: 1..9999",
        "required": true
      },
      "end_year": {
        "type": "integer",
        "description": "range: 1..9999",
        "required": true
      }
    },
  },
  {
    aeName: "bazi.calculate_chart",
    dshName: "bazi_calculate_chart",
    description: "按完整显式民用时刻或直接四柱计算八字主盘；current_snapshot 也必须由调用方传入快照时刻，绝不使用服务器当前时间。出生模式返回精确立春/十二节边界、晚子时口径、DST/真太阳时留痕和分钟级大运档案；直接四柱不反推历法日期或大运。\n\n条件约束：[year, month, day, hour, minute, calendar_type, is_leap_month, split_zi_hour, use_true_time, apply_dst] 或 [bazi]。",
    parameters: {
      "input_mode": {
        "type": "string",
        "enum": [
          "birth",
          "bazi"
        ],
        "required": true
      },
      "bazi": {
        "type": "string",
        "description": "minLength: 1"
      },
      "year": {
        "type": "integer",
        "description": "range: 1..9999"
      },
      "month": {
        "type": "integer",
        "description": "range: 1..12"
      },
      "day": {
        "type": "integer",
        "description": "range: 1..31"
      },
      "hour": {
        "type": "integer",
        "description": "range: 0..23"
      },
      "minute": {
        "type": "integer",
        "description": "range: 0..59"
      },
      "is_male": {
        "type": "boolean",
        "required": true
      },
      "is_leap_month": {
        "type": "boolean"
      },
      "calendar_type": {
        "type": "string",
        "enum": [
          "solar",
          "lunar"
        ]
      },
      "cast_time_source": {
        "type": "string",
        "enum": [
          "birth",
          "event",
          "current_snapshot",
          "direct_pillars"
        ],
        "description": "current_snapshot 仅标记调用方已捕获的显式民用时刻；服务端不会读取当前时间",
        "required": true
      },
      "timezone_id": {
        "type": "string",
        "description": "minLength: 1"
      },
      "timezone_offset_minutes": {
        "type": "integer",
        "description": "range: -840..840"
      },
      "birth_place_type": {
        "type": "string",
        "enum": [
          "china",
          "overseas"
        ]
      },
      "birth_country": {
        "type": "string"
      },
      "city_name": {
        "type": "string"
      },
      "longitude": {
        "type": "number",
        "description": "range: -180..180"
      },
      "latitude": {
        "type": "number",
        "description": "range: -90..90"
      },
      "split_zi_hour": {
        "type": "boolean"
      },
      "use_true_time": {
        "type": "boolean"
      },
      "apply_dst": {
        "type": "boolean",
        "description": "按 IANA 历史规则把夏令钟表时手工回拨为标准时；请求与实际应用分别留痕"
      }
    },
  },
  {
    aeName: "bazi.calculate_chuangong",
    dshName: "bazi_calculate_chuangong",
    description: "按完整显式出生民用时刻和显式起始年份计算串宫十二神落位，逐年返回四柱、胎元、命宫、身宫与当步大运的干支落位及出生年支直接关系；不生成吉凶分、年份排名、医疗法律判断或事件预测。\n\n条件约束：[timezone_id] 或 [timezone_offset_minutes]。",
    parameters: {
      "year": {
        "type": "integer",
        "description": "range: 1..9999",
        "required": true
      },
      "month": {
        "type": "integer",
        "description": "range: 1..12",
        "required": true
      },
      "day": {
        "type": "integer",
        "description": "range: 1..31",
        "required": true
      },
      "hour": {
        "type": "integer",
        "description": "range: 0..23",
        "required": true
      },
      "minute": {
        "type": "integer",
        "description": "range: 0..59",
        "required": true
      },
      "is_male": {
        "type": "boolean",
        "required": true
      },
      "calendar_type": {
        "type": "string",
        "enum": [
          "solar",
          "lunar"
        ],
        "required": true
      },
      "is_leap_month": {
        "type": "boolean",
        "required": true
      },
      "split_zi_hour": {
        "type": "boolean",
        "required": true
      },
      "use_true_time": {
        "type": "boolean",
        "required": true
      },
      "longitude": {
        "type": "number",
        "description": "range: -180..180"
      },
      "latitude": {
        "type": "number",
        "description": "range: -90..90"
      },
      "city_name": {
        "type": "string"
      },
      "birth_place_type": {
        "type": "string",
        "enum": [
          "china",
          "overseas"
        ]
      },
      "birth_country": {
        "type": "string"
      },
      "timezone_id": {
        "type": "string",
        "description": "minLength: 1"
      },
      "timezone_offset_minutes": {
        "type": "integer",
        "description": "range: -840..840"
      },
      "apply_dst": {
        "type": "boolean",
        "description": "按 IANA 历史规则把夏令钟表时手工回拨为标准时；请求与实际应用分别留痕",
        "required": true
      },
      "current_year": {
        "type": "integer",
        "description": "调用方显式指定的起始公历年份标签；服务端不读取当前年份；range: 1..9999",
        "required": true
      },
      "years_to_calculate": {
        "type": "integer",
        "description": "range: 1..30"
      }
    },
  },
  {
    aeName: "bazi.calculate_luming",
    dshName: "bazi_calculate_luming",
    description: "按完整显式出生民用时刻计算古法禄命年柱三元与纳音生旺落位，返回年干为禄、年支为命、年柱纳音为身，以及四柱、胎元、命宫、身宫的证据；不生成紫微十二人生宫、吉凶计数、总体评级或事件预测。\n\n条件约束：[timezone_id] 或 [timezone_offset_minutes]。",
    parameters: {
      "year": {
        "type": "integer",
        "description": "range: 1..9999",
        "required": true
      },
      "month": {
        "type": "integer",
        "description": "range: 1..12",
        "required": true
      },
      "day": {
        "type": "integer",
        "description": "range: 1..31",
        "required": true
      },
      "hour": {
        "type": "integer",
        "description": "range: 0..23",
        "required": true
      },
      "minute": {
        "type": "integer",
        "description": "range: 0..59",
        "required": true
      },
      "is_male": {
        "type": "boolean",
        "required": true
      },
      "calendar_type": {
        "type": "string",
        "enum": [
          "solar",
          "lunar"
        ],
        "required": true
      },
      "is_leap_month": {
        "type": "boolean",
        "required": true
      },
      "split_zi_hour": {
        "type": "boolean",
        "required": true
      },
      "use_true_time": {
        "type": "boolean",
        "required": true
      },
      "longitude": {
        "type": "number",
        "description": "range: -180..180"
      },
      "latitude": {
        "type": "number",
        "description": "range: -90..90"
      },
      "city_name": {
        "type": "string"
      },
      "birth_place_type": {
        "type": "string",
        "enum": [
          "china",
          "overseas"
        ]
      },
      "birth_country": {
        "type": "string"
      },
      "timezone_id": {
        "type": "string",
        "description": "minLength: 1"
      },
      "timezone_offset_minutes": {
        "type": "integer",
        "description": "range: -840..840"
      },
      "apply_dst": {
        "type": "boolean",
        "description": "按 IANA 历史规则把夏令钟表时手工回拨为标准时；请求与实际应用分别留痕",
        "required": true
      }
    },
  },
  {
    aeName: "bazi.compare_charts",
    dshName: "bazi_compare_charts",
    description: "对当前用户的两张八字记录（或一侧本人资料）执行原局直接结构对照，返回基础排盘留痕、日元/日支、跨盘干支与神煞并列证据；不输出统一合婚分数，不判断合化成立，不叠加双方岁运。\n\n条件约束：条件约束：[left_record_id] 或 [left_use_profile]。；条件约束：[right_record_id] 或 [right_use_profile]。。",
    parameters: {
      "left_record_id": {
        "type": "integer",
        "description": "range: 1..+inf"
      },
      "right_record_id": {
        "type": "integer",
        "description": "range: 1..+inf"
      },
      "left_use_profile": {
        "type": "boolean"
      },
      "right_use_profile": {
        "type": "boolean"
      }
    },
  },
  {
    aeName: "bazi.compare_group_charts",
    dshName: "bazi_compare_group_charts",
    description: "对当前用户 2 至 8 位成员的八字记录（最多一份本人资料）执行全部无序成员对的原局直接结构对照，返回成员主盘留痕以及日元、日支、跨盘干支和神煞并列证据；不输出多人分数、排名、角色分配、支持/压力链或未显式计算的岁运时间点。",
    parameters: {
      "scene_type": {
        "type": "string",
        "enum": [
          "family",
          "team",
          "custom"
        ]
      },
      "scenario_label": {
        "type": "string"
      },
      "members": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "record_id": {
              "type": "integer",
              "description": "range: 1..+inf"
            },
            "use_profile": {
              "type": "boolean"
            },
            "role_label": {
              "type": "string"
            },
            "alias": {
              "type": "string"
            }
          }
        },
        "description": "minItems: 2；maxItems: 8",
        "required": true
      }
    },
  },
  {
    aeName: "bazi.lookup_zodiac_branch_relations",
    dshName: "bazi_lookup_zodiac_branch_relations",
    description: "把一个手工生肖标签映射为年支，列出六合、六冲、六害、六破与保留方向的三刑，并展示完整三合、三会组三支成员；这不是两人生辰合婚，不输出契合分、婚姻结论或事件预测。",
    parameters: {
      "shengxiao": {
        "type": "string",
        "enum": [
          "鼠",
          "牛",
          "虎",
          "兔",
          "龙",
          "蛇",
          "马",
          "羊",
          "猴",
          "鸡",
          "狗",
          "猪"
        ],
        "description": "手工选择的生肖标签；工具不从标签反推出生年份或生肖年界",
        "required": true
      }
    },
  },
  {
    aeName: "bazi.prepare_family_relations_context",
    dshName: "bazi_prepare_family_relations_context",
    description: "为当前用户自己的八字记录或本人资料准备家庭关系证据上下文：返回四柱宫位、天干与藏干十神、多流派六亲映射及不可用边界；不推断父母强势方、亲属人数或性别、支持/消耗、家庭事实或隐式岁运。\n\n条件约束：[record_id] 或 [use_profile]。",
    parameters: {
      "record_id": {
        "type": "integer",
        "description": "range: 1..+inf"
      },
      "use_profile": {
        "type": "boolean"
      }
    },
  },
  {
    aeName: "bazi.prepare_naming_context",
    dshName: "bazi_prepare_naming_context",
    description: "为当前用户自己的八字记录或本人资料准备可追溯取名上下文：复用主盘格局、喜用、调候并校验显式偏好；不生成姓名，不声明汉字五行、康熙笔画、三才五格、吉凶分或候选排名。\n\n条件约束：[record_id] 或 [use_profile]。",
    parameters: {
      "record_id": {
        "type": "integer",
        "description": "range: 1..+inf"
      },
      "use_profile": {
        "type": "boolean"
      },
      "preferences": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "surname": {
            "type": "string",
            "description": "maxLength: 25"
          },
          "gender": {
            "type": "string",
            "enum": [
              "boy",
              "girl",
              "neutral",
              "unspecified"
            ]
          },
          "preferred_chars": {
            "type": "array",
            "items": {
              "type": "string",
              "description": "minLength: 1；maxLength: 1"
            },
            "description": "maxItems: 32"
          },
          "avoided_chars": {
            "type": "array",
            "items": {
              "type": "string",
              "description": "minLength: 1；maxLength: 1"
            },
            "description": "maxItems: 32"
          },
          "style_keywords": {
            "type": "array",
            "items": {
              "type": "string",
              "description": "maxLength: 32"
            },
            "description": "maxItems: 12"
          },
          "note": {
            "type": "string",
            "description": "maxLength: 1000"
          }
        },
        "required": true
      }
    },
  },
  {
    aeName: "divination.preview_chenggu",
    dshName: "divination_preview_chenggu",
    description: "基于当前用户本人资料或其命盘记录，直接使用原始录入民用出生时刻；晚子时 23:00–23:59 按次一民用日取农历年、月、日，闰月上下半月只折算月重，四项查表相加后按命主性别匹配冻结歌诀；不应用真太阳时或 DST 二次修正，不保存记录。",
    parameters: {
      "question": {
        "type": "string"
      },
      "focus_area": {
        "type": "string"
      },
      "locale": {
        "type": "string",
        "enum": [
          "zh",
          "en"
        ]
      },
      "notes": {
        "type": "string"
      },
      "subject": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "use_profile": {
            "type": "boolean",
            "const": true
          },
          "record_id": {
            "type": "integer",
            "description": "range: 1..+inf"
          }
        },
        "description": "命主来源严格二选一；直接四柱记录不包含可核验民用出生日期，不能用于称骨。",
        "required": true
      }
    },
  },
  {
    aeName: "divination.preview_daliuren",
    dshName: "divination_preview_daliuren",
    description: "按调用方冻结的 1800-2100 年北京时间民用时刻实时起课，或按手工校盘字段计算大六壬天地盘、四课三传、十二天将、旬遁旬空、六亲与旺衰；不读取服务器当前时间，不补造年命、行年、神煞、课体附格或确定事件，不保存记录。",
    parameters: {
      "question": {
        "type": "string",
        "description": "minLength: 1",
        "required": true
      },
      "focus_area": {
        "type": "string"
      },
      "locale": {
        "type": "string",
        "enum": [
          "zh",
          "zh-TW",
          "en",
          "ja",
          "ko"
        ]
      },
      "casting_mode": {
        "type": "string",
        "enum": [
          "datetime",
          "manual"
        ],
        "required": true
      },
      "date_time": {
        "type": "string",
        "description": "datetime 模式必填；调用方冻结的 1800-2100 年北京时间民用时刻，不带时区或 UTC offset，YYYY-MM-DD HH:mm，可选秒；pattern: ^(?:(?:18|19|20)[0-9]{2}|2100)-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])[ T](?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$"
      },
      "month_general": {
        "type": "string",
        "enum": [
          "子",
          "丑",
          "寅",
          "卯",
          "辰",
          "巳",
          "午",
          "未",
          "申",
          "酉",
          "戌",
          "亥"
        ],
        "description": "manual 模式必填"
      },
      "month_branch": {
        "type": "string",
        "enum": [
          "子",
          "丑",
          "寅",
          "卯",
          "辰",
          "巳",
          "午",
          "未",
          "申",
          "酉",
          "戌",
          "亥"
        ],
        "description": "manual 模式可选的实际月建；未提供时不计算旺衰，不从月将推测"
      },
      "day_gan": {
        "type": "string",
        "enum": [
          "甲",
          "乙",
          "丙",
          "丁",
          "戊",
          "己",
          "庚",
          "辛",
          "壬",
          "癸"
        ],
        "description": "manual 模式必填"
      },
      "day_zhi": {
        "type": "string",
        "enum": [
          "子",
          "丑",
          "寅",
          "卯",
          "辰",
          "巳",
          "午",
          "未",
          "申",
          "酉",
          "戌",
          "亥"
        ],
        "description": "manual 模式必填，且须与日干构成有效六十甲子"
      },
      "hour_branch": {
        "type": "string",
        "enum": [
          "子",
          "丑",
          "寅",
          "卯",
          "辰",
          "巳",
          "午",
          "未",
          "申",
          "酉",
          "戌",
          "亥"
        ],
        "description": "manual 模式必填"
      },
      "time_hint": {
        "type": "string"
      },
      "notes": {
        "type": "string"
      },
      "subject": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "use_profile": {
            "type": "boolean",
            "const": true
          },
          "record_id": {
            "type": "integer",
            "description": "range: 1..+inf"
          }
        },
        "description": "可选的命主资料；提供时本人资料和命盘记录严格二选一。"
      }
    },
  },
  {
    aeName: "divination.preview_heluo",
    dshName: "divination_preview_heluo",
    description: "基于当前用户本人资料或其命盘记录，复用八字主盘的历法、时区、DST、真太阳时和晚子时边界，再按天干洛书数、每支成对河图生成数、天地数化卦与精确立春年度五数三元寄宫计算河洛理数先天命卦；直接四柱因不能确定三元年度而拒绝；不展开元堂爻、后天卦或运限，不保存记录。",
    parameters: {
      "question": {
        "type": "string"
      },
      "focus_area": {
        "type": "string"
      },
      "locale": {
        "type": "string",
        "enum": [
          "zh",
          "en"
        ]
      },
      "notes": {
        "type": "string"
      },
      "subject": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "use_profile": {
            "type": "boolean",
            "const": true
          },
          "record_id": {
            "type": "integer",
            "description": "range: 1..+inf"
          }
        },
        "required": true
      }
    },
  },
  {
    aeName: "divination.preview_liuyao",
    dshName: "divination_preview_liuyao",
    description: "按指定模式记录实时起卦时间与六组蓍草三变或 6/7/8/9 爻值，生成京房纳甲六爻卦象、精确节令日月直接关系与解读上下文；不自动选择用神，不保存记录。",
    parameters: {
      "question": {
        "type": "string",
        "required": true
      },
      "focus_area": {
        "type": "string"
      },
      "locale": {
        "type": "string",
        "enum": [
          "zh",
          "zh-TW",
          "en",
          "ja",
          "ko"
        ]
      },
      "casting_mode": {
        "type": "string",
        "enum": [
          "quick_record",
          "digital_altar",
          "three_coin",
          "manual_line_values"
        ],
        "required": true
      },
      "casting_time": {
        "type": "string",
        "description": "输入地民用钟表时间，不带时区偏移；精确节令切月建，晚子时沿用当天日柱，民用午夜换日；不做时区、DST 或真太阳时换算；pattern: ^\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}(:\\d{2})?$",
        "required": true
      },
      "include_subject": {
        "type": "boolean"
      },
      "bazi_mode": {
        "type": "string",
        "enum": [
          "liuyao_only",
          "bazi_joint"
        ]
      },
      "subject": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "use_profile": {
            "type": "boolean",
            "const": true
          },
          "record_id": {
            "type": "integer",
            "description": "range: 1..+inf"
          }
        },
        "description": "可选的命主资料；提供时本人资料和命盘记录严格二选一。"
      },
      "notes": {
        "type": "string"
      },
      "lines": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "position": {
              "type": "integer",
              "description": "range: 1..6",
              "required": true
            },
            "changes": {
              "type": "array",
              "items": {
                "type": "integer"
              },
              "description": "minItems: 3；maxItems: 3"
            },
            "value": {
              "type": "integer",
              "description": "range: 6..9"
            }
          }
        },
        "description": "minItems: 6；maxItems: 6",
        "required": true
      }
    },
  },
  {
    aeName: "divination.preview_meihua",
    dshName: "divination_preview_meihua",
    description: "按《梅花易数》卷一先天取数法生成本卦、互卦、变卦和体用；纯乾纯坤改从变卦取互。时间模式按输入地民用钟表字段换算农历，23:00 子时不提前换日，闰月沿用同名月数，不做时区、DST 或真太阳时换算，不保存记录。",
    parameters: {
      "question": {
        "type": "string",
        "required": true
      },
      "focus_area": {
        "type": "string"
      },
      "locale": {
        "type": "string",
        "enum": [
          "zh",
          "zh-TW",
          "en",
          "ja",
          "ko"
        ]
      },
      "casting_method": {
        "type": "string",
        "enum": [
          "numbers",
          "datetime"
        ],
        "required": true
      },
      "casting_time": {
        "type": "string",
        "description": "输入地民用钟表时间，不带时区偏移；23:00 子时不提前换日，闰月沿用同名月数，不做 UTC、DST 或真太阳时换算；pattern: ^\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}(:\\d{2})?$"
      },
      "upper_number": {
        "type": "integer",
        "description": "range: 1..+inf"
      },
      "lower_number": {
        "type": "integer",
        "description": "range: 1..+inf"
      },
      "moving_line": {
        "type": "integer",
        "description": "range: 1..+inf"
      },
      "time_hint": {
        "type": "string"
      },
      "notes": {
        "type": "string"
      },
      "subject": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "use_profile": {
            "type": "boolean",
            "const": true
          },
          "record_id": {
            "type": "integer",
            "description": "range: 1..+inf"
          }
        },
        "description": "可选的命主资料；提供时本人资料和命盘记录严格二选一。"
      }
    },
  },
  {
    aeName: "divination.preview_sanshishu",
    dshName: "divination_preview_sanshishu",
    description: "基于当前用户本人资料或其命盘记录，直接使用原始录入民用出生时刻，以精确立春年度尾数 × 农历月查询常见 10×12 财禄标签表；立春前按上一年度，闰月沿用同名月列，农历日期和时辰不参与索引；直接四柱必须拒绝，不补造前世、来世或现实财富结论，不保存记录。",
    parameters: {
      "question": {
        "type": "string"
      },
      "focus_area": {
        "type": "string"
      },
      "locale": {
        "type": "string",
        "enum": [
          "zh",
          "en"
        ]
      },
      "notes": {
        "type": "string"
      },
      "subject": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "use_profile": {
            "type": "boolean",
            "const": true
          },
          "record_id": {
            "type": "integer",
            "description": "range: 1..+inf"
          }
        },
        "description": "命主来源严格二选一；直接四柱记录不包含可核验民用出生日期，不能用于三世书财禄表。",
        "required": true
      }
    },
  },
  {
    aeName: "divination.preview_shaozi",
    dshName: "divination_preview_shaozi",
    description: "基于当前用户本人资料或其命盘记录，复用八字主盘与河洛 v4 的历法、时区、DST、真太阳时、晚子时和精确立春三元边界；固定按 chart_trace.input.corrected_local_time 换算农历月日，再用产品冻结的现代教学表计算人命数。该表尚无单一可核验古籍底本，不得称为邵子原典唯一规则；直接四柱因不能确定三元年度而拒绝；不生成流年声序、六亲、阶段运势或 6144 条文，不保存记录。",
    parameters: {
      "question": {
        "type": "string"
      },
      "focus_area": {
        "type": "string"
      },
      "locale": {
        "type": "string",
        "enum": [
          "zh",
          "zh-TW",
          "en",
          "ja",
          "ko"
        ]
      },
      "notes": {
        "type": "string"
      },
      "subject": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "use_profile": {
            "type": "boolean",
            "const": true
          },
          "record_id": {
            "type": "integer",
            "description": "range: 1..+inf"
          }
        },
        "required": true
      }
    },
  },
  {
    aeName: "divination.preview_taiyi",
    dshName: "divination_preview_taiyi",
    description: "按调用方冻结的 1800-2100 年北京时间民用时刻，计算太乙统宗 method 0 的年计/月计/日计/時計、72 局、十六宫星将、八门与主客定三算；23:00 子初切换次日日时干支，不按三算大小自动生成主客强弱、胜负或现实建议，不保存记录。",
    parameters: {
      "date_time": {
        "type": "string",
        "description": "调用方冻结的 1800-2100 年北京时间民用时刻，严格 YYYY-MM-DD HH:mm；不接受秒、T 分隔、前后空格、时区或 UTC offset；pattern: ^(?:(?:18|19|20)[0-9]{2}|2100)-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01]) (?:[01][0-9]|2[0-3]):[0-5][0-9]$",
        "required": true
      },
      "calculation_mode": {
        "type": "string",
        "enum": [
          "year",
          "month",
          "day",
          "hour"
        ],
        "required": true
      },
      "question_type": {
        "type": "string",
        "enum": [
          "general",
          "guoyun",
          "tianzai",
          "economy",
          "war"
        ]
      },
      "question": {
        "type": "string"
      },
      "focus_area": {
        "type": "string"
      },
      "locale": {
        "type": "string",
        "enum": [
          "zh",
          "zh-TW",
          "en",
          "ja",
          "ko"
        ]
      },
      "notes": {
        "type": "string"
      }
    },
  },
  {
    aeName: "divination.preview_tarot",
    dshName: "divination_preview_tarot",
    description: "按 tarot_deck_correspondence_profiles_v3_3 抽取指定牌系和牌阵，返回对应画像、解释画像、逆位请求/实效与随机来源证据，不保存记录。马赛不附加 Golden Dawn 对应；透特不生成逆位是产品牌系策略，不是普遍规则。带 seed 时先以 FNV-1a 64 位哈希再洗牌，且不保存 seed 明文。",
    parameters: {
      "question": {
        "type": "string",
        "required": true
      },
      "focus_area": {
        "type": "string"
      },
      "locale": {
        "type": "string",
        "enum": [
          "zh",
          "en"
        ]
      },
      "deck": {
        "type": "string",
        "enum": [
          "rider_waite",
          "marseille",
          "thoth"
        ],
        "description": "rider_waite 使用 Golden Dawn 衍生对应；marseille 不附加该对应；thoth 使用克劳利/Golden Dawn 衍生对应"
      },
      "spread": {
        "type": "string",
        "enum": [
          "three_cards",
          "horseshoe",
          "celtic_cross"
        ]
      },
      "allow_reversed": {
        "type": "boolean",
        "description": "请求逆位；Rider-Waite 与 Marseille 按请求执行，Thoth 保留请求值但本产品画像实际禁用"
      },
      "seed": {
        "type": "string",
        "description": "可复现种子；服务以 FNV-1a 64 位哈希后交给 Go math/rand Perm，不保存明文；minLength: 1"
      },
      "notes": {
        "type": "string"
      }
    },
  },
  {
    aeName: "divination.preview_tieban",
    dshName: "divination_preview_tieban",
    description: "基于当前用户本人资料或其命盘记录，优先按原始录入民用出生时间计算完整八个 15 分钟窗口、当前与相邻窗口、跨日边界和前后边界距离；直接四柱没有可核验民用时刻，必须拒绝。不包含传统铁板起数或条文，不保存记录。",
    parameters: {
      "question": {
        "type": "string"
      },
      "focus_area": {
        "type": "string"
      },
      "locale": {
        "type": "string",
        "enum": [
          "zh",
          "en"
        ]
      },
      "notes": {
        "type": "string"
      },
      "subject": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "use_profile": {
            "type": "boolean",
            "const": true
          },
          "record_id": {
            "type": "integer",
            "description": "range: 1..+inf"
          }
        },
        "description": "命主来源严格二选一；窗口优先使用该资料原始录入的民用出生时间，不应用真太阳时或额外 DST 修正。直接四柱缺少可核验民用出生日期和时刻，不能用于八刻窗口。",
        "required": true
      }
    },
  },
  {
    aeName: "divination.preview_xiaoliuren",
    dshName: "divination_preview_xiaoliuren",
    description: "按大安起正月、月上起日、日上起时的六宫逐宫法计算落宫并返回通行断诀；时间模式按输入地民用钟表字段换算农历，23:00 子时不提前换日，闰月沿用同名月数，不保存记录。",
    parameters: {
      "question": {
        "type": "string",
        "required": true
      },
      "focus_area": {
        "type": "string"
      },
      "locale": {
        "type": "string",
        "enum": [
          "zh",
          "zh-TW",
          "en",
          "ja",
          "ko"
        ]
      },
      "casting_method": {
        "type": "string",
        "enum": [
          "manual",
          "datetime"
        ],
        "required": true
      },
      "casting_time": {
        "type": "string",
        "description": "输入地民用钟表时间，不带时区偏移；23:00 子时不提前换日；pattern: ^\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}(:\\d{2})?$"
      },
      "month_number": {
        "type": "integer",
        "description": "农历月序；闰月按同名月序输入；range: 1..12"
      },
      "day_number": {
        "type": "integer",
        "description": "农历日序；range: 1..30"
      },
      "hour_number": {
        "type": "integer",
        "description": "时支序号：子为 1，亥为 12；range: 1..12"
      },
      "time_hint": {
        "type": "string"
      },
      "notes": {
        "type": "string"
      },
      "subject": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "use_profile": {
            "type": "boolean",
            "const": true
          },
          "record_id": {
            "type": "integer",
            "description": "range: 1..+inf"
          }
        },
        "description": "可选的命主资料；提供时本人资料和命盘记录严格二选一。"
      }
    },
  },
  {
    aeName: "election.find_good_days",
    dshName: "election_find_good_days",
    description: "按明确年份、月份和事项原词返回整月黄历宜忌直接命中证据；不读取服务器当前年月，不额外推断吉凶。",
    parameters: {
      "year": {
        "type": "integer",
        "description": "range: 1..9999",
        "required": true
      },
      "month": {
        "type": "integer",
        "description": "range: 1..12",
        "required": true
      },
      "activity": {
        "type": "string",
        "description": "与 lunar-go 当日宜忌完整术语做精确匹配，不拆词或映射同义词。；minLength: 1",
        "required": true
      }
    },
  },
  {
    aeName: "election.lookup_luohou_shashi",
    dshName: "election_lookup_luohou_shashi",
    description: "按显式北京时间民用起始日期查询罗喉杀师日时证据日历，逐日返回年、季、月罗喉直接命中与两段杀师时；不混入九宫飞星、其他造葬禁忌、整体吉凶、事项适宜性或现实危险结论。",
    parameters: {
      "year": {
        "type": "integer",
        "description": "range: 1..9999",
        "required": true
      },
      "month": {
        "type": "integer",
        "description": "range: 1..12",
        "required": true
      },
      "day": {
        "type": "integer",
        "description": "range: 1..31",
        "required": true
      },
      "days_to_show": {
        "type": "integer",
        "description": "range: 1..90"
      }
    },
  },
  {
    aeName: "election.preview_donggong",
    dshName: "election_preview_donggong",
    description: "按 YYYY-MM-DD 北京时间民用日期、民用午夜日界、精确到秒的节令月界、日干支和值日匹配《董公選要覽》月日条文；时刻只影响交节月界，23:00–23:59 不提前换次日条文，并返回产品事项别名到古籍命中原词的追踪；不保存记录。",
    parameters: {
      "date": {
        "type": "string",
        "description": "排除 1582-10-05 至 1582-10-14；0001–9999 范围内的 YYYY-MM-DD 北京时间民用日期；不得包含时分、时区或 UTC offset；pattern: ^[0-9]{4}-[0-9]{2}-[0-9]{2}$",
        "required": true
      },
      "time": {
        "type": "string",
        "description": "北京时间（UTC+8）HH:mm；只用于精确到秒的节令月界，不改变民用日期日柱；省略时固定按 12:00 并留痕；pattern: ^(?:[01]\\d|2[0-3]):[0-5]\\d$"
      },
      "activity_type": {
        "type": "string",
        "description": "可填现代事项；结果会区分产品别名与实际命中的古籍事项原词，未直接覆盖时返回 not_covered"
      },
      "question": {
        "type": "string"
      },
      "locale": {
        "type": "string",
        "enum": [
          "zh",
          "en"
        ]
      },
      "notes": {
        "type": "string"
      }
    },
  },
  {
    aeName: "election.preview_jianchu",
    dshName: "election_preview_jianchu",
    description: "按严格 YYYY-MM-DD 北京时间民用日期、民用午夜日界与精确节令月界（精确到秒）查询建除十二值星、同口径十二天神及 lunar-go sect 2 日宜忌；23:00–23:59 不提前换日，时刻只影响交节月界，事项只按完整原词命中；不保存记录。",
    parameters: {
      "date": {
        "type": "string",
        "description": "排除 1582-10-05 至 1582-10-14；0001–9999 范围内的 YYYY-MM-DD 北京时间民用日期；不得包含时分、时区或 UTC offset；pattern: ^[0-9]{4}-[0-9]{2}-[0-9]{2}$",
        "required": true
      },
      "time": {
        "type": "string",
        "description": "北京时间（UTC+8）HH:mm；只用于精确到秒的节令月界，不改变民用日期日柱；省略时固定按 12:00 并留痕；pattern: ^(?:[01]\\d|2[0-3]):[0-5]\\d$"
      },
      "activity_type": {
        "type": "string",
        "description": "字段整体与日宜忌条目原词精确匹配；不拆词、不匹配子串、不作同义词映射"
      },
      "question": {
        "type": "string"
      },
      "locale": {
        "type": "string",
        "enum": [
          "zh",
          "en"
        ]
      },
      "notes": {
        "type": "string"
      }
    },
  },
  {
    aeName: "election.preview_taisui",
    dshName: "election_preview_taisui",
    description: "基于当前用户本人资料或其命盘记录的原始民用出生日期，按农历春节民用午夜年界比对 1900–2100 目标农历年份的值、冲、刑、害、破直接关系；时刻与时区不参与，重叠关系全部保留，不生成现实建议且不保存记录。",
    parameters: {
      "question": {
        "type": "string"
      },
      "focus_area": {
        "type": "string"
      },
      "locale": {
        "type": "string",
        "enum": [
          "zh",
          "en"
        ]
      },
      "notes": {
        "type": "string"
      },
      "target_year": {
        "type": "integer",
        "description": "公历编号对应的目标农历生肖年；必须显式提供，服务端不读取当前年份补齐；range: 1900..2100",
        "required": true
      },
      "subject": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "use_profile": {
            "type": "boolean",
            "const": true
          },
          "record_id": {
            "type": "integer",
            "description": "range: 1..+inf"
          }
        },
        "required": true
      }
    },
  },
  {
    aeName: "election.preview_wutu",
    dshName: "election_preview_wutu",
    description: "按北京时间民用日期、月朔截法与排山九星规则计算值日及完整十二时辰九星盘；子时按所填民用日期的00时段与23时段分段留痕，内部层级不直接判断具体事项适合性，后续窗口不回绕到本月已过日期；不保存记录。",
    parameters: {
      "date": {
        "type": "string",
        "description": "0001-9999 年北京时间民用日期 YYYY-MM-DD；排除 1582-10-05 至 1582-10-14；不得包含时分、时区或 UTC offset；pattern: ^(?:[1-9][0-9]{3}|0[1-9][0-9]{2}|00[1-9][0-9]|000[1-9])-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$",
        "required": true
      },
      "activity_type": {
        "type": "string",
        "description": "仅作为解释主题；乌兔内部星级不直接生成事项适合性结论"
      },
      "question": {
        "type": "string"
      },
      "locale": {
        "type": "string",
        "enum": [
          "zh",
          "en"
        ]
      },
      "notes": {
        "type": "string"
      }
    },
  },
  {
    aeName: "election.preview_xiu",
    dshName: "election_preview_xiu",
    description: "按 0001–9999 范围内严格 YYYY-MM-DD 北京时间民用日期查询 lunar-go 日支 + 星期索引固定表的中国历书二十八宿、宿吉凶、宿歌、七曜、动物与宫守；午夜换日，不接受时刻或时区，不是真实月球位置，不从单宿生成事项结论，不保存记录。",
    parameters: {
      "date": {
        "type": "string",
        "description": "排除 1582-10-05 至 1582-10-14；0001–9999 范围内的 YYYY-MM-DD 北京时间民用日期；午夜换日，不得包含时分、时区、UTC offset 或前后空格；pattern: ^[0-9]{4}-[0-9]{2}-[0-9]{2}$",
        "required": true
      },
      "activity_type": {
        "type": "string",
        "description": "仅作为解读主题；本工具没有结构化事项命中规则，不从单宿吉凶或宿歌生成事项宜忌"
      },
      "question": {
        "type": "string"
      },
      "locale": {
        "type": "string",
        "enum": [
          "zh",
          "en"
        ]
      },
      "notes": {
        "type": "string"
      }
    },
  },
  {
    aeName: "lingxi.rag_query",
    dshName: "lingxi_rag_query",
    description: "按用户提供的资料库、人物和检索参数查询 Ancient Echoes RAG，返回答案与出处。会按当前用户的 AI 套餐、模型权限和额度计费；没有 dataset_key 或 source_persona_id 时不会检索知识库，因此必须显式指定（scene=coding 除外）。可用数据集见 GET /api/v1/rag/datasets。",
    parameters: {
      "messages": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "role": {
              "type": "string",
              "enum": [
                "system",
                "user",
                "assistant"
              ],
              "required": true
            },
            "content": {
              "type": "string",
              "description": "minLength: 1",
              "required": true
            }
          }
        },
        "description": "minItems: 1",
        "required": true
      },
      "model": {
        "type": "string"
      },
      "temperature": {
        "type": "number"
      },
      "top_p": {
        "type": "number"
      },
      "max_tokens": {
        "type": "integer",
        "description": "range: 1..+inf"
      },
      "scene": {
        "type": "string",
        "enum": [
          "chat",
          "coding"
        ]
      },
      "source_persona_id": {
        "type": "string"
      },
      "dataset_key": {
        "type": "string"
      },
      "collection": {
        "type": "string"
      },
      "tone_hint": {
        "type": "string"
      },
      "tone_hint_override": {
        "type": "string"
      },
      "guidance": {
        "type": "string"
      },
      "guidance_override": {
        "type": "string"
      },
      "system_prompt": {
        "type": "string"
      },
      "top_k": {
        "type": "integer",
        "description": "range: 1..+inf"
      },
      "metadata": {
        "type": "json"
      }
    },
  },
  {
    aeName: "lingxi.rag_search",
    dshName: "lingxi_rag_search",
    description: "只检索知识库并返回命中的原文片段与出处（篇目、页码、来源文件、相似度、chunk 位置），不生成回答、不消耗 AI 额度、不依赖 AI provider key。searched=false 表示检索没有执行，调用方必须按 reason 报错，不得当成“库里没有这段内容”。",
    parameters: {
      "dataset_key": {
        "type": "string",
        "description": "数据集 key，可通过 GET /api/v1/rag/datasets 获取；minLength: 1",
        "required": true
      },
      "query": {
        "type": "string",
        "description": "检索词，优先使用原文用词；minLength: 1",
        "required": true
      },
      "top_k": {
        "type": "integer",
        "description": "range: 1..20"
      },
      "collection": {
        "type": "string",
        "description": "可选，覆盖数据集默认 collection"
      }
    },
  },
  {
    aeName: "qimen.calculate_chart",
    dshName: "qimen_calculate_chart",
    description: "根据明确起局时间、地点与时间语义及二十四节气三元定局表计算时家转盘拆补奇门盘；天禽与中宫天盘寄干始终随天芮转，小寒采用二八五，节气按全球同一瞬间跨时区切换，分钟模式只增加非传统产品十分钟分段。缺失来源、精度、历法、时分、时区或坐标时拒绝，不回填当前时间、默认时区或默认地点。\n\n条件约束：条件约束：[chart_datetime] 或 [chart_year, chart_month, chart_day, chart_hour, chart_minute]。；条件约束：[timezone_id] 或 [timezone_offset_minutes]。。",
    parameters: {
      "name": {
        "type": "string"
      },
      "chart_datetime": {
        "type": "string",
        "description": "pattern: ^\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}(:\\d{2})?([+-]\\d{2}:\\d{2}|Z)?$"
      },
      "chart_year": {
        "type": "integer",
        "description": "range: 1800..2100"
      },
      "chart_month": {
        "type": "integer",
        "description": "range: 1..12"
      },
      "chart_day": {
        "type": "integer",
        "description": "range: 1..31"
      },
      "chart_hour": {
        "type": "integer",
        "description": "range: 0..23"
      },
      "chart_minute": {
        "type": "integer",
        "description": "range: 0..59"
      },
      "timezone_id": {
        "type": "string",
        "description": "minLength: 1"
      },
      "timezone_offset_minutes": {
        "type": "integer",
        "description": "range: -840..840"
      },
      "place": {
        "type": "string"
      },
      "longitude": {
        "type": "number",
        "description": "range: -180..180",
        "required": true
      },
      "latitude": {
        "type": "number",
        "description": "range: -90..90",
        "required": true
      },
      "calendar_type": {
        "type": "string",
        "enum": [
          "solar",
          "lunar"
        ],
        "required": true
      },
      "is_leap_month": {
        "type": "boolean"
      },
      "use_true_time": {
        "type": "boolean"
      },
      "use_true_solar_time": {
        "type": "boolean"
      },
      "apply_dst": {
        "type": "boolean"
      },
      "locale": {
        "type": "string"
      },
      "question": {
        "type": "string",
        "description": "minLength: 1"
      },
      "focus_area": {
        "type": "string"
      },
      "cast_time_source": {
        "type": "string",
        "enum": [
          "current",
          "event",
          "birth"
        ],
        "required": true
      },
      "precision_mode": {
        "type": "string",
        "enum": [
          "hour",
          "minute"
        ],
        "required": true
      }
    },
  },
  {
    aeName: "qizheng.calculate_chart",
    dshName: "qizheng_calculate_chart",
    description: "按完整出生时刻、时区、坐标与显式宫位口径计算七政四余低精度天文核心盘；果老太阳时支立命与浮升点等宫研究口径不混用。\n\n条件约束：条件约束：[birth_datetime] 或 [birth_year, birth_month, birth_day, birth_hour, birth_minute]。；条件约束：[timezone_id] 或 [birth_timezone] 或 [timezone_offset_minutes]。。",
    parameters: {
      "name": {
        "type": "string"
      },
      "birth_datetime": {
        "type": "string",
        "description": "公历出生日期、小时和分钟；农历请使用完整年月日时分字段；pattern: ^\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}(:\\d{2})?([+-]\\d{2}:\\d{2}|Z)?$"
      },
      "birth_year": {
        "type": "integer",
        "description": "range: 1800..2100"
      },
      "birth_month": {
        "type": "integer",
        "description": "range: 1..12"
      },
      "birth_day": {
        "type": "integer",
        "description": "range: 1..31"
      },
      "birth_hour": {
        "type": "integer",
        "description": "range: 0..23"
      },
      "birth_minute": {
        "type": "integer",
        "description": "range: 0..59"
      },
      "timezone_id": {
        "type": "string",
        "description": "minLength: 1"
      },
      "birth_timezone": {
        "type": "string",
        "description": "minLength: 1"
      },
      "timezone_offset_minutes": {
        "type": "integer",
        "description": "range: -840..840"
      },
      "birth_place": {
        "type": "string"
      },
      "birth_longitude": {
        "type": "number",
        "description": "range: -180..180",
        "required": true
      },
      "birth_latitude": {
        "type": "number",
        "description": "range: -90..90",
        "required": true
      },
      "calendar_type": {
        "type": "string",
        "enum": [
          "solar",
          "lunar"
        ],
        "required": true
      },
      "is_leap_month": {
        "type": "boolean"
      },
      "palace_system": {
        "type": "string",
        "enum": [
          "guolao_sun_hour",
          "floating_asc_equal"
        ],
        "required": true
      },
      "locale": {
        "type": "string"
      },
      "question": {
        "type": "string"
      },
      "focus_area": {
        "type": "string"
      }
    },
  },
  {
    aeName: "vedic.calculate_chart",
    dshName: "vedic_calculate_chart",
    description: "按完整出生时刻、时区、坐标与显式 Lahiri/whole-sign/平均交点/年长口径计算吠陀 D1、D9 与 Vimshottari mahadasha。\n\n条件约束：条件约束：[birth_datetime] 或 [birth_year, birth_month, birth_day, birth_hour, birth_minute]。；条件约束：[timezone_id] 或 [birth_timezone] 或 [timezone_offset_minutes]。。",
    parameters: {
      "name": {
        "type": "string"
      },
      "birth_datetime": {
        "type": "string",
        "description": "公历出生日期、小时和分钟；农历请使用完整年月日时分字段；pattern: ^\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}(:\\d{2})?([+-]\\d{2}:\\d{2}|Z)?$"
      },
      "birth_year": {
        "type": "integer",
        "description": "range: 1800..2100"
      },
      "birth_month": {
        "type": "integer",
        "description": "range: 1..12"
      },
      "birth_day": {
        "type": "integer",
        "description": "range: 1..31"
      },
      "birth_hour": {
        "type": "integer",
        "description": "range: 0..23"
      },
      "birth_minute": {
        "type": "integer",
        "description": "range: 0..59"
      },
      "timezone_id": {
        "type": "string",
        "description": "minLength: 1"
      },
      "birth_timezone": {
        "type": "string",
        "description": "minLength: 1"
      },
      "timezone_offset_minutes": {
        "type": "integer",
        "description": "range: -840..840"
      },
      "birth_place": {
        "type": "string"
      },
      "birth_longitude": {
        "type": "number",
        "description": "range: -180..180",
        "required": true
      },
      "birth_latitude": {
        "type": "number",
        "description": "range: -90..90",
        "required": true
      },
      "calendar_type": {
        "type": "string",
        "enum": [
          "solar",
          "lunar"
        ],
        "required": true
      },
      "is_leap_month": {
        "type": "boolean"
      },
      "ayanamsa": {
        "type": "string",
        "const": "lahiri",
        "required": true
      },
      "house_system": {
        "type": "string",
        "const": "whole_sign",
        "required": true
      },
      "node_type": {
        "type": "string",
        "const": "mean",
        "required": true
      },
      "dasha_year_basis": {
        "type": "string",
        "const": "solar_365_2425",
        "required": true
      },
      "locale": {
        "type": "string"
      },
      "question": {
        "type": "string"
      },
      "focus_area": {
        "type": "string"
      }
    },
  },
  {
    aeName: "ziwei.calculate_chart",
    dshName: "ziwei_calculate_chart",
    description: "根据完整出生时刻、有效安星码、显式目标民用时刻及其来源计算可复现的三合紫微主盘与大限、流年、流月、流日、流时；不读取服务器当前时间，不接受任意 settings 绕过安星码。",
    parameters: {
      "real_name": {
        "type": "string"
      },
      "year": {
        "type": "integer",
        "description": "range: 1900..2100",
        "required": true
      },
      "month": {
        "type": "integer",
        "description": "range: 1..12",
        "required": true
      },
      "day": {
        "type": "integer",
        "description": "range: 1..31",
        "required": true
      },
      "hour": {
        "type": "integer",
        "description": "range: 0..23",
        "required": true
      },
      "minute": {
        "type": "integer",
        "description": "range: 0..59",
        "required": true
      },
      "calendar_type": {
        "type": "string",
        "enum": [
          "solar",
          "lunar"
        ],
        "required": true
      },
      "is_leap_month": {
        "type": "boolean"
      },
      "is_male": {
        "type": "boolean",
        "required": true
      },
      "use_true_time": {
        "type": "boolean"
      },
      "longitude": {
        "type": "number",
        "description": "range: -180..180"
      },
      "latitude": {
        "type": "number",
        "description": "range: -90..90"
      },
      "city_name": {
        "type": "string"
      },
      "birth_place_type": {
        "type": "string"
      },
      "birth_country": {
        "type": "string"
      },
      "timezone_id": {
        "type": "string"
      },
      "birth_timezone": {
        "type": "string"
      },
      "timezone_offset_minutes": {
        "type": "integer",
        "description": "range: -840..840"
      },
      "apply_dst": {
        "type": "boolean"
      },
      "anxing_code": {
        "type": "string",
        "description": "minLength: 1",
        "required": true
      },
      "locale": {
        "type": "string"
      },
      "target_year": {
        "type": "integer",
        "description": "range: 1800..2200",
        "required": true
      },
      "target_month": {
        "type": "integer",
        "description": "range: 1..12",
        "required": true
      },
      "target_day": {
        "type": "integer",
        "description": "range: 1..31",
        "required": true
      },
      "target_hour": {
        "type": "integer",
        "description": "range: 0..23",
        "required": true
      },
      "target_minute": {
        "type": "integer",
        "description": "range: 0..59",
        "required": true
      },
      "target_time_source": {
        "type": "string",
        "enum": [
          "current_snapshot",
          "selected"
        ],
        "required": true
      }
    },
  },
]
