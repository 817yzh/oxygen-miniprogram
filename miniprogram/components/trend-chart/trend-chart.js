/**
 * components/trend-chart/trend-chart.js
 * 情绪趋势折线图(canvas 2d 手绘,零依赖)
 * 用法: <trend-chart history="{{history}}" />
 * 心情 -> y值: 低落=1 焦虑=2 疲惫=3 平稳=4 开心=5
 */
const EMOTION_Y = {
  '开心': 5, '平静': 4, '放松': 4.5, '平稳': 4,
  '疲惫': 3, '紧张': 3,
  '焦虑': 2, '烦躁': 2,
  '低落': 1, '孤独': 1.5
}

Component({
  properties: {
    history: { type: Array, value: [] }
  },

  observers: {
    'history': function(val) {
      if (val && val.length) this.draw(val.slice(-7))
    }
  },

  lifetimes: {
    ready() {
      if (this.data.history.length) this.draw(this.data.history.slice(-7))
    }
  },

  methods: {
    draw(list) {
      const query = this.createSelectorQuery()
      query.select('#trendCanvas').fields({ node: true, size: true }).exec((res) => {
        if (!res || !res[0] || !res[0].node) return
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = (wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : 2) || 2
        const width = res[0].width
        const height = res[0].height
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        const padL = 40, padR = 16, padT = 20, padB = 30
        const innerW = width - padL - padR
        const innerH = height - padT - padB
        const yLabels = ['低谷', '低落', '焦虑', '疲惫', '平稳', '开心']
        const maxY = 5

        // y轴刻度线
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        for (let lvl = 1; lvl <= maxY; lvl++) {
          const y = padT + innerH - (innerH * (lvl - 0.5)) / maxY
          ctx.beginPath()
          ctx.moveTo(padL, y)
          ctx.lineTo(width - padR, y)
          ctx.setLineDash([4, 4])
          ctx.strokeStyle = '#EAEAEA'
          ctx.stroke()
          ctx.setLineDash([])
          ctx.fillStyle = '#9BB7AE'
          ctx.fillText(['低落', '焦虑', '疲惫', '平稳', '开心'][lvl - 1], padL - 8, y)
        }

        // x轴日期
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        const n = list.length
        const step = n > 1 ? innerW / (n - 1) : 0
        list.forEach((it, i) => {
          const x = padL + step * i
          const d = new Date(it.date)
          const label = (d.getMonth() + 1) + '/' + d.getDate()
          ctx.fillStyle = '#9BB7AE'
          ctx.fillText(label, x, height - 22)
        })

        // 折线
        ctx.beginPath()
        list.forEach((it, i) => {
          const x = padL + step * i
          const yv = EMOTION_Y[it.emotionLabel || '平静'] || 3
          const y = padT + innerH - (innerH * yv) / maxY
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.strokeStyle = '#38C0A0'
        ctx.lineWidth = 3
        ctx.lineJoin = 'round'
        ctx.stroke()

        // 顶点
        list.forEach((it, i) => {
          const x = padL + step * i
          const yv = EMOTION_Y[it.emotionLabel || '平静'] || 3
          const y = padT + innerH - (innerH * yv) / maxY
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fillStyle = '#38C0A0'
          ctx.fill()
        })
      })
    }
  }
})
