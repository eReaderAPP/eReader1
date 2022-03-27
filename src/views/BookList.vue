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
                <template slot="actions" class="ant-card-actions">
                  <a-icon key="delete" type="delete" @click.stop="removeBook(item)"/>
                  <a-icon key="setting" type="setting" @click.stop="commingSoon" />
                </template>
                <a-card-meta :description="item.author || 'Unknown Author'" :title="item.bookName" class="author-area">
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
          <div class="blankText"><p>Your bookshelf is empty</p><p> please click the button to upload books</p></div>
            <a-button type="primary" @click="uploadFile" class="no-book-btn">
              Upload Now
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
      refresh: true,
      confireRemove: false
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
    commingSoon () {
      message.info('Coming soon!')
    },
    removeBook (item) {
      console.log('remove Book')
      console.log(item)
      let self = this
      this.$confirm({
        title: 'Do you want to delete this item?',
        content: 'When clicked the OK button, Books will be deleted and all relevant records will be deleted',
        onOk () {
          return new Promise((resolve, reject) => {
            console.log('remove', item)
            let db = new DB(booksDb)
            db.openDB().then(() => {
              return db.delete(item.bookName)
            }).then(res => {
              resolve(res)
              message.success('Remove Success！')
              setTimeout(() => {
                self.getBookFromDB()
              }, 1000)
            }).catch(err => {
              reject(err)
              message.error('Remove Fail!')
            })
          }).catch(() => message.error('Oops errors!'))
        },
        onCancel () {}
      })
    },
    settintBook (item) {
      console.log('setting Book')
      console.log('item')
    },
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
        message.info('Please select a file. Multi file upload is not supported for the time being')
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
            console.log('File loaded successfully')
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
                  console.log('The book already exists. Please confirm whether to update the book')
                  message.info('Book already exists')
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
              console.log('Upload Book succeeded')
            })
          }
        } else {
          this.$emit('closeLoading')
          message.info('Only supported for the time being EPub format file')
        }
      }
    },
    getBookFromDB () {
      let db = new DB(booksDb)
      db.openDB().then(() => {
        return db.featchAll()
      }).then(data => {
        this.$emit('closeLoading')
        this.books = []
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
