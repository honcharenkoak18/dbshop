<template>
  <div class="progress" style="height: 6px;">
    <div
      class="progress-bar progress-offset"
      role="progressbar"
      ref="progress-offset"
    ></div>
    <div
      class="progress-bar progress-info"
      role="progressbar"
      ref="progress-info"
    ></div>
  </div>
</template>
<script>
export default {
  name: 'Loader',
  data: () => ({
    timerId: null,
  }),
  mounted() {},
  destroyed() {},
}
</script>

<style scoped>
.progress-info {
  width: 0;
}
.progress-offset {
  background-color: inherit;
  width: 0;
  transition: none;
}
</style>
