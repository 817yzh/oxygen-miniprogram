// mock/data.js

// 六种氧系人格预置数据
export const OXYGEN_PERSONALITIES = [
  {
    id: 'explorer',
    name: '氧气探险家',
    icon: '🏔',
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

// 当前 Mock 用户状态
export const MOCK_USER = {
  name: '涵涵',
  birthday: '2004-06-15',
  gender: 'female',
  avatar: 'https://via.placeholder.com/100',
  personality: '氧气探险家',
  hasTestedMBTI: true,
  todayCheckin: {
    hasRecord: true,
    emotion: '高反焦虑',
    energy: 65,
    keyword: '高海拔疲惫',
    matchScore: 88,
    advice: '今天的你可能需要慢下来重新补充能量，建议进行 5 分钟深呼吸。'
  }
};