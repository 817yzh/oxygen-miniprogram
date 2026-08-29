/**
 * utils/stateEngine.js
 * V0.4 情绪健康增强：基于情绪结果 + 场景 + MBTI 人格 + mock 面部，
 * 生成"今日氧气状态"五字段(energy/emotion/keywords/state/suggestion) + 五项能量指数。
 *
 * 定位：趣味陪伴，非心理诊断。文案用"趣味感知"口吻。
 */

// 各情绪的"今日状态类型"
const STATE_TYPES = {
  '开心': '元气日',
  '平静': '平稳日',
  '放松': '松弛日',
  '疲惫': '待充电日',
  '焦虑': '波动日',
  '烦躁': '升温日',
  '低落': '低气压日',
  '紧张': '紧绷日',
  '孤独': '思念日'
}

// 情绪 → 关键词
const KEYWORD_MAP = {
  '开心': ['元气', '阳光', '好心情'],
  '平静': ['平稳', '自洽', '节奏稳'],
  '放松': ['松弛', '舒展', '自在'],
  '疲惫': ['电量低', '需要休息', '慢下来'],
  '焦虑': ['紧绷', '深呼吸', '找回平静'],
  '烦躁': ['降降温', '暂停', '理清思绪'],
  '低落': ['照顾自己', '温柔以待', '慢慢来'],
  '紧张': ['稳住', '放轻松', '深呼吸'],
  '孤独': ['被牵挂', '勇敢陪伴', '打开心窗']
}

// 情绪 → 健康建议(趣味化，非诊断)
const HEALTH_TIPS = {
  '开心': '记得把这份好心情分享给在乎的人 🌟',
  '平静': '保持这个节奏，就是最好的充氧方式 🍃',
  '放松': '偶尔的松弛是给身体的礼物 ☕',
  '疲惫': '闭目养神5分钟，让身体自己恢复 🛋️',
  '焦虑': '试试4-4-6呼吸法：吸气4秒、屏息4秒、呼气6秒 🫧',
  '烦躁': '离开原地喝口水，给自己2分钟放空 💧',
  '低落': '做一件让你微笑的小事，就一件 🌱',
  '紧张': '把肩膀放松，做3次深呼吸 🧘',
  '孤独': '给自己冲杯热饮，你看，你一直都在好好照顾自己 ☕'
}

// 情绪 → 活跃度相对值(0-100)
const ENERGY_MAP = {
  '开心': 85,
  '平静': 60,
  '放松': 45,
  '疲惫': 25,
  '焦虑': 70,
  '烦躁': 75,
  '低落': 30,
  '紧张': 65,
  '孤独': 35
}

/**
 * 生成五项能量指数 mock（基于情绪 + 场景 + 稳定性）
 * @param {string} emotion 情绪标签
 * @param {string} scene 场景
 * @returns {object} { calmPower, active, think, stable, energy }
 */
function buildIndexes(emotion, scene) {
  const base = ENERGY_MAP[emotion] !== undefined ? ENERGY_MAP[emotion] : 50
  // 用情绪映射几个维度
  const negative = ['焦虑', '烦躁', '疲惫', '低落', '紧张', '孤独']
  const isNeg = negative.includes(emotion)

  return {
    calmPower: isNeg ? Math.max(20, 90 - base) : Math.min(95, 60 + base * 0.3), // 平静力
    active: base,                                                              // 活跃度
    think: emotion === '疲惫' ? 30 : emotion === '焦虑' ? 85 : 55 + (isNeg ? -5 : 15), // 思考量
    stable: isNeg ? Math.max(25, 85 - base) : 70,                              // 情绪稳定
    energy: base                                                               // 精力值
  }
}

/**
 * 生成完整"今日氧气状态"报告(五字段)
 * @param {object} opts { text, scene, personality, faceMood }
 * @returns {object} report
 */
function buildStateReport(opts) {
  const emotionEngine = require('../../../utils/emotionEngine')
  const emo = emotionEngine.analyze(opts.text || '', opts.scene || '')
  const emotion = emo.emotionLabel || '平静'

  // 身心联合建议(V0.6): 身体标签 + 情绪
  let suggestion = HEALTH_TIPS[emotion] || HEALTH_TIPS['平静']
  const tags = opts.physicalTags || []
  const negative = ['焦虑', '烦躁', '疲惫', '低落', '紧张', '孤独']
  if (tags.length > 0 && negative.includes(emotion)) {
    suggestion = '身体和心情都有点累，今晚建议早点休息，给身心一起充充电 🛌'
  } else if (tags.includes('疲惫') || tags.includes('精力不足')) {
    suggestion = '身体发出信号了，记得安排一段不被打扰的休息时间 🛋️'
  } else if (tags.includes('眼睛酸胀') || tags.includes('头昏')) {
    suggestion = '眼睛和大脑都需要休息，试试远眺或闭目5分钟 👀'
  }

  // 能量值：基于情绪 + 面部
  let energy = emo.confidence ? Math.round(emo.confidence * 100) : 50
  // 面部补充
  if (opts.faceMood === 'happy') energy = Math.min(100, energy + 10)
  else if (opts.faceMood === 'tired') energy = Math.max(5, energy - 15)
  if (emo.hasExtremeContent) energy = 20

  return {
    energy,
    emotion,
    keywords: KEYWORD_MAP[emotion] || ['平稳', '自洽'],
    state: STATE_TYPES[emotion] || '平稳日',
    suggestion,
    indexes: buildIndexes(emotion, opts.scene),
    insight: emo.insight,
    personaLine: emo.personaLine,
    regulationTip: emo.regulationTip,
    productHint: emo.productHint
  }
}

module.exports = { buildStateReport, buildIndexes, STATE_TYPES, KEYWORD_MAP, HEALTH_TIPS }
