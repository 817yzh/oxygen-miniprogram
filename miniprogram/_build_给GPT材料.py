# -*- coding: utf-8 -*-
"""整理氧氧宝给 GPT 的材料包：docx 转文本 + 合并关键说明"""
import os, re, io, zipfile

BASE = r"D:\Users\yzh\Desktop\12_充氧宝业务"
OUT  = r"D:\Users\yzh\Desktop\氧氧宝_给GPT材料包.txt"

def docx_to_text(path):
    """从 docx 提取纯文本：先把每个 <w:p> 段落抓出来，再从段内取 <w:t> 文本，保证顺序正确"""
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml").decode("utf-8", errors="replace")
    paras = re.findall(r"<w:p[^>]*>(.*?)</w:p>", xml, re.S)
    out=[]
    for p in paras:
        txt="".join(re.findall(r"<w:t[^>]*>([^<]*)</w:t>", p))
        if txt.strip(): out.append(txt.strip())
    return "\n".join(out)

def read_md(path):
    with open(path, encoding="utf-8", errors="replace") as f:
        return f.read()

buf=io.StringIO()

buf.write("# 氧氧宝 · 给 GPT 的项目材料包（整理版 2026-08-23）\n")
buf.write("# 说明：这是我们的内部材料整理，供产品升级分析使用。以下内容为真实项目信息。\n\n")

# 先说明项目背景（自定义，不含过时任务书）
buf.write("="*60+"\n")
buf.write("## 〇、项目一句话定位\n")
buf.write("="*60+"\n")
buf.write("""氧氧宝是【西藏充氧宝科技】旗下的 AI 健康陪伴小程序（面向 C 端用户）。核心不是卖硬件，而是：
「AI 氧系人格 + 每日状态感知 + 场景化氧气建议 + 充氧宝硬件连接 + 成长养成」的健康陪伴入口。
核心场景：高原旅行 / 脑疲劳 / 运动恢复 / 银发陪伴。
产品和 IP 有一只有亲和力的氧气小狐狸（氧氧）。
当前是比赛项目 + 可继续迭代的真实产品原型。
""")

# 1. 会议纪要
meeting = os.path.join(BASE, "01_文档资料", "会议与开发清单", "2026-08-20_项目推进会会议纪要.docx")
buf.write("\n"+"="*60+"\n")
buf.write("## 一、最近一次项目推进会会议纪要（2026-08-20，费总主持）\n")
buf.write("（这是最关键的材料：老师/老板给的方向、要保留/砍掉/加什么都在这里）\n")
buf.write("="*60+"\n")
try:
    txt = docx_to_text(meeting)
    buf.write(txt)
except Exception as e:
    buf.write(f"[读取失败: {e}]")

# 2. 页面架构
arch = os.path.join(BASE, "00_小程序源码", "氧氧宝", "页面映射表_开发清单.md")
buf.write("\n\n"+"="*60+"\n")
buf.write("## 二、当前页面架构与开发清单（页面映射表 V0.8）\n")
buf.write("="*60+"\n")
try:
    buf.write(read_md(arch))
except Exception as e:
    buf.write(f"[读取失败: {e}]")

# 3. 设计参考
design = os.path.join(BASE, "01_文档资料", "会议与开发清单", "氧氧宝V0.8_设计参考(Gemini原型).md")
buf.write("\n\n"+"="*60+"\n")
buf.write("## 三、设计参考（V0.8 设计方向，Gemini 原型整理）\n")
buf.write("="*60+"\n")
try:
    buf.write(read_md(design))
except Exception as e:
    buf.write(f"[读取失败: {e}]")

# 4. 产品使用说明书（提取关键）
userdoc = os.path.join(BASE, "00_小程序源码", "氧氧宝", "氧氧宝_产品使用说明书.docx")
buf.write("\n\n"+"="*60+"\n")
buf.write("## 四、产品使用说明书（节选）\n")
buf.write("="*60+"\n")
try:
    txt = docx_to_text(userdoc)
    buf.write(txt[:4000])  # 截取前面部分避免过长
    buf.write("\n[...说明书后续内容省略...]" if len(txt)>4000 else "")
except Exception as e:
    buf.write(f"[读取失败: {e}]")

# 5. 我们当前的待办问题（我手上的清单）
buf.write("\n\n"+"="*60+"\n")
buf.write("## 五、当前已知待办问题清单（我们自己整理的）\n")
buf.write("="*60+"\n")
buf.write("""对照 2026-08-20 会议要求的未完成项：
1. 健康小课堂 30 秒短视频接入（目前是文字卡片）
2. 差异化测试（针对脑力工作者/体力运动者等不同人群设计不同测试）
3. 运动前后对比（拍照对比吸氧/运动前后状态变化）
4. 约户外运动（社交功能，注意安全）
5. 博主真实案例接入（签约博主视频→真实案例，当前为纯 mock 等数据）

另外发现的问题：
- oxygen-profile（氧气档案）P0 核心页没有入口，用户进不去
- 首页已删除"发现氧气人格"和"和氧氧聊聊"两个重复入口（和 MBTI 页、chat 页重复）

已按会议完成的能力：
- 分享卡片（人格卡裂变）
- 同类人格匹配（soulmate）
- 音疗冥想 + 五音疗法（角徵宫商羽对应五脏，完整）
- 场景详情五段式（痛点→原理→方案→背书→购买）
- 场景模拟器
- user-profile-db 统一画像模型
""")

# 尾部：我们想要的输出
buf.write("\n"+"="*60+"\n")
buf.write("## 六、我们想要的输出（GPT 升级方案期望）\n")
buf.write("="*60+"\n")
buf.write("""请基于以上材料 + 你已看的源码，输出氧氧宝 V1.0 产品升级方案：
一、产品定位重新定义（A健康管理工具 / B AI情绪陪伴 / C智能硬件生态入口 / D大学生压力管理，我们倾向于怎么定位）
二、用户路径重构（首次打开 / 老用户每天打开 的旅程）
三、导航栏改造（tab 命名与图标）
四、首页视觉重做（从 Dashboard 改成今日氧气入口）
五、AI 陪伴升级（氧气世界观绑定，不做普通聊天机器人）
六、MBTI 体系强化（开场仪式 / 身份标签）
七、需要删除的功能
八、需要新增的功能
九、最终比赛展示 Demo 流程（3分钟惊艳开场）
""")

with open(OUT,"w",encoding="utf-8") as f:
    f.write(buf.getvalue())

print("done:", OUT)
print("size(KB):", round(os.path.getsize(OUT)/1024))
