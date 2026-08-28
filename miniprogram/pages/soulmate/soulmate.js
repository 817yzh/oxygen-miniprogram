// pages/soulmate/soulmate.js
// 氧气同好 · 同类人格匹配(V0.8 mock)
const { getSoulmates } = require('../../mock/soulmate-db.js')
const { getUserProfile } = require('../../mock/user-profile-db.js')

Page({
  data: {
    myPersonality: '',
    myIcon: '🫧',
    soulmates: [],
    hasPersonality: false
  },

  onLoad() {
    const profile = getUserProfile()
    const my = profile.personality || {}
    const hasPersonality = !!(my.type || my.name)

    this.setData({
      myPersonality: my.name || '',
      myIcon: my.icon || '🫧',
      hasPersonality,
      soulmates: hasPersonality ? getSoulmates(my.type) : []
    })
  },

  // 去测人格
  goMbti() {
    wx.navigateTo({ url: '/pages/mbti/index/index' })
  },

  // 去生成/分享人格卡
  goShare() {
    if (!this.data.hasPersonality) {
      wx.showToast({ title: '请先完成氧气人格测试', icon: 'none' })
      return
    }
    const p = getUserProfile().personality
    const payload = {
      type: p.type || '',
      typeName: p.name || '氧气人格',
      icon: p.icon || '🫧',
      mbti: p.mbti || '',
      color: p.color || '#72D8C4',
      tags: (p.tags || []).slice(0, 3)
    }
    const data = encodeURIComponent(JSON.stringify(payload))
    wx.navigateTo({ url: '/pages/share/personality-share/personality-share?data=' + data })
  },

  // 打招呼(mock)
  sayHi(e) {
    const name = e.currentTarget.dataset.name
    wx.showToast({ title: '已向 ' + name + ' 打招呼 👋（演示）', icon: 'none' })
  },

  // 互相监督(mock引导打卡)
  goCheckin() {
    wx.navigateTo({ url: '/pages/checkin/checkin' })
  }
})
