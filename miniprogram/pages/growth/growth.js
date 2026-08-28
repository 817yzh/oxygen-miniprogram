// pages/growth/growth.js
const app = getApp()
const { GROWTH_LEVELS } = require('../../mock/data.js')

Page({
  data: {
    level: 2,
    levelName: '熟悉伙伴',
    exp: 60,
    expMax: 100,
    badge: 'bag',
    oxyStateText: '氧氧背上小背包，陪你一起闯～',
    records: [],
    achievements: [
      { icon: '🌱', name: '初次见面', desc: '完成第一次情绪打卡' },
      { icon: '🏔️', name: '高原卫士', desc: '完成高原场景打卡' },
      { icon: '🔁', name: '七日之约', desc: '连续打卡7天' }
    ]
  },

  onLoad() {
    // 成长级别数据
    const companion = app.globalData.companion || {}
    const lv = companion.growthLevel || 1
    const levelInfo = GROWTH_LEVELS.find(l => l.level === lv) || GROWTH_LEVELS[0]
    // 下一等级
    const nextLevel = GROWTH_LEVELS.find(l => l.level === lv + 1) || null

    // 氧氧状态变化文案
    const oxyState = {
      1: '普通氧氧，正在等你熟悉',
      2: '氧氧背上小背包，陪你一起闯～',
      3: '氧氧解锁探索徽章，更懂你了',
      4: '氧氧已经成为你最深的氧气搭档'
    }

    const history = app.globalData.emotionHistory || []
    const records = history.slice().reverse().slice(0, 10).map(r => ({
      date: r.date,
      emotion: r.emotionLabel || '平静',
      energy: r.energy || Math.round((r.confidence || 0.5) * 100)
    }))

    // 成长瞬间(打卡记录驱动)
    const moments = history.slice().reverse().slice(0, 5).map(r => ({
      date: r.date,
      emotion: r.emotionLabel || '平静',
      scene: r.scene || ''
    }))

    const expMax = companion.maxExperience || 100
    const nextRemain = Math.max(0, expMax - (companion.experience || 0))

    this.setData({
      level: lv,
      levelName: levelInfo.name,
      badge: levelInfo.badge,
      exp: companion.experience || 20,
      expMax,
      oxyStateText: oxyState[lv] || oxyState[1],
      records,
      moments,
      hasMoments: moments.length > 0,
      nextLevel,
      nextRemain,
      timeline: this.buildTimeline(history, lv, companion),
      // V0.8 成就(从全局读取真实数据; 无则用默认3个)
      achievements: this.buildAchievements(),
      // V0.7 等级奖励 + 成长值明细
      rewardList: this.buildRewards(),
      growthTotal: app.getGrowthTotal(),
      growthLog: app.getGrowthLog().slice(0, 8),
      growthLevel: lv
    })
  },

  // V0.7 等级奖励列表(配 GROWTH_LEVELS)
  buildRewards() {
    const rewards = (app.getLevelRewards && app.getLevelRewards()) || {}
    return GROWTH_LEVELS.map(l => ({
      level: l.level,
      name: l.name,
      reward: rewards[l.level] || '解锁新特权'
    }))
  },

  // V0.8 成就列表(优先真实解锁, 空时展示示例)
  buildAchievements() {
    const list = app.getAchievements ? app.getAchievements() : []
    if (list.length > 0) return list
    return [
      { icon: '🌱', name: '初次见面', desc: '完成第一次情绪打卡' },
      { icon: '🏔️', name: '高原卫士', desc: '完成高原场景打卡' },
      { icon: '🔁', name: '七日之约', desc: '连续打卡7天' }
    ]
  },

  // V0.5 成长轨迹时间线
  buildTimeline(history, curLevel, companion) {
    const nodes = []
    // 加入氧氧(用户注册)
    nodes.push({ icon: '🌱', date: 'day0', text: '加入氧氧，开启情绪陪伴之旅' })
    // 首次打卡
    if (history.length > 0) {
      nodes.push({ icon: '📝', date: history[0].date, text: '完成了第一次情绪打卡' })
    }
    // 连续打卡 3/5/7 天
    const streak = companion.checkinDays || this.calcStreak(history)
    const streakNodes = [{n:3,t:'连续打卡3天'},{n:5,t:'连续打卡5天'},{n:7,t:'解锁深度陪伴记录'}]
    streakNodes.forEach(sn => {
      if (streak >= sn.n) nodes.push({ icon: '🔥', date: history[history.length-1] && history[history.length-1].date, text: sn.t })
    })
    // 等级节点
    const names = ['', '初遇氧氧', '熟悉伙伴', '氧气搭档', '深度陪伴']
    for (let l = 2; l <= curLevel; l++) {
      nodes.push({ icon: '🎉', date: '', text: `解锁 Lv.${l} ${names[l]}` })
    }
    // 倒序, 最近的在最上面
    return nodes.reverse().slice(0, 20)
  },

  calcStreak(history) {
    if (history.length === 0) return 0
    const dates = new Set(history.map(h => h.date))
    let streak = 0
    const d = new Date()
    const today = d.toDateString()
    let cur = dates.has(today) ? 0 : 1
    for (let i = cur; i < 60; i++) {
      const t = new Date(d); t.setDate(d.getDate() - i)
      if (dates.has(t.toDateString())) streak++
      else break
    }
    return Math.max(streak, 0)
  },

  goCheckin() {
    wx.navigateTo({ url: '/pages/checkin/checkin' })
  }
})
