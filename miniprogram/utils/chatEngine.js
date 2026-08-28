/**
 * utils/chatEngine.js
 * 氧氧陪伴聊天引擎 v1
 * MVP: 关键词匹配回复，不接真实模型
 * 后续: 替换为 LLM Prompt 调用(预留 API 结构)
 */

const { matchSceneByChat } = require('../mock/health-scene-db.js')
const { matchProduct } = require('../mock/product-db.js')

// V0.9 场景情境: 好累/头晕/睡不着/出差 → 共情 + 自然接产品建议
const SCENARIO_PROMPTS = [
  { words: ['好累', '累', '没力气', '疲惫', '透支', '精疲力尽'],
    empathy: '今天辛苦了，身体和大脑都在向你发信号呢。',
    tip: '长时间耗气，大脑容易缺氧闹“罢工”。留 3 分钟，让富氧空气帮你回回血～' },
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

// 关键词 -> 回复映射
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
];

// 兜底回复
const FALLBACK_REPLIES = [
  '氧氧在听。可以多和我说一点吗？💚',
  '我在呢。今天发生了什么，慢慢说 🫧',
  '无论什么感受，都值得被认真对待。你愿意再聊聊吗？🌱',
  '嗯嗯，我在听。然后呢？'
];

/**
 * 根据用户输入返回氧氧的回复
 * @param {string} text
 * @param {object} ctx 上下文(可选, 含 user/personality)
 * @returns {string}
 */
function reply(text, ctx) {
  if (!text || !text.trim()) {
    return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)]
  }
  const input = String(text).toLowerCase()
  ctx = ctx || {}
  const pref = ctx.preferences || {}

  // V0.9 场景情境优先: 好累/头晕/睡不着/出差 → 共情 + 自然接产品建议
  for (const sp of SCENARIO_PROMPTS) {
    if (sp.words.some(w => input.includes(w))) {
      // 根据偏好定制推荐款式
      let modelLine = ''
      if (pref.productModel) {
        modelLine = '（你记得自己喜欢' + pref.productModel + '，这个场景正合适）'
      }
      return sp.empathy + '\n\n💡 ' + sp.tip + (modelLine ? '\n' + modelLine : '') + '\n\n要不要看看你的专属补氧方案？点下方卡片即可 💚'
    }
  }

  // V0.8.1 产品知识库优先匹配(用户问产品时直接回答)
  const productAnswer = matchProduct(input)
  if (productAnswer) return productAnswer

  // 1. 关键词匹配(基础情绪回复)
  let base = ''
  for (const item of KEYWORD_REPLIES) {
    if (item.words.some(w => input.includes(w))) {
      base = item.reply
      break
    }
  }
  if (!base) {
    base = FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)]
  }

  // V0.7: 场景健康方案推荐(匹配到时追加)
  const sceneMatch = matchSceneByChat(input)
  if (sceneMatch) {
    // 场景推荐文案，追加在情绪回复之后
    return base + '\n\n💡 ' + sceneMatch.config.suggestion
  }

  return base
}

/**
 * 预留: LLM 接口(后续接入 DeepSeek/Claude)
 */
async function replyWithLLM(text, ctx) {
  // TODO: 接入真实 LLM API
  return reply(text, ctx)
}

module.exports = {
  reply,
  replyWithLLM
};
