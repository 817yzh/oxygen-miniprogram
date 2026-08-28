// pages/mbti/index/index.js
// 氧系MBTI 引导页：极简治愈版（深绿流光 + 放大IP + 单按钮，纯留白高级感）
Page({
  // 进入测试流程
  goExplore() {
    wx.navigateTo({ url: '/pages/mbti/form/form' })
  },

  goBack() {
    wx.navigateBack()
  }
})
