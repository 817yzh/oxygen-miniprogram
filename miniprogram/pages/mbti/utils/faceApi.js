/**
 * 人脸情绪识别 API 封装层
 * 
 * 设计：可切换后端（腾讯云 / 百度AI）
 * 当前阶段：mock 模式，模拟 API 返回
 * 
 * 部署说明：
 * - 密钥配置在云函数环境变量中，不打包进小程序前端
 * - 云函数部署后，前端通过 wx.cloud.callFunction 调用
 * - 切换 provider 只需改云函数中的配置，前端无感
 * 
 * 标签映射表 — 第三方API标签 → 我们的标签池
 *   腾讯云/百度AI常见输出 → 映射结果
 *   高兴/happy          → 开心
 *   平静/neutral/calm   → 平静
 *   惊讶/surprise       → 平静（归为中性）
 *   生气/angry          → 烦躁
 *   悲伤/sad            → 低落
 *   厌恶/disgust        → 烦躁
 *   害怕/fear           → 紧张
 *   疲惫（部分API有）    → 疲惫
 */

// ===== 标签映射表 =====
const API_TO_OUR_LABELS = {
  // 腾讯云 Tencent Cloud 常用标签
  'happy': '开心',
  'neutral': '平静',
  'calm': '平静',
  'surprise': '平静',
  'angry': '烦躁',
  'sad': '低落',
  'disgust': '烦躁',
  'fear': '紧张',
  'tired': '疲惫',
  'fearful': '紧张',
  'surprised': '平静',

  // 百度 AI 常用标签
  '高兴': '开心',
  '平静': '平静',
  '惊讶': '平静',
  '生气': '烦躁',
  '悲伤': '低落',
  '厌恶': '烦躁',
  '害怕': '紧张',
  '疲惫': '疲惫',
  'neutral': '平静',
  'angry': '烦躁',
  'sad': '低落',
  'happy': '开心',
  'fear': '紧张',
  'disgust': '烦躁',
  'surprise': '平静',

  // 兜底
  'unknown': '平静'
}

/**
 * 映射第三方API标签到我们的标签池
 * @param {string} apiLabel 第三方API返回的情绪标签
 * @returns {string} 映射后的标签
 */
function mapApiLabel(apiLabel) {
  const key = (apiLabel || '').toLowerCase().trim()
  return API_TO_OUR_LABELS[key] || API_TO_OUR_LABELS['unknown']
}

/**
 * 从API返回的概率分布中提取最高置信度标签
 * @param {Array} scores API返回的概率分布数组 [{label, confidence}, ...]
 * @returns {{ emotionLabel: string, confidence: number }}
 */
function pickTopEmotion(scores) {
  if (!scores || scores.length === 0) {
    return { emotionLabel: '平静', confidence: 0.3 }
  }

  // 找到置信度最高的
  let top = scores[0]
  for (const item of scores) {
    if (item.confidence > top.confidence) {
      top = item
    }
  }

  return {
    emotionLabel: mapApiLabel(top.label),
    confidence: Math.round(top.confidence * 100) / 100
  }
}

/**
 * 将API原始响应标准化为统一输出
 * @param {object} rawResponse API原始响应
 * @param {string} provider 'tencent' | 'baidu' | 'mock'
 * @returns {{ emotionLabel: string, confidence: number, detail: Array }}
 */
function normalizeResponse(rawResponse, provider) {
  // 腾讯云格式：FaceExpressionInfo
  if (provider === 'tencent') {
    const expression = rawResponse.FaceExpressionInfo || {}
    const scores = [
      { label: 'happy', confidence: expression.Happy || 0 },
      { label: 'neutral', confidence: expression.Neutral || 0 },
      { label: 'surprise', confidence: expression.Surprise || 0 },
      { label: 'angry', confidence: expression.Angry || 0 },
      { label: 'sad', confidence: expression.Sad || 0 },
      { label: 'disgust', confidence: expression.Disgust || 0 },
      { label: 'fear', confidence: expression.Fear || 0 }
    ]
    const result = pickTopEmotion(scores)
    return { ...result, detail: scores }
  }

  // 百度AI格式：expression 字段
  if (provider === 'baidu') {
    const faceList = rawResponse.result && rawResponse.result.face_list
    if (faceList && faceList.length > 0) {
      const face = faceList[0]
      const expression = face.expression || {}
      const emotion = face.emotion || {}
      
      const expressionLabel = expression.type === 'none' ? '平静' : mapApiLabel(expression.type)
      // 百度返回的是 expression.confidence
      const confidence = (expression.probability || emotion.confidence || 0.5)
      
      const scores = [
        { label: 'happy', confidence: emotion.happy || 0 },
        { label: 'sad', confidence: emotion.sad || 0 },
        { label: 'angry', confidence: emotion.angry || 0 },
        { label: 'fear', confidence: emotion.fear || 0 },
        { label: 'disgust', confidence: emotion.disgust || 0 },
        { label: 'surprise', confidence: emotion.surprise || 0 },
        { label: 'neutral', confidence: emotion.neutral || 0 }
      ]

      return {
        emotionLabel: mapApiLabel(expressionLabel),
        confidence: Math.round(confidence * 100) / 100,
        detail: scores
      }
    }
  }

  // 兜底
  return { emotionLabel: '平静', confidence: 0.3, detail: [] }
}

// ===== Mock 数据 =====

