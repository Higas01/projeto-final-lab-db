<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

defineProps<{
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

// Close on ESC key press
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('cancel');
  }
}

onMounted(() => {
  document.addEventListener(
    'keydown',
    handleKeydown
  );
});

onUnmounted(() => {
  document.removeEventListener(
    'keydown',
    handleKeydown
  );
});
</script>

<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all"
    >
      <h3
        class="text-lg font-medium text-gray-900 mb-2"
      >
        {{ title }}
      </h3>
      <p class="text-sm text-gray-500 mb-6">
        {{ message }}
      </p>

      <div class="flex justify-end space-x-3">
        <button
          @click="emit('cancel')"
          class="btn-secondary"
        >
          {{ cancelText || 'Cancel' }}
        </button>
        <button
          @click="emit('confirm')"
          class="btn-danger"
        >
          {{ confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  </div>
</template>
