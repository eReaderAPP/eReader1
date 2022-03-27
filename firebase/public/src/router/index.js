import Vue from 'vue'
import Router from 'vue-router'
import BookList from '@/views/BookList'
import Book from '@/views/Book'
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
            label: 'Chapter'
          }, {
            key: 'setting',
            icon: 'setting',
            label: 'Setting'
          }
        ]
      }
    }
  ]
})

export default router
