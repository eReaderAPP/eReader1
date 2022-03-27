class Translation {
  constructor (rendition) {
    this.rendition = rendition
    this.textArray = []
  }
  getContents () {
    console.log(this.rendition)
    window.test = this.rendition
    let contents = this.rendition.getContents()[0]
    console.log(contents, contents.content.childNodes)
    this.getTextNode(contents.content.childNodes)

    console.log(this.textArray)
  }
  getTextNode (arr) {
    const self = this
    if (arr.length && !Array.isArray(arr)) {
      new Array(0).forEach.call(arr, (ele) => {
        if (ele.innerText) {
          // ele.innerText = ele.innerText.replace(/o/g, 'z')
          // ele.innerText = ele.innerText.replace(/m/g, 'z')
          ele.innerText = 'sss'
        }
        if (ele.childNodes) {
          self.getTextNode(ele.childNodes)
        }
      })
    }
  }
}

var _default = Translation
export default _default
