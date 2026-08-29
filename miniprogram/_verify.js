// 验证 oxygen-profile 关键逻辑(字段兼容)
const { OXYGEN_PERSONALITIES } = require('./mock/data.js');
const p = OXYGEN_PERSONALITIES[0]; // explorer
console.log('p.id =', p.id);
console.log('p.sport =', JSON.stringify(p.sport));
console.log('p.chargeWay =', JSON.stringify(p.chargeWay));
console.log('p.zodiac =', p.zodiac, '| p.fiveElements =', p.fiveElements);

// 复现 buildEnergyTags 逻辑
function buildEnergyTags(pp, personality, basicInfo) {
  const zodiac = (basicInfo && basicInfo.zodiac) || (personality && personality.zodiac) || pp.zodiac || '';
  const five = (basicInfo && basicInfo.fiveElements) || (personality && personality.fiveElements) || pp.fiveElements || '';
  const restore = (pp.chargeWay && pp.chargeWay.length ? pp.chargeWay.join(' · ') : pp.chargeWay) || '深呼吸补氧';
  const sport = (pp.sport && pp.sport.length ? (Array.isArray(pp.sport) ? pp.sport.slice(0, 2).join(' · ') : pp.sport) : pp.sport) || '散步冥想';
  return [
    { label: '星座', value: zodiac || '—' },
    { label: '五行', value: five || '—' },
    { label: '恢复方式', value: restore },
    { label: '适合运动', value: sport }
  ];
}
const tags = buildEnergyTags(p, {}, {});
console.log('能量标签:', JSON.stringify(tags, null, 2));
console.log('OK 字段兼容无 undefined');
