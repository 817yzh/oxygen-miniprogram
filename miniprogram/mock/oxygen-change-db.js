/**
 * mock/oxygen-change-db.js
 * 我的氧气变化 · 使用前后对比(V0.8)
 *
 * 首页「吸氧变化对比」组件数据：
 *   使用前 / 使用后：疲劳感↓、专注力↑、活力值↑
 *
 * 初期为模拟体验(前后都是 mock)，UI 明确标注"模拟数据"；
 * 未来支持真实传感器/使用记录接入。
 */

/** 维度定义：label + 方向(减负增优) + 前后值 */
const CHANGE_DIMENSIONS = () => [
  { key: 'tired',   label: '疲劳感', before: 80, after: 42, unit: '%' },
  { key: 'focus',   label: '专注力', before: 46, after: 85, unit: '%' },
  { key: 'vigor',   label: '活力值', before: 52, after: 84, unit: '%' }
]

/** 各维度前后变化幅度(数值可随场景微调) */
const SCENE_DELTA = {
  '脑力': { tiredBefore: 4, focusAfter: 5 },
  '运动': { vigorAfter: 6 },
  '高原': { tiredBefore: 6 },
  '银发': { focusAfter: 3 }
}

/**
 * 生成吸氧前后对比
 * @param {string} [scene]
 * @returns {{dimensions:Array<{key,label,before,after,unit,deltaText}>, note:String}}
 */
function getOxygenChange(scene) {
  const d = SCENE_DELTA[scene] || {}
  const dimensions = CHANGE_DIMENSIONS().map(x => {
    const before = Math.max(10, Math.min(96, x.before + (d[x.key+'Before'] || 0) + Math.floor(Math.random()*6)))
    let after = Math.max(20, Math.min(98, x.after + (d[x.key+'After'] || 0)))
    // 疲劳感是"下降=好"，其余是"上升=好"；保证 after 相对 before 是改善方向
    if (x.key === 'tired') after = Math.min(before - 25, after)
    else after = Math.max(before + 20, after)
    return {
      key: x.key, label: x.label, before, after, unit: '%',
      deltaText: x.key === 'tired' ? `↓${before - after}` : `↑${after - before}`
    }
  })
  return {
    dimensions,
    note: '当前为模拟体验数据，后续支持真实使用记录接入'
  }
}

module.exports = { getOxygenChange }
