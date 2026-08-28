// tests/regress-closed-loop-smoke.js
// 回归测试 ② · 四线数据闭环冒烟 (检测 -> 档案 -> 方案 -> 打卡)
//
// 用法:  node tests/regress-closed-loop-smoke.js
// 退出码: 0=PASS  1=FAIL
//
// 验证四线模块的纯函数能串联跑通, 数据沿闭环流转:
//   1. 检测  oxygen-test-db.evaluate(answers)         -> report {brain,sport,plateau,total,level,advice}
//   2. 档案  user-profile-db.getUserProfile()         -> {basicInfo, personality, oxygenState, history, ...}
//   3. 方案  oxygen-suggestion-db.getSuggestion(...)  -> 推荐卡 (key/scene/title/tip/product)
//   4. 打卡  app.addRecord(record)                    -> 写回 history + todayRecord
//   5. 闭环  再读 getUserProfile() -> oxygenState 反映最新打卡 (闭环闭合)

// ===== 测试桩: mock wx =====
const storage = {}
global.wx = {
  getStorageSync: (k) => storage[k],
  setStorageSync: (k, v) => { storage[k] = v },
  removeStorageSync: (k) => { delete storage[k] }
}

// ===== 测试桩: mock App() + getApp(), 复刻 app.js 关键路径 =====
let capturedApp = null
global.App = (opts) => { capturedApp = opts }

let appRef = null
global.getApp = () => appRef

function makeAppInstance() {
  // 直接 require 真实 app.js 以拿到 addRecord/checkAchievements 等逻辑
  // 注: 已 mock wx / App / getApp, require 不会触发 onLaunch 副作用(wx storage 已 stub)
  require('../app.js')
  if (!capturedApp) throw new Error('app.js 未调用 App()')
  const inst = Object.create(capturedApp)
  inst.globalData = {
    user: { name: '涵涵', avatar: '' },
    mbtiResult: null,
    todayRecord: null,
    emotionHistory: [],
    companion: {
      checkinDays: 0,
      experience: 0,
      growthLevel: 1,
      maxExperience: 100,
      levelName: '氧气萌新',
      oxDays: 0,
      lastOxDate: '',
      badges: []
    },
    achievements: [],
    growthLog: []
  }
  // 让方法绑定到实例
  Object.keys(capturedApp).forEach((k) => {
    if (typeof capturedApp[k] === 'function') inst[k] = capturedApp[k].bind(inst)
  })
  return inst
}

// ===== 加载被测模块 =====
const { OXYGEN_TEST_QUESTIONS, evaluate } = require('../mock/oxygen-test-db.js')
const { getUserProfile } = require('../mock/user-profile-db.js')
const { getSuggestion } = require('../mock/oxygen-suggestion-db.js')

// ===== 测试用例 =====
let failures = 0
const tests = []
function test(name, fn) { tests.push({ name, fn }) }
function assert(cond, msg) {
  if (!cond) { console.error('  X ' + msg); failures++ }
  else console.log('  + ' + msg)
}

test('1) 检测 evaluate 产出三维度+总分+级别+建议文案', () => {
  // 模拟一份"脑力压力大"作答
  const answers = {}
  OXYGEN_TEST_QUESTIONS.forEach((q) => {
    const opt = q.dimension === 'brain' ? q.options[3] : q.options[0]
    answers[q.id] = opt.score
  })
  const report = evaluate(answers)
  assert(report && typeof report.brain === 'number', 'brain 维度有数值: ' + report.brain)
  assert(report && typeof report.sport === 'number', 'sport 维度有数值: ' + report.sport)
  assert(report && typeof report.plateau === 'number', 'plateau 维度有数值: ' + report.plateau)
  assert(typeof report.total === 'number', 'total 总分有数值: ' + report.total)
  assert(['高', '中', '低'].includes(report.level), 'level 取值在 {高,中,低} (实际: ' + report.level + ')')
  assert(
    typeof report.advice === 'string' && report.advice.length > 0,
    'advice 建议文案非空'
  )
})

test('2) 档案 getUserProfile 在空数据下不抛异常, 字段齐全', () => {
  appRef = makeAppInstance()
  Object.keys(storage).forEach((k) => delete storage[k])
  let threw = false
  let profile = null
  try { profile = getUserProfile() } catch (e) { threw = true; console.error('  err:', e.message) }
  assert(!threw, '空数据下 getUserProfile 不抛异常')
  assert(profile && profile.basicInfo, 'basicInfo 字段存在')
  assert(profile && profile.personality, 'personality 字段存在')
  assert(profile && profile.oxygenState, 'oxygenState 字段存在')
  assert(profile && profile.history, 'history 字段存在')
  assert(
    profile.oxygenState && typeof profile.oxygenState.energy === 'number',
    'oxygenState.energy 数值兜底 (实际: ' + profile.oxygenState.energy + ')'
  )
})

