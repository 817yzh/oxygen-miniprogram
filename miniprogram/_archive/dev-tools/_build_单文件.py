# -*- coding: utf-8 -*-
"""把氧氧宝核心代码拼成单个 txt 文件，供 AI(Gemini) 审阅"""
import os, io

ROOT = r"D:\Users\yzh\Desktop\12_充氧宝业务\00_小程序源码\氧氧宝"
OUT  = r"D:\Users\yzh\Desktop\氧氧宝_核心代码合集_Gemini审阅.txt"

# 拼接顺序与分类标签
SECTIONS = [
    # (分类名, 相对路径列表)  按路径排
    ("项目说明", ["页面映射表_开发清单.md", "氧氧宝_30秒品牌宣传片_分镜脚本.md"]),
    ("根配置",   ["app.js", "app.json", "config.js", "app.wxss", "sitemap.json"]),
    ("utils 工具层", None),   # 下面通配
]

# 手工指定每组要包含的子目录/文件
ORDER = [
    ("ROOT", ["页面映射表_开发清单.md", "氧氧宝_30秒品牌宣传片_分镜脚本.md",
              "app.js", "app.json", "config.js", "app.wxss", "sitemap.json"]),
    ("utils", ["chatEngine.js","checkinService.js","emotionEngine.js","emotionService.js",
               "faceApi.js","llm-service.js","oxygenService.js","placeholderImages.js",
               "sharePoster.js","stateEngine.js"]),
    ("mock",  [f for f in sorted(os.listdir(os.path.join(ROOT,"mock"))) if f.endswith(".js")]),
    ("pages", [f for f in sorted(os.listdir(os.path.join(ROOT,"pages"))) ]),  # 每种取 js
    ("components", sorted(os.listdir(os.path.join(ROOT,"components")))),
]

def collect_js_files(path):
    """递归收集所有 .js，返回相对路径列表"""
    out=[]
    for dp,dn,fn in os.walk(path):
        for f in fn:
            if f.endswith(".js"):
                full=os.path.join(dp,f)
                rel=os.path.relpath(full,ROOT)
                out.append(rel)
    return sorted(out)

buf=io.StringIO()
buf.write("="*70+"\n")
buf.write("氧氧宝 · 微信小程序 核心代码合集(单文件)\n")
buf.write("供 AI 审阅 | 由脚本自动拼接\n")
buf.write("="*70+"\n\n")

def slug(name):
    return name

# 组装各分类文件清单
plan=[]
# ROOT/根文件
plan.append(("01_根配置与说明", [f for f in ORDER[0][1]]))
# utils
plan.append(("02_utils 工具层", [os.path.join("utils",f) for f in ORDER[1][1]]))
# mock
plan.append(("03_mock 数据(23个)", [os.path.join("mock",f) for f in ORDER[2][1]]))
# pages
pg_js=collect_js_files(os.path.join(ROOT,"pages"))
plan.append(("04_pages 页面(js)", pg_js))
# components
cp_js=collect_js_files(os.path.join(ROOT,"components"))
plan.append(("05_components 组件(js)", cp_js))

total_bytes=0
for cat, files in plan:
    buf.write("\n"+"#"*70+"\n")
    buf.write(f"# {cat}\n")
    buf.write("#"*70+"\n")
    for rel in files:
        path=os.path.join(ROOT, rel.replace("/", os.sep))
        if not os.path.exists(path):
            buf.write(f"\n/* ── [!缺失] {rel} ── */\n")
            continue
        with open(path,"r",encoding="utf-8",errors="replace") as fh:
            content=fh.read()
        total_bytes+=len(content.encode("utf-8"))
        buf.write(f"\n\n/* ══════════════════════════════════════ */\n")
        buf.write(f"/* 文件: {rel} */\n")
        buf.write(f"/* ══════════════════════════════════════ */\n")
        buf.write(content)

with open(OUT,"w",encoding="utf-8") as fh:
    fh.write(buf.getvalue())

print(f"完成: {OUT}")
print(f"包含 {sum(len(f) for _,f in plan)} 个文件, 合计 {total_bytes/1024:.0f} KB")
