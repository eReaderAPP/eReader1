/* eslint-disable */
import DB from '../indexDB/DB'
import transDb from '../indexDB/trans-db';



function getCoverURL(book) {
  return new Promise((resolve,reject)=>{
    book.coverUrl().then(function (blobUrl) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function () {
            var recoveredBlob = xhr.response;
            var reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.readAsDataURL(recoveredBlob);
        };
        xhr.open('GET', blobUrl);
        xhr.send();
    });
  })
}

function getContentByPage(book,page,allPages){
  /**
   * 获取某页书籍的具体内容，返回值是包含DOM元素的数组
   */
  let bookTitle = book.contents.metadata.bookTitle
  
   let db = new DB(transDb)
   db.openDB().then(res=>{
     db.featch(bookTitle).then(res=>{
      console.log(res)
     }).catch(err=>{
       console.log(err)
     })
   })
  console.log(book)
  
  let result = []
  

  return result
}

function getContentByCfi(book,index,storage,toc){
  console.log('获取内容',arguments)
  let EPUBJS = window.EPUBJS
  return new Promise((resolve,reject)=>{
    let currentCFI = toc[index].cfi // 获取当前页面的cfi
    let beginDom = index ===1? null : (storage[index-1]?storage[index-1].endDom:false)
    beginDom = beginDom || document.getElementsByTagName('iframe')[0].contentDocument.body.firstElementChild.firstElementChild
    if(!currentCFI) {
      console.log('获取图书当前页面失败')
      throw new Error('获取图书当前页面失败')
    }else{
      var epubcfi = new EPUBJS.EpubCFI()
      var doc = book.renderer.doc
      var range = epubcfi.generateRangeFromCfi(currentCFI, doc) // 这里生成的就是startContainer==endContainer的range对象，它只包含了一个正文字符。
      if (range != null) {
        let endDom = range.endContainer
        storage[index] = {
          endDom:endDom
        }
        window.a = beginDom
        window.b=endDom
        let iframe = document.getElementsByTagName('iframe')[0]
        let bodyChildren = iframe.contentDocument.body.childNodes
        let length = bodyChildren.length
        let result = []
        let start = null
        let end = null
        let mark = false
        // for(let index = 0 ;index<length;index++){
        //   let childLength =bodyChildren[index].children.length
        //   if(childLength){
        //     for(let childIndex = 0;childIndex<childLength;childIndex++){
        //       if(bodyChildren[index].children[childIndex].contains){
        //         start = 
        //       }
        //     } 
        //   }

        //   if(bodyChildren[index].contains(beginDom)){
        //     start = index
        //   }
        //   if(bodyChildren[index].contains(endDom)){
        //     end = index
        //   }
        // }
        console.log(beginDom,endDom)
        // 优先遍历子元素
        for(let i = 0;i<bodyChildren.length;i++){
          // 如果是p标签就不往下查找
          // if(bodyChildren[i].nodeName === 'P'){
            
          //   if(mark){
          //     result.push(bodyChildren[i])
          //   }
          //   if(bodyChildren[i].contains(beginDom)){
          //     result.push(bodyChildren[i])
          //     mark = true
          //   }
          //   if(bodyChildren[i].contains(endDom)){
          //     mark = false
          //   }
          // }
          // else{
            if(bodyChildren[i].childNodes.length){
              for(let j = 0;j<bodyChildren[i].childNodes.length;j++){
                if(mark){
                  result.push(bodyChildren[i].childNodes[j])
                }
                if(bodyChildren[i].childNodes[j].contains(beginDom)){
                  result.push(bodyChildren[i].childNodes[j])
                  mark = true
                }
                if(bodyChildren[i].childNodes[j].contains(endDom)){
                  mark = false
                }
              }
            }
          // }
          // console.log(bodyChildren[i])
         
        }
        // 如果子元素遍历没匹配上，往上一级匹配
        // if(!mark && !result.length){
        //   for(let i = 0;i<bodyChildren.length;i++){
        //     if(mark){
        //       result.push(bodyChildren[i])
        //     }
        //     if(bodyChildren[i].contains(beginDom)){
        //       result.push(bodyChildren[i])
        //       mark = true
        //     }
        //     if(bodyChildren[i].contains(endDom)){
        //       mark = false
        //     }
        //   }
        // }
        console.log(result)
        resolve(result)
      }else{
        console.log('获取range失败')
        storage.push('')
      }
      
    }
  })
  
}

export {getCoverURL,getContentByCfi,getContentByPage}
