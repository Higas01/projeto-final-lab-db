<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'send-message', content: string): void;
}>();

const message = ref('');
const loading = ref(false);

function handleSubmit() {
  if (!message.value.trim()) return;

  loading.value = true;

  try {
    emit('send-message', message.value);
    message.value = '';
  } finally {
    loading.value = false;
  }
}

// Handle Ctrl+Enter to submit
function handleKeydown(event: KeyboardEvent) {
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key === 'Enter'
  ) {
    handleSubmit();
  }
}
</script>

<template>
  <div
    class="p-3 sm:p-4 border-t border-gray-200 bg-white"
  >
    <form
      @submit.prevent="handleSubmit"
      class="flex items-center gap-2 sm:gap-0"
    >
      <input
        v-model="message"
        type="text"
        placeholder="Digite sua mensagem..."
        @keydown="handleKeydown"
        class="form-input flex-1 text-sm sm:text-base sm:rounded-r-none focus:z-10 min-h-[44px] sm:min-h-auto"
        :disabled="loading"
      />
      <button
        type="submit"
        class="btn-primary sm:rounded-l-none px-3 py-2.5 sm:px-4 sm:py-2 min-h-[44px] sm:min-h-auto"
        :disabled="loading || !message.trim()"
      >
        <span v-if="loading" class="mr-1 sm:mr-2">
          <svg
            class="animate-spin h-3 w-3 sm:h-4 sm:w-4 text-white inline-block"
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 sm:h-5 sm:w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
        <span class="sr-only">Enviar</span>
      </button>
    </form>
    <div
      class="text-xs text-gray-500 mt-1 hidden sm:block"
    >
      Pressione Ctrl+Enter para enviar
    </div>
  </div>
</template>
