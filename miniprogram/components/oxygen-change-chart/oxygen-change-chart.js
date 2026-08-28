/**
 * components/oxygen-change-chart/oxygen-change-chart.js
 * 我的氧气变化 · 使用前后对比 (V0.8)
 * 用法:
 *   完整版: <oxygen-change-chart dimensions="{{dims}}" note="{{note}}" />
 *   简版(首页小卡): <oxygen-change-chart compact dimensions="{{dims}}" />
 */
Component({
  properties: {
    dimensions: { type: Array, value: [] },
    note: { type: String, value: '' },
    compact: { type: Boolean, value: false }   // V0.8 首页简版
  },
  data: {
    rows: []
  },
  observers: {
    'dimensions': function(list) {
      if (!Array.isArray(list) || !list.length) return
      const rows = list.map(d => ({
        label: d.label,
        before: d.before,
        after: d.after,
        unit: d.unit || '%',
        deltaText: d.deltaText || '',
        afterW: Math.max(0, Math.min(100, d.after))
      }))
      this.setData({ rows })
    }
  },
  methods: {
    // 简版"查看详情"→ 通知父页面
    goDetail() {
      this.triggerEvent('detail')
    }
  }
})
