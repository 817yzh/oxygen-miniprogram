/**
 * src/services/userService.js
 * 用户 + 打卡 + 成长 + 成就 核心业务服务
 */

const store = require('../db/store.js')
const { PERSONALITIES, GROWTH_RULES, GROWTH_LEVELS, LEVEL_REWARDS, ACHIEVEMENTS } = require('../db/static-data.js')
const emotionService = require('./emotionService.js')

/** 简易 ID（测试阶段：openid 或设备码） */
function normalizeUserId(raw) {
  const id = String(raw || '').trim()
  if (!id) return null
  // 脱敏：只保留安全字符
  return id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'guest'
}

/** 获取或创建用户（微信 openid 或测试 ID） */
function getOrCreateUser(userId) {
  const id = normalizeUserId(userId)
  if (!id) return null
  let user = store.findOne('users', { user_id: id })
  if (!user) {
    user = store.insert('users', {
      user_id: id,
      nickname: '氧友' + id.slice(0, 4),
      avatar: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    // 初始化成长数据
    store.insert('user_growth', {
      user_id: id,
      checkinDays: 0,
      experience: 0,
      growthLevel: 1,
      levelName: '氧气萌新',
      badge: '🌱',
      maxExperience: 100,
      oxDays: 0,
      lastOxDate: '',
      created_at: new Date().toISOString()
    })
  }
  return user
}

/** 用户画像聚合（对齐前端 getUserProfile） */
function getUserProfile(userId) {
  const user = getOrCreateUser(userId)
  if (!user) return null
  const id = user.user_id

  const personality = store.findOne('user_personality', { user_id: id })
  const growth = store.findOne('user_growth', { user_id: id }) || {}
  const preferences = store.findOne('user_preferences', { user_id: id })
  const achievements = store.find('user_achievements', { user_id: id })
  const checkins = store.find('checkin_records', { user_id: id }, { sort: 'date', order: 'desc', limit: 100 })

  // 人格详情
  let personalityDetail = null
  if (personality && personality.personality_id) {
    personalityDetail = PERSONALITIES[personality.personality_id] || null
  }

  return {
    user: { nickname: user.nickname, avatar: user.avatar },
    personality: personality ? Object.assign({}, personalityDetail, { id: personality.personality_id, type: personality.personality_id }) : null,
    growth: {
      checkinDays: growth.checkinDays || 0,
      experience: growth.experience || 0,
      growthLevel: growth.growthLevel || 1,
      levelName: growth.levelName || '氧气萌新',
      badge: growth.badge || '🌱',
      maxExperience: growth.maxExperience || 100,
      oxDays: growth.oxDays || 0
    },
    preferences: preferences || null,
    achievements: achievements.map(a => ({ id: a.achievement_id, unlockedAt: a.unlocked_at })),
    checkinCount: checkins.length,
    todayRecorded: hasTodayRecord(userId)
  }
}

/** 今日是否已打卡 */
function hasTodayRecord(userId) {
  const id = normalizeUserId(userId)
  if (!id) return false
  const today = new Date().toDateString()
  return !!store.findOne('checkin_records', { user_id: id, date: today })
}

/** 计算连续打卡天数 */
function calcContinuousDays(history) {
  if (!history || history.length === 0) return 0
  const dates = history.map(h => h.date).sort()
  const dateSet = new Set(dates)
  let count = 0
  const d = new Date()
  while (true) {
    const key = d.toDateString()
    if (dateSet.has(key)) { count++; d.setDate(d.getDate() - 1) } else break
  }
  return count
}

/** 增加成长值并处理升级 */
function gainExp(userId, amount) {
  const growth = store.findOne('user_growth', { user_id: userId })
  if (!growth) return null
  growth.experience = (growth.experience || 0) + amount
  // 升级判断
  const max = growth.maxExperience || 100
  let leveledUp = false
  while (growth.experience >= max && growth.growthLevel < 4) {
    growth.growthLevel += 1
    growth.experience -= max
    const lv = GROWTH_LEVELS.find(l => l.level === growth.growthLevel)
    if (lv) { growth.levelName = lv.name; growth.badge = lv.badge; growth.maxExperience = lv.maxExperience }
    leveledUp = true
  }
  growth.updated_at = new Date().toISOString()
  store.update('user_growth', { user_id: userId }, growth)
  return { growth, leveledUp }
}

/** 记录成长值明细 */
function logGrowth(userId, action) {
  const exp = GROWTH_RULES[action] || 0
  const labelMap = { checkin: '每日打卡', chat: '陪伴聊天', oxygen_test: '含氧感自测', scene_view: '查看场景', product_view: '查看产品', gift: '使用氧方案' }
  store.insert('growth_logs', {
    user_id: userId, action, label: labelMap[action] || action, exp,
    time: Date.now()
  })
  return exp
}

/** 成就检测：返回新解锁成就 */
function checkAchievements(userId, record) {
  const unlocked = store.find('user_achievements', { user_id: userId }).map(a => a.achievement_id)
  const newly = []
  const history = store.find('checkin_records', { user_id: userId })
  const growth = store.findOne('user_growth', { user_id: userId }) || {}
  const unlock = (id) => {
    if (!unlocked.includes(id)) {
      store.insert('user_achievements', { user_id: userId, achievement_id: id, unlocked_at: new Date().toISOString() })
      newly.push(id)
    }
  }

  if (history.length >= 1) unlock('first_checkin')
  if (record && record.recipe) unlock('first_recipe')
  const streak = calcContinuousDays(history)
  if (streak >= 3) unlock('streak_3')
  if (streak >= 5) unlock('streak_5')
  if (streak >= 7) unlock('streak_7')

  const scenes = new Set(history.map(h => h.scene).filter(Boolean))
  const allScenes = ['高原旅行', '脑疲劳', '运动恢复', '银发陪伴']
  if (allScenes.every(s => scenes.has(s))) unlock('scene_all')

  const chatCount = store.find('chat_messages', { user_id: userId }).length
  if (chatCount >= 10) unlock('chat_10')
  if (store.findOne('oxygen_test_reports', { user_id: userId })) unlock('oxygen_test')
  if (history.some(h => h.scene === '高原旅行')) unlock('plateau_guard')
  if (store.findOne('user_flags', { user_id: userId, flag: 'product_viewed' })) unlock('product_look')
  const oxDays = growth.oxDays || 0
  if (oxDays >= 7) unlock('ox_7day')
  if (oxDays >= 21) unlock('ox_21day')

  return newly
}

/** 记录使用氧方案一天 */
function logOxygenUse(userId) {
  const growth = store.findOne('user_growth', { user_id: userId })
  if (!growth) return null
  const today = new Date().toDateString()
  if (growth.lastOxDate !== today) {
    growth.oxDays = (growth.oxDays || 0) + 1
    growth.lastOxDate = today
    store.update('user_growth', { user_id: userId }, growth)
  }
  const exp = logGrowth(userId, 'gift')
  gainExp(userId, exp)
  return growth
}

/** 提交打卡记录 */
function submitCheckin(userId, payload) {
  const user = getOrCreateUser(userId)
  if (!user) return { error: '无效用户' }
  const id = user.user_id

  // 1. 情绪分析（文字或默认）
  const text = payload.text || ''
  const analysis = emotionService.analyze(text || '日常记录', payload.scene)

  // 2. 组装记录（对齐前端 record 结构）
  const today = new Date().toDateString()
  const scene = payload.scene || analysis.scene || ''
  const existing = store.findOne('checkin_records', { user_id: id, date: today })
  const record = {
    user_id: id,
    date: today,
    text: text || '（状态打卡）',
    scene,
    emotionLabel: analysis.emotionLabel,
    confidence: analysis.confidence,
    insight: analysis.insight,
    regulationTip: analysis.regulationTip,
    productHint: analysis.productHint,
    energy: analysis.energy,
    keyword: analysis.keywords[0] || analysis.emotionLabel,
    keywords: analysis.keywords,
    state: analysis.state,
    indexes: analysis.indexes,
    photo: payload.photo || '',
    physicalTags: payload.physicalTags || [],
    quick: !!payload.quick,
    created_at: new Date().toISOString()
  }

  let isNew = false
  if (existing) {
    store.update('checkin_records', { user_id: id, date: today }, record)
  } else {
    store.insert('checkin_records', record)
    isNew = true
    // 新打卡：成长值 + 天数
    const exp = logGrowth(id, 'checkin')
    const g = store.findOne('user_growth', { user_id: id })
    if (g) {
      g.checkinDays = (g.checkinDays || 0) + 1
      store.update('user_growth', { user_id: id }, g)
    }
    gainExp(id, exp)
  }

  // 3. 成就检测
  const newly = checkAchievements(id, record)

  return {
    record: Object.assign({ id: record.id, isNew }, record),
    newAchievements: newly,
    growth: store.findOne('user_growth', { user_id: id })
  }
}

/** 获取打卡记录列表 */
function getCheckins(userId, limit = 30) {
  return store.find('checkin_records', { user_id: userId }, { sort: 'date', order: 'desc', limit })
}

/** 保存人格结果 */
function setPersonality(userId, personalityId) {
  const user = getOrCreateUser(userId)
  if (!user) return null
  const p = PERSONALITIES[personalityId]
  if (!p) return { error: '未知人格类型' }
  const existing = store.findOne('user_personality', { user_id: user.user_id })
  const doc = {
    user_id: user.user_id,
    personality_id: personalityId,
    name: p.name, mbti: p.mbti, icon: p.icon,
    updated_at: new Date().toISOString()
  }
  if (existing) store.update('user_personality', { user_id: user.user_id }, doc)
  else store.insert('user_personality', doc)
  return doc
}

/** 保存偏好 */
function setPreferences(userId, prefs) {
  const user = getOrCreateUser(userId)
  if (!user) return null
  const existing = store.findOne('user_preferences', { user_id: user.user_id })
  const doc = Object.assign({ user_id: user.user_id, updated_at: new Date().toISOString() }, prefs)
  if (existing) store.update('user_preferences', { user_id: user.user_id }, doc)
  else store.insert('user_preferences', doc)
  return store.findOne('user_preferences', { user_id: user.user_id })
}

/** 记录聊天消息 */
function saveChatMessage(userId, role, content) {
  const user = getOrCreateUser(userId)
  if (!user) return null
  store.insert('chat_messages', {
    user_id: user.user_id, role, content,
    time: Date.now()
  })
  // 每次用户消息计成长值（chat）
  if (role === 'user') {
    const exp = logGrowth(user.user_id, 'chat')
    gainExp(user.user_id, exp)
  }
  return true
}

/** 获取成就列表（带解锁状态） */
function getAchievements(userId) {
  const unlocked = store.find('user_achievements', { user_id: userId }).map(a => a.achievement_id)
  return ACHIEVEMENTS.map(a => Object.assign({}, a, { unlocked: unlocked.includes(a.id) }))
}

/** 人格库 */
function getPersonalities() {
  return Object.values(PERSONALITIES)
}

module.exports = {
  getOrCreateUser, getUserProfile, hasTodayRecord, calcContinuousDays,
  submitCheckin, getCheckins, setPersonality, setPreferences,
  saveChatMessage, getAchievements, getPersonalities, logOxygenUse,
  gainExp, logGrowth, checkAchievements
}
