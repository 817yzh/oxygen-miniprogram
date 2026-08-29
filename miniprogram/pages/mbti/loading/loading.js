// pages/mbti/loading/loading.js
const app = getApp()
const { OXYGEN_PERSONALITIES } = require('../../../mock/data.js')
const checkinService = require('../utils/checkinService.js)
const { PERSONALITY_DB_V2, getPersonalityWithRandom } = require('../mock/personality-db.js)
const { getZodiac, getNayin } = require('../mock/fun-db.js)
const { getAgeProfile } = require('../mock/age-profile-db.js) // V0.8 生日→年龄画像

Page({
  data: {
    phaseIndex: 0,
    phases: [
      '正在读取你的氧气频率...',
      '正在匹配你的生活能量...',
      '正在生成你的专属人格...'
    ]
  },

  onLoad(options) {
    const isCheckin = !!(options && options.from === 'checkin')
    if (isCheckin) {
      // 打卡分析模式：三阶段动态文案
      const pending = app.globalData.pendingCheckin || {}
      this.setData({ phases: this.buildCheckinPhases(pending.text || '') })
    } else {
      // MBTI 分析模式：读信息 + 趣味表情感知 + 生成人格
      const face = app.globalData.faceMood || {}
      this.setData({ phases: this.buildMbtiPhases(face.mood) })
    }
    this.runAnimation(isCheckin)
  },

  // MBTI 三阶段(含趣味表情感知)
  buildMbtiPhases(mood) {
    let faceLine = '正在匹配你的氧气频率...'
    if (mood === 'happy') faceLine = '你看起来状态不错，氧氧也开心起来啦 ☀️'
    else if (mood === 'tired') faceLine = '检测到你有点疲惫，氧氧会温柔陪你 🛋️'
    else faceLine = '你的状态很平稳，氧氧轻轻记下了 🌱'
    return [
      '正在读取你的基本信息...',
      faceLine,
      '正在生成你的专属人格...'
    ]
  },

  // 根据关键词动态生成打卡分析过程 (三阶段详解)
  buildCheckinPhases(text) {
    const t = text || ''
    let consume = '发现今天消耗了一些能量...'
    if (/累|疲惫|加班|透支|熬夜|睡不好|压力/.test(t)) {
      consume = '发现今天消耗了很多能量...'
    } else if (/焦虑|紧张|担心|害怕|不安/.test(t)) {
      consume = '发现你今天有些紧绷的情绪...'
    } else if (/开心|快乐|期待|兴奋/.test(t)) {
      consume = '发现你今天的能量状态很明亮...'
    } else if (/难过|伤心|低落|哭/.test(t)) {
      consume = '发现你今天的心情需要呵护...'
    }
    return [
      '氧氧正在读取你的文字...',
      consume,
      '正在生成你的今日状态建议...'
    ]
  },

  runAnimation(isCheckin) {
    let i = 0
    const timer = setInterval(() => {
      i++
      if (i < this.data.phases.length) {
        this.setData({ phaseIndex: i })
      } else {
        clearInterval(timer)
        this.finish(isCheckin)
      }
    }, 800)
  },

  // 基于趣味面部分配今日状态卡数据
  buildTodayState(face, personality) {
    const mood = (face && face.mood) || 'calm'
    // 平静指数
    const calmPower = mood === 'calm' ? 82 : mood === 'happy' ? 70 : 55
    // 状态类型
    const map = {
      happy: { state: '元气日', note: '今天的你看起来比较放松，适合安排一些慢节奏活动。' },
      calm: { state: '轻松型探索者', note: '今天的你状态很平稳，适合安排一些慢节奏活动。' },
      tired: { state: '待充电日', note: '今天你可能有点疲惫，适合好好休息，给自己充充电。' }
    }
    const m = map[mood] || map.calm
    return {
      calmPower,
      state: m.state,
      note: m.note,
      typeName: personality.name,
      indexes: {
        calmPower,
        active: mood === 'happy' ? 72 : mood === 'calm' ? 60 : 35,
        think: personality.id === 'thinker' ? 88 : 65,
        stable: mood === 'calm' ? 79 : mood === 'happy' ? 70 : 50,
        energy: mood === 'happy' ? 68 : mood === 'calm' ? 62 : 40
      }
    }
  },

  // 生成专属人格(mock: 按生日/性别/趣味状态混合 + 随机扰动，保证每人不同、重测可变化)
  finish(isCheckin) {
    if (isCheckin) {
      // 打卡分析：执行真实分析(mock引擎)后进入报告
      checkinService.runCheckin().then(() => {
        wx.redirectTo({ url: '/pages/report/report' })
      })
      return
    }

    const user = app.globalData.user || {}
    const face = app.globalData.faceMood || {}
    const keys = Object.keys(PERSONALITY_DB_V2)

    // —— 差异化种子：生日 + 性别 + 今日状态 + 随机扰动，保证每人/每次不同 ——
    // 1) 生日(若有)：取字符串字符码和，稳定区分不同用户
    const bdSeed = (user.birthday || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    // 2) 性别：+1 个扰动位
    const genderSeed = (user.gender || '').charCodeAt(0) || 0
    // 3) 今日状态：happy/calm/tired 各映射不同偏移
    const moodOffset = face.mood === 'happy' ? 2 : face.mood === 'tired' ? 4 : 1
    // 4) 随机扰动：每次测试都不同（关键：重测会换人格）
    const randSeed = Math.floor(Math.random() * keys.length * 1000)
    // 5) 时间微扰：同一用户同一天内多次测试也略有变化
    const nowSeed = Date.now() % 997

    const seed = bdSeed + genderSeed + moodOffset + randSeed + nowSeed
    const idx = seed % keys.length
    const pid = keys[idx]

    // V2 数据库：带随机推荐(每次不同)，含 MBTI/渐变/描述
    const pp = getPersonalityWithRandom(pid, { destCount: 3, sportCount: 2, chargeCount: 1 })
    // 星座 + 纳音五行(趣味，从生日算)
    const zodiac = (user.birthday && getZodiac(user.birthday)) || null
    const nayin = (user.birthday && getNayin(user.birthday)) || null
    // V0.8 从生日自动推导年龄画像(隐藏，不做展示，供报告/推荐参考)
    const ageProfile = getAgeProfile(user.birthday)

    // 兼容旧人格(供情绪引擎用)
    const baseP = OXYGEN_PERSONALITIES.find(x => x.id === pid) || {}

    // V0.8 结合年龄段的产品/场景倾向(作为报告参考维度)
    const ageRec = ageProfile ? {
      age: ageProfile.age,
      group: ageProfile.group,
      tone: ageProfile.tone,
      sceneBias: ageProfile.sceneBias,
      productBias: ageProfile.productBias,
      aiHint: ageProfile.aiHint
    } : null

    const result = {
      type: pid,
      typeName: pp.name,
      icon: pp.icon,
      tags: pp.tags,
      desc: pp.description || pp.desc,
      quote: pp.quote || '',
      color: pp.color,
      mbti: pp.mbti || '',
      bgGradient: pp.bgGradient || '',
      bgImage: baseP.bgImage || '',
      // 随机推荐(每次不同) —— 结果页读取 destinations/sports/chargeWays
      destinations: pp.destinations,
      sports: pp.sports,
      chargeWays: pp.chargeWays,
      chargeWay: (pp.chargeWays && pp.chargeWays[0]) || '',
      vibe: pp.vibe || '',
      zodiac: zodiac ? zodiac.name : (pp.zodiac || ''),
      zodiacElement: zodiac ? zodiac.element : '',
      fiveElements: nayin ? nayin.nayin : (pp.fiveElements || ''),
      match: 80 + (seed % 20),
      // V0.8 年龄画像参考(隐藏维度，结果页不展示，供报告用)
      ageProfile: ageRec,
      // 趣味面部感知派生今日状态
      todayState: this.buildTodayState(app.globalData.faceMood, pp)
    }

    app.setMbti(result)
    // V0.8 将年龄段一并存入用户(供报告/后续推荐使用)
    app.setUser({
      ...(app.globalData.user || {}),
      personality: pp.name,
      hasTestedMBTI: true,
      ageGroup: ageRec ? ageRec.group : '',
      age: ageRec ? ageRec.age : null
    })

    setTimeout(() => {
      wx.redirectTo({ url: '/pages/mbti/result/result' })
    }, 400)
  }
})
