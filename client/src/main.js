import Vue from 'vue'
import App from './App.vue'

import Vuelidate from 'vuelidate'
import VueLoading from 'vue-component-loading'

import router from './router'
import store from './store'

import dateFilter from '@/filters/date.filter'

import 'bootstrap/dist/js/bootstrap.min'

Vue.config.productionTip = false

Vue.filter('date', dateFilter)

Vue.use(Vuelidate)

const config = {
  progressBar: {
    color: '#366aa3',
    failedColor: '#F1B0B7',
    thickness: '6px',
    transition: {
      speed: '0.6s',
      opacity: '0.6s',
      termination: 300,
    },
  },
}

Vue.use(VueLoading, config)

async function init() {
  if (!localStorage.getItem('currentUser')) {
    store.commit('logout')
  } else {
    const uuid = JSON.parse(localStorage.getItem('currentUser'))
    try {
      const user = await store.dispatch('getUser', uuid)
      if (Object.keys(user).length !== 0) {
        store.commit('setCurrentUser', user)
      } else {
        console.log(`Користувач з uuid = ${uuid} не зареєстрований в програмі.`)
        store.commit('logout')
      }
    } catch (error) {
      console.log(error)
      store.commit('logout')
    }
  }
  new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount('#app')
}

init()
