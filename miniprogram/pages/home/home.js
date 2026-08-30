/**
 * pages/home/home.js
 * V2.0 · 极简治愈首页逻辑
 *
 * 保留: 问候语 / 氧气数据加载 / 陪伴天数 / 成长信息
 * 新增: IP点击互动(震动+Q弹+治愈气泡) / 球体点击上滑四维面板 / 跳转呼吸引导页
 * 移除: 视频播放 / 场景卡片 / 今日建议卡 / 行动卡(均收进其他页面)
 */

const app = getApp()
const config = require('../../config')
const { GREETING_LIST } = require('../../mock/data.js')
const { getOxygenMap } = require('../../mock/oxygen-map-db.js')
const { getComfortWord, detectSceneByScore } = require('../../mock/comfort-words-db.js')

Page({
  data: {
    // 问候
    greetMain: '晚上好',
    userName: '涵涵',
    companionDay: 1,
    // 氧气数据
    oxygenMetrics: [],    // 四维指标 [{key,label,icon,value}]
    oxygenScore: 70,      // 综合指数(四维均值)
    oxygenHint: '',       // 状态提示语
    // 四维雷达图数据（radar-chart组件需要的格式）
    radarIndexes: {},     // {emotion:70, oxygen:65, vigor:86, recover:85}
    radarDimensions: [],  // [{key, name}]
    // V2.0 交互状态
    showDimBubbles: false,       // 维度气泡是否弹出
    showComfortBubble: false,   // 治愈气泡是否显示
    comfortWord: '',            // 当前治愈文案
    ipTapActive: false,         // IP是否在Q弹动画中
    // V3.0 今日充氧手账抽屉
    drawerOpen: false,          // 手账抽屉是否打开
    drawerTitle: '此刻，你的氧状态如何？',
    todayRecorded: false,       // 今日是否已记录
    // Q2 · 五档氧状态轻选
    moodOptions: [
      { key: 'full',  icon: '🌈', label: '满氧' },
      { key: 'calm',  icon: '🌤', label: '平稳' },
      { key: 'light', icon: '🌫', label: '轻微缺氧' },
      { key: 'low',   icon: '🌧', label: '低氧提醒' },
      { key: 'chaos', icon: '🌀', label: '混乱中' }
    ],
    moodPick: '',               // 已选氧状态
    noteText: '',               // 手账文字
    photoPath: '',              // 氧气瞬间照片
    statusBarText: '',          // 顶部常驻状态条文案
    statusBarDone: false,       // 状态条是否已完成态
    // 品牌视频位（URL 来自配置项；留空或已看过时不展示，避免黑屏）
    introVideoUrl: '',          // config.introVideoUrl 的线上 HTTPS 地址
    showIntroVideo: false       // 是否渲染视频块
  },

  onLoad() {
    this.setGreeting()
    this.loadOxygenData()
    this.initIntroVideo()
  },

  // ========== 品牌视频位（回归守卫: 空/失效 URL 不得黑屏） ==========
  initIntroVideo() {
    const introVideoUrl = (config.introVideoUrl || '').trim()
    const seen = wx.getStorageSync('oxygen_intro_seen')
    this.setData({
      introVideoUrl,
      showIntroVideo: !!introVideoUrl && !seen
    })
  },

  // 视频加载失败兜底：隐藏视频块，避免残留黑屏
  onIntroVideoError() {
    this.setData({ showIntroVideo: false })
  },

  // 用户主动关闭：记住已看过，下次不再自动播
  closeIntroVideo() {
    wx.setStorageSync('oxygen_intro_seen', true)
    this.setData({ showIntroVideo: false })
  },

  onShow() {
    this.refresh()
  },

  // ========== 问候语（按时段） ==========
  setGreeting() {
    const h = new Date().getHours()
    let period = 'relax'
    let greetMain = '晚上好'
    if (h >= 6 && h < 11) { period = 'morning'; greetMain = '早上好' }
    else if (h >= 11 && h < 18) { period = 'energy'; greetMain = '午安' }
    else { period = 'relax'; greetMain = h >= 18 && h < 22 ? '晚上好' : '夜深了' }
    this.setData({ greetMain })
  },

  // ========== 刷新数据（页面显示时调用） ==========
  refresh() {
    const user = app.globalData.user
    const todayRecorded = app.hasTodayRecord ? app.hasTodayRecord() : !!app.globalData.todayRecord
    this.setData({
      userName: (user && user.name) || '涵涵',
      companionDay: this.getCompanionDay(),
      todayRecorded,
      statusBarText: this.buildStatusBar(todayRecorded),
      statusBarDone: todayRecorded
    })
    this.loadOxygenData()
  },

  // 今日氧气记录入口文案（未记录 → 明确引导记录；已记录 → 完成态）
  buildStatusBar(done) {
    if (done) return '今日氧气已记录 · 明天也要好好呼吸 💚'
    const h = new Date().getHours()
    if (h >= 6 && h < 11) return '早呀，记一笔今天的氧气状态'
    if (h >= 18 || h < 4) return '夜深了，存好今天这一口氧气'
    return '记录一下今天的氧气状态'
  },

  // 陪伴天数（来自 companion.checkinDays）
  getCompanionDay() {
    const c = (app.globalData && app.globalData.companion) || {}
    return c.checkinDays || 1
  },

  // ========== 加载氧气数据（四维+综合指数） ==========
  loadOxygenData() {
    // 场景倾向：如果今日有打卡记录，用打卡场景影响数据
    const todayRecord = app.globalData.todayRecord
    const scene = (todayRecord && todayRecord.state) || ''
    const map = getOxygenMap(scene)
    // 维度文案口语化映射（去掉体检报告味）
    const labelMap = {
      '情绪能量': '心情晴雨',
      '身体含氧感': '身体轻松度',
      '活力指数': '续航力',
      '恢复状态': '夜间恢复力'
    }
    const spokenMetrics = map.metrics.map(m => ({
      ...m,
      label: labelMap[m.label] || m.label
    }))
    this.setData({
      oxygenMetrics: spokenMetrics,
      oxygenHint: map.hint,
      oxygenScore: this.calcOxygenScore(map.metrics),
      // 转换为radar-chart组件需要的格式
      radarIndexes: this.buildRadarIndexes(map.metrics),
      radarDimensions: this.buildRadarDimensions(map.metrics)
    })
  },

  // 计算氧气综合指数（四维均值）
  calcOxygenScore(metrics) {
    const arr = Array.isArray(metrics) ? metrics : []
    if (arr.length === 0) return 70
    let sum = 0
    arr.forEach(m => { sum += Number(m.value) || 0 })
    return Math.round(sum / arr.length)
  },

  // 把四维指标转为雷达图的indexes格式 {key: value}
  buildRadarIndexes(metrics) {
    const obj = {}
    const arr = Array.isArray(metrics) ? metrics : []
    arr.forEach(m => { obj[m.key] = Number(m.value) || 0 })
    return obj
  },

  // 把四维指标转为雷达图的dimensions格式 [{key, name}]
  buildRadarDimensions(metrics) {
    const arr = Array.isArray(metrics) ? metrics : []
    return arr.map(m => ({ key: m.key, name: m.label }))
  },

  // ========== V2.0 交互①：点击IP ==========
  // V3.0 改为：点击IP → 打开「今日充氧手账」抽屉（轻量打卡入口）
  onIpTap(e) {
    // 阻止事件冒泡到球体（避免同时打开四维面板）
    if (e && e.stopPropagation) e.stopPropagation()

    // 1. 轻微震动反馈
    wx.vibrateShort({ type: 'light' })

    // 2. Q弹动画
    this.setData({ ipTapActive: true })
    setTimeout(() => {
      this.setData({ ipTapActive: false })
    }, 500)

    // 3. 已记录 → 弹治愈气泡陪伴；未记录 → 打开手账抽屉
    if (this.data.todayRecorded) {
      const scene = detectSceneByScore(this.data.oxygenScore)
      const word = getComfortWord(scene)
      this.setData({ comfortWord: word, showComfortBubble: true })
      clearTimeout(this._bubbleTimer)
      this._bubbleTimer = setTimeout(() => {
        this.setData({ showComfortBubble: false })
      }, 3000)
    } else {
      this.openDrawer()
    }
  },

  // ========== V3.0 今日充氧手账抽屉 ==========
  openDrawer() {
    // Q5 · 晨昏呼应的抽屉标题
    const h = new Date().getHours()
    const title = (h >= 6 && h < 11) ? '早呀，今天你的氧状态怎么样？'
      : (h >= 18 || h < 4) ? '夜深了，今天的氧，我帮你存好'
      : '此刻，你的氧状态如何？'
    this.setData({ drawerOpen: true, drawerTitle: title })
  },
  closeDrawer() {
    this.setData({ drawerOpen: false })
  },
  // 阻止遮罩层滚动穿透
  noop() {},

  // 选择氧状态胶囊
  onPickMood(e) {
    const key = e.currentTarget.dataset.key
    wx.vibrateShort({ type: 'light' })
    this.setData({ moodPick: key })
  },

  // 手账输入
  onNoteInput(e) {
    this.setData({ noteText: e.detail.value })
  },

  // 拍一口今天的氧气（可选照片）
  onTakePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const path = res.tempFiles[0].tempFilePath
        wx.vibrateShort({ type: 'light' })
        this.setData({ photoPath: path })
      }
    })
  },

  // 确认完成今日充氧
  confirmCheckin() {
    if (!this.data.moodPick) {
      wx.showToast({ title: '先选一下此刻的氧状态吧', icon: 'none' })
      return
    }
    // 记录（轻量打卡：状态 + 可选照片）
    app.addQuickRecord(this.data.moodPick, this.data.noteText, this.data.photoPath)

    // 反馈：抽屉收回 + IP开心 + 天数跳动 +1
    this.setData({ drawerOpen: false, moodPick: '', noteText: '', photoPath: '' })
    wx.vibrateShort({ type: 'light' })

    // IP 开心庆祝动效（Q弹）
    this.setData({ ipTapActive: true })
    setTimeout(() => this.setData({ ipTapActive: false }), 600)

    // 刷新数据（天数 +1、今日已记录点亮、状态条切换）
    setTimeout(() => this.refresh(), 350)

    wx.showToast({ title: '今日充氧已完成，明天见 💚', icon: 'none' })
  },

  // ========== V2.0 交互②：点击球体 → 弹出/收起维度气泡 ==========
  onBallTap() {
    const show = !this.data.showDimBubbles
    this.setData({ showDimBubbles: show })
    // 弹出时轻微震动反馈
    if (show) {
      wx.vibrateShort({ type: 'light' })
    }
  },

  // ========== V2.0 交互③：点击吸氧按钮 → 跳转呼吸引导页 ==========
  startOxygenTherapy() {
    wx.navigateTo({
      url: '/pages/breathing/breathing',
      fail: () => {
        // 如果页面未注册，降级提示
        wx.showToast({ title: '呼吸引导即将上线 🫁', icon: 'none' })
      }
    })
  },

  // ========== 导航 ==========
  goReport() {
    this.setData({ showDimBubbles: false })
    wx.navigateTo({ url: '/pages/report/report' })
  },

  goCheckin() { wx.navigateTo({ url: '/pages/checkin/checkin' }) },
  goGrowth() { wx.navigateTo({ url: '/pages/growth/growth' }) },
  onMoodSnap() { wx.navigateTo({ url: '/pages/mood-scan/mood-scan' }) },
    goChat() { wx.navigateTo({ url: '/pages/chat/chat' }) },
  goProfile() { wx.switchTab({ url: '/pages/profile/profile' }) }
})
