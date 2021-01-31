<template>
  <div id="profile-form-container">
    <form
      id="profile-form"
      class="pt-3"
      @submit.prevent="submitForm"
      novalidate
    >
      <fieldset>
        <legend>Профіль користувача uuid {{ profile.uuid }}</legend>
        <div class="form-group row">
          <label for="user-name" class="col-sm-2 col-form-label">
            Ім'я користувача:
          </label>
          <div class="col-sm-10">
            <input
              type="text"
              class="form-control"
              id="user-name"
              v-model="profile.userName"
            />
          </div>
          <small
            id="user-name-required"
            class="form-text text-danger col-sm-12"
            v-if="
              this.$v.profile.userName.$dirty &&
                !this.$v.profile.userName.required
            "
          >
            Ім'я користувача є обов'язковим!
          </small>
          <small
            id="user-name-minlength"
            class="form-text text-danger col-sm-12"
            v-if="
              this.$v.profile.userName.$dirty &&
                !this.$v.profile.userName.minLength
            "
          >
            Ім'я має містити не менше ніж
            {{ this.$v.profile.userName.$params.minLength.min }} символів
          </small>
        </div>
        <div class="form-group row">
          <label for="profile-description" class="col-lg-2 control-label"
            >Опис користувача:</label
          >
          <div class="col-lg-10">
            <textarea
              class="form-control"
              rows="3"
              id="profile-description"
              v-model="profile.description"
            ></textarea>
          </div>
        </div>
        <div class="form-group row">
          <div class="col-lg-2">
            <img
              :src="avatarUri"
              width="64px"
              height="64px"
              alt="аватар"
              v-if="showAvatar"
            />
            <img
              :src="'/uploads/' + avatarFileName"
              width="64px"
              height="64px"
              alt="аватар"
              v-else-if="avatarFileName"
            />
            <p v-else>Відсутній аватар</p>
          </div>
          <div class="col-lg-10">
            <label for="avatarFile">Змінити аватар</label>

            <input
              type="file"
              class="form-control-file"
              id="avatarFile"
              aria-describedby="fileHelp"
              accept="image/*"
              @change="uploadAvatar($event)"
            />
            <small
              id="avatar-size"
              class="form-text text-danger"
              v-if="
                this.$v.avatarFileSize.$dirty && !this.$v.avatarFileSize.maxSize
              "
            >
              розмір файлу повинен бути менше ніж 100 кБайт
            </small>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">
          Записати <i class="fas fa-share"></i>
        </button>
      </fieldset>
    </form>
  </div>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'
export default {
  name: 'profileForm',
  data: () => ({
    profile: {
      uuid: '',
      description: '',
      userName: '',
      avatar: null,
    },
    avatarFileName: '',
    avatarFileSize: 0,
  }),
  validations: {
    profile: {
      userName: {
        required,
        minLength: minLength(6),
      },
    },
    avatarFileSize: {
      maxSize() {
        return this.avatarFileName === '' || this.avatarFileSize < 102400
      },
    },
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.currentUser
    },
    hasAvatar() {
      return !!this.profile.avatar
    },
    showAvatar() {
      return this.hasAvatar && this.avatarFileName.length === 0
    },
    previewAvatar() {
      return this.avatarFileName.length !== 0
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
        this.currentUser.uuid
      )
      this.profile = profile
    } catch (error) {
      this.$store.commit('addMessage', {
        type: 'danger',
        message: error.message,
      })
      console.log('profile mounted error: ', error)
    }
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
        await this.$store.dispatch('updateProfile', {
          user_name: this.profile.userName,
          description: this.profile.description,
          avatarFileName: this.avatarFileName,
        })
        this.profile.avatar = this.currentUser.avatar
        this.avatarFileName = ''
        this.avatarFileSize = 0
        this.$v.$reset()
        this.$store.commit('addMessage', {
          type: 'info',
          message: 'Ви успішно змінили свій профільі',
        })
      } catch (error) {
        this.$store.commit('addMessage', {
          type: 'danger',
          message: error.message,
        })
        console.log('upload avatar error: ', error)
      }
    },
    async uploadAvatar(event) {
      try {
        const formData = new FormData()
        const fileField = event.target

        if (fileField.files && fileField.files.length > 0) {
          this.avatarFileSize = fileField.files[0].size
          formData.append('avatar', fileField.files[0])
          const result = await this.$store.dispatch('uploadAvatar', formData)
          this.avatarFileName = result.fileName
        } else {
          this.avatarFileName = ''
          this.avatarFileSize = 0
        }
      } catch (error) {
        this.$store.commit('addMessage', {
          type: 'danger',
          message: error.message,
        })
        console.log('upload avatar error: ', error)
      }
    },
  },
}
</script>

<style></style>
