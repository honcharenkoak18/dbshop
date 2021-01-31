<template>
  <div class="home">
    <div v-if="isEmpty" class="alert alert-info text-center mt-3" role="alert">
      Інформація відсутня
    </div>
    <Post v-for="post in posts" v-bind:post="post" :key="post.id" />
  </div>
</template>

<script>
import Post from '../components/Post'
export default {
  name: 'Home',
  data: () => ({}),
  computed: {
    isEmpty() {
      return this.$store.getters.isPostsEmpty
    },
    posts() {
      return this.$store.state.post.posts
    },
    filter() {
      return this.$store.state.post.filter
    },
  },
  async mounted() {
    try {
      await this.$store.dispatch('getPosts')
      return
    } catch (error) {
      this.$store.commit('addMessage', {
        type: 'danger',
        message: error.message,
      })
      console.log('Home mounted error:', error)
      throw error
    }
  },
  components: { Post },
}
</script>
<style scoped></style>
