// components/creator-card/creator-card.js
// 签约博主卡(V0.8) · 真实案例引流
Component({
  options: { styleIsolation: 'apply-shared' },
  properties: {
    // 博主 { id,name,avatarEmoji,personality,scene,videoUrl,description,tags }
    creator: { type: Object, value: null },
    // 是否显示"查看视频"按钮(有 videoUrl 才显示)
    showVideo: { type: Boolean, value: true }
  },
  data: {},
  methods: {
    // 点击卡片 → 查看博主详情/视频
    onTap() {
      const c = this.data.creator || {}
      this.triggerEvent('creatortap', { creator: c })
    }
  }
})
