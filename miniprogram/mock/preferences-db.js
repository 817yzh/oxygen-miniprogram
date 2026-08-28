/**
 * mock/preferences-db.js
 * 氧氧记忆 · 偏好数据(V0.9)
 *
 * 让氧氧记住用户的关键偏好，用于定制化陪伴回复。
 * 字段面向真实后台，当前本地存储于 yyb_preferences。
 */

// 偏好字段定义(可编辑项)
const PREF_FIELDS = [
  { key: 'productModel', label: '我的充氧宝款式', type: 'choice',
    options: ['便携款·高原', '桌面款·脑力', '银发款·关怀', '还没想好'],
    placeholder: '选一个你的专属款式' },
  { key: 'parentAge', label: '父母年龄段', type: 'choice',
    options: ['50-59岁', '60-69岁', '70岁以上', '暂不需要'],
    placeholder: '方便氧氧更懂你' },
  { key: 'highlandFreq', label: '去高原频率', type: 'choice',
    options: ['经常去', '偶尔去', '还没去过', '计划去'],
    placeholder: '关于高原出行的偏好' },
  { key: 'sleepPattern', label: '常熬夜吗', type: 'choice',
    options: ['经常熬夜', '偶尔', '早睡早起'],
    placeholder: '了解你的作息' }
]

// 默认偏好
const DEFAULT_PREFERENCES = {
  productModel: '',
  parentAge: '',
  highlandFreq: '',
  sleepPattern: ''
}

// 偏好看板文案(用于 chat 页记忆摘要)
function buildMemorySummary(pref) {
  const p = pref || {}
  const bits = []
  if (p.productModel) bits.push(p.productModel)
  if (p.parentAge) bits.push(p.parentAge)
  if (p.highlandFreq) bits.push(p.highlandFreq === '经常去' ? '常去高原' : p.highlandFreq)
  if (p.sleepPattern === '经常熬夜') bits.push('常熬夜')
  return bits.length > 0 ? bits.join(' · ') : '还没有记录，点这里让氧氧更懂你'
}

// 偏好 → 记忆 token(供 chatEngine 看是否有相关偏好)
function prefTokens(pref) {
  const p = pref || {}
  const t = []
  if (p.highlandFreq && p.highlandFreq !== '还没去过') t.push('高原')
  if (p.sleepPattern === '经常熬夜') t.push('熬夜')
  if (p.parentAge && p.parentAge !== '暂不需要') t.push('长辈')
  return t
}

module.exports = { PREF_FIELDS, DEFAULT_PREFERENCES, buildMemorySummary, prefTokens }
