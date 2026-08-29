// P4 · 结果页
const app = getApp()

const EMOTION_ICONS = {
  '开心': '😄',
  '平静': '😌',
  '放松': '😊',
  '焦虑': '😟',
  '烦躁': '😤',
  '疲惫': '😩',
  '低落': '😢',
  '紧张': '😰',
  '孤独': '🥺'
}

// 情绪颜色映射（用于分布展示）
const EMOTION_COLORS = {
  '开心': '#35d6b8',
  '平静': '#6bc6ff',
  '放松': '#7ed3a8',
  '焦虑': '#ffb84d',
  '烦躁': '#ff7f73',
  '疲惫': '#8b95a7',
  '低落': '#8c7ab5',
  '紧张': '#ff9f7c',
  '孤独': '#a9b0c9'
}

Page({
  data: {
    result: {},
    emotionIcon: '😌',
    confidencePercent: 0,
    showDistribution: false,
    distributionData: []
  },

  onLoad() {
    const result = app.globalData.lastResult || {}
    if (!result.emotionLabel) {
      // 没有结果时兜底
      this.setData({
        result: {
          emotionLabel: '平静',
          confidence: 0.5,
          insight: '氧氧正在倾听，试着记录点什么吧',
          regulationTip: '试试做3次深呼吸，吸气4秒、屏息4秒、呼气6秒',
          productHint: '给自己充充氧，让身心都轻松一点',
          personaLine: '今日是稳稳的湖泊，风平浪静 🌊'
        },
        emotionIcon: '😌',
        confidencePercent: 50
      })
      return
    }

    // 组装分布数据（如果有API返回的详细概率分布）
    let distributionData = []
    let showDistribution = false
    if (result.emotionDetail && result.emotionDetail.length > 0) {
      // 映射标签并过滤低概率项
      const faceApi = require('../../utils/faceApi')
      const mapped = result.emotionDetail.map(item => ({
        label: faceApi.mapApiLabel(item.label),
        confidence: item.confidence
      }))
      // 合并同标签概率
      const mergedMap = {}
      for (const item of mapped) {
        if (mergedMap[item.label]) {
          mergedMap[item.label] += item.confidence
        } else {
          mergedMap[item.label] = item.confidence
        }
      }
      // 转为数组，按概率降序，取前4个
      const merged = Object.entries(mergedMap)
        .map(([label, confidence]) => ({ label, confidence: Math.round(confidence * 100) }))
        .filter(item => item.confidence > 5) // 过滤掉低于5%的
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 4)

      if (merged.length >= 2) {
        distributionData = merged
        showDistribution = true
      }
    }

    this.setData({
      result: result,
      emotionIcon: EMOTION_ICONS[result.emotionLabel] || '😌',
      confidencePercent: Math.round((result.confidence || 0.5) * 100),
      showDistribution,
      distributionData
    })
  },

  goRegulation() {
    wx.navigateTo({
      url: '/pages/regulation/regulation'
    })
  },

  shareResult() {
    const result = this.data.result
    const shareText = `【氧氧情绪卡片】\n${result.personaLine || ''}\n\n氧氧说：${result.insight}\n\n${result.regulationTip || ''}\n\n—— 来自氧氧情绪陪伴 💚`

    wx.setClipboardData({
      data: shareText,
      success() {
        wx.showToast({
          title: '文案已复制，去分享吧',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  goHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },

  // 环形图的颜色方法
  getBarColor(e) {
    const label = e.currentTarget.dataset.label
    return EMOTION_COLORS[label] || '#ccc'
  }
})
