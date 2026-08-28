/**
 * mock/personality-db.js
 * 六种氧系人格 · 推荐数据配置库(v2 升级版)
 *
 * 设计要点：
 *  1. 每种人格的 destinations/sports/chargeWays 均为"推荐池"(5-8条)
 *  2. 前端展示时随机取 2-3 条 → 同一种人格，不同用户/不同时间看到内容不同
 *  3. 后续扩展维度(目的地图/推荐理由等)直接在对象里加字段即可
 *
 * 字段说明：
 *  id        英文标识
 *  name      人格名称
 *  icon      emoji
 *  mbti      对应MBTI
 *  color     主题色(HEX)
 *  bgGradient 渐变(CSS)
 *  tags      人格标签
 *  description 人格描述(有画面感)
 *  destinations 推荐目的地池([])
 *  sports    适合运动池([])
 *  chargeWays 充能方式池([])
 *  vibe      氛围标签
 *  zodiac    星座天赋
 *  fiveElements 五行属性
 */
const PERSONALITY_DB_V2 = {
  explorer: {
    id: 'explorer',
    name: '氧气探险家',
    icon: '🏔',
    mbti: 'ESTP',
    color: '#72D8C4',
    bgGradient: 'linear-gradient(135deg, #72D8C4, #4A9E8E)',
    tags: ['向往自由', '挑战自我'],
    description: '你的灵魂需要高原的氧气。你喜欢站在高处看世界，用脚步丈量地图上每一个未标记的点。',
    destinations: ['西藏·冈仁波齐', '川西·稻城亚丁', '新疆·喀纳斯', '云南·雨崩', '青海·可可西里', '四川·四姑娘山', '甘肃·扎尕那'],
    sports: ['徒步登山', '越野跑', '高空滑翔', '攀岩', '山地骑行', '溯溪探谷'],
    chargeWays: ['在自然环境中深度呼吸', '站在高处看远方', '感受风的流动', '用脚步丈量未知的路', '在山顶看一次日出'],
    quote: '灵魂需要高原的风，去拥抱每一次呼吸。',
    vibe: '山峰 · 旷野 · 高原',
    zodiac: '射手座',
    fiveElements: '丙火'
  },
  thinker: {
    id: 'thinker',
    name: '深氧思考者',
    icon: '🌌',
    mbti: 'INFP',
    color: '#B8E8FF',
    bgGradient: 'linear-gradient(135deg, #B8E8FF, #4A90B8)',
    tags: ['理性深刻', '独立沉静'],
    description: '内向、专注、喜欢深度探索，在安静中找到力量。你偏爱把想法沉淀成自己的想法。',
    destinations: ['大理·洱海', '杭州·九溪', '桂林·阳朔', '苏州·园林', '安徽·宏村', '浙江·莫干山', '福建·武夷山'],
    sports: ['瑜伽', '冥想慢走', '钓鱼', '太极拳', '长跑', '独木舟'],
    chargeWays: ['在安静的环境里独处', '读书写字', '听雨声', '看云发呆', '一个人走很长的路'],
    quote: '在安静深处，藏着最清醒的自己。',
    vibe: '湖泊 · 竹林 · 山间',
    zodiac: '水瓶座',
    fiveElements: '壬水'
  },
  healer: {
    id: 'healer',
    name: '轻氧治愈者',
    icon: '🌿',
    mbti: 'ENFJ',
    color: '#FF9F43',
    bgGradient: 'linear-gradient(135deg, #FF9F43, #E0712F)',
    tags: ['温柔体贴', '情绪抚平'],
    description: '温暖、共情，用温柔治愈自己和他人。你总是懂得在恰当的时候给别人一个拥抱。',
    destinations: ['三亚·海棠湾', '厦门·鼓浪屿', '青岛·八大关', '北海·涠洲岛', '惠州·双月湾', '威海·环海路'],
    sports: ['游泳', '普拉提', '舞蹈', '海边慢跑', '瑜伽', '冲浪体验'],
    chargeWays: ['靠近水', '靠近温暖的人', '靠近自己柔软的部分', '泡一杯热茶慢慢喝', '和喜欢的人散散步'],
    quote: '温柔，是最有力量的治愈。',
    vibe: '海浪 · 阳光 · 沙滩',
    zodiac: '巨蟹座',
    fiveElements: '乙木'
  },
  energetic: {
    id: 'energetic',
    name: '活力氧人',
    icon: '⚡',
    mbti: 'ESFP',
    color: '#FFD93D',
    bgGradient: 'linear-gradient(135deg, #FFD93D, #F7B500)',
    tags: ['热情洋溢', '能量满格'],
    description: '外向、热情、社交能量满格。你是人群里那个让气氛热烈起来的人，永远电量十足。',
    destinations: ['成都·春熙路', '长沙·橘子洲', '重庆·解放碑', '上海·外滩', '广州·广州塔', '深圳·欢乐港湾'],
    sports: ['团课健身', '球类运动', '骑行', '街舞', '飞盘', '蹦床'],
    chargeWays: ['和人在一起', '分享快乐', '在人群中充电', '热闹的地方走一走', '和朋友们尽兴一场'],
    quote: '每一次呼吸，都是满格的生命力。',
    vibe: '城市 · 霓虹 · 派对',
    zodiac: '狮子座',
    fiveElements: '午火'
  },
  slower: {
    id: 'slower',
    name: '慢氧生活家',
    icon: '☕',
    mbti: 'ISFJ',
    color: '#A8D5BA',
    bgGradient: 'linear-gradient(135deg, #A8D5BA, #6FA58A)',
    tags: ['松弛自如', '享受当下'],
    description: '安稳、松弛、享受平凡日常的每一刻。你懂得生活最好的样子，是慢一点、再慢一点。',
    destinations: ['丽江·束河', '绍兴·安昌', '腾冲·和顺', '徽州·呈坎', '湘西·凤凰', '乌镇', '平遥古城'],
    sports: ['散步', '太极', '园艺', '钓鱼', '慢骑行', '茶道'],
    chargeWays: ['慢下来，不赶时间', '活在当下', '泡一壶茶坐一下午', '在院子里晒太阳', '亲手做一顿饭'],
    quote: '慢一点，才能听见生活的氧气。',
    vibe: '古镇 · 炊烟 · 慢时光',
    zodiac: '金牛座',
    fiveElements: '己土'
  },
  sensitive: {
    id: 'sensitive',
    name: '高氧敏感体',
    icon: '💧',
    mbti: 'INFP',
    color: '#F4A7BB',
    bgGradient: 'linear-gradient(135deg, #F4A7BB, #D97A96)',
    tags: ['感知敏锐', '灵感充沛'],
    description: '敏锐、细腻、感知力强，需要被温柔对待。你能捕捉到别人忽略的细微美好。',
    destinations: ['海南·万宁', '西双版纳·景洪', '厦门·曾厝垵', '大理·沙溪', '腾冲·温泉', '泸沽湖'],
    sports: ['瑜伽', '深呼吸练习', '轻柔拉伸', '水中漫步', '太极', '散步冥想'],
    chargeWays: ['在安全和温暖的环境里慢慢放松', '允许自己休息', '听轻音乐', '泡个热水澡', '读一本温柔的书'],
    quote: '在喧嚣里，依然灵感充沛。',
    vibe: '温暖 · 柔软 · 治愈',
    zodiac: '双鱼座',
    fiveElements: '癸水'
  }
};

// ===== 工具函数 =====
/** 随机取 N 项(不打乱原数组) */
function getRandomItems(arr, count = 3) {
  if (!arr || arr.length === 0) return []
  const n = Math.min(count, arr.length)
  const copy = arr.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

/**
 * 获取人格(带随机推荐)
 * @param {string} id 人格id
 * @param {object} opts { destCount, sportCount, chargeCount }
 * @returns {object|null} 人格数据(含随机取样后的推荐)
 */
function getPersonalityWithRandom(id, opts = {}) {
  const p = PERSONALITY_DB_V2[id]
  if (!p) return null
  return {
    ...p,
    // 每次随机取样
    destinations: getRandomItems(p.destinations, opts.destCount || 3),
    sports: getRandomItems(p.sports, opts.sportCount || 2),
    chargeWays: getRandomItems(p.chargeWays, opts.chargeCount || 1)
  }
}

module.exports = { PERSONALITY_DB_V2, getRandomItems, getPersonalityWithRandom }
