<script setup lang="ts">
import { ref } from 'vue';
import { usePostsStore } from '../../stores/posts';

const props = defineProps<{
  initialTitle?: string;
  initialContent?: string;
}>();

const emit = defineEmits<{
  (e: 'post-created'): void;
  (e: 'cancel'): void;
}>();

const postsStore = usePostsStore();

const title = ref(props.initialTitle || '');
const content = ref(props.initialContent || '');
const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  if (
    !title.value.trim() ||
    !content.value.trim()
  ) {
    error.value =
      'Título e conteúdo são obrigatórios';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await postsStore.createPost({
      title: title.value,
      content: content.value,
    });

    // Reset form
    title.value = '';
    content.value = '';

    emit('post-created');
  } catch (err: any) {
    error.value =
      err.message || 'Erro ao criar post';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    class="space-y-4"
  >
    <div>
      <label
        for="post-title"
        class="block text-sm font-medium text-gray-700"
        >Título</label
      >
      <input
        id="post-title"
        v-model="title"
        type="text"
        placeholder="Digite um título para seu post"
        class="form-input mt-1"
        :disabled="loading"
      />
    </div>

    <div>
      <label
        for="post-content"
        class="block text-sm font-medium text-gray-700"
        >Conteúdo</label
      >
      <textarea
        id="post-content"
        v-model="content"
        rows="4"
        placeholder="O que você está pensando?"
        class="form-input mt-1 resize-none"
        :disabled="loading"
      ></textarea>
    </div>

    <div v-if="error" class="text-red-500">
      {{ error }}
    </div>

    <div class="flex justify-end">
      <button
        type="button"
        @click="emit('cancel')"
        class="btn-secondary mr-3"
        :disabled="loading"
      >
        Cancelar
      </button>

      <button
        type="submit"
        class="btn-primary"
        :disabled="loading"
      >
        <span v-if="loading" class="mr-2">
          <svg
            class="animate-spin h-4 w-4 text-white inline-block"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
        Publicar
      </button>
    </div>
  </form>
</template>
