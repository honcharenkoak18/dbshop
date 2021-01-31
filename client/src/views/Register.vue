<template>
  <div class="row justify-content-center">
    <div class="card col-4">
      <div class="card-body">
        <h5 class="card-title">Зареєструйтесь для входу до DB SHOP</h5>
        <form @submit.prevent="submitForm" novalidate>
          <div class="mb-3">
            <!--input-email-->
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
              @focus="$v.userLogin.$reset()"
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
              id="email-unique"
              class="form-text text-danger"
              v-if="this.$v.userLogin.$dirty && !this.$v.userLogin.isUnique"
            >
              <small>Користувач з вказаним email вже зареестрований</small>
            </div>
            <div
              id="email-required"
              class="form-text text-danger"
              v-if="this.$v.userLogin.$dirty && !this.$v.userLogin.email"
            >
              <small>Введіть коректний email</small>
            </div>
          </div>
          <div class="mb-3">
            <!--input-name-->
            <label for="input-name" class="form-label">Ваше ім'я</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'is-invalid': this.$v.userName.$error,
                'is-valid': this.$v.userName.$dirty && !this.$v.userName.$error,
              }"
              id="input-name"
              v-model.trim.lazy="$v.userName.$model"
              @blur="$v.userName.$touch()"
            />
            <div
              id="name-required"
              class="form-text text-danger"
              v-if="this.$v.userName.$dirty && !this.$v.userName.required"
            >
              <small>Введіть Ваше ім'я</small>
            </div>
            <div
              id="name-length"
              class="form-text text-danger"
              v-if="this.$v.userName.$dirty && !this.$v.userName.minLength"
            >
              <small
                >Ім'я має містити не менше ніж
                {{ this.$v.userName.$params.minLength.min }} символів</small
              >
            </div>
          </div>
          <div class="mb-3">
            <!--input-password-->
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
          <div class="mb-3">
            <!--input-confirm-->
            <label for="input-confirm" class="form-label"
              >Повторіть пароль</label
            >
            <input
              type="password"
              class="form-control"
              :class="{
                'is-invalid': this.$v.confirmPassword.$error,
                'is-valid':
                  this.$v.confirmPassword.$dirty &&
                  !this.$v.confirmPassword.$error,
              }"
              id="input-confirm"
              v-model.trim.lazy="confirmPassword"
              @blur="$v.confirmPassword.$touch()"
            />
            <div
              id="password-required"
              class="form-text text-danger"
              v-if="
                this.$v.confirmPassword.$dirty &&
                  !this.$v.confirmPassword.sameAsPassword
              "
            >
              <small>Паролі повинні співпадати</small>
            </div>
          </div>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="true && (this.$v.$invalid || this.$v.$pending)"
          >
            Відправити <i class="fas fa-share"></i>
          </button>
          <router-link to="/login" class="btn btn-link"
            ><i class="fas fa-key fa-fw"></i> Ввійти</router-link
          >
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { required, email, sameAs, minLength } from 'vuelidate/lib/validators'
const isUnique = async function(value) {
  return await this.isUnique(value)
}
export default {
  name: 'Register',
  data: () => ({
    userLogin: '',
    userName: '',
    userPassword: '',
    confirmPassword: '',
  }),
  validations: {
    userLogin: {
      required,
      email,
      isUnique,
    },
    userName: {
      required,
      minLength: minLength(6),
    },
    userPassword: {
      required,
    },
    confirmPassword: {
      sameAsPassword: sameAs('userPassword'),
    },
  },
  methods: {
    async isUnique(email) {
      if (email === '') return true
      const response = Boolean(
        await this.$store.dispatch('testUserByEmail', { email })
      )
      return !response
    },
    async submitForm() {
      this.$v.$touch() // робимо всі змінені (автоматично запускається перевірка на валідність)
      if (this.$v.$pending) {
        console.log('Триває перевірка!')
        return
      }
      // Перевірка на валідність
      if (this.$v.$invalid) {
        console.log('Наявні помилки перевірки!')
        return
      }
      try {
        await this.$store.dispatch('registerUser', {
          email: this.userLogin,
          user_name: this.userName,
          password: this.userPassword,
          role: 'user',
        })
        this.userLogin = ''
        this.userName = ''
        this.userPassword = ''
        this.confirmPassword = ''
        this.$v.$reset()
        this.$router.push('/')
      } catch (error) {
        this.$store.commit('addMessage', {
          type: 'danger',
          message: error.message,
        })
        console.log('Register submitForm error: ', error)
      }
    },
  },
}
</script>

<style></style>
