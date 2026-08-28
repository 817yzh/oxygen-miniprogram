// pages/product-center/product-center.js
// 充氧宝 · 产品生态中心(V0.7)
const app = getApp()
const { PRODUCT_MODELS, PRODUCT_SPECS, PRODUCT_BENEFITS, getProductOverview } = require('../../mock/product-db.js')
const { SCENE_HEALTH_CONFIG } = require('../../mock/health-scene-db.js')
const { FAQ } = require('../../mock/faq-db.js') // V0.8 独立FAQ数据
const { getSceneBoard } = require('../../mock/scene-board-db.js') // V0.8 场景看板(自首页归位)

// 认证背书(演示占位, 来源见 prd)
const CERTIFICATES = [
  { id: 'c1', icon: '/images/cert-patent.svg', title: '国家发明专利', desc: '永磁体氧气富集技术' },
  { id: 'c2', icon: '/images/cert-standard.svg', title: '中国优秀团体标准', desc: '2024 年认证' },
  { id: 'c3', icon: '/images/cert-star.svg', title: '春晚指定', desc: '2025 拉萨分会场便携富氧机' },
  { id: 'c4', icon: '/images/cert-letter.svg', title: '举重队感谢信', desc: '专业运动员认可' }
]

// 智能选型（横向场景卡 + 联动信息，禁 Emoji 用线条 Icon）
const SCENARIOS = [
  {
    id: 'plateau', cover: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/scene-cover-plateau.png', hwImg: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/hero-xizang.png',
    comboImg: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/combos/plateau.jpg',
    rent: 79, buy: 1680,
    title: '高原极客', sub: '进藏 · 高海拔 · 易高反',
    hw: '畅游西藏限定款', hwIcon: '/images/icon-peak.svg',
    scent: '薄荷尤加利配方', scentIcon: '/images/icon-scent.svg',
    acc: '高空便携挂扣', accIcon: '/images/icon-hook.svg',
    fit: '进藏旅游 · 登山徒步 · 高海拔工作'
  },
  {
    id: 'brain', cover: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/scene-cover-brain.png', hwImg: '/images/hero-white.png',
    comboImg: '/images/combos/brain.jpg',
    rent: 79, buy: 1680,
    title: '深夜脑力', sub: '备考 · 加班 · 高强度用脑',
    hw: '纯白极客款', hwIcon: '/images/icon-peak.svg',
    scent: '迷迭香柠檬配方', scentIcon: '/images/icon-scent.svg',
    acc: '桌面立式底座', accIcon: '/images/icon-hook.svg',
    fit: '备考刷题 · 程序员加班 · 深度办公'
  },
  {
    id: 'sport', cover: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/scene-cover-sport.png', hwImg: '/images/hero-iceblue.png',
    comboImg: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/combos/sport.jpg',
    rent: 79, buy: 1680,
    title: '运动恢复', sub: '健身 · 运动后 · 恢复',
    hw: '冰蓝极客款', hwIcon: '/images/icon-peak.svg',
    scent: '清凉提神配方', scentIcon: '/images/icon-scent.svg',
    acc: '随身挂绳', accIcon: '/images/icon-hook.svg',
    fit: '健身训练 · 运动恢复 · 日常通勤'
  },
  {
    id: 'silver', cover: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/scene-cover-silver.png', hwImg: '/images/hero-white.png',
    comboImg: '/images/combos/silver.jpg',
    rent: 79, buy: 1680,
    title: '银发关怀', sub: '长辈 · 日常保健',
    hw: '纯白温和款', hwIcon: '/images/icon-peak.svg',
    scent: '薰衣草洋甘菊配方', scentIcon: '/images/icon-scent.svg',
    acc: '防跌落手绳', accIcon: '/images/icon-hook.svg',
    fit: '送长辈 · 改善睡眠 · 缓解胸闷'
  }
]

// 核心参数 2x2 微晶网格（线条 Icon + 大数字）
const SPEC_GRID = [
  { icon: '/images/icon-weight.svg', title: '320g', unit: '轻至', desc: '超轻便携' },
  { icon: '/images/icon-battery.svg', title: '3.5h', unit: '续航', desc: '强劲长效' },
  { icon: '/images/icon-flow.svg', title: '6 L/min', unit: '输出', desc: '≈21瓶氧气' },
  { icon: '/images/icon-recycle.svg', title: '0', unit: '耗材', desc: '永磁+高分子' }
]

