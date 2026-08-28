/**
 * src/db/static-data.js
 * 后端静态知识库（对齐前端 mock/personality-db.js + achievement-db.js + product-db.js 等）
 * 这些是"产品知识"类只读数据，未来可迁到数据库/配置中心。
 */

// ===== 氧系六人格（对齐前端 personality-db.js）=====
const PERSONALITIES = {
  explorer: {
    id: 'explorer', name: '氧气探险家', mbti: 'ENFP', icon: '🏔️',
    color: '#F59E0B', bgGradient: 'linear-gradient(135deg,#FFE8CC,#FFF7EC)',
    tags: ['好奇', '行动派', '爱自由'],
    description: '你天生向往远方，身体和心灵都渴望新鲜的氧气。',
    destinations: ['拉萨', '稻城亚丁', '喀纳斯'], sports: ['徒步', '骑行'],
    chargeWays: ['进山', '远行', '露营'],
    quote: '山不过来，我就过去。', vibe: '自由感', zodiac: '', fiveElements: ''
  },
  thinker: {
    id: 'thinker', name: '深氧思考者', mbti: 'INTJ', icon: '🧠',
    color: '#6366F1', bgGradient: 'linear-gradient(135deg,#E0E7FF,#F5F3FF)',
    tags: ['理性', '深度', '专注'],
    description: '你习惯深度思考，大脑是高耗氧器官，需要高质量补给。',
    destinations: ['图书馆', '雪山书吧', '静修所'], sports: ['瑜伽', '冥想'],
    chargeWays: ['独处', '阅读', '写作'],
    quote: '想清楚，再出发。', vibe: '深邃感', zodiac: '', fiveElements: ''
  },
  healer: {
    id: 'healer', name: '轻氧治愈者', mbti: 'INFJ', icon: '🌿',
    color: '#10B981', bgGradient: 'linear-gradient(135deg,#D1FAE5,#ECFDF5)',
    tags: ['温柔', '共情', '治愈'],
    description: '你温暖细腻，也容易消耗自己，需要轻轻补氧。',
    destinations: ['大理', '森林', '茶园'], sports: ['散步', '太极'],
    chargeWays: ['陪伴', '自然', '手作'],
    quote: '治愈别人之前，先治愈自己。', vibe: '温柔感', zodiac: '', fiveElements: ''
  },
  energetic: {
    id: 'energetic', name: '活力氧人', mbti: 'ESTP', icon: '⚡',
    color: '#EF4444', bgGradient: 'linear-gradient(135deg,#FEE2E2,#FFF1F2)',
    tags: ['活力', '直接', '热烈'],
    description: '你像一团火，随时准备燃烧，也要记得给身体充氧。',
    destinations: ['球场', '海边', '滑雪场'], sports: ['篮球', '跑步'],
    chargeWays: ['运动', '聚会', '挑战'],
    quote: '趁热打铁，也要懂得续航。', vibe: '热烈感', zodiac: '', fiveElements: ''
  },
  slower: {
    id: 'slower', name: '慢氧生活家', mbti: 'ISFP', icon: '🦥',
    color: '#8B5CF6', bgGradient: 'linear-gradient(135deg,#EDE9FE,#FAF5FF)',
    tags: ['松弛', '审美', '慢生活'],
    description: '你懂得慢下来，给生活留白，让氧气慢慢渗透。',
    destinations: ['小镇', '民宿', '咖啡店'], sports: ['慢跑', '园艺'],
    chargeWays: ['发呆', '听歌', '慢食'],
    quote: '慢慢来，比较快。', vibe: '松弛感', zodiac: '', fiveElements: ''
  },
  sensitive: {
    id: 'sensitive', name: '高氧敏感体', mbti: 'INFP', icon: '💧',
    color: '#06B6D4', bgGradient: 'linear-gradient(135deg,#CFFAFE,#ECFEFF)',
    tags: ['敏锐', '共情', '细腻'],
    description: '你对情绪和氛围极其敏感，感知力强，也需要被好好看见。',
    destinations: ['海边', '美术馆', '天台'], sports: ['游泳', '舞蹈'],
    chargeWays: ['独处', '创作', '音乐'],
    quote: '感知敏锐，灵感充沛。', vibe: '灵动感', zodiac: '', fiveElements: ''
  }
}

// ===== 成长值规则 + 等级奖励（对齐 achievement-db.js）=====
const GROWTH_RULES = {
  checkin: 20, chat: 5, oxygen_test: 30, scene_view: 10, product_view: 10, gift: 15
}

const GROWTH_LEVELS = [
  { level: 1, name: '氧气萌新', badge: '🌱', maxExperience: 100 },
  { level: 2, name: '氧气探索者', badge: '🌿', maxExperience: 200 },
  { level: 3, name: '氧气守护者', badge: '🍃', maxExperience: 400 },
  { level: 4, name: '氧气大师', badge: '🌳', maxExperience: 800 }
]

