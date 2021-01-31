import Vue from 'vue'
import Vuex from 'vuex'

import http from './http'
import auth from './auth'
import post from './post'
import comment from './comment'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    /* message - {type: "info" || "danger"}, message: "" */
    messages: [],
  },
  mutations: {
    addMessage(state, { type, message }) {
      state.messages.push({ type, message })
    },
    clearMessages(state) {
      state.messages = []
    },
  },
  actions: {},
  modules: {
    http,
    auth,
    post,
    comment,
  },
})
