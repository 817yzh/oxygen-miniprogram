/**
 * mock/achievement-db.js
 * 成就库 + 成长值规则 + 等级奖励(V0.7 升级)
 *
 * 从 app.js 内联定义抽离为独立数据文件，便于后续接真实后台。
 * 每个成就含触发条件，由 app.js 统一检测解锁。
 *
 * 成就等级：bronze(铜) / silver(银) / gold(金)，演示用 color 区分。
 */

// ===== 成就定义 =====
const ACHIEVEMENT_DEFS = {
  first_checkin:  { id: 'first_checkin', name: '初次打卡', icon: '🌱', color: '#72D8C4', desc: '完成第一次情绪打卡', condition: 'checkin', target: 1 },
  first_recipe:   { id: 'first_recipe', name: '品味生活', icon: '🍵', color: '#B8E8FF', desc: '首次获得健康食谱推荐', condition: 'recipe', target: 1 },
  streak_3:       { id: 'streak_3', name: '连续记录者', icon: '🔁', color: '#FF9F43', desc: '连续打卡 3 天', condition: 'streak', target: 3 },
  streak_5:       { id: 'streak_5', name: '节律达人', icon: '⏳', color: '#FF9F43', desc: '连续打卡 5 天', condition: 'streak', target: 5 },
  streak_7:       { id: 'streak_7', name: '坚持之星', icon: '🏅', color: '#FF9F43', desc: '连续打卡 7 天，解锁专属食谱合集', condition: 'streak', target: 7 },
  scene_all:      { id: 'scene_all', name: '全能探索者', icon: '🗺️', color: '#8B6FD8', desc: '打卡覆盖全部 4 个场景', condition: 'scene_all', target: 4 },
  chat_10:        { id: 'chat_10', name: '畅聊之星', icon: '💬', color: '#5AC8FA', desc: '累计和氧氧聊满 10 次', condition: 'chat', target: 10 },
  oxygen_test:    { id: 'oxygen_test', name: '含氧侦探', icon: '🫁', color: '#72D8C4', desc: '完成一次含氧感自测', condition: 'oxygen_test', target: 1 },
  ox_7day:        { id: 'ox_7day', name: '连续吸氧 7 天', icon: '🌬️', color: '#FF9F43', desc: '连续 7 天使用氧方案/补氧', condition: 'ox_7day', target: 7 },
  plateau_guard:  { id: 'plateau_guard', name: '高原守护者', icon: '🏔️', color: '#8B6FD8', desc: '完成高原场景 + 生成高原方案', condition: 'plateau', target: 1 },
  ox_21day:       { id: 'ox_21day', name: '21 天氧护达成', icon: '💎', color: '#FF7262', desc: '累计 21 天使用氧方案，深度氧护', condition: 'ox_21day', target: 21 },
  product_look:   { id: 'product_look', name: '氧装备专家', icon: '🫧', color: '#72D8C4', desc: '查看过充氧宝产品中心', condition: 'product', target: 1 }
}

// ===== 成长值规则(行为 → 增长值) =====
const GROWTH_RULES = {
  checkin:     { label: '情绪打卡', exp: 20 },
  chat:        { label: '和氧氧聊天', exp: 5 },
  oxygen_test: { label: '完成含氧感自测', exp: 30 },
  scene_view:  { label: '查看场景方案', exp: 10 },
  product_view:{ label: '查看充氧宝', exp: 10 },
  gift:        { label: '使用氧方案', exp: 15 }
}

// ===== 等级奖励(Lv1-Lv4) =====
const LEVEL_REWARDS = {
  1: '解锁基础 IP 形象',
  2: '解锁 IP 皮肤 · 小背包',
  3: '解锁嗅吸体验兑换',
  4: '深度陪伴全套特权'
}

module.exports = { ACHIEVEMENT_DEFS, GROWTH_RULES, LEVEL_REWARDS }
