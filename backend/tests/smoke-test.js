/**
 * tests/smoke-test.js
 * 后端冒烟测试：启动服务器 → 跑通核心接口全链路 → 关闭
 * 运行：npm test 或 node tests/smoke-test.js
 *
 * 覆盖：
 *  1. 健康检查
 *  2. 用户注册 + 画像
 *  3. 打卡（含情绪分析）
 *  4. 今日是否已打卡
 *  5. 打卡历史
 *  6. 人格列表 + 保存人格 + 人格→产品
 *  7. 偏好保存
 *  8. 聊天（规则引擎）
 *  9. 成就列表（打卡后应解锁 first_checkin）
 *  10. 成长数据
 *  11. 产品/场景静态库
 */

const { start } = require('../src/server.js')
const store = require('../src/db/store.js')

const PORT = 3999
const BASE = `http://localhost:${PORT}`
let passed = 0
let failed = 0

function assert(cond, name, extra) {
  if (cond) { passed++; console.log(`  ✅ ${name}`) }
  else { failed++; console.log(`  ❌ ${name}`, extra ? JSON.stringify(extra) : '') }
}

async function api(method, path, body, headers = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
    body: body ? JSON.stringify(body) : undefined
  })
  const json = await res.json()
  return { status: res.status, json }
}

async function main() {
  console.log('\n🧪 氧氧宝后端冒烟测试开始\n')

  const server = start(PORT)
  // 等待服务器就绪
  await new Promise(r => setTimeout(r, 500))

  const userId = 'test_user_001'

  // 1. 健康检查
  let r = await api('GET', '/api/health')
  assert(r.status === 200 && r.json.data.status === 'up', '健康检查')

  // 2. 用户注册/画像
  r = await api('POST', '/api/user/register', { user_id: userId })
  assert(r.json.code === 0 && r.json.data.user_id === userId, '用户注册/获取')

  r = await api('GET', '/api/user/profile', null, { 'x-user-id': userId })
  assert(r.json.code === 0 && r.json.data.user, '获取用户画像')
  assert(r.json.data.growth && r.json.data.growth.checkinDays === 0, '初始成长数据为0')
  assert(r.json.data.todayRecorded === false, '初始未打卡')

  // 3. 打卡
  r = await api('POST', '/api/checkin', { user_id: userId, text: '今天好累，加班到很晚' })
  assert(r.json.code === 0 && r.json.data.record, '提交打卡')
  assert(r.json.data.record.emotionLabel === '疲惫', '情绪识别为疲惫', r.json.data.record.emotionLabel)
  assert(r.json.data.record.isNew === true, '首次打卡 isNew=true')
  assert(r.json.data.record.state === '待充电日', '状态为待充电日', r.json.data.record.state)
  assert(r.json.data.newAchievements.includes('first_checkin'), '解锁「第一口氧气」成就')

  // 4. 今日打卡状态
  r = await api('GET', '/api/checkin/today', null, { 'x-user-id': userId })
  assert(r.json.data.todayRecorded === true, '今日已打卡')

  // 5. 打卡历史
  r = await api('GET', '/api/checkin/history', null, { 'x-user-id': userId })
  assert(r.json.data.length === 1, '打卡历史1条')

  // 6. 人格
  r = await api('GET', '/api/personality/list')
  assert(r.json.data.length === 6, '六人格列表')

  r = await api('POST', '/api/personality/save', { user_id: userId, personality_id: 'healer' })
  assert(r.json.code === 0 && r.json.data.name === '轻氧治愈者', '保存人格')

  r = await api('GET', '/api/personality/healer/product')
  assert(r.json.code === 0 && r.json.data.product.model === 'WA-01', '人格→产品映射')

  // 7. 偏好
  r = await api('POST', '/api/preferences/save', { user_id: userId, sleepPattern: '夜猫子', highlandFreq: '偶尔' })
  assert(r.json.code === 0 && r.json.data.sleepPattern === '夜猫子', '保存偏好')

  // 8. 聊天
  r = await api('POST', '/api/chat', { user_id: userId, text: '我最近好焦虑怎么办' })
  assert(r.json.code === 0 && r.json.data.replyText.length > 0, '聊天有回复')

  r = await api('POST', '/api/chat', { user_id: userId, text: '充氧宝多少钱' })
  assert(r.json.code === 0 && r.json.data.isProduct === true, '产品FAQ识别')

  // 9. 成就（聊过天+打卡后）
  r = await api('GET', '/api/achievements', null, { 'x-user-id': userId })
  const unlockedIds = r.json.data.filter(a => a.unlocked).map(a => a.id)
  assert(unlockedIds.includes('first_checkin'), '成就含 first_checkin')
  assert(unlockedIds.includes('chat_10') === false, '聊天未满10次不误解锁')

  // 10. 成长
  r = await api('GET', '/api/growth', null, { 'x-user-id': userId })
  assert(r.json.code === 0 && r.json.data.growth.checkinDays === 1, '成长打卡天数=1')
  assert(r.json.data.growth.experience > 0, '成长经验>0')
  assert(r.json.data.logs.length >= 2, '成长明细≥2条')

  // 11. 静态库
  r = await api('GET', '/api/products')
  assert(r.json.data.models.length === 5, '产品型号5个')
  r = await api('GET', '/api/scenes')
  assert(r.json.data.scenes.length === 4, '场景4个')

  // 12. 情绪分析独立接口
  r = await api('POST', '/api/emotion/analyze', { text: '今天很开心，顺利通过了' })
  assert(r.json.data.emotionLabel === '开心', '情绪分析独立接口')

  // 13. 404
  r = await api('GET', '/api/not-exist')
  assert(r.status === 404, '404处理')

  // 14. 重复打卡（同日覆盖不累加天数）
  await api('POST', '/api/checkin', { user_id: userId, text: '更新一下今天的状态，开心' })
  r = await api('GET', '/api/growth', null, { 'x-user-id': userId })
  assert(r.json.data.growth.checkinDays === 1, '同日重复打卡天数不累加')
  r = await api('GET', '/api/checkin/history', null, { 'x-user-id': userId })
  assert(r.json.data.length === 1, '同日重复打卡记录覆盖')

  // 关闭服务器
  server.close()
  console.log('\n========================================')
  console.log(`测试结果: ${passed} 通过 / ${failed} 失败`)
  console.log('========================================\n')
  process.exit(failed > 0 ? 1 : 0)
}

main().catch(e => {
  console.error('测试异常:', e)
  process.exit(1)
})
