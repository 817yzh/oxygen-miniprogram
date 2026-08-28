/**
 * mock/faq-db.js
 * 常见问题 FAQ 数据(V0.8)
 *
 * 数据源：复用 product-db.js 的 FAQ 语料(唯一来源，避免重复维护)。
 * 此文件作为独立的 FAQ 数据入口，符合产品中心信息架构，方便未来扩展独立 FAQ。
 */
const { FAQ } = require('./product-db.js')
module.exports = { FAQ }
