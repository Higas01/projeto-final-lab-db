<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  usePostsStore,
  type Post,
} from '../stores/posts';
import PostList from '../components/posts/PostList.vue';
import PostForm from '../components/posts/PostForm.vue';
import PostEditForm from '../components/posts/PostEditForm.vue';
import ConfirmDialog from '../components/ui/ConfirmDialog.vue';
import LoadingSpinner from '../components/ui/LoadingSpinner.vue';

const postsStore = usePostsStore();
const showPostForm = ref(false);
const showEditForm = ref(false);
const showDeleteConfirm = ref(false);
const postToEdit = ref<Post | null>(null);
const postToDelete = ref<string | null>(null);

onMounted(async () => {
  await postsStore.fetchPosts();
});

function togglePostForm() {
  showPostForm.value = !showPostForm.value;
}

async function handlePostCreated() {
  showPostForm.value = false;
  await postsStore.fetchPosts();
}

function handleEditPost(post: Post) {
  postToEdit.value = post;
  showEditForm.value = true;
}

async function handlePostUpdated() {
  showEditForm.value = false;
  postToEdit.value = null;
  await postsStore.fetchPosts();
}

function cancelEdit() {
  showEditForm.value = false;
  postToEdit.value = null;
}

function handleDeletePost(postId: string) {
  postToDelete.value = postId;
  showDeleteConfirm.value = true;
}

async function confirmDelete() {
  if (!postToDelete.value) return;

  try {
    await postsStore.deletePost(
      postToDelete.value
    );
    await postsStore.fetchPosts();
  } catch (error) {
    console.error('Erro ao deletar post:', error);
  } finally {
    showDeleteConfirm.value = false;
    postToDelete.value = null;
  }
}

function cancelDelete() {
  showDeleteConfirm.value = false;
  postToDelete.value = null;
}
</script>

<template>
  <div>
    <div
      class="flex justify-between items-center mb-8"
    >
      <h1
        class="text-3xl font-bold text-gray-900 dark:text-white"
      >
        Feed
      </h1>
      <button
        v-if="!showPostForm && !showEditForm"
        @click="togglePostForm"
        class="btn-primary flex items-center"
      >
        <span class="mr-2">+</span> Criar Post
      </button>
    </div>

    <!-- Create Post Form -->
    <div v-if="showPostForm" class="mb-8 card">
      <div
        class="flex justify-between items-center mb-4"
      >
        <h2 class="text-xl font-semibold">
          Criar um Novo Post
        </h2>
        <button
          @click="togglePostForm"
          class="text-gray-500 hover:text-gray-700"
        >
          <span class="sr-only">Fechar</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <PostForm
        @post-created="handlePostCreated"
        @cancel="togglePostForm"
      />
    </div>

    <!-- Edit Post Form -->
    <div
      v-if="showEditForm && postToEdit"
      class="mb-8 card"
    >
      <div
        class="flex justify-between items-center mb-4"
      >
        <h2 class="text-xl font-semibold">
          Editar Post
        </h2>
        <button
          @click="cancelEdit"
          class="text-gray-500 hover:text-gray-700"
        >
          <span class="sr-only">Fechar</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <PostEditForm
        :post="postToEdit"
        @updated="handlePostUpdated"
        @cancel="cancelEdit"
      />
    </div>

    <LoadingSpinner v-if="postsStore.loading" />

    <div
      v-else-if="postsStore.posts.length === 0"
      class="text-center py-8"
    >
      <p
        class="text-gray-500 dark:text-gray-400 text-lg"
      >
        Ainda não há posts. Seja o primeiro a
        compartilhar algo!
      </p>
      <button
        @click="togglePostForm"
        class="btn-primary mt-4"
      >
        Criar Post
      </button>
    </div>

    <PostList
      v-else
      :posts="postsStore.posts"
      @edit="handleEditPost"
      @delete="handleDeletePost"
    />

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      v-if="showDeleteConfirm"
      title="Excluir Post"
      message="Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita."
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>
