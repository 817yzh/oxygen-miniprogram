/**
 * mock/scene-board-db.js
 * 今日氧气场景 · 场景看板数据(V0.8)
 *
 * 首页「今日氧气场景」改为场景卡片：不再是普通宫格按钮，
 * 每张卡片展示: 场景名称 + 状态文案 + 氧需求指数(星星) + 推荐方案 + 今日倾向
 *
 * 数据复用 health-scene-db.js 的产品/嗅吸方案，这里补充看板展示层字段。
 */

/**
 * 场景看板卡片结构
 * @returns {Array<{key,scene,icon,title,desc,oxygenLevel,oxygenStars,product,aroma,action,primary}>}
 */
function getSceneBoard() {
  return [
    {
      key: 'brain', scene: '脑力', icon: '🧠',
      title: '脑力模式',
      desc: '今日学习压力较高，大脑需要补一口氧',
      oxygenLevel: '★★★★', stars: 4,
      product: '桌面款 + 提神嗅吸',
      action: '推荐方案 →'
    },
    {
      key: 'sport', scene: '运动', icon: '🏃',
      title: '运动模式',
      desc: '练后恢复期，给肌肉一次高效补氧',
      oxygenLevel: '★★★', stars: 3,
      product: '运动款 + 恢复嗅吸',
      action: '查看方案 →'
    },
    {
      key: 'plateau', scene: '高原', icon: '🏔️',
      title: '高原模式',
      desc: '差旅/进藏出行，便携补氧更安心',
      oxygenLevel: '★★★★★', stars: 5,
      product: '便携款 + 高原安神',
      action: '查看方案 →'
    },
    {
      key: 'elder', scene: '银发', icon: '👴',
      title: '银发陪伴',
      desc: '给父母日常补氧，一份安稳的礼物',
      oxygenLevel: '★★★', stars: 3,
      product: '银发款 + 安神嗅吸',
      action: '查看方案 →'
    }
  ]
}

module.exports = { getSceneBoard }
