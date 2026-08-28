// pages/chat-stat/chat-stat.js
const app = getApp()

const EMOJI = {
  '疲惫': '😴', '焦虑': '😰', '烦躁': '😤', '低落': '😔',
  '孤独': '🐋', '开心': '😊', '平静': '😌', '放松': '🌿', '紧张': '😳'
}

Page({
  data: {
    total: 0,
    sentimentSummary: '',
    recentDist: '',
    topKeywords: [],
    hasData: false
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const history = wx.getStorageSync('yyb_chat_history') || []
    if (history.length === 0) {
      this.setData({ total: 0, hasData: false })
      return
    }

    // 总条数
    const total = history.length

    // 近7天情绪分布
    const last7 = history.slice(-7)
    const dist = {}
    const senti = { positive: 0, neutral: 0, negative: 0 }
    last7.forEach(h => {
      const e = h.emotion || '平静'
      dist[e] = (dist[e] || 0) + 1
      if (h.sentiment) senti[h.sentiment] = (senti[h.sentiment] || 0) + 1
    })
    const recentDist = Object.keys(dist).map(e => `${EMOJI[e] || '🫧'}${dist[e]}`).join(' ') || '暂无'

    // 情绪倾向汇总
    const n = last7.length || 1
    const negPct = Math.round((senti.negative / n) * 100)
    const posPct = Math.round((senti.positive / n) * 100)
    let sentimentSummary = '情绪平稳'
    if (negPct >= 50) sentimentSummary = '近7天偏疲惫/焦虑，记得多照顾自己 💚'
    else if (posPct >= 40) sentimentSummary = '近7天整体偏积极，继续保持好心情 🌱'

    // 高频关键词 TOP10
    const kwCount = {}
    history.forEach(h => (h.keywords || []).forEach(k => { kwCount[k] = (kwCount[k] || 0) + 1 }))
    const topKeywords = Object.keys(kwCount)
      .sort((a, b) => kwCount[b] - kwCount[a])
      .slice(0, 10)
      .map(k => ({ word: k, count: kwCount[k] }))

    this.setData({
      total,
      sentimentSummary,
      recentDist,
      topKeywords,
      hasData: true
    })
  },

  // 静默统计展示(无趋势图, 用分布文字代替, 保持轻量)
  goChat() {
    wx.switchTab({ url: '/pages/chat/chat' })
  }
})
