/**
 * src/services/chatService.js
 * 氧氧陪伴聊天服务（对齐前端 utils/chatEngine.js + emotionService.js）
 * MVP: 关键词匹配回复；已接入豆包 LLM（replySmart），未配置/失败时自动回退规则引擎。
 */

const llmService = require('./llmService.js')

// 场景共情话术
const SCENARIO_PROMPTS = [
  { words: ['好累', '累', '没力气', '疲惫', '透支', '精疲力尽'],
    empathy: '今天辛苦了，身体和大脑都在向你发信号呢。',
    tip: '长时间耗气，大脑容易缺氧闹"罢工"。留 3 分钟，让富氧空气帮你回回血～' },
  { words: ['头晕', '头昏', '昏沉', '发晕'],
    empathy: '头晕昏沉的感觉确实不好受，别硬扛。',
    tip: '这往往是大脑短暂缺氧的信号。吸几口氧，让思路重新清亮起来。' },
  { words: ['睡不着', '失眠', '睡不好', '难入睡'],
    empathy: '越睡不着越着急，我懂这种晚上。',
    tip: '睡前放松呼吸、补充富氧，能帮身体放慢、更好入眠。安神嗅吸很适合你。' },
  { words: ['出差', '赶路', '出差中', '要飞'],
    empathy: '出差路上奔波，最容易透支状态。',
    tip: '带着便携款，高铁飞机上也能随时补氧，抵达时依然精神在线。' }
]

// 关键词 → 情绪回复
const KEYWORD_REPLIES = [
  { words: ['好累', '累', '没力气', '疲惫', '不想动'], reply: '今天辛苦啦，要不要记录一下今天的状态？氧氧陪着你 💚' },
  { words: ['开心', '高兴', '棒', '太好了', '不错', '爽'], reply: '听起来今天能量满满，为你开心！🌱' },
  { words: ['焦虑', '担心', '怕', '紧张', '不安'], reply: '试试先深呼吸，吸气4秒、呼气6秒，让自己慢下来 🌬️' },
  { words: ['难过', '伤心', '哭', '低落'], reply: '抱抱你。不管发生什么，氧氧都在这里陪着你 💚' },
  { words: ['烦', '烦躁', '受不了', '抓狂'], reply: '有点烦躁是正常的，先离开当下环境2分钟，喝口水吧 🍵' },
  { words: ['孤独', '一个人', '寂寞'], reply: '就算一个人，你也在好好照顾自己，这已经很棒了 💚' },
  { words: ['困', '想睡', '犯困'], reply: '困了就眯一会儿，休息是为了更好地出发 💤' },
  { words: ['累死', '透支', '废了'], reply: '你努力太久了，是时候让自己真正休息一下了 🛋️' },
  { words: ['你好', '在吗', '嗨', 'hi', 'hello'], reply: '你好呀！氧氧一直在，今天感觉怎么样？👋' },
  { words: ['早安', '早上好', '早'], reply: '早上好呀！今天也要记得照顾自己的能量哦 ☁️' },
  { words: ['晚安', '睡了', '再见'], reply: '晚安，做个好梦，氧氧守护着你 🌙' }
]

const FALLBACK_REPLIES = [
  '氧氧在听。可以多和我说一点吗？💚',
  '我在呢。今天发生了什么，慢慢说 🫧',
  '无论什么感受，都值得被认真对待。你愿意再聊聊吗？🌱',
  '嗯嗯，我在听。然后呢？'
]

// 产品 FAQ 关键词（简化版，详情可扩展 product-db）
const PRODUCT_FAQ = [
  { words: ['多少钱', '价格', '怎么卖'], reply: '充氧宝目前有零售款和租赁款，具体价格可以看「充氧宝」页面的选型对比～' },
  { words: ['原理', '怎么制氧', '什么技术'], reply: '充氧宝采用分子筛富氧技术，小巧便携，一键即可输出高浓度富氧空气。' },
  { words: ['多重', '重量', '重吗'], reply: '主机约 280g，比手机稍重一点点，随身携带无压力。' },
  { words: ['续航', '电能用多久', '充电'], reply: 'Type-C 快充，满电续航约 8 小时，日常使用很够。' },
  { words: ['耗材', '胶囊', '怎么换'], reply: '采用可替换的香氛嗅吸胶囊，使用周期到后轻松更换即可。' },
  { words: ['高原', '高反', '拉萨'], reply: '高原场景正是充氧宝的主场，能帮助缓解高反、提升血氧，进藏建议随身带。' },
  { words: ['上飞机', '能不能带', '安检'], reply: '采用分子筛物理制氧，符合常见便携设备的携带规范，出行前建议跟航司确认。' },
  { words: ['安全', '有没有副作用'], reply: '按说明书规范使用即可，产品符合相关安全标准。健康建议仅供参考，不替代医嘱。' },
  { words: ['老人', '父母', '长辈'], reply: '银发陪伴场景很合适，操作一键即可，日常补氧保健很省心。' }
]

