<template>
  <div class="container" id="messages">
    <div
      v-for="message in messages"
      :class="`alert alert-${message.type} alert-dismissible fade show`"
      role="alert"
      :key="messages.indexOf(message)"
    >
      {{ message.message }}
      <button
        type="button"
        class="close"
        data-dismiss="alert"
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Messages',
  props: ['messages'],
  mounted() {},
}
</script>

<style scoped>
#messages {
  background: none;
}
.alert {
  width: 100%;
}</style
>>
