export default {
  state: {
    comments: [],
  },
  mutations: {
    setComments(state, comments) {
      if (comments.length !== 0) {
        comments.forEach(comment => {
          comment.comment_date = new Date(comment.comment_date)
        })
      }
      state.comments = comments
    },
    addComment(state, comment) {
      if (comment && comment.comment_date) {
        comment.comment_date = new Date(comment.comment_date)
      }
      state.comments.unshift(comment)
    },
    updateComment(state, { id, content }) {
      state.comments = state.comments.map(comment => {
        if (comment.id === id) {
          comment.content = content
        }
        return comment
      })
    },
    deleteComment(state, commentId) {
      state.comments = state.comments.filter(comment => comment.id != commentId)
    },
    clearComments(state) {
      state.comments = []
    },
  },
  actions: {
    /**
     *
     * @param { dispatch, commit } - доступ до  глобального об'єкта $store
     * @param payload postId - id поста, який переглядається
     * отримує від сервера пеелік коментарів до цього поста у вигляді масива
     * об'єктів { author_id:"dfa84eb0-43ea-4f19-86f0-f6675ef7d837"
     * comment_date:Sat Dec 19 2020 11:44:59 GMT+0200 (за східноєвропейським стандартним часом)
     * content:"рррррррррррррррррррррррррррр"
     * id:15
     * post_id:1
     * user_name:"Дмитро"
     * }
     *
     */
    async getComments({ dispatch, commit }, postId) {
      try {
        const comments = await dispatch('request', {
          url: `/api/comment/post/${postId}`,
          method: 'GET',
        })
        commit('setComments', comments)
        return
      } catch (error) {
        console.log('getComments error:', error)
        throw error
      }
    },

    async getComment({ dispatch }, commentId) {
      try {
        const comment = await dispatch('request', {
          url: `/api/comment/${commentId}`,
          method: 'GET',
        })
        return comment
      } catch (error) {
        console.log('getComment error:', error)
        throw error
      }
    },

    async newComment({ dispatch, commit }, { post_id, content }) {
      /*
        commentContent - { post_id, content}
      */
      try {
        const commentId = await dispatch('request', {
          url: '/api/comment',
          method: 'POST',
          body: { post_id, content },
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const comment = await dispatch('getComment', commentId)
        commit('addComment', comment)
        return
      } catch (error) {
        console.log('newComment error:', error)
        throw error
      }
    },
    /**
     *
     * @param {dispatch, commit} доступ до  глобального об'єкта $store
     * @param payload commentId id коментаря, якій видаляється
     * з сервера повертається affectedRows - кількість строк БД
     * які були видалені в БД
     */
    async deleteComment({ dispatch, commit }, commentId) {
      try {
        const result = await dispatch('request', {
          url: `/api/comment/${commentId}`,
          method: 'DELETE',
        })
        commit('deleteComment', commentId)
        return result
      } catch (error) {
        console.log('deleteComment error:', error)
        throw error
      }
    },
    /**
     *
     * @param {dispatch, commit} доступ до  глобального об'єкта $store
     * @param comment об'єкт {id,content} коментаря, якій змінюється
     * з сервера повертається true|false
     */
    async updateComment({ dispatch, commit }, { id, content }) {
      try {
        const result = await dispatch('request', {
          url: `/api/comment/${id}`,
          method: 'put',
          body: { id, content },
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (result) {
          commit('updateComment', { id, content })
        }
        return result
      } catch (error) {
        console.log('updateComment error:', error)
        throw error
      }
    },
  },
}
