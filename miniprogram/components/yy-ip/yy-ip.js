/**
 * 氧氧 IP 组件 (V0.4)
 * 唯一品牌角色。所有核心页面出现。
 * 用法: <yy-ip action="welcome|celebrate|encourage|grow|detect|accompany|wave" size="lg|md|sm" bubble="自定义气泡(可选)" />
 *
 * action 状态 → 动作素材图:
 *   welcome     首页问候   https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/ip-actions/welcome.png
 *   celebrate   打卡成功   https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/ip-actions/celebrate.png
 *   encourage   连续打卡   https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/ip-actions/encourage.png
 *   detect      分析       https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/ip-actions/detect.png
 *   companion   陪伴       https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/ip-actions/companion.png
 *   grow        成长       (暂无专属图,回退默认 IP)
 *   wave        挥手       (暂无专属图,回退默认 IP)
 */
Component({
  properties: {
    action: { type: String, value: 'accompany' },
    size: { type: String, value: 'md' },
    // 外传气泡；为空时自动从状态库随机取
    bubble: { type: String, value: '' }
  },



  data: {
    actionClass: 'action-accompany',
    sizeClass: 'size-md',
    showBubble: '',
    ipSrc: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/oxy-ip.png'
  },

  observers: {
    'action, size, bubble': function(action, size, bubble) {
      const act = action || 'accompany'
      this.setData({
        actionClass: 'action-' + act,
        sizeClass: 'size-' + (size || 'md'),
        showBubble: bubble || this.randomBubble(act),
        ipSrc: this.actionImage(act)
      })
    }
  },

  methods: {
    // 每个状态对应的动作素材图
    actionImage(action) {
      const map = {
        welcome: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/ip-actions/welcome.png',
        celebrate: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/ip-actions/celebrate.png',
        encourage: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/ip-actions/encourage.png',
        detect: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/ip-actions/detect.png',
        companion: 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/ip-actions/companion.png'
      }
      return map[action] || 'https://cdn.jsdelivr.net/gh/817yzh/oxygen-images@main/oxy-ip.png'
    },

    // 每个状态配随机气泡文案
    randomBubble(action) {
      const lib = {
        welcome: ['欢迎回来，我的氧气伙伴 ☁️', '今天也见到你啦，真开心 🌱', '回来啦，氧氧一直在 💚'],
        celebrate: ['打卡成功！你今天很棒 🌟', '被你治愈到了，继续保持 ☀️', '记录完成，给你一朵小氧气 ✨'],
        encourage: ['已经连续打卡啦，太自律了！🔥', '坚持最酷，氧氧为你骄傲 💪', '越来越懂你了 🌱'],
        grow: ['升级啦！氧氧又成长一步 🎉', '解锁新阶段，继续一起走吧 ✨', '你的陪伴让氧氧长大啦 🌟'],
        detect: ['让我看看你的氧气…', '正在感受你的状态 🔍', '深呼吸，交给氧氧 🌬️'],
        companion: ['我在呢 💚', '随时都可以回来找我 🫧', '陪着你，不管几点'],
        wave: ['嗨！我在这里 👋', '见到你真好 ☁️', '来啦！跟氧氧打个招呼吧']
      }
      const list = lib[action] || lib.accompany
      return list[Math.floor(Math.random() * list.length)]
    },

    // IP被点击时的互动
    onTapIP() {
      this.triggerEvent('tapip')
      wx.vibrateShort({ type: 'light' })
    }
  }
})
