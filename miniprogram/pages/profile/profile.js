// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    user: null,
    mbti: null,
    oxygenScore: 77,
    // 数据看板：累计吸氧 / 陪伴天 / 成长
    oxygenHours: '12.5',
    oxUnit: '小时',
    companionDays: 18,
    growthLevel: 'Lv.1',
    growthName: '初遇氧氧'
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const user = app.globalData.user
    const mbti = app.globalData.mbtiResult
    const companion = app.globalData.companion || {}
    // 陪伴天数：优先情绪记录数，退化到 checkinDays
    const history = app.globalData.emotionHistory || []
    const companionDays = Math.max(history.length || 0, companion.checkinDays || 0)
    // 累计吸氧时长（演示派生：陪伴天数 × 2.5 小时估算）
    const oxygenHours = ((companionDays || 5) * 2.5).toFixed(1)
    // 成长等级
    const growthLevel = 'Lv.' + (companion.growthLevel || 1)
    const growthName = companion.levelName || '初遇氧氧'

    this.setData({
      user,
      mbti,
      oxygenHours,
      companionDays,
      growthLevel,
      growthName
    })
  },

  goMbti() {
    wx.navigateTo({ url: '/pages/mbti/index/index' })
  },

  // V0.8 成长中心(自首页归位)
  goGrowth() {
    wx.navigateTo({ url: '/pages/growth/growth' })
  },

  // V0.6 情绪日志
  goEmotionLog() {
    wx.navigateTo({ url: '/pages/emotion-log/emotion-log' })
  },

  // V0.8 聊天看板
  goChatStat() {
    wx.navigateTo({ url: '/pages/chat-stat/chat-stat' })
  },

  // 充氧报告
  goReport() {
    wx.navigateTo({ url: '/pages/report/report' })
  },

  // 我的充氧宝（演示占位）
  goDevice() {
    wx.showToast({ title: '设备连接仍在开发中', icon: 'none' })
  },

  // 隐私设置说明
  onPrivacy() {
    wx.showToast({ title: '情绪数据仅保存在本地，不会上传', icon: 'none' })
  },

  // 数据说明
  onDataInfo() {
    wx.showModal({
      title: '数据说明',
      content: '氧氧宝目前在演示阶段，所有情绪分析(文字/拍照)均为本地模拟，不会上传或存储你的任何数据。',
      showCancel: false
    })
  },

  // V0.9 健康声明(非医疗设备) → 跳转详细声明页
  onHealthDeclare() {
    wx.navigateTo({ url: '/pages/health-disclaimer/health-disclaimer' })
  },

  clearData() {
    wx.showModal({
      title: '清除本地数据',
      content: '将删除本地存储的用户、MBTI结果和情绪记录',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          app.globalData.user = null
          app.globalData.mbtiResult = null
          app.globalData.emotionHistory = []
          this.refresh()
          wx.showToast({ title: '已清除', icon: 'success' })
        }
      }
    })
  }
})
