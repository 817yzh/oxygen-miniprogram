/**
 * mock/creator-db.js
 * 签约博主 · 真实案例引流入口 (V0.8)
 *
 * 会议方向：接入签约博主视频，按用户性格/状态匹配相似博主真实案例，反向促进销售。
 * 当前为 mock 演示数据，videoUrl 留接口，正式版接真实视频/达人数据(达人BD平台)。
 */

const CREATOR_DB = [
  {
    id: 'c1',
    name: '山风有氧',
    avatar: '',
    personality: '氧气探险家',
    scene: '高原旅行',
    videoUrl: '',
    description: '高原徒步爱好者，分享高反自测和补氧技巧',
    tags: ['高原', '徒步'],
    quote: '在呼吸里找回失控的生活碎片',
    plan: '森林白茶疗愈方案'
  },
  {
    id: 'c2',
    name: '丽娜研究所',
    avatar: '',
    personality: '深氧思考者',
    scene: '脑疲劳',
    videoUrl: '',
    description: '脑力工作者，教你在高强度工作中保持专注',
    tags: ['脑力', '专注'],
    quote: '给疲惫的大脑，留一口安静的氧气',
    plan: '薄荷提神专注方案'
  },
  {
    id: 'c3',
    name: '驰骋不停',
    avatar: '',
    personality: '活力氧人',
    scene: '运动恢复',
    videoUrl: '',
    description: '健身博主，分享运动后科学补氧恢复',
    tags: ['运动', '恢复'],
    quote: '每次呼吸，都是给肌肉的一次充电',
    plan: '运动恢复活力方案'
  },
  {
    id: 'c4',
    name: '暖阳陪伴',
    avatar: '',
    personality: '慢氧生活家',
    scene: '银发陪伴',
    videoUrl: '',
    description: '关注中老年健康，分享居家日常养生',
    tags: ['银发', '居家'],
    quote: '慢慢呼吸，慢慢生活，慢慢变好',
    plan: '暖阳安神舒缓方案'
  },
  {
    id: 'c5',
    name: '眠眠羊',
    avatar: '',
    personality: '高氧敏感体',
    scene: '失眠',
    videoUrl: '',
    description: '分享助眠音疗和睡前放松小技巧',
    tags: ['助眠', '放松'],
    quote: '把今天的焦虑，交给今晚的呼吸',
    plan: '薰衣草助眠安神方案'
  }
]

/** 按人格/场景匹配博主 */
function getCreatorsByMatch({ personalityType, scene } = {}) {
  let list = CREATOR_DB.slice()
  if (personalityType) {
    // 人格匹配优先(按中文人格名匹配)
    const nameMap = { explorer: '氧气探险家', thinker: '深氧思考者', healer: '轻氧治愈者', energetic: '活力氧人', slower: '慢氧生活家', sensitive: '高氧敏感体' }
    const pname = nameMap[personalityType] || ''
    const same = list.filter(c => c.personality === pname)
    if (same.length) list = same
  } else if (scene) {
    const sc = list.filter(c => c.scene === scene)
    if (sc.length) list = sc
  }
  return list.map(c => ({
    ...c,
    // 无头像时给 emoji 占位
    avatarEmoji: c.avatar || c.name.slice(0, 1)
  }))
}

module.exports = { CREATOR_DB, getCreatorsByMatch }
