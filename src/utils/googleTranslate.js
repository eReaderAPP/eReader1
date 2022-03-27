import cookiesUtility from './cookies.js'
export function hackTrans () {
  // let googleTrans = window.googleTrans || undefined
  console.log('google Translate Loaded...')
  let cookies = cookiesUtility.getCookies('googtrans')
  if (!cookies) {
    cookiesUtility.setCookies('googtrans', '/en/zh-CN')
  }
  console.log('google Translate Hided...')
  let timmer = setInterval(() => {
    console.log('in')
    var box1 = document.querySelector('body > div:nth-child(1)')
    var box2 = document.querySelector('#google_translate_element')
    if (box1 && box2) {
      if (box1.style.display === 'none' && box2.style.display === 'none') {
        console.log('stop')
        clearInterval(timmer)
      } else {
        box1.style.display = 'none'
        box2.style.display = 'none'
        document.body.style.top = '0px'
        console.log('set')
      }
    }
    // if(box1.childNodes[0].contentDocument.body.innerHTML.includes(''))
    // console.log(box1)
  }, 500)
}
