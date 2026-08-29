/**
 * mock/personality-db.js
 * 氧系人格数据库(MVP 结构化存储)
 * 说明：这是六种氧系人格的"内容资产库"，字段完整，后续可迁移至云端数据库
 * 与短视频/内容推荐/运营系统共用。当前由 mock/data.js 引用或独立使用。
 *
 * 字段说明：
 *   id            英文标识(唯一)
 *   name          人格名称
 *   icon          emoji 图标
 *   color          主题色(HEX)
 *   colorName      主题色中文名
 *   tags           人格标签([])
 *   desc           一句话描述
 *   destination    推荐目的地([])
 *   sport          推荐运动([])
 *   chargeWay      充能方式
 *   zodiac         星座天赋
 *   fiveElements   五行属性
 *   scene          适配的业务场景
 *   bgImage        专属背景图路径
 *   traits         性格特质版(详细，供文案/内容用)
 *   keywords       情绪关键词(供打卡分析关联)
 */
const PERSONALITY_DB = [
  {
    id: 'explorer',
    name: '氧气探险家',
    icon: '🏔',
    color: '#72D8C4',
    colorName: '氧气绿',
    tags: ['向往自由', '挑战自我'],
    desc: '你的灵魂向往高山与广袤荒野，勇敢是你的氧气来源。',
    destination: ['西藏冈仁波齐', '稻城亚丁'],
    sport: ['徒步登山', '高空滑翔'],
    chargeWay: '自然环境深度呼吸恢复',
    zodiac: '射手座',
    fiveElements: '丙火',
    scene: '高原出行、户外运动',
    bgImage: '/images/mbti/bg-explorer.png',
    traits: ['行动派', '乐观', '喜欢探索未知', '需要广阔空间'],
    keywords: ['兴奋', '自由', '冒险', '出发']
  },
  {
    id: 'thinker',
    name: '深氧思考者',
    icon: '🌌',
    color: '#B8E8FF',
    colorName: '天空蓝',
    tags: ['理性深刻', '独立沉静'],
    desc: '在大脑的高速运转中寻觅秩序，理智是你的精神定海神针。',
    destination: ['青海湖', '天文台'],
    sport: ['普拉提', '长跑'],
    chargeWay: '独处与静音纯氧环境',
    zodiac: '水瓶座',
    fiveElements: '壬水',
    scene: '脑疲劳缓解、专注恢复',
    bgImage: '/images/mbti/bg-thinker.png',
    traits: ['逻辑强', '独立思考', '需要安静', '深度专注'],
    keywords: ['思考', '专注', '安静', '想通']
  },
  {
    id: 'healer',
    name: '轻氧治愈者',
    icon: '🌿',
    color: '#A8E6CF',
    colorName: '治愈草绿',
    tags: ['温柔体贴', '情绪抚平'],
    desc: '如微风般照顾身边的每一个人，你的存在本身就是一种舒缓。',
    destination: ['云南大理', '杭州西湖'],
    sport: ['瑜伽', '公园散步'],
    chargeWay: '芳香疗法与正念冥想',
    zodiac: '巨蟹座',
    fiveElements: '乙木',
    scene: '情绪抚平、放松疗愈',
    bgImage: '/images/mbti/bg-healer.png',
    traits: ['共情力强', '细腻', '乐于照顾他人', '需要被关怀'],
    keywords: ['温暖', '倾听', '治愈', '陪伴']
  },
  {
    id: 'energetic',
    name: '活力氧人',
    icon: '⚡',
    color: '#FF9F43',
    colorName: '活力橙',
    tags: ['热情洋溢', '能量满格'],
    desc: '随时随地都能带动全场气氛，你的能量池永远处于爆发状态。',
    destination: ['三亚海滩', '成都街头'],
    sport: ['HYROX体能赛', '骑行'],
    chargeWay: '高强度运动后爆氧恢复',
    zodiac: '狮子座',
    fiveElements: '午火',
    scene: '运动补给、能量恢复',
    bgImage: '/images/mbti/bg-energetic.png',
    traits: ['外向', '热烈', '带动氛围', '需高能量释放'],
    keywords: ['活力', '运动', '兴奋', '冲刺']
  },
  {
    id: 'slower',
    name: '慢氧生活家',
    icon: '☕',
    color: '#FFD3B6',
    colorName: '暖杏色',
    tags: ['松弛自如', '享受当下'],
    desc: '不盲目跟风，拥有自己的生活节奏，在烟火气中找到安宁。',
    destination: ['苏州园林', '徽州古村'],
    sport: ['太极', '太湖慢骑'],
    chargeWay: '居家静音补氧与慢品清茶',
    zodiac: '金牛座',
    fiveElements: '己土',
    scene: '居家保健、慢节奏生活',
    bgImage: '/images/mbti/bg-slower.png',
    traits: ['从容', '懂得享受', '慢节奏', '重视舒适'],
    keywords: ['慢下来', '舒适', '放松', '生活']
  },
  {
    id: 'sensitive',
    name: '高氧敏感体',
    icon: '💧',
    color: '#D4A5A5',
    colorName: '雾紫粉',
    tags: ['感知敏锐', '灵感充沛'],
    desc: '能捕捉到细微的情绪起伏，需要更纯粹的氧气护盾保护自我。',
    destination: ['九寨沟', '莫干山民宿'],
    sport: ['舒缓伸展', '游泳'],
    chargeWay: '深呼吸练习与睡眠补氧',
    zodiac: '双鱼座',
    fiveElements: '癸水',
    scene: '助眠补氧、压力舒缓',
    bgImage: '/images/mbti/bg-sensitive.png',
    traits: ['敏锐', '重感受', '需要安全感', '情绪共情'],
    keywords: ['敏感', '压力', '睡眠', '舒缓']
  }
];

module.exports = { PERSONALITY_DB }
