/**
 * mock/data.js
 * 氧氧宝 · 六种氧系人格 + 陪伴数据 + 问候库 + 今日状态
 * (V0.2 升级: 增加陪伴数据/动态问候/今日状态/等级体系)
 */

// ===== 六种氧系人格预置 =====
const OXYGEN_PERSONALITIES = [
  {
    id: 'explorer',
    name: '氧气探险家',
    icon: '🏔',
    bgImage: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/mbti/bg-explorer.png',
    tags: ['向往自由', '挑战自我'],
    desc: '你的灵魂向往高山与广袤荒野，勇敢是你的氧气来源。',
    color: '#72D8C4',
    destination: ['西藏冈仁波齐', '稻城亚丁'],
    sport: ['徒步登山', '高空滑翔'],
    chargeWay: '自然环境深度呼吸恢复',
    zodiac: '射手座',
    fiveElements: '丙火'
  },
  {
    id: 'thinker',
    name: '深氧思考者',
    icon: '🌌',
    bgImage: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/mbti/bg-thinker.png',
    tags: ['理性深刻', '独立沉静'],
    desc: '在大脑的高速运转中寻觅秩序，理智是你的精神定海神针。',
    color: '#B8E8FF',
    destination: ['青海湖', '天文台'],
    sport: ['普拉提', '长跑'],
    chargeWay: '独处与静音纯氧环境',
    zodiac: '水瓶座',
    fiveElements: '壬水'
  },
  {
    id: 'healer',
    name: '轻氧治愈者',
    icon: '🌿',
    bgImage: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/mbti/bg-healer.png',
    tags: ['温柔体贴', '情绪抚平'],
    desc: '如微风般照顾身边的每一个人，你的存在本身就是一种舒缓。',
    color: '#A8E6CF',
    destination: ['云南大理', '杭州西湖'],
    sport: ['瑜伽', '公园散步'],
    chargeWay: '芳香疗法与正念冥想',
    zodiac: '巨蟹座',
    fiveElements: '乙木'
  },
  {
    id: 'energetic',
    name: '活力氧人',
    icon: '⚡',
    bgImage: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/mbti/bg-energetic.png',
    tags: ['热情洋溢', '能量满格'],
    desc: '随时随地都能带动全场气氛，你的能量池永远处于爆发状态。',
    color: '#FF9F43',
    destination: ['三亚海滩', '成都街头'],
    sport: ['HYROX体能赛', '骑行'],
    chargeWay: '高强度运动后爆氧恢复',
    zodiac: '狮子座',
    fiveElements: '午火'
  },
  {
    id: 'slower',
    name: '慢氧生活家',
    icon: '☕',
    bgImage: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/mbti/bg-slower.png',
    tags: ['松弛自如', '享受当下'],
    desc: '不盲目跟风，拥有自己的生活节奏，在烟火气中找到安宁。',
    color: '#FFD3B6',
    destination: ['苏州园林', '徽州古村'],
    sport: ['太极', '太湖慢骑'],
    chargeWay: '居家静音补氧与慢品清茶',
    zodiac: '金牛座',
    fiveElements: '己土'
  },
  {
    id: 'sensitive',
    name: '高氧敏感体',
    icon: '💧',
    bgImage: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/mbti/bg-sensitive.png',
    tags: ['感知敏锐', '灵感充沛'],
    desc: '能捕捉到细微的情绪起伏，需要更纯粹的氧气护盾保护自我。',
    color: '#D4A5A5',
    destination: ['九寨沟', '莫干山民宿'],
    sport: ['舒缓伸展', '游泳'],
    chargeWay: '深呼吸练习与睡眠补氧',
    zodiac: '双鱼座',
    fiveElements: '癸水'
  }
];

// ===== 动态问候随机库(V0.3 按精确时段) =====
const GREETING_LIST = {
  morning: [ // 06:00-11:00 早餐/早安
    '早上好，今天也来给自己补一点氧气吧 ☁️',
    '新的一天，从一次深呼吸开始 🌱',
    '早安，记得吃点早餐，好好照顾自己 🥐',
    '醒来啦？你的氧气伙伴等你一早上啦 ✨'
  ],
  energy: [ // 11:00-18:00 能量提醒
    '忙了一上午，该给大脑充点氧了 🍃',
    '下午茶时间，起来走动一下，给身体补氧 ☕',
    '能量是不是有点低？来和氧氧聊聊 🫧',
    '慢下来，也是一种充电方式 🌿'
  ],
  relax: [ // 18:00-24:00 陪伴放松
    '晚上好，今天辛苦啦，氧氧陪着你 🌙',
    '卸下一天的疲惫，和氧氧说说话吧 💚',
    '晚上是放松的时候，试着深呼吸一下 🧘',
    '夜深了，记得好好照顾自己的能量 ✨'
  ]
};

// ===== 今日状态卡 Mock =====
const MOCK_TODAY_STATUS = {
  hasRecord: true,
  emotion: '轻松',
  emotionLabel: '轻松',
  energy: 82,
  keywords: ['平稳', '自洽', '需要慢节奏'],
  advice: '今天的你能量场非常舒适，保持深呼吸，避免高强度加班。',
  date: '2026-08-10'
};

// ===== 陪伴数据与成长体系 =====
const MOCK_USER_COMPANION = {
  growthLevel: 2,
  levelName: '熟悉伙伴',
  experience: 60,
  maxExperience: 100,
  checkinDays: 5,
  oxygenPersonality: '氧气探险家',
  personalityIcon: '🏔',
  energy: '82%',
  badge: 'bag' // 预留素材状态: normal | bag | badge | master
};

// ===== 成长等级文案体系 =====
const GROWTH_LEVELS = [
  { level: 1, name: '初遇氧氧', badge: 'normal' },
  { level: 2, name: '熟悉伙伴', badge: 'bag' },
  { level: 3, name: '氧气搭档', badge: 'badge' },
  { level: 4, name: '深度陪伴', badge: 'master' }
];

// ===== V0.5 相近人格映射表(根据人格类型, 展示1-2个相近人格) =====
// key: 当前人格id  value: 相近人格id列表
const SIMILAR_PERSONALITIES = {
  explorer: ['energetic'],
  thinker: ['slower'],
  healer: ['sensitive'],
  energetic: ['explorer'],
  slower: ['thinker'],
  sensitive: ['healer']
};

// ===== Mock 用户 =====
const MOCK_USER = {
  name: '涵涵',
  birthday: '2004-06-15',
  gender: 'female',
  avatar: '',
  personality: '氧气探险家',
  hasTestedMBTI: true
};

module.exports = {
  OXYGEN_PERSONALITIES,
  GREETING_LIST,
  MOCK_TODAY_STATUS,
  MOCK_USER_COMPANION,
  GROWTH_LEVELS,
  SIMILAR_PERSONALITIES,
  MOCK_USER
};
