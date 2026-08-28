/**
 * src/routes/index.js
 * 路由注册中心：所有 API 路由在这里挂载。
 * 采用轻量 REST 风格：/api/xxx
 */

const router = require('./router.js')
const userService = require('../services/userService.js')
const chatService = require('../services/chatService.js')
const emotionService = require('../services/emotionService.js')
const { PRODUCT_MODELS, PRODUCT_SPECS, SCENES, GROWTH_LEVELS, LEVEL_REWARDS } = require('../db/static-data.js')

/** 统一成功响应 */
function ok(res, data) {
  res.json({ code: 0, message: 'ok', data })
}

/** 统一失败响应 */
function fail(res, message, code = 1, status = 400) {
  res.status(status).json({ code, message, data: null })
}

/** 从请求解析 user_id（优先 header，其次 query，其次 body） */
function getUserId(req) {
  return req.headers['x-user-id'] || req.query.user_id || (req.body && req.body.user_id) || ''
}

function register(app) {
  // ========== 健康检查 ==========
  router.get(app, '/api/health', (req, res) => {
    ok(res, { status: 'up', time: new Date().toISOString() })
  })

  // ========== 用户 ==========
  router.get(app, '/api/user/profile', (req, res) => {
    const userId = getUserId(req)
    if (!userId) return fail(res, '缺少用户标识 user_id')
    const profile = userService.getUserProfile(userId)
    ok(res, profile)
  })

  router.post(app, '/api/user/register', (req, res) => {
    const userId = getUserId(req)
    if (!userId) return fail(res, '缺少用户标识 user_id')
    const user = userService.getOrCreateUser(userId)
    ok(res, user)
  })

  // 更新用户资料
  router.post(app, '/api/user/update', (req, res) => {
    const userId = getUserId(req)
    if (!userId) return fail(res, '缺少用户标识 user_id')
    const store = require('../db/store.js')
    const user = userService.getOrCreateUser(userId)
    const patch = {}
    if (req.body.nickname) patch.nickname = req.body.nickname
    if (req.body.avatar !== undefined) patch.avatar = req.body.avatar
    patch.updated_at = new Date().toISOString()
    const updated = store.update('users', { user_id: user.user_id }, patch)
    ok(res, updated)
  })

  // ========== 打卡 ==========
  router.post(app, '/api/checkin', (req, res) => {
    const userId = getUserId(req)
    if (!userId) return fail(res, '缺少用户标识 user_id')
    const result = userService.submitCheckin(userId, req.body || {})
    if (result.error) return fail(res, result.error)
    ok(res, result)
  })

  router.get(app, '/api/checkin/history', (req, res) => {
    const userId = getUserId(req)
    if (!userId) return fail(res, '缺少用户标识 user_id')
    const limit = Math.min(Number(req.query.limit) || 30, 200)
    ok(res, userService.getCheckins(userId, limit))
  })

  router.get(app, '/api/checkin/today', (req, res) => {
    const userId = getUserId(req)
    if (!userId) return fail(res, '缺少用户标识 user_id')
    ok(res, { todayRecorded: userService.hasTodayRecord(userId) })
  })

  // ========== 人格 ==========
  router.get(app, '/api/personality/list', (req, res) => {
    ok(res, userService.getPersonalities())
  })

  router.post(app, '/api/personality/save', (req, res) => {
    const userId = getUserId(req)
    const personalityId = (req.body && req.body.personality_id) || (req.body && req.body.type)
    if (!userId) return fail(res, '缺少用户标识 user_id')
    if (!personalityId) return fail(res, '缺少人格类型 personality_id')
    const result = userService.setPersonality(userId, personalityId)
    if (result.error) return fail(res, result.error)
    ok(res, result)
  })

  // 人格 → 产品映射
  router.get(app, '/api/personality/:type/product', (req, res) => {
    const type = req.params.type
    const { PERSONALITIES } = require('../db/static-data.js')
    const p = PERSONALITIES[type]
    if (!p) return fail(res, '未知人格类型')
    // 简化映射：人格 → 推荐产品
    const productMap = {
      explorer: { model: 'WA-X', sniff: '薄荷+尤加利', reason: '适合高耗能出行场景' },
      thinker: { model: 'WA-01', sniff: '迷迭香+雪松', reason: '提升专注与思考' },
      healer: { model: 'WA-01', sniff: '薰衣草+洋甘菊', reason: '安神舒缓' },
      energetic: { model: 'WA-R', sniff: '薄荷+青柠', reason: '运动后快速恢复' },
      slower: { model: 'WA-S', sniff: '白茶+雪松', reason: '松弛慢生活' },
      sensitive: { model: 'WA-S', sniff: '玫瑰+乳香', reason: '细腻滋养' }
    }
    ok(res, { personality: p, product: productMap[type] || productMap.healer })
  })

  // ========== 偏好 ==========
  router.post(app, '/api/preferences/save', (req, res) => {
    const userId = getUserId(req)
    if (!userId) return fail(res, '缺少用户标识 user_id')
    const prefs = req.body || {}
    ok(res, userService.setPreferences(userId, prefs))
  })

  // ========== 聊天（豆包 LLM 优先，未配置自动回退规则引擎） ==========
  router.post(app, '/api/chat', async (req, res) => {
    const userId = getUserId(req)
    const text = (req.body && req.body.text) || ''
    if (!text.trim()) return fail(res, '消息内容不能为空')
    let profile = {}
    if (userId) profile = userService.getUserProfile(userId) || {}
    const ctx = {
      userId,
      userName: profile.nickname || '氧友',
      personality: profile.personality,
      preferences: profile.preferences,
      scene: req.body.scene
    }
    const result = await chatService.replySmart(text, ctx)
    // 保存聊天记录
    if (userId) {
      userService.saveChatMessage(userId, 'user', text)
      userService.saveChatMessage(userId, 'assistant', result.replyText)
    }
    ok(res, result)
  })

  router.get(app, '/api/chat/history', (req, res) => {
    const userId = getUserId(req)
    if (!userId) return fail(res, '缺少用户标识 user_id')
    const store = require('../db/store.js')
    const msgs = store.find('chat_messages', { user_id: userId }, { sort: 'time', order: 'asc' })
    ok(res, msgs.slice(-50))
  })

  // ========== 情绪分析（豆包 LLM 优先，自动回退规则引擎） ==========
  router.post(app, '/api/emotion/analyze', async (req, res) => {
    const text = (req.body && req.body.text) || ''
    if (!text.trim()) return fail(res, '文本不能为空')
    const result = await emotionService.analyzeSmart(text, req.body.scene)
    ok(res, result)
  })

  // ========== 图片情绪识别（豆包多模态，拍照/上传） ==========
  // req.body: { image: 'data:image/...;base64,xxx' 或 http(s) URL }
  router.post(app, '/api/emotion/image', async (req, res) => {
    const image = (req.body && req.body.image) || ''
    if (!image) return fail(res, '缺少图片数据 image')
    const llm = require('../services/llmService.js')
    const result = await llm.analyzeImageEmotion(image)
    if (!result) {
      // 未配置key或识别失败：回退一个默认结果，接口不崩
      return ok(res, {
        emotionLabel: '平静',
        confidence: 0.7,
        insight: '氧氧没能完全看清你的表情，不过没关系，聊聊也好 🌱',
        mock: true
      })
    }
    ok(res, result)
  })

  // ========== 成长/成就 ==========
  router.get(app, '/api/growth', (req, res) => {
    const userId = getUserId(req)
    if (!userId) return fail(res, '缺少用户标识 user_id')
    const store = require('../db/store.js')
    const growth = store.findOne('user_growth', { user_id: userId })
    const logs = store.find('growth_logs', { user_id: userId }, { sort: 'time', order: 'desc', limit: 50 })
    ok(res, { growth, logs })
  })

  router.get(app, '/api/achievements', (req, res) => {
    const userId = getUserId(req)
    if (!userId) return fail(res, '缺少用户标识 user_id')
    ok(res, userService.getAchievements(userId))
  })

  // ========== 产品/场景静态库 ==========
  router.get(app, '/api/products', (req, res) => {
    ok(res, { models: PRODUCT_MODELS, specs: PRODUCT_SPECS })
  })

  router.get(app, '/api/scenes', (req, res) => {
    ok(res, { scenes: SCENES })
  })

  // ========== 氧方案使用（硬件联动占位） ==========
  router.post(app, '/api/oxygen/use', (req, res) => {
    const userId = getUserId(req)
    if (!userId) return fail(res, '缺少用户标识 user_id')
    const growth = userService.logOxygenUse(userId)
    ok(res, { growth, message: '已记录一次氧方案使用' })
  })

  return app
}

module.exports = { register, ok, fail }
