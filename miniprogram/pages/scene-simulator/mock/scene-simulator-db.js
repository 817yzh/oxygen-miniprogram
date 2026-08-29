/**
 * mock/scene-simulator-db.js
 * 场景模拟器 · 氧需求预测(V0.7)
 *
 * 用户模拟一个"明天的场景"，输出该场景的氧需求高低 + 推荐充氧宝方案。
 * 数据结构面向未来接真实后台：场景参数化后，可由后台动态配置。
 */

const SCENE_SIMULATIONS = [
  {
    id: 'lasa',
    icon: '🏔️',
    title: '明天去拉萨',
    desc: '高原旅行 · 海拔剧变',
    tags: ['高原', '缺氧', '长途'],
    sceneLine: '明天去拉萨 · 预估海拔 3650m',
    tipLine: '正在模拟高原环境下的耗氧速率…',
    metrics: [
      { label: '环境气压', value: '65 kPa', note: '偏低' },
      { label: '耗氧速率', value: '极高', note: '高原低氧' },
      { label: '建议吸氧', value: '15-20 分钟', note: '即时缓解' }
    ],
    oxygen: '高',
    oxygenText: '高',
    oxygenScore: 85,
    advice: '高原环境血氧骤降，极易头晕气喘。建议全程随身携带高原便携款，出现不适立刻吸氧 3-5 分钟，别硬扛。',
    plan: 'Work Air 充氧宝 · 高原便携款',
    planDesc: '随身携带 · 快速缓解高反',
    planTags: ['随身携带', '快速缓解高反', '防晕防喘'],
    aroma: '高原安神嗅吸（薄荷+尤加利）',
    next: '进藏前 2 周保持睡眠充足、避免剧烈运动'
  },
  {
    id: 'overtime',
    icon: '💻',
    title: '今晚加班',
    desc: '脑力消耗 · 久坐久脑',
    tags: ['专注', '疲劳', '久坐'],
    sceneLine: '今晚加班 · 连续用脑 6h+',
    tipLine: '正在模拟长时间脑力负荷下的供氧状态…',
    metrics: [
      { label: '脑力负荷', value: '高耗能', note: '久坐专注' },
      { label: '供氧状态', value: '紧张', note: '易脑雾' },
      { label: '建议吸氧', value: '20 分钟', note: '提升专注' }
    ],
    oxygen: '中',
    oxygenText: '中',
    oxygenScore: 60,
    advice: '长时间用脑大脑耗氧大，容易头昏、专注力下降。建议桌面持续补氧 + 每 45 分钟起来活动一次。',
    plan: 'Work Air 充氧宝 · 桌面款',
    planDesc: '桌面持续补氧 · 提升专注',
    planTags: ['桌面持续补氧', '提升专注', '久坐友好'],
    aroma: '提神醒脑嗅吸（迷迭香+薄荷+柠檬）',
    next: '配合深呼吸 + 短暂走动，效果更佳'
  },
  {
    id: 'run5k',
    icon: '🏃',
    title: '刚跑5公里',
    desc: '运动恢复 · 乳酸堆积',
    tags: ['运动', '恢复', '肌肉'],
    sceneLine: '刚跑 5 公里 · 中等强度训练',
    tipLine: '正在评估运动后肌肉耗氧与恢复速率…',
    metrics: [
      { label: '运动强度', value: '中高', note: '耗氧大' },
      { label: '乳酸堆积', value: '偏高', note: '酸胀' },
      { label: '建议吸氧', value: '10-15 分钟', note: '加速恢复' }
    ],
    oxygen: '中',
    oxygenText: '中',
    oxygenScore: 58,
    advice: '运动时身体大量耗氧，运动后及时补氧能加速乳酸代谢、缓解肌肉酸胀。练完吸 10-15 分钟，恢复快一倍。',
    plan: 'Work Air 充氧宝 · 运动款',
    planDesc: '运动后即时恢复',
    planTags: ['运动后即时恢复', '加速乳酸代谢', '防疲劳'],
    aroma: '运动恢复嗅吸（尤加利+薰衣草+柠檬）',
    next: '运动后拉伸 + 补氧双管齐下'
  },
  {
    id: 'elder',
    icon: '👴',
    title: '照顾老人',
    desc: '银发日常 · 居家保健',
    tags: ['银发', '保健', '睡眠'],
    sceneLine: '照顾老人 · 居家日常保健',
    tipLine: '正在模拟银发人群静息状态下的血氧水平…',
    metrics: [
      { label: '静息血氧', value: '略低', note: '93%+' },
      { label: '耗氧需求', value: '平稳', note: '日常' },
      { label: '建议吸氧', value: '15 分钟', note: '安神助眠' }
    ],
    oxygen: '低',
    oxygenText: '低',
    oxygenScore: 40,
    advice: '中老年人血氧水平下降，容易头晕、乏力、睡眠浅。日常居家补氧能改善血氧，缓解不适带来的情绪焦虑。',
    plan: 'Work Air 充氧宝 · 银发便携款',
    planDesc: '居家日常补氧 · 安神助眠',
    planTags: ['居家日常补氧', '安神助眠', '慢病友好'],
    aroma: '安神助眠嗅吸（薰衣草+洋甘菊+檀香）',
    next: '睡前使用或日常居家使用'
  }
]

/** 按 id 获取场景模拟 */
function getSimulation(id) {
  return SCENE_SIMULATIONS.find(s => s.id === id) || SCENE_SIMULATIONS[0]
}

module.exports = { SCENE_SIMULATIONS, getSimulation }
