<template>
  <nav class="navbar navbar-expand-lg fixed-top bg-light border-bottom">
    <div class="container">
      <router-link to="/" title="Домашня сторінка" class="navbar-brand"
        >DB SHOP</router-link
      >
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto mb-2 mb-lg-0">
          <li v-if="isLogin" class="nav-item">
            <router-link class="nav-link active" aria-current="page" to="/post"
              ><i class="fas fa-edit"></i> Новий пост</router-link
            >
          </li>
          <li v-if="isLogin" class="nav-item">
            <router-link class="nav-link" aria-current="page" to="/profile">
              <i class="far fa-id-card"></i> Профіль користувача
            </router-link>
          </li>
        </ul>
        <form class="form-inline my-2 my-lg-0 mr-2" @submit.prevent="setFilter">
          <input
            class="form-control mr-sm-2"
            type="search"
            placeholder="Пошук"
            aria-label="Пошук"
            v-model.trim.lazy="searchStr"
          />
          <button
            class="btn btn btn-outline-primary my-2 my-sm-0"
            type="submit"
          >
            <i class="fas fa-search"></i> Пошук
          </button>
        </form>
        <button
          class="btn d-flex btn btn-outline-primary"
          v-if="isLogin"
          @click.prevent="$emit('logout')"
          title="Вийти"
        >
          <img
            :src="avatarUri"
            width="24px"
            height="24px"
            alt="аватар"
            v-if="hasAvatar"
            class="mr-1"
          />
          {{ userName }}
        </button>
        <router-link
          class="btn d-flex btn btn-outline-primary"
          to="/login"
          v-else
          ><i class="fas fa-key fa-fw"></i> Ввійти</router-link
        >
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  data: () => ({
    searchStr: '',
  }),
  computed: {
    currentUser() {
      return this.$store.state.auth.currentUser
    },
    hasAvatar() {
      return !!this.currentUser.avatar
    },
    avatarUri() {
      if (this.hasAvatar) {
        return (
          'data:image/png;base64,' +
          Buffer.from(this.currentUser.avatar.data).toString('base64')
        )
      } else {
        return ''
      }
    },
    isLogin() {
      return Boolean(this.$store.state.auth.currentUser)
    },
    userName() {
      if (this.$store.state.auth.currentUser) {
        return this.$store.state.auth.currentUser.user_name
      }
      return ''
    },
  },
  methods: {
    setFilter() {
      this.$emit('setFilter', this.searchStr)
    },
  },
}
</script>

<style></style>
