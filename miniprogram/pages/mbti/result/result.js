// pages/mbti/result/result.js
const app = getApp()
const { OXYGEN_PERSONALITIES, SIMILAR_PERSONALITIES } = require('../../../mock/data.js')
const { PERSONALITY_DB_V2 } = require('../../../mock/personality-db.js')
const { getPersonalityProduct } = require('../../../mock/personality-product-map.js') // V0.7 氧装备推荐
const { getCreatorsByMatch } = require('../../../mock/creator-db.js') // V0.8 签约博主

// V2.2 人格专属 Hero 插画映射
const PERSONA_IMAGES = {
  explorer: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/persona/explorer.jpg',
  thinker: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/persona/thinker.jpg',
  healer: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/persona/healer.jpg',
  energetic: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/persona/energetic.jpg',
  slower: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/persona/slower.jpg',
  sensitive: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/persona/sensitive.jpg'
}

Page({
  data: {
    result: null,
    hasTested: false,
    similarList: [],
    creators: [],
    energyCaps: [],   // V2.3 能量胶囊 2x3 网格
    tagCloud: []      // V2.3 趣味标签云
  },

  onLoad() {
    let result = app.globalData.mbtiResult
    if (result) {
      const { getPersonalityWithRandom } = require('../../../mock/personality-db.js')
      // 数据兜底：兼容新旧字段，从 V2 人格库补齐
      const p = PERSONALITY_DB_V2[result.type] || OXYGEN_PERSONALITIES.find(x => x.id === result.type) || {}
      // 若 V2 库有人格但没有任何新字段，直接随机取一套(保证有内容)
      if (PERSONALITY_DB_V2[result.type] && !result.destinations) {
        const rp = getPersonalityWithRandom(result.type, { destCount: 3, sportCount: 2, chargeCount: 1 })
        result = { ...result, ...rp }
      }
      const tagsArr = result.tags || p.tags || []
      const destArr = result.destinations || (p.destinations && p.destinations.slice(0, 3)) || []
      const sportArr = result.sports || (p.sports && p.sports.slice(0, 2)) || []
      const chargeArr = result.chargeWays || (p.chargeWays && p.chargeWays.slice(0, 1)) || []
      result = {
        ...result,
        destinations: destArr,
        sports: sportArr,
        chargeWays: chargeArr,
        destination: result.destination || (p.destinations && p.destinations[0]) || [],
        sport: result.sport || (p.sports && p.sports[0]) || [],
        chargeWay: result.chargeWay || (p.chargeWays && p.chargeWays[0]) || '',
        bgImage: result.bgImage || p.bgImage || '',
        heroImage: PERSONA_IMAGES[result.type] || result.bgImage || '',
        mbti: result.mbti || p.mbti || '',
        vibe: result.vibe || p.vibe || '',
        zodiac: result.zodiac || p.zodiac || '',
        fiveElements: result.fiveElements || p.fiveElements || '',
        // WXML 不支持 .join()，这里预转为字符串
        tagsText: tagsArr.join(' · '),
        destinationsText: destArr.join(' · '),
        sportsText: sportArr.join(' · '),
        chargeWaysText: chargeArr.join(' · ')
      }
      this.setData({ result, hasTested: true })

      // V0.7 氧装备推荐: 人格 → 充氧宝设备 + 嗅吸方案
      const productPick = getPersonalityProduct(result.type || result.typeName)
      this.setData({ productPick })

      // 计算相近人格(V0.5)
      const similarList = this.buildSimilarList(result.type || result.typeName)
      this.setData({ similarList })

      // V2.3 同频人数 (相似人格数 + 1280 基础数)
      const similarTotal = 1280 + (similarList.length || 0) * 42
      this.setData({ similarTotal })

      // V0.8 签约博主(按人格匹配真实案例) → V2.4 增强为博主灵感卡数据
      const creators = getCreatorsByMatch({ personalityType: result.type }).map(c => ({
        ...c,
        // 金句：优先用已有 quote，否则取 description
        quote: c.quote || c.description,
        // 推荐氧气方案标签
        plan: c.plan || ('推荐呼吸方案：' + ((c.tags && c.tags[0]) || '森林白茶疗愈'))
      }))
      this.setData({ creators })

      // V2.3 能量胶囊 2x3 网格 (替代 5 条长进度条)
      const idx = result.todayState && result.todayState.indexes
      const energyCaps = idx ? [
        { icon: '🕊️', label: '平静力', value: idx.calmPower || 0 },
        { icon: '⚡', label: '活跃度', value: idx.active || 0 },
        { icon: '🧠', label: '思考量', value: idx.think || 0 },
        { icon: '🧘', label: '情绪稳定', value: idx.stable || 0 },
        { icon: '🔋', label: '精力值', value: idx.energy || 0 }
      ] : []
      this.setData({ energyCaps })

      // V2.3 趣味标签云 (合并趣味标签，紧凑一行)
      const tagCloud = []
      if (result.mbti) tagCloud.push(result.mbti)
      if (result.zodiac) tagCloud.push(result.zodiac)
      if (result.fiveElements) tagCloud.push(result.fiveElements)
      tagCloud.push(result.typeName)
      this.setData({ tagCloud })
    }
  },

  // 相近人格(V0.5)
  buildSimilarList(typeId) {
    const ids = SIMILAR_PERSONALITIES[typeId] || []
    return ids.map(id => {
      const p = PERSONALITY_DB_V2[id] || OXYGEN_PERSONALITIES.find(x => x.id === id)
      if (!p) return null
      return {
        id: p.id,
        icon: p.icon,
        name: p.name,
        color: p.color || '#72D8C4',
        mbti: p.mbti || '',
        tags: p.tags || [],
        tagsText: (p.tags || []).join(' · '),
        desc: p.description || p.desc || '',
        match: 75 + (Math.abs((p.name.charCodeAt(0) || 0) - 60) % 15) // 75-89 相近度
      }
    }).filter(Boolean)
  },

  // 查看相近人格简介
  viewSimilar(e) {
    const id = e.currentTarget.dataset.id
    const p = OXYGEN_PERSONALITIES.find(x => x.id === id)
    if (!p) return
    wx.showModal({
      title: p.icon + ' ' + p.name,
      content: p.desc + '\n\n所在：' + (p.destination || []).join('·'),
      confirmText: '了解啦',
      confirmColor: '#72D8C4',
      showCancel: false
    })
  },

  // 开始每日打卡
  // V0.7 去充氧宝产品中心
  goProductCenter() {
    wx.switchTab({ url: '/pages/product-center/product-center' })
  },

  goCheckin() {
    wx.redirectTo({ url: '/pages/checkin/checkin' })
  },

  // V0.8 博主点击 → 查看案例(演示) / V2.4 支持内联博主卡直接点击
  onCreatorTap(e) {
    let c = (e.detail && e.detail.creator) || null
    // 内联卡：data-id → 从 creators 里取
    const cid = e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.id
    if (!c && cid) {
      c = (this.data.creators || []).find(x => x.id === cid) || null
    }
    c = c || {}
    wx.showModal({
      title: c.name ? '@' + c.name + ' · ' + (c.scene || '') : '签约博主',
      content: (c.quote || c.description || '') + '\n\n🫧 同款方案：' + (c.plan || '充氧宝') + '\n\n🎬 视频内容即将上线，敬请期待（演示阶段）',
      showCancel: false,
      confirmText: '了解啦',
      confirmColor: '#72D8C4'
    })
  },

  // 生成分享卡(跳分享预览页，传人格数据)
  goShare() {
    const r = this.data.result || {}
    const payload = {
      type: r.type || '',
      typeName: r.typeName || r.name || '氧气人格',
      icon: r.icon || '🫧',
      mbti: r.mbti || '',
      color: r.color || '#72D8C4',
      tags: r.tags || [],
      todayState: r.todayState || null,
      quote: r.quote || '',
      match: r.match || 91
    }
    const data = encodeURIComponent(JSON.stringify(payload))
    wx.navigateTo({ url: '/pages/share/personality-share/personality-share?data=' + data })
  },

  // 返回首页
  goHome() {
    wx.reLaunch({ url: '/pages/home/home' })
  }
})
