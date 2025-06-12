<script setup lang="ts">
import { computed } from 'vue';
import type { Post } from '../../stores/posts';
import PostCard from './PostCard.vue';

const props = defineProps<{
  posts: Post[];
}>();

const emit = defineEmits<{
  (e: 'edit', post: Post): void;
  (e: 'delete', postId: string): void;
}>();

// Sort posts by date (newest first)
const sortedPosts = computed(() => {
  return [...props.posts].sort(
    (a, b) =>
      b.createdAt.getTime() -
      a.createdAt.getTime()
  );
});

function handleEdit(post: Post) {
  emit('edit', post);
}

function handleDelete(postId: string) {
  emit('delete', postId);
}
</script>

<template>
  <div class="grid gap-6">
    <PostCard
      v-for="post in sortedPosts"
      :key="post.id"
      :post="post"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </div>
</template>
