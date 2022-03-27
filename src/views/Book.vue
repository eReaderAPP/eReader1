<template>
  <div class="entry">
    <a-drawer
      :placement="toolBoxPlaceMent"
      :closable="false"
      :visible="isShowToolBox"
      @close="closeToolBox"
    >
      <div slot="title">
        <a-icon type="tool" style="font-size: 14px;"/><span class="setting-title">Display settings</span>
      </div>
      <div class="controller-area">
        <a-row type="flex" justify="start">
          <a-col style="line-height: 36px;" :xs="6" :sm="4" :md="3" :lg="3" :xl="2">
            <a-tooltip>
              <template slot="title">
                <span class="font-size-11">Display text size</span>
              </template>
              Font-size
            </a-tooltip>
          </a-col>
          <a-col :span="10">
            <a-slider v-model="settingOption.fontSize" :min="8" :max="40" />
          </a-col>
          <a-col style="margin-left: auto;">
            <a-input-number v-model="settingOption.fontSize" :min="8" :max="40" style="marginLeft: 16px" />
          </a-col>
        </a-row>
        <a-row type="flex" justify="start">
          <a-col :xs="6" :sm="4" :md="3" :lg="3" :xl="2" style="line-height: 36px;">
            <a-tooltip>
              <template slot="title">
                <span class="font-size-11">Text background color</span>
              </template>
              Color
            </a-tooltip>
          </a-col>
          <a-col :xs="18" :sm="20" :md="21" :lg="21" :xl="22">
            <a-radio-group v-model="settingOption.bgColor" style="width:100%;display: flex;" >
              <a-radio-button :value="index" v-for="(item,index) in themes" :key="index" style="flex: 1;">
                {{item.name}}
              </a-radio-button>
            </a-radio-group>
          </a-col>
        </a-row>
        <a-row type="flex" justify="start">
          <a-col :xs="6" :sm="4" :md="3" :lg="3" :xl="2" style="line-height: 36px;">
            <a-tooltip>
              <template slot="title">
                <span class="font-size-11">Text line spacing</span>
              </template>
              Row-spacing
            </a-tooltip>
          </a-col>
          <a-col :span="10">
            <a-slider v-model="settingOption.lineHeight" :min="1" :max="10" />
          </a-col>
          <a-col style="margin-left: auto;" >
            <a-input-number v-model="settingOption.lineHeight" :min="1" :max="10" />
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24" style="line-height: 36px;">
            <a-button block type="primary" @click="showGoogle">Translate</a-button>
          </a-col>
        </a-row>
      </div>

    </a-drawer>

    <a-drawer
      :placement="chapterPlaceMent"
      :closable="false"
      :visible="isShowChapter"
      @close="closeChapter"
    >
      <div slot="title">
        <a-icon type="database" style="font-size: 14px;"/><span class="setting-title">CONTENTS</span>
      </div>
      <div class="font-size-11">
        <a-tooltip>
          <template slot="title">
            <span class="font-size-11">outline</span>
          </template>
          Chapter display
        </a-tooltip>
        <a-list item-layout="horizontal" :data-source="tocs">
          <a-list-item slot="renderItem" slot-scope="item, index">
            <a-list-item-meta
              :description="item.label"
            >
              <a slot="title" href="#">{{ item.id }}</a>

            </a-list-item-meta>
          </a-list-item>
        </a-list>
      </div>
    </a-drawer>
    <div class="loading" v-show="loading" >
      <div>
        <a-spin/>
        <!-- <div><span class="loading-msg" ref="loadingMsg">{{progressStatus}}</span><span class="dot">...</span></div> -->
      </div>
    </div>
    <div
      :class="['left-container',{'onlyCH-one':settingOption.switchCH}]"
      id="base"
      ref="base"
    ></div>
    <!-- <div :class="['right-container',{'onlyCH-two':settingOption.switchCH}]" id="trans" ref="trans"></div> -->

    <div class="page-btn-area">
      <a-button type="default" @click="prevPage"> <a-icon type="left" />previous</a-button>
      <a-button type="default" @click="nextPage">next<a-icon type="right" /> </a-button>
    </div>
    <!-- <div class="top-btn-area">
      <a-button type="default" shape="circle" icon="left-circle" @click="backList"/>
    </div> -->

    </div>
  <!-- </div> -->
