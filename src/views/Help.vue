<template>
  <div class="full">
    <iframe :src="src" frameborder="0" class="full"></iframe>
  </div>
</template>
<script>
export default{
  name: 'Help',
  data () {
    return {
      src: ''
    }
  },
  created () {
    if (this.$route.meta && this.$route.meta.nav) {
      this.$emit('changeHeader', this.$route.meta.nav)
      this.$emit('sideController', true)
    }
    console.log(this.$route.query)
    if (this.$route.query.type === 'about') {
      this.src = 'https://firebasestorage.googleapis.com/v0/b/ereaderapp-64f52.appspot.com/o/About.html?alt=media'
    } else if (this.$route.query.type === 'help') {
      this.src = 'https://firebasestorage.googleapis.com/v0/b/ereaderapp-64f52.appspot.com/o/Help.html?alt=media'
    }
  }
}
</script>
<style scoped>
.full{
  width: 100%;
  height: 100%;
}
</style>
