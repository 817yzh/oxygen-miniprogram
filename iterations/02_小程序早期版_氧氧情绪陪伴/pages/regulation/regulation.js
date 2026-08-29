// P5 · 调节内容页
const app = getApp()

// 按场景组织的行动建议
const SCENE_ACTIONS = {
  'plateau': [
    { title: '阶梯式休息原则', desc: '每上升500米，给自己半天适应时间，不要急着冲高' },
    { title: '少量多次补水', desc: '比平时多喝30%的水，每次一小口，不要猛灌' },
    { title: '保证睡眠质量', desc: '高原第一晚尤其重要，提前1小时放下手机' }
  ],
  'brain': [
    { title: '番茄工作法', desc: '集中25分钟，休息5分钟。重复4轮后休息15分钟' },
    { title: '桌面整理仪式', desc: '花2分钟整理桌面，这个物理动作也能整理思路' },
    { title: '蓝光过滤', desc: '睡前1小时开启屏幕的暖色模式，帮助大脑准备休息' }
  ],
  'sport': [
    { title: '冷热交替浴', desc: '训练后先温水淋浴2分钟，再冷水冲30秒，重复3轮' },
    { title: '泡沫轴放松', desc: '花5分钟用泡沫轴滚动大腿前侧和小腿，缓解肌肉紧张' },
    { title: '补充蛋白质窗口', desc: '运动后30分钟内补充蛋白质，吸收效率最高' }
  ],
  'elder': [
    { title: '每日温和散步', desc: '每天15分钟户外散步，慢走即可，重点是坚持' },
    { title: '和家人分享三件小事', desc: '每天给家人发一段语音，说说今天遇到的三件小事' },
    { title: '简易手指操', desc: '双手握拳再张开，重复20次，促进末梢血液循环' }
  ],
  'all': [
    { title: '呼吸调节', desc: '4-4-6呼吸法：吸气4秒→屏息4秒→呼气6秒，做3轮' },
    { title: '身体扫描', desc: '从头顶到脚尖，依次感受身体每个部位，遇到紧张处深呼吸' },
    { title: '情绪命名', desc: '给自己的情绪起个名字，承认它的存在有时就已经足够' }
  ]
}

// 科普知识库
const SCIENTIFIC_TIPS = [
  '深呼吸会激活副交感神经系统，帮助心率下降，这就是为什么"先深呼吸"总是有效。',
  '脑疲劳的本质是前额叶皮层能量耗尽，休息不是偷懒，是让大脑重建资源。',
  '高原环境血氧饱和度每下降1%，心率平均上升5-8次/分钟，这是身体在自动代偿。',
  '运动后30分钟是身体修复的黄金窗口，此时补充营养效率最高。',
  '孤独感（loneliness）和独处（alone）不是一回事；感到孤独时，和信任的人聊10分钟就能有效缓解。',
  '人的注意力单次最长维持约25分钟，之后效率会明显下降，这不是意志力的问题。',
  '高原地区建议每天的液体摄入量比平原多500-1000毫升，但不要一次喝太多。'
]

Page({
  data: {
    activeScene: 'all',
    isBreathing: false,
    filteredActions: SCENE_ACTIONS['all'],
    scientificTip: ''
  },

  onLoad() {
    // 获取上次的结果场景
    const lastRecord = app.globalData.lastRecord
    const scene = lastRecord && lastRecord.scene ? lastRecord.scene : 'all'
    
    // 随机选一条科普
    const tip = SCIENTIFIC_TIPS[Math.floor(Math.random() * SCIENTIFIC_TIPS.length)]

    this.setData({
      activeScene: scene,
      filteredActions: SCENE_ACTIONS[scene] || SCENE_ACTIONS['all'],
      scientificTip: tip
    })
  },

  filterScene(e) {
    const scene = e.currentTarget.dataset.scene
    this.setData({
      activeScene: scene,
      filteredActions: SCENE_ACTIONS[scene]
    })
  },

  startBreathing() {
    if (this.data.isBreathing) return
    this.setData({ isBreathing: true })

    // 简单呼吸计时：3轮 4-4-6
    // 每轮 4+4+6 = 14秒，3轮 = 42秒
    setTimeout(() => {
      this.setData({ isBreathing: false })
      wx.showToast({
        title: '呼吸完成 🌿',
        icon: 'none',
        duration: 2000
      })
    }, 42000)
  }
})
