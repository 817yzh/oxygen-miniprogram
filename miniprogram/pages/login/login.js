// pages/login/login.js
// 登录页 · 氧氧宝
const app = getApp()

Page({
  data: {
    agreed: false,
    loggingIn: false
  },

  onLoad() {
    // 已登录则直接进首页（体验版测试时临时注释，方便展示登录页）
    // if (app.globalData.user && app.globalData.user.loggedIn) {
    //   this.goHome()
    // }
  },

  toggleAgree() {
    this.setData({ agreed: !this.data.agreed })
  },

  showAgree() {
    wx.showModal({
      title: '用户协议',
      content: '氧氧宝是一款情绪健康 AI 陪伴工具，用于情绪能量管理与自我成长陪伴，不构成医疗诊断。请理性看待，如有严重情绪困扰请及时寻求专业帮助。',
      showCancel: false
    })
  },

  showPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们仅收集你的基本信息、情绪日记与打卡记录，用于提供陪伴服务。数据加密存储，不会向第三方泄露。你可随时在"我的"中查看或删除数据。',
      showCancel: false
    })
  },

  onWechatLogin() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先勾选用户协议', icon: 'none' })
      return
    }
    if (this.data.loggingIn) return

    this.setData({ loggingIn: true })
    wx.showLoading({ title: '登录中...' })

    // ===== Mock 微信登录 =====
    // 真实上线后替换为：
    //   wx.login({ success: (res) => 用 res.code 调后端换 openid })
    setTimeout(() => {
      wx.hideLoading()
      const user = {
        loggedIn: true,
        openid: 'mock_openid_' + Date.now(),
        nickname: '氧友',
        avatar: '',
        loginTime: new Date().toISOString()
      }
      app.setUser(user)
      this.setData({ loggingIn: false })
      this.goHome()
    }, 900)
  },

  goHome() {
    wx.reLaunch({ url: '/pages/home/home' })
  }
})
