export default {
  state: {
    posts: [], //{}
    filter: '',
  },
  mutations: {
    setPosts(state, posts) {
      if (posts.length !== 0) {
        posts.forEach(post => {
          post.date = new Date(post.date)
        })
      }
      state.posts = posts
    },
    clearPosts(state) {
      state.posts = []
    },
    addPost(state, post) {
      if (post) {
        post.date = new Date()
        state.posts.unshift(post)
      }
    },
    updatePost(state, newPost) {
      if (newPost && newPost.id) {
        state.posts = state.posts.map(post => {
          if ((post.id = newPost.id)) {
            post = { ...post, ...newPost }
          }
          return post
        })
      }
    },
    deletePost() {},
    setFilter(state, filter) {
      state.filter = filter
    },
    clearFilter(state) {
      state.filter = ''
    },
  },
  getters: {
    post: state => postId => {
      console.log('PostId from getters ', postId)
      console.log('Posts from getters', state.posts)
      return state.posts.find(post => {
        if (post.id === postId) {
          return post
        }
      })
    },
    isPostsEmpty(state) {
      return state.posts.length === 0
    },
  },
  actions: {
    async getPosts({ dispatch, commit, state }) {
      try {
        let posts
        if (state.filter === '') {
          posts = await dispatch('request', {
            url: '/api/post/',
            method: 'GET',
          })
        } else {
          posts = await dispatch('request', {
            url: `/api/post/search/${state.filter}`,
            method: 'GET',
          })
        }
        commit('setPosts', posts)
        return
      } catch (error) {
        console.log('getPosts error:', error)
        throw error
      }
    },

    async getPost({ dispatch }, postId) {
      try {
        const post = await dispatch('request', {
          url: `/api/post/${postId}`,
          method: 'GET',
        }) //{id, title, author, date, short, author_id, comments, content}
        if (Object.keys(post).length !== 0) {
          post.date = new Date(post.date)
        }
        return post
      } catch (error) {
        console.log('getPost error:', error)
        throw error
      }
    },

    async newPost({ dispatch }, { title, short, content }) {
      try {
        const response = await dispatch('request', {
          url: '/api/post',
          method: 'POST',
          body: { title, short, content },
          headers: {
            'Content-Type': 'application/json',
          },
        })
        return response
      } catch (error) {
        console.log('newPost error:', error)
        throw error
      }
    },

    async updatePost({ dispatch }, { id, title, short, content }) {
      try {
        const response = await dispatch('request', {
          url: `/api/post/${id}`,
          method: 'PUT',
          body: { title, short, content },
          headers: {
            'Content-Type': 'application/json',
          },
        })
        return response
      } catch (error) {
        console.log('updatePost error:', error)
        throw error
      }
    },

    async deletePost({ dispatch }, postId) {
      try {
        const result = await dispatch('request', {
          url: `/api/post/${postId}`,
          method: 'DELETE',
        })
        return result
      } catch (error) {
        console.log('getPost error:', error)
        throw error
      }
    },
  },
}
