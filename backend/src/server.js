/**
 * src/server.js
 * 氧氧宝后端服务 · 主入口
 *
 * 运行：node src/server.js  （默认端口 3000，可用环境变量 PORT 覆盖）
 * 依赖：零第三方依赖（Node 原生 http + JSON 文件存储）
 *
 * 核心：
 *  - CORS（允许小程序/浏览器跨域调试）
 *  - JSON body 解析
 *  - 路由分发
 *  - 请求日志
 */

const http = require('http')
const router = require('./routes/router.js')
const routes = require('./routes/index.js')
const { loadEnv } = require('./config/env.js')

// 加载 .env（存在时）
loadEnv()

const PORT = process.env.PORT || 3000

/** 创建应用对象 */
function createApp() {
  const app = {
    _router: router.createRouter()
  }
  // 注册所有路由
  routes.register(app)
  return app
}

/** 解析 JSON body */
function parseBody(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', chunk => { raw += chunk })
    req.on('end', () => {
      if (!raw) return resolve({})
      try { resolve(JSON.parse(raw)) }
      catch (e) { resolve({}) }
    })
    req.on('error', () => resolve({}))
  })
}

/** 简易响应增强 */
function enhanceRes(res) {
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (obj) => {
    const body = JSON.stringify(obj)
    res.writeHead(res.statusCode || 200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-user-id'
    })
    res.end(body)
  }
}

/** 启动服务器 */
function start(port = PORT) {
  const app = createApp()

  const server = http.createServer(async (req, res) => {
    enhanceRes(res)

    // CORS 预检
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-user-id'
      })
      res.end()
      return
    }

    const url = new URL(req.url, 'http://localhost')
    const pathname = url.pathname
    const query = Object.fromEntries(url.searchParams)

    // 请求日志
    const startTime = Date.now()

    // 匹配路由
    const matched = app._router.match(req.method, pathname)
    if (!matched) {
      res.status(404).json({ code: 404, message: `未找到接口: ${req.method} ${pathname}`, data: null })
      console.log(`[${req.method}] ${pathname} → 404 (${Date.now() - startTime}ms)`)
      return
    }

    // 解析 body
    req.body = await parseBody(req)
    req.query = query
    req.params = matched.params

    // 调用 handler
    try {
      await matched.handler(req, res)
      console.log(`[${req.method}] ${pathname} → ${res.statusCode || 200} (${Date.now() - startTime}ms)`)
    } catch (e) {
      console.error(`[ERROR] ${pathname}:`, e)
      res.status(500).json({ code: 500, message: '服务器内部错误', data: null })
    }
  })

  server.listen(port, () => {
    console.log('')
    console.log('========================================')
    console.log('  氧氧宝后端服务已启动')
    console.log(`  地址: http://localhost:${port}`)
    console.log(`  健康检查: http://localhost:${port}/api/health`)
    console.log('  数据目录: data/*.json')
    console.log('========================================')
    console.log('')
  })

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`端口 ${port} 已被占用，请用环境变量 PORT 换端口，如: PORT=3001 node src/server.js`)
    } else {
      console.error('服务器启动失败:', e.message)
    }
    process.exit(1)
  })

  return server
}

// 直接运行时启动
if (require.main === module) {
  start()
}

module.exports = { start, createApp }
