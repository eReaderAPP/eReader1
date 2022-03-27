/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */

import axios from 'axios'
import {getResult} from './yeezi_auth'
import Qs from 'qs'
import { message } from 'ant-design-vue'

import DB from '../indexDB/DB'
import transDB from '../indexDB/trans-db'

var iphost = 'http://web.yeekit.com'
var transURL = iphost + '/plugin/translate_v2'// 翻译接口
var $ = window.$

var dict = {}
var urlid = ''
var trans_request_iter = 0
var rewrite_request_iter = 0
var total_number_of_content = 0// 网页翻译,翻译字符长度计算

var transTotal = 0
var transCurrent = 0
/**
 *  翻译进度条
 *
 */
function changeProgress () {
  console.log(trans_request_iter, total_number_of_content, trans_request_iter / total_number_of_content)
  console.log(rewrite_request_iter, total_number_of_content, rewrite_request_iter / total_number_of_content)
}

/**
 * DOM遍历
 */
function walkTheDOM (node, func) {
  func(node)
  node = node.firstChild
  while (node) {
    walkTheDOM(node, func)
    node = node.nextSibling
  }
}

// **
//  * 翻译字符长度计算
//  */
function get_total_number_of_translation (body) {
  let nodeTotal = []
  let textTotal = []
  total_number_of_content = 0
  let translation_list = []
  let translation_node = []
  let list_iter = 0
  walkTheDOM(body, function (node) {
    if (node.nodeType === 3) { // Is it a Text node?
      var text = node.data.trim()
      var parent = node.parentNode
      var parent_parent = parent.parentNode
      if (parent.nodeName != 'SCRIPT' &&
          parent.nodeName != 'NOSCRIPT' &&
          parent.nodeName != 'STYLE' &&
          parent.nodeName != 'TEXTAREA' &&
          parent.nodeName != 'PRE' &&
          parent.nodeName != 'CODE' &&
          (parent_parent != null && parent_parent.nodeName != 'CODE')) {
        if (text.length > 0 && text.length < 5120) {
          total_number_of_content += 1
          try {
            translation_list[list_iter] = text
            translation_node[list_iter] = node
            list_iter += 1
          } catch (err) {
            console.log(err)
          }
        }
      }
    }
  })
  for (var i = 0; i < translation_list.length; i += 30) {
    nodeTotal.push(translation_node.slice(i, i + 30))
    textTotal.push(translation_list.slice(i, i + 30))
  }
  return [nodeTotal, textTotal, total_number_of_content]
}

export function transBegin (sourcelang, targetlang, body, book) {
  return new Promise((resolve, reject) => {
    let [nodeTotal, textTotal, total_number_of_content] = get_total_number_of_translation(body)
    let currentSpine = book.currentChapter.spinePos
    let bookName = book.metadata.bookTitle
    let dbKey = bookName + '@@' + currentSpine
    let db = new DB(transDB)
    db.openDB().then(res => {
      return db.featch(dbKey)
    }).then(res => {
      if (!res) {
        console.log('数据库没有该章节的翻译内容')
        if (textTotal.length && nodeTotal.length) {
          console.log(textTotal, nodeTotal)
          let promiseList = []
          textTotal.forEach((element, index) => {
            console.log(element, nodeTotal[index])
            promiseList.push(
              new Promise((resolve, reject) => {
                list_translation(sourcelang, targetlang, element).then(res => {
                  handlerResult(nodeTotal[index], res).then(res => {
                    resolve(res)
                  })
                })
              })
            )
          })
          Promise.all(promiseList).then(res => {
            console.log(res)
            let saveList = []
            res.forEach(element => {
              saveList.push(element)
            })
            db.update(dbKey, {
              bookName: dbKey,
              data: saveList
            }).then(() => {
              console.log('数据库都更新成功了')
              resolve()
            }).catch(err => {
              console.log(err)
              console.log('数据库更新失败了')
            })
          })
        } else {
          console.log('该章节没有翻译的内容')
          resolve()
        }
      } else {
        console.log('从缓存数据中拿取翻译内容   ' + ' 书名： ' + bookName + '  章节: ' + currentSpine)
        let saveData = res.data
        if (nodeTotal.length === saveData.length) {
          let promiseList = []
          saveData.forEach((element, index) => {
            promiseList.push(handlerResult(nodeTotal[index], element))
          })
          Promise.all(promiseList).then(() => {
            resolve()
          })
        }
      }
    })
  })
}

function list_translation (src, tgt, texts) {
  console.log('调用翻译')
  return new Promise((resolve, reject) => {
    var url = process.env.TRANS_API
    console.log('url::::', url)
    $.ajax({
      url: url,
      headers: {
        'access_token': getResult(),
        'user_id': ''
      },
      type: 'POST',
      dataType: 'json',
      async: false,
      traditional: true,
      data: {
        srcl: src,
        tgtl: tgt,
        word: texts
      },
      success: (data) => {
        // 如果翻译成功回显页面
        if (data.code === '1') {
          var translation_result = data.data
          resolve(translation_result)
        } else {
          reject(new Error('接口错误'))
        }
      }
    }).fail(function (e) {
      console.log(e)
      message.error('网络翻译接口错误')
      reject(new Error('接口错误'))
    })
  })
}

function handlerResult (nodes, translation_result) {
  return new Promise((resolve, reject) => {
    for (var i = 0; i < translation_result.length; i++) {
      var translation = translation_result[i]
      // console.log(i + ' | ' + translation)
      try {
        if (undefined !== nodes[i].data) {
          nodes[i].data = translation
        } else {
          nodes[i] = translation
        }
      } catch (e) {
        console.log(e)
        console.log('更新节点失败')
        console.log(nodes, i)
      }
    }
    resolve(translation_result)
  })
}
