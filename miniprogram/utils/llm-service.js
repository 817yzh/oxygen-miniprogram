/**
 * utils/llm-service.js
 * 大模型服务预留层(V0.8 · Agent化)
 *
 * 当前阶段不接入真实 LLM，仅提供统一接口占位。
 * 未来可在此接入:
 *   - 通义千问 / 智谱 / 文心一言 等中文大模型
 *   - 或云端函数(云函数/自建后端)
 *
 * 职责: 提供统一的"生成氧氧回复"接口，屏蔽底层模型差异，
 *       让 氧氧Agent 层调用方无需关心接的是规则引擎还是真实LLM。
 */

/**
 * 生成氧氧回复
 * @param {string} userText 用户输入
 * @param {object} context { userName, personality, preferences, emotionAnalysis, scene }
 * @returns {Promise<string>} 回复文本
 *
 * 当前实现: 回退到 chatEngine(规则引擎)。
 * 未来接入真实 LLM 时，在此处替换为 LLM 调用即可。
 */
async function generateReply(userText, context) {
  // TODO: 接入真实 LLM 时替换此实现
  const chatEngine = require('./chatEngine')
  return chatEngine.reply(userText, {
    userName: (context && context.userName) || '氧友',
    personality: context && context.personality,
    preferences: context && context.preferences
  })
}

/**
 * 判断当前是否已接入真实 LLM
 * @returns {boolean}
 */
function isLLMAvailable() {
  // 未接入，返回 false；接入后置为 true 并传入真实调用逻辑
  return false
}

module.exports = { generateReply, isLLMAvailable }
