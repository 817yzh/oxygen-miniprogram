/**
 * src/services/llmService.js
 * 豆包大模型（火山方舟）接入服务
 *
 * 通过环境变量 ARK_API_KEY 读取密钥（不硬编码在代码里）。
 * 使用 OpenAI 兼容的 Chat Completions 接口：
 *   https://ark.cn-beijing.volces.com/api/v3/chat/completions
 *
 * 提供两个能力：
 *   1. chat()         —— 生成氧氧陪伴回复（带氧氧人格 System Prompt）
 *   2. analyzeEmotion()—— 文本情绪分析（结构化 JSON 输出）
 *
 * 未配置 ARK_API_KEY 时自动返回 null，调用方回退到规则引擎，保证不崩。
 */

const MODEL = process.env.ARK_MODEL || 'doubao-seed-2-0-lite-260428'
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
/** 图片/多模态识别走 Responses API（同 key 同模型，支持 input_image base64） */
const RESP_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/responses'

/** 读取 API Key（环境变量或 .env 由启动脚本注入） */
function getApiKey() {
  return process.env.ARK_API_KEY || ''
}

/** 是否已配置豆包 API */
function isAvailable() {
  return !!getApiKey()
}

/**
 * 基础调用：调豆包 Chat Completions
 * @param {Array} messages  OpenAI 格式消息
 * @param {object} opts { temperature, maxTokens, responseFormat }
 * @returns {Promise<string|null>} 返回模型回复文本；失败/未配置返回 null
 */
async function callChat(messages, opts = {}) {
  if (!isAvailable()) return null
  const key = getApiKey()

  const body = {
    model: MODEL,
    messages,
    temperature: opts.temperature !== undefined ? opts.temperature : 0.8,
    max_tokens: opts.maxTokens || 600
  }
  if (opts.responseFormat === 'json') {
    body.response_format = { type: 'json_object' }
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      console.warn(`[llm] 豆包API错误 ${res.status}: ${await res.text()}`)
      return null
    }
    const data = await res.json()
    const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
    return content || null
  } catch (e) {
    console.warn('[llm] 豆包API调用异常:', e.message)
    return null
  }
}

/** 氧氧人格 System Prompt（治愈陪伴定位） */
const OXY_SYSTEM_PROMPT = `你是"氧氧"，一款情绪健康 AI 陪伴小程序里的治愈系伙伴，定位是"情绪能量管理与自我成长陪伴"，不是医疗诊断工具。
你的用户是年轻大学生/初入职场人群，需要被看见、被理解、被陪伴。
回复要求：
- 语气温柔治愈、口语化、有陪伴感，像朋友一样
- 适当使用 1-2 个表情符号（💚🌱🫧🌙 等），不要堆砌
- 短句为主，分段自然，总长控制在 120 字内
- 用户提到累/焦虑/压力/熬夜/失眠等时，先共情，再给一个轻量的补氧/呼吸/休息建议，可自然提到"充氧宝"但不要强推
- 绝不给出医疗诊断或绝对化结论
- 记住用户说的话，体现"记得你"的陪伴感`

/**
 * 生成氧氧陪伴回复
 * @param {string} userText 用户输入
 * @param {object} ctx { userName, personality, preferences, scene }
 * @returns {Promise<string|null>}
 */
async function chat(userText, ctx = {}) {
  if (!isAvailable()) return null
  const name = ctx.userName || '氧友'
  const personalityLine = ctx.personality ? `（用户的人格是${ctx.personality.name}）` : ''
  const messages = [
    { role: 'system', content: OXY_SYSTEM_PROMPT },
    { role: 'user', content: `${personalityLine}\n我是${name}：${userText}` }
  ]
  return callChat(messages, { temperature: 0.85, maxTokens: 400 })
}

/**
 * 情绪分析（结构化 JSON）
 * @param {string} text 用户文本
 * @returns {Promise<object|null>} 返回 { emotionLabel, confidence, insight, regulationTip, energy } 或 null
 */
async function analyzeEmotion(text) {
  if (!isAvailable() || !text) return null
  const messages = [
    {
      role: 'system',
      content: '你是情绪识别引擎。根据用户输入文本，分析其情绪状态，只输出一个 JSON 对象，不要输出任何其他内容。' +
        'JSON 字段定义：' +
        'emotionLabel: 情绪标签，只能是以下之一：开心/平静/放松/疲惫/焦虑/烦躁/低落/紧张/孤独；' +
        'confidence: 0到1的置信度；' +
        'insight: 一句温暖的洞察文案；' +
        'regulationTip: 一条贴合情绪的行动建议；' +
        'energy: 0到100的氧气能量值。'
    },
    { role: 'user', content: text }
  ]
  const raw = await callChat(messages, { temperature: 0.2, maxTokens: 300, responseFormat: 'json' })
  if (!raw) return null
  try {
    // 兼容返回中可能包裹的 ```json ``` 或多余文本
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start < 0 || end < 0) return null
    const obj = JSON.parse(cleaned.slice(start, end + 1))
    return {
      emotionLabel: obj.emotionLabel || '平静',
      confidence: Number(obj.confidence) || 0.7,
      insight: obj.insight || '',
      regulationTip: obj.regulationTip || '',
      energy: Number(obj.energy) || 70
    }
  } catch (e) {
    console.warn('[llm] 情绪JSON解析失败，回退规则引擎:', e.message)
    return null
  }
}

/**
 * 图片/照片情绪识别（多模态）—— 走 Responses API，复用现有 key + 模型
 * @param {string} imageData 支持两种：
 *   - base64 data URL（data:image/png;base64,xxx）
 *   - 或 http(s) 图片 URL
 * @returns {Promise<object|null>} { emotionLabel, confidence, insight } 或 null（失败/未配置）
 */
async function analyzeImageEmotion(imageData) {
  if (!isAvailable() || !imageData) return null
  const messages = {
    model: MODEL,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: '请识别这张照片中人物的面部情绪（若图中有人），只输出一个 JSON 对象，不要输出其他内容。' +
              'JSON 字段：emotionLabel(只能是：开心/平静/放松/疲惫/焦虑/烦躁/低落/紧张/孤独/惊讶 之一)；' +
              'confidence(0到1的置信度)；' +
              'insight(一句温暖的情绪解读文案)。' +
              '若图中无人或无法识别情绪，emotionLabel 返回"平静"，confidence 返回 0.5，insight 说明未识别到面部。'
          },
          { type: 'input_image', image_url: imageData }
        ]
      }
    ],
    max_output_tokens: 2000
  }
  try {
    const res = await fetch(RESP_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getApiKey() },
      body: JSON.stringify(messages)
    })
    if (!res.ok) {
      console.warn(`[llm] 图片识别API错误 ${res.status}`)
      return null
    }
    const data = await res.json()
    let raw = ''
    const out = data.output || []
    for (const o of out) {
      if (o && o.content && Array.isArray(o.content)) {
        for (const c of o.content) {
          if (c && c.type === 'output_text' && c.text) raw += c.text
        }
      }
    }
    if (!raw) return null
    // 提取 JSON
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start < 0 || end < 0) return null
    const obj = JSON.parse(cleaned.slice(start, end + 1))
    return {
      emotionLabel: obj.emotionLabel || '平静',
      confidence: Number(obj.confidence) || 0.7,
      insight: obj.insight || '氧氧正静静陪着你 🌱'
    }
  } catch (e) {
    console.warn('[llm] 图片情绪识别异常:', e.message)
    return null
  }
}

module.exports = { chat, analyzeEmotion, analyzeImageEmotion, isAvailable, callChat, MODEL }
