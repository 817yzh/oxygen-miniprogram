// app.js
// 氧氧宝 · 氧系MBTI AI情绪陪伴小程序
const { GROWTH_LEVELS, MOCK_USER_COMPANION } = require('./mock/data.js')
const { ACHIEVEMENT_DEFS, GROWTH_RULES, LEVEL_REWARDS } = require('./mock/achievement-db.js') // V0.7 成就库
const { DEFAULT_PREFERENCES } = require('./mock/preferences-db.js') // V0.9 氧氧记忆

App({
  globalData: {
    user: null,           // 用户信息
    mbtiResult: null,     // MBTI测试结果
    todayRecord: null,    // 今日情绪记录
    emotionHistory: [],   // 历史情绪记录
    companion: null,      // 陪伴/成长数据
    achievements: [],     // V0.8 已解锁成就(id数组)
    growthLog: []         // V0.7 成长值明细(行为记录)
  },

  onLaunch() {
    const user = wx.getStorageSync('yyb_user') || null
    const mbti = wx.getStorageSync('yyb_mbti') || null
    const history = wx.getStorageSync('yyb_history') || []
    // 成长数据(读不到时用 mock 初始值)
    let companion = wx.getStorageSync('yyb_companion') || null
    if (!companion) {
      companion = { ...MOCK_USER_COMPANION }
    }

    this.globalData.user = user
    this.globalData.mbtiResult = mbti
    this.globalData.emotionHistory = history
    this.globalData.companion = companion
    this.globalData.achievements = wx.getStorageSync('yyb_achievements') || []
    this.globalData.growthLog = wx.getStorageSync('yyb_growth_log') || []

    const today = new Date().toDateString()
    const todayRecord = history.find(h => h.date === today) || null
    this.globalData.todayRecord = todayRecord
  },

  // 保存用户
  setUser(user) {
    this.globalData.user = user
    wx.setStorageSync('yyb_user', user)
  },

  // 保存MBTI结果
  setMbti(result) {
    this.globalData.mbtiResult = result
    wx.setStorageSync('yyb_mbti', result)
  },

  // ===== V0.7 统一成长值入口 =====
  // 行为(action) → 增加对应成长值 + 记录明细
  addGrowth(action, extra) {
    const rule = GROWTH_RULES[action]
    if (!rule) return false
    const exp = (extra && extra.exp) || rule.exp
    // 记录成长值明细
    const log = this.globalData.growthLog || []
    log.push({ action, label: rule.label, exp, time: Date.now() })
    if (log.length > 50) log.splice(0, log.length - 50)
    this.globalData.growthLog = log
    wx.setStorageSync('yyb_growth_log', log)
    // 增加经验
    this.gainExp(exp)
    // 触发成就检测
    this.checkAchievements(null, action)
    return true
  },

  // 获取成长值明细
  getGrowthLog() {
    return (this.globalData.growthLog || []).slice().reverse()
  },
  // 成长值总计
  getGrowthTotal() {
    return (this.globalData.growthLog || []).reduce((s, g) => s + (g.exp || 0), 0)
  },

  // 添加/更新今日记录 (累计成长经验)
  addRecord(record) {
    let history = this.globalData.emotionHistory || []
    const today = record.date
    const existing = history.find(h => h.date === today)
    if (existing) history[history.indexOf(existing)] = record
    else history.push(record)
    if (history.length > 30) history = history.slice(-30)
    this.globalData.emotionHistory = history
    this.globalData.todayRecord = record
    wx.setStorageSync('yyb_history', history)

    // 累计成长经验/天数 (V0.7 改走统一入口)
    if (!existing) {
      this.addGrowth('checkin')
      this.globalData.companion.checkinDays = (this.globalData.companion.checkinDays || 0) + 1
      wx.setStorageSync('yyb_companion', this.globalData.companion)
    }

    // V0.8 成就检测(新打卡时)
    return this.checkAchievements(record)
  },

  // ===== 首页轻量打卡（手账抽屉）：今日是否已记录 =====
  hasTodayRecord() {
    const today = new Date().toDateString()
    return !!(this.globalData.emotionHistory || []).find(h => h.date === today)
  },

  // 首页轻量打卡：五档氧状态 + 可选照片 → 生成简化记录(复用 addRecord 的联动逻辑)
  addQuickRecord(stateKey, note, photo) {
    const today = new Date().toDateString()
    // Q2 · 五档氧状态
    const stateMap = {
      full:    { label: '满氧',       emotion: '开心', icon: '🌈', energy: 90 },
      calm:    { label: '平稳',       emotion: '平静', icon: '🌤', energy: 74 },
      light:   { label: '轻微缺氧',   emotion: '疲惫', icon: '🌫', energy: 55 },
      low:     { label: '低氧提醒',   emotion: '低落', icon: '🌧', energy: 40 },
      chaos:   { label: '混乱中',     emotion: '焦虑', icon: '🌀', energy: 30 }
    }
    const m = stateMap[stateKey] || stateMap.calm
    const record = {
      date: today,
      text: note || (photo ? '（留下一口今天的氧气）' : '（首页状态轻选）'),
      scene: '',
      photo: photo || '',
      emotionLabel: m.emotion,
      confidence: 0.75,
      insight: '今天也在好好照顾自己的氧气，氧氧都记在心里 💚',
      regulationTip: m.energy < 60 ? '能量偏低，氧氧建议来一次 3 分钟氧疗哦 🫁' : '',
      productHint: '',
      personaLine: '',
      energy: m.energy,
      keyword: m.label,
      keywords: [m.label, '自我关怀', '保持节奏'],
      state: m.label,
      suggestion: '给情绪一点空间，慢慢呼吸，感受当下的氧气。',
      indexes: { emotion: m.energy, oxygen: m.energy, vigor: m.energy, recover: m.energy },
      faceMood: '',
      physicalTags: [],
      recipe: null,
      quick: true
    }
    return this.addRecord(record)
  },

  // V0.8 成就检测: 返回本次新解锁的成就列表
  // action: 触发行为(chat/oxygen_test/ox_use 等), 用于检测对应成就
  checkAchievements(record, action) {
    const unlocked = this.globalData.achievements || []
    const newly = []
    const history = this.globalData.emotionHistory || []
    const companion = this.globalData.companion || {}

    const unlock = (id) => {
      if (!unlocked.includes(id)) {
        unlocked.push(id)
        newly.push(id)
      }
    }

    // 初次打卡
    if (history.length >= 1) unlock('first_checkin')
    // 首次获食谱
    if (record && record.recipe) unlock('first_recipe')

    // 连续打卡天数(从记录列表算连续)
    const streak = this.calcContinuousDays(history)
    if (streak >= 3) unlock('streak_3')
    if (streak >= 5) unlock('streak_5')
    if (streak >= 7) unlock('streak_7')

    // 覆盖全部4场景
    const scenes = new Set(history.map(h => h.scene).filter(Boolean))
    const allScenes = ['高原旅行', '脑疲劳', '运动恢复', '银发陪伴']
    if (allScenes.every(s => scenes.has(s))) unlock('scene_all')

    // ===== V0.7 新增成就 =====
    // 聊天满 10 次
    const chatCount = (wx.getStorageSync('yyb_chat_history') || []).length
    if (chatCount >= 10) unlock('chat_10')
    // 含氧感自测
    if (wx.getStorageSync('yyb_oxygen_report')) unlock('oxygen_test')
    // 高原守护者: 打卡过高原场景
    if (history.some(h => h.scene === '高原旅行')) unlock('plateau_guard')
    // 查看过产品中心
    if (wx.getStorageSync('yyb_product_viewed')) unlock('product_look')
    // 连续吸氧 7 天 / 21 天氧护(基于累计使用氧方案天数, companion.oxDays)
    const oxDays = companion.oxDays || 0
    if (oxDays >= 7) unlock('ox_7day')
    if (oxDays >= 21) unlock('ox_21day')

    this.globalData.achievements = unlocked
    wx.setStorageSync('yyb_achievements', unlocked)
    return newly
  },

  // 记录"使用氧方案"一天(氧护天数累计)
  logOxygenUse() {
    const c = this.globalData.companion
    const today = new Date().toDateString()
    const lastUse = c.lastOxDate || ''
    if (lastUse !== today) {
      c.oxDays = (c.oxDays || 0) + 1
      c.lastOxDate = today
      wx.setStorageSync('yyb_companion', c)
    }
    this.addGrowth('gift')
  },

  // 计算连续打卡天数(按日期排序, 从最近往前数连续)
  calcContinuousDays(history) {
    if (!history || history.length === 0) return 0
    const dates = history.map(h => h.date).sort()
    const dateSet = new Set(dates)
    let count = 0
    const d = new Date()
    while (true) {
      const key = d.toDateString()
      if (dateSet.has(key)) { count++; d.setDate(d.getDate() - 1) }
      else break
    }
    return count
  },

  // 查询成就定义
  getAchievementDef(id) {
    return ACHIEVEMENT_DEFS[id] || null
  },
  // V0.7 返回带 unlocked 状态的完整成就列表
  getAchievements() {
    const unlocked = this.globalData.achievements || []
    return Object.keys(ACHIEVEMENT_DEFS).map(id => ({
      ...ACHIEVEMENT_DEFS[id],
      unlocked: unlocked.includes(id)
    }))
  },
  // 已解锁成就数
  getUnlockedCount() {
    return (this.globalData.achievements || []).length
  },
  getLevelRewards() {
    return LEVEL_REWARDS
  },

  // ===== V0.9 氧氧记忆(偏好偏好) =====
  getPreferences() {
    if (!this._prefs) {
      this._prefs = Object.assign({}, DEFAULT_PREFERENCES, wx.getStorageSync('yyb_preferences') || {})
    }
    return this._prefs
  },
  setPreference(key, value) {
    const p = this.getPreferences()
    p[key] = value
    this._prefs = p
    wx.setStorageSync('yyb_preferences', p)
  },
  // 偏好是否已收集(至少一项)
  hasPreferences() {
    const p = this.getPreferences()
    return !!(p && (p.productModel || p.parentAge || p.highlandFreq || p.sleepPattern))
  },

  // 增加成长经验并处理升级
  gainExp(amount) {
    const c = this.globalData.companion
    c.experience = (c.experience || 0) + amount
    const max = c.maxExperience || 100
    // 升级判断
    if (c.experience >= max && c.growthLevel < 4) {
      c.growthLevel = (c.growthLevel || 1) + 1
      c.experience = c.experience - max
      const lv = GROWTH_LEVELS.find(l => l.level === c.growthLevel)
      if (lv) {
        c.levelName = lv.name
        c.badge = lv.badge
      }
      wx.vibrateShort({ type: 'medium' })
    }
    wx.setStorageSync('yyb_companion', c)
  }
})
