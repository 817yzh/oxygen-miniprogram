/**
 * mock/health-scene-db.js
 * 场景 × 健康产品方案配置库(V0.7)
 *
 * 四大场景: 高原旅行 / 脑疲劳 / 运动恢复 / 银发陪伴
 * 每个场景绑定: 充氧宝产品 + 嗅吸配方 + 使用说明 + 推荐文案 + 聊天关键词
 *
 * 字段说明:
 *  id               场景英文标识
 *  sceneName        场景中文名(与打卡 scene 字段一致)
 *  icon             场景图标
 *  productName      对应产品名称
 *  productDesc      产品描述
 *  sniffFormula     嗅吸配方
 *  sniffDesc        配方功效
 *  usage            使用说明
 *  audience         适用人群
 *  suggestion       引导文案(首页卡片小字 / 报告推荐)
 *  chatKeywords     聊天触发关键词
 *  reportSuggestion 报告页推荐文案
 */
const SCENE_HEALTH_CONFIG = {
  '高原旅行': {
    id: 'high_altitude',
    sceneName: '高原旅行',
    icon: '🏔️',
    productName: 'Work Air 充氧宝 · 便携款',
    productDesc: '高原环境下快速提升血氧，缓解高反症状',
    sniffFormula: '高原安神配方（薄荷+尤加利）',
    sniffDesc: '缓解高反焦虑，稳定情绪',
    usage: '随身携带，出现高反症状时吸氧3-5分钟',
    audience: '进藏游客、高原徒步者、自驾旅行者',
    suggestion: '去高原怕高反？备一个充氧宝在包里，比硬扛安全多了。',
    chatKeywords: ['高反', '高原', '缺氧', '头晕', '去西藏'],
    reportSuggestion: '高原旅行：备好充氧宝，出现不适即用，别硬扛'
  },
  '脑疲劳': {
    id: 'brain_fatigue',
    sceneName: '脑疲劳',
    icon: '💻',
    productName: 'Work Air 充氧宝 · 桌面款 + 提神嗅吸',
    productDesc: '补充大脑供氧，缓解脑疲劳，提升专注力',
    sniffFormula: '提神醒脑配方（迷迭香+薄荷+柠檬）',
    sniffDesc: '提神醒脑，提升专注力',
    usage: '办公/学习时放置桌面，持续使用',
    audience: '白领、学生、备考人群、创意工作者',
    suggestion: '高强度用脑后吸10分钟，比喝咖啡管用，还不影响睡眠',
    chatKeywords: ['加班', '备考', '头昏', '效率低', '好累', '学不动'],
    reportSuggestion: '脑疲劳状态：试试桌面充氧宝 + 提神嗅吸，10分钟恢复专注'
  },
  '运动恢复': {
    id: 'sport_recovery',
    sceneName: '运动恢复',
    icon: '🏃',
    productName: 'Work Air 充氧宝 · 运动款 + 恢复嗅吸',
    productDesc: '加速乳酸清除，减轻运动后疲劳感',
    sniffFormula: '运动恢复配方（尤加利+薰衣草+柠檬）',
    sniffDesc: '加速身体恢复，舒缓肌肉',
    usage: '运动后立即使用10-15分钟',
    audience: '健身爱好者、跑者、骑行人群',
    suggestion: '练完吸10分钟，第二天肌肉不酸，状态恢复快一倍',
    chatKeywords: ['运动后', '肌肉酸', '恢复', '练完', '腿疼'],
    reportSuggestion: '运动后恢复：试试充氧宝 + 恢复嗅吸，加速身体修复'
  },
  '银发陪伴': {
    id: 'elderly',
    sceneName: '银发陪伴',
    icon: '👴',
    productName: 'Work Air 充氧宝 · 银发款 + 安神嗅吸',
    productDesc: '日常补氧保健，改善睡眠，缓解孤独焦虑',
    sniffFormula: '安神助眠配方（薰衣草+洋甘菊+檀香）',
    sniffDesc: '安神助眠，舒缓情绪',
    usage: '睡前使用，或日常居家使用',
    audience: '银发群体、活力老人、慢病管理人群',
    suggestion: '给爸妈备一个充氧宝，比说一百句"多保重"都实在',
    chatKeywords: ['爸妈', '老人', '失眠', '担心', '照顾'],
    reportSuggestion: '银发陪伴：安神嗅吸 + 日常补氧，给父母一份安心'
  }
}

/**
 * 根据场景名获取场景方案
 * @param {string} scene 场景中文名(与打卡/首页一致)
 * @returns {object|null}
 */
function getSceneConfig(scene) {
  if (!scene) return null
  return SCENE_HEALTH_CONFIG[scene] || null
}

/**
 * 根据聊天文本匹配场景(遍历 chatKeywords)
 * @param {string} text 聊天输入
 * @returns {object|null} { scene, config }
 */
function matchSceneByChat(text) {
  if (!text) return null
  for (const key of Object.keys(SCENE_HEALTH_CONFIG)) {
    const cfg = SCENE_HEALTH_CONFIG[key]
    const hit = (cfg.chatKeywords || []).find(kw => text.indexOf(kw) >= 0)
    if (hit) return { scene: key, config: cfg }
  }
  return null
}

module.exports = { SCENE_HEALTH_CONFIG, getSceneConfig, matchSceneByChat }
