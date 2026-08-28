// pages/sound-therapy/sound-therapy.js
// 音疗冥想 · 五音疗法 + 场景包(V0.8)
// 当前为 mock 演示：音频源留接口，播放为模拟进度
const { FIVE_TONES, SCENE_SOUNDS } = require('../../mock/sound-therapy-db.js')

Page({
  data: {
    scenes: SCENE_SOUNDS,
    tones: FIVE_TONES,
    current: null,        // 正在播放的场景
    playing: false,
    progress: 0,          // 0-100 模拟进度
    demoMode: true        // mock 演示模式
  },

  onLoad() {
    // 摸一个演示音频源(本地无音频,标记 mock)
  },

  // 进入场景详情(pick卡片)
  openScene(e) {
    const key = e.currentTarget.dataset.key
    const scene = SCENE_SOUNDS.find(s => s.key === key) || SCENE_SOUNDS[0]
    this.setData({ current: scene, progress: 0, playing: false })
    // 滚动到播放区? 简化: 直接置 current
  },

  // 播放/暂停 (mock)
  togglePlay() {
    const cur = this.data.current
    if (!cur) return
    if (this.data.playing) {
      this.stopTimer()
      this.setData({ playing: false })
    } else {
      this.setData({ playing: true, demoMode: true })
      this.startTimer()
    }
  },

  startTimer() {
    if (this._timer) clearInterval(this._timer)
    let prog = this.data.progress
    this._timer = setInterval(() => {
      prog += 1.5
      if (prog >= 100) {
        prog = 100
        this.stopTimer()
        this.setData({ playing: false, progress: prog })
        wx.showToast({ title: '本段播放完成', icon: 'none' })
        return
      }
      this.setData({ progress: Math.round(prog) })
    }, 1000)
  },

  stopTimer() {
    if (this._timer) { clearInterval(this._timer); this._timer = null }
  },

  // 返回列表
  backToList() {
    this.stopTimer()
    this.setData({ current: null, progress: 0, playing: false })
  },

  onUnload() {
    this.stopTimer()
  },

  // 阻止点击穿透到遮罩
  noop() {},

  // 关闭场景详情
  closeDetail() {
    this.stopTimer()
    this.setData({ current: null, progress: 0, playing: false })
  },

  // 五音释义(点击展开已在列表展示)
  goToTone(e) {
    const key = e.currentTarget.dataset.key
    const tone = FIVE_TONES.find(t => t.key === key)
    if (tone) {
      wx.showModal({
        title: `${tone.name} · ${tone.organ}经`,
        content: tone.desc + '\n\n助：' + tone.mood,
        showCancel: false,
        confirmText: '了解啦',
        confirmColor: '#72D8C4'
      })
    }
  },

  // 去打卡(音疗后引导记录)
  goCheckin() {
    wx.navigateTo({ url: '/pages/checkin/checkin' })
  }
})
