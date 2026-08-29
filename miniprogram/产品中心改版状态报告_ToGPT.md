# 氧氧宝小程序 · 产品中心大改版状态报告（2026-08-25）

> 给 GPT 的同步文档。说明：氧氧宝是 OPC 决赛项目，微信小程序。本报告汇总本日对「产品中心(product-center)」和「我的(profile)」两页的大规模视觉与交互重构。

---

## 〇、项目背景
- 小程序根目录：`Desktop/12_充氧宝业务/00_小程序源码/氧氧宝/`
- 基础库 3.17.1，Windows 开发者工具调试
- 本日重点：把 product-center 从"功能页"升级为**大厂级消费电子展示页**（Apple/Dyson 风格），"我的"页改成数据仪表盘

---

## 一、product-center 页面（产品/原理/选型/FAQ tabBar）

### 1.1 页面整体架构（product-center.wxml）
```
<view class="page product">          ← 背景含薄荷径向光斑(环境光)
  ├ 顶部 Header: Work Air 充氧宝（细字重+宽字距）+ 副标题浅灰
  ├ Segmented Tab: 产品|原理|选型|FAQ（iOS 悬浮滑块，activeTab 切换）
  ├ block wx:if="activeTab==='product'"  → 产品展示区
  ├ block wx:if="activeTab==='tech'"     → 原理解说区
  ├ block wx:if="activeTab==='scene'"    → 智能选型区
  ├ block wx:if="activeTab==='faq'"      → FAQ+认证区
  ├ buy-bar（仅 product tab 显示）
  └ Bottom Sheet 组合抽屉（半屏毛玻璃，全局）
```

### 1.2 底部购买 Bar：流式布局
- 从 `position:fixed` 改为**普通流式**（放在内容最后一行）
- `.page.product` padding-bottom 收紧到 24px
- **只在 `activeTab==='product'` 显示**（原理/选型/FAQ 都隐藏，纯阅读不推销）
- 效果：滚动跟手，滚到底自然停在底部 tabBar 上方

### 1.3 Segmented Control（iOS 风）
```css
.seg { margin:14px 16px 0; background:rgba(255,255,255,.6);
       backdrop-filter:blur(14px); border-radius:14px; padding:4px;
       border:1px solid rgba(138,160,160,.15); box-shadow:0 4px 16px rgba(23,72,60,.06); }
.seg-item { flex:1; text-align:center; padding:9px 0; border-radius:11px;
            font-size:13px; color:rgba(0,0,0,.55); transition:all .3s; }
.seg-item.on { background:linear-gradient(135deg,rgba(0,230,184,.28),rgba(0,179,143,.22));
               backdrop-filter:blur(8px); color:#0E7A68; font-weight:700;
               box-shadow:0 2px 10px rgba(0,230,184,.18), inset 0 1px 0 rgba(255,255,255,.4); }
```
- JS：`switchTab(e)` 通过 `data-tab` 设置 `activeTab`

### 1.4 原理页（tech tab）
- **原理视频卡**：用 `<video>` 组件 + 自绘封面层
  - ⚠️ **微信 video 的 poster 属性只支持网络 URL**，本地路径报渲染层错误
  - 方案：`<image>` 封面层 + 毛玻璃 ▶ 按钮叠加在 video 上，点按钮 → `playTechVideo()` 隐藏封面 + `wx.createVideoContext('techVideo').play()`
  - 视频缩小到 180px 高度，卡片带 `1px rgba(0,230,184,.3)` 发光边框，播放钮脉冲动画 `playPulse`
- **发光流向线**：空气吸入→永磁分离→富氧输出，3 步 + 动态微光箭头 `tfPulse`
- **PK 对比双卡**：Work Air(薄荷绿,✓) vs 传统钢瓶(灰,✕)
- 数据：`SCENARIOS`、`playTechVideo()`/`onTechVideoPlay()`

