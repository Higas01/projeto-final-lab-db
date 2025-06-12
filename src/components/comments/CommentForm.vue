<script setup lang="ts">
import { ref } from 'vue'
import { useCommentsStore } from '../../stores/comments'

const props = defineProps<{
  postId: string
}>()

const emit = defineEmits<{
  (e: 'comment-added'): void
}>()

const commentsStore = useCommentsStore()
const content = ref('')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  if (!content.value.trim()) {
    error.value = 'O comentário não pode estar vazio'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    await commentsStore.addComment(props.postId, content.value)
    content.value = ''
    emit('comment-added')
  } catch (err: any) {
    error.value = err.message || 'Erro ao adicionar comentário'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <label for="comment" class="sr-only">Adicionar um comentário</label>
    <div class="flex items-start">
      <div class="flex-1">
        <textarea 
          id="comment" 
          v-model="content" 
          rows="2" 
          placeholder="Adicione um comentário..." 
          class="form-input resize-none w-full" 
          :disabled="loading"
        ></textarea>
        <div v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</div>
      </div>
      <button 
        type="submit" 
        class="ml-3 mt-1 btn-primary"
        :disabled="loading || !content.trim()"
      >
        <span v-if="loading" class="mr-2">
          <svg class="animate-spin h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        Comentar
      </button>
    </div>
  </form>
</template>