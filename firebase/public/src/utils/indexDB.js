// export default{
//   // eslint-disable-next-line no-undef
//   indexedDB: window.indexedDB || window.webkitindexedDB || window.msIndexedDB || mozIndexedDB,
//   dbInstance: null,
//   openDB (options, version = 1) {
//     return new Promise(function (resolve, reject) {
//       console.log(options)
//       let db = indexedDB.open(options.databaseName, version)
//       db.onsuccess = function (e) {
//         this.dbInstance = db.result
//         resolve(db.result)
//       }
//       db.onerror = function (e) {
//         console.log('链接数据库失败')
//         reject(e)
//       }
//       // 如果打开数据库版本高于已存在版本或者是不存在这个数据库，则会通过这个事件进行回调
//       db.onupgradeneeded = e => {
//         var database = e.target.result
//         // eslint-disable-next-line no-unused-vars
//         var objectStore = database.createObjectStore(options.tableName, {
//           keyPath: options.keyPath
//         })
//         // 创建索引
//         options.indeList.forEach(element => {
//           objectStore.createIndex(element.name, element.name, {
//             unique: element.unique
//           })
//         })
//         // 事务完成回调
//         objectStore.transaction.oncomplete = function (e) {
//           // // 将数据保存到新创建的对象仓库
//           // var customerObjectStore = database.transaction('customers', 'readwrite').objectStore('customers')
//           // customerData.forEach(function (customer) {
//           //   customerObjectStore.add(customer)
//           // })
//           console.log('事务完成回调')
//         }
//       }
//     })
//   }
// }

class DB {
  indexedDB = window.indexedDB || window.webkitindexedDB || window.msIndexedDB
  dbInstance = null;
  constructor (options) {
    this.options = options
  }
  openDB (version = 1) {
    return new Promise((resolve, reject) => {
      let db = indexedDB.open(this.options.databaseName, version)
      db.onsuccess = (e) => {
        this.dbInstance = db.result
        console.log('链接数据库成功')
        resolve(db.result)
      }
      db.onerror = (e) => {
        console.log('链接数据库失败')
        reject(e)
      }
      // 如果打开数据库版本高于已存在版本或者是不存在这个数据库，则会通过这个事件进行回调
      db.onupgradeneeded = e => {
        var database = e.target.result
        // eslint-disable-next-line no-unused-vars
        var objectStore = database.createObjectStore(this.options.tableName, {
          keyPath: this.options.keyPath
        })
        // 创建索引
        if (this.options.indexList) {
          this.options.indexList.forEach(element => {
            objectStore.createIndex(element.name, element.name, {
              unique: element.unique
            })
          })
        }
      }
    })
  }

  insert (data) {
    return new Promise((resolve, reject) => {
      let transaction = this.dbInstance.transaction(this.options.tableName, 'readwrite')
      let file = Array.isArray(data) ? data : [data]
      let objectStore = transaction.objectStore(this.options.tableName)
      console.log(file)
      file.forEach(ele => {
        objectStore.add(ele)
      })
      transaction.oncomplete = (e) => {
        console.log('更新数据成功')
        resolve(e)
      }
      transaction.onerror = (e) => {
        console.log('更新数据失败')
        reject(e)
      }
    })
  }

  update (key, data) {
    var objectStore = this.dbInstance.transaction(this.options.tableName, 'readwrite').objectStore(this.options.tableName)
    var request = objectStore.get(key)
    request.onerror = function (event) {
      // 错误处理
    }
    request.onsuccess = function (event) {
      // 获取我们想要更新的数据
      var old = event.target.result

      // 更新你想修改的数据
      old = data

      // 把更新过的对象放回数据库
      var requestUpdate = objectStore.put(old)
      requestUpdate.onerror = function (event) {
        // 错误处理
      }
      requestUpdate.onsuccess = function (event) {
        console.log('更新数据库成功')
        // 完成，数据已更新！
      }
    }
  }

  featch (key) {
    return new Promise((resolve, reject) => {
      let transaction = this.dbInstance.transaction(this.options.tableName)
      let objectStore = transaction.objectStore(this.options.tableName)
      console.log(key)
      var request = objectStore.get(key)
      request.onerror = (e) => {
        reject(e)
      }
      request.onsuccess = e => {
        resolve(e.target.result)
      }
    })
  }

  featchAll () {
    return new Promise((resolve, reject) => {
      let transaction = this.dbInstance.transaction(this.options.tableName)
      let objectStore = transaction.objectStore(this.options.tableName)
      objectStore.getAll().onsuccess = (event) => {
        console.log(event.target.result)
        resolve(event.target.result)
      }
      objectStore.getAll().onerror = (event) => {
        console.log('获取全部数据失败')
      }
    })
  }
}

export default DB
