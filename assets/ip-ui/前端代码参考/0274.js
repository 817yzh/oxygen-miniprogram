// mock/data.js

// 陪伴数据与成长体系预置
export const MOCK_USER_COMPANION = {
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

// 首页动态问候随机库
export const GREETING_LIST = [
  "今天也要记得照顾自己的能量哦 ☁️",
  "你的氧气伙伴正在等你回来 🌱",
  "慢下来，也是一种充电方式 🍵",
  "稍微吸口纯氧，让大脑清醒一下吧 ✨"
];

// 今日状态卡数据 Mock
export const MOCK_TODAY_STATUS = {
  hasRecord: true,
  emotion: '轻松',
  energy: 82,
  keywords: ['平稳', '自洽', '需要慢节奏'],
  advice: '今天的你能量场非常舒适，保持深呼吸，避免高强度加班。',
  date: '2026-08-10'
};

// 六种氧系人格
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
  }
];