test('3) 方案 getSuggestion 依 scene+energy 返回建议卡, 低能量兜底', () => {
  // 检测脑力压力大 → 场景脑疲劳 → 建议应为 brain 卡
  const sugg = getSuggestion({ scene: 'brain', energy: 85 })
  assert(sugg && sugg.key, '返回建议卡带 key')
  assert(sugg.scene === 'brain', 'scene=brain 命中 brain 建议 (实际: ' + sugg.scene + ')')
  assert(typeof sugg.title === 'string' && sugg.title.length > 0, 'title 非空')
  assert(typeof sugg.tip === 'string' && sugg.tip.length > 0, 'tip 非空')
  // 能量低 + 无场景 → 疲劳缓解兜底
  const low = getSuggestion({ scene: '', energy: 30 })
  assert(low && low.key === 'tired', '低能量无场景 → tired 兜底 (实际: ' + low.key + ')')
})

test('4) 打卡 addRecord 写回 history + todayRecord, 累计 checkinDays', () => {
  appRef = makeAppInstance()
  // 由检测结果派生打卡场景(模拟用户依据方案打卡)
  const answers = {}
  OXYGEN_TEST_QUESTIONS.forEach((q) => {
    answers[q.id] = q.dimension === 'brain' ? q.options[3].score : q.options[0].score
  })
  const report = evaluate(answers)
  const detectedScene = report.brain > report.sport && report.brain > report.plateau ? '脑疲劳' : '运动恢复'
  const sugg = getSuggestion({
    scene: detectedScene === '脑疲劳' ? 'brain' : 'sport',
    energy: report.total
  })
  assert(!!sugg, '方案依据检测结果生成 (key=' + (sugg && sugg.key) + ')')

  const today = new Date().toDateString()
  const record = {
    date: today,
    scene: detectedScene,
    emotionLabel: '疲惫',
    energy: report.total,
    keywords: ['脑力压力'],
    state: detectedScene,
    insight: sugg.tip
  }
  let threw = false
  try {
    appRef.addRecord(record)
  } catch (e) {
    threw = true
    console.error('  addRecord 抛出:', e.message)
  }
  assert(!threw, 'addRecord 不抛异常')
  assert(
    appRef.globalData.todayRecord && appRef.globalData.todayRecord.scene === detectedScene,
    'todayRecord 写入 (scene=' + appRef.globalData.todayRecord.scene + ')'
  )
  assert(
    appRef.globalData.emotionHistory.length === 1,
    'emotionHistory 累计 1 条 (实际: ' + appRef.globalData.emotionHistory.length + ')'
  )
  assert(
    appRef.globalData.companion.checkinDays === 1,
    'companion.checkinDays +1 (实际: ' + appRef.globalData.companion.checkinDays + ')'
  )
})

test('5) 打卡后再读档案 -> oxygenState 反映最新打卡 (闭环闭合)', () => {
  const profile = getUserProfile()
  assert(
    profile.oxygenState.scene === '脑疲劳' || profile.oxygenState.scene === '运动恢复',
    '档案 oxygenState.scene 取自最新打卡 (实际: ' + profile.oxygenState.scene + ')'
  )
  assert(
    profile.oxygenState.emotion === '疲惫',
    '档案 oxygenState.emotion 取自最新打卡 (实际: ' + profile.oxygenState.emotion + ')'
  )
  assert(
    profile.history.checkins.length >= 1,
    '档案 history.checkins 含本次打卡 (实际: ' + profile.history.checkins.length + ')'
  )
  assert(
    profile.history.streak >= 1,
    '档案 history.streak 连续天数 >= 1 (实际: ' + profile.history.streak + ')'
  )
})

// ===== 运行 =====
console.log('== 回归 ② · 四线数据闭环冒烟 (检测 -> 档案 -> 方案 -> 打卡) ==')
for (const t of tests) {
  console.log('- ' + t.name)
  t.fn()
}

if (failures === 0) {
  console.log('\nRESULT: PASS (0 failures)')
  process.exit(0)
} else {
  console.log('\nRESULT: FAIL (' + failures + ' failure(s))')
  process.exit(1)
}
