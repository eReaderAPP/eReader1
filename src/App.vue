<template>
  <div id="app" class="class1">
      <!-- header -->
      <a-layout-header class="header" v-show="$route.path!=='/login'">
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
            v-show="$route.path!=='/login'"
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

    <a-drawer
      title="Upload to the cloud"
      placement="top"
      :closable="false"
      :visible="cloudVisible"
      @close="cloudClose"
    >
      <!-- <div>
        <p><a-icon type="info-circle" /> Upload: <br> <span class="info-text">
          the upload button will not upload your local book files to the server, but only upload your reading history, reading habits and your device information, so that it can be synchronized when you switch devices or clear your browsing history
        </span></p>
        <a-button @click="upload" block type="primary">
          Upload reading history now
        </a-button>
      </div>
      <div style="margin-top: 50px;">
        <a-button @click="getCloud" block type="primary">
          Get cloud data now
        </a-button>
      </div> -->
      <a-row type="flex" style="height: 150px" justify="space-around" >
        <a-col style="width: 130px; text-align: center;" @click="upload" class="item-choose">
          <a-icon type="cloud-upload" class="big-font"/>
          <div>Upload</div>
        </a-col>
        <a-col style="width: 130px; text-align: center;" @click="getCloud" class="item-choose">
          <a-icon type="cloud-sync" class="big-font"/>
          <div>Sync</div>
        </a-col >
      </a-row>
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
import DB from '@/indexDB/DB.js'
import booksDb from '@/indexDB/books-db.js'
import bookPageDb from '@/indexDB/bookPage-db.js'

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
      googleStatus: 0, // 0 :pendding,1:resolve,2:reject
      cloudVisible: false
    }
  },
  methods: {
    getCloud () {
      this.cloudVisible = false
      this.showLoad()
      let datas = this.$fs.get('userBooks')
      datas.then(res => {
        this.closeLoad()
        window.test = res
        let data = res.docs
        try {
          let metadata = data[0]._document.data.value.mapValue.fields
          let content = {}
          for (let index in metadata) {
            content[index] = JSON.parse(metadata[index]['stringValue'])
          }
          console.log(content)
          if (content.bookPages) {
            let database = new DB(bookPageDb)
            database.openDB().then(() => {
              content.bookPages.forEach(ele => {
                database.featch(ele.bookName).then(res => {
                  if (res) {
                    // 是否替换现有历史记录
                    this.$confirm({
                      title: 'Confirm whether to replace the reading record?',
                      content: 'The local reading record is inconsistent with the online saving record, please confirm whether to replace the local record with the online reading record',
                      onOk () {
                        database.update(ele.bookName, ele).then(() => {
                          message.info('Successfully')
                        }).catch(() => {
                          message.error('Failed, Please try again later')
                        })
                      },
                      onCancel () {
                        message.info('Request Canceled')
                      }
                    })
                  } else {
                    // 直接更新历史记录
                    database.update(ele.bookName, ele).then(() => {
                      message.info('Successfully')
                    }).catch(() => {
                      message.error('Failed, Please try again later')
                    })
                  }
                })
              })
            })
          }
        } catch (e) {
          message.error("The online history record of the user's identity is empty.")
        }
      })
    },
    upload () {
      this.cloudVisible = false
      let promiseList = []
      let db = new DB(booksDb)
      promiseList.push(db.openDB().then(() => {
        return db.featchAll()
      }))

      let db2 = new DB(bookPageDb)
      promiseList.push(db2.openDB().then(() => {
        return db2.featchAll()
      })
      )
      Promise.all(promiseList).then(res => {
        let [books, bookPages] = res
        let booksStore = []
        let skipKeys = ['content', 'cover']
        books.forEach(book => {
          let temp = {}
          for (let key in book) {
            if (skipKeys.indexOf(key) === -1) {
              temp[key] = book[key]
            }
          }

          booksStore.push(temp)
        })
        let uid = this.session.get('uid')
        this.showLoad()
        this.$fs.set('userBooks', uid, {
          books: JSON.stringify(booksStore),
          bookPages: JSON.stringify(bookPages),
          platform: JSON.stringify(navigator.userAgent)
        })
        message.info('update completed')
        this.closeLoad()
      })
    },
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
    cloudClose () {
      this.cloudVisible = false
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
        case 'cloud':
          if (!this.session.get('phoneNumber')) {
            this.$router.push('/login')
          } else {
            this.cloudVisible = true
          }
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
  .info-text{
    font-size: 1px;
    font-weight: 700;
  }
  .big-font{
    font-size: 60px;
    background: #f0f0f0;
    border-radius: 10px;
  }
  .item-choose :hover{
    opacity: 0.5;
    zoom: 1.1;
    transition: all 2s;
  }
</style>
