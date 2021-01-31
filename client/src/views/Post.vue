<template>
  <div class="row">
    <h2>Post form</h2>
    <form style="width: 100%;" @submit.prevent="submitHandler">
      <input type="hidden" name="post-id" v-model="postId" />
      <div class="form-group">
        <label for="post-title">Заголовок</label>
        <input
          type="text"
          class="form-control"
          id="post-title"
          v-model.trim="post.title"
          :class="{
            'is-invalid': this.$v.post.title.$error,
            'is-valid': this.$v.post.title.$dirty && !this.$v.post.title.$error,
          }"
          @blur="$v.post.title.$touch()"
        />
        <div
          id="title-required"
          class="form-text text-danger"
          v-if="this.$v.post.title.$dirty && !this.$v.post.title.required"
        >
          <small>Введіть заголовок</small>
        </div>
      </div>
      <div class="form-group">
        <label for="post-short">Про що?</label>
        <textarea
          class="form-control"
          id="post-short"
          rows="2"
          v-model.trim="post.short"
          :class="{
            'is-invalid': this.$v.post.short.$error,
            'is-valid': this.$v.post.short.$dirty && !this.$v.post.short.$error,
          }"
          @blur="$v.post.short.$touch()"
        ></textarea>
        <div
          id="short-required"
          class="form-text text-danger"
          v-if="this.$v.post.short.$dirty && !this.$v.post.short.required"
        >
          <small>Введіть короткий зміст</small>
        </div>
      </div>
      <div class="form-group">
        <label for="post-content">Зміст</label>
        <textarea
          class="form-control"
          id="post-content"
          rows="5"
          v-model.trim="post.content"
          :class="{
            'is-invalid': this.$v.post.content.$error,
            'is-valid':
              this.$v.post.content.$dirty && !this.$v.post.content.$error,
          }"
          @blur="$v.post.content.$touch()"
        ></textarea>
        <div
          id="content-required"
          class="form-text text-danger"
          v-if="this.$v.post.content.$dirty && !this.$v.post.content.required"
        >
          <small>Введіть текст статті</small>
        </div>
      </div>
      <div class="form-group">
        <button class="btn btn-outline-primary" type="submit">Записати</button>
      </div>
    </form>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
export default {
  name: 'Post',
  data: () => ({
    post: {
      title: '',
      short: '',
      content: '',
    },
    postId: '',
  }),
  validations: {
    post: {
      title: { required },
      short: { required },
      content: { required },
    },
  },
  async mounted() {
    try {
      if (this.$route.params.post_id) {
        this.postId = this.$route.params.post_id
        const {
          title,
          short,
          /*author_id,*/ content,
        } = await this.$store.dispatch('getPost', this.postId)
        this.post = { title, short, content }
      } else {
        this.postId = ''
      }
    } catch (error) {
      this.$store.commit('addMessage', {
        type: 'danger',
        message: error.message,
      })
      console.log('Post mounted error: ', error)
      this.$router.push('/')
    }
  },
  methods: {
    async submitHandler() {
      this.$store.commit('clearMessages')
      this.$v.$touch() // робимо всі змінені (автоматично запускається перевірка на валідність)
      // Перевірка на валідність
      if (this.$v.$invalid) {
        console.log('Наявні помилки перевірки!')
        return
      }
      try {
        if (this.postId === '') {
          await this.$store.dispatch('newPost', this.post)
        } else {
          this.post.id = this.postId
          console.log('Submit Handle updatePost')
          await this.$store.dispatch('updatePost', this.post)
        }

        this.post.title = ''
        this.post.short = ''
        this.post.content = ''
        this.postId = ''
        this.$v.$reset()
        if (this.postId !== '') {
          this.$store.commit('addMessage', {
            type: 'info',
            message: 'Ви успішно додали нову статтю.',
          })
        } else {
          this.$store.commit('addMessage', {
            type: 'info',
            message: 'Ви успішно змінили статтю.',
          })
        }

        this.$router.push('/')
      } catch (error) {
        this.$store.commit('addMessage', {
          type: 'danger',
          message: error.message,
        })
        console.log('Post submitHandler error: ', error)
      }
    },
  },
}
</script>

<style></style>
