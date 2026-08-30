/**
 * pages/mood-scan/mood-scan.js
 * 氧氧宝 · 面部能量扫描仪（V2 · 四维度丰富输出）
 *
 * 流程: 开始页(3秒扫描动效) → 拍照 → 识别中 → 结果(能量气象波段 + 微表情雷达 + 心理微解析
 *       + 文学治愈 + 天气互文 + 灵狐彩蛋) → 治愈解药卡
 */
const app = getApp()
const faceApi = require('./utils/faceApi')

// ==== 文学 & 哲学治愈素材库（维度二） ====
const QUOTE_LIB = [
  { text: '尼采说："每一个不曾起舞的日子，都是对生命的辜负。"', warm: '但今天，呼呼允许你当一个逃兵，去窗边发呆5分钟，什么都不用想。' },
  { text: '村上春树："当你穿过了暴风雨，你就不再是原来那个人。"', warm: '今天的风浪，你也已经穿过了大半，剩下的交给呼吸。' },
  { text: '太宰治："我们都是被神爱着的孩子。"', warm: '哪怕此刻有点累，也值得一句温柔以待。' },
  { text: '《小王子》："你为你的玫瑰花费了时间，这才使你的玫瑰变得如此重要。"', warm: '你为自己付出的每一分，都让今天的你更珍贵。' },
  { text: '宫崎骏："不管前方的路有多苦，只要走的方向正确，不管多么崎岖不平，都比站在原地更接近幸福。"', warm: '你已经走得很远了，喘口气，接着就是坦途。' },
  { text: '三毛："人生一世，也不过是一个又一个二十四小时的叠加。"', warm: '今天这二十四小时，你已经好好完成了。' },
  { text: '加缪："在严冬，我最终发现，心里有一个不可战胜的夏天。"', warm: '累了就停一停，你的夏天还在心里。' },
  { text: '顾城："黑夜给了我黑色的眼睛，我却用它寻找光明。"', warm: '哪怕今天有点阴，你眼睛里依然有光。' }
]

// ==== 灵狐稀有护身符（维度四 · 彩蛋） ====
const TALISMAN_LIB = [
  { name: '赛博护身符·云朵盾', emoji: '🛡️', desc: '为你挡下今天所有的小疲惫', rare: 'R' },
  { name: '赛博护身符·星尘戒', emoji: '💍', desc: '戴上它，夜晚也能睡得安稳', rare: 'R' },
  { name: '赛博护身符·暖阳徽章', emoji: '🌟', desc: '明天醒来，能量自动充满', rare: 'SR' },
  { name: '赛博护身符·月光坠', emoji: '🌙', desc: '夜深时，灵狐会陪你说话', rare: 'SR' },
  { name: '赛博护身符·极光翼', emoji: '🪽', desc: '稀有款！祝你明天自由飞翔', rare: 'SSR' }
]

