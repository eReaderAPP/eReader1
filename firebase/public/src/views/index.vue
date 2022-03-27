<template>
    <div style="height: 100%;">
      <div class="header">
        <input type="file" id="book" @change = 'fileInput' ref="book">
      </div>
      <div class="container" style="height: 100%;">
        <div id="area" ref="container" style="height: 80%;"></div>
        <div >
          <button id="pre" ref="pre" @click="prevPage">上一页</button>
          <button id="next" ref="next" @click="nextPage">下一页</button>
          <!-- <button id="trans" ref="trans" @click="transPage">翻译</button> -->
        </div>
        <!-- <pdf
      ref="pdf"
      v-for="i in numPages"
      :key="i"
      :src="url"
      :page="i"
      v-if="url"
      ></pdf> -->

      </div>
    </div>
</template>
<script>
// eslint-disable-next-line no-unused-vars
import Translation from '@/utils/translation.js'
// import Translator from '@/utils/Translator.js'
// eslint-disable-next-line no-unused-vars
import DB from '@/indexDB/DB.js'
// eslint-disable-next-line no-unused-vars
import booksDB from '@/indexDB/books-db.js'
// eslint-disable-next-line no-unused-vars
import {getCoverURL} from '@/utils/bookUtils.js'
// eslint-disable-next-line no-unused-vars
import pdf from 'vue-pdf'
// import {transBegin} from '@/utils/yeezi.js'
// eslint-disable-next-line no-unused-vars
const ePub = window.ePub
export default {
  components: {
    pdf
  },
  data () {
    return {
      url: '',
      numPages: null,
      book: null
    }
  },
  methods: {
    fileInput (e) {
      // epub 文件
      console.log(e)
      let file = e.target.files[0]
      var fileReader = new FileReader()
      fileReader.readAsArrayBuffer(file)
      fileReader.onload = (e) => {
        let content = e.target.result
        console.log('文件加载成功')
        console.log(content)
        let book = ePub({
          bookPath: content,
          restore: false
        })
        this.book = book
        book.renderTo('area').then(res => {
          console.log('图书渲染成')
        })
      }
    },
    nextPage () {
      this.book.nextPage()
    },
    prevPage () {
      this.book.prevPage()
    }
    // transPage () {
    //   console.log('开始翻译')
    //   transBegin('en', 'zh')
    // }
    // fileInput (e) {
    //   console.log(e)
    //   let file = e.target.files[0]
    //   this.url = this.getObjectURL(file)
    //   this.getNumPages()
    // },
    // getObjectURL (file) {
    //   var url = null
    //   if (window.createObjcectURL !== undefined) {
    //     url = window.createOjcectURL(file)
    //   } else if (window.URL !== undefined) {
    //     url = window.URL.createObjectURL(file)
    //   } else if (window.webkitURL !== undefined) {
    //     url = window.webkitURL.createObjectURL(file)
    //   }
    //   return url
    // },
    // getNumPages () {
    //   let loadingTask = pdf.createLoadingTask(this.url)
    //   console.log(loadingTask)
    //   loadingTask.promise.then(pdf => {
    //     this.numPages = pdf.numPages
    //   }).catch(err => {
    //     console.error('pdf 加载失败', err)
    //   })
    // }
  }

}

</script>

<style>
    .header{
        height: 50px;
        background-color: beige;
        width: 100%;
    }
</style>
