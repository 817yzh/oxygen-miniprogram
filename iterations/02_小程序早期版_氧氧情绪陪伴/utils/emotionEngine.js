/**
 * 氧氧情绪分析引擎 v1
 * 
 * 第一期：基于关键词匹配 + 简单的置信度规则
 * 下一期：替换为 LLM Prompt 调用
 * 
 * 标签池（固定，不允许自由创建新标签）：
 *   正向：开心、平静、放松
 *   负向：焦虑、烦躁、疲惫、低落、紧张、孤独
 */

// 情绪关键词映射表
const EMOTION_KEYWORDS = {
  '开心': ['开心', '高兴', '快乐', '兴奋', '棒', '太好', '不错', '满意', '爽', '赞', '舒服', '舒坦', '幸福', '愉悦', '欣喜', '满足', '美好'],
  '平静': ['平静', '放松', '安逸', '安稳', '悠闲', '平和', '坦然', '淡定', '宁静', '舒服', '自在', '舒坦'],
  '放松': ['放松', '轻松', '舒缓', '缓过来了', '好了', '恢复', '好点了', '解脱', '舒坦', '透气'],
  '焦虑': ['焦虑', '担心', '害怕', '紧张', '不安', '慌', '怕', '烦心', '揪心', '忐忑', '焦虑', '慌了', '不踏实', '顾虑', '愁'],
  '烦躁': ['烦躁', '暴躁', '烦死了', '烦', '受不了', '抓狂', '炸了', '火大', '烦人', '急躁', '焦躁', '郁闷', '烦闷', '烦躁'],
  '疲惫': ['累', '疲惫', '困', '没力气', '倦', '乏', '虚', '疲劳', '精疲力竭', '犯困', '想睡', '累死', '累趴', '废了', '透支', '腰疼'],
  '低落': ['低落', '不开心', '难过', '伤心', '哭', '失望', '丧', '郁闷', '颓', '闷', '没劲', '没意思', '消沉', '沉', '蓝瘦', '郁闷'],
  '紧张': ['紧张', '怕', '发怵', '压力大', '紧绷', '绷着', '担心', '不敢', '不确定', '心里没底', '难'],
  '孤独': ['孤独', '孤单', '一个人', '寂寞', '孤零零', '没人', '独', '想有人陪', '空落落', '空空', '没有人在', '好孤单']
}

// 场景常见情绪标签（用于校验合理性）
const SCENE_EMOTIONS = {
  'plateau': ['焦虑', '紧张', '平静', '放松', '疲惫', '开心'],
  'brain': ['烦躁', '疲惫', '低落', '焦虑', '放松', '平静'],
  'sport': ['疲惫', '焦虑', '放松', '开心', '平静', '低落'],
  'elder': ['孤独', '低落', '平静', '开心', '焦虑', '疲惫']
}

// 调节建议规则表
const REGULATION_TIPS = {
  '焦虑': '试试做3次深呼吸，吸气4秒、屏息4秒、呼气6秒',
  '紧张': '试试做3次深呼吸，吸气4秒、屏息4秒、呼气6秒',
  '烦躁': '先离开当前环境2分钟，喝口水，做个短暂的放空',
  '疲惫': '休息一下，闭目养神5分钟，让身体自己调节',
  '低落': '给自己一个温柔的小目标：做一件能让你微笑的小事',
  '孤独': '给自己冲杯热饮，打开窗户透透气，你已经很勇敢了',
  '放松': '保持这个状态，你做得很好！',
  '平静': '平稳的状态就是你最好的充氧节奏',
  '开心': '今天的状态很棒，记得为自己庆祝一下！'
}

// 产品推荐话术
const PRODUCT_HINTS = {
  'plateau': '高原场景建议随身携带充氧宝，轻松应对海拔变化',
  'brain': '脑力高强度时段可配合充氧宝使用，物理提神不添堵',
  'sport': '运动后恢复期建议使用充氧宝，帮助加速恢复',
  'elder': '日常居家保健可配合充氧宝使用，给生活充充氧',
  'default': '给自己充充氧，让身心都轻松一点'
}

// 趣味画像标签
const PERSONA_LINES = {
  '开心': '今日是元气满满的小太阳 ☀️',
  '平静': '今日是稳稳的湖泊，风平浪静 🌊',
  '放松': '今日是晒太阳的小猫，懒洋洋的 🐱',
  '焦虑': '今日是有点紧张的小狐狸 🦊',
  '烦躁': '今日是冒烟的小火山，需要降降温 🌋',
  '疲惫': '今日是电量告急的小企鹅 🐧',
  '低落': '今日是静静飘落的叶子 🍂',
  '紧张': '今日是竖起耳朵的小兔 🐰',
  '孤独': '今日是独自散步的小鲸鱼 🐋'
}

