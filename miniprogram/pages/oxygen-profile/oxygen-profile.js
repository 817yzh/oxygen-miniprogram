// pages/oxygen-profile/oxygen-profile.js
// 氧气档案页(健康画像) · V0.8 升级版
// 接入统一用户画像 user-profile-db，展示：人格/基础信息/能量标签/场景偏好/7天趋势/健康声明入口
const { getUserProfile } = require('../../mock/user-profile-db.js')
const { OXYGEN_PERSONALITIES } = require('../../mock/data.js')

Page({
  data: {
    basicInfo: null,     // 基础信息
    personality: null,   // 氧气人格
    energyTags: [],      // 能量标签(星座/五行/恢复/运动)
    scenePrefs: [],      // 场景偏好
    trendText: [],       // 近7天状态趋势(文字)
    trendHasData: false, // 是否有打卡历史
    checkinDays: 0,
    growthTap: ''        // 成长提示
  },

  onLoad() {
    const profile = getUserProfile()
    const { basicInfo, personality, oxygenState, history } = profile

    // 人格：优先统一画像，兜底 OXYGEN_PERSONALITIES[0]
    let p = null
    if (personality.type) {
      p = OXYGEN_PERSONALITIES.find(x => x.id === personality.type) ||
          (personality.name ? { name: personality.name, icon: personality.icon, color: personality.color, tags: personality.tags } : null)
    }
    if (!p) p = OXYGEN_PERSONALITIES[0]

    // 近7天趋势(从真实打卡历史)
    const trend = this.buildTrend(history.checkins)

    this.setData({
      basicInfo,
      personality: { ...p, tagsText: (p.tags || []).join(' · ') },
      energyTags: this.buildEnergyTags(p, personality, basicInfo),
      scenePrefs: this.buildScenePrefs(history.checkins),
      trendText: trend.texts,
      trendHasData: trend.hasData,
      checkinDays: history.checkinDays || 0,
      growthTap: `陪伴第 ${history.checkinDays || 0} 天 · ${history.levelName || '氧气萌新'} · 经验 ${history.exp || 0}`
    })
  },

  // 能量标签(星座/五行/恢复/运动)
  // 注意：data.js 里 sport=数组, chargeWay=字符串, 需分别处理
  buildEnergyTags(p, personality, basicInfo) {
    const zodiac = basicInfo.zodiac || personality.zodiac || p.zodiac || ''
    const five = basicInfo.fiveElements || personality.fiveElements || p.fiveElements || ''
    const restore = (Array.isArray(p.chargeWay) ? p.chargeWay.join(' · ') : p.chargeWay) || '深呼吸补氧'
    const sport = (Array.isArray(p.sport) ? p.sport.slice(0, 2).join(' · ') : p.sport) || '散步冥想'
    return [
      { label: '星座', value: zodiac || '—' },
      { label: '五行', value: five || '—' },
      { label: '恢复方式', value: restore },
      { label: '适合运动', value: sport }
    ]
  },

  // 场景偏好(统计打卡历史里出现过的场景)
  buildScenePrefs(checkins) {
    if (!checkins || !checkins.length) return []
    const map = {}
    checkins.forEach(c => { if (c.scene) map[c.scene] = (map[c.scene] || 0) + 1 })
    const order = ['高原旅行', '脑疲劳', '运动恢复', '银发陪伴']
    return Object.keys(map)
      .sort((a, b) => (map[b] - map[a]) || (order.indexOf(a) - order.indexOf(b)))
      .slice(0, 4)
      .map(s => ({ scene: s, count: map[s] }))
  },

  // 近7天状态趋势(文字化)
  buildTrend(checkins) {
    if (!checkins || !checkins.length) return { texts: [], hasData: false }
    const last7 = checkins.slice(-7).reverse()
    const texts = last7.map(c => {
      const label = c.emotion || c.scene || '记录'
      const day = (c.date || '').slice(5) || ''
      return { day, label, energy: c.energy }
    })
    return { texts, hasData: true }
  },

  // 去测人格
  goMbti() {
    wx.navigateTo({ url: '/pages/mbti/index/index' })
  },

  // 去打卡
  goCheckin() {
    wx.navigateTo({ url: '/pages/checkin/checkin' })
  },

  // 健康声明(合规)
  goDisclaimer() {
    wx.navigateTo({ url: '/pages/health-disclaimer/health-disclaimer' })
  }
})
