/**
 * mock/comfort-words-db.js
 * 氧氧治愈文案库 —— 点击IP时随机弹出
 * 按场景分类，每个场景准备多条，避免重复感
 *
 * 用法:
 *   const { getComfortWord } = require('../../mock/comfort-words-db.js')
 *   const word = getComfortWord('tired')  // 按场景取
 *   const word = getComfortWord()          // 随机取
 */

// 各场景治愈文案池
const COMFORT_WORDS = {
  // 疲惫 / 能量低
  tired: [
    '吸一口气，释放今天所有的疲惫吧',
    '累了就歇歇，氧氧一直在呢',
    '闭上眼睛，给自己30秒的空白',
    '你的努力氧氧都看在眼里，先充个氧吧',
    '肩膀放下，深呼吸，氧氧陪着你',
    '今天已经很棒了，剩下的交给明天'
  ],
  // 压力大 / 焦虑
  stress: [
    '深呼吸，你已经做得很好了',
    '把肩膀放下来，氧氧在呢',
    '一切都会慢慢好起来的，别急',
    '先吸一口气，事情一件一件来',
    '氧氧相信你，也请你相信自己',
    '紧张的时候，摸摸氧氧的头吧'
  ],
  // 开心 / 能量高
  happy: [
    '今天的你闪闪发光呀 ✨',
    '好心情要保持，氧氧陪你一起',
    '看到你开心，氧氧也开心呢',
    '把这份好心情分享给身边的人吧',
    '今天也是被氧氧守护的一天呢'
  ],
  // 平静 / 一般
  calm: [
    '平稳就是今天最好的状态',
    '氧氧在呢，随时找我聊天',
    '今天也要记得给自己补补氧哦',
    '慢慢来，比较快',
    '有什么想说的，氧氧都听着'
  ],
  // 晚上 / 睡前
  night: [
    '夜深了，氧氧陪你入梦乡',
    '今天辛苦了，好好休息吧',
    '放下手机，做三个深呼吸再睡',
    '氧氧会在梦里继续陪着你',
    '晚安，明天又是被氧氧守护的一天'
  ],
  // 早上
  morning: [
    '早上好呀，新的一天氧氧陪你',
    '先喝杯水，再开始今天的旅程吧',
    '今天的氧气很充足，准备好了吗',
    '氧氧已经醒啦，等你好久了呢'
  ]
}

/**
 * 根据场景获取一条随机治愈文案
 * @param {string} scene - 场景: tired/stress/happy/calm/night/morning，不传则全池随机
 * @returns {string} 治愈文案
 */
function getComfortWord(scene) {
  let pool
  if (scene && COMFORT_WORDS[scene]) {
    pool = COMFORT_WORDS[scene]
  } else {
    // 未指定场景 → 合并所有池子随机
    pool = Object.values(COMFORT_WORDS).reduce((acc, arr) => acc.concat(arr), [])
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * 根据当前时段自动匹配场景
 * @returns {string} 场景key
 */
function detectSceneByTime() {
  const h = new Date().getHours()
  if (h >= 6 && h < 11) return 'morning'
  if (h >= 23 || h < 5) return 'night'
  return 'calm'
}

/**
 * 根据氧气指数判断能量场景
 * @param {number} score - 氧气指数 0-100
 * @returns {string} 场景key
 */
function detectSceneByScore(score) {
  if (score >= 80) return 'happy'
  if (score >= 60) return 'calm'
  if (score >= 40) return 'tired'
  return 'stress'
}

module.exports = {
  COMFORT_WORDS,
  getComfortWord,
  detectSceneByTime,
  detectSceneByScore
}
