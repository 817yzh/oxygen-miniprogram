/**
 * utils/emotionService.js
 * 氧氧 Agent · 情绪/意图服务层(V0.8)
 *
 * 统一入口，按 V0.8 架构组织调用链：
 *   用户输入 → emotionService.process() → emotionEngine(情绪分析)
 *                                       → chatEngine(规则回复, 内置共情+产品+记忆)
 *                                       → 返回 结构化结果(回复+情绪+产品提示)
 *
 * 职责：
 *   1. 情绪分析 + 意图识别
 *   2. 生成氧氧回复(走 chatEngine 统一逻辑, 保持现有对话质量)
 *   3. 附加 产品推荐提示(productHint) & 调节建议(regulationTip)
 *   4. (预留) 未来接入 llm-service
 */

const emotionEngine = require('./emotionEngine')
const chatEngine = require('./chatEngine')
const { matchProduct } = require('../mock/product-db.js')
const { getCreatorsByMatch } = require('../mock/creator-db.js') // V0.8 签约博主

/**
 * 处理用户输入，返回结构化的氧氧回复
 * @param {string} userText 用户输入
 * @param {object} opts { scene, preferences, userName, personality }
 * @returns {object} { replyText, emotion, keyText, isProduct, productHint, regulationTip, insight }
 */
function process(userText, opts = {}) {
  const text = (userText || '').trim()
  const context = {
    userName: opts.userName || '氧友',
    personality: opts.personality,
    preferences: opts.preferences
  }

  // 0. V0.8 博主/真实案例意图优先: 用户明确要案例/博主/达人/真人/视频时, 优先给博主推荐
  const isCreatorAsk = /(案例|博主|达人|真人|视频|有人|ta们?怎么)/.test(text)
  if (isCreatorAsk) {
    const cs = getCreatorsByMatch({ scene: opts.scene })
    if (cs && cs.length) {
      return {
        replyText: '给你推荐一位分享了[' + cs[0].scene + ']经验的博主：\n「' + cs[0].name + '」——' + cs[0].description + '\n看他/她怎么用氧氧宝，说不定对你有启发 👇',
        emotion: null,
        isProduct: false,
        productHint: '',
        regulationTip: '',
        insight: '',
        creator: cs[0]
      }
    }
  }

  // 1. 是否纯产品知识问题(多少钱/原理/带飞机/高反等 FAQ)
  const productMatch = matchProduct(text)
  if (productMatch) {
    // 纯产品问答: 直接返回产品知识(走 chatEngine 的产品答法避免重复)
    return {
      replyText: productMatch,
      emotion: null,
      isProduct: true,
      productHint: '',
      regulationTip: '',
      insight: ''
    }
  }

  // 2. 情绪分析
  const emo = emotionEngine.analyze(text, opts.scene)

  // 3. 生成氧氧回复(chatEngine 已融合 共情/情境话术/记忆/人格)
  const replyText = chatEngine.reply(text, context)

  return {
    replyText,
    emotion: emo.emotionLabel,
    confidence: emo.confidence,
    insight: emo.insight,
    regulationTip: emo.regulationTip,
    productHint: emo.productHint,
    keyText: emotionKeyOf(emo.emotionLabel),
    isProduct: false
  }
}

/** 情绪 → 快捷关键词(供记录/标签) */
function emotionKeyOf(label) {
  const map = { '开心': 'en', '平静': 'cm', '放松': 'rx', '焦虑': 'an', '烦躁': 'ir', '疲惫': 'ti', '低落': 'lo', '紧张': 'ns', '孤独': 'gu' }
  return map[label] || 'cm'
}

module.exports = { process }
