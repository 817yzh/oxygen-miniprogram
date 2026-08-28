/**
 * mock/oxygen-map-db.js
 * 今日氧气地图 · 四维状态数据(V0.8)
 *
 * 首页「今日氧气地图」四指标：
 *   情绪能量 / 身体含氧感 / 活力指数 / 恢复状态
 *
 * 初期 mock 随机生成 + 可叠加场景倾向；未来支持设备/传感器数据接入。
 */

// 四指标基础名(K=V0.7 已有的前两项保持命名一致，便于后续替换)
const MAP_METRICS = [
  { key: 'emotion',  label: '情绪能量', icon: '🌱' },
  { key: 'oxygen',   label: '身体含氧感', icon: '🫁' },
  { key: 'vigor',    label: '活力指数',   icon: '⚡' },
  { key: 'recover',  label: '恢复状态',   icon: '🌙' }
]

/** 场景倾向修正：不同场景初始各维度更偏哪个 */
const SCENE_BIAS = {
  '高原':  { vigor: -8, oxygen: 6 },
  '脑力':  { emotion: 4, vigor: -6, recover: 2 },
  '运动':  { vigor: -10, recover: 8, oxygen: 4 },
  '银发':  { recover: -4, oxygen: 4 }
}

// 状态标签(用于地图下方的引导文案)
const STATE_HINT = {
  high: '状态在线，保持这个好节奏 ☁️',
  mid:  '有点起伏，今天值得给自己补一口氧',
  low:  '身体在提醒：该好好充充电啦 🌫'
}

/**
 * 生成今日氧气地图
 * @param {string} [scene] 四大场景名(可选，用于倾向)
 * @returns {{metrics:Array, level:'high'|'mid'|'low', hint:String}}
 */
function getOxygenMap(scene) {
  const bias = SCENE_BIAS[scene] || {}
  const metrics = MAP_METRICS.map(m => {
    // 随机基础值(55-90)，叠加场景倾向，clamp 40-98
    let v = 55 + Math.floor(Math.random() * 36)
    if (bias[m.key]) v += bias[m.key]
    v = Math.max(40, Math.min(98, v))
    return { key: m.key, label: m.label, icon: m.icon, value: v }
  })

  // 综合水平 = 四维均值
  const avg = metrics.reduce((s, m) => s + m.value, 0) / metrics.length
  const level = avg >= 78 ? 'high' : (avg >= 60 ? 'mid' : 'low')
  return { metrics, level, hint: STATE_HINT[level] }
}

module.exports = { MAP_METRICS, getOxygenMap }
