/**
 * mock/soulmate-db.js
 * 氧气同好 · 同类人格匹配(mock)
 *
 * 会议方向：分享卡片 + 匹配同好群体(社交裂变)。
 * mock 一组同类人格"氧友"，留真实社交接口(后续接小程序码/群/战绩)。
 */

const SOULMATE_SAMPLES = [
  { id: 's1', nickname: '山风', personality: '氧气探险家', icon: '🏔', mbti: 'ESTP', signature: '下一站，四姑娘山', tag: '同类人格', online: true },
  { id: 's2', nickname: '阿黎', personality: '氧气探险家', icon: '🏔', mbti: 'ESTP', signature: '周末去爬长城，有一起的吗', tag: '同类人格', online: true },
  { id: 's3', nickname: '小满', personality: '氧气探险家', icon: '🏔', mbti: 'ESTP', signature: '高原旅行爱好者，求搭子', tag: '相近人格', online: false },
  { id: 's4', nickname: '青野', personality: '氧气探险家', icon: '🏔', mbti: 'ENTP', signature: '也想找人一起看日出', tag: '相近人格', online: false }
]

/** 获取同类人格用户(按人格匹配) */
function getSoulmates(personalityType) {
  // mock: 都返回探险家集合, 后续按 personalityType 过滤
  return SOULMATE_SAMPLES.map(s => ({ ...s }))
}

module.exports = { SOULMATE_SAMPLES, getSoulmates }
