/**
 * components/scene-board/scene-board.js
 * 今日氧气场景 · 场景看板 (V0.8)
 * 从"普通四宫格按钮"升级为"场景卡片"，展示氧需求指数+推荐方案。
 * 用法: <scene-board scenes="{{sceneBoard}}" bind:chooseScene="onChooseScene" />
 */
Component({
  properties: {
    scenes: { type: Array, value: [] }
  },
  methods: {
    onTap(e) {
      const key = e.currentTarget.dataset.key
      const scene = (this.data.scenes || []).find(s => s.key === key)
      this.triggerEvent('chooseScene', { scene, sceneName: scene && scene.scene })
    }
  }
})
