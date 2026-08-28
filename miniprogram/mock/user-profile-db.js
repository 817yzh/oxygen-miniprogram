/**
 * mock/user-profile-db.js
 * 统一用户画像 · 聚合层(⭐核心)
 *
 * 作用：把分散的 wx Storage / app.globalData 聚合成一份"统一用户画像"，
 *       供氧气档案页、AI陪伴、未来硬件/健康数据统一对接。
 *
 * 设计原则：
 *  1. 不推翻现有存储——只是"读聚合"，不新建第二套写路径
 *  2. 数据结构提前设计好(与硬件/设备/AI 的对接位)
 *  3. 只读聚合 + 少量便捷更新，不破坏已有打卡/MBTI/报告流程
 */

/** 读取 app 全局 */
function getAppGlobal() {
  try { return getApp().globalData } catch (e) { return {} }
}

/**
 * 聚合完整用户画像
 * @returns {object} 统一画像 { basicInfo, personality, oxygenState, memory, history }
 */
function getUserProfile() {
  const g = getAppGlobal()
  const user = g.user || {}
  const mbti = g.mbtiResult || {}
  const companion = g.companion || {}
  const history = g.emotionHistory || []
  const prefs = _readPrefs()

  // 基础信息(从 user + companion 聚合)
  const basicInfo = {
    nickname: user.name || user.nickName || '氧友',
    avatar: user.avatar || '',
    gender: user.gender || '',
    birthday: user.birthday || '',
    age: user.age || _calcAge(user.birthday) || '',
    zodiac: mbti.zodiac || '',
    fiveElements: mbti.fiveElements || ''
  }

  // 氧气人格
  const personality = {
    type: mbti.type || mbti.typeName || '',
    name: mbti.typeName || mbti.name || '',
    icon: mbti.icon || '🫧',
    mbti: mbti.mbti || '',
    color: mbti.color || '',
    tags: mbti.tags || []
  }

  // 氧气状态(今日/最近一次打卡派生)
  const todayRecord = g.todayRecord || history[history.length - 1] || {}
  const oxygenState = {
    energy: todayRecord.energy || 70,
    oxygenFeel: todayRecord.oxygenFeel || 0,
    vitality: todayRecord.vitality || 0,
    recovery: todayRecord.recovery || 0,
    scene: todayRecord.scene || '',
    emotion: todayRecord.emotionLabel || todayRecord.emotion || '',
    state: todayRecord.state || todayRecord.insight || '',
    lastChecked: todayRecord.date || ''
  }

  // 氧氧记忆(偏好)
  const memory = {
    productModel: prefs.productModel || '',
    productPref: prefs.productModel || '',
    device: prefs.deviceModel || '',
    parentsAge: prefs.parentAge || '',
    highlandFreq: prefs.highlandFreq || '',
    sleepPattern: prefs.sleepPattern || '',
    habits: prefs.habits || [],
    concerns: prefs.concerns || []
  }

  // 历史(打卡/趋势/方案)
  const historyData = history.slice(-7) // 近7天
  const historyProfile = {
    checkins: history.map(h => ({ date: h.date, scene: h.scene, emotion: h.emotionLabel || h.emotion, energy: h.energy })),
    trends7d: historyData.reverse(),
    checkinDays: companion.checkinDays || 0,
    streak: _calcStreak(history),
    growthLevel: companion.growthLevel || 1,
    levelName: companion.levelName || '氧气萌新',
    exp: companion.experience || 0
  }

  return { basicInfo, personality, oxygenState, memory, history: historyProfile }
}

/** 读取偏好 */
function _readPrefs() {
  try { return wx.getStorageSync('yyb_preferences') || {} } catch (e) { return {} }
}

/** 由生日推导年龄 */
function _calcAge(birthday) {
  if (!birthday) return ''
  const b = new Date(birthday)
  if (isNaN(b.getTime())) return ''
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}

/** 连续打卡天数 */
function _calcStreak(history) {
  if (!history || !history.length) return 0
  const dates = history.map(h => h.date).sort()
  const set = new Set(dates)
  let count = 0
  const d = new Date()
  while (true) {
    const key = d.toDateString()
    if (set.has(key)) { count++; d.setDate(d.getDate() - 1) }
    else break
  }
  return count
}

/**
 * 便捷：把一份基础信息写回(兼容不破坏现有)
 * @param {object} patch 形如 { name, gender, birthday } 或完整 basicInfo
 */
function patchBasicInfo(patch) {
  const g = getAppGlobal()
  const user = Object.assign({}, g.user || {}, patch)
  g.user = user
  if (getApp().setUser) getApp().setUser(user)
  wx.setStorageSync('yyb_user', user)
  return user
}

/**
 * 便捷：写偏好(wx Storage yyb_preferences)
 * 作用等同 app.setPreference 但更直接
 */
function patchPreference(key, value) {
  const p = _readPrefs()
  p[key] = value
  wx.setStorageSync('yyb_preferences', p)
  return p
}

module.exports = {
  getUserProfile,
  patchBasicInfo,
  patchPreference
}
