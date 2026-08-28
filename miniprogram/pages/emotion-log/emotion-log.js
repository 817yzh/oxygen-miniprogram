// pages/emotion-log/emotion-log.js
const app = getApp()

const EMOJI = {
  '疲惫': '😴', '焦虑': '😰', '烦躁': '😤', '低落': '😔',
  '孤独': '🐋', '开心': '😊', '平静': '😌', '放松': '🌿', '紧张': '😳'
}

Page({
  data: {
    total: 0,
    recentDist: '',   // 近7天情绪分布 "😊3 😴2 😌1"
    logs: [],
    hasLogs: false
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const history = app.globalData.emotionHistory || []
    const logs = history.slice().reverse().map(r => {
      const emo = r.emotionLabel || '平静'
      const date = this.fmtDate(r.date)
      return {
        date,
        emotion: emo,
        emoji: EMOJI[emo] || '🫧',
        keyword: (r.keywords && r.keywords[0]) || r.keyword || emo,
        raw: r
      }
    })
    // 近7天情绪分布
    const last7 = history.slice(-7)
    const dist = {}
    last7.forEach(h => { const e = h.emotionLabel || '平静'; dist[e] = (dist[e] || 0) + 1 })
    const recentDist = Object.keys(dist).map(e => `${EMOJI[e]||'🫧'}${dist[e]}`).join(' ') || '暂无'

    this.setData({
      total: history.length,
      recentDist,
      logs,
      hasLogs: logs.length > 0
    })
  },

  fmtDate(str) {
    if (!str) return ''
    const d = new Date(str)
    if (isNaN(d.getTime())) return str.slice(5)
    return (d.getMonth() + 1) + '/' + d.getDate()
  },

  // 点击查看完整状态报告
  viewDetail(e) {
    const raw = e.currentTarget.dataset.raw
    if (!raw) return
    app.globalData.lastRecord = raw
    wx.navigateTo({ url: '/pages/report/report' })
  },

  goCheckin() {
    wx.navigateTo({ url: '/pages/checkin/checkin' })
  }
})
