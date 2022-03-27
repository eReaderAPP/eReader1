
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
      file.forEach(ele => {
        objectStore.add(ele)
      })
      transaction.oncomplete = (e) => {
        resolve(e)
      }
      transaction.onerror = (e) => {
        console.log('更新数据失败')
        reject(e)
      }
    })
  }

  update (key, data) {
    return new Promise((resolve, reject) => {
      let transaction = this.dbInstance.transaction(this.options.tableName)
      let objectStore = transaction.objectStore(this.options.tableName)
      var request = objectStore.get(key)
      request.onsuccess = (event) => {
        var objectStoreNew = this.dbInstance.transaction(this.options.tableName, 'readwrite').objectStore(this.options.tableName)
        if (event.target.result) {
          var requestNew = objectStoreNew.get(key)
          requestNew.onerror = function (event) {
            reject(event)
          }
          requestNew.onsuccess = function (event) {
            var old = event.target.result
            old = data
            var requestUpdate = objectStoreNew.put(old)
            requestUpdate.onerror = function (event) {
              reject(event)
            }
            requestUpdate.onsuccess = function (event) {
              resolve(event)
            }
          }
        } else {
          this.insert(data).then(() => {
            resolve()
          }).catch(() => {
            reject(new Error('插入新数据失败'))
          })
        }
      }
      request.onerror = function (err) {
        reject(err)
      }
    })
  }

  featch (key) {
    return new Promise((resolve, reject) => {
      let transaction = this.dbInstance.transaction(this.options.tableName)
      let objectStore = transaction.objectStore(this.options.tableName)
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
        resolve(event.target.result)
      }
      objectStore.getAll().onerror = (event) => {
        console.log('获取全部数据失败')
      }
    })
  }
}

export default DB
