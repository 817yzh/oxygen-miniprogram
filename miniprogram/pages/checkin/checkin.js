// pages/checkin/checkin.js
const app = getApp()

const PHYSICAL_OPTIONS = ['头昏', '疲惫', '没胃口', '肩膀酸痛', '眼睛酸胀', '精力不足']

Page({
  data: {
    tabMode: 'text',       // text | photo
    userText: '',
    photoSrc: '',
    selectedScene: '',
    canSubmit: false,
    privacyText: '✏️ 你写的内容仅在本地处理，不会上传',
    // V0.6 身心自选标签
    physicalOptions: [...PHYSICAL_OPTIONS, '其他'],
    physicalSelected: [],   // 选中的标签
    otherText: '',          // 其他输入
    showOtherInput: false
  },

  onLoad(options) {
    if (options.scene) {
      // 兼容英文旧场景参数 → 中文
      const map = { plateau: '高原旅行', brain: '脑疲劳', sport: '运动恢复', elder: '银发陪伴' }
      this.setData({ selectedScene: map[options.scene] || options.scene })
    }
  },

  switchTab(e) {
    const mode = e.currentTarget.dataset.tab
    this.setData({
      tabMode: mode,
      privacyText: mode === 'photo'
        ? '📷 趣味感知，仅做演示，不做真实识别或健康诊断'
        : '✏️ 你写的内容仅在本地处理，不会上传'
    }, () => this.checkCanSubmit())
  },

  onTextInput(e) {
    this.setData({ userText: e.detail.value }, () => this.checkCanSubmit())
  },

  pickScene(e) {
    const s = e.currentTarget.dataset.scene
    this.setData({ selectedScene: this.data.selectedScene === s ? '' : s })
  },

  // V0.6 身心自选标签(多选)
  pickPhysical(e) {
    const tag = e.currentTarget.dataset.tag
    let sel = this.data.physicalSelected.slice()
    if (tag === '其他') {
      // 打开/关闭其他输入框
      const idx = sel.indexOf('其他')
      if (idx >= 0) {
        sel.splice(idx, 1)
        this.setData({ physicalSelected: sel, showOtherInput: false })
      } else {
        sel.push('其他')
        this.setData({ physicalSelected: sel, showOtherInput: true })
      }
      return
    }
    const i = sel.indexOf(tag)
    if (i >= 0) sel.splice(i, 1)
    else sel.push(tag)
    this.setData({ physicalSelected: sel })
  },

  // 其他标签输入
  onOtherInput(e) {
    this.setData({ otherText: e.detail.value })
  },

  isPhysicalOn(tag) {
    return this.data.physicalSelected.indexOf(tag) >= 0
  },

  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        this.setData({ photoSrc: res.tempFiles[0].tempFilePath }, () => this.checkCanSubmit())
      }
    })
  },

  checkCanSubmit() {
    const { tabMode, userText, photoSrc } = this.data
    this.setData({
      canSubmit: (tabMode === 'text' && userText.trim().length > 0) || (tabMode === 'photo' && !!photoSrc)
    })
  },

  submit() {
    if (!this.data.canSubmit) return
    const { tabMode, userText, photoSrc, selectedScene } = this.data
    // V0.6 身心标签
    const tags = this.data.physicalSelected.slice()
    if (this.data.otherText && this.data.showOtherInput) tags.push(this.data.otherText)
    // 保存待分析数据
    app.globalData.pendingCheckin = {
      text: tabMode === 'text' ? userText.trim() : '',
      photo: tabMode === 'photo' ? photoSrc : '',
      scene: selectedScene,
      checkinType: tabMode === 'photo' ? 'photo' : 'text',
      physicalTags: tags
    }
    // 进入 AI 分析动画(打卡模式)
    wx.navigateTo({ url: '/pages/mbti/loading/loading?from=checkin' })
  }
})
