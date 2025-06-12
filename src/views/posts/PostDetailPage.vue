<template>
  <div class="max-w-4xl mx-auto p-6">
    <LoadingSpinner v-if="loading" />

    <div v-else-if="post" class="space-y-6">
      <!-- Post Card -->
      <div class="bg-white shadow rounded-lg p-6">
        <!-- Post header -->
        <div
          class="flex items-center justify-between mb-4"
        >
          <div class="flex items-center">
            <div
              class="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center mr-4"
            >
              <span
                class="text-gray-600 font-semibold text-lg"
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
                class="font-semibold text-lg text-gray-900 hover:text-blue-600"
              >
                {{ post.authorName }}
              </router-link>
              <p class="text-sm text-gray-500">
                {{ formatDate(post.createdAt) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Post title and content -->
        <div class="mb-6">
          <h1
            class="text-2xl font-bold text-gray-900 mb-4"
          >
            {{ post.title }}
          </h1>
          <p
            class="text-gray-800 leading-relaxed text-lg"
          >
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
              'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
              isLiked
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-gray-600 hover:bg-gray-100',
            ]"
          >
            <svg
              class="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clip-rule="evenodd"
              />
            </svg>
            <span
              >{{
                post.likeCount || 0
              }}
              curtidas</span
            >
          </button>

          <div
            class="flex items-center space-x-2 text-gray-600"
          >
            <svg
              class="w-6 h-6"
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
            <span
              >{{
                comments.length
              }}
              comentários</span
            >
          </div>
        </div>
      </div>

      <!-- Comments Section -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2
          class="text-xl font-semibold text-gray-900 mb-4"
        >
          Comentários
        </h2>

        <!-- Comment Form -->
        <CommentForm
          v-if="authStore.user"
          :post-id="postId"
          @comment-added="handleCommentAdded"
          class="mb-6"
        />

        <!-- Comments List -->
        <CommentList
          :comments="comments"
          :post-author-id="post.authorId"
          :loading="commentsLoading"
          @comment-deleted="handleCommentDeleted"
        />
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-gray-500">
        Post não encontrado
      </p>
      <router-link
        to="/"
        class="btn-primary mt-4 inline-block"
      >
        Voltar ao início
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  watch,
} from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { usePostsStore } from '../../stores/posts';
import { useCommentsStore } from '../../stores/comments';
import type { Post } from '../../stores/posts';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';
import CommentForm from '../../components/comments/CommentForm.vue';
import CommentList from '../../components/comments/CommentList.vue';

const route = useRoute();
const authStore = useAuthStore();
const postsStore = usePostsStore();
const commentsStore = useCommentsStore();

const post = ref<Post | null>(null);
const loading = ref(true);

const postId = computed(
  () => route.params.id as string
);
const isLiked = computed(() =>
  post.value?.likedBy?.includes(
    authStore.user?.uid || ''
  )
);
const comments = computed(
  () => commentsStore.comments
);
const commentsLoading = computed(
  () => commentsStore.loading
);

async function fetchPost() {
  loading.value = true;
  try {
    post.value = await postsStore.getPostById(
      postId.value
    );
    if (post.value) {
      commentsStore.fetchComments(postId.value);
    }
  } catch (error) {
    console.error('Error fetching post:', error);
  } finally {
    loading.value = false;
  }
}

async function toggleLike() {
  if (!authStore.user || !post.value) return;

  try {
    await postsStore.toggleLike(post.value.id);
    // Update local post data
    if (post.value) {
      const updatedPost =
        await postsStore.getPostById(
          post.value.id
        );
      if (updatedPost) {
        post.value = updatedPost;
      }
    }
  } catch (error) {
    console.error('Error toggling like:', error);
  }
}

function handleCommentAdded() {
  // Refresh comments after adding a new one
  commentsStore.fetchComments(postId.value);

  // Update post comment count
  if (post.value) {
    post.value.commentCount =
      (post.value.commentCount || 0) + 1;
  }
}

function handleCommentDeleted() {
  // Refresh comments after deleting one
  commentsStore.fetchComments(postId.value);

  // Update post comment count
  if (post.value) {
    post.value.commentCount = Math.max(
      (post.value.commentCount || 1) - 1,
      0
    );
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

onMounted(() => {
  fetchPost();
});

// Watch for changes in postId to refetch when navigating between posts
watch(postId, (newPostId, oldPostId) => {
  if (newPostId !== oldPostId) {
    // Clear previous post and comments immediately
    post.value = null;
    commentsStore.clearComments();
    fetchPost();
  }
});
</script>
