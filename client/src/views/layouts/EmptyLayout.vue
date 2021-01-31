<template>
  <div class="empty-layout">
    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmptyLayout',
  computed: {},
  watch: {},
  mounted() {},
}
</script>

<style scoped>
.empty-layout {
  height: 100vh;
  margin: 0;
  padding: 15px;
}
</style>