### 1.5 选型页（scene tab，标题改"选型"）— 核心交互重构
弃用"问答题+深色生成框"，改为**横滑场景卡 + 下方动态联动**：

**结构**：
```
air-guide 标题 Find Your Air
scene-swiper (swiper): 4 张场景大卡（高原极客/深夜脑力/运动恢复/银发关怀）
  每卡: 背景场景图(scene/lasa.jpg等) + 硬件透明图浮空(scene-hw) + 遮罩 + 标题
combo-card 联动信息区（去框化，纯图标+字，细虚线分隔）:
  硬件/香氛/配件 三行 + 适用人群 + "查看此组合"渐变胶囊按钮
```

**数据** `SCENARIOS`（product-center.js）:
```js
{ id:'plateau', cover:'/images/scene/lasa.jpg', hwImg:'/images/hero-xizang.png',
  comboImg:'/images/combos/plateau.jpg', rent:79, buy:1680,
  title:'高原极客', sub:'进藏·高海拔·易高反',
  hw:'畅游西藏限定款', hwIcon:'/images/icon-peak.svg',
  scent:'薄荷尤加利配方', scentIcon:'/images/icon-scent.svg',
  acc:'高空便携挂扣', accIcon:'/images/icon-hook.svg',
  fit:'进藏旅游·登山徒步·高海拔工作' }
```

**联动逻辑** `onCardChange(e)`：swiper `bindchange` → `cardIndex` + `curScenario = scenarios[idx]`，下方信息随滑动更新。

**硬件浮空图**：`.scene-hw` 绝对定位右下，`filter:drop-shadow` 软阴影融入背景。
⚠️ hero-*.png 本身是真透明 PNG（72% 透明）；检测透明必须用 sharp raw 解析 alpha，不能读文件头字节。

### 1.6 组合抽屉 Bottom Sheet（点"查看此组合"打开）
半屏毛玻璃抽屉，不跳页，快速看图下单：

**结构**（wxml 末尾，sheet-mask + sheet）：
```
sheet-mask (fixed 全屏, rgba(12,20,18,.28) + blur(12px), 点关闭)
sheet (fixed bottom, height:78vh, backdrop-filter:blur(24px), translateY 上滑)
  sheet-handle 顶部把手
  sheet-show swiper: 4 张套装全家福(350rpx, aspectFit 不切头)
  sheet-tags 单行三列: 硬件/香氛/配件(图标+字, 细虚线分隔)
  sheet-scene 适用人群小字
  sheet-plans 双选卡: 体验租赁 ¥79/天 | 买断组合 ¥1680(推荐角标, 默认选中)
  sheet-cta 渐变胶囊按钮: 立即打包下单 ➔
```

**数据/方法**：
- data：`sheetOpen/sheetIndex/curSheet/planMode('rent'|'buy')`
- `openSheet(e)`（取当前 cardIndex，默认 planMode:'buy'）
- `closeSheet()`（遮罩 catchtap）、`onSheetChange(e)`（抽屉内 swiper 联动 curSheet）
- `choosePlan(e)`（单选 rent/buy）、`packOrder()`（toast 占位）

**套装图**：`/images/combos/{plateau,brain,sport,silver}.jpg`（从桌面 jfif 处理，横图 700px 宽）
- silver 原为竖长海报(592×1788)，后换新图"银发陪伴包11"（实为横版 1376×768 → 700×391）

### 1.7 FAQ 页（faq tab）
**认证与背书 → 2×2 信任墙**：
- `cert-grid` 2×2 网格大卡，统一薄荷线条 SVG Icon（32×32 同一粗细）
- icon 文件：cert-patent(专利盾)/cert-standard(勋章)/cert-star(春晚星)/cert-letter(感谢信).svg
- wxml：`<image class="cert-icon" src="{{item.icon}}">`

