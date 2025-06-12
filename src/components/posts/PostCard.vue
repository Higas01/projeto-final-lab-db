<template>
  <div
    class="bg-white shadow rounded-lg p-6 mb-4"
  >
    <!-- Post header -->
    <div
      class="flex items-center justify-between mb-4"
    >
      <div class="flex items-center">
        <div
          class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3"
        >
          <span
            class="text-gray-600 font-semibold"
          >
            {{
              post.authorName
                .charAt(0)
                .toUpperCase()
            }}
          </span>
        </div>
        <div>
          <router-link
            :to="`/profile/${post.authorId}`"
            class="font-semibold text-gray-900 hover:text-blue-600"
          >
            {{ post.authorName }}
          </router-link>
          <p class="text-sm text-gray-500">
            {{ formatDate(post.createdAt) }}
          </p>
        </div>
      </div>

      <!-- Post actions menu (if it's user's own post) -->
      <div v-if="showActions" class="relative">
        <button
          @click="toggleMenu"
          class="text-gray-500 hover:text-gray-700 p-1"
        >
          <svg
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
            />
          </svg>
        </button>

        <div
          v-if="showMenu"
          class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
        >
          <button
            @click="editPost"
            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Editar
          </button>
          <button
            @click="deletePost"
            class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>

    <!-- Post title and content -->
    <div class="mb-4">
      <h2
        class="text-xl font-bold text-gray-900 mb-3"
      >
        {{ post.title }}
      </h2>
      <p class="text-gray-800 leading-relaxed">
        {{ post.content }}
      </p>
    </div>

    <!-- Post actions -->
    <div
      class="flex items-center space-x-4 pt-4 border-t border-gray-200"
    >
      <button
        @click="toggleLike"
        :class="[
          'flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors',
          isLiked
            ? 'text-red-600 bg-red-50 hover:bg-red-100'
            : 'text-gray-600 hover:bg-gray-100',
        ]"
      >
        <svg
          class="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clip-rule="evenodd"
          />
        </svg>
        <span>{{ post.likeCount || 0 }}</span>
      </button>

      <router-link
        :to="`/post/${post.id}`"
        class="flex items-center space-x-1 px-3 py-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span>{{ post.commentCount || 0 }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { usePostsStore } from '../../stores/posts';
import type { Post } from '../../stores/posts';

const props = defineProps<{
  post: Post;
}>();

const emit = defineEmits<{
  (e: 'edit', post: Post): void;
  (e: 'delete', postId: string): void;
}>();

const authStore = useAuthStore();
const postsStore = usePostsStore();
const showMenu = ref(false);

const showActions = computed(
  () =>
    authStore.user?.uid === props.post.authorId
);

const isLiked = computed(() =>
  props.post.likedBy?.includes(
    authStore.user?.uid || ''
  )
);

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function editPost() {
  emit('edit', props.post);
  showMenu.value = false;
}

function deletePost() {
  emit('delete', props.post.id);
  showMenu.value = false;
}

async function toggleLike() {
  if (!authStore.user) return;

  try {
    await postsStore.toggleLike(props.post.id);
  } catch (error) {
    console.error('Error toggling like:', error);
  }
}

function formatDate(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  if (diffInSeconds < 60) {
    return 'Agora';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(
      diffInSeconds / 60
    );
    return `${minutes}m atrás`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(
      diffInSeconds / 3600
    );
    return `${hours}h atrás`;
  } else {
    const days = Math.floor(
      diffInSeconds / 86400
    );
    return `${days}d atrás`;
  }
}

// Close menu when clicking outside
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.relative')) {
    showMenu.value = false;
  }
});
</script>
