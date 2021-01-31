export default {
  state: {
    loading: false,
  },
  mutations: {
    setLoading(state, loading) {
      state.loading = loading
    },
  },
  actions: {
    async request(
      { commit },
      { url, method = 'GET', body = null, headers = {} }
    ) {
      // const url = options.url;
      // const method = options.method || "GET";
      // const body = options.body || null;
      // const headers = options.headers || {};
      commit('setLoading', false)
      try {
        if (
          body &&
          headers['Content-Type'] &&
          headers['Content-Type'] == 'application/json'
        ) {
          body = JSON.stringify(body)
        }
        if (this.state.auth.currentUser) {
          headers.Authorization = 'Bearer ' + this.state.auth.currentUser.uuid
        }
        const response = await fetch(url, { method, body, headers })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Виникла якась помилка!')
        }
        commit('setLoading', false)
        return data
      } catch (error) {
        commit('setLoading', false)
        throw error
      }
    },
  },
}
