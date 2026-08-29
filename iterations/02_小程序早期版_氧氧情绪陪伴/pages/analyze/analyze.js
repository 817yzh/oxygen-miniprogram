// P3 · 分析过渡页
const app = getApp()

// 引入情绪分析引擎（文字）
const emotionEngine = require('../../utils/emotionEngine')
// 引入人脸情绪识别（拍照）
const faceApi = require('../../utils/faceApi')

Page({
  data: {
    phase: 'analyzing', // analyzing | done
    phaseClass: 'phase-analyzing',
    progress: 0,
    phaseText: '氧氧正在感受你的状态',
    phaseSub: '深呼吸，等一等就好'
  },

  onLoad() {
    // 开始分析
    this.startAnalysis()
  },

  startAnalysis() {
    const pending = app.globalData.pendingCheckin || {}
    const checkinType = pending.checkinType || 'text'

    // 根据打卡类型调整文案
    const phases = (checkinType === 'photo')
      ? [
          { text: '氧氧正在看你的照片', sub: '它在仔细感受你脸上的状态', progress: 15 },
          { text: '捕捉到了你的表情信号', sub: '一点点分析，一点点理解', progress: 35 },
          { text: '氧氧正在匹配场景信息', sub: '结合场景给你更贴切的回应', progress: 55 },
          { text: '生成状态解读中', sub: '再加入一点点温暖', progress: 75 },
          { text: '最后一步，准备你的专属卡片', sub: '氧氧马上就好', progress: 90 }
        ]
      : [
          { text: '氧氧正在感受你的状态', sub: '深呼吸，等一等就好', progress: 15 },
          { text: '捕捉到了你的情绪信号', sub: '它在一点点理解你说的话', progress: 35 },
          { text: '氧氧正在匹配场景信息', sub: '结合场景给你更贴切的回应', progress: 55 },
          { text: '生成状态解读中', sub: '再加入一点点温暖', progress: 75 },
          { text: '最后一步，准备你的专属卡片', sub: '氧氧马上就好', progress: 90 }
        ]

    let step = 0
    const stepInterval = setInterval(() => {
      if (step < phases.length) {
        const p = phases[step]
        this.setData({
          phaseText: p.text,
          phaseSub: p.sub,
          progress: p.progress
        })
        step++
      } else {
        clearInterval(stepInterval)
        // 分析完成，根据类型走不同分支
        if (checkinType === 'photo') {
          this.doPhotoAnalyze(pending)
        } else {
          this.doTextAnalyze(pending)
        }
      }
    }, 400)
  },

  // ===== 拍照打卡分支 =====
  doPhotoAnalyze(pending) {
    const photoPath = pending.photo || ''
    const scene = pending.scene || ''

    // 调用人脸情绪识别API（当前为mock模式）
    faceApi.recognizeFace(photoPath, scene)
      .then(faceResult => {
        // 组装结果（复用餐具引擎的文案映射表）
        const result = this.assemblePhotoResult(faceResult, scene)
        this.saveAndRedirect(result)
      })
      .catch(err => {
        console.error('[Analyze] 拍照识别失败，降级兜底:', err)
        // API调用失败时降级为默认中性结果
        const fallback = {
          emotionLabel: '平静',
          confidence: 0.3,
          detail: []
        }
        const result = this.assemblePhotoResult(fallback, scene)
        this.saveAndRedirect(result)
      })
  },

  /**
   * 组装拍照识别的完整结果
   * 复用现有 emotionEngine 中的文案映射表
   */
  assemblePhotoResult(faceResult, scene) {
    const emotionLabel = faceResult.emotionLabel || '平静'
    const confidence = faceResult.confidence || 0.3
    const detail = faceResult.detail || []

    // 从 emotionEngine 的映射表中获取文案
    // （require 进来的 emotionEngine 有 PERSONA_LINES, INSIGHT_TEMPLATES 等，
    // 但它们是模块私有变量，我们通过 analyze() 函数或再 require 文案）

    // 直接调用 emotionEngine.analyze() 获取文案，
    // 传入一个占位文本以命中对应情绪标签
    const textHint = this.getTextHintForEmotion(emotionLabel)
    const engineResult = emotionEngine.analyze(textHint, scene)

    // 覆盖情绪标签和置信度为拍照识别结果
    return {
      emotionLabel: emotionLabel,
      confidence: confidence,
      sceneTag: scene || 'general',
      personaLine: engineResult.personaLine,
      insight: engineResult.insight,
      regulationTip: engineResult.regulationTip,
      productHint: engineResult.productHint,
      // 额外传一份概率分布给结果页（可选的环形图彩蛋）
      emotionDetail: detail
    }
  },

  /**
   * 根据情绪标签返回一个能命中对应文案的关键词
   */
  getTextHintForEmotion(emotion) {
    const hintMap = {
      '开心': '今天很开心',
      '平静': '心情平静',
      '放松': '感觉很放松',
      '焦虑': '有点焦虑',
      '烦躁': '觉得烦躁',
      '疲惫': '感觉很累',
      '低落': '心情低落',
      '紧张': '有点紧张',
      '孤独': '感觉孤独'
    }
    return hintMap[emotion] || '心情平静'
  },

  // ===== 文字打卡分支（原有逻辑不变）=====
  doTextAnalyze(pending) {
    const userText = pending.text || ''
    const scene = pending.scene || ''

    // 调用情绪分析引擎
    const result = emotionEngine.analyze(userText, scene)

    const record = {
      date: new Date().toDateString(),
      text: userText,
      scene: scene,
      ...result
    }

    this.saveLocalRecord(record)
    this.finishAndRedirect(result, record)
  },

  /**
   * 保存结果并跳转（两个分支共用）
   */
  saveAndRedirect(result) {
    const today = new Date().toDateString()
    const record = {
      date: today,
      text: '（拍照打卡）',
      scene: result.sceneTag || '',
      ...result
    }

    this.saveLocalRecord(record)
    this.finishAndRedirect(result, record)
  },

  /** 写入本地存储 */
  saveLocalRecord(record) {
    let history = wx.getStorageSync('emotionHistory') || []
    const today = record.date
    const existingIdx = history.findIndex(h => h.date === today)
    if (existingIdx >= 0) {
      history[existingIdx] = record
    } else {
      history.push(record)
    }
    if (history.length > 30) {
      history = history.slice(-30)
    }
    wx.setStorageSync('emotionHistory', history)
  },

  /** 跳转到结果页 */
  finishAndRedirect(result, record) {
    // 保存到全局
    app.globalData.lastResult = result
    app.globalData.lastRecord = record
    app.globalData.pendingCheckin = null

    // 更新UI后跳转
    this.setData({
      phaseText: '完成！氧氧已经准备好了',
      phaseSub: '',
      progress: 100,
      phase: 'done'
    })

    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/result/result'
      })
    }, 500)
  }
})
