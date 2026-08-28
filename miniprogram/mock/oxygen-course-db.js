/**
 * mock/oxygen-course-db.js
 * 今日氧气小课堂 · 课程库(V0.7)
 *
 * 首页「氧气小课堂」每日随机/定时展示一条 30 秒氧气科普。
 * 数据字段面向未来接真实后台：
 *   content 为纯文本正文(30秒可读完)，将来可替换为富文本/视频。
 */

const OXYGEN_COURSES = [
  {
    id: 'c01',
    title: '为什么久坐容易疲惫？',
    cover: '🪑',
    duration: '30s',
    category: '脑力',
    content: '久坐时血流变慢，大脑供氧下降，人就容易昏沉。每坐 45 分钟站起来走动 2 分钟、做几个深呼吸，就能给大脑补一次氧，疲劳感明显缓解。',
    tip: '45分钟一动，呼吸一次'
  },
  {
    id: 'c02',
    title: '大脑缺氧的三个信号',
    cover: '🧠',
    duration: '30s',
    category: '脑力',
    content: '注意力难集中、频繁打哈欠、下午莫名犯困——这三个都是大脑供氧不足的信号。高强度用脑后吸 10 分钟富氧空气，比硬扛着刷手机管用。',
    tip: '打哈欠别硬扛'
  },
  {
    id: 'c03',
    title: '高原旅行如何准备？',
    cover: '🏔️',
    duration: '30s',
    category: '高原',
    content: '进藏前两周别剧烈运动、保持睡眠，抵达后前 1-2 天避免跑跳。随身备一台便携富氧机，出现头晕气喘就吸氧 3-5 分钟，比硬扛安全得多。',
    tip: '别让高反毁掉旅程'
  },
  {
    id: 'c04',
    title: '运动后为什么要补氧？',
    cover: '🏃',
    duration: '30s',
    category: '运动',
    content: '运动时身体大量耗氧，运动后及时补氧能加速乳酸代谢、缓解肌肉酸胀、加快恢复。练完吸 10-15 分钟富氧，第二天状态恢复快一倍。',
    tip: '练后10分钟，恢复快一倍'
  },
  {
    id: 'c05',
    title: '睡前深呼吸的正确方式',
    cover: '🌙',
    duration: '30s',
    category: '银发',
    content: '睡前 5 分钟做「4-6 呼吸」：吸气 4 秒、屏息 4 秒、呼气 6 秒。能放松神经、降低心率，帮身体进入修复状态，比刷手机助眠得多。',
    tip: '4-6 呼吸法助眠'
  },
  {
    id: 'c06',
    title: '给爸妈补氧的意义',
    cover: '👴',
    duration: '30s',
    category: '银发',
    content: '中老年人血氧水平下降，容易头晕、乏力、睡眠浅。日常补氧能改善血氧、缓解不适带来的情绪焦虑。给爸妈备一台富氧机，比说一百句「多保重」都实在。',
    tip: '日常补氧更安心'
  },
  {
    id: 'c07',
    title: '飞机高铁上为什么会缺氧？',
    cover: '🛫',
    duration: '30s',
    category: '高原',
    content: '机舱和车厢内空气稀薄，长时间乘坐容易头昏胸闷。一台 320 克的便携富氧机可以带上飞机高铁，随充随用，差旅补氧不耽误。',
    tip: '便携补氧带上路'
  },
  {
    id: 'c08',
    title: '呼吸对了，效率翻倍',
    cover: '💻',
    duration: '30s',
    category: '脑力',
    content: '绝大多数人用胸式浅呼吸，氧气摄入不足。练习腹式呼吸：吸气时肚子鼓起、呼气时收回，单位时间氧气摄入更高，专注力跟着提升。',
    tip: '腹式呼吸更高效'
  }
];

/**
 * 随机取一条课程(可指定分类过滤)
 * @param {string} [category] '脑力'/'高原'/'运动'/'银发'
 */
function getRandomCourse(category) {
  const pool = category ? OXYGEN_COURSES.filter(c => c.category === category) : OXYGEN_COURSES
  return pool[Math.floor(Math.random() * pool.length)]
}

/** 获取今日课程(固定 seed，同一天稳定显示同一条，跨天变化) */
function getDailyCourse(dateKey) {
  // 用日期做稳定 seed，保证同 `一天` 内首页每次刷新显示同一条
  const seed = dateKey ? dateKey.split('-').join('') : new Date().toDateString().split(' ').join('')
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return OXYGEN_COURSES[hash % OXYGEN_COURSES.length]
}

module.exports = { OXYGEN_COURSES, getRandomCourse, getDailyCourse }
