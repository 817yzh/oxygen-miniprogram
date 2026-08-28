/**
 * mock/oxygen-suggestion-db.js
 * 今日氧气建议(V0.8)
 *
 * 用途：根据 情绪状态 + 打卡结果 + 氧气地图 生成推荐建议。
 * 初期全部 mock：按情绪/场景返回建议卡，供首页「今日氧气建议」组件展示。
 * 预留：未来接 设备数据 / 用户反馈数据 / 真实AI。
 */

/** 场景→建议 映射(按氧负荷/情绪倾向) */
const SUGGESTION_POOL = [
  {
    key: 'brain',
    icon: '🧠',
    title: '脑力恢复',
    scene: 'brain',
    desc: '检测到脑力消耗较高',
    tip: '大脑高强度运转后，建议留 3 分钟富氧放松，帮思路重新清亮。',
    product: 'Work Air 充氧宝 · 桌面款',
    productHint: '桌面补氧 · 提神不添堵'
  },
  {
    key: 'plateau',
    icon: '🏔️',
    title: '高原适应',
    scene: 'plateau',
    desc: '检测到状态受海拔影响',
    tip: '高原环境下身体耗氧增加，随身补氧能快速缓解头晕、稳情绪。',
    product: 'Work Air 充氧宝 · 高原便携款',
    productHint: '便携随身 · 缓解高反'
  },
  {
    key: 'sport',
    icon: '🏃',
    title: '运动恢复',
    scene: 'sport',
    desc: '检测到运动后的恢复需求',
    tip: '运动后肌肉耗氧大，建议轻度补氧帮助加速恢复、缓解乳酸。',
    product: 'Work Air 充氧宝 · 运动款',
    productHint: '运动恢复 · 加速回血'
  },
  {
    key: 'elder',
    icon: '👴',
    title: '银发保健',
    scene: 'elder',
    desc: '检测到日常保健需求',
    tip: '居家日常补氧，帮助改善睡眠、保持头脑清明，给生活充点氧。',
    product: 'Work Air 充氧宝 · 银发款',
    productHint: '陪伴保健 · 安心居家'
  },
  {
    key: 'tired',
    icon: '🥱',
    title: '疲劳缓解',
    scene: 'general',
    desc: '检测到整体能量偏低',
    tip: '身体在提醒你休息啦，试试闭目养神 5 分钟 + 轻嗅吸氧回回血。',
    product: 'Work Air 充氧宝 · 桌面款',
    productHint: '物理提神 · 缓解疲劳'
  },
  {
    key: 'calm',
    icon: '🌿',
    title: '平稳续航',
    scene: 'general',
    desc: '今日状态平稳',
    tip: '平稳就是最好的充氧节奏，继续保持规律作息，别让大脑透支哦。',
    product: '',
    productHint: '规律作息 · 稳固状态'
  }
]

/**
 * 根据今日状态生成建议
 * @param {object} opts { emotion(情绪), scene(场景), energy(能量分) }
 * @returns {object} 建议卡
 */
function getSuggestion(opts = {}) {
  const scene = opts.scene || ''
  const energy = opts.energy || 70

  // 1. 有明确场景 → 优先该场景建议
  if (scene) {
    const hit = SUGGESTION_POOL.find(s => s.scene === scene)
    if (hit) return hit
  }
  // 2. 能量偏低 → 疲劳缓解
  if (energy < 60) {
    return SUGGESTION_POOL.find(s => s.key === 'tired')
  }
  // 3. 否则平稳续航
  return SUGGESTION_POOL.find(s => s.key === 'calm')
}

module.exports = { SUGGESTION_POOL, getSuggestion }