/** 产品知识匹配 */
function matchProduct(text) {
  const input = String(text || '').toLowerCase()
  for (const item of PRODUCT_FAQ) {
    if (item.words.some(w => input.includes(w))) return item.reply
  }
  return null
}

/** 场景匹配（健康方案推荐） */
function matchScene(text) {
  const input = String(text || '').toLowerCase()
  const map = [
    { words: ['拉萨', '高反', '高原', '进藏', '西藏'], scene: 'high_altitude', suggestion: '高原旅行补氧方案，帮你缓解高反 🏔️' },
    { words: ['加班', '熬夜', '用脑', '开会', '学习', '写论文'], scene: 'brain_fatigue', suggestion: '脑疲劳补氧方案，提升专注力 🧠' },
    { words: ['跑步', '健身', '运动', '打球', '训练'], scene: 'sport_recovery', suggestion: '运动恢复补氧方案，加速体能恢复 🏃' },
    { words: ['老人', '父母', '长辈', '家里'], scene: 'elderly', suggestion: '银发陪伴补氧方案，日常保健 🫶' }
  ]
  for (const m of map) {
    if (m.words.some(w => input.includes(w))) return m
  }
  return null
}

/**
 * 生成氧氧回复
 * @param {string} text 用户输入
 * @param {object} ctx { userName, personality, preferences, scene }
 * @returns {object} { replyText, emotion, isProduct, productHint, regulationTip, insight, scene }
 */
function reply(text, ctx = {}) {
  const input = String(text || '').trim()
  if (!input) {
    return { replyText: FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)], emotion: null }
  }
  const lower = input.toLowerCase()

  // 1. 场景共情优先
  for (const sp of SCENARIO_PROMPTS) {
    if (sp.words.some(w => lower.includes(w))) {
      return { replyText: sp.empathy + '\n\n💡 ' + sp.tip + '\n\n要不要看看你的专属补氧方案？💚', emotion: '疲惫', scene: matchScene(input) }
    }
  }

  // 2. 产品知识
  const productAnswer = matchProduct(input)
  if (productAnswer) {
    return { replyText: productAnswer, emotion: null, isProduct: true }
  }

  // 3. 关键词情绪回复
  let base = FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)]
  for (const item of KEYWORD_REPLIES) {
    if (item.words.some(w => lower.includes(w))) { base = item.reply; break }
  }

  // 4. 场景方案追加
  const sceneMatch = matchScene(input)
  let replyText = base
  if (sceneMatch) replyText = base + '\n\n💡 ' + sceneMatch.suggestion

  return { replyText, emotion: null, scene: sceneMatch }
}

/** LLM 是否可用（读豆包配置） */
function isLLMAvailable() {
  return llmService.isAvailable()
}

/**
 * 智能回复：优先走豆包 LLM（带氧氧人格），失败/未配置时回退规则引擎。
 * @param {string} text 用户输入
 * @param {object} ctx 上下文
 * @returns {Promise<object>} { replyText, emotion, isProduct, scene, fromLLM }
 */
async function replySmart(text, ctx = {}) {
  const input = String(text || '').trim()
  const lower = (input || '').toLowerCase()

  // 1. 产品 FAQ 优先（规则引擎，快且准确）
  const productAnswer = matchProduct(input)
  if (productAnswer) {
    return { replyText: productAnswer, emotion: null, isProduct: true, fromLLM: false }
  }

  // 2. 其余一律先走豆包 LLM（智能共情/建议），失败再回退规则
  if (llmService.isAvailable()) {
    const llmText = await llmService.chat(input, ctx)
    if (llmText) {
      return { replyText: llmText, emotion: null, fromLLM: true }
    }
  }

  // 3. 豆包不可用/失败 → 回退完整规则引擎
  const rule = reply(input, ctx)
  return Object.assign({}, rule, { fromLLM: false })
}

module.exports = { reply, replySmart, matchProduct, matchScene, isLLMAvailable }
