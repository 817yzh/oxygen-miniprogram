# 氧氧宝后端服务（测试版 v0.1）

> 面向"给别人扫码体验 + 收集真实数据"阶段的后端。零第三方依赖，开箱即跑。
> 数据落本地 JSON 文件（`data/*.json`），模拟数据库表，未来可平滑迁移 SQLite/MySQL。

---

## 一、快速开始

```bash
# 1. 进入目录
cd D:\Users\yzh\Desktop\12_充氧宝业务\01_后端服务\oxygen-backend

# 2. 启动服务（无需 npm install，无任何依赖）
node src/server.js
# 或 npm start

# 3. 看到启动日志即成功
#    地址: http://localhost:3000

# 4. 验证
#    浏览器打开 http://localhost:3000/api/health
```

**换端口**：`PORT=3001 node src/server.js`

**运行冒烟测试**（29 项全链路自检）：
```bash
npm test
```

**清空测试数据**：
```bash
node scripts/reset-db.js --yes
```

---

## 二、接口总览

统一返回格式：`{ code: 0, message: 'ok', data: {...} }`，`code !== 0` 为出错。

> **用户标识**：测试阶段用一个字符串当 userId（如 `test_001` 或微信 openid）。
> 通过请求头 `x-user-id` 或参数 `user_id` 传递。

### 基础
| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 健康检查 |

### 用户
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/user/register` | 注册/获取用户（幂等） |
| GET | `/api/user/profile` | 用户画像聚合（人格+成长+偏好+成就+今日打卡） |
| POST | `/api/user/update` | 更新昵称/头像 |

### 打卡（核心）
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/checkin` | 提交打卡（文字/拍照+场景）→ 情绪分析 → 生成记录+成长+成就 |
| GET | `/api/checkin/today` | 今日是否已打卡 |
| GET | `/api/checkin/history` | 打卡历史（默认30条） |

### 人格
| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/personality/list` | 六人格库 |
| POST | `/api/personality/save` | 保存测试结果 |
| GET | `/api/personality/:type/product` | 人格→产品映射 |

### 偏好
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/preferences/save` | 保存偏好（作息/场景/款式） |

### 聊天
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/chat` | 发消息→氧氧回复（规则引擎，预留LLM） |
| GET | `/api/chat/history` | 最近50条聊天记录 |

### 情绪分析（预留 AI 位）
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/emotion/analyze` | 文本→情绪（未来换真实模型，结构不变） |

### 成长 / 成就
| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/growth` | 成长数据+明细 |
| GET | `/api/achievements` | 成就列表（带解锁状态） |

### 产品 / 场景 / 硬件
| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/products` | 产品型号+参数 |
| GET | `/api/scenes` | 四大场景 |
| POST | `/api/oxygen/use` | 记录一次氧方案使用（硬件联动占位） |

---

## 三、调用示例

### 1. 注册/获取用户
```bash
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test_001"}'
```

### 2. 提交打卡（文字）
```bash
curl -X POST http://localhost:3000/api/checkin \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_001" \
  -d '{"text":"今天好累，加班到很晚","scene":"脑疲劳"}'
```
返回：完整 record（情绪标签/状态/能量/建议）+ 新解锁成就 + 成长数据。

### 3. 聊天
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_001" \
  -d '{"text":"我最近很焦虑"}'
```

### 4. 用户画像
```bash
curl -X GET "http://localhost:3000/api/user/profile" -H "x-user-id: test_001"
```

---

## 四、数据模型（JSON 表）

`data/` 下每个 JSON 文件对应一张表：

| 文件 | 对应表 | 关键字段 |
|---|---|---|
| users.json | 用户 | user_id, nickname, avatar |
| user_personality.json | 人格结果 | user_id, personality_id, name |
| user_growth.json | 成长 | user_id, checkinDays, experience, growthLevel, oxDays |
| checkin_records.json | 打卡记录 | user_id, date, text, scene, emotionLabel, state, energy, indexes, photo |
| user_preferences.json | 偏好 | user_id, sleepPattern, highlandFreq... |
| user_achievements.json | 成就 | user_id, achievement_id |
| growth_logs.json | 成长明细 | user_id, action, exp, time |
| chat_messages.json | 聊天 | user_id, role, content, time |
| oxygen_test_reports.json | 自测 | user_id, ... |
| user_flags.json | 一次性标记 | user_id, flag |

---

## 五、目录结构

```
oxygen-backend/
├── src/
│   ├── server.js          # 主入口（http服务/CORS/body解析/日志）
│   ├── db/
│   │   ├── store.js       # JSON 存储层（find/insert/update/remove）
│   │   └── static-data.js # 静态知识库（人格/成长/成就/产品）
│   ├── services/
│   │   ├── userService.js # 用户/打卡/成长/成就业务
│   │   ├── llmService.js  # 豆包大模型接入（火山方舟，可选）
│   │   ├── emotionService.js # 情绪分析（LLM优先，回退规则引擎）
│   │   └── chatService.js # 聊天引擎（LLM优先，回退规则回复）
│   └── routes/
│       ├── index.js       # 路由定义（接口清单）
│       ├── router.js      # 路由匹配器
│       └── pathToRegexp.js
├── data/                  # 数据文件（运行时生成）
├── scripts/reset-db.js    # 重置数据
├── scripts/test-llm.js    # 豆包LLM连通性验证
├── tests/smoke-test.js    # 29项冒烟测试
├── .env.example           # 环境变量模板
└── package.json
```

---

## 六、后续演进路线

| 阶段 | 内容 |
|---|---|
| ✅ 当前 | 核心接口全链路（用户/打卡/人格/聊天/成长/成就）跑通 |
| ✅ 当前 | 已接入豆包大模型（聊天回复 + 情绪分析，未配Key自动回退规则引擎） |
| 🔜 下一步 | 图片上传（氧气瞬间照片 → 对象存储返回URL） |
| 🔜 | 微信登录（code2session 换 openid） |
| 🔜 | 前端 wx.request 对接（把本地 mock 换成调接口） |
| 🔜 | 迁移 SQLite/MySQL + 云部署 |

---

## 六·补充、豆包大模型接入说明

后端已接入豆包（火山方舟）大模型，用于：
- **聊天回复**（`/api/chat`）：带氧氧治愈人格的 System Prompt 生成陪伴回复
- **情绪分析**（`/api/emotion/analyze`）：结构化 JSON 输出情绪标签/置信度/建议

**配置方法：**
1. 火山方舟控制台 → API Key 管理 → 创建 API Key
2. 复制 `.env.example` 为 `.env`，填入 `ARK_API_KEY=你的Key`（模型名默认 `doubao-seed-2-0-lite-260428`，可用 `ARK_MODEL` 覆盖）
3. 启动：`node src/server.js`

**降级策略：** 未配置 `ARK_API_KEY` 时，聊天/情绪分析自动回退到内置规则引擎，接口照常返回，不会报错。

**验证：** `node scripts/test-llm.js`（配了 Key 会真实调用豆包，未配则提示回退）。

---

## 七、与前端 mock 的对应关系

前端 `utils/` 里的 service 是"接口长什么样"的预览，本后端已按同一契约实现：

| 前端 service | 后端接口 |
|---|---|
| checkinService.runCheckin() | POST /api/checkin |
| emotionEngine.analyze() | POST /api/emotion/analyze |
| chatEngine.reply() | POST /api/chat |
| getUserProfile() | GET /api/user/profile |
| getPersonalityProduct() | GET /api/personality/:type/product |

前端接后端时，只需把读本地 mock/storage 的调用替换为 `wx.request` 调这些接口，**数据结构无需大改**。
