import Vue from 'vue'
import Router from 'vue-router'
import BookList from '@/views/BookList'
import Book from '@/views/Book'
import About from '@/views/About'
import Help from '@/views/Help'
Vue.use(Router)
let router = new Router({
  routes: [
    {
      path: '/',
      name: 'BookList',
      redirect: '/booklist'
    }, {
      path: '/booklist',
      name: 'BookList',
      component: BookList,
      meta: {
        nav: [
          {
            key: 'menu',
            icon: 'exclamation-circle',
            label: 'Menu'
          }, {
            key: 'open',
            icon: 'upload',
            label: 'Open'
          }, {
            key: 'cloud',
            icon: 'cloud',
            label: 'Upload'
          }, {
            key: 'option',
            icon: 'setting',
            label: 'Options'
          }
        ]
      }
    }, {
      path: '/book',
      name: 'Book',
      component: Book,
      meta: {
        nav: [
          {
            key: 'menu',
            icon: 'exclamation-circle',
            label: 'Menu'
          }, {
            key: 'chapter',
            icon: 'ordered-list',
            label: 'Contents'
          }, {
            key: 'setting',
            icon: 'setting',
            label: 'Setting'
          }
        ]
      }
    }, {
      path: '/about',
      name: 'about',
      component: About,
      meta: {
        nav: [
          {
            key: 'menu',
            icon: 'exclamation-circle',
            label: 'Menu'
          }, {
            key: 'open',
            icon: 'upload',
            label: 'Open'
          }, {
            key: 'cloud',
            icon: 'cloud',
            label: 'Upload'
          }, {
            key: 'option',
            icon: 'setting',
            label: 'Options'
          }
        ]
      }
    }, {
      path: '/help',
      name: 'help',
      component: Help,
      meta: {
        nav: [
          {
            key: 'menu',
            icon: 'exclamation-circle',
            label: 'Menu'
          }, {
            key: 'open',
            icon: 'upload',
            label: 'Open'
          }, {
            key: 'cloud',
            icon: 'cloud',
            label: 'Upload'
          }, {
            key: 'option',
            icon: 'setting',
            label: 'Options'
          }
        ]
      }
    }
  ]
})

export default router
