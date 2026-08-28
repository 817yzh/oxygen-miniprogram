/**
 * src/routes/pathToRegexp.js
 * 极简路径 → 正则 转换器
 * 支持：/api/personality/:type/product → 匹配 :type 段
 */

function pathToRegexp(pattern) {
  const keys = []
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
      keys.push(key)
      return '([^/]+)'
    })
  const regex = new RegExp('^' + escaped + '/?$')
  return { regex, keys }
}

module.exports = pathToRegexp
