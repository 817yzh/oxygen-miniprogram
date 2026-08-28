/**
 * pages/breathing/breathing.js
 * V2.0 · 1分钟真吸氧沉浸页逻辑
 * 三阶段: wakeup(3s设备唤醒) → breathing(57s, 4-7-8呼吸×3) → result(充氧报告卡)
 *
 * 硬件说明: 当前为Mock模式，蓝牙出氧/血氧/心率数据均为模拟。
 * 真实硬件对接时，替换 triggerHardwareOxygen() / readHardwareData() 即可。
 */

const app = getApp()

// 4-7-8 呼吸法阶段定义
const BREATH_PHASES = [
  { key: 'inhale', text: '吸气', hint: '慢慢吸入氧气...', duration: 4 },
  { key: 'hold',   text: '屏息', hint: '保持，感受氧气充盈', duration: 7 },
  { key: 'exhale', text: '呼气', hint: '缓缓呼出，释放疲惫', duration: 8 }
]

// 唤醒阶段时长（秒）
const WAKEUP_DURATION = 3
// 呼吸阶段总周期数（3个周期 = 57秒）
const BREATH_CYCLES = 3

Page({
  data: {
    // 当前阶段: wakeup / breathing / result
    stage: 'wakeup',
    // 当前阶段IP图片（用高清透明原图，防“膏药”感）
    ipImage: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/ip-wakeup-clear.png',
    // 呼吸阶段当前状态
    phaseClass: '',       // CSS类名: phase-inhale / phase-hold / phase-exhale
    phaseText: '',        // 阶段文字: 吸气 / 屏息 / 呼气
    phaseHint: '',        // 阶段提示语
    countdown: 0,         // 当前阶段倒计时
    totalCountdown: 60,   // 总倒计时
    // 充氧报告数据（Mock，真实硬件对接时替换）
    beforeScore: 70,
    afterScore: 82,
    scoreGain: 12,
    beforeSpo2: 95,
    afterSpo2: 99,
    beforeHr: 85,
    afterHr: 72
  },

  onLoad() {
    // 记录开始前的氧气指数
    const beforeScore = this.getBeforeScore()
    this.setData({ beforeScore })
    // 启动唤醒阶段
    this.startWakeup()
  },

  onUnload() {
    this.clearAllTimers()
  },

  // ========== 获取开始前的氧气指数 ==========
  getBeforeScore() {
    // 优先从首页数据获取，否则用默认值
    try {
      const pages = getCurrentPages()
      const homePage = pages.find(p => p.route && p.route.includes('home'))
      if (homePage && homePage.data && homePage.data.oxygenScore) {
        return homePage.data.oxygenScore
      }
    } catch (e) {}
    return 70
  },

  // ========== 阶段1：设备唤醒（0-3秒） ==========
  startWakeup() {
    this.setData({
      stage: 'wakeup',
      ipImage: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/ip-wakeup-clear.png'
    })
    // 动态设置导航栏标题
    wx.setNavigationBarTitle({ title: '设备唤醒中...' })
    // 模拟蓝牙唤醒硬件（真实对接时替换为 wx.createBLEConnection 等）
    this.triggerHardwareOxygen()
    // WAKEUP_DURATION秒后自动进入呼吸阶段
    this._wakeupTimer = setTimeout(() => {
      this.startBreathing()
    }, WAKEUP_DURATION * 1000)
  },

  // 模拟硬件出氧（真实硬件对接时替换此方法）
  triggerHardwareOxygen() {
    // TODO: 真实蓝牙对接时，这里下发硬件出氧指令
    // 例如: wx.writeBLECharacteristicValue({...})
    console.log('[Mock] 硬件已唤醒，开始出氧')
  },

  // ========== 阶段2：呼吸沉浸（3-60秒，4-7-8×3） ==========
  startBreathing() {
    this.setData({
      stage: 'breathing',
      ipImage: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/ip-wakeup-clear.png'
    })
    wx.setNavigationBarTitle({ title: '呼吸沉浸中' })
    this._breathCycle = 0      // 当前周期数
    this._breathPhaseIdx = 0   // 当前阶段索引
    this._totalSeconds = 0     // 已用总秒数
    this.runBreathPhase()
    // 启动总倒计时
    this._totalTimer = setInterval(() => {
      this._totalSeconds++
      const remain = Math.max(0, 60 - this._totalSeconds)
      this.setData({ totalCountdown: remain })
      if (this._totalSeconds >= 60) {
        this.finishBreathing()
      }
    }, 1000)
  },

  // 运行单个呼吸阶段
  runBreathPhase() {
    const phase = BREATH_PHASES[this._breathPhaseIdx]
    this.setData({
      phaseClass: `phase-${phase.key}`,
      phaseText: phase.text,
      phaseHint: phase.hint,
      countdown: phase.duration
    })
    // 阶段切换时轻微震动
    wx.vibrateShort({ type: 'light' })
    // 阶段倒计时
    let remain = phase.duration
    this._phaseTimer = setInterval(() => {
      remain--
      this.setData({ countdown: Math.max(0, remain) })
      if (remain <= 0) {
        clearInterval(this._phaseTimer)
        this.nextBreathPhase()
      }
    }, 1000)
  },

  // 切换到下一个呼吸阶段
  nextBreathPhase() {
    this._breathPhaseIdx++
    if (this._breathPhaseIdx >= BREATH_PHASES.length) {
      // 一个周期结束
      this._breathCycle++
      this._breathPhaseIdx = 0
      if (this._breathCycle >= BREATH_CYCLES) {
        // 所有周期完成，等待总倒计时结束
        return
      }
    }
    this.runBreathPhase()
  },

  // 呼吸阶段结束
  finishBreathing() {
    this.clearAllTimers()
    // 模拟读取硬件数据（真实对接时替换）
    const hwData = this.readHardwareData()
    // 计算氧气指数提升（Mock：随机提升8-15分）
    const gain = Math.floor(Math.random() * 8) + 8
    const afterScore = Math.min(100, this.data.beforeScore + gain)
    this.setData({
      stage: 'result',
      ipImage: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/ip-wakeup-clear.png',
      afterScore: afterScore,
      scoreGain: afterScore - this.data.beforeScore,
      beforeSpo2: hwData.beforeSpo2,
      afterSpo2: hwData.afterSpo2,
      beforeHr: hwData.beforeHr,
      afterHr: hwData.afterHr
    })
    wx.setNavigationBarTitle({ title: '充氧完成' })
    // 完成时震动反馈
    wx.vibrateShort({ type: 'medium' })
    // 更新全局陪伴数据（氧气值+10）
    this.updateCompanionData()
  },

  // 模拟读取硬件血氧/心率数据（真实硬件对接时替换）
  readHardwareData() {
    // TODO: 真实蓝牙对接时，这里读取设备传感器数据
    return {
      beforeSpo2: 95,
      afterSpo2: 99,
      beforeHr: 85,
      afterHr: 72
    }
  },

  // 更新全局陪伴数据
  updateCompanionData() {
    try {
      if (!app.globalData.companion) {
        app.globalData.companion = {}
      }
      const c = app.globalData.companion
      c.oxygenValue = (c.oxygenValue || 0) + 10
      c.checkinDays = (c.checkinDays || 1)
      console.log('[Breathing] 氧气值+10, 当前:', c.oxygenValue)
    } catch (e) {
      console.error('更新陪伴数据失败', e)
    }
  },

  // ========== 阶段3：返回首页 ==========
  onFinish() {
    this.clearAllTimers()
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/home/home' })
      }
    })
  },

  // ========== 清理所有定时器 ==========
  clearAllTimers() {
    if (this._wakeupTimer) { clearTimeout(this._wakeupTimer); this._wakeupTimer = null }
    if (this._totalTimer) { clearInterval(this._totalTimer); this._totalTimer = null }
    if (this._phaseTimer) { clearInterval(this._phaseTimer); this._phaseTimer = null }
  }
})
