// pages/oxygen-lab/oxygen-lab.js
// 氧气探索 · 用户氧气认知入口(V0.8)
const app = getApp()
const { OXYGEN_PERSONALITIES } = require('../../mock/data.js')

Page({
  data: {
    // 含氧感自测
    testAvailable: true,
    // 六种氧系人格 icon(入口展示)
    personalities: (OXYGEN_PERSONALITIES || []).map(p => ({ icon: p.icon, name: p.name })),
    // 场景模拟器
    simulations: [
      { id: 'lasa', icon: '🏔️', title: '明天去拉萨', desc: '高原适应', oxygen: 'high', oxygenText: '高', plan: '高原便携方案' },
      { id: 'overtime', icon: '💻', title: '今晚加班', desc: '脑力消耗', oxygen: 'mid', oxygenText: '中', plan: '桌面补氧方案' },
      { id: 'run5k', icon: '🏃', title: '刚跑5公里', desc: '运动恢复', oxygen: 'mid', oxygenText: '中', plan: '运动恢复方案' },
      { id: 'elder', icon: '👴', title: '照顾老人', desc: '日常保健', oxygen: 'low', oxygenText: '低', plan: '银发陪伴方案' }
    ]
  },

  onLoad() {},

  onShow() {
    this.refresh()
  },

  refresh() {
    // 读取用户最近氧负荷数据(若有)
    const oxygenReport = wx.getStorageSync('yyb_oxygen_report') || null
    this.setData({ oxygenReport })
  },

  // ===== V0.8 发现你的氧气人格(MBTI) =====
  goMbti() {
    wx.navigateTo({ url: '/pages/mbti/index/index' })
  },

  // ===== 含氧感自测 =====
  goTest() {
    wx.navigateTo({ url: '/pages/oxygen-test/oxygen-test' })
  },

  // ===== V0.8 音疗冥想(五音) =====
  goSound() {
    wx.navigateTo({ url: '/pages/sound-therapy/sound-therapy' })
  },

  // ===== V0.8 氧气同好(同类人格匹配) =====
  goSoulmate() {
    wx.navigateTo({ url: '/pages/soulmate/soulmate' })
  },

  // ===== 场景模拟器 =====
  goSimulator(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/scene-simulator/scene-simulator?sim=' + id })
  },

  // ===== 快捷入口: 底部生态位(演示用) =====
  goProductCenter() {
    wx.switchTab({ url: '/pages/product-center/product-center' })
  }
})