// 产品形态 · 高定配色（色球选择器 + 悬浮大图）
const MODEL_STYLES = [
  { id: 'wa01', name: '冰蓝极客款', sub: '钛空蓝金属 · 高性价比日常补氧', big: '/images/cut-iceblue.png', swatch: 'sw-ice', blend: false },
  { id: 'tibet', name: '畅游西藏限定款', sub: '藏韵彩绘 · 高原出行首选', big: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/cut-xizang.png', swatch: 'sw-tibet', blend: false },
  { id: 'white', name: '纯白医疗极简款', sub: '哑光陶瓷白 · 医用级低噪', big: '/images/hero-white.png', swatch: 'sw-white', blend: true }
]

Page({
  data: {
    models: PRODUCT_MODELS,
    styles: MODEL_STYLES,
    curStyle: MODEL_STYLES[0],
    specs: PRODUCT_SPECS,
    specGrid: SPEC_GRID,
    benefits: PRODUCT_BENEFITS,
    sceneList: Object.keys(SCENE_HEALTH_CONFIG).map(k => SCENE_HEALTH_CONFIG[k]),
    certs: CERTIFICATES,
    faqList: [],
    activeTab: 'product', // product / tech / scene / faq
    overview: null,
    sceneBoard: [],   // V0.8 场景看板(自首页归位)
    techVideoPlaying: false,
    scenarios: SCENARIOS,
    cardIndex: 0,
    curScenario: SCENARIOS[0],
    // 组合抽屉 Bottom Sheet
    sheetOpen: false,
    sheetIndex: 0,
    curSheet: SCENARIOS[0],
    planMode: 'rent' // rent / buy
  },

  onLoad() {
    this.setData({
      overview: getProductOverview(),
      sceneBoard: getSceneBoard()
    })
    this.buildFaq()
    // V0.7 统计 + 成长值: 查看产品中心
    wx.setStorageSync('yyb_product_viewed', true)
    app.addGrowth('product_view')
    app.checkAchievements(null, 'product')
  },

  // V0.8 场景看板选择 → 方案详情页(自首页归位)
  onChooseScene(e) {
    const sceneName = e.detail && e.detail.sceneName
    if (sceneName) wx.navigateTo({ url: '/pages/scene-detail/index?scene=' + sceneName })
  },

  // FAQ 按 3 分类重组 + 手风琴（每个 question 取首个作标题）
  buildFaq() {
    const cats = [
      { id: 'common', label: '常见疑问' },
      { id: 'usage', label: '使用与安全' },
      { id: 'shop', label: '选购与售后' }
    ]
    // 按主题打分类（依赖 FAQ 语料的序号，稳定不随顺序漂移）
    const catMap = {
      common: [0, 2, 3, 4, 5, 11, 14],   // 原理/重量/续航/耗材/品牌/场景
      usage: [6, 7, 8, 9, 12, 13],        // 高反/脑疲劳/运动/老人/上飞机/安全
      shop: [1, 10]                        // 价格/在哪买/有测试吗
    }
    const byCat = { common: [], usage: [], shop: [] }
    FAQ.forEach((f, i) => {
      const q = f.questions && f.questions[0] ? f.questions[0] : ''
      const item = { id: 'faq' + i, q, answer: f.reply, open: false }
      const cat = catMap.common.includes(i) ? 'common'
        : catMap.usage.includes(i) ? 'usage'
        : catMap.shop.includes(i) ? 'shop' : 'common'
      byCat[cat].push(item)
    })
    this.setData({
      faqCats: cats,
      faqTab: 'common',
      faqByCat: byCat,
      faqList: byCat.common
    })
  },

  // FAQ 切换分类 Tab
  switchFaqTab(e) {
    const t = e.currentTarget.dataset.tab
    this.setData({ faqTab: t, faqList: this.data.faqByCat[t] })
  },

  // FAQ 手风琴折叠：点标题展开/收起回答
  toggleFaq(e) {
    const id = e.currentTarget.dataset.id
    const list = this.data.faqList.map(it =>
      it.id === id ? Object.assign({}, it, { open: !it.open }) : it
    )
    this.setData({ faqList: list })
  },

  switchTab(e) {
    const t = e.currentTarget.dataset.tab
    this.setData({ activeTab: t })
  },

  // 场景卡滑动 → 动态联动下方信息
  onCardChange(e) {
    const idx = e.detail.current
    this.setData({
      cardIndex: idx,
      curScenario: this.data.scenarios[idx]
    })
  },

  // 打开组合抽屉（当前场景卡的套装）
  openSheet(e) {
    const idx = e && e.currentTarget && e.currentTarget.dataset
      ? e.currentTarget.dataset.index
      : this.data.cardIndex
    const i = idx !== undefined ? Number(idx) : this.data.cardIndex
    this.setData({
      sheetOpen: true,
      sheetIndex: i,
      curSheet: this.data.scenarios[i],
      planMode: 'buy' // 默认推荐买断
    })
  },

  // 关闭抽屉
  closeSheet() {
    this.setData({ sheetOpen: false })
  },

  // 抽屉内 swiper 切换套装
  onSheetChange(e) {
    const i = e.detail.current
    this.setData({ sheetIndex: i, curSheet: this.data.scenarios[i] })
  },

  // 租赁 / 买断 单选
  choosePlan(e) {
    this.setData({ planMode: e.currentTarget.dataset.mode })
  },

  // 打包下单（演示占位，阻止冒泡）
  packOrder() {
    wx.showToast({ title: '已生成订单，即将接入支付', icon: 'none' })
  },

  // 形态切换 → 联动顶部大图
  switchStyle(e) {
    const id = e.currentTarget.dataset.id
    const cur = this.data.styles.find(s => s.id === id)
    if (cur) this.setData({ curStyle: cur })
  },

  // 原理视频播放（封面按钮点击 → 隐藏封面 + 原地播放）
  playTechVideo() {
    this.setData({ techVideoPlaying: true })
    const vc = wx.createVideoContext('techVideo', this)
    vc.play()
  },

  // 视频真正开始播放时确保封面隐藏
  onTechVideoPlay() {
    this.setData({ techVideoPlaying: true })
  },

  // 场景方案 → 详情
  goScene(e) {
    const name = e.currentTarget.dataset.scene
    wx.navigateTo({ url: '/pages/scene-detail/index?scene=' + encodeURIComponent(name) })
  },

  // 购买 / 租赁(演示占位)
  onBuy() {
    wx.showModal({
      title: 'Work Air 充氧宝',
      content: '零售 1680 元 · 租赁 79 元/天\n\n演示阶段暂未接入商城，购买入口即将上线 🌱',
      showCancel: false,
      confirmText: '好的'
    })
  },
  onRent() {
    wx.showModal({
      title: 'Work Air 充氧宝 · 租赁',
      content: '租赁 79 元/天，支持按需租用\n\n演示阶段暂未接入商城，敬请期待 🌱',
      showCancel: false,
      confirmText: '好的'
    })
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
