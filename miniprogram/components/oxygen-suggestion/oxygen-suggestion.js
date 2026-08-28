// components/oxygen-suggestion/oxygen-suggestion.js
// 今日氧气建议(V0.8)
Component({
  options: { styleIsolation: 'apply-shared' },
  properties: {
    // 建议内容 { icon,desc,tip,product,productHint }
    suggestion: { type: Object, value: null },
    // 角标备注
    note: { type: String, value: '' }
  },
  data: {},
  methods: {}
})
