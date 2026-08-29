/**
 * utils/sharePoster.js
 * 氧系人格 · 分享海报绘制函数 (V4.0 · 新版 Canvas 2D API)
 *
 * 说明：
 *  本文件只负责「绘制」——把海报画到传入的 Canvas 2D context 上。
 *  获取 canvas node / 导出图片 / 页面上下文，均由页面 personality-share.js 负责，
 *  这样兼容新版 Canvas 2D(离屏渲染稳定，不依赖节点可见性)，彻底解决导出失败。
 *
 * V4.0 视觉(沉浸式杂志封面，无套娃白框)：
 *  背景  深墨绿渐变 #0F2922 → #1A4D40
 *  顶部  极简 Logo 小字(灰白)
 *  C位   人格 icon 大图 + 渐变发光大字(人格名) + 治愈金句
 *  底部  半透明胶囊栏: 左=契合度, 右=圆形小程序码 + '长按扫码，测测你的氧系身份'
 */

const W = 1080
const H = 1440

/** 圆角矩形路径 (Canvas 2D) */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * 绘制海报 (Canvas 2D 风格)
 * @param {CanvasRenderingContext2D} ctx 已就绪的 2d context (宽高已设为 W×H)
 * @param {object} data 人格数据 { typeName, icon, mbti, color, tags, match, quote }
 */
function drawPersonalityPoster(ctx, data = {}) {
  const {
    typeName = '氧气人格',
    icon = '🫧',
    mbti = '',
    color = '#72D8C4',
    match = 91,
    quote = ''
  } = data
  const quoteText = quote || '在呼吸里，找回自己的频率'

  // ===== 背景：深墨绿渐变 =====
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#0F2922')
  bg.addColorStop(0.55, '#14382D')
  bg.addColorStop(1, '#1A4D40')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 顶部微光晕
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.34, 20, W * 0.5, H * 0.34, W * 0.6)
  glow.addColorStop(0, 'rgba(114,216,196,0.16)')
  glow.addColorStop(1, 'rgba(114,216,196,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // ===== 顶部：极简 Logo =====
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '30px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('✦ 氧氧宝 · 氧气人格测试', W / 2, 96)

  // ===== C位：人格 icon (大图) =====
  ctx.font = '200px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(icon, W / 2, 380)

  // ===== C位：人格名 (渐变发光大字) =====
  const nameGrad = ctx.createLinearGradient(0, 460, 0, 560)
  nameGrad.addColorStop(0, '#FFFFFF')
  nameGrad.addColorStop(0.6, '#B8F5E2')
  nameGrad.addColorStop(1, '#72D8C4')
  ctx.fillStyle = nameGrad
  ctx.font = 'bold 78px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(typeName, W / 2, 540)

  // MBTI 微胶囊 (半透明，无白底块)
  if (mbti) {
    const mbtiW = 170, mbtiH = 52, mbtiX = W / 2 - mbtiW / 2, mbtiY = 566
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.lineWidth = 2
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    roundRect(ctx, mbtiX, mbtiY, mbtiW, mbtiH, 26)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = 'bold 26px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(mbti, W / 2, mbtiY + 35)
  }

  // ===== 治愈金句 =====
  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  ctx.font = '34px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('“' + quoteText + '”', W / 2, 690)

  // ===== 底部：半透明胶囊栏 (无白块) =====
  const barX = 80, barY = H - 380, barW = W - 160, barH = 250, barR = 40
  ctx.fillStyle = 'rgba(255,255,255,0.10)'
  roundRect(ctx, barX, barY, barW, barH, barR)
  ctx.fill()

  // 左：契合度
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '24px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('契合度', barX + 140, barY + 70)
  ctx.fillStyle = '#B8F5E2'
  ctx.font = 'bold 64px sans-serif'
  ctx.fillText(match + '%', barX + 140, barY + 140)

  // 分割线
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(barX + 290, barY + 50)
  ctx.lineTo(barX + 290, barY + barH - 50)
  ctx.stroke()

  // 右：圆形小程序码 (白底圆 + 纹理)
  const qrSize = 150, qrX = W / 2 + 130, qrY = barY + 50
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(qrX + qrSize / 2, qrY + qrSize / 2, qrSize / 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#14382D'
  const u = 16
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if ((r * 7 + c * 11) % 3 !== 0) {
        ctx.fillRect(qrX + 16 + c * (qrSize - 34) / 4, qrY + 16 + r * (qrSize - 34) / 4, u, u)
      }
    }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '22px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('长按扫码，测测你的氧系身份', qrX + qrSize / 2, qrY + qrSize + 46)

  // 底部品牌
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '24px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('氧氧宝 · 每天给自己充一点氧', W / 2, H - 60)
}

module.exports = { drawPersonalityPoster, W, H }
