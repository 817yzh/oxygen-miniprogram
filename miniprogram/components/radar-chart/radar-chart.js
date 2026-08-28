/**
 * components/radar-chart/radar-chart.js
 * V0.4 氧气能量指数 · 雷达图(canvas 2d 手绘,零依赖)
 * 用法: <radar-chart indexes="{{record.indexes}}" />
 * 5维: 平静力/活跃度/思考量/情绪稳定/精力值
 */
Component({
  properties: {
    indexes: { type: Object, value: null },
    // 自定义维度列表，格式 [{key, name}]，不传则用默认5维
    dimensions: { type: Array, value: null }
  },

  observers: {
    'indexes': function(val) {
      if (val) this.draw(val)
    }
  },

  lifetimes: {
    ready() {
      if (this.data.indexes) this.draw(this.data.indexes)
    }
  },

  methods: {
    draw(indexes) {
      const query = this.createSelectorQuery()
      query.select('#radarCanvas').fields({ node: true, size: true }).exec((res) => {
        if (!res || !res[0] || !res[0].node) return
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = (wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : 2) || 2
        const width = res[0].width
        const height = res[0].height
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        const cx = width / 2
        const cy = height / 2
        const R = Math.min(width, height) / 2 - 30

        // 维度：优先用传入的自定义维度，否则用默认5维
        const defaultLabels = [
          { key: 'calmPower', name: '平静力' },
          { key: 'active', name: '活跃度' },
          { key: 'think', name: '思考量' },
          { key: 'energy', name: '精力值' },
          { key: 'stable', name: '情绪稳定' }
        ]
        const labels = (this.data.dimensions && this.data.dimensions.length)
          ? this.data.dimensions
          : defaultLabels
        const n = labels.length
        const values = labels.map(l => Math.max(0, Math.min(100, indexes[l.key] || 0)))

        // 多边形网格(4层)
        for (let level = 4; level >= 1; level--) {
          ctx.beginPath()
          for (let i = 0; i <= n; i++) {
            const angle = (Math.PI * 2 * i) / n - Math.PI / 2
            const r = (R * level) / 4
            const x = cx + r * Math.cos(angle)
            const y = cy + r * Math.sin(angle)
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.fillStyle = level % 2 === 0 ? '#F5FAF8' : '#EAF5F1'
          ctx.fill()
          ctx.strokeStyle = '#CBE5DD'
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // 轴线 + 标签
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        for (let i = 0; i < n; i++) {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2
          const x = cx + R * Math.cos(angle)
          const y = cy + R * Math.sin(angle)
          ctx.beginPath()
          ctx.moveTo(cx, cy)
          ctx.lineTo(x, y)
          ctx.strokeStyle = '#CBE5DD'
          ctx.stroke()

          // 标签(略微外扩)
          const tx = cx + (R + 18) * Math.cos(angle)
          const ty = cy + (R + 18) * Math.sin(angle)
          ctx.fillStyle = '#2B5B52'
          ctx.fillText(labels[i].name, tx, ty)
          // 值
          const vx = cx + (R + 18) * Math.cos(angle)
          const vy = cy + (R + 30) * Math.sin(angle)
          ctx.fillStyle = '#38C0A0'
          ctx.fillText(values[i], vx, vy)
        }

        // 数据区域
        ctx.beginPath()
        for (let i = 0; i <= n; i++) {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2
          const r = (R * values[i % n]) / 100
          const x = cx + r * Math.cos(angle)
          const y = cy + r * Math.sin(angle)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fillStyle = 'rgba(82, 204, 172, 0.35)'
        ctx.fill()
        ctx.strokeStyle = '#38C0A0'
        ctx.lineWidth = 2
        ctx.stroke()

        // 顶点
        for (let i = 0; i < n; i++) {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2
          const r = (R * values[i]) / 100
          const x = cx + r * Math.cos(angle)
          const y = cy + r * Math.sin(angle)
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, Math.PI * 2)
          ctx.fillStyle = '#38C0A0'
          ctx.fill()
        }
      })
    }
  }
})
