/**
 * components/energy-index/energy-index.js
 * 氧气能量指数组件 (V0.4)
 * 展示: 平静力/活跃度/思考量/情绪稳定/精力值 (进度条)
 * 用法: <energy-index indexes="{{record.indexes}}" />
 */
Component({
  properties: {
    indexes: { type: Object, value: null }
  },
  data: {
    items: []
  },
  observers: {
    'indexes': function(val) {
      if (!val) return
      const def = [
        { key: 'calmPower', label: '平静力', icon: '🕊️' },
        { key: 'active', label: '活跃度', icon: '⚡' },
        { key: 'think', label: '思考量', icon: '🧠' },
        { key: 'stable', label: '情绪稳定', icon: '🧘' },
        { key: 'energy', label: '精力值', icon: '🔋' }
      ]
      this.setData({
        items: def.map(d => ({
          label: d.label,
          icon: d.icon,
          value: Math.max(0, Math.min(100, val[d.key] || 0))
        }))
      })
    }
  }
})
