// pages/report/report.js
const app = getApp()
const { SCENE_HEALTH_CONFIG } = require('../../mock/health-scene-db.js')
const { getCreatorsByMatch } = require('../../mock/creator-db.js') // V0.8 签约博主

Page({
  data: {
    record: null,
    emotionLabel: '平静',
    matchScore: 0,
    advice: '今天状态不错，继续保持你的氧气节奏。',
    productHint: '',
    personaLine: '',
    keywords: ['平稳'],
    streak: 1,
    state: '平稳日',
    suggestion: '',
    indexes: null,
    trendList: [],       // 情绪趋势数据(近7天)
    trendSummary: '',    // V0.5 情绪趋势总结
    trendSummaryShow: false,
    trendTrendIcon: '➡️',
    // 成长统计
    statRecords: 0,
    statEmotions: 0,
    statEnergy: 0,
    // 等级
    level: 1,
    levelName: '初遇氧氧',
    nextLevelName: '熟悉伙伴',
    levelProgress: 0,
    exp: 0,
    expMax: 100,
    // 氧氧想对你说
    speakLine: '',
    // V0.7 场景相关推荐
    sceneRecommend: null,
    // V0.8 今日健康食谱
    recipe: null,
    recipeWhy: '',
    // V0.8 签约博主(真实案例)
    creators: [],
    // V0.8 成就通知横幅
    achievementBanner: null,
    // V0.9 状态解读卡 + 氧疗引导
    oxygenGuide: null
  },

  onLoad() {
    const r = app.globalData.lastRecord || app.globalData.todayRecord || {}
    const confidence = r.confidence || 0.5
    const kw = r.keywords || this.buildKeywords(r.keyword || r.emotionLabel || '平稳')
    const state = r.state || this.stateFromEmotion(r.emotionLabel)
    const suggestion = r.suggestion || r.regulationTip || ''
    const indexes = r.indexes || null
    const streak = this.calcStreak()
    const history = app.globalData.emotionHistory || []

    this.setData({
      record: r,
      // V0.8 今日健康食谱(r.recipe 由 checkinService 生成)
      recipe: r.recipe || null,
      recipeWhy: (r.recipe && r.recipe.why) || ''
    })
    // V0.8 成就通知横幅(若有新解锁)
    this.showAchievementBanner()

    this.setData({
      record: r,
      emotionLabel: r.emotionLabel || '平静',
      matchScore: Math.round(confidence * 100),
      advice: r.insight || '今天状态不错，继续保持你的氧气节奏。',
      regulationTip: r.regulationTip || '',
      productHint: r.productHint || '',
      personaLine: r.personaLine || '',
      keywords: kw,
      streak,
      streakLine: this.streakTip(streak),
      state,
      suggestion,
      indexes,
      trendList: history.slice(-7),
      speakLine: this.buildSpeak(kw[0]),
      // 成长统计
      statRecords: history.length,
      statEmotions: new Set(history.map(h => h.emotionLabel || '')).size,
      statEnergy: history.reduce((s, h) => s + (h.energy || 0), 0)
    })
    // V0.5 情绪趋势总结(近7天)
    const sum = this.buildTrendSummary(history.slice(-7))
    this.setData({ trendSummary: sum.text, trendSummaryShow: sum.show, trendTrendIcon: sum.icon || '➡️' })
    // V0.7 场景联动推荐(根据打卡记录的 scene 字段匹配)
    this.buildSceneRecommend(r)
    // V0.8 博主真实案例(按场景/情绪匹配)
    this.buildCreators(r)
    // V0.9 状态解读卡 + 氧疗软引导
    this.buildOxygenGuide(r)
    this.loadLevel()
  },

  // V0.9 状态解读卡 + 氧疗引导
  // 能量偏低(energy<60)或负向情绪 → 判定需氧疗引导
  buildOxygenGuide(r) {
    const energy = r.energy || 0
    const emotion = r.emotionLabel || ''
    const lowEmotions = ['疲惫', '焦虑', '低落', '烦躁', '紧张', '孤独']
    const isLow = energy < 60 || lowEmotions.includes(emotion)
    if (!isLow) { this.setData({ oxygenGuide: null }); return }

    // 场景标签: 优先取打卡场景, 否则按情绪匹配默认场景
    const sceneName = r.scene || ''
    let cfg = SCENE_HEALTH_CONFIG[sceneName] || null
    if (!cfg) {
      const emoScene = {
        '疲惫': '脑疲劳', '焦虑': '脑疲劳', '紧张': '脑疲劳', '烦躁': '脑疲劳',
        '低落': '银发陪伴', '孤独': '银发陪伴'
      }
      cfg = SCENE_HEALTH_CONFIG[emoScene[emotion] || '脑疲劳'] || null
    }

    this.setData({
      oxygenGuide: {
        sceneTag: cfg ? cfg.sceneName : '补氧',
        sceneCard: cfg ? cfg.sceneName : '脑疲劳',
        energy,
        emotion,
        tip: this.guideTip(emotion, energy),
        productName: cfg ? cfg.productName : '氧氧便携款',
        sniff: cfg ? cfg.sniffFormula : ''
      }
    })
  },

  // 解读文案(按情绪分)
  guideTip(emotion) {
    const m = {
      '疲惫': '检测到你能量偏低，可能是大脑在闹氧荒。给自己 3 分钟，吸一口富氧空气充充电吧～',
      '焦虑': '感觉紧绷到放不下，多半是思绪消耗太多氧气了。停 3 分钟，做个深呼吸氧疗，把节奏拉回来。',
      '烦躁': '有点上头的时刻，别硬扛。吸一口氧让大脑冷静下来，你会更稳。',
      '低落': '情绪低低的，氧气和关心都能帮你回暖。试试 3 分钟氧疗，缓慢地帮自己蓄电。',
      '紧张': '紧绷的弦需要松一松。富氧空气能帮心率放慢，3 分钟就能找回从容。',
      '孤独': '想被陪伴的时候，先照顾好自己的呼吸。吸一口氧，也算给自己一个拥抱。'
    }
    return m[emotion] || '检测到你能量偏低，要不要试试 3 分钟氧疗，帮身体充充电？'
  },

  // V0.7 场景相关推荐(依据打卡场景)
  buildSceneRecommend(r) {
    const sceneName = (r && r.scene) || ''
    const cfg = SCENE_HEALTH_CONFIG[sceneName]
    if (cfg) {
      this.setData({
        sceneRecommend: {
          sceneName: cfg.sceneName,
          icon: cfg.icon,
          suggestion: cfg.reportSuggestion || cfg.suggestion,
          productName: cfg.productName
        }
      })
    } else {
      this.setData({ sceneRecommend: null })
    }
  },

  // V0.8 签约博主真实案例(按场景/情绪匹配)
  buildCreators(r) {
    const emoScene = { '疲惫': '脑疲劳', '焦虑': '脑疲劳', '烦躁': '脑疲劳', '紧张': '脑疲劳', '低落': '银发陪伴', '孤独': '银发陪伴', '失眠': '失眠' }
    const scene = r.scene || emoScene[r.emotionLabel || ''] || ''
    const creators = getCreatorsByMatch({ scene })
    this.setData({ creators })
  },

  // V0.8 博主点击
  onCreatorTap(e) {
    const c = (e.detail && e.detail.creator) || {}
    wx.showModal({
      title: c.name ? c.name + ' · ' + (c.scene || '') : '签约博主',
      content: (c.description || '') + '\n\n🎬 视频内容即将上线（演示阶段）',
      showCancel: false,
      confirmText: '了解啦',
      confirmColor: '#72D8C4'
    })
  },

  // V0.7 查看场景方案详情
  goToSceneDetail() {
    const sc = this.data.sceneRecommend
    if (sc && sc.sceneName) {
      wx.navigateTo({ url: '/pages/scene-detail/index?scene=' + sc.sceneName })
    }
  },

  // V0.9 氧疗引导 → 一键跳场景方案详情
  goOxygenGuide() {
    const g = this.data.oxygenGuide
    const scene = (g && g.sceneCard) || ''
    if (scene) wx.navigateTo({ url: '/pages/scene-detail/index?scene=' + scene })
  },

  // V0.8 成就通知横幅(3秒自动消失)
  showAchievementBanner() {
    const ids = app.globalData.newAchievements || []
    // 清掉本次已读
    app.globalData.newAchievements = []
    if (ids.length === 0) return
    const defs = ids.map(id => app.getAchievementDef(id)).filter(Boolean)
    if (defs.length === 0) return
    this.setData({
      achievementBanner: {
        name: defs[0].name,
        icon: defs[0].icon
      }
    })
    // 3秒后消失
    setTimeout(() => {
      this.setData({ achievementBanner: null })
    }, 3000)
  },

  // V0.5 情绪趋势总结
  buildTrendSummary(list) {
    if (list.length < 3) {
      return { show: true, text: '记录还不够多，再坚持几天，氧氧就能读懂你的情绪趋势啦 🌱' }
    }
    if (list.length === 0) return { show: false, text: '' }
    const positive = ['开心', '平静', '放松']
    const negative = ['焦虑', '烦躁', '疲惫', '低落', '紧张', '孤独']
    const emotions = list.map(h => h.emotionLabel || '平静')
    const pos = emotions.filter(e => positive.includes(e)).length
    const neg = emotions.filter(e => negative.includes(e)).length
    // 整体情绪基调
    let tone = '平稳'
    if (pos > neg) tone = '积极'
    else if (neg > pos + 1) tone = '波动'
    else if (neg > 0) tone = '偏低'
    // 判断是否有回升/低谷
    const first = emotions[0]
    const last = emotions[emotions.length - 1]
    let event = ''
    if (negative.includes(first) && !negative.includes(last)) event = '，周末有一次回升'
    else if (!negative.includes(first) && negative.includes(last)) event = '，周中有一次低谷'
    else if (negative.includes(last) && negative.includes(first)) event = ''
    // 整体趋势
    let trend = '平稳'
    if (pos > neg) trend = '向好'
    else if (neg > pos) trend = '略有下降'
    return { show: true, text: `你这周整体情绪偏${tone}${event}，整体趋势${trend}。`, icon: trend === '向好' ? '📈' : trend === '略有下降' ? '📉' : '➡️' }
  },

  // 等级进度
  loadLevel() {
    const c = app.globalData.companion || {}
    const lv = c.growthLevel || 1
    const exp = c.experience || 0
    const expMax = c.maxExperience || 100
    const names = ['', '初遇氧氧', '熟悉伙伴', '氧气搭档', '深度陪伴']
    const nextNames = ['', '熟悉伙伴', '氧气搭档', '深度陪伴', '完成']
    this.setData({
      level: lv,
      levelName: names[lv] || '初遇氧氧',
      nextLevelName: nextNames[lv] || '',
      levelProgress: Math.min(100, Math.round((exp / expMax) * 100)),
      exp,
      expMax
    })
  },

  // 连续打卡专属文案(V0.4 IP联动)
  streakTip(n) {
    if (n >= 7) return '解锁氧氧深度陪伴记录 💎'
    if (n >= 5) return '我们的默契越来越高了 🤝'
    if (n >= 3) return '氧氧发现你已经坚持 ' + n + ' 天啦！🔥'
    return '又陪你成长了一天 ✨'
  },

  // 氧氧想对你说
  buildSpeak(kw) {
    const lines = [
      '你每天都在努力生活，这本身就很了不起！氧氧会一直陪着你，一起慢慢变好~',
      '不管今天的状态如何，你来记录，就已经很勇敢了。',
      '你正在一点点变好，氧氧都看在眼里 💚'
    ]
    return lines[Math.floor(Math.random() * lines.length)]
  },

  buildKeywords(emotion) {
    const map = {
      '疲惫': ['慢下来', '重新充电', '需要休息'],
      '焦虑': ['深呼吸', '放松紧绷', '找回平静'],
      '烦躁': ['先降降温', '暂停一下', '理清思绪'],
      '低落': ['照顾自己', '慢慢来', '值得被爱'],
      '孤独': ['被牵挂', '勇敢陪伴', '打开心窗'],
      '开心': ['能量满格', '分享快乐', '保持好状态'],
      '平静': ['平稳', '自洽', '良好节奏'],
      '放松': ['松弛', '舒展', '自在'],
      '紧张': ['稳住', '深呼吸', '放轻松']
    }
    return map[emotion] || ['平稳', '自洽', '好好休息']
  },

  stateFromEmotion(emotion) {
    const map = {
      '开心': '元气日', '平静': '平稳日', '放松': '松弛日',
      '疲惫': '待充电日', '焦虑': '波动日', '烦躁': '升温日',
      '低落': '低气压日', '紧张': '紧绷日', '孤独': '思念日'
    }
    return map[emotion] || '平稳日'
  },

  calcStreak() {
    const history = app.globalData.emotionHistory || []
    if (history.length === 0) return 0
    const dates = new Set(history.map(h => h.date))
    let streak = 0
    const d = new Date()
    const todayStr = d.toDateString()
    let cur = dates.has(todayStr) ? 0 : 1
    for (let i = cur; i < 60; i++) {
      const t = new Date(d)
      t.setDate(d.getDate() - i)
      if (dates.has(t.toDateString())) streak++
      else break
    }
    return Math.max(streak, 1)
  },

  // 去打卡(调节入口) — 修复: 原指向未注册的 /pages/regulation
  goRegulation() { wx.navigateTo({ url: '/pages/checkin/checkin' }) },

  saveCard() {
    const r = this.data.record || {}
    const text = `【我的今日氧气状态】\n${this.data.state} · ${this.data.emotionLabel}\n能量 ${this.data.matchScore}% · 关键词 ${(this.data.keywords||[]).join('、')}\n\n${this.data.advice}\n\n—— 来自氧氧宝 💚`
    wx.setClipboardData({
      data: text,
      success() { wx.showToast({ title: '状态卡已保存，去分享吧', icon: 'none' }) }
    })
  },

  goGrowth() { wx.navigateTo({ url: '/pages/growth/growth' }) },
  goHome() { wx.reLaunch({ url: '/pages/home/home' }) }
})
