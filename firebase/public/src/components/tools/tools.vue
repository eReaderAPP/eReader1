<template>
    <div :class="['tool-container',{'hidded':hidden}]">
      <slot></slot>
    </div>
</template>

<script>
export default {
  name: 'tools',
  data () {
    return {
      count: 0, hidden: false
    }
  },
  mounted () {
    // 监听鼠标
    document.onmousemove = (event) => {
      let x1 = event.clientX
      let y1 = event.clientY
      if (this.x !== x1 || this.y !== y1) {
        this.count = 0
        this.hidden = false
      }
      this.x = x1
      this.y = y1
    }
    // 监听键盘
    document.onkeydown = () => {
      this.count = 0
      this.hidden = false
    }
    // 监听Scroll
    document.onscroll = () => {
      this.count = 0
      this.hidden = false
    }
    this.setTimer()
  }, // 最后在beforeDestroy()生命周期内清除定时器：
  beforeDestroy () {
    this.clearTimer()
  },
  methods: {
    clearTimer () {
      clearInterval(window.myTimer)
      window.myTimer = null
    },
    setTimer () {
      this.count = 0
      if (!window.myTimer) {
        window.myTimer = window.setInterval(this.cookieTimeout, 1000)
      }
    },
    cookieTimeout () {
      let outTime = 3
      this.count++
      if (this.count === outTime) {
        console.log('隐藏')
        this.hidden = true
      }
    }
  }
}
</script>
<style>
  .tool-container{
    position: fixed;
    left: 1px;
    bottom: 20px;
    width: 50px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    border: 1px solid #000;
    transition: left 2s;
    z-index: 999;
  }
  .tool-container>div:not(:last-child)::after{
    content: '';
    width: 70%;
    height: 1px;
    background-color: #000;
    display: block;
    margin: 10px auto;
    position: absolute;
    left: 0;
    right: 0;
  }
  .hidded{
    left: -80px;
  }
</style>