const LEVEL_REWARDS = {
  1: { name: '基础IP陪伴', desc: '解锁氧氧基础形象陪伴' },
  2: { name: '小背包', desc: '解锁氧氧小背包配饰' },
  3: { name: '嗅吸兑换', desc: '可用成长值兑换嗅吸体验' },
  4: { name: '深度陪伴特权', desc: '解锁氧氧深度陪伴模式' }
}

// ===== 成就库（对齐 achievement-db.js）=====
const ACHIEVEMENTS = [
  { id: 'first_checkin', name: '第一口氧气', icon: '🫧', color: '#10B981', desc: '完成第一次打卡记录', condition: '首次打卡', target: 1 },
  { id: 'first_recipe', name: '食谱初尝', icon: '🥗', color: '#8B5CF6', desc: '获得第一份健康食谱推荐', condition: '获得食谱', target: 1 },
  { id: 'streak_3', name: '三日氧护', icon: '🔥', color: '#F59E0B', desc: '连续打卡3天', condition: '连续打卡', target: 3 },
  { id: 'streak_5', name: '五日氧护', icon: '⭐', color: '#EF4444', desc: '连续打卡5天', condition: '连续打卡', target: 5 },
  { id: 'streak_7', name: '七日氧护', icon: '🏆', color: '#06B6D4', desc: '连续打卡7天', condition: '连续打卡', target: 7 },
  { id: 'scene_all', name: '全场景达人', icon: '🗺️', color: '#6366F1', desc: '体验全部4大健康场景', condition: '覆盖4场景', target: 4 },
  { id: 'chat_10', name: '畅聊达人', icon: '💬', color: '#10B981', desc: '和氧氧聊天满10次', condition: '聊天10次', target: 10 },
  { id: 'oxygen_test', name: '含氧自测', icon: '🧪', color: '#8B5CF6', desc: '完成一次含氧感自测', condition: '自测1次', target: 1 },
  { id: 'plateau_guard', name: '高原守护者', icon: '🏔️', color: '#F59E0B', desc: '记录过高原场景', condition: '高原打卡', target: 1 },
  { id: 'product_look', name: '装备侦察兵', icon: '🔍', color: '#6366F1', desc: '查看过充氧宝产品', condition: '查看产品', target: 1 },
  { id: 'ox_7day', name: '氧护7天', icon: '🫁', color: '#10B981', desc: '累计使用氧方案7天', condition: '累计吸氧', target: 7 },
  { id: 'ox_21day', name: '氧护21天', icon: '💎', color: '#06B6D4', desc: '累计使用氧方案21天', condition: '累计吸氧', target: 21 }
]

// ===== 产品知识库（对齐 product-db.js）=====
const PRODUCT_MODELS = [
  { id: 'WA-X', type: '零售', name: '充氧宝 WA-X', status: '在售', desc: '日常随身补氧主力款' },
  { id: 'WA-01', type: '零售', name: '充氧宝 WA-01', status: '在售', desc: '经典款，均衡之选' },
  { id: 'WA-R', type: '租赁', name: '充氧宝 WA-R', status: '在售', desc: '灵活租赁，轻量体验' },
  { id: 'WA-S', type: '时尚', name: '充氧宝 WA-S', status: '研发中', desc: '时尚轻奢款' },
  { id: 'WA-Y', type: '专业', name: '充氧宝 WA-Y', status: '研发中', desc: '专业医疗级' }
]

const PRODUCT_SPECS = {
  weight: '约 280g', powerOn: '一键开启', charge: 'Type-C 快充，续航约8小时',
  output: '富氧浓度 30%+', consumable: '香氛嗅吸胶囊（可替换）',
  core: '分子筛富氧技术', standard: '符合家用制氧设备安全标准', valid: '高原/日常皆适用'
}

const SCENES = [
  { id: 'high_altitude', sceneName: '高原旅行', icon: '🏔️', productName: '充氧宝 WA-X', suggestion: '高原旅行补氧，缓解高反' },
  { id: 'brain_fatigue', sceneName: '脑疲劳', icon: '🧠', productName: '充氧宝 WA-01', suggestion: '长时间用脑，及时补氧提神' },
  { id: 'sport_recovery', sceneName: '运动恢复', icon: '🏃', productName: '充氧宝 WA-R', suggestion: '运动后加速恢复，缓解乳酸' },
  { id: 'elderly', sceneName: '银发陪伴', icon: '👴', productName: '充氧宝 WA-01', suggestion: '日常补氧保健，陪伴家人' }
]

module.exports = {
  PERSONALITIES,
  GROWTH_RULES,
  GROWTH_LEVELS,
  LEVEL_REWARDS,
  ACHIEVEMENTS,
  PRODUCT_MODELS,
  PRODUCT_SPECS,
  SCENES
}