Page({
  data: {
    step: 0,            // 0=开始扫描 1=识别中 2=结果 3=解药卡
    scanTips: [
      '正在读取你的微表情…',
      '检测眼角疲惫度…',
      '捕捉嘴角弧度…',
      '分析眉心压力…',
      '计算今日能量波段…'
    ],
    scanTipIdx: 0,
    scanDone: false,
    photoPath: '',
    // 结果（四维度）
    moodBand: null,      // 波段信息
    psychText: '',       // 维度一：心理微解析
    quote: null,         // 维度二：文学金句 {text, warm}
    microExp: [],
    energy: 0,
    oxygen: 0,
    // 三维：天气互文（预留天气接口，当前结合硬件氧）
    weatherText: '',
    // 维度四：彩蛋
    egg: null,           // {type:'talisman', talisman:{...}} 或 null
    // 双氧彩蛋
    showDualEgg: false,
    dualText: '',
    deviceOxygen: null,
    // 解药卡
    cardText: '',
    cardDate: '',
    isDrawing: false
  },

  startScan() {
    if (this.data.scanDone) { this.takePhoto(); return }
    this.setData({ step: 0, scanDone: false, scanTipIdx: 0 })
    this._tipTimer = setInterval(() => {
      const idx = (this.data.scanTipIdx + 1) % this.data.scanTips.length
      this.setData({ scanTipIdx: idx })
    }, 600)
    this._scanTimer = setTimeout(() => {
      clearInterval(this._tipTimer)
      this.setData({ scanDone: true, scanTipIdx: this.data.scanTips.length - 1 })
      wx.vibrateShort({ type: 'light' })
      setTimeout(() => this.takePhoto(), 400)
    }, 3000)
  },

  takePhoto() {
    wx.chooseMedia({
      count: 1, mediaType: ['image'], sourceType: ['camera', 'album'], camera: 'front',
      success: (res) => {
        const photo = res.tempFiles[0].tempFilePath
        this.setData({ photoPath: photo })
        this.analyze(photo)
      },
      fail: (err) => {
        if (err.errMsg.includes('auth deny') || err.errMsg.includes('permission')) {
          wx.showToast({ title: '请在设置中开启摄像头权限', icon: 'none' })
        } else if (!err.errMsg.includes('cancel')) {
          wx.showToast({ title: '拍照出了点小状况，再试一次~', icon: 'none' })
        } else {
          this.setData({ step: 0, scanDone: false })
          clearInterval(this._tipTimer); clearTimeout(this._scanTimer)
        }
      }
    })
  },

  analyze(photo) {
    this.setData({ step: 1 })
    wx.showLoading({ title: '灵狐正在扫描…', mask: true })
    faceApi.recognizeFace(photo, '').then((face) => {
      wx.hideLoading()
      this._buildResult(face, photo)
    }).catch(() => {
      wx.hideLoading()
      this._buildResult({ emotionLabel: '平静', confidence: 0.3 }, photo)
    })
  },

  // ========== 四维度丰富输出 ==========
  _buildResult(face, photo) {
    const label = face.emotionLabel || '平静'
    const bands = {
      '开心': {
        name: '晴空微风波段', emoji: '🌈', grad: 'linear-gradient(135deg,#FFE9A8,#FFB86B)',
        desc: '能量满格，嘴角上扬藏不住，适合大步向前！',
        psych: '今日面部捕捉雷达显示：眼角的笑意像涟漪一样荡开，眉眼舒展没有一丝紧绷。说明你今天心里悄悄搞定了一件很有成就感的事呐。',
        persona: '今日是元气满满的小太阳 ☀️',
        energy: 92, oxygen: 90, risk: false,
        micro: [ {key:'smile',label:'微笑值',value:88,icon:'😊'},{key:'brow',label:'眉心压力',value:18,icon:'👀'},{key:'eye',label:'眼部活力',value:90,icon:'✨'} ]
      },
      '平静': {
        name: '暖阳微醺波段', emoji: '🌤', grad: 'linear-gradient(135deg,#D7F0D3,#A8DDC0)',
        desc: '神情舒展开阔，心态稳得像湖面，稳稳的充氧节奏。',
        psych: '眉间平整、呼吸平稳，整个面部像一泓安静的水。你没在硬撑，是真的进入了松弛状态——这正是最养人的充氧频率。',
        persona: '今日是稳稳的湖泊，风平浪静 🌊',
        energy: 84, oxygen: 86, risk: false,
        micro: [ {key:'smile',label:'微笑值',value:62,icon:'😊'},{key:'brow',label:'眉心压力',value:25,icon:'👀'},{key:'eye',label:'眼部活力',value:74,icon:'✨'} ]
      },
      '放松': {
        name: '林间微风波段', emoji: '🍃', grad: 'linear-gradient(135deg,#CDF0EA,#8FD6C8)',
        desc: '自在舒展，像晒太阳的小猫，慵懒又治愈。',
        psych: '嘴角自然微扬，眼周轻松没有疲惫的纹路，是一副"被温柔对待过"的样子。今天的你，把节奏放对了。',
        persona: '今日是晒太阳的小猫，懒洋洋的 🐱',
        energy: 88, oxygen: 88, risk: false,
        micro: [ {key:'smile',label:'微笑值',value:70,icon:'😊'},{key:'brow',label:'眉心压力',value:20,icon:'👀'},{key:'eye',label:'眼部活力',value:80,icon:'✨'} ]
      },
      '疲惫': {
        name: '电量告急波段', emoji: '🐧', grad: 'linear-gradient(135deg,#DDE5F2,#A9BDE0)',
        desc: '眼角透出点困倦，眼睛和肩膀在悄悄抗议，是时候充电了。',
        psych: '眉间残留了一丝高强度思考的微痕，眼皮有点沉，眼周的光泽比平时淡了几分。你明明扛下了硬骨头，却忘了给自己充口电。',
        persona: '今日是电量告急的小企鹅 🐧',
        energy: 55, oxygen: 58, risk: true,
        micro: [ {key:'smile',label:'微笑值',value:30,icon:'😕'},{key:'brow',label:'眉心压力',value:62,icon:'👀'},{key:'eye',label:'眼部活力',value:28,icon:'😪'} ]
      },
      '低落': {
        name: '细雨绵绵波段', emoji: '🌧', grad: 'linear-gradient(135deg,#CDD6E8,#A5B3D2)',
        desc: '今天的心情好像蒙了层薄薄细雨，辛苦了，想抱抱你。',
        psych: '嘴角的弧度比平时低了些，眼底藏着一点化不开的雾气。也许今天发生的事不如你意，但你已经很勇敢地撑到了现在。',
        persona: '今日是静静飘落的叶子 🍂',
        energy: 46, oxygen: 52, risk: true,
        micro: [ {key:'smile',label:'微笑值',value:24,icon:'😢'},{key:'brow',label:'眉心压力',value:55,icon:'👀'},{key:'eye',label:'眼部活力',value:34,icon:'🌧'} ]
      },
      '焦虑': {
        name: '高压静电波段', emoji: '⚡', grad: 'linear-gradient(135deg,#F0E2C4,#DDBF8F)',
        desc: '眉头微紧、眼神有些放空，灵狐开启防沉迷结界，帮你降降压。',
        psych: '眉心有一道浅浅的紧张纹，眼神略显聚焦而漂移——那是思绪在高速运转的信号。你在为某些事紧绷着，先让眉间松开一点。',
        persona: '今日是有点紧张的小狐狸 🦊',
        energy: 50, oxygen: 54, risk: true,
        micro: [ {key:'smile',label:'微笑值',value:28,icon:'😟'},{key:'brow',label:'眉心压力',value:78,icon:'⚡'},{key:'eye',label:'眼部活力',value:36,icon:'😳'} ]
      },
      '烦躁': {
        name: '沸腾熔岩波段', emoji: '🌋', grad: 'linear-gradient(135deg,#F2D0C0,#E0A290)',
        desc: '像是冒烟的小火山，需要降降温，先缓口气再说。',
        psych: '脸颊线条有些绷紧，嘴角不自觉地抿着，眼角带点焦灼。身体里像有团小火苗在窜，需要一个出口把它放出来。',
        persona: '今日是冒烟的小火山，需要降降温 🌋',
        energy: 44, oxygen: 48, risk: true,
        micro: [ {key:'smile',label:'微笑值',value:20,icon:'😤'},{key:'brow',label:'眉心压力',value:82,icon:'🌋'},{key:'eye',label:'眼部活力',value:32,icon:'😠'} ]
      },
      '紧张': {
        name: '紧绷琴弦波段', emoji: '🎻', grad: 'linear-gradient(135deg,#DAD2F0,#B4A8DE)',
        desc: '像绷紧的琴弦，身体在准备应对挑战，试试深呼吸。',
        psych: '下巴微微收紧，眼周肌肉在悄悄用力，整张脸像一根调紧的琴弦。你在为某件事严阵以待，弦绷得刚刚好，但别忘了松一松。',
        persona: '今日是竖起耳朵的小兔 🐰',
        energy: 52, oxygen: 56, risk: true,
        micro: [ {key:'smile',label:'微笑值',value:26,icon:'😬'},{key:'brow',label:'眉心压力',value:70,icon:'🎻'},{key:'eye',label:'眼部活力',value:38,icon:'😯'} ]
      },
      '孤独': {
        name: '迷雾森林波段', emoji: '🌫', grad: 'linear-gradient(135deg,#DCD8D4,#B8B2AC)',
        desc: '像独自走在薄雾里，有人陪着你，不会太孤单的。',
        psych: '眼底有一层淡淡的疏离，嘴角平静但缺少温度。你可能独自待了太久，没关系，灵狐今天就在这里陪着你。',
        persona: '今日是独自散步的小鲸鱼 🐋',
        energy: 47, oxygen: 52, risk: true,
        micro: [ {key:'smile',label:'微笑值',value:22,icon:'🌫'},{key:'brow',label:'眉心压力',value:48,icon:'👀'},{key:'eye',label:'眼部活力',value:40,icon:'🌫'} ]
      }
    }
    const band = bands[label] || bands['平静']

    // 维度二：随机文学金句
    const quote = QUOTE_LIB[Math.floor(Math.random() * QUOTE_LIB.length)]

    // 维度三：双氧 + 天气互文
    const devOx = (app.globalData && app.globalData.deviceOxygen) || null
    let showDualEgg = false, dualText = '', weatherText = ''
    if (devOx && typeof devOx.value === 'number') {
      showDualEgg = true
      if (devOx.value >= 80 && band.risk) {
        dualText = `奇怪呐，你的身体氧活力值明明高达 ${devOx.value}，怎么小脸看起来有点疲惫？今天是不是偷偷用脑过度啦？`
        weatherText = '最近空气湿度偏低，加上面部捕捉显示你略微缺氧，快去加湿器旁充个电，或让灵狐陪你听一段白噪音。'
      } else if (devOx.value < 60 && !band.risk) {
        dualText = `小脸看着挺精神，身体氧却只有 ${devOx.value}，记得给身体也充充氧哦~`
        weatherText = '身体氧有点掉队，顺手开窗通通风，让新鲜空气进来。'
      } else {
        dualText = `身体氧 ${devOx.value} 和你的小表情都对上了，今天状态很同步呢 💚`
        weatherText = '今天你和环境都在同频共振，保持就好。'
      }
    } else {
      showDualEgg = false
      dualText = ''
      weatherText = '连接充氧宝硬件，还能解锁「身体氧 × 心灵氧」双氧共振和天气联动彩蛋哦~'
    }

    // 维度四：5% 概率触发灵狐稀有盲盒
    let egg = null
    const rand = Math.random()
    if (rand < 0.05) {
      const talisman = TALISMAN_LIB[Math.floor(Math.random() * TALISMAN_LIB.length)]
      egg = { type: 'talisman', talisman }
    }

    this.setData({
      step: 2,
      moodBand: band, microExp: band.micro,
      energy: band.energy, oxygen: band.oxygen,
      persona: band.persona,
      psychText: band.psych,
      quote,
      weatherText,
      showDualEgg, dualText, deviceOxygen: devOx,
      egg
    })
    wx.vibrateShort({ type: 'medium' })
    this._saveRecord(band, label, face.confidence)
  },

  _saveRecord(band, label, confidence) {
    try {
      app.addRecord({
        date: new Date().toDateString(),
        text: '（面部能量扫描）',
        scene: '',
        emotionLabel: label,
        confidence: confidence || 0.5,
        insight: band.desc,
        regulationTip: band.advice || band.desc,
        productHint: '',
        personaLine: band.persona,
        energy: band.energy,
        keyword: label,
        keywords: [label],
        state: band.name,
        suggestion: band.desc,
        indexes: { emotion: band.energy, oxygen: band.oxygen, vigor: band.energy, recover: band.energy },
        faceMood: band.risk ? 'tired' : 'happy',
        physicalTags: []
      })
    } catch (e) { /* 不阻断展示 */ }
  },

  goCard() {
    const b = this.data.moodBand
    const q = this.data.quote || { text: '', warm: '' }
    const now = new Date()
    const cardDate = `${now.getMonth() + 1}月${now.getDate()}日`
    this.setData({
      step: 3,
      cardDate,
      cardText: `「${b.emoji} 今日能量气象：${b.name}」\n${b.persona}\n${q.text}${q.warm}\n—— ${b.desc}\n氧氧宝 · 邀你一起好好呼吸 💚`
    })
  },

  saveCard() {
    if (this.data.isDrawing) return
    wx.showToast({ title: '长按卡片区域可保存/分享', icon: 'none' })
  },

  rescan() {
    clearInterval(this._tipTimer); clearTimeout(this._scanTimer)
    this.setData({ step: 0, scanDone: false, scanTipIdx: 0, showDualEgg: false, moodBand: null, egg: null })
  },

  goHome() { wx.switchTab({ url: '/pages/home/home' }) },
  goBreath() { wx.navigateTo({ url: '/pages/breathing/breathing' }) },
  goChat() { wx.navigateTo({ url: '/pages/chat/chat' }) },

  onUnload() {
    clearInterval(this._tipTimer); clearTimeout(this._scanTimer)
  }
})