/** Mock 数据 - 模拟不同表情的API返回 */
function getMockResult() {
  const mockResults = [
    // 正向情绪
    {
      emotionLabel: '开心',
      confidence: 0.85,
      detail: [
        { label: 'happy', confidence: 0.85 },
        { label: 'neutral', confidence: 0.08 },
        { label: 'surprise', confidence: 0.03 },
        { label: 'sad', confidence: 0.02 },
        { label: 'angry', confidence: 0.01 },
        { label: 'disgust', confidence: 0.005 },
        { label: 'fear', confidence: 0.005 }
      ]
    },
    // 中性
    {
      emotionLabel: '平静',
      confidence: 0.72,
      detail: [
        { label: 'neutral', confidence: 0.72 },
        { label: 'happy', confidence: 0.10 },
        { label: 'surprise', confidence: 0.06 },
        { label: 'sad', confidence: 0.05 },
        { label: 'angry', confidence: 0.03 },
        { label: 'disgust', confidence: 0.02 },
        { label: 'fear', confidence: 0.02 }
      ]
    },
    // 负向
    {
      emotionLabel: '疲惫',
      confidence: 0.68,
      detail: [
        { label: 'tired', confidence: 0.68 },
        { label: 'neutral', confidence: 0.15 },
        { label: 'sad', confidence: 0.08 },
        { label: 'angry', confidence: 0.04 },
        { label: 'disgust', confidence: 0.03 },
        { label: 'fear', confidence: 0.01 },
        { label: 'happy', confidence: 0.01 }
      ]
    },
    {
      emotionLabel: '低落',
      confidence: 0.62,
      detail: [
        { label: 'sad', confidence: 0.62 },
        { label: 'neutral', confidence: 0.20 },
        { label: 'fear', confidence: 0.08 },
        { label: 'angry', confidence: 0.04 },
        { label: 'disgust', confidence: 0.03 },
        { label: 'surprise', confidence: 0.02 },
        { label: 'happy', confidence: 0.01 }
      ]
    },
    {
      emotionLabel: '烦躁',
      confidence: 0.74,
      detail: [
        { label: 'angry', confidence: 0.74 },
        { label: 'disgust', confidence: 0.10 },
        { label: 'neutral', confidence: 0.06 },
        { label: 'sad', confidence: 0.04 },
        { label: 'fear', confidence: 0.03 },
        { label: 'surprise', confidence: 0.02 },
        { label: 'happy', confidence: 0.01 }
      ]
    },
    {
      emotionLabel: '紧张',
      confidence: 0.70,
      detail: [
        { label: 'fear', confidence: 0.70 },
        { label: 'neutral', confidence: 0.12 },
        { label: 'surprise', confidence: 0.08 },
        { label: 'sad', confidence: 0.05 },
        { label: 'angry', confidence: 0.03 },
        { label: 'disgust', confidence: 0.01 },
        { label: 'happy', confidence: 0.01 }
      ]
    }
  ]

  // 随机选一个
  return mockResults[Math.floor(Math.random() * mockResults.length)]
}

/**
 * 主入口：识别照片情绪
 * @param {string} tempFilePath 照片临时路径
 * @param {string} scene 用户选择的场景标签
 * @returns {Promise<{ emotionLabel, confidence, detail, insight? }>}
 *
 * 实现：读图 → base64 → 调后端 /api/emotion/image（豆包多模态识别）
 * 失败/未配后端时回退到本地 mock，保证不崩。
 */
function recognizeFace(tempFilePath, scene) {
  return new Promise((resolve, reject) => {
    console.log('[FaceAPI] 识别照片:', tempFilePath.slice(0, 40) + '...', '场景:', scene)
    const config = require('../../../config.js')
    const apiCfg = (config && config.api) || {}

    // 先读图片转 base64
    wx.getFileSystemManager().readFile({
      filePath: tempFilePath,
      encoding: 'base64',
      success: (r) => {
        const ext = (tempFilePath.split('.').pop() || 'png').toLowerCase()
        const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : (ext === 'gif' ? 'image/gif' : 'image/png')
        const dataUrl = `data:${mime};base64,${r.data}`

        // 调后端豆包多模态识别
        wx.request({
          url: apiCfg.baseUrl + '/api/emotion/image',
          method: 'POST',
          data: { image: dataUrl },
          timeout: (apiCfg.requestTimeout || 8000),
          success: (resp) => {
            const d = resp.data
            if (resp.statusCode === 200 && d && d.code === 0 && d.data) {
              const dd = d.data
              // 转成 faceApi 内部结构
              const detail = [{ label: dd.emotionLabel, confidence: dd.confidence }]
              resolve({
                emotionLabel: mapApiLabel(dd.emotionLabel),
                confidence: dd.confidence || 0.7,
                insight: dd.insight || '',
                detail
              })
            } else {
              console.warn('[FaceAPI] 后端返回异常:', d)
              resolve(getMockResult())
            }
          },
          fail: (err) => {
            console.warn('[FaceAPI] 后端调用失败，回退mock:', err.errMsg)
            resolve(getMockResult())
          }
        })
      },
      fail: (err) => {
        console.warn('[FaceAPI] 读图失败，回退mock:', err.errMsg)
        resolve(getMockResult())
      }
    })
  })
}

// 导出
module.exports = {
  recognizeFace,
  normalizeResponse,
  mapApiLabel,
  pickTopEmotion,

  // 云函数端需要用的（部署时参考）
  API_TO_OUR_LABELS
}
