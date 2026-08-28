// 小程序运行配置
// 品牌视频须使用已加入小程序合法域名的线上 HTTPS 地址；留空时首页不展示视频位。
module.exports = {
  introVideoUrl: '',
  // ===== 后端接入配置（体验版氧氧真AI） =====
  // enabled: 是否走后端；false 时全部走本地 mock（不依赖后端）
  // baseUrl: 本地后端地址（node src/server.js 启动后）。
  //   ⚠️ 真机/体验版测试时，需把 baseUrl 改成局域网IP或线上域名，并把该域名加入小程序「合法域名」白名单
  api: {
    enabled: true,
    baseUrl: 'http://localhost:3001',
    requestTimeout: 8000  // 毫秒，超时自动回退本地 mock，避免卡住
  }
}
