/**
 * scripts/reset-db.js
 * 清空所有测试数据（重置数据库）
 * 运行：npm run reset 或 node scripts/reset-db.js
 */

const fs = require('fs')
const path = require('path')
const store = require('../src/db/store.js')

const TABLES = [
  'users', 'user_personality', 'user_growth', 'checkin_records',
  'user_preferences', 'user_achievements', 'growth_logs',
  'oxygen_test_reports', 'chat_messages', 'user_flags'
]

console.log('即将清空以下表的数据：')
TABLES.forEach(t => console.log('  - ' + t + '.json'))

const confirm = process.argv[2]
if (confirm !== '--yes') {
  console.log('\n确认清空？运行：node scripts/reset-db.js --yes')
  process.exit(0)
}

TABLES.forEach(t => {
  const file = path.join(store.DATA_DIR, t + '.json')
  if (fs.existsSync(file)) fs.unlinkSync(file)
})
console.log('\n✅ 已清空全部测试数据。')
