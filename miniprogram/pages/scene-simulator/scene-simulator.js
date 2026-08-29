// pages/scene-simulator/scene-simulator.js
// 场景模拟器 V2.1 · 轻量Tab + Canvas原生仪表盘 + 一体化玻璃浮层
const { SCENE_SIMULATIONS, getSimulation } = require('../../mock/scene-simulator-db.js')

// Tab 短名 + 场景图（高清 16:9 横滑卡用）
const SHORT = { lasa: '拉萨', overtime: '加班', run5k: '跑步', elder: '老人' }
const SCENE_IMG = {
  lasa: '/pages/scene-simulator/scene-thumbs/scene_lasa.jpg',
  overtime: '/pages/scene-simulator/scene-thumbs/scene_overtime.jpg',
  run5k: '/pages/scene-simulator/scene-thumbs/scene_run5k.jpg',
  elder: '/pages/scene-simulator/scene-thumbs/scene_elder.jpg'
}

Page({
  data: {
    sims: [],
    activeId: '',
    result: null,
    gaugeTheme: { label: '', color: '#5BC9B3' },
    gaugeReady: false
  },

  onLoad(options) {
    const sims = SCENE_SIMULATIONS.map(s => ({
      ...s,
      short: SHORT[s.id] || s.title,
      img: SCENE_IMG[s.id] || ''
    }))
    this.setData({ sims })
    if (options && options.sim) {
      this.selectSim(options.sim)
    }
  },

  onReady() {
    if (!this.data.activeId && this.data.sims[0]) {
      this.selectSim(this.data.sims[0].id)
    }
  },

  onShow() {
    // 从其他页面返回时重绘，确保画布尺寸就绪
    if (this.data.result) {
      setTimeout(() => this._drawGauge(), 50)
    }
  },

  // 页面滚动时重绘 canvas，避免 Canvas 2D 随滚动漂移
  onPageScroll() {
    if (this.data.result) {
      this._drawGauge()
    }
  },

  onScroll() {
    // 横滑结束时重绘一次，确保圆环位置正确
    setTimeout(() => {
      if (this.data.result) this._drawGauge()
    }, 80)
  },

  selectSim(id) {
    const sim = getSimulation(id)
    if (!sim) return
    const gaugeTheme = this._gaugeTheme(sim.oxygenScore)
    this.setData({ activeId: id, result: sim, gaugeTheme }, () => {
      this._drawGauge()
    })
  },

  select(e) {
    const id = e.currentTarget.dataset.id
    this.selectSim(id)
  },

  _gaugeTheme(score) {
    if (score >= 75) return { label: '高需 · 极度缺氧', color: '#FF8A3C' }
    if (score >= 55) return { label: '中需 · 供氧紧张', color: '#F7C548' }
    return { label: '低需 · 平稳充足', color: '#5BC9B3' }
  },

  // ===== Canvas 2D 半圆弧仪表盘绘制 =====
  _drawGauge() {
    const query = wx.createSelectorQuery().in(this)
    query.select('#gaugeCanvas').fields({ node: true, size: true }).exec(res => {
      if (!res || !res[0] || !res[0].node) return
      const { node: canvas, width, height } = res[0]
      const dpr = wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : 2
      canvas.width = width * dpr
      canvas.height = height * dpr
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)

      const score = this.data.result ? this.data.result.oxygenScore : 0
      const color = this.data.gaugeTheme.color

      ctx.clearRect(0, 0, width, height)

      const cx = width / 2
      const cy = height / 2 + 6
      const r = Math.min(width, height) / 2 - 26
      const start = Math.PI * 0.55 // 约220°起
      const sweep = Math.PI * 1.9   // 约342° 总弧
      const fill = sweep * (score / 100)

      // 底轨（深底上用亮灰绿，圆角端点）
      ctx.lineWidth = 16
      ctx.lineCap = 'round'
      ctx.strokeStyle = 'rgba(180, 220, 208, 0.20)'
      ctx.beginPath()
      ctx.arc(cx, cy, r, start, start + sweep)
      ctx.stroke()

      // 渐变进度弧（薄荷绿 → 主题色，加薄荷发光）
      const startColor = '#5BC9B3'
      const endColor = color
      const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy)
      grad.addColorStop(0, startColor)
      grad.addColorStop(1, endColor)
      ctx.save()
      ctx.shadowColor = 'rgba(0, 230, 200, 0.45)'
      ctx.shadowBlur = 18
      ctx.lineWidth = 16
      ctx.lineCap = 'round'
      ctx.strokeStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, r, start, start + fill)
      ctx.stroke()
      ctx.restore()

      // 端点光点（放大 + 强光晕）
      const endAngle = start + fill
      const px = cx + r * Math.cos(endAngle)
      const py = cy + r * Math.sin(endAngle)
      ctx.save()
      ctx.shadowColor = color
      ctx.shadowBlur = 16
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(px, py, 7, 0, Math.PI * 2)
      ctx.fill()
      // 内圈光点
      ctx.fillStyle = endColor
      ctx.beginPath()
      ctx.arc(px, py, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // 绘制成功 → 淡入显示（消除跳转时半成品圆环闪烁）
      if (!this.data.gaugeReady) {
        this.setData({ gaugeReady: true })
      }
    })
  },

  goProductCenter() {
    wx.switchTab({ url: '/pages/product-center/product-center' })
  }
})
