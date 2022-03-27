import jsonp from 'jsonp'

export function get (url, options) {
  return new Promise((resolve, reject) => {
    jsonp(url, options, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}
