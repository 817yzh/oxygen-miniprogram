/**
 * mock/recipe-db.js
 * 健康食谱数据库(V0.8)
 *
 * 匹配规则:
 *  1. 优先匹配 场景 + 情绪(同时命中)
 *  2. 其次匹配 场景
 *  3. 最后随机推荐通用食谱
 *
 * 字段说明:
 *  id           食谱ID
 *  name         食谱名称
 *  description  简述
 *  ingredients  食材(list)
 *  steps        做法(list)
 *  tags         效果标签(list)
 *  matchEmotions 匹配情绪(list)
 *  matchScenes   匹配场景(list, 中文场景名: 高原旅行/脑疲劳/运动恢复/银发陪伴)
 *  why          推荐理由文案
 */
const RECIPE_DB = [
  // ===== 安神助眠系列(脑疲劳 + 银发) =====
  {
    id: 'recipe_001',
    name: '安神小米粥',
    description: '温润养胃，安神助眠',
    ingredients: ['小米 50g', '红枣 3颗', '枸杞 10粒'],
    steps: ['小米洗净，加水煮开', '转小火慢熬20分钟', '加入红枣，再煮5分钟', '关火，焖2分钟即可'],
    tags: ['安神', '助眠', '暖胃'],
    matchEmotions: ['焦虑', '疲惫', '低落'],
    matchScenes: ['脑疲劳', '银发陪伴'],
    why: '今天的状态偏“疲惫+焦虑”，小米富含色氨酸，帮助放松神经，红枣补气血，适合用脑过度后食用。'
  },
  {
    id: 'recipe_002',
    name: '菊花枸杞茶',
    description: '清肝明目，缓解脑疲劳',
    ingredients: ['菊花 5朵', '枸杞 15粒', '温水 300ml'],
    steps: ['菊花、枸杞放入杯中', '冲入温水，焖3分钟', '可反复冲泡'],
    tags: ['明目', '清火', '提神'],
    matchEmotions: ['疲惫', '烦躁', '紧张'],
    matchScenes: ['脑疲劳'],
    why: '长时间盯屏幕后眼睛和大脑都累，菊花枸杞茶能帮助缓解用脑过度的疲劳感。'
  },
  {
    id: 'recipe_003',
    name: '桂圆莲子安神羹',
    description: '补心脾，安神助眠',
    ingredients: ['桂圆肉 10颗', '莲子 20g', '冰糖 适量'],
    steps: ['莲子提前泡发', '加水煮20分钟至软糯', '加入桂圆和冰糖，再煮5分钟'],
    tags: ['安神', '滋补', '助眠'],
    matchEmotions: ['焦虑', '低落', '孤独'],
    matchScenes: ['银发陪伴'],
    why: '银发朋友适合温和滋补，桂圆莲子安神羹暖身又安心，睡前喝一小碗更好入眠。'
  },

  // ===== 能量恢复系列(运动恢复) =====
  {
    id: 'recipe_004',
    name: '高能能量果昔',
    description: '快速补充能量，恢复体力',
    ingredients: ['香蕉 1根', '燕麦片 30g', '牛奶 200ml', '蜂蜜 1勺'],
    steps: ['所有材料放入搅拌机', '搅拌均匀即可'],
    tags: ['能量', '快速', '恢复'],
    matchEmotions: ['疲惫', '低落'],
    matchScenes: ['运动恢复'],
    why: '运动后需要快速补充能量，香蕉富含钾元素，燕麦提供长效碳水，帮助身体恢复。'
  },
  {
    id: 'recipe_005',
    name: '鸡胸肉藜麦沙拉',
    description: '高蛋白低脂，修复肌肉',
    ingredients: ['鸡胸肉 150g', '藜麦 50g', '生菜 适量', '橄榄油 1勺'],
    steps: ['鸡胸肉煎熟切块', '藜麦煮熟放凉', '混合生菜淋橄榄油即可'],
    tags: ['高蛋白', '修复', '健身'],
    matchEmotions: ['疲惫', '倦怠'],
    matchScenes: ['运动恢复'],
    why: '高强度运动后肌肉需要蛋白质修复，鸡胸肉和藜麦是优质的恢复搭档。'
  },

  // ===== 高原系列 =====
  {
    id: 'recipe_006',
    name: '红枣姜茶',
    description: '暖身驱寒，缓解高反不适',
    ingredients: ['红枣 5颗', '生姜 3片', '红糖 适量'],
    steps: ['红枣、姜片加水煮开', '转小火煮10分钟', '加红糖融化即可'],
    tags: ['暖身', '驱寒', '安神'],
    matchEmotions: ['焦虑', '紧张', '低落'],
    matchScenes: ['高原旅行'],
    why: '高原地区温差大又易紧张，一杯红枣姜茶暖身驱寒，也能让心安定下来。'
  },
  {
    id: 'recipe_007',
    name: '坚果能量棒',
    description: '便携补充，维持体力',
    ingredients: ['燕麦片 80g', '坚果碎 30g', '蜂蜜 20g'],
    steps: ['混合燕麦坚果', '加入蜂蜜拌匀', '压平冷藏30分钟切块'],
    tags: ['便携', '能量', '饱腹'],
    matchEmotions: ['疲惫', '兴奋'],
    matchScenes: ['高原旅行'],
    why: '长时间户外活动需要随时补充体力，自制能量棒便携又健康。'
  },

  // ===== 通用情绪食谱(任意场景) =====
  {
    id: 'recipe_008',
    name: '蜂蜜柠檬水',
    description: '清爽提神，舒缓心情',
    ingredients: ['柠檬 半个', '蜂蜜 1勺', '温水 300ml'],
    steps: ['柠檬切片', '加入温水', '调入蜂蜜即可'],
    tags: ['提神', '清爽', '舒缓'],
    matchEmotions: ['平淡', '中性', '放松'],
    matchScenes: [],
    why: '一整天心情平平的时候，一杯蜂蜜柠檬水让身体和心情都清爽起来。'
  },
  {
    id: 'recipe_009',
    name: '牛奶燕麦粥',
    description: '温暖饱腹，安抚情绪',
    ingredients: ['燕麦片 40g', '牛奶 250ml', '香蕉 半根'],
    steps: ['牛奶加热', '加入燕麦煮3分钟', '放香蕉片即可'],
    tags: ['暖胃', '饱腹', '安抚'],
    matchEmotions: ['低落', '孤独', '疲惫'],
    matchScenes: [],
    why: '暖暖的一碗粥最能安抚情绪，牛奶的色氨酸和燕麦的碳水，让心也跟着暖起来。'
  },
  {
    id: 'recipe_010',
    name: '菠菜蛋花汤',
    description: '补铁补气，恢复元气',
    ingredients: ['菠菜 100g', '鸡蛋 1个', '盐 少许'],
    steps: ['水烧开', '放菠菜煮软', '淋入蛋液成花，加盐即可'],
    tags: ['补铁', '元气', '清淡'],
    matchEmotions: ['疲惫', '低落'],
    matchScenes: [],
    why: '绿叶菜补铁补叶酸，一碗热汤让疲惫的身体找回元气。'
  },
  {
    id: 'recipe_011',
    name: '蒸山药',
    description: '健脾益胃，温和滋养',
    ingredients: ['山药 200g', '蜂蜜 少许'],
    steps: ['山药去皮切段', '上锅蒸20分钟', '淋蜂蜜即可'],
    tags: ['健脾', '滋养', '温和'],
    matchEmotions: ['焦虑', '低落', '平静'],
    matchScenes: ['银发陪伴'],
    why: '山药温和健脾，软糯好消化，特别适合想让自己放松、好好吃饭的时候。'
  },
  {
    id: 'recipe_012',
    name: '番茄蛋花面',
    description: '家常暖胃，治愈疲惫',
    ingredients: ['面条 100g', '番茄 1个', '鸡蛋 1个'],
    steps: ['番茄炒软加水', '水开下面条', '淋蛋液加盐即可'],
    tags: ['家常', '暖胃', '治愈'],
    matchEmotions: ['疲惫', '低落', '孤独', '烦躁'],
    matchScenes: [],
    why: '一碗热腾腾的番茄鸡蛋面，是最朴素也最抚慰人心的家常味道。'
  }
]

module.exports = { RECIPE_DB }
