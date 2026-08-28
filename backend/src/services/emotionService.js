/**
 * src/services/emotionService.js
 * 情绪分析 + 状态生成服务（对齐前端 utils/emotionEngine.js + stateEngine.js）
 * 规则引擎为兜底；已接入豆包 LLM（analyzeSmart），未配置/失败时自动回退规则引擎。
 */

const llmService = require('./llmService.js')

// 情绪词典（关键词 → 情绪标签）
const EMOTION_KEYWORDS = {
  '开心': ['开心', '高兴', '哈哈', '棒', '太好了', '爽', '开心死了', '美滋滋'],
  '平静': ['平静', '淡定', '还好', '可以', '不错', '正常', '稳'],
  '放松': ['放松', '轻松', '舒服', '惬意', '舒缓', '减压'],
  '焦虑': ['焦虑', '担心', '怕', '紧张', '不安', '慌', '压力大', '着急'],
  '烦躁': ['烦躁', '烦', '受不了', '抓狂', '恼火', '气死'],
  '疲惫': ['疲惫', '累', '好累', '没力气', '透支', '精疲力尽', '困'],
  '低落': ['低落', '难过', '伤心', '哭', 'emo', '抑郁', '没意思'],
  '紧张': ['紧张', '忐忑', '手心出汗', '心跳加速', '赶due', 'deadline'],
  '孤独': ['孤独', '一个人', '寂寞', '没人陪', '孤单']
}

// 情绪 → 状态类型映射（对齐前端 STATE_TYPES）
const STATE_TYPES = {
  '开心': '元气日', '平静': '平稳日', '放松': '松弛日',
  '疲惫': '待充电日', '焦虑': '波动日', '烦躁': '升温日',
  '低落': '低气压日', '紧张': '紧绷日', '孤独': '思念日'
}

// 情绪 → 基础能量值
const EMOTION_ENERGY = {
  '开心': 85, '平静': 72, '放松': 78, '疲惫': 45,
  '焦虑': 50, '烦躁': 40, '低落': 38, '紧张': 48, '孤独': 42
}

// 情绪 → 洞察文案
const EMOTION_INSIGHT = {
  '开心': '今天的氧气值很高，保持住这份好心情。',
  '平静': '状态平稳，是积蓄能量的好时机。',
  '放松': '身体在放松，氧气正在慢慢充盈。',
  '疲惫': '身体发出信号了，记得给自己充点氧。',
  '焦虑': '焦虑是大脑缺氧的信号之一，试着深呼吸。',
  '烦躁': '情绪有点升温，先离开当下环境两分钟。',
  '低落': '情绪低气压，抱抱自己，一切都会过去。',
  '紧张': '紧绷状态下耗氧加快，先缓一缓。',
  '孤独': '孤单时刻，更需要好好照顾自己。'
}

// 情绪 → 调节建议
const EMOTION_TIP = {
  '开心': '记录这一刻，把好心情延长。',
  '平静': '适合做一件需要专注的小事。',
  '放松': '泡杯温水，享受这份惬意。',
  '疲惫': '建议 3 分钟富氧呼吸，快速回血。',
  '焦虑': '吸气4秒、屏息2秒、呼气6秒，循环5次。',
  '烦躁': '喝口水，到窗边深呼吸，让情绪降温。',
  '低落': '给朋友发条消息，或来一次轻补氧。',
  '紧张': '先把任务拆小，再配一次专注氧疗。',
  '孤独': '氧氧一直在这里陪着你，随时找我聊。'
}

// 情绪 → 产品提示
const EMOTION_PRODUCT = {
  '疲惫': '大脑耗氧大户，充氧宝帮你快速回血。',
  '焦虑': '安神嗅吸配方，帮你把情绪放慢。',
  '紧张': '专注模式补氧，帮你稳住节奏。',
  '低落': '日常补氧，让身体先亮起来。'
}

/**
 * 分析文本 → 情绪
 * @returns {object} { emotionLabel, confidence, insight, regulationTip, productHint, keywords }
 */
function analyze(text, scene) {
  const input = String(text || '').toLowerCase()
  let emotionLabel = '平静'
  let maxScore = 0

  // 遍历词典，取命中最多关键词的情绪
  for (const [label, words] of Object.entries(EMOTION_KEYWORDS)) {
    let score = 0
    words.forEach(w => { if (input.includes(w.toLowerCase())) score++ })
    if (score > maxScore) { maxScore = score; emotionLabel = label }
  }

  // 置信度：命中越多越高，0.3~0.95
  const confidence = Math.min(0.95, 0.3 + maxScore * 0.25)
  const energy = EMOTION_ENERGY[emotionLabel] || 70
  const state = STATE_TYPES[emotionLabel] || '平稳日'

  return {
    emotionLabel,
    confidence: Number(confidence.toFixed(2)),
    insight: EMOTION_INSIGHT[emotionLabel],
    regulationTip: EMOTION_TIP[emotionLabel],
    productHint: EMOTION_PRODUCT[emotionLabel] || '',
    state,
    energy,
    keywords: extractKeywords(text),
    indexes: buildIndexes(emotionLabel, energy)
  }
}

/** 提取关键词 */
function extractKeywords(text) {
  const input = String(text || '')
  const found = []
  for (const [label, words] of Object.entries(EMOTION_KEYWORDS)) {
    words.forEach(w => {
      if (input.includes(w) && !found.includes(w)) found.push(w)
    })
  }
  if (found.length === 0 && input.trim()) {
    // 取前几个字作为占位关键词
    found.push(input.trim().slice(0, 6))
  }
  return found.length ? found : ['日常记录']
}

/** 五项能量指数（模拟，未来接硬件真实数据） */
function buildIndexes(emotionLabel, energy) {
  const jitter = () => Math.max(0, Math.min(100, Math.round(energy + (Math.random() * 10 - 5))))
  return {
    calmPower: jitter(), active: jitter(), think: jitter(), stable: jitter(), energy: energy
  }
}

/**
 * 智能情绪分析：优先豆包 LLM（结构化 JSON），失败/未配置时回退规则引擎。
 * @param {string} text 用户文本
 * @param {string} scene 场景
 * @returns {Promise<object>} 结构与 analyze() 一致
 */
async function analyzeSmart(text, scene) {
  // 1. 尝试豆包 LLM
  if (llmService.isAvailable() && text && text.trim().length > 1) {
    const llm = await llmService.analyzeEmotion(text)
    if (llm && llm.emotionLabel && EMOTION_KEYWORDS[llm.emotionLabel]) {
      const energy = llm.energy || EMOTION_ENERGY[llm.emotionLabel] || 70
      return {
        emotionLabel: llm.emotionLabel,
        confidence: llm.confidence,
        insight: llm.insight || EMOTION_INSIGHT[llm.emotionLabel],
        regulationTip: llm.regulationTip || EMOTION_TIP[llm.emotionLabel],
        productHint: EMOTION_PRODUCT[llm.emotionLabel] || '',
        state: STATE_TYPES[llm.emotionLabel] || '平稳日',
        energy,
        keywords: extractKeywords(text),
        indexes: buildIndexes(llm.emotionLabel, energy),
        fromLLM: true
      }
    }
  }

  // 2. 回退规则引擎
  const rule = analyze(text, scene)
  return Object.assign({}, rule, { fromLLM: false })
}

module.exports = { analyze, analyzeSmart, STATE_TYPES }
