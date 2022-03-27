export function extend (target) {
  var sources = [].slice.call(arguments, 1)
  sources.forEach(source => {
    if (!source) return
    Object.getOwnPropertyNames(source).forEach(propName => {
      Object.defineProperties(target, propName, Object.getOwnPropertyDescriptors(source, propName))
    })
  })
  return target
}

export function deepCopy (obj) {
  var newObj = {}
  if (obj instanceof Array) {
    newObj = []
  }
  for (var key in obj) {
    var val = obj[key]
    newObj[key] = typeof val === 'object' ? deepCopy(val) : val
  }
  return newObj
}
