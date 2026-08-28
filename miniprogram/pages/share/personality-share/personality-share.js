// pages/share/personality-share/personality-share.js
// 氧系人格 · 分享预览页：展示静态高定海报 + 保存/分享
// V5.0 静态海报方案：6 种人格对应 6 张成品海报图，零渲染失败、100% 视觉还原
const { getPersonalityProduct } = require('../../../mock/personality-product-map.js')

Page({
  data: {
    type: 'explorer',        // 人格 id → 决定展示哪张静态海报
    posterPath: '',          // 当前海报的(临时/本地)路径，用于保存与分享
    posterSrc: '',           // 展示用静态路径
    shareText: ''            // 分享文案
  },

  onLoad(options) {
    // 从上一页接收序列化的人格数据(options.query 传 JSON)
    let persona = {}
    try {
      persona = options && options.data ? JSON.parse(decodeURIComponent(options.data)) : {}
    } catch (e) {
      persona = {}
    }
    this.persona = persona

    // 人格 id：决定静态海报；兜底用 explorer
    const type = this.normalizeType(persona.type)
    const src = '/images/posters/poster_' + type + '.jpg'
    const productPick = getPersonalityProduct(type)

    this.setData({
      type,
      posterSrc: src,
      posterPath: src,       // 先指向包内静态路径(展示/预览)
      shareText: `【我的氧气人格】\n${persona.icon || '🫧'} ${persona.typeName || '氧气人格'}\n${(persona.tags || []).join(' · ')}\n\n来氧氧宝找到你的氧气频率 💚`
    })

    // 预取：把包内静态图转成可保存的本地路径(覆盖旧 posterPath)
    this.prepareLocalPoster(src)
  },

  // 把不合法/缺省的人格 id 归一到 6 种已知 id
  normalizeType(type) {
    const valid = ['explorer', 'thinker', 'healer', 'energetic', 'slower', 'sensitive']
    return valid.indexOf(type) > -1 ? type : 'explorer'
  },

  // 将包内静态海报转成临时文件路径(供 saveImageToPhotosAlbum / 分享使用)
  prepareLocalPoster(src) {
    wx.getImageInfo({
      src,
      success: info => {
        // getImageInfo 返回的 path 是临时文件路径，可直接用于保存/分享
        this.setData({ posterPath: info.path })
      },
      fail: () => {
        // 兜底：仍可用包内路径
        this.setData({ posterPath: src })
      }
    })
  },

  // 海报加载失败(理论上不会，兜底提示)
  onPosterError() {
    wx.showToast({ title: '海报加载失败', icon: 'none' })
  },

  // 保存到相册
  savePoster() {
    const filePath = this.data.posterPath
    if (!filePath) {
      wx.showToast({ title: '海报还没准备好', icon: 'none' })
      return
    }
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
      fail: err => {
        if (err.errMsg && err.errMsg.indexOf('auth') > -1) {
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中允许保存图片到相册',
            confirmText: '去设置',
            success: r => {
              if (r.confirm) wx.openSetting()
            }
          })
        } else {
          wx.showToast({ title: '保存失败', icon: 'none' })
        }
      }
    })
  },

  // 分享给好友(带当前海报图)
  onShareAppMessage() {
    return {
      title: this.data.shareText.split('\n')[0] || '我的氧气人格',
      path: '/pages/mbti/index/index',
      imageUrl: this.data.posterPath || this.data.posterSrc
    }
  }
})