</template>
<script>
import { message } from 'ant-design-vue'
import DB from '@/indexDB/DB.js'
import settingDB from '@/indexDB/setting-db.js'
import booksDB from '@/indexDB/books-db.js'
import bookPageDb from '@/indexDB/bookPage-db.js'
import {getPageInfo} from '@/utils/bookManager.js'
import html2canvas from 'html2canvas'
let ePub = window.ePub
export default{
  name: 'Book',
  data () {
    return {
      db: null,
      book: null,
      tocs: [],
      book2: null,
      loading: false,
      bookName: '',
      storage: [],
      // 当前页面信息
      pageInfo: null,
      // 等待文案
      progressStatus: 'Loading',
      // 工具栏信息
      isShowToolBox: false,
      toolBoxPlaceMent: 'top',
      isShowChapter: false,
      chapterPlaceMent: 'right',
      settingOption: {
        user: 'user',
        switchCH: true,
        fontSize: 8,
        lineHeight: 1,
        bgColor: 1

      },
      themes: [
        {
          id: '1',
          name: 'Default',
          color: '#000',
          class: 'class1'
        },
        {
          id: '2',
          name: 'Energy',
          color: '#000',
          class: 'class2'
        },
        {
          id: '3',
          name: 'Dark',
          color: '#000',
          class: 'class3'
        }
      ]
    }
  },
  created () {
  },
  mounted () {
    if (this.$route.meta && this.$route.meta.nav) {
      this.$emit('changeHeader', this.$route.meta.nav)
      this.$emit('sideController', true)
    }

    let param = this.$route.query
    let bookName = param.bookName
    this.bookName = bookName

    this.loading = true

    // 缓存设置
    this.getSetting().then(res => {
      if (!res) {
        this.setSetting()
      } else {
        this.settingOption = res
      }
    })

    this.createBook()

    this.initEvent()
  },
  watch: {
    settingOption: {
      deep: true,
      handler (newVal, oldVal) {
        let db = new DB(settingDB)
        db.openDB().then(() => {
          return db.update('user', newVal)
        }).then(() => {
          this.setStyle()
        })
      }
    }
  },
  methods: {
    exportBook () {
      console.log('export book')

      console.log(this.book)
      var a = this.book.element
      var b = a.children[0].children[0]
      // var c = b.contentDocument.body.innerHTML
      html2canvas(b.contentDocument.body).then((canvas) => {
        console.log('tocanvas success')
        console.log(canvas)

        canvas.toBlob(res => {
          console.log('to bolb success')
          console.log(res)
          var newImg = document.createElement('img')
          var url = URL.createObjectURL(res)
          newImg.onload = function () {
          // 读取完成后，手动回收
            URL.revokeObjectURL(url)
          }
          newImg.src = url
          document.body.appendChild(newImg)
        }, 'text/xml', 1)
      })
    },
    showGoogle () {
      this.isShowToolBox = false
      this.$emit('showGoogle')
    },
    vuetap (s, e) {
      console.log(e)
      // this.name = s.name
    },
    setStyle () {
      if (!this.book) {
        return
      }
      this.book.setStyle('font-size', this.settingOption.fontSize + 'px')
      // this.book.setStyle('background-color', this.settingOption.bgColor)
      // this.book.setStyle('font-family', this.settingOption.fontFamily)
      this.book.setStyle('line-height', this.settingOption.lineHeight)

      // // this.book.renderer.forceSingle(false)

      // this.book.setStyle('color', this.themes[this.settingOption.bgColor].color)
      // document.body.style.backgroundColor = this.themes[this.settingOption.bgColor].bgColor
      // this.book.setStyle('background-color', 'transparent')
      let app = document.getElementById('app')
      this.themes.forEach(element => {
        app.classList.remove(element.class)
      })
      try {
        let theme = this.themes[this.settingOption.bgColor].class
        app.classList.add(theme)
      } catch (e) {
        let theme = 'class1'
        app.classList.add(theme)
      }
    },
    initEvent () {
      this.onKeyDown = e => {
        console.log(e.keyCode)
        switch (e.keyCode) {
          case 27: // Esc
            this.$router.push('/bookList')
            break
          case 37: // left
          case 38: // up
            this.prevPage()
            break
          case 39: // right
          case 40: // down
            this.nextPage()
            break
        }
      }
      document.addEventListener('keydown', this.onKeyDown, false)
    },
    backList () {
      this.$router.push('/bookList')
    },
    getToc () {
      this.book.getToc().then(res => {
        if (res) {
          this.tocs = res
        } else {
          throw new Error('获取章节信息失败')
        }
      }).catch(err => {
        console.log(err)
        message.info('获取章节信息失败')
      })
    },
    createBook () {
      this.initDB()
        .then(() => {
          return this.db.featch(this.bookName)
        })
        .then(res => {
          if (res) {
            let {author, bookName, content, cover} = res
            this.initBook({author, bookName, content, cover})
          } else {
            message.info('book not exist, back and check!')
          }
        })
    },
    setSetting () {
      return new Promise((resolve, reject) => {
        let db = new DB(settingDB)
        db.openDB().then(() => {
          return db.update('user', this.settingOption)
        }).then(() => {
          console.log('更新数据库设置成功')
          resolve('更新设置成功')
        }).catch((err) => {
          reject(err)
        })
      })
    },
    getSetting () {
      return new Promise((resolve, reject) => {
        let db = new DB(settingDB)
        db.openDB().then(() => {
          return db.featch('user')
        }).then((res) => {
          resolve(res)
        }).catch((err) => {
          reject(err)
        })
      })
    },
    initDB () {
      let db = new DB(booksDB)
      this.db = db
      return db.openDB()
    },
    initBook (options) {
      let book = ePub({
        bookPath: options.content,
        restore: true
      })
      this.book = book
      window.book = book
      let renderPromise = this.book.renderTo('base', {
        flow: 'auto'
      })
      console.log('loaded')
      // 渲染成之后
      renderPromise.then(() => {
        console.log('rended')
        let bookName = this.book.metadata.bookTitle
        var pageDB = new DB(bookPageDb)
        // 获取目录
        this.getToc()
        this.setStyle()
        // 跳转历史记录
        pageDB.openDB().then(() => {
          return pageDB.featch(bookName)
        }).then(res => {
          console.log('get his')
          if (res) {
            console.log('go his')
            this.book.goto(res.currentCfi).then(() => {
              console.log('go his done')
              this.loading = false
            })
          } else {
            console.log('stay here')
            this.loading = false
          }
        })
      })
      book.on('renderer:locationChanged', locationCfi => {
        var pageInfo = getPageInfo()
        var bookName = this.book.metadata.bookTitle
        var data = {
          bookName: bookName,
          currentCfi: locationCfi,
          currentPage: pageInfo.currentPage,
          totalPage: pageInfo.totalPage
          // currentChapter: window.book.currentChapter
        }
        this.pageInfo = data
        var pageDB = new DB(bookPageDb)
        pageDB.openDB().then(() => {
          return pageDB.update(bookName, data)
        }).then(() => {
        }).catch((e) => {
          console.log(e)
          console.log('缓存页面信息失败')
        })
      })
    },

    nextPage () {
      this.book.nextPage()
    },
    prevPage () {
      this.book.prevPage()
    },
    closeToolBox () {
      this.isShowToolBox = false
    },
    closeChapter () {
      this.isShowChapter = false
    },
    showToolBox () {
      this.isShowToolBox = true
    },
    showChapters () {
      this.isShowChapter = true
    },
    showloading () {
      this.loading = true
    }
  },
  beforeDestroy () {
    this.book && this.book.destroy()
    document.removeEventListener('keydown', this.onKeyDown)
  }
}
</script>
<style scoped lang="less">
  .entry{
    display: flex;
    height: 98%;
    width: 88%;
    margin: auto;
    /* border: 1px solid black; */
    justify-content: space-around;
    align-items: center;
  }
  .left-container,.right-container{
    width: 100%;
    height: 89%;
    padding: 10px 0;
  }
  /* .left-container::after{
    content: '';
    width: 2px;
    height: 100%;
    background-color:#888888;
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    box-shadow: -1px 2px 5px #888888;
  } */
  .page-btn-area{
    position: absolute;
    bottom: 8px;
    margin: auto;
    display: flex;
    justify-content: space-around;
    width: 100%;
  }
  .top-btn-area{
    position: absolute;
    top: 13px;
    margin: auto;
    display: flex;
    width: 100%;
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
  .dot {
    font-family: simsun; /*固定字体避免设置的宽度无效*/
    animation: dot 3s infinite step-start;
    display: inline-block;
    width: 1.5em;
    vertical-align: bottom; /*始终让省略号在文字的下面*/
    overflow: hidden;
    font-weight: 900;
    font-size: 22px;
  }
  @keyframes dot { /*动态改变显示宽度, 但始终让总占据空间不变, 避免抖动*/
      0% { width: 0; margin-right: 1.5em; }
      33% { width: .5em; margin-right: 1em; }
      66% { width: 1em; margin-right: .5em; }
      100% { width: 1.5em; margin-right: 0;}
  }
  .setting-title{
    line-height: 24px;
    vertical-align: text-bottom;
    margin-left: 12px;
    font-size: 14px;
  }
  .font-size-11{
    font-size: 11px;
  }
  .onlyCH-one{
    width: 100%;
  }
  .onlyCH-one::after{
    display: none;
  }
  .onlyCH-two{
    display: none;
  }
  .tools i{
    font-size: 16px;
  }
  .tools div{
    margin: 10px 0px;
  }
  .tools i:hover{
    font-size: 20px;
    color: aquamarine;
  }
  .controller-area{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
</style>
