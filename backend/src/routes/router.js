/**
 * src/routes/router.js
 * 极简路由匹配器（基于 Node 原生 http）
 * 支持：
 *  - GET/POST 等 method
 *  - 路径参数 :param
 *  - 统一 JSON 响应
 *
 * 未来迁移到 Express 时，本文件可整体替换，路由定义（routes/index.js）基本不变。
 */

const pathToRegexp = require('./pathToRegexp.js')

/** 创建路由上下文：挂在 app 上的一组匹配器 */
function createRouter() {
  const routes = { GET: [], POST: [], PUT: [], DELETE: [] }

  function add(method, pattern, handler) {
    const { regex, keys } = pathToRegexp(pattern)
    routes[method].push({ regex, keys, handler })
  }

  /** 匹配请求，返回 { handler, params } 或 null */
  function match(method, urlPath) {
    const list = routes[method] || []
    for (const r of list) {
      const m = r.regex.exec(urlPath)
      if (m) {
        const params = {}
        r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1] || '') })
        return { handler: r.handler, params }
      }
    }
    return null
  }

  return { add, match }
}

/**
 * 挂载路由辅助函数
 * 用法：
 *   router.get(app, '/api/xxx', handler)
 *   router.post(app, '/api/xxx/:id', handler)
 */
function get(app, pattern, handler) {
  app._router.add('GET', pattern, handler)
}
function post(app, pattern, handler) {
  app._router.add('POST', pattern, handler)
}
function put(app, pattern, handler) {
  app._router.add('PUT', pattern, handler)
}
function del(app, pattern, handler) {
  app._router.add('DELETE', pattern, handler)
}

module.exports = { get, post, put, del, createRouter }
