// P2 · 打卡页
Page({
  data: {
    tabMode: 'text',
    userText: '',
    photoSrc: '',
    selectedScene: '',
    canSubmit: false,
    // 两种打卡模式对应的隐私文案
    privacyTextNote: '✏️ 你写的内容仅在本地处理，不会上传',
    privacyPhotoNote: '📷 照片会上传进行情绪识别，识别完成后不会保存'
  },

  onLoad(options) {
    if (options.scene) {
      this.setData({ selectedScene: options.scene })
    }
  },

  switchTab(e) {
    const mode = e.currentTarget.dataset.tab
    this.setData({ tabMode: mode }, () => this.checkCanSubmit())
  },

  getPrivacyText() {
    if (this.data.tabMode === 'text') {
      return '✏️ 你写的内容仅在本地处理，不会上传'
    } else {
      return '📷 照片会上传进行情绪识别，识别完成后不会保存'
    }
  },

  onTextInput(e) {
    this.setData({ userText: e.detail.value }, () => this.checkCanSubmit())
  },

  useExample(e) {
    const text = e.currentTarget.dataset.text
    this.setData({ userText: text }, () => this.checkCanSubmit())
  },

  takePhoto() {
    const that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      success(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath
        that.setData({ photoSrc: tempFilePath }, () => that.checkCanSubmit())
      }
    })
  },

  retakePhoto() {
    this.setData({ photoSrc: '' }, () => this.checkCanSubmit())
  },

  usePhoto() {
    // 拍照模式下确认使用照片
    this.checkCanSubmit()
  },

  pickScene(e) {
    const scene = e.currentTarget.dataset.scene
    this.setData({ selectedScene: this.data.selectedScene === scene ? '' : scene })
  },

  checkCanSubmit() {
    const { tabMode, userText, photoSrc } = this.data
    if (tabMode === 'text' && userText.trim().length > 0) {
      this.setData({ canSubmit: true })
    } else if (tabMode === 'camera' && photoSrc) {
      this.setData({ canSubmit: true })
    } else {
      this.setData({ canSubmit: false })
    }
  },

  submitCheckin() {
    const { tabMode, userText, photoSrc, selectedScene } = this.data
    if (!this.data.canSubmit) return

    // 保存输入到全局，跳转到分析页
    const app = getApp()
    const isPhotoMode = tabMode === 'camera'
    app.globalData.pendingCheckin = {
      text: !isPhotoMode ? userText.trim() : '',
      photo: isPhotoMode ? photoSrc : '',
      scene: selectedScene,
      checkinType: isPhotoMode ? 'photo' : 'text'  // 标记打卡类型
    }

    wx.navigateTo({
      url: '/pages/analyze/analyze'
    })
  }
})
