/**
 * 占位图方案
 * 
 * 由于第一期 SVG/PNG 素材还没有正式放入 images/ 目录，
 * 这里用 wx.getImageInfo + base64 临时方案，
 * 或者小程序中用 data: URL 方式加载占位图。
 * 
 * 第一期可以用 emoji + 纯 CSS 替代所有图片引用，
 * 等素材到位后再替换。
 */

// 在微信小程序中，SVG 文件无法直接通过 <image> 标签引用，
// 建议第一期把所有图片替换为 CSS 绘制的元素 + emoji 文字。
// 
// 实施方式：
// 1. 首页的氧氧头像 → 使用一个 div + css 绘制圆形
// 2. 空状态图标 → 使用 emoji + 半透明背景
// 3. 所有图片引用改为条件渲染，用 CSS 或 emoji 替代

module.exports = {
  // 一期暂不使用图片文件，改用 emoji + CSS 替代
  usePlaceholders: true
}
