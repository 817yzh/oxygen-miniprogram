/**
 * mock/product-db.js
 * Work Air 充氧宝 · 产品知识库(V0.8.1 数字人问答)
 *
 * 基于充氧宝业务真实资料整理(pdf_extract.txt)
 * 用途: 氧氧数字人回答用户关于产品的提问
 *
 * 说明: 价格/购买为演示占位(演示阶段不接真实商城)，其余参数来自企业资料。
 */

// 产品型号
const PRODUCT_MODELS = [
  {
    id: 'WA-X',
    type: '零售款',
    name: 'Work Air 充氧宝 · WA-X 零售款',
    status: '在售',
    desc: '便携式富氧机，主打高性价比日常补氧'
  },
  {
    id: 'WA-01',
    type: '零售款',
    name: 'Work Air 充氧宝 · WA-01 零售款',
    status: '在售',
    desc: '便携式富氧机，功能均衡的经典型号'
  },
  {
    id: 'WA-R',
    type: '租赁款',
    name: 'Work Air 充氧宝 · WA-R 租赁款',
    status: '在租',
    desc: '共享租赁模式，按需使用更灵活'
  },
  {
    id: 'WA-S',
    type: '时尚款',
    name: 'Work Air 充氧宝 · WA-S 时尚款',
    status: '研发中',
    desc: '时尚设计款，兼顾颜值与功能'
  },
  {
    id: 'WA-Y',
    type: '专业款',
    name: 'Work Air 充氧宝 · WA-Y 专业款',
    status: '研发中',
    desc: '专业级补氧设备'
  }
]

// 产品核心参数
const PRODUCT_SPECS = {
  weight: '仅 320~380 克，轻便便携',
  powerOn: '一次满电约 3.5 小时',
  charge: '可用充电宝充电，随充畅氧',
  output: '输出通量 5~6 L/min，相当于 21 瓶 1L 氧气瓶',
  consumable: '无需耗材，稀土永磁体+高分子材料，无需定期更换',
  core: '国家发明专利永磁体氧气富集技术',
  standard: '2024年中国优秀团体标准认证',
  valid: '2025年春晚拉萨分会场指定便携富氧机'
}

// 产品功效(四大场景 + 通用)
const PRODUCT_BENEFITS = {
  high_altitude: '缓解高原反应、头晕乏力，快速提升血氧饱和度、降低心率',
  brain_fatigue: '补充大脑供氧，缓解脑疲劳，提升专注力',
  sport: '加速乳酸代谢、延缓运动性疲劳、加速运动后恢复',
  elderly: '日常补氧保健，改善血氧水平，缓解身体不适带来的情绪焦虑',
  general: '改善血液供氧水平、降低心率、降低运动心血管负荷'
}

