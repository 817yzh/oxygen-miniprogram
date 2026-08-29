// pages/scene-detail/index.js
const app = getApp()
const { SCENE_HEALTH_CONFIG } = require('../../mock/health-scene-db.js')
const { getEvidence } = require('mock/evidence-db.js) // V0.7 数据背书

Page({
  data: {
    scene: null,
    sceneName: '',
    // audience 拆分展示
    audienceList: [],
    // V0.7 五段式: 数据背书
    evidenceList: []
  },

  onLoad(options) {
    // 支持 sceneId 或 sceneName 传入(兼容可能的 URL 编码)
    let name = (options && options.scene) || ''
    // 防御：若收到编码串则解码；若收到含 %xx 的编码则还原中文
    try {
      if (name && /%/.test(name)) name = decodeURIComponent(name)
    } catch (e) {}
    if (!name && options && options.sceneId) {
      // 通过 id 反查
      const hit = Object.keys(SCENE_HEALTH_CONFIG).find(k => SCENE_HEALTH_CONFIG[k].id === options.sceneId)
      name = hit || ''
    }
    const cfg = SCENE_HEALTH_CONFIG[name]
    if (cfg) {
      this.setData({
        scene: cfg,
        sceneName: cfg.sceneName || name,
        audienceList: (cfg.audience || '').split(/[、,，]/).filter(Boolean),
        // V0.7 数据背书
        evidenceList: getEvidence(cfg.sceneName || name)
      })
      wx.setNavigationBarTitle({ title: cfg.sceneName + ' · 方案' })
      // V0.7 成长值: 查看场景方案 + 记录氧护天数
      app.addGrowth('scene_view')
      app.logOxygenUse()
    } else {
      wx.showToast({ title: '未找到该场景', icon: 'none' })
    }
  },

  // 底部购买按钮：零售(演示占位)
  onBuy() {
    wx.showModal({
      title: 'Work Air 充氧宝 · ' + (this.data.sceneName || ''),
      content: '零售 1680 元\n\n演示阶段暂未接入商城，购买入口即将上线 🌱',
      showCancel: false,
      confirmText: '好的'
    })
  },

  // 底部租赁按钮
  onRent() {
    wx.showModal({
      title: 'Work Air 充氧宝 · 租赁',
      content: '租赁 79 元/天，支持按需租用\n\n演示阶段暂未接入商城，敬请期待 🌱',
      showCancel: false,
      confirmText: '好的'
    })
  },

  // 底部大按钮：了解充氧宝(暂未接商城)
  onLearnMore() {
    wx.showModal({
      title: '充氧宝',
      content: '购买功能即将上线，敬请期待 🌱\n（演示阶段，暂未接入商城）',
      showCancel: false,
      confirmText: '好的'
    })
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
