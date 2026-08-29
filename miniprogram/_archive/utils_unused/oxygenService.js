/**
 * utils/oxygenService.js
 * 氧状态分析服务(统一分析接口)
 *
 * 作用：把打卡状态/氧气地图/场景偏好 + 方案/音疗/产品 统一串成一次"氧分析"，
 *       供氧氧 chat、健康档案、未来硬件/设备调度统一调用。
 *
 * 设计：薄封装，不重复造数据——方案用 personality-product-map /
 *       音疗用 sound-therapy-db / 产品用 product-db。这里是"分析+推荐"编排层。
 */

const { getUserProfile } = require('../mock/user-profile-db.js')
const { getPersonalityProduct } = require('../../pages/share/mock/personality-product-map.js)
const { SCENE_SOUNDS } = require('../mock/sound-therapy-db.js')

/** 场景 → 音疗建议 */
const SCENE_SOUND_MAP = {
  '高原旅行': 'relax',   // 减压舒缓
  '脑疲劳': 'focus',     // 专注提神
  '运动恢复': 'energy',  // 元气唤醒
  '银发陪伴': 'sleep',   // 助眠安神
  '失眠': 'sleep'
}

/** 场景 → 产品方案文案 */
const SCENE_PRODUCT_MAP = {
  '高原旅行': 'Work Air 充氧宝 · 高原便携款',
  '脑疲劳': 'Work Air 充氧宝 · 桌面款',
  '运动恢复': 'Work Air 充氧宝 · 运动款',
  '银发陪伴': 'Work Air 充氧宝 · 便携款'
}

/**
 * 分析用户当前氧状态，输出综合建议
 * @returns {object} { status, scene, energy, suggestion, toneSound, product, plan }
 */
function analyzeOxygen() {
  const profile = getUserProfile()
  const os = profile.oxygenState || {}
  const basic = profile.basicInfo || {}
  const scene = os.scene || ''
  const energy = os.energy || 0

  // 状态解读
  const status = interpret(energy, os.emotion, scene)

  // 推荐音疗
  const soundKey = SCENE_SOUND_MAP[scene] || (energy < 60 ? 'sleep' : 'relax')
  const toneSound = SCENE_SOUNDS.find(s => s.key === soundKey) || SCENE_SOUNDS[0]

  // 推荐产品(人格优先, 兜底场景)
  let product = null
  if (profile.personality && profile.personality.type) {
    const pp = getPersonalityProduct(profile.personality.type)
    product = { name: pp.product, aroma: pp.aromaDesc || pp.aroma }
  } else if (scene) {
    product = { name: SCENE_PRODUCT_MAP[scene] || 'Work Air 充氧宝 · 便携款', aroma: '清新提神嗅吸' }
  }

  // 建议文案
  const suggestion = buildSuggestion(status, scene, basic.age)

  return {
    status,
    scene,
    energy,
    suggestion,
    toneSound: toneSound ? { name: toneSound.name, icon: toneSound.icon } : null,
    product,
    plan: [
      { step: 1, text: '先记录今日状态，生成氧气地图' },
      { step: 2, text: '根据场景匹配专属氧方案' },
      { step: 3, text: '配合音疗冥想，放松身心' },
      { step: 4, text: '使用充氧宝补氧，观察状态变化' }
    ]
  }
}

/** 状态解读 */
function interpret(energy, emotion, scene) {
  if (emotion && emotion !== '平静') {
    const map = { '疲惫': '今日能量偏低，需要补充恢复', '焦虑': '氧气节奏偏紧，建议放慢深呼吸', '开心': '状态在线，保持好心情', '低落': '给自己一点温柔，补一点氧' }
    if (map[emotion]) return { level: emotion === '开心' ? 'good' : 'need', label: emotion, text: map[emotion] }
  }
  if (energy >= 80) return { level: 'good', label: '充沛', text: '氧气状态充沛，保持良好节奏' }
  if (energy >= 60) return { level: 'ok', label: '平稳', text: '状态平稳，注意劳逸结合' }
  return { level: 'need', label: '偏低', text: '能量偏低，建议补氧+休息恢复' }
}

/** 生成建议文案 */
function buildSuggestion(status, scene, age) {
  let s = status.text
  if (scene) s += '，当前在「' + scene + '」场景'
  if (age && age >= 50) s += '，注意多休息、及时补氧'
  return s
}

module.exports = { analyzeOxygen }
