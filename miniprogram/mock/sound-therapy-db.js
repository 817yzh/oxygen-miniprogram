/**
 * mock/sound-therapy-db.js
 * 音疗 · 五音疗法 + 场景包 (V0.8, 全 mock)
 *
 * 中医五音疗法：角徵宫商羽对应肝心脾肺肾，可用于情志调理。
 * 当前为演示版(mock)，音频源留接口(demoSrc 占位)，正式版接入真实音源。
 */

/** 五音疗法(中医五音对应五脏) */
const FIVE_TONES = [
  { key: 'jue',  name: '角音',  organ: '肝',  mood: '舒缓郁结、消解焦虑', color: '#72D8C4', desc: '舒展悠扬，如春风拂柳，助肝气疏泄，适合情绪郁结、压力大时。' },
  { key: 'zhi',  name: '徵音',  organ: '心',  mood: '振奋精神、改善情绪', color: '#FF9F43', desc: '明亮欢快，如夏花绽放，助心气旺盛，适合情绪低落、兴致不高时。' },
  { key: 'gong', name: '宫音',  organ: '脾',  mood: '安定脾胃、缓解思虑', color: '#A8D5BA', desc: '沉稳浑厚，如大地承载，助脾土运化，适合思虑过重、消化不良时。' },
  { key: 'shang',name: '商音',  organ: '肺',  mood: '宣肺理气、舒缓悲伤', color: '#B8E8FF', desc: '清越铿锵，如秋高气爽，助肺气肃降，适合悲伤、呼吸不畅时。' },
  { key: 'yu',   name: '羽音',  organ: '肾',  mood: '补肾固本、安神助眠', color: '#F4A7BB', desc: '柔润如水，如溪流潺潺，助肾水滋养，适合疲劳、失眠、腰膝酸软时。' }
]

/** 场景音疗包(失眠/减压/专注/能量) */
const SCENE_SOUNDS = [
  { key: 'sleep',  name: '助眠安神', icon: '🌙', desc: '羽音为主，柔和白噪，帮助放松入睡', duration: '15分钟', color: '#4A6591', tones: ['yu', 'gong'] },
  { key: 'relax',  name: '减压舒缓', icon: '🍃', desc: '角音+羽音，舒展身心，卸下压力', duration: '10分钟', color: '#72D8C4', tones: ['jue', 'yu'] },
  { key: 'focus',  name: '专注提神', icon: '🎯', desc: '商音+徵音，清越振奋，提升专注', duration: '10分钟', color: '#FF9F43', tones: ['shang', 'zhi'] },
  { key: 'energy', name: '元气唤醒', icon: '⚡', desc: '徵音+宫音，明亮沉稳，唤醒活力', duration: '8分钟', color: '#2BB696', tones: ['zhi', 'gong'] }
]

/**
 * 获取场景音疗详情(含五音解释)
 * @param {string} key 场景key
 */
function getSceneSound(key) {
  const scene = SCENE_SOUNDS.find(s => s.key === key) || SCENE_SOUNDS[0]
  const tones = scene.tones.map(t => FIVE_TONES.find(f => f.key === t)).filter(Boolean)
  return { ...scene, toneDetail: tones }
}

module.exports = { FIVE_TONES, SCENE_SOUNDS, getSceneSound }
