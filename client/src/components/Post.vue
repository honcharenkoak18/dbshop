<template>
  <section class="row border-bottom">
    <article class="col-md-12 p-2">
      <header>
        <div class="post-author">{{ post.author }}</div>
        <div class="post-date">{{ post.date | date('datetime') }}</div>
      </header>
      <h3 class="post-title">{{ post.title }}</h3>
      <div class="short-content border p-2">{{ post.short }}</div>
      <footer class="pt-2">
        <div>Коментарів: {{ post.comments ? post.comments : 0 }}</div>
        <router-link class="btn btn-secondary" :to="`/post/read/${post.id}`">
          Читати
        </router-link>
      </footer>
    </article>
  </section>
</template>

<script>
export default {
  name: 'Post',
  props: ['post'],
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
