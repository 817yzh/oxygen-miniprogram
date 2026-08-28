/**
 * utils/checkinService.js
 * 打卡分析服务: 统一完成"分析 -> 保存记录 -> 供报告页读取"
 * V0.4: 接入 stateEngine 生成完整氧气状态报告 + mock 面部感知
 */
const app = getApp()
const emotionEngine = require('./emotionEngine')
const faceApi = require('./faceApi')
const stateEngine = require('./stateEngine')
const { RECIPE_DB } = require('../mock/recipe-db.js')
const { matchSceneByChat } = require('../mock/health-scene-db.js')

/**
 * 根据情绪+场景推荐食谱(V0.8)
 * 规则: 1.场景+情绪 2.场景 3.通用 4.随机
 */
function getRecommendedRecipe(emotion, scene) {
  if (!emotion && !scene) {
    const generic = RECIPE_DB.filter(r => r.matchScenes.length === 0)
    return generic[Math.floor(Math.random() * generic.length)] || RECIPE_DB[0]
  }
  // 优先场景+情绪
  let m = RECIPE_DB.find(r => r.matchScenes.length > 0 && r.matchScenes.includes(scene) && r.matchEmotions.includes(emotion))
  // 其次场景
  if (!m) m = RECIPE_DB.find(r => r.matchScenes.length > 0 && r.matchScenes.includes(scene))
  // 再次通用
  if (!m) m = RECIPE_DB.find(r => r.matchScenes.length === 0)
  // 最后随机
  if (!m) m = RECIPE_DB[Math.floor(Math.random() * RECIPE_DB.length)]
  return m
}

/**
 * 执行打卡分析(文字/拍照/面部)
 * @returns {Promise<object>} 返回 { result, record }
 */
function runCheckin() {
  const p = app.globalData.pendingCheckin || {}

  return new Promise((resolve) => {
    if (p.checkinType === 'photo') {
      // 拍照+面部感知(mock): happy/calm/tired
      faceApi.recognizeFace(p.photo, p.scene)
        .then(faceResult => resolve(commit(faceResult, p)))
        .catch(() => resolve(commit({ emotionLabel: '平静', confidence: 0.3 }, p)))
    } else {
      const r = emotionEngine.analyze(p.text, p.scene)
      resolve(commit(r, p))
    }
  })
}

function commit(result, pending) {
  const today = new Date().toDateString()

  // mock 面部情绪(拍照时才有效;文字模式随机趣味感知)
  const faceRandom = Math.random()
  let faceMood = ''
  if (pending.checkinType === 'photo') {
    const map = { happy: result.emotionLabel === '开心', calm: !['疲惫', '焦虑', '烦躁'].includes(result.emotionLabel), tired: ['疲惫', '低落'].includes(result.emotionLabel) }
    faceMood = map.happy ? 'happy' : map.tired ? 'tired' : 'calm'
  }

  // 用 stateEngine 生成完整氧气状态
  const report = stateEngine.buildStateReport({
    text: pending.text || '',
    scene: pending.scene || '',
    faceMood,
    physicalTags: pending.physicalTags || []
  })

  // V0.8 场景自动匹配: 若用户未选场景, 根据文本关键词自动判断
  let scene = pending.scene || ''
  if (!scene && pending.text) {
    const match = matchSceneByChat(pending.text)
    if (match) scene = match.scene
  }

  const energy = report.energy
  const record = {
    date: today,
    text: pending.text || '（拍照打卡）',
    scene,
    emotionLabel: result.emotionLabel || report.emotion,
    confidence: result.confidence,
    insight: report.insight,
    regulationTip: report.regulationTip,
    productHint: report.productHint,
    personaLine: report.personaLine,
    energy,
    keyword: report.keywords[0] || result.emotionLabel,
    keywords: report.keywords,
    state: report.state,
    suggestion: report.suggestion,
    indexes: report.indexes,
    faceMood,
    physicalTags: pending.physicalTags || [],
    // V0.8 今日健康食谱推荐
    recipe: getRecommendedRecipe(result.emotionLabel || report.emotion, scene)
  }
  const newly = app.addRecord(record)
  app.globalData.lastResult = result
  app.globalData.lastRecord = record
  // V0.8 本次新解锁的成就(供报告页横幅展示)
  app.globalData.newAchievements = newly || []
  return { result, record }
}

module.exports = { runCheckin, getRecommendedRecipe }
