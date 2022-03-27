
export function getPageInfo () {
  /**
   * 获取页面信息，epub分页太慢了，手动计算页面信息
   */
  var rootDom = document.getElementsByTagName('iframe')[0]
  var windowWidth = document.querySelector('#base').clientWidth
  var currentPage = parseInt(rootDom.contentDocument.documentElement.scrollLeft / windowWidth) + 1
  return {
    currentPage: currentPage,
    totalPage: window.book.currentChapter.pages
  }
}
