/**
 * mock/personality-product-map.js
 * 氧系人格 → 充氧宝设备 + 嗅吸方案 映射(V0.7)
 *
 * 用途：MBTI 结果页展示「人格 + 推荐设备 + 嗅吸方案」，引导理解自己的氧气装备。
 * 数据面向未来接真实后台：personality 应为人格 id(英文)，前端按 id 匹配。
 *
 * 六大氧系人格：explorer / thinker / healer / energetic / slower / sensitive
 */

const PERSONALITY_PRODUCT_MAP = {
  explorer: {
    personality: '氧气探险家',
    id: 'explorer',
    product: 'Work Air 充氧宝 · 高原便携款',
    productId: 'WA-X',
    desc: '为高原徒步和自驾准备，轻便随行，快速缓解高反头晕。',
    aroma: '高原安神嗅吸',
    aromaDesc: '薄荷 + 尤加利 · 缓解高反焦虑，稳定情绪'
  },
  thinker: {
    personality: '深氧思考者',
    id: 'thinker',
    product: 'Work Air 充氧宝 · 桌面款',
    productId: 'WA-01',
    desc: '放在桌边持续补氧，缓解脑疲劳，提升专注力。',
    aroma: '提神醒脑嗅吸',
    aromaDesc: '迷迭香 + 薄荷 + 柠檬 · 提神醒脑，提升专注'
  },
  healer: {
    personality: '轻氧治愈者',
    id: 'healer',
    product: 'Work Air 充氧宝 · 便携款 + 安神溶液',
    productId: 'WA-01',
    desc: '日常补氧 + 芳香疗愈，给身心一次温柔的充电。',
    aroma: '舒缓轻柔嗅吸',
    aromaDesc: '洋甘菊 + 薰衣草 · 舒缓情绪，放松身心'
  },
  energetic: {
    personality: '活力氧人',
    id: 'energetic',
    product: 'Work Air 充氧宝 · 运动款',
    productId: 'WA-R',
    desc: '运动后快速补氧，加速乳酸代谢，恢复满格状态。',
    aroma: '运动恢复嗅吸',
    aromaDesc: '尤加利 + 薰衣草 + 柠檬 · 加速身体恢复'
  },
  slower: {
    personality: '慢氧生活家',
    id: 'slower',
    product: 'Work Air 充氧宝 · 时尚款',
    productId: 'WA-S',
    desc: '颜值与功能兼顾，居家静音补氧，慢享生活。',
    aroma: '安神助眠嗅吸',
    aromaDesc: '檀香 + 薰衣草 · 助眠安神，放松情绪'
  },
  sensitive: {
    personality: '高氧敏感体',
    id: 'sensitive',
    product: 'Work Air 充氧宝 · 便携款 + 睡眠方案',
    productId: 'WA-01',
    desc: '睡前补氧 + 深呼吸练习，给高感知的你需要的那层氧护盾。',
    aroma: '睡眠舒缓嗅吸',
    aromaDesc: '薰衣草 + 洋甘菊 · 助眠安神，缓解焦虑'
  }
}

/** 默认兜底(未匹配到人格时) */
const DEFAULT_PRODUCT_PICK = {
  personality: '',
  id: 'default',
  product: 'Work Air 充氧宝 · 便携款',
  productId: 'WA-X',
  desc: '一款机子走遍四大场景，便携补氧，给生活充点氧。',
  aroma: '通用补氧嗅吸',
  aromaDesc: '自然清新 · 日常补氧保健'
}

/**
 * 根据人格 id 获取推荐装备
 * @param {string} typeId 人格 id(英文)
 */
function getPersonalityProduct(typeId) {
  return PERSONALITY_PRODUCT_MAP[typeId] || DEFAULT_PRODUCT_PICK
}

module.exports = { PERSONALITY_PRODUCT_MAP, DEFAULT_PRODUCT_PICK, getPersonalityProduct }
