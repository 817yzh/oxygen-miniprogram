// components/recipe-card/recipe-card.js
Component({
  properties: {
    recipe: {
      type: Object,
      value: null
    },
    why: {
      type: String,
      value: ''
    }
  },
  data: {
    showDetail: false
  },
  methods: {
    // 展开/收起完整做法
    toggleDetail() {
      this.setData({ showDetail: !this.data.showDetail })
    }
  }
})
