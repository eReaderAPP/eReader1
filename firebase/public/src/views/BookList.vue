<template>

        <!-- 有图书展示图书列表 -->

        <div v-if="books.length !== 0 && refresh">
          <a-row :gutter="[16,8]" type="flex" justify="start">
            <a-col :xs="12" :sm="12" :md="8" :lg="6" :xl="4"  v-for="(item,index) in books" :key="index" class="card-div">
              <a-card hoverable @click="goDetail(item)">
                <img
                  slot="cover"
                  alt="example"
                  :src="item.cover"
                  style="width: 100%"
                />
                <a-card-meta :description="item.author || '未知作者'" :title="item.bookName" class="author-area">
                  <!-- <a-avatar
                    slot="avatar"
                    src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                  /> -->
                </a-card-meta>
              </a-card>
            </a-col>
          </a-row>
          <input type="file" ref="inputdiv" style="display: none;" @change="fileUpLoad">
        </div>

        <!-- 没有图书 -->
        <div v-else class="blank">

          <input type="file" ref="inputdiv" style="display: none;" @change="fileUpLoad">
          <img src="../assets/noBook.png" alt="">
          <div class="blankText">您还没有书籍，请从本地导入书籍进行阅读</div>
            <a-button type="primary" @click="uploadFile" class="no-book-btn">
              立即上传
            </a-button>
        </div>
</template>
<script>
import booksDb from '@/indexDB/books-db.js'
import {getCoverURL} from '@/utils/bookUtils.js'
import { message } from 'ant-design-vue'
import DB from '@/indexDB/DB.js'
export default {
  data () {
    return {
      collapsed: true,
      books: [],
      menuKey: ['1'],
      refresh: true
    }
  },
  created () {
  },
  mounted () {
    if (this.$route.meta && this.$route.meta.nav) {
      console.log('set Nav', this.$route.meta.nav)
      this.$emit('changeHeader', this.$route.meta.nav)
    }
    this.getBookFromDB()
  },
  methods: {
    uploadFile () {
      this.$refs.inputdiv.click()
    },
    onCollapse () {
      console.log('onCollapse')
    },
    onBreakpoint () {
      console.log('onBreakpoint')
    },
    fileUpLoad (event) {
      let res = event.target.files
      if (res.length > 1) {
        message.info('请选择一个文件，暂时不支持多文件上传')
      } else if (res.length === 1) {
        res = res[0]
        console.log(res)
        this.$emit('showLoading')
        let db = new DB(booksDb)
        console.log(res, res.name, res.type)
        if (res.name && res.name.includes('epub')) {
          let ePub = window.ePub
          var fileReader = new FileReader()
          fileReader.readAsArrayBuffer(res)
          fileReader.onload = e => {
            let content = e.target.result
            console.log('文件加载成功')
            console.log(content)
            let book = ePub({
              bookPath: content,
              restore: false
            })
            console.log(book)
            window.book = book
            let dbPromise = db.openDB() // 链接数据库
            let bookPromise = book.getMetadata() // 获取书籍信息
            let coverPromise = getCoverURL(book) // 获取图书封面
            Promise.all([dbPromise, bookPromise, coverPromise]).then(res => {
              let metaData = res[1]
              let cover = res[2]
              db.featch(metaData.bookTitle).then(res => {
                if (res) {
                  console.log('图书已存在，请确认是否更新图书')
                  message.info('图书已存在')
                } else {
                  return db.update(metaData.bookTitle, {
                    author: metaData.creator,
                    bookName: metaData.bookTitle,
                    cover: cover,
                    content: content
                  })
                }
              })
            }).then(res => {
              setTimeout(() => {
                this.getBookFromDB()
              }, 1000)
              console.log('上传图书成功')
            })
          }
        } else {
          this.$emit('closeLoading')
          message.info('暂时只支持.epub格式文件')
        }
      }
    },
    getBookFromDB () {
      let db = new DB(booksDb)
      db.openDB().then(() => {
        return db.featchAll()
      }).then(data => {
        this.$emit('closeLoading')
        console.log(data)
        if (data) {
          data.forEach((ele, index) => {
            this.$set(this.books, index, ele)
          })
        }
      })
    },
    goDetail (item) {
      if (item && item.bookName) {
        this.$router.push({
          path: '/book',
          query: {
            bookName: item.bookName
          }
        })
      }
    },
    menuClick ({item, key, keyPath}) {
      console.log(item, key, keyPath)
      if (key !== this.menuKey[0] && key !== '1') {
        this.books = []
      } else if (key !== this.menuKey[0] && key === '1') {
        this.getBookFromDB()
      }
      this.menuKey = [key]
    }
  }
}
</script>
<style lang="less" scoped>
  @import url('../less/index.less');
  .main-content{
    margin: 24px 16px;
    padding: 24px;
    min-height: 280px;
    background-color: white;
    overflow-y: scroll;

  }
  /* #components-layout-demo-custom-trigger{
    height: 100%;
  } */
#components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}
.blank{
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
}
.blank img{
  height: 200px;
}
.blank .blankText{
  width: 100%;
}
.logo-text{
  font-weight: bold;
  vertical-align: middle;
  line-height: 32px;
}
.input-area{
  text-align: right;
  margin-right: 30px;
}
.author-area{
  overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.ant-card-body{
  padding: 10px !important;
}
.card-div{
  padding: 4px 8px;
    border: 10px solid transparent;
    margin-top: 5px;
}
.card-div>div{

  box-shadow: black 8px 11px 15px -11px;
}

.no-book-btn{
  background-color: rgb(0,21,41);
    border: none;
    width: 200px;
    height: 50px;
}
</style>
