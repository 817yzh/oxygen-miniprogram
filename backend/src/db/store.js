/**
 * src/db/store.js
 * 极简 JSON 文件存储层（模拟数据表，便于测试阶段零依赖运行）
 *
 * 设计：
 *  - 每个"表"一个 JSON 文件，落在 ../data/*.json
 *  - 提供 find / insert / update / remove / all 等类数据库操作
 *  - 未来迁移到 SQLite/MySQL 时，只需替换本层实现，业务代码不变
 *
 * 表清单（对应前端 wx Storage 键 → 后端表）：
 *  users             yyb_user             用户
 *  user_personality  yyb_mbti             氧系人格
 *  user_growth       yyb_companion        陪伴/成长
 *  checkin_records   yyb_history          打卡记录
 *  user_preferences  yyb_preferences      偏好
 *  user_achievements yyb_achievements     成就
 *  growth_logs       yyb_growth_log       成长值明细
 *  oxygen_test_reports yyb_oxygen_report  含氧感自测
 *  chat_messages     (新增)               聊天记录
 *  user_flags        (新增)               一次性标记
 */

const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', '..', 'data')

/** 确保数据目录存在 */
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

/** 表文件路径 */
function tableFile(name) {
  return path.join(DATA_DIR, `${name}.json`)
}

/** 读取整表（不存在返回空数组） */
function readTable(name) {
  ensureDir()
  const file = tableFile(name)
  if (!fs.existsSync(file)) return []
  try {
    const arr = JSON.parse(fs.readFileSync(file, 'utf-8'))
    return Array.isArray(arr) ? arr : []
  } catch (e) {
    // 文件损坏时兜底，不崩溃
    console.warn(`[store] 表 ${name} 读取失败，已重置为空:`, e.message)
    return []
  }
}

/** 写回整表 */
function writeTable(name, rows) {
  ensureDir()
  fs.writeFileSync(tableFile(name), JSON.stringify(rows, null, 2), 'utf-8')
}

/** 生成自增 id */
function nextId(rows) {
  return rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1
}

/**
 * 查询（支持条件过滤）
 * @param {string} name 表名
 * @param {object} where 过滤条件 { field: value }，支持部分匹配（如日期前缀）
 * @param {object} opts { sort: 'field', order: 'asc'|'desc', limit }
 */
function find(name, where = {}, opts = {}) {
  let rows = readTable(name)
  const keys = Object.keys(where)
  if (keys.length) {
    rows = rows.filter(r => keys.every(k => {
      const v = where[k]
      // 支持 { $prefix: 'xxx' } 前缀匹配
      if (v && typeof v === 'object' && '$prefix' in v) {
        return String(r[k] || '').startsWith(v.$prefix)
      }
      return r[k] === v
    }))
  }
  if (opts.sort) {
    const dir = (opts.order || 'asc') === 'desc' ? -1 : 1
    rows = rows.slice().sort((a, b) => {
      const av = a[opts.sort]; const bv = b[opts.sort]
      if (av === bv) return 0
      return (av > bv ? 1 : -1) * dir
    })
  }
  if (opts.limit) rows = rows.slice(0, opts.limit)
  return rows
}

/** 查单条 */
function findOne(name, where = {}) {
  return find(name, where)[0] || null
}

/** 插入（自动分配 id），返回带 id 的对象 */
function insert(name, doc) {
  const rows = readTable(name)
  const row = Object.assign({ id: nextId(rows) }, doc)
  rows.push(row)
  writeTable(name, rows)
  return row
}

/** 按条件更新，返回更新后的行 */
function update(name, where, patch) {
  const rows = readTable(name)
  const keys = Object.keys(where)
  let changed = null
  rows.forEach(r => {
    const hit = keys.every(k => r[k] === where[k])
    if (hit) {
      Object.assign(r, patch)
      changed = r
    }
  })
  writeTable(name, rows)
  return changed
}

/** 按条件删除，返回删除的行数 */
function remove(name, where) {
  const rows = readTable(name)
  const keys = Object.keys(where)
  const before = rows.length
  const kept = rows.filter(r => !keys.every(k => r[k] === where[k]))
  writeTable(name, kept)
  return before - kept.length
}

/** 清空表 */
function clear(name) {
  writeTable(name, [])
}

/** 获取或创建单例记录（如用户、成长数据） */
function upsertOne(name, where, makeDefault) {
  const existing = findOne(name, where)
  if (existing) return existing
  const doc = typeof makeDefault === 'function' ? makeDefault() : makeDefault
  return insert(name, doc)
}

module.exports = {
  DATA_DIR,
  find,
  findOne,
  insert,
  update,
  remove,
  clear,
  upsertOne,
  readTable,
  writeTable
}
