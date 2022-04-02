/* eslint-disable new-cap */
/* eslint-disable no-new */
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import tools from './components/tools'
import axios from 'axios'
import {Result, Layout, Menu, Icon, Button, Spin, Card, Avatar, Row, Col, Upload, Progress, Drawer, Tooltip, Switch, List, Slider, Input, InputNumber, Radio, Modal, message} from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

import { getAuth, RecaptchaVerifier } from 'firebase/auth'

// Required for side-effects
import {getFirestore, doc, setDoc, getDocs, collection} from 'firebase/firestore'
let sess = {
  get: function (key) {
    return sessionStorage.getItem(key)
  },
  set: function (key, value) {
    return sessionStorage.setItem(key, value)
  }
}
Vue.prototype.session = sess
Vue.config.productionTip = false
Vue.prototype.isMobile = function () {
  return (/phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone|webOS|android/i.test(navigator.userAgent))
}
Vue.use(tools)
Vue.prototype.$http = axios
Vue.prototype.$confirm = Modal.confirm
Vue.prototype.getAuth = getAuth
Vue.prototype.RecaptchaVerifier = RecaptchaVerifier
Vue.use(Layout).use(Menu).use(Icon).use(Button).use(Spin).use(Card).use(Avatar).use(Row).use(Col).use(Upload).use(Progress).use(Drawer).use(Tooltip).use(Switch).use(List).use(Slider)
Vue.use(Input).use(InputNumber).use(Radio).use(Result).use(Modal)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDuFZqHUnK7ysozRRp_A-KhNCDkeTlPZ0s',
  authDomain: 'ereaderapp-64f52.firebaseapp.com',
  projectId: 'ereaderapp-64f52',
  storageBucket: 'ereaderapp-64f52.appspot.com',
  messagingSenderId: '390100825194',
  appId: '1:390100825194:web:c82ea1aa940cc052980613',
  measurementId: 'G-3BP6TBWMFL'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore()
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app)
Vue.prototype.app = app
Vue.prototype.db = db
Vue.prototype.$fs = {
  async set (table, key, data) {
    if (!table || !key) {
      return new Error('table and key botth required')
    }
    const cityRef = doc(db, table, key)
    try {
      await setDoc(cityRef, data, { merge: true })
    } catch (e) {
      console.log(e)
      message.error('upload fail')
    }
  },
  async get (table) {
    const querySnapshot = await getDocs(collection(db, table))
    console.log('got')
    console.log(querySnapshot)
    return querySnapshot
  }
}
// To apply the default browser preference instead of explicitly setting it.
// firebase.auth().useDeviceLanguage();
// test
