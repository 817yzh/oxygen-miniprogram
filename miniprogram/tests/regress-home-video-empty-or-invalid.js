// tests/regress-home-video-empty-or-invalid.js
// 回归测试 ① · 首页视频地址为空/失效时不得黑屏报错
//
// 用法:  node tests/regress-home-video-empty-or-invalid.js
// 退出码: 0=PASS  1=FAIL
//
// 验证契约(由 P0 修复 home.js:59 改配置项 + 默认隐藏 后满足):
//   1. introVideoUrl 应来自配置项, 不得再硬编码 Cloudflare 临时隧道地址
//   2. URL 为空  → showIntroVideo 必为 false (不渲染 <video>, 不黑屏)
//   3. URL 失效 → 提供 onIntroVideoError 兜底, 触发后置 showIntroVideo=false
//   4. 已看过视频(storage oxygen_intro_seen=true) → 不再自动播
//
// 注: 本测试在 P0 修复前会 FAIL, 修复后应 PASS. 这就是回归守卫.

const path = require('path')
const ROOT = path.join(__dirname, '..')

// ===== 测试桩: mock wx / getApp / Page =====
const storage = {}
global.wx = {
  getStorageSync: (k) => storage[k],
  setStorageSync: (k, v) => { storage[k] = v },
  removeStorageSync: (k) => { delete storage[k] },
  showToast: () => {},
  showModal: () => {},
  navigateTo: () => {},
  switchTab: () => {},
  vibrateShort: () => {}
}

let captured = null
global.Page = (opts) => { captured = opts }

global.getApp = () => ({
  globalData: {
    user: null,
    todayRecord: null,
    emotionHistory: [],
    companion: null
  },
  addGrowth: () => false,
  logOxygenUse: () => {},
  setUser: () => {}
})

// ===== 加载首页 (mock 依赖先就位) =====
require('../mock/data.js')
require('../mock/health-scene-db.js')
require('../mock/oxygen-course-db.js')
require('../mock/oxygen-map-db.js')
require('../mock/oxygen-change-db.js')
require('../mock/scene-board-db.js')
require('../mock/oxygen-suggestion-db.js')
require('../pages/home/home.js')

if (!captured) {
  console.error('FATAL: home.js 未调用 Page()')
  process.exit(2)
}

// ===== 工具: 实例化一个伪 Page 实例 =====
function newPageInstance() {
  const inst = { data: {} }
  inst.setData = function (patch) { Object.assign(this.data, patch) }
  Object.keys(captured).forEach((k) => {
    if (typeof captured[k] === 'function') inst[k] = captured[k].bind(inst)
  })
  return inst
}

// ===== 测试用例 =====
let failures = 0
const tests = []
function test(name, fn) { tests.push({ name, fn }) }
function assert(cond, msg) {
  if (!cond) { console.error('  X ' + msg); failures++ }
  else console.log('  + ' + msg)
}

test('onLoad 不再硬编码 trycloudflare 临时隧道地址', () => {
  Object.keys(storage).forEach((k) => delete storage[k])
  const p = newPageInstance()
  p.onLoad()
  assert(
    !/trycloudflare\.com/.test(p.data.introVideoUrl || ''),
    'introVideoUrl 不得保留 trycloudflare.com 硬编码 (实际: ' + p.data.introVideoUrl + ')'
  )
})

test('默认(无 storage)且 URL 为空 → 不渲染 <video>, 不黑屏', () => {
  Object.keys(storage).forEach((k) => delete storage[k])
  const p = newPageInstance()
  p.onLoad()
  assert(p.data.introVideoUrl !== undefined, 'introVideoUrl 字段已定义')
  assert(
    !p.data.introVideoUrl || p.data.introVideoUrl === '',
    '默认 URL 为空字符串 (实际: ' + JSON.stringify(p.data.introVideoUrl) + ')'
  )
  assert(
    p.data.showIntroVideo === false,
    'showIntroVideo=false (不渲染 <video>, 不黑屏) (实际: ' + p.data.showIntroVideo + ')'
  )
})

test('已看过视频 → 不再自动播', () => {
  Object.keys(storage).forEach((k) => delete storage[k])
  storage['oxygen_intro_seen'] = true
  const p = newPageInstance()
  p.onLoad()
  assert(
    p.data.showIntroVideo === false,
    'oxygen_intro_seen=true 时 showIntroVideo=false (实际: ' + p.data.showIntroVideo + ')'
  )
})

test('URL 失效时不抛异常, 触发 binderror 兜底后隐藏视频块', () => {
  Object.keys(storage).forEach((k) => delete storage[k])
  const p = newPageInstance()
  p.onLoad()
  // 模拟线上配置写入了失效地址
  p.setData({ introVideoUrl: 'https://invalid.example.com/missing.mp4', showIntroVideo: true })

  // P0 修复需提供 onIntroVideoError 兜底, <video binderror="onIntroVideoError">
  assert(
    typeof p.onIntroVideoError === 'function',
    '页面定义 onIntroVideoError 失效兜底处理 (P0 修复必备)'
  )

  if (typeof p.onIntroVideoError === 'function') {
    let threw = false
    try {
      p.onIntroVideoError()
    } catch (e) {
      threw = true
      console.error('  binderror 抛出:', e.message)
    }
    assert(!threw, 'onIntroVideoError 不得抛异常')
    assert(
      p.data.showIntroVideo === false,
      '失效触发 onIntroVideoError 后 showIntroVideo=false (不残留黑屏)'
    )
  }
})

test('closeIntroVideo 关闭后写入 storage, 下次不再自动播', () => {
  Object.keys(storage).forEach((k) => delete storage[k])
  const p = newPageInstance()
  p.onLoad()
  if (typeof p.closeIntroVideo === 'function') {
    p.closeIntroVideo()
    assert(
      storage['oxygen_intro_seen'] === true,
      'closeIntroVideo 写入 oxygen_intro_seen=true'
    )
    assert(p.data.showIntroVideo === false, 'closeIntroVideo 后 showIntroVideo=false')
  } else {
    assert(false, 'closeIntroVideo 方法存在')
  }
})

// ===== 运行 =====
console.log('== 回归 ① · 首页视频地址为空/失效时不得黑屏报错 ==')
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
