// app.js
App({
  globalData: {
    userInfo: null,
    // 情绪历史记录
    emotionHistory: []
  },

  onLaunch() {
    // 读取本地存储的情绪历史
    const history = wx.getStorageSync('emotionHistory') || []
    this.globalData.emotionHistory = history
  }
})
