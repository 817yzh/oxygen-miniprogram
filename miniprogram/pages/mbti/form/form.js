// pages/mbti/form/form.js
const app = getApp()
// 路径: form.js 在 pages/mbti/form/，上三层 = 氧氧宝根 → utils/faceApi.js
const faceApi = require('../utils/faceApi.js')

Page({
  data: {
    step: 1,
    name: '氧友',          // V0.8 不再收集姓名，用默认称呼
    birthday: '',
    gender: '',
    avatar: '',
    faceMood: '',        // happy/calm/tired (趣味感知mock)
    faceText: '',        // 趣味感知结果文案
    faceDetecting: false,
    canSubmit: false
  },

  onAvatarTap() {
    // 拍照/选图 → 调后端豆包多模态识别真实情绪（失败回退mock）
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const file = res.tempFiles[0].tempFilePath
        this.setData({
          avatar: file,
          faceDetecting: true,
          faceText: '氧氧正在观察你的今日状态...'
        }, () => {
          faceApi.recognizeFace(file, '').then((result) => {
            const mood = result.emotionLabel || '平静'
            // 归一化到情绪关键词
            const moodKey = this.toMoodKey(mood)
            const txt = {
              happy: '检测到：你的表情看起来很开心，元气满满 ☀️',
              calm: '检测到：你的表情看起来比较放松，很安稳 🌱',
              tired: '检测到：你看起来有点疲惫，记得好好休息 🛋️',
              low: '检测到：你有点低落，让氧氧抱抱你 🤗',
              anxious: '检测到：你似乎有些紧张，慢慢呼吸 🫁',
              calm2: '检测到：你此刻很平静，状态不错 🌿'
            }
            const moodText = {
              '开心': 'happy', '元气': 'happy',
              '平静': 'calm2', '放松': 'calm',
              '疲惫': 'tired', '困倦': 'tired',
              '低落': 'low', '难过': 'low', '悲伤': 'low',
              '焦虑': 'anxious', '紧张': 'anxious', '烦躁': 'anxious'
            }
            const mkey = this.toMoodKey(mood)
            // 保存到全局，后续 MBTI 结果页可读取
            app.globalData.faceMood = { mood: mkey, confidence: result.confidence || 0.8 }
            const disp = result.insight || txt[mkey] || txt.calm
            this.setData({ faceDetecting: false, faceMood: mkey, faceText: disp })
          })
        })
      }
    })
  },

  // 情绪标签 → 内部 mood key（兼容多标签）
  toMoodKey(mood) {
    const map = {
      '开心': 'happy', '平静': 'calm2', '放松': 'calm', '疲惫': 'tired',
      '困倦': 'tired', '低落': 'low', '难过': 'low', '悲伤': 'low',
      '焦虑': 'anxious', '紧张': 'anxious', '烦躁': 'low', '惊讶': 'calm2',
      '孤独': 'low'
    }
    return map[mood] || 'calm2'
  },

  onBirthday(e) { this.setData({ birthday: e.detail.value }, () => this.check()) },
  onGender(e) { this.setData({ gender: e.currentTarget.dataset.g }, () => this.check()) },

  // V0.8 不再需要姓名，只需生日+性别即可提交
  check() {
    const { birthday, gender } = this.data
    this.setData({ canSubmit: birthday && gender })
  },

  next() {
    if (!this.data.canSubmit) {
      wx.showToast({ title: '请完善生日和性别哦', icon: 'none' })
      return
    }
    app.globalData.user = {
      name: this.data.name || '氧友',
      birthday: this.data.birthday,
      gender: this.data.gender,
      avatar: this.data.avatar,
      personality: '',
      hasTestedMBTI: false
    }
    app.globalData.faceMood = app.globalData.faceMood || { mood: this.data.faceMood || 'calm', confidence: 0.85 }
    wx.navigateTo({ url: '/pages/mbti/loading/loading' })
  }
})
