/**
 * components/oxygen-map/oxygen-map.js
 * 今日氧气地图组件 (V1.0 · 氧气生命球)
 * 中心大氧气值 + 外围四维标签（情绪/恢复/活力/含氧感）
 * 用法: <oxygen-map metrics="{{oxygenMetrics}}" level="{{oxygenLevel}}" hint="{{oxygenHint}}" />
 */
Component({
  properties: {
    metrics: { type: Array, value: [] },
    level: { type: String, value: 'mid' },
    hint: { type: String, value: '' }
  },
  data: {
    levelText: '平稳续航',
    avgValue: 0,
    d1: {}, d2: {}, d3: {}, d4: {}
  },
  observers: {
    'level': function(val) {
      const map = { high: '状态在线', mid: '平稳续航', low: '需要充电' }
      this.setData({ levelText: map[val] || '平稳续航' })
    },
    'metrics': function(list) {
      const arr = Array.isArray(list) ? list : []
      const filled = arr.length >= 4
        ? arr
        : (arr.length ? arr : [
          { key: 'emotion', label: '情绪', icon: '💛', value: 0 },
          { key: 'oxygen', label: '含氧', icon: '🫧', value: 0 },
          { key: 'vitality', label: '活力', icon: '⚡', value: 0 },
          { key: 'recovery', label: '恢复', icon: '🌙', value: 0 }
        ])
      // 均值 = 四维平均，向下取整
      let sum = 0
      filled.slice(0, 4).forEach(function(m) { sum += Number(m.value) || 0 })
      const avg = Math.round(sum / Math.min(filled.length, 4))
      this.setData({
        avgValue: avg,
        d1: filled[0] || {},
        d2: filled[1] || {},
        d3: filled[2] || {},
        d4: filled[3] || {}
      })
    }
  }
})
