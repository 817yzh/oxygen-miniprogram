/**
 * src/config/env.js
 * 轻量 .env 加载器（零依赖）：存在 .env 时解析 KEY=VALUE 注入 process.env，不覆盖已存在的变量。
 * 由 server.js 与 scripts 共用，保证启动入口和测试脚本都能读到配置。
 */

const fs = require('fs')
const path = require('path')

function loadEnv() {
  const envPath = path.join(__dirname, '..', '..', '.env')
  if (!fs.existsSync(envPath)) return
  try {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq < 0) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = value
    }
  } catch (e) {
    console.warn('[env] .env 加载失败:', e.message)
  }
}

module.exports = { loadEnv }
