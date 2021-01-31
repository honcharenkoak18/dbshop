<template>
  <div id="profile">
    <h2>Профіль користувача uuid {{ profile.uuid }}</h2>
    <p>Ім'я користувача: {{ profile.userName }}</p>
    <p>Опис користувача: {{ profile.description }}</p>
    <img
      :src="avatarUri"
      width="256px"
      height="256px"
      alt="аватар"
      v-if="hasAvatar"
    />
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      profile: {
        uuid: '',
        description: '',
        userName: '',
        avatar: null,
      },
    }
  },
  computed: {
    currentUserId() {
      return this.$route.params.uuid
    },
    hasAvatar() {
      return !!this.profile.avatar
    },
    avatarUri() {
      if (this.hasAvatar) {
        return (
          'data:image/png;base64,' +
          Buffer.from(this.profile.avatar.data).toString('base64')
        )
      } else {
        return ''
      }
    },
  },
  async mounted() {
    try {
      const profile = await this.$store.dispatch(
        'getProfile',
        this.currentUserId
      )
      this.profile = profile
      //console.log(Buffer.from(this.profile.avatar.data).toString('base64'))
    } catch (error) {
      this.$store.commit('addMessage', {
        type: 'danger',
        message: error.message,
      })
      console.log('profile mounted error: ', error)
    }
  },
}
</script>

<style></style>
