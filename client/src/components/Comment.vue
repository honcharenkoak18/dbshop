<template>
  <section class="row border-bottom">
    <article class="col-md-12 p-2">
      <header>
        <div class="post-author">{{ comment.user_name }}</div>
        <div class="post-date">{{ comment.comment_date | date('date') }}</div>
      </header>
      <div class="content border p-2">{{ comment.content }}</div>
      <footer
        class="pt-2"
        v-if="isLogin && currentUser.uuid === comment.author_id"
      >
        <a class="btn btn-secondary" href="#comment" @click="editComment()"
          >Змінити</a
        >
        <button class="btn btn-danger" @click="deleteComment()">
          Видалити
        </button>
      </footer>
    </article>
  </section>
</template>

<script>
export default {
  name: 'Comment',
  props: ['comment'],
  /**
    author_id:"dfa84eb0-43ea-4f19-86f0-f6675ef7d837"
    comment_date:Sun Dec 13 2020 19:35:59 GMT+0200 (за східноєвропейським стандартним часом)
    content:"sadfreatr rtrvrfrcrtyjfx"
    id:3
    post_id:1
    user_name:"Дмитро"
  */ computed: {
    isLogin() {
      return Boolean(this.$store.state.auth.currentUser)
    },
    currentUser() {
      return this.$store.state.auth.currentUser
    },
  },
  methods: {
    async deleteComment() {
      const result = confirm('Ви впевнені, що хочете видалити цей коментар?')
      if (!result) {
        return
      }
      try {
        const affectedRows = await this.$store.dispatch(
          'deleteComment',
          this.comment.id
        )
        if (affectedRows > 0) {
          this.$store.commit('addMessage', {
            type: 'info',
            message: 'Ви успішно видалили запис',
          })
        }
      } catch (error) {
        this.$store.commit('addMessage', {
          type: 'danger',
          message: error.message,
        })
      }
    },
    editComment() {
      this.$emit('updatecomment', this.comment.id)
    },
  },
}
</script>

<style scoped>
header,
footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
