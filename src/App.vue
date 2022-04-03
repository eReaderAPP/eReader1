<template>
  <div id="app" class="class1">
      <!-- header -->
      <a-layout-header class="header">
        <a-row justify="end" type="flex" class="header-btn-are">
                <!-- <a-icon type="select" class="openSide" @click="sideController"/> -->
                <!-- <a-icon type="home" class="openSide" @click="goHome" v-if="!($route.path==='/bookList')"></a-icon> -->
                <a-button  @click="goHome"  v-if="($route.path==='/book')" class="openSide">
                  <a-icon type="home"/>
                </a-button>
                <!-- <a-icon :type="collapsed ? 'menu-unfold' : 'menu-fold'"  class="openSide" @click="sideController"/> -->
                <a-button
                  v-for="(item,index) in navs"
                  :key="index"
                  @click="headerClick(item)"
                >
                <a-icon :type="item.icon"/><span v-if="!isMobileStatus">{{item.label}}</span></a-button>
        </a-row>
      </a-layout-header>
      <!-- sider -->
      <div class="content-area">
        <a-row type="flex" class="content">
          <a-layout-sider
            v-model="collapsed"
            :trigger="null"
            collapsible theme="dark"
            breakpoint="xs"
            collapsed-width="0"
            @collapse="onCollapse"
            @breakpoint="onBreakpoint"
            :width="menuWidth"
            height="100%"
          >
            <a-menu theme="dark" mode="inline" :default-selected-keys="menuKey" @click="menuClick">
              <a-menu-item key="1">
                <a-icon type="user" />
                <span>home</span>
              </a-menu-item>
              <a-menu-item key="2">
                <a-icon type="contacts" />
                <span>about</span>
              </a-menu-item>
              <a-menu-item key="3">
                <a-icon type="question-circle" />
                <span>help</span>
              </a-menu-item>
            </a-menu>
          </a-layout-sider>
          <a-layout-content class="main-content" flex="1" @click="windowClick">
            <router-view v-on:showLoading="showLoad" v-on:closeLoading="closeLoad" @changeHeader="handeleHeader" ref="child" @showGoogle="showGoogle" @sideController = "sideController"/>
          </a-layout-content>
        </a-row>
      </div>

    <a-drawer
      title="Translate Setting"
      placement="right"
      :closable="false"
      :visible="visible"
      @close="onClose"
    >
      <a-card size="small" title="GoogleTranslate" >
        <div id="google_translate_element" style="position: relative;z-index: 999;"></div>
      </a-card>
      <!-- <a-card size="small" title="Export Book" class="export-card">
        <div id="export-book-btn" style="position: relative;z-index: 999;">
          <a-button type="default" block @click="exportBook">Export</a-button>
        </div>
      </a-card> -->
    </a-drawer>

    <div class="loading" v-show="loading">
      <div>
        <a-spin size="large"/>
      </div>
    </div>
  </div>
</template>

<script>
// import {hackTrans} from '@/utils/googleTranslate.js'

