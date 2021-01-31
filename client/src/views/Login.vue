<template>
  <div class="row justify-content-center">
    <div class="card col-4">
      <div class="card-body">
        <h5 class="card-title">Ввійдіть до DB SHOP</h5>
        <form @submit.prevent="submitForm" novalidate>
          <div class="mb-3">
            <label for="input-email" class="form-label"
              >Ваша email адреса</label
            >
            <input
              type="email"
              class="form-control"
              :class="{
                'is-invalid': this.$v.userLogin.$error,
                'is-valid':
                  this.$v.userLogin.$dirty && !this.$v.userLogin.$error,
              }"
              id="input-email"
              v-model.trim.lazy="$v.userLogin.$model"
              @blur="$v.userLogin.$touch()"
            />
            <div
              id="email-required"
              class="form-text text-danger"
              v-if="this.$v.userLogin.$dirty && !this.$v.userLogin.required"
            >
              <small>Введіть Ваш email</small>
            </div>
            <div
              id="email-email"
              class="form-text text-danger"
              v-if="this.$v.userLogin.$dirty && !this.$v.userLogin.email"
            >
              <small>Введіть коректний email</small>
            </div>
          </div>
          <div class="mb-3">
            <label for="input-password" class="form-label">Пароль</label>
            <input
              type="password"
              class="form-control"
              :class="{
                'is-invalid': this.$v.userPassword.$error,
                'is-valid':
                  this.$v.userPassword.$dirty && !this.$v.userPassword.$error,
              }"
              id="input-password"
              v-model.trim.lazy="userPassword"
              @blur="$v.userPassword.$touch()"
            />
            <div
              id="password-required"
              class="form-text text-danger"
              v-if="
                this.$v.userPassword.$dirty && !this.$v.userPassword.required
              "
            >
              <small>Введіть пароль</small>
            </div>
          </div>
          <button type="submit" class="btn btn-primary">
            Відправити <i class="fas fa-share"></i>
          </button>
          <router-link to="/register" class="btn btn-link"
            ><i class="fas fa-user fa-fw"></i> Зареєструватися</router-link
          >
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators'
export default {
  name: 'Login',
  data: () => ({
    userLogin: '',
    userPassword: '',
  }),
  validations: {
    userLogin: {
      required,
      email,
    },
    userPassword: {
      required,
    },
  },
  methods: {
    async submitForm() {
      this.$store.commit('clearMessages')
      this.$v.$touch() // робимо всі змінені (автоматично запускається перевірка на валідність)
      // Перевірка на валідність
      if (this.$v.$invalid) {
        console.log('Наявні помилки перевірки!')
        return
      }
      try {
        await this.$store.dispatch('loginUser', {
          email: this.userLogin,
          password: this.userPassword,
        })
        this.userLogin = ''
        this.userPassword = ''
        this.$v.$reset()
        this.$store.commit('addMessage', {
          type: 'info',
          message: 'Ви успішно ввійшли до DB Shop',
        })
        this.$router.push('/')
      } catch (error) {
        this.$store.commit('addMessage', {
          type: 'danger',
          message: error.message,
        })
        console.log('Login submitForm error: ', error)
      }
    },
  },
}
</script>

<style scoped>
.card {
  min-width: 380px;
}
</style>