// FAQ 问答语料: 用户问题关键词 → 回答
const FAQ = [
  {
    questions: ['多少钱', '价格', '价位', '售价', '怎么卖'],
    reply: 'Work Air 充氧宝分零售和租赁两种模式，具体价格以官方为准。现在是演示阶段，购买入口即将上线，你先体验功能，喜欢再带走 🌱'
  },
  {
    questions: ['在哪买', '怎么买', '购买', '下单', '商城', '去哪买'],
    reply: '购买入口即将上线。目前支持两种模式——零售款(WA-X/WA-01)直接买一台，租赁款(WA-R)按需租用更灵活 🛒'
  },
  {
    questions: ['什么原理', '怎么工作', '什么技术', '原理', '发热', '电'],
    reply: '充氧宝用的是国家发明专利的永磁体氧气富集技术：利用氧分子顺磁、氮分子逆磁的物理特性，让空气通过永磁体单元系统，把氧气从空气中富集出来，持续输出安全的富氧空气。无需耗材、没有噪音 🌬️'
  },
  {
    questions: ['多少克', '重不重', '重量', '便携', '方便带', '多大'],
    reply: '它只有 320~380 克，比一瓶水还轻，可以带上飞机和高铁，塞进包里就能走，特别适合差旅和户外 🎒'
  },
  {
    questions: ['充多久', '续航', '能用多久', '待机', '没电'],
    reply: '满电一次能用约 3.5 小时，相当于 21 瓶 1L 氧气瓶；而且支持用充电宝充电，随充随用，不用担心没电 🔋'
  },
  {
    questions: ['耗材', '换滤芯', '维护', '定期换'],
    reply: '完全不需要耗材！用的是稀土永磁体和高分子材料，无需定期更换，省心又环保 ♻️'
  },
  {
    questions: ['高反', '高原', '缺氧', '头晕'],
    reply: '充氧宝经高原实地测试验证，能快速提升血氧饱和度、缓解高反头晕和乏力。去年还在布达拉宫做了实地测试呢 🏔️'
  },
  {
    questions: ['脑疲劳', '加班', '学习', '专注', '头晕', '效率', '上班', '用脑'],
    reply: '它给大脑补充供氧，能缓解用脑过度的疲劳、提升专注力。高强度用脑后吸 10 分钟，比喝咖啡管用，还不影响睡眠 💻'
  },
  {
    questions: ['运动', '练完', '恢复', '肌肉', '乳酸'],
    reply: '运动后吸一吸，能加速乳酸代谢、延缓疲劳、加快身体恢复，第二天肌肉不容易酸 🏃'
  },
  {
    questions: ['老人', '爸妈', '银发', '老年', '失眠', '保健'],
    reply: '充氧宝日常补氧保健，改善血氧水平。给爸妈备一个，比说一百句"多保重"都实在 💚'
  },
  {
    questions: ['有测试吗', '实测', '有报告吗', '靠谱', '有效果吗', '验证'],
    reply: '有！产品有第三方实测报告背书：脑疲劳缓解研究、稻城亚丁/布达拉宫高原测试、武警西藏总队医院验证等，还拿了西藏科技厅双创大赛一等奖 🏆'
  },
  {
    questions: ['什么牌子', '你们是什么', '公司', '哪家', '品牌', '产品介绍'],
    reply: '我们是西藏充氧宝科技有限公司，旗下产品 Work Air 充氧宝，专注便携式富氧机，2021年核心技术获国家发明专利，2024年获中国优秀团体标准认证 🌿'
  },
  {
    questions: ['可以上飞机吗', '高铁', '安检', '能带吗', '飞机', '上飞机'],
    reply: '可以！充氧宝便携轻巧，可以携带乘坐飞机和高铁，出差旅行都能带着 🛫'
  },
  {
    questions: ['安全吗', '有风险吗', '适合所有人吗', '有没有副作用'],
    reply: '产品经中国优秀团体标准认证，属于富氧空气(氧气浓度高于21%)的日常补氧保健。如有基础疾病或特殊健康状况，建议先咨询医生 🌱'
  },
  {
    questions: ['什么场景用', '什么时候用', '适合谁', '用途', '能干什么'],
    reply: '四大场景都适合：高原旅行缓解高反、脑疲劳提神、运动后恢复、银发日常保健。一个充氧宝，全家都能用 😊'
  }
]

// 兜底产品介绍(通用提问)
const FALLBACK_PRODUCT = 'Work Air 充氧宝是一款便携式富氧机，用国家发明专利的永磁体富集技术，从空气中提取富氧空气，无需耗材，只有 320~380 克。可以缓解高反、脑疲劳，加速运动恢复，也适合银发日常保健 🌿'

/**
 * 根据用户文本匹配产品 FAQ
 * @param {string} text
 * @returns {string|null} 匹配到的回答(找不到返回 null)
 */
function matchProduct(text) {
  if (!text) return null
  const input = String(text)
  // 先遍历所有 FAQ 问题关键词，命中即答(不要求先出现产品词)
  let best = null
  let bestScore = 0
  for (const item of FAQ) {
    for (const q of item.questions) {
      if (input.indexOf(q) >= 0) {
        const score = item.questions.reduce((s, x) => s + (input.indexOf(x) >= 0 ? 1 : 0), 0)
        if (score > bestScore) { bestScore = score; best = item.reply }
      }
    }
  }
  if (best) return best
  // 是否在聊产品/服务(未命中具体FAQ时给兜底产品介绍)
  const isProductTalk = /充氧宝|work air|workair|产品|氧机|补氧|富氧|氧气|便携/.test(input)
  return isProductTalk ? FALLBACK_PRODUCT : null
}

// 获取产品概览(供数字人开场/展示)
function getProductOverview() {
  return {
    brand: '西藏充氧宝科技有限公司',
    product: 'Work Air 充氧宝',
    models: PRODUCT_MODELS,
    specs: PRODUCT_SPECS,
    benefits: PRODUCT_BENEFITS
  }
}

module.exports = { PRODUCT_MODELS, PRODUCT_SPECS, PRODUCT_BENEFITS, FAQ, matchProduct, getProductOverview }
