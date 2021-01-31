r<template>
  <div class="post-read">
    <section class="row">
      <article class="col-md-12 p-2" id="post">
        <header>
          <div class="post-author">
            <router-link
              class="btn btn-link"
              :to="`/profile/${post.author_id}`"
            >
              {{ post.author }}
            </router-link>
          </div>
          <div class="post-date">{{ post.date | date('datetime') }}</div>
        </header>
        <h3 class="post-title">{{ post.title }}</h3>
        <div class="post-content border p-2 mb-2">{{ post.content }}</div>
        <footer
          class="pt-2"
          v-if="isLogin && currentUser.uuid === post.author_id"
        >
          <router-link class="btn btn-secondary" :to="`/post/${post.id}`"
            >Змінити</router-link
          >
          <button class="btn btn-danger" @click.prevent="deletePost">
            Видалити
          </button>
        </footer>
      </article>
    </section>
    <section class="mb-2 p-2 row" v-if="isLogin">
      <div class="col-md-12">
        <form id="comment">
          <input type="hidden" id="comment-id" v-model="commentId" />
          <div class="form-group">
            <label for="comment-input">Напишіть коментар</label>
            <textarea
              class="form-control"
              id="comment-input"
              rows="3"
              v-model="commentInput"
            ></textarea>
          </div>
          <button
            type="submit"
            class="btn btn-primary"
            @click.prevent="sendComment"
          >
            Записати
          </button>
        </form>
      </div>
    </section>
    <section>
      <Comment
        v-for="comment in comments"
        v-bind:comment="comment"
        :key="comment.id"
        @updatecomment="updateComment"
      />
    </section>
  </div>
</template>

<script>
import Comment from '../components/Comment'
export default {
  data: () => ({
    post: {},
    commentInput: '',
    commentId: '',
  }),
  computed: {
    isLogin() {
      return Boolean(this.$store.state.auth.currentUser)
    },
    currentUser() {
      return this.$store.state.auth.currentUser
    },
    postId() {
      return this.$route.params.post_id
    },
    comments() {
      return this.$store.state.comment.comments
    },
  },
  methods: {
    async deletePost() {
      const result = confirm('Ви впевнені, що хочете видалити цю статтю?')
      if (!result) {
        return
      }
      try {
        const affectedRows = await this.$store.dispatch(
          'deletePost',
          this.postId
        )
        if (affectedRows > 0) {
          this.$store.commit('addMessage', {
            type: 'info',
            message: 'Ви успішно видалили запис',
          })
        }
        this.$router.push('/')
      } catch (error) {
        this.$store.commit('addMessage', {
          type: 'danger',
          message: error.message,
        })
      }
    },
    async sendComment() {
      try {
        if (!this.isLogin) {
          throw new Error(
            'Тільки зареєстровані користувачі можуть коментувати.'
          )
        }
        if (this.commentId == '') {
          await this.$store.dispatch('newComment', {
            post_id: this.postId,
            content: this.commentInput,
          })
        } else {
          await this.$store.dispatch('updateComment', {
            id: this.commentId,
            content: this.commentInput,
          })
        }

        this.commentInput = ''
        this.commentId = ''
      } catch (error) {
        console.log('sendComment Error', error)
        this.$store.commit('addMessage', {
          type: 'danger',
          message: error.message,
        })
      }
    },
    updateComment(id) {
      this.commentId = id
      const comment = this.comments.find(comment => comment.id == id)
      this.commentInput = comment.content
    },
  },
  async mounted() {
    try {
      /**
       * @var post {id, title, author, date, short, author_id, comments, content}
       */
      const post = await this.$store.dispatch(
        'getPost',
        this.$route.params.post_id
      )
      this.post = post
      await this.$store.dispatch('getComments', this.$route.params.post_id)
    } catch (error) {
      this.$store.commit('addMessage', {
        type: 'danger',
        message: error.message,
      })
      console.log('PostRead mounted error: ', error)
    }
  },
  components: { Comment },
}
</script>

<style scoped>
#post header,
footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
section {
  border-bottom: 1px solid #ced4da;
}
#comment {
  padding-top: 64px;
}
.post-date {
  padding: 0.375rem 0.75rem;
}
</style>
