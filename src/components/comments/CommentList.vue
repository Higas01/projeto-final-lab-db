<script setup lang="ts">
import { computed } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuthStore } from '../../stores/auth'
import { useCommentsStore, type Comment } from '../../stores/comments'
import ConfirmDialog from '../ui/ConfirmDialog.vue'
import { ref } from 'vue'

const props = defineProps<{
  comments: Comment[]
  postAuthorId: string
}>()

const emit = defineEmits<{
  (e: 'comment-deleted'): void
}>()

const authStore = useAuthStore()
const commentsStore = useCommentsStore()
const commentToDelete = ref<Comment | null>(null)
const showDeleteConfirm = ref(false)

const currentUser = computed(() => authStore.user)

function formatDate(date: Date) {
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
}

function confirmDelete(comment: Comment) {
  commentToDelete.value = comment
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!commentToDelete.value) return
  
  try {
    await commentsStore.deleteComment(
      commentToDelete.value.postId, 
      commentToDelete.value.id
    )
    emit('comment-deleted')
  } catch (error) {
    console.error('Erro ao deletar comentário:', error)
  } finally {
    showDeleteConfirm.value = false
    commentToDelete.value = null
  }
}

// Check if user can delete the comment (own comment or post author)
function canDeleteComment(comment: Comment) {
  if (!currentUser.value) return false
  return comment.authorId === currentUser.value.uid || props.postAuthorId === currentUser.value.uid
}
</script>

<template>
  <div class="space-y-4">
    <div 
      v-for="comment in comments" 
      :key="comment.id" 
      class="p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <div class="flex items-start justify-between mb-2">
        <div class="flex items-center">
          <router-link :to="`/profile/${comment.authorId}`" class="flex items-center mr-3">
            <div class="h-8 w-8 rounded-full mr-2 bg-primary-500 text-white flex items-center justify-center text-sm">
              {{ comment.authorName.charAt(0) }}
            </div>
            <span class="font-medium text-gray-900 dark:text-white">{{ comment.authorName }}</span>
          </router-link>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(comment.createdAt) }}</span>
        </div>
        
        <button 
          v-if="canDeleteComment(comment)" 
          @click="confirmDelete(comment)" 
          class="text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Deletar comentário"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      <div class="text-gray-800 dark:text-gray-200 whitespace-pre-line">{{ comment.content }}</div>
    </div>
    
    <!-- Delete confirmation dialog -->
    <ConfirmDialog
      v-if="showDeleteConfirm"
      title="Deletar Comentário"
      message="Tem certeza que deseja deletar este comentário? Esta ação não pode ser desfeita."
      confirm-text="Deletar"
      cancel-text="Cancelar"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>