import {extend} from './core.js'
// import axios from 'axios'
import { get } from './request.js'
import { message } from 'ant-design-vue'

let md5 = require('js-md5')
class Translator {
  // 初始化设置
  constructor (opt) {
    this.setting = extend(this.setting || {
      q: 'hello', // 查询单词
      from: 'auto', // 起始语种
      to: 'zh', // 目标语种
      appid: '20220210001079188', // appid
      salt: '1435660288', // 随机数
      key: 'A2JB_f19b_J6a08zsAh3' // 开发密钥
    }, opt)
  }

  // 生成请求
  generateRequest (str) {
    // TODO 字符数限制
    var from = this.setting.from
    var to = this.setting.to
    var appid = this.setting.appid
    var salt = this.setting.salt
    var key = this.setting.key
    var tempStr = appid + str + salt + key
    var random = md5(tempStr)
    var URL = `http://api.fanyi.baidu.com/api/trans/vip/translate/baidu?q=${encodeURIComponent(str)}&from=${from}&to=${to}&appid=${appid}&salt=${salt}&sign=${encodeURIComponent(random)}`
    return URL
  }

  // 开始翻译
  trans (params) {
    var URL = this.generateRequest(params)
    console.log(URL)
    return new Promise((resolve, reject) => {
      get(URL).then(res => {
        let result = this.handlerTransResult(res)
        resolve(result)
      }).catch(
        error => {
          console.log(error)
          this.error('翻译接口调用失败')
          reject(error)
        })
    })
  }

  // 接口处理函数
  handlerTransResult (res) {
    if (!res.trans_result) this.error('接口请求失败')
    else {
      return res.trans_result
    }
  }

  // 异常log函数
  error (msg) {
    const hide = message.error(msg, 0)
    setTimeout(hide, 2500)
  }

  // 字数限制
}

var _default = Translator
export default _default
