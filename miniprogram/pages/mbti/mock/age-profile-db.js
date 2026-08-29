/**
 * mock/age-profile-db.js
 * 年龄画像 · 从生日自动推导年龄段(V0.8)
 *
 * 用途：不单独收集年龄输入，从用户生日自动推导年龄段。
 * 该年龄段隐藏存储，不向用户展示，仅作为报告生成时的参考维度
 * (影响产品推荐/场景推荐/AI话术)。
 *
 * 年龄段：
 *   18-25 青年 · 26-35 青壮 · 36-50 中年 · 50+ 银发
 */

/** 年龄段画像 */
const AGE_PROFILES = {
  '18-25': {
    label: '18-25岁',
    group: '青年',
    icon: '🚀',
    // 优先场景/产品倾向
    sceneBias: ['脑力', '运动'],
    productBias: ['桌面款', '运动款'],
    // AI话术风格
    tone: '元气',
    aiHint: '学习/工作节奏快，注重效率与专注，补氧助脑力续航。'
  },
  '26-35': {
    label: '26-35岁',
    group: '青壮',
    icon: '💼',
    sceneBias: ['脑力', '运动', '高原'],
    productBias: ['桌面款', '便携款'],
    tone: '干练',
    aiHint: '职场打拼期，脑力消耗大，兼顾差旅与运动恢复。'
  },
  '36-50': {
    label: '36-50岁',
    group: '中年',
    icon: '🌿',
    sceneBias: ['脑力', '银发', '高原'],
    productBias: ['桌面款', '银发款', '便携款'],
    tone: '沉稳',
    aiHint: '事业与家庭兼顾，关注自身状态，也常为家人考虑补氧。'
  },
  '50+': {
    label: '50岁以上',
    group: '银发',
    icon: '👴',
    sceneBias: ['银发', '高原'],
    productBias: ['银发款', '便携款'],
    tone: '关怀',
    aiHint: '日常保健、改善睡眠与头脑清明，居家补氧更安心。'
  }
}

/**
 * 根据生日字符串计算年龄
 * @param {string} birthday 'YYYY-MM-DD'
 * @returns {number|null} 年龄(周岁)
 */
function calcAge(birthday) {
  if (!birthday) return null
  const m = String(birthday).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (!m) return null
  const b = new Date(+m[1], +m[2] - 1, +m[3])
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const md = now.getMonth() - b.getMonth()
  if (md < 0 || (md === 0 && now.getDate() < b.getDate())) age--
  return age >= 0 ? age : 0
}

/**
 * 根据生日获取年龄段画像
 * @param {string} birthday 'YYYY-MM-DD'
 * @returns {object|null} {age,key,label,group,icon,sceneBias,productBias,tone,aiHint}
 */
function getAgeProfile(birthday) {
  const age = calcAge(birthday)
  if (age === null) return null
  let key = '18-25'
  if (age >= 50) key = '50+'
  else if (age >= 36) key = '36-50'
  else if (age >= 26) key = '26-35'
  const p = AGE_PROFILES[key]
  return { age, key, ...p }
}

module.exports = { AGE_PROFILES, calcAge, getAgeProfile }
