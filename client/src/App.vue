<template>
  <div id="app" class="mt-5">
    <vue-loading-component />
    <messages :messages="messages" v-if="hasMessage" />
    <component :is="layout"> </component>
  </div>
</template>

<script>
import MainLayout from '@/views/layouts/MainLayout'
import EmptyLayout from '@/views/layouts/EmptyLayout'
import Messages from './components/Messages'

export default {
  mounted() {},
  watch: {
    httpLoading: function(val) {
      if (val) {
        this.startLoading()
      } else {
        this.endLoading()
      }
    },
  },
  beforeDestroy() {},
  computed: {
    layout() {
      return (this.$route.meta.layout || 'empty') + '-layout'
    },
    hasMessage() {
      return this.$store.state.messages.length
    },
    messages() {
      return this.$store.state.messages
    },
    httpLoading() {
      return this.$store.state.http.loading
    },
  },
  data: () => ({}),
  components: { EmptyLayout, MainLayout, Messages },
}
</script>
<style>
@import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
@import '../node_modules/@fortawesome/fontawesome-free/css/all.min.css';
.btn .fa,
.fab,
.fad,
.fal,
.far,
.fas {
  line-height: 1.5;
}
</style>