import { message, notification } from 'ant-design-vue'
export default {
  name: 'App',
  data () {
    return {
      loading: true,
      timer: null,
      times: 0,
      navs: [{
        key: 'help',
        icon: 'cloud',
        label: 'Help'
      }, {
        key: 'quit',
        icon: 'setting',
        label: 'Options'
      }],
      collapsed: false,
      menuKey: ['1'],
      visible: true,
      googleInfo: {
        title: 'Google translation loading...',
        tag: 'Loading',
        info: 'Please wait patiently. The Google translation above is loaded successfully'
      },
      menuWidth: '150',
      isMobileStatus: true,
      isHome: false,
      googleStatus: 0 // 0 :pendding,1:resolve,2:reject
    }
  },
  methods: {
    initMenuBar () {
      if (this.$route.query.type) {
        console.log(this.$route.query.type)
        switch (this.$route.query.type) {
          case 'about':
            this.menuKey = []
            this.menuKey = ['2']
            break
          case 'help':
            this.menuKey = []
            this.menuKey = ['3']
            break
        }
      }
    },
    exportBook () {
      this.$refs.child.exportBook()
    },
    windowClick () {
      console.log(this.isMobileStatus)
      if (this.isMobileStatus) {
        this.sideController(true)
      }
    },
    goHome () {
      this.$router.push('/booklist')
    },
    showGoogle () {
      this.visible = true
      this.googleInfo = {
        title: 'Google Translate',
        tag: 'Tips',
        info: 'If there is a problem with translation, please switch the target language again'
      }
    },
    onClose () {
      this.visible = false
    },
    initGoogle () {
      let count = 0
      let timmer = null
      this.showLoad()
      timmer = setInterval(() => {
        let dom = document.querySelectorAll('#google_translate_element')[0]
        if (dom && timmer && (dom.querySelector('select') || count === 30)) {
          this.closeLoad()
          clearInterval(timmer)
        }
        if (dom.querySelector('select')) {
          message.success('Google Translate Load Success .', 2)
          this.googleInfo = {
            title: '---',
            tag: 'Google translation loaded successfully',
            info: 'Select the translation target language, and then click the gray area on the left to close the setting page. You can also return to the home page again and click option to enter the language selection interface'
          }
        }
        count++
      }, 1000)
      let head = document.getElementsByTagName('head')[0]
      let script = document.createElement('script')
      let url = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.type = 'text/javascript'
      script.onload = script.onreadystatechange = function () {
        if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
          console.log('Google Translate Load Success', 2)
          script.onload = script.onreadystatechange = null
        }
      }
      script.onerror = function () {
        notification.error({
          message: 'Error Notification',
          description: 'Google translation failed to load, which may cause the translation function to be unavailable, please check the network !',
          placement: 'topRight'
        })
      }
      script.src = url
      head.appendChild(script)
    },
    sideController (param) {
      // console.log('in', param)
      if (param !== undefined) this.collapsed = param
      else this.collapsed = !this.collapsed
    },
    menuClick (item) {
      let key = item.key
      switch (key) {
        case '1':
          if (this.$route.path !== '/booklist') {
            this.$router.push('/booklist')
          }
          break
        case '2':
          if (this.$route.query.type !== 'about') {
            this.$router.push({
              path: '/about',
              query: {
                type: 'about'
              }
            })
          }
          break
        case '3':
          if (this.$route.query.type !== 'help') {
            this.$router.push({
              path: '/help',
              query: {
                type: 'help'
              }
            })
          }
          break
      }
    },
    onBreakpoint () {

    },
    onCollapse () {

    },
    showLoad () {
      this.loading = true
    },
    closeLoad () {
      this.loading = false
    },
    handeleHeader (res) {
      this.navs = []
      res.forEach(element => {
        this.navs.push(element)
      })
      console.log(this.navs)
    },
    headerClick (item) {
      console.log(item)
      switch (item.key) {
        case 'open':
          console.log('上传新文件')
          this.$refs.child.uploadFile()
          break
        case 'menu':
          console.log('打开关闭菜单')
          this.sideController()
          break
        case 'chapter':
          console.log('选择章节')
          this.$refs.child.showChapters()
          break
        case 'setting':
          console.log('打开设置')
          this.$refs.child.showToolBox()
          break
        case 'option':
          console.log('打开设置')
          this.visible = true
          break
        default:
          message.info('to be continued')
      }
    }
  },
  created () {
    window.googleTranslateElementInit = function () {
      // eslint-disable-next-line no-undef
      window.googleTrans = new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element')
    }
    let isMobileStatus = this.isMobile()
    let isHome = this.$route.path === '/booklist'
    this.isHome = isHome
    this.isMobileStatus = isMobileStatus
    this.menuWidth = isMobileStatus ? '48' : this.menuWidth
    this.initMenuBar()
  },
  mounted () {
    this.initGoogle()
  }
}

</script>

<style lang="less">
  @import url('./less/index.less');
  .goog-te-banner-frame{
    left: 0px !important;
    top: 15px !important;
    right: 0 !important;
    height: 40px !important;
    width: 52% !important;
    position: fixed !important;
    margin: auto !important;
    display: none !important;
  }
body,html{
  margin: 0;
  top: 0 !important;
}
.header{
  height: 64px;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.class1{
  background-image: linear-gradient(15deg, #13547a 0%, #80d0c7 100%) !important;
}
.class2{
  background-image: linear-gradient(to right, #74ebd5 0%, #9face6 100%) !important;
}
.class3{
  background-image: linear-gradient(to left, #BDBBBE 0%, #9D9EA3 100%), radial-gradient(88% 271%, rgba(255, 255, 255, 0.25) 0%, rgba(254, 254, 254, 0.25) 1%, rgba(0, 0, 0, 0.25) 100%), radial-gradient(50% 100%, rgba(255, 255, 255, 0.30) 0%, rgba(0, 0, 0, 0.30) 100%) !important;
 background-blend-mode: normal, lighten, soft-light !important;
}
.loading{
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    margin: auto;
    background: rgba(255,255,255,.7);
    z-index: 999;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
  }
  .loading-msg{
    font-size: 18px;
    font-weight: 700;
  }
  .menu{
    display: flex;
    justify-content: end;
  }
  .header-button i{
    font-size: 19px;
    margin-right: 5px;
    line-height: 19px;
    vertical-align: middle;
  }
  .header-btn-are{
    height: 100%;
    align-items: center;
  }
  .header-btn-are button{
    background-color: transparent;
    color: white;
    height: 64px;
    border: none;
    border-radius: 0;
    font-size: 19px;
    padding: 0px 13px;
  }
  .ant-layout-header{
    padding: 0 !important;
    width: 100% !important;
  }
  .main-content{
    flex: 1 !important;
    position: relative  !important;
    overflow: hidden !important;
    background-color: white !important;
  }
  .content-area{
    flex: 1 !important;
    overflow-y: auto !important;
  }
  .content{
      min-height: 100%;
      overflow: hidden;
  }
  .ant-menu-item{
    margin-top: 0 !important;
  }
  .openSide{
    color: white !important;
    font-size: 19px !important;
    text-align: left !important;
    margin-right: auto !important;
    padding-left: 20px !important;
  }
  .ant-layout-sider,.ant-menu-dark, .ant-menu-dark .ant-menu-sub{
    background:transparent !important;
  }
  .header{
    background: transparent !important;
  }
  .main{
    background-color: white !important;
  }
  .export-card{
    margin-top: 20px;
  }
</style>
