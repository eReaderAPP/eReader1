/** *  获取epub书籍的内容封面等信息  ***/
getEpubInfo : (path, callback) => {
  let result = {error_no: 0}
  let epub = new EPub(path)
  epub.on('error', async function (error) {
    console.log(error)
  })
  epub.on('end', async function () {
    function findChapter (chapterId) {
      return new Promise((resolve) => {
        epub.getChapter(chapterId, (error, text) => {
          if (error) {
            throw error
          }
          resolve(text)
        })
      })
    }
    function findCover (coverId) {
      return new Promise((resolve) => {
        epub.getImage(coverId, (error, buf) => {
          if (error) {
            throw error
          }
          resolve(buf)
        })
      })
    }
    try {
      if (epub.flow && epub.flow.length > 0) {
        let str = ''
        for (let i = 0; i < epub.flow.length; i++) {
          let chapter = epub.flow[i]
          if (chapter.id.indexOf('cover') !== -1 || chapter.title === '封面' || chapter.title === '目录' ||
              chapter.title === 'cover' || chapter.title === 'menu') {
            continue
          }
          let cont = await findChapter(chapter.id)
          cont += '\n'
          str += cont.replace(/<\/?.+?>/g, '')
        }
        let buffer = Buffer.from(str)
        str = null
        let content = []
        if (buffer) {
          // utools数据库附件大小限制10m，若过大则拆分成多个
          for (let i = 0; i < Math.ceil(buffer.length / 9500000); i++) {
            if (i === Math.ceil(buffer.length / 9500000) - 1) {
              // 最后一次循环
              let tmpBuffer = new Buffer(buffer.length - (Math.ceil(buffer.length / 9500000) - 1) * 9500000)
              buffer.copy(tmpBuffer, 0, i * 9500000, buffer.length)
              content.push(tmpBuffer)
            } else {
              let tmpBuffer = new Buffer(9500000)
              buffer.copy(tmpBuffer, 0, i * 9500000, (i + 1) * 9500000)
              content.push(tmpBuffer)
            }
          }
        }
        buffer = null
        result.content = content
        if (epub.metadata && epub.metadata.cover) {
          let image = await findCover(epub.metadata.cover)
          result.cover = image
        }
        result.error_info = '解析成功'
      } else {
        result.error_no = 1
        result.error_info = '解析epub内容失败'
      }
    } catch (err) {
      console.log(err)
      result.error_no = 999
      result.error_info = err
    }
    callback(result)
  })
  epub.parse()
}

book.on('renderer:locationChanged', locationCfi => {
  console.log(locationCfi)
})
book.getToc().then(function (toc) {
  console.log(toc)
})
book.generatePagination().then(function (toc) {
  console.log('Pagination generated')
  console.log(toc)
})
book.on('renderer:chapterDisplayed', function (res) {
  console.log('chapterChange')
  console.log(res)
})
book.on('book:pageChanged', function (location) {
  console.log(location.anchorPage, location.pageRange)
})
book.on('renderer:chapterDisplayed', (e) => {
  console.log('chapterDisplayer')
  console.log(e)
})


<template>
  <div>
    <a-spin size="small" />
    <a-spin />
  </div>
</template>
