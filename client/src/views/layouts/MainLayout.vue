<template>
  <div class="main">
    <Navbar @logout="logout" @setFilter="setFilter" />
    <main class="container main-layout">
      <router-view />
    </main>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar'
export default {
  name: 'MainLayout',
  computed: {},
  components: { Navbar },
  methods: {
    async logout() {
      this.$store.dispatch('logout')

      if (this.$route.path !== '/') {
        await this.$router.push('/')
      }
    },
    async setFilter(searchStr) {
      this.$store.commit('setFilter', searchStr)
      await this.$store.dispatch('getPosts')
      if (this.$route.path !== '/') {
        await this.$router.push('/')
      }
    },
  },
}
</script>
<style scoped></style>
