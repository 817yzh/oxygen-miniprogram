// P1 · 首页
const app = getApp()

Page({
  data: {
    hasRecord: false,
    streak: 0,
    currentEmotion: '',
    currentEmotionText: '',
    confidence: 0,
    todayInsight: '',
    history: []
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const history = wx.getStorageSync('emotionHistory') || []
    const today = new Date().toDateString()
    const todayRecord = history.find(h => h.date === today)

    // 计算连续打卡天数
    let streak = 0
    let d = new Date()
    while (true) {
      const dateStr = d.toDateString()
      const found = history.find(h => h.date === dateStr)
      if (found) {
        streak++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }

    const emotionClassMap = {
      '开心': 'emo-positive', '平静': 'emo-positive', '放松': 'emo-positive',
      '焦虑': 'emo-warning', '紧张': 'emo-warning',
      '烦躁': 'emo-stress', '疲惫': 'emo-stress',
      '低落': 'emo-low', '孤独': 'emo-low'
    }
    const history7 = history.slice(-7).map(h => ({
      date: h.date.slice(5, 10),
      label: emotionClassMap[h.emotionLabel] || 'emo-positive',
      text: h.emotionLabel
    }))

    this.setData({
      hasRecord: !!todayRecord,
      streak,
      currentEmotion: todayRecord ? todayRecord.emotionLabel : '',
      currentEmotionText: todayRecord ? todayRecord.emotionLabel : '',
      confidence: todayRecord ? Math.round(todayRecord.confidence * 100) : 0,
      todayInsight: todayRecord ? todayRecord.insight : '',
      history: history7
    })
  },

  goCheckin() {
    wx.navigateTo({
      url: '/pages/checkin/checkin'
    })
  },

  goResult() {
    wx.navigateTo({
      url: '/pages/result/result'
    })
  },

  selectScene(e) {
    const scene = e.currentTarget.dataset.scene
    wx.navigateTo({
      url: '/pages/checkin/checkin?scene=' + scene
    })
  }
})