**FAQ → 三 Tab 分类 + 手风琴**：
- `faqCats`: 常见疑问|使用与安全|选购与售后
- js `buildFaq()` 按 catMap 分组（common/usage/shop），存 faqByCat，默认 faqTab:'common'
- `switchFaqTab(e)` 切换分类、`toggleFaq(e)` 手风琴（item.open 展开/收起）
- 手风琴：Q 标题 + ∨箭头，点开才显示 A（max-height 过渡），箭头 rotate(180deg)

---

## 二、profile 页面（"我的"，数据仪表盘）

弃用"未登录+8连列表"，改 **氧气数字绿洲仪表盘**：

**结构**：
```
user-card 个人氧能卡: 头像(AI IP气泡 oxy-ip.png / 人格icon / 未登录引导)
dash-grid 3列数据看板:
  累计充氧 oxygenHours(h) | 情绪护航 companionDays(天) | 成长等级 growthLevel+growthName
grp-card【我的健康与陪伴】:
  健康档案·充氧报告(goReport→report页) | 情绪日志与聊天记录(goEmotionLog/含goChatStat) | 成长中心·胶囊兑换(goGrowth)
grp-card【设备与设置】:
  我的充氧宝(goDevice, toast占位) | 隐私与数据说明(onPrivacy) | 健康声明(onHealthDeclare) | 清除本地数据(clearData)
```

**数据派生**（profile.js refresh）：
```js
companionDays = max(emotionHistory.length, companion.checkinDays||0)  // 18
oxygenHours   = (companionDays||5) * 2.5 → '12.5'   // 小时（无真实吸氧时长数据，用此派生）
growthLevel   = 'Lv.' + (companion.growthLevel||1)  // Lv.3
growthName    = companion.levelName                // 如"氧气搭档"
```

**统一 SVG**：icon-heart(健康)/icon-book(日志)/icon-leaf(成长)/icon-battery(设备)/icon-lock(隐私)/icon-shield(健康声明)/icon-trash(清除).svg，全部 28-32px 薄荷绿线条。

---

## 三、统一视觉规范（全站）
- 主色薄荷绿 `#00E6B8` / `#00B38F`，深青 `#1F3833`
- 毛玻璃：`backdrop-filter: blur(12~24px)` + 半透明白 `rgba(255,255,255,.6~.9)`
- 微光边框：`1px rgba(0,230,184,.2~.3)`
- 图标：**禁 Emoji**，统一 1.5px 细线薄荷 SVG
- 投影：柔和 `0 8~16px 24~40px rgba(23,72,60,.05~.12)`

---

## 四、关键技术经验（记录，避免踩坑）
1. 微信 WXSS **不支持中文类名**，必须 ASCII
2. 微信 `<video>` 的 **poster 只支持网络 URL**，本地路径报渲染层错误 → 用封面 image 层叠加方案
3. PNG 透明检测：用 `sharp(...).raw()` 解析 alpha 通道，**不能读文件头字节**（会误判）
4. 桌面多 .jfif 图，**拷图要精确指定文件名**，避免 foreach 误拷一堆
5. PowerShell 复杂脚本内联引号常报错 → 用 node 脚本文件（.js）
6. 校验代码用 node 脚本文件，避免内联 `'`/`"` 转义坑
7. `mock/faq-db.js` 只是 re-export，真实 FAQ 数据在 `mock/product-db.js`（FAQ 常量，questions+reply 结构）

---

## 五、当前待办/占位
- 场景卡"硬件浮空图"透明已确认 OK，但**位置/大小可能需再微调**（涵姐说先记下）
- Gemini 给了「银发陪伴包」英文渲染图 prompt（含布达拉宫/冰块底座/薄荷缝线绳等描述），**暂未生成**，涵姐可能后续用于更精致图
- "我的充氧宝"设备页 `goDevice` 是 toast 占位，**真实设备页未做**
- 底部购买 Bar 价格写死，**真实下单/支付未接入**

---

*本报告由龙虾(OpenClaw)生成，供 GPT 快速同步状态。*
