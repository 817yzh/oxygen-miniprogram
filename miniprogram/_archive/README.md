# _archive · 优化移出的未使用代码

> 本目录文件**不计入小程序代码包**（已在 `project.config.json` 的 `packOptions.ignore` 中排除）。
> 均为功能上未被任何页面/组件引用的代码，按微信官方《性能优化指南》第 11 项「无依赖文件」要求移出。
> **如需恢复**：将对应文件移回原路径即可。

## components_unused/ （原 `components/` 下，5 个组件）

| 目录 | 原路径 | 备注 |
|---|---|---|
| `energy-index/` | `components/energy-index/` | 全库零引用 |
| `oxygen-change-chart/` | `components/oxygen-change-chart/` | 全库零引用 |
| `oxygen-map/` | `components/oxygen-map/` | 全库零引用 |
| `oxygen-suggestion/` | `components/oxygen-suggestion/` | 全库零引用 |
| `scene-board/` | `components/scene-board/` | 全库零引用 |

## utils_unused/ （原 `utils/` 下，4 个工具）

| 文件 | 原路径 | 备注 |
|---|---|---|
| `llm-service.js` | `utils/llm-service.js` | 全库零引用 |
| `oxygenService.js` | `utils/oxygenService.js` | 全库零引用 |
| `placeholderImages.js` | `utils/placeholderImages.js` | 全库零引用 |
| `sharePoster.js` | `utils/sharePoster.js` | 全库零引用 |

## backups/

- `profile.wxss.bak_20260827`：`pages/profile/` 下遗留的备份样式文件，非源码，移此保留。

## 仍在原位但排除出包的（被 tests/ 引用，勿删）

- `mock/oxygen-change-db.js`
- `mock/oxygen-suggestion-db.js`

> 归档日期：2026-08-29 · 由 Claude Code 按性能优化指南整理
