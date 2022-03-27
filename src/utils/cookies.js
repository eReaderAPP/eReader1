/* eslint-disable eqeqeq */
var cookiesUtility = {
}

/* 设置Cookie */
cookiesUtility.setCookies = function (name, value, option) {
  var _strCookie = name + '=' + escape(value) // 设置键/值对
  if (option) {
    // 是否设置时间:ps小时
    if (option.hour) {
      var _exdate = new Date()
      _exdate.setTime(_exdate.getTime() + option.hour * 60 * 60 * 1000)
      _strCookie += ';expires=' + _exdate.toGMTString() // 设置过期时间：ps小时为单位
    }
    if (option.path) {
      _strCookie += '; path=' + option.path // 设置访问路径
    }
    if (option.domain) {
      _strCookie += '; domain=' + option.domain // 设置访问域
    }
    if (option.secure) {
      _strCookie += '; secure' // 设置安全性
    }
  }
  document.cookie = _strCookie
}
/* 获取Cookie */
cookiesUtility.getCookies = function (name) {
  if (document.cookie.length > 0) {
    var _cookieVal = '; ' + document.cookie// 列如：ss=1;sss=2;s=3 为了防止取s时取到第一个ss的值
    var _startIndex = _cookieVal.indexOf('; ' + name + '=')
    if (_startIndex != -1) {
      _startIndex = _startIndex + name.length + 3
      var _endIndex = _cookieVal.indexOf(';', _startIndex)
      if (_endIndex == -1) {
        _endIndex = _cookieVal.length
      }
      return unescape(_cookieVal.substring(_startIndex, _endIndex))
    }
    return ''
  } else {
    return ''
  }
}

export default cookiesUtility
