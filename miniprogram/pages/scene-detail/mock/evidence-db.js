/**
 * mock/evidence-db.js
 * 场景方案 · 数据背书库(V0.7)
 *
 * 场景方案详情页「数据背书」板块用的数据。来源为充氧宝业务资料(pdf_extract)。
 * 字段：scene 场景名 / data 数据文案 / source 权威来源。
 * 面向未来接真实后台：source 可替换为报告链接/图片。
 */

const SCENE_EVIDENCE = {
  高原旅行: [
    { scene: '高原旅行', data: '高原实测可快速提升血氧饱和度、降低心率，缓解头晕乏力', source: '稻城亚丁高原测试验证' },
    { scene: '高原旅行', data: '2025 年春晚拉萨分会场指定便携富氧机', source: '央视春晚' },
    { scene: '高原旅行', data: '进藏游客高反降幅显著，好帮手', source: '武警西藏总队医院验证' }
  ],
  脑疲劳: [
    { scene: '脑疲劳', data: '高原地区脑疲劳人群供氧改善显著', source: '脑疲劳缓解研究' },
    { scene: '脑疲劳', data: '富氧环境助力提升专注与用脑状态', source: '团队研究观察' }
  ],
  运动恢复: [
    { scene: '运动恢复', data: '运动后补氧加速乳酸代谢、延缓运动性疲劳、加速恢复', source: '运动恢复实测验证' },
    { scene: '运动恢复', data: '获中国举重队感谢信', source: '专业运动员认可' }
  ],
  银发陪伴: [
    { scene: '银发陪伴', data: '日常补氧保健，改善血氧水平，缓解身体不适带来的情绪焦虑', source: '银发人群方案研究' },
    { scene: '银发陪伴', data: '2024 年中国优秀团体标准认证', source: 'T/CAS 标准' }
  ]
}

/** 按场景名取证据列表 */
function getEvidence(sceneName) {
  return SCENE_EVIDENCE[sceneName] || []
}

module.exports = { SCENE_EVIDENCE, getEvidence }
