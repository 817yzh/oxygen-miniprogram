// pages/oxygen-test/oxygen-test.js
// 含氧感自测 · 生成氧负荷报告(V0.7)
const { OXYGEN_TEST_QUESTIONS, DIMENSIONS, evaluate } = require('../../mock/oxygen-test-db.js')

Page({
  data: {
    questions: OXYGEN_TEST_QUESTIONS,
    total: OXYGEN_TEST_QUESTIONS.length,
    step: 0,                 // 0=开始页, 1..total=答题, total+1=完成
    answers: {},             // { q1: score }
    current: null,           // 当前题
    progress: 0,             // 进度百分比
    dims: DIMENSIONS,
    report: null,            // 结果
    // 可视化用
    maxScore: 4
  },

  onLoad() {
    this.start()
  },

  start() {
    this.setData({
      step: 0,
      answers: {},
      report: null,
      current: OXYGEN_TEST_QUESTIONS[0]
    })
  },

  // 开始答题
  begin() {
    this.setData({ step: 1, current: OXYGEN_TEST_QUESTIONS[0], progress: 0 })
  },

  // 选择一个选项
  choose(e) {
    const idx = e.currentTarget.dataset.idx
    const q = this.data.current
    const score = q.options[idx].score
    const answers = { ...this.data.answers, [q.id]: score }
    const nextIdx = this.data.questions.findIndex(x => x.id === q.id) + 1

    if (nextIdx < this.data.total) {
      // 下一题
      const progress = Math.round((nextIdx / this.data.total) * 100)
      this.setData({
        answers,
        current: this.data.questions[nextIdx],
        step: nextIdx + 1,
        progress
      })
    } else {
      // 完成 → 进入结果
      const report = evaluate(answers)
      // 保存报告
      const now = new Date().toDateString()
      const stored = { ...report, date: now }
      wx.setStorageSync('yyb_oxygen_report', stored)
      this.setData({ answers, report, step: this.data.total + 1, progress: 100 })
      wx.vibrateShort({ type: 'medium' })
      // V0.7 成长值 + 成就
      getApp().addGrowth('oxygen_test')
    }
  },

  // 上一题
  prev() {
    if (this.data.step <= 1) return
    const q = this.data.current
    const idx = this.data.questions.findIndex(x => x.id === q.id)
    const prevId = this.data.questions[idx - 1].id
    this.setData({
      current: this.data.questions[idx - 1],
      step: this.data.step - 1,
      progress: Math.round(((idx - 1) / this.data.total) * 100)
    })
  },

  // 重测
  retry() {
    this.start()
  },

  // 报告可视化: 得出最高维度
  topDim() {
    const r = this.data.report
    if (!r) return ''
    const dimMap = { brain: '脑力压力', sport: '运动恢复', plateau: '高原适应' }
    let top = 'brain'
    if (r.sport > r[top]) top = 'sport'
    if (r.plateau > r[top]) top = 'plateau'
    return dimMap[top]
  },

  // 去充氧宝产品中心
  goProductCenter() {
    wx.switchTab({ url: '/pages/product-center/product-center' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
