/**
 * mock/oxygen-test-db.js
 * 含氧感自测 · 题库与计分(V0.7)
 *
 * 10 题，覆盖三个维度：脑力压力 / 运动恢复 / 高原适应。
 * 每题选项 1-4 分。
 * 数据结构面向未来接真实后台：questionnaireId / dimension / 均保留。
 */

// 三个维度
const DIMENSIONS = [
  { id: 'brain', name: '脑力压力', icon: '🧠', weight: 1 },
  { id: 'sport', name: '运动恢复', icon: '🏃', weight: 1 },
  { id: 'plateau', name: '高原适应', icon: '🏔️', weight: 1 }
]

// 题库(10 题, 覆盖三维度 + 综合)
const OXYGEN_TEST_QUESTIONS = [
  // —— 脑力压力 ——
  {
    id: 'q1', dimension: 'brain',
    q: '最近一周，你平均每天专注工作/学习几小时？',
    options: [
      { text: '少于 4 小时', score: 1 },
      { text: '4-6 小时', score: 2 },
      { text: '6-8 小时', score: 3 },
      { text: '8 小时以上', score: 4 }
    ]
  },
  {
    id: 'q2', dimension: 'brain',
    q: '下午你是否经常犯困、打哈欠、注意力难集中？',
    options: [
      { text: '几乎不会', score: 1 },
      { text: '偶尔', score: 2 },
      { text: '经常', score: 3 },
      { text: '每天如此', score: 4 }
    ]
  },
  {
    id: 'q3', dimension: 'brain',
    q: '高强度用脑后，你是否感觉头昏脑涨、需要很久才缓过来？',
    options: [
      { text: '几分钟就好', score: 1 },
      { text: '半小时左右', score: 2 },
      { text: '一两个小时', score: 3 },
      { text: '半天都缓不过来', score: 4 }
    ]
  },
  {
    id: 'q4', dimension: 'brain',
    q: '你是否经常加班、熬夜或用脑过度？',
    options: [
      { text: '很少', score: 1 },
      { text: '偶尔', score: 2 },
      { text: '比较频繁', score: 3 },
      { text: '几乎天天', score: 4 }
    ]
  },
  // —— 运动恢复 ——
  {
    id: 'q5', dimension: 'sport',
    q: '你每周运动几次？',
    options: [
      { text: '基本不运动', score: 3 },
      { text: '1-2 次', score: 2 },
      { text: '3-4 次', score: 2 },
      { text: '5 次以上', score: 3 }
    ]
  },
  {
    id: 'q6', dimension: 'sport',
    q: '运动后你通常多久能完全恢复体力？',
    options: [
      { text: '当天就恢复', score: 1 },
      { text: '睡一觉就恢复', score: 2 },
      { text: '第二天还酸软', score: 3 },
      { text: '好几天都缓不过来', score: 4 }
    ]
  },
  {
    id: 'q7', dimension: 'sport',
    q: '运动时你是否容易气喘、肌肉很快就酸？',
    options: [
      { text: '不会', score: 1 },
      { text: '略微', score: 2 },
      { text: '比较明显', score: 3 },
      { text: '非常明显', score: 4 }
    ]
  },
  {
    id: 'q8', dimension: 'sport',
    q: '你有没有运动后肌肉酸痛影响第二天状态的困扰？',
    options: [
      { text: '完全没有', score: 1 },
      { text: '偶尔', score: 2 },
      { text: '经常', score: 3 },
      { text: '每次都这样', score: 4 }
    ]
  },
  // —— 高原适应 ——
  {
    id: 'q9', dimension: 'plateau',
    q: '你计划或近期是否要去高原地区（海拔 2500 米以上）？',
    options: [
      { text: '暂无计划', score: 1 },
      { text: '有打算', score: 2 },
      { text: '近期就去', score: 3 },
      { text: '已经在高原或经常往返', score: 3 }
    ]
  },
  {
    id: 'q10', dimension: 'plateau',
    q: '平时是否容易出现头晕、胸闷、呼吸不畅？',
    options: [
      { text: '从不', score: 1 },
      { text: '少见', score: 2 },
      { text: '偶尔', score: 3 },
      { text: '经常', score: 4 }
    ]
  }
]

/**
 * 计算三维度得分(每题得分相加，映射到 0-100)
 * 返回: { brain, sport, plateau, total, level }
 */
function evaluate(answers) {
  // answers: { q1: score, q2: score, ... }
  const dims = { brain: 0, sport: 0, plateau: 0 }
  const counts = { brain: 0, sport: 0, plateau: 0 }
  for (const q of OXYGEN_TEST_QUESTIONS) {
    const s = answers[q.id]
    if (s && typeof s === 'number') {
      dims[q.dimension] += s
      counts[q.dimension]++
    }
  }
  // 归一化: 每题满分 4, 平均分 → 百分比 (1分≈25%, 4分≈100%)
  const norm = (id) => {
    const c = counts[id] || 0
    if (c === 0) return 40 // 该维度无作答给中等分
    return Math.round((dims[id] / (c * 4)) * 100)
  }
  const report = {
    brain: norm('brain'),
    sport: norm('sport'),
    plateau: norm('plateau')
  }
  report.total = Math.round((report.brain + report.sport + report.plateau) / 3)
  report.level = report.total >= 70 ? '高' : report.total >= 45 ? '中' : '低'
  report.advice = ADVICE[report.level]
  return report
}

// 报告建议文案
const ADVICE = {
  高: '你的身体氧需求较高。高强度用脑或运动、高原出行时，建议随身备一台便携充氧宝，及时补养，别硬扛。',
  中: '你的氧负荷处于中等水平。规律运动 + 避免久坐久脑，配合日常补氧，状态会更稳。',
  低: '你的氧状态很轻松，继续保持规律作息和运动。出行高原或加班多时，记得备一台充氧宝预防。'
}

module.exports = { DIMENSIONS, OXYGEN_TEST_QUESTIONS, evaluate, ADVICE }
