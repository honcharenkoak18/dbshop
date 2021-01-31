import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store/index'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    meta: { layout: 'main', role: 'public' },
    component: () => import('@/views/Home'),
  },
  {
    path: '/login',
    name: 'Login',
    meta: { layout: 'empty', role: 'public' },
    component: () => import('@/views/Login'),
  },
  {
    path: '/register',
    name: 'Register',
    meta: { layout: 'empty', role: 'public' },
    component: () => import('@/views/Register'),
  },
  {
    path: '/post',
    name: 'NewPost',
    meta: { layout: 'main', role: 'user' },
    component: () => import('@/views/Post'),
  },
  {
    path: '/post/:post_id',
    name: 'Update',
    meta: { layout: 'main', role: 'user' },
    component: () => import('@/views/Post'),
  },
  {
    path: '/post/read/:post_id',
    name: 'PostRead',
    meta: { layout: 'main', role: 'public' },
    component: () => import('@/views/PostRead'),
  },
  {
    path: '/profile',
    name: 'UpdateProfile',
    meta: { layout: 'main', role: 'user' },
    component: () => import('@/views/ProfileForm'),
  },
  {
    path: '/profile/:uuid',
    name: 'Profile',
    meta: { layout: 'main', role: 'public' },
    component: () => import('@/views/Profile'),
  },
]
/*
  /post
  /search
*/
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.role !== 'public') {
    const currentUser = store.state.auth.currentUser
    if (!currentUser) {
      store.commit('addMessage', {
        type: 'warning',
        message: 'Необхідно ввійти до DBSHOP',
      })
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
