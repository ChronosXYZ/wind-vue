<template>
  <Header />
  <ul style="list-style: none; padding: 5px;">
    <li v-for="(post, index) in posts">
      <Post 
        :number="index+1" 
        :author="post.author"
        :title="post.title"
        :time-ago="post.timeAgo" 
        :comments-count="post.commentsCount" />
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Header from './components/Header.vue'
import Post from './components/Post.vue'

export default defineComponent({
  name: "app",
  components: {
    Header,
    Post
  },
  data() {
    return {
      posts: [
        {author: "anonymous", title: "No Damned Computer Is Going to Tell Me What to Do – Story of Naval Data System", timeAgo: "0 seconds", commentsCount: 0},
        {author: "anonymous", title: "Use ruins to tell a story. What was the building for? What destroyed it?", timeAgo: "0 seconds", commentsCount: 0},
        {author: "anonymous", title: "Dedicated node project", timeAgo: "0 seconds", commentsCount: 0},
        {author: "anonymous", title: "We need a middle class for startups", timeAgo: "0 seconds", commentsCount: 0},
        {author: "anonymous", title: "Plane accidentally flew around the world (2018)", timeAgo: "0 seconds", commentsCount: 0}
      ]
    }
  }
});

</script>

<style lang="less">
@import "./style/reddit.less";
</style>
