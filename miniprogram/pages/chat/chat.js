// pages/chat/chat.js
const app = getApp()
const config = require('../../config') // V2.1 后端接入配置
const chatEngine = require('../../utils/chatEngine')
const emotionEngine = require('../../utils/emotionEngine')
const { PREF_FIELDS, DEFAULT_PREFERENCES, buildMemorySummary } = require('../../mock/preferences-db.js')
const emotionService = require('../../utils/emotionService') // V0.8 Agent service层
const { getDailyCourse } = require('../../mock/oxygen-course-db.js') // V0.8 氧气小课堂

Page({
  data: {
    messages: [
      { role: 'oxygen', content: '今天感觉怎么样？和氧氧聊聊吧～' }
    ],
    inputText: '',
    canSend: false,
    userName: '涵涵',
    // V0.8 语音输入
    recording: false,
    recordingTip: '',
    recorder: null,
    // V0.7 氧氧记忆
    memoryEnabled: true,
    memoryCount: 0,
    memorySummary: '还没有记录，点这里让氧氧更懂你',
    showMemoryPanel: false,
    prefFields: [],
    // V1.1 陪伴页数据
    companionDay: 1,
    activeStatus: '正在关注你的状态',
    personalityLabel: '',
    // V0.7 产品知识问答入口
    showProductEntry: true,
    // V0.8 氧气小课堂
    todayCourse: null,
    // ========== V2.0 新增字段 ==========
    // 顶部IP沉浸状态
    ipStatus: '氧氧陪伴中',
    coolIndex: 72,           // 清凉指数（心理降温值）
    intimacyLevel: 3,        // 亲密度等级
    intimacyTitle: '亲密伙伴', // 亲密度称号
    todayOxygenMin: 8,       // 今日已吸氧分钟数
    checkinStreak: 5,        // 连续打卡天数
    // 多模态内容卡片
    showBreathingCard: false, // 正念呼吸卡片
    coolTip: '',              // 清凉小贴士
    // 冰爽微特效
    showFx: false,
    fxParticles: [],
    // 滚动定位
    scrollToView: ''
  },

  onLoad() {
    const user = app.globalData.user
    if (user && user.name) {
      this.setData({ userName: user.name })
    }
    // V1.1 陪伴页: 天数/主动状态/氧气人格
    const comp = (app.globalData && app.globalData.companion) || {}
    const pLabel = (user && user.personality && user.personality.label) || ''
    this.setData({
      companionDay: comp.checkinDays || 1,
      activeStatus: this.buildActiveStatus(),
      personalityLabel: pLabel
    })
    // V0.7 读取氧氧记忆开关(默认开启, 可关闭)
    this.setData({ memoryEnabled: wx.getStorageSync('yyb_memory_on') !== false })
    // V0.9 加载真实偏好
    this.loadMemory()
    // V0.8 今日氧气小课堂
    this.setData({ todayCourse: getDailyCourse(new Date().toDateString()) })
    // 初始化录音管理器
    try {
      const recorder = wx.getRecorderManager()
      recorder.onStop((res) => this.onRecordStop(res))
      this.setData({ recorder })
    } catch (e) {}

    // V2.0 初始化顶部状态数据（复用上面已声明的 comp）
    const oxygenMin = comp.todayOxygenMin || Math.floor(Math.random() * 15) + 3
    const streak = comp.checkinStreak || 5
    const coolIdx = Math.min(95, 60 + Math.floor(Math.random() * 25))
    this.setData({
      todayOxygenMin: oxygenMin,
      checkinStreak: streak,
      coolIndex: coolIdx,
      ipStatus: '氧氧陪伴中'
    })
    // 随机推送一条清凉小贴士
    const coolTips = [
      '夏日午后喝一杯温水，比冰饮更能让身体降温哦',
      '深呼吸3次，想象自己站在森林瀑布边，瞬间清凉',
      '薄荷精油滴在手腕，天然清凉又提神',
      '午后小睡15分钟，比喝3杯咖啡更恢复精力'
    ]
    this.setData({ coolTip: coolTips[Math.floor(Math.random() * coolTips.length)] })
  },

  // V1.1 氧氧主动状态(先模拟, 后续接真实状态)
  buildActiveStatus() {
    const todayRecord = app.globalData && app.globalData.todayRecord
    if (todayRecord) {
      return '今天状态：正在关注你的' + (todayRecord.state || '恢复')
    }
    return '今天想和你聊聊心情 ☁️'
  },

  // V0.9 加载偏好到记忆面板
  loadMemory() {
    const pref = app.getPreferences()
    const summary = buildMemorySummary(pref)
    const filled = Object.keys(DEFAULT_PREFERENCES).filter(k => pref[k]).length
    // 以 options 形式展示可编辑项
    const prefFields = PREF_FIELDS.map(f => ({ ...f, value: pref[f.key] || '' }))
    this.setData({
      prefFields,
      memorySummary: summary,
      memoryCount: filled
    })
  },

  // V0.9 选择偏好(喂给氧氧记忆)
  pickPref(e) {
    const key = e.currentTarget.dataset.key
    const val = e.currentTarget.dataset.val
    app.setPreference(key, val)
    this.loadMemory()
    const labels = { productModel: '款式', parentAge: '父母年龄段', highlandFreq: '高原频率', sleepPattern: '作息偏好' }
    wx.showToast({ title: `已记住${labels[key] || ''}`, icon: 'none' })
  },

  // ===== V0.7 氧氧记忆 =====
  toggleMemory() {
    const on = !this.data.memoryEnabled
    this.setData({ memoryEnabled: on })
    wx.setStorageSync('yyb_memory_on', on ? true : false)
    wx.showToast({ title: on ? '氧氧已开始记住你 💚' : '已关闭氧氧记忆', icon: 'none' })
  },

  toggleMemoryPanel() {
    this.setData({ showMemoryPanel: !this.data.showMemoryPanel })
  },

  // V0.8 氧气小课堂(自首页归位)
  goCourse() {
    const course = this.data.todayCourse || {}
    wx.showModal({
      title: (course.cover || '☁️') + ' ' + (course.title || '氧气小课堂'),
      content: (course.content || '') + '\n\n💡 ' + (course.tip || ''),
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#72D8C4'
    })
  },

  // V1.1 Agent 快捷入口(陪伴式: 情绪入口, 非客服)
  agentQuick(e) {
    const q = e.currentTarget.dataset.q
    const map = {
      tired: '今天有点累，感觉提不起劲 😔',
      good: '今天状态还不错，想和你分享下 😄',
      chat: '想和氧氧聊聊，陪我说说话吧',
      adjust: '帮我做个快速调节，缓一缓'
    }
    const text = map[q]
    if (!text) return
    this.setData({ inputText: text, canSend: true }, () => this.send())
  },

  // V0.7 产品知识问答 =====
  goProductEntry() {
    // 填入示例产品问题并自动发送
    const text = '充氧宝能做什么？'
    this.setData({ inputText: text, canSend: true })
    this.send()
  },

  goProductCenter() {
    wx.switchTab({ url: '/pages/product-center/product-center' })
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value, canSend: e.detail.value.trim().length > 0 })
  },

  send() {
    const text = this.data.inputText.trim()
    if (!text) return

    // 用户消息入气泡
    const messages = this.data.messages
    messages.push({ role: 'user', content: text })
    // 更新IP状态为"回复中"
    this.setData({
      messages,
      inputText: '',
      canSend: false,
      ipStatus: '氧氧回复中...',
      scrollToView: 'msg-' + (messages.length - 1)
    }, () => {
      this.scrollToBottom()
      // 模拟氧氧"思考"延迟
      setTimeout(() => this.oxygenReply(text), 800)
    })
  },

  // V0.8 Agent化: 通过 emotionService 统一处理(输入→情绪分析→chatEngine→产品推荐)
  // V2.1 升级: 优先后端豆包 LLM(真AI陪伴), 后端不可用时回退本地 emotionService(mock)
  oxygenReply(userText) {
    // 本地 service 照常分析(供情绪/博主/正念卡/记录使用，不依赖后端)
    const svc = emotionService.process(userText, {
      userName: this.data.userName,
      personality: (app.globalData.user || {}).personality,
      preferences: app.getPreferences(),
      scene: this.currentScene()
    })

    // 先尝试后端豆包（真AI），成功用真回复；失败/超时/未配置则用本地 mock
    const backendReply = this.callBackendChat(userText)
    backendReply.then((aiText) => {
      const replyText = aiText || svc.replyText
      this.appendOxygenReply(replyText, svc, userText)
    }).catch(() => {
      this.appendOxygenReply(svc.replyText, svc, userText)
    })
  },

  // V2.1 调后端豆包聊天接口（真AI回复）
  // 返回 Promise<string|null>：成功返回氧氧文字，失败/未配置返回 null
  callBackendChat(userText) {
    const api = (config.api && config.api.enabled) ? config.api : null
    if (!api || !api.baseUrl) return Promise.resolve(null)
    return new Promise((resolve) => {
      wx.request({
        url: api.baseUrl + '/api/chat',
        method: 'POST',
        timeout: api.requestTimeout || 8000,
        header: {
          'Content-Type': 'application/json',
          'x-user-id': 'oxy_user_' + (app.globalData.user_id || 'guest')
        },
        data: {
          text: userText,
          scene: this.currentScene()
        },
        success: (res) => {
          const data = res.data && res.data.data
          if (res.statusCode === 200 && data && data.replyText) {
            resolve(data.replyText)
          } else {
            console.warn('[backend] 聊天接口未返回有效回复, 回退本地', res)
            resolve(null)
          }
        },
        fail: (err) => {
          console.warn('[backend] 聊天接口调用失败, 回退本地: ', err.errMsg || err)
          resolve(null)
        }
      })
    })
  },

  // V2.1 把氧氧回复放进气泡 + 附带本地增强(博主卡/正念呼吸卡/情绪记录)
  appendOxygenReply(replyText, svc, userText) {
    const messages = this.data.messages
    messages.push({ role: 'oxygen', content: replyText })
    // V0.8 博主推荐: service 匹配到博主 → 追加一条博主卡(展示真实案例)
    if (svc.creator) {
      messages.push({ role: 'creator', content: '看看这位博主怎么说 👇', creator: svc.creator })
    }
    // V2.0 如果用户表达疲惫/焦虑/压力，推送正念呼吸卡片
    const needBreathing = ['累', '疲惫', '焦虑', '压力', '烦躁', '紧张', '失眠', '睡不着']
    const shouldShowCard = needBreathing.some(kw => userText.includes(kw))
    if (shouldShowCard && !this.data.showBreathingCard) {
      setTimeout(() => { this.setData({ showBreathingCard: true }) }, 600)
    }
    this.setData({
      messages,
      ipStatus: '氧氧陪伴中',
      scrollToView: 'msg-' + (messages.length - 1)
    }, () => this.scrollToBottom())
    // V0.8 聊天情绪分析+存储
    this.recordChat(userText, replyText, svc)
  },

  // V0.8 博主卡点击
  onCreatorTap(e) {
    const c = (e.detail && e.detail.creator) || {}
    wx.showModal({
      title: c.name ? c.name + ' · ' + (c.scene || '') : '签约博主',
      content: (c.description || '') + '\n\n🎬 视频内容即将上线（演示阶段）',
      showCancel: false,
      confirmText: '了解啦',
      confirmColor: '#72D8C4'
    })
  },

  // 当前场景(从偏好/记忆推断, 供情绪分析用)
  currentScene() {
    const pref = app.getPreferences()
    if (pref.highlandFreq && pref.highlandFreq !== '从不') return 'plateau'
    if (pref.productModel && (String(pref.productModel).indexOf('运动') >= 0)) return 'sport'
    return ''
  },

  // V0.8 Agent化: 聊天情绪分析(service提供) + 存储
  recordChat(userInput, aiReply, svc) {
    // 优先用 service 已算好的情绪, 否则回退本地分析
    const label = (svc && svc.emotion) || emotionEngine.analyze(userInput || '').emotionLabel || '平静'
    const kw = (emotionEngine.analyze(userInput || '')).keywords || []
    // 情感倾向
    const neg = ['疲惫', '焦虑', '烦躁', '低落', '孤独', '紧张']
    const pos = ['开心', '放松']
    const sentiment = neg.includes(label) ? 'negative' : pos.includes(label) ? 'positive' : 'neutral'
    const record = {
      id: 'chat_' + Date.now(),
      timestamp: new Date().toISOString(),
      userInput: userInput,
      aiReply: aiReply,
      emotion: label,
      keywords: kw,
      sentiment: sentiment,
      isProduct: !!(svc && svc.isProduct),
      productHint: (svc && svc.productHint) || ''
    }
    const history = wx.getStorageSync('yyb_chat_history') || []
    history.push(record)
    if (history.length > 100) history.splice(0, history.length - 100)
    wx.setStorageSync('yyb_chat_history', history)

    // V0.7 成长值: 聊天行为 + 成就检测
    app.addGrowth('chat')
  },

  scrollToBottom() {
    wx.nextTick(() => {
      wx.pageScrollTo({ scrollTop: 99999, duration: 200 })
    })
  },

  // 记录状态入口
  goCheckin() {
    wx.navigateTo({ url: '/pages/checkin/checkin' })
  },

  // ========== V2.0 新增方法 ==========

  // 快捷倾诉标签点击
  quickTagTap(e) {
    const tag = e.currentTarget.dataset.tag
    const tagMap = {
      hot: '今天好燥热，心情有点烦躁 😤',
      tired: '工作累了，感觉有点提不起劲 😮‍💨',
      cheer: '氧氧，给我一点鼓励吧 💪',
      oxygen: '想要吸氧，帮我快速放松一下 🫧',
      anxious: '最近有点焦虑，心里不踏实 😰',
      happy: '今天很开心，想和你分享一下 😄'
    }
    const text = tagMap[tag]
    if (!text) return
    // 触发冰爽特效
    this.triggerIceFx()
    // 填入并发送
    this.setData({ inputText: text, canSend: true }, () => this.send())
  },

  // 跳转正念呼吸页
  startBreathing() {
    wx.navigateTo({
      url: '/pages/breathing/breathing',
      fail: () => {
        wx.showToast({ title: '呼吸引导即将上线 🫁', icon: 'none' })
      }
    })
  },

  // 触发冰爽微特效（薄荷冰块掉落）
  triggerIceFx() {
    const particles = []
    for (let i = 0; i < 12; i++) {
      particles.push({
        id: 'fx_' + Date.now() + '_' + i,
        x: Math.random() * 90 + 5,
        delay: Math.random() * 0.5
      })
    }
    this.setData({ showFx: true, fxParticles: particles })
    clearTimeout(this._fxTimer)
    this._fxTimer = setTimeout(() => {
      this.setData({ showFx: false, fxParticles: [] })
    }, 2200)
  },

  // 播放瀑布白噪音（Mock，实际接入音频文件）
  playWhiteNoise() {
    wx.showToast({
      title: '🔊 瀑布白噪音即将上线',
      icon: 'none'
    })
  },

  // 换一期小课堂
  refreshCourse() {
    const coolTips = [
      '夏日午后喝一杯温水，比冰饮更能让身体降温哦',
      '深呼吸3次，想象自己站在森林瀑布边，瞬间清凉',
      '薄荷精油滴在手腕，天然清凉又提神',
      '午后小睡15分钟，比喝3杯咖啡更恢复精力',
      '用温水泡脚10分钟，促进血液循环反而更凉快',
      '多吃西瓜、黄瓜等水分充足的水果，由内而外降温'
    ]
    const current = this.data.coolTip
    let next = current
    while (next === current) {
      next = coolTips[Math.floor(Math.random() * coolTips.length)]
    }
    this.setData({ coolTip: next })
    wx.showToast({ title: '已换一期 ↻', icon: 'none' })
  }
})