// 共情解读模板
const INSIGHT_TEMPLATES = {
  '开心': '看起来你现在心情不错，这个状态值得好好享受！',
  '平静': '平稳的节奏是最好的充氧，继续保持就好。',
  '放松': '终于缓过来了，给自己点个赞。',
  '焦虑': '看起来你现在有点担心，这是很正常的反应。慢慢呼吸，氧氧陪着你。',
  '烦躁': '有点烦躁是正常的，先停下来喘口气再说。',
  '疲惫': '你已经努力了很久，是时候让自己休息一下了。',
  '低落': '每个人都会有这样的时刻，先接纳它，然后慢慢来。',
  '紧张': '紧张是身体在准备应对挑战，试试看深呼吸。',
  '孤独': '即使一个人，你也在好好照顾自己，这已经很棒了。'
}

/**
 * 核心分析函数
 * @param {string} text 用户输入文本
 * @param {string} scene 场景标签
 * @returns {object} { emotionLabel, confidence, personaLine, insight, regulationTip, productHint }
 */
function analyze(text, scene) {
  if (!text || text.trim().length === 0) {
    // 兜底
    return {
      emotionLabel: '平静',
      confidence: 0.5,
      personaLine: PERSONA_LINES['平静'],
      insight: '氧氧正在倾听，试着写点什么吧',
      regulationTip: REGULATION_TIPS['平静'],
      productHint: scene ? PRODUCT_HINTS[scene] || PRODUCT_HINTS.default : PRODUCT_HINTS.default
    }
  }

  const input = text.toLowerCase()

  // 1. 关键词匹配计分
  let scores = {}
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      if (input.includes(kw)) {
        // 长/短词加权：长词更准确
        score += kw.length > 4 ? 2 : 1
      }
    }
    if (score > 0) {
      scores[emotion] = score
    }
  }

  // 2. 如果场景已知，对场景常用情绪加分
  if (scene && SCENE_EMOTIONS[scene]) {
    for (const emo of SCENE_EMOTIONS[scene]) {
      if (scores[emo]) {
        scores[emo] += 0.5
      }
    }
  }

  // 3. 选择得分最高的情绪
  let topEmotion = '平静' // 默认
  let topScore = 0
  for (const [emo, score] of Object.entries(scores)) {
    if (score > topScore) {
      topScore = score
      topEmotion = emo
    }
  }

  // 4. 负向情绪检测（安全兜底）
  const negativeEmotions = ['焦虑', '烦躁', '疲惫', '低落', '紧张', '孤独']
  const isNegative = negativeEmotions.includes(topEmotion)

  // 极端内容检测（自伤/极端负面）
  const extremePatterns = ['不想活', '死了', '自杀', '活不下去', '撑不下去', '结束']
  const hasExtreme = extremePatterns.some(p => input.includes(p))

  // 5. 计算置信度
  let confidence = 0.5
  if (topScore > 0) {
    // 根据匹配强度调整
    confidence = Math.min(0.95, 0.5 + (topScore * 0.08))
  } else {
    // 无关键词匹配，用场景推测
    if (scene) {
      confidence = 0.4
      switch(scene) {
        case 'plateau': topEmotion = '焦虑'; break
        case 'brain': topEmotion = '疲惫'; break
        case 'sport': topEmotion = '疲惫'; break
        case 'elder': topEmotion = '孤独'; break
      }
    } else {
      confidence = 0.3
      // 根据常见用词做最粗略的判断
      if (input.length < 5) {
        topEmotion = '平静'
      }
    }
  }

  // 6. 低置信度兜底
  if (confidence < 0.5) {
    // 前端会显示"仅供参考"弱化表述
  }

  // 7. 极端内容处理
  if (hasExtreme) {
    return {
      emotionLabel: '低落',
      confidence: 0.7,
      personaLine: null,
      insight: '氧氧收到了你的感受。如果最近感觉不太好，建议和身边信任的人聊聊，或者拨打心理援助热线寻求专业帮助。',
      regulationTip: null,
      productHint: null,
      hasExtremeContent: true
    }
  }

  // 8. 组装结果
  const result = {
    emotionLabel: topEmotion,
    confidence: Math.round(confidence * 100) / 100,
    sceneTag: scene || 'general',
    personaLine: isNegative ? PERSONA_LINES[topEmotion] : PERSONA_LINES[topEmotion],
    insight: INSIGHT_TEMPLATES[topEmotion],
    regulationTip: REGULATION_TIPS[topEmotion],
    productHint: scene ? PRODUCT_HINTS[scene] || PRODUCT_HINTS.default : PRODUCT_HINTS.default
  }

  return result
}

module.exports = {
  analyze
}
