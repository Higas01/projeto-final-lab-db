<template>
  <div
    v-if="show"
    class="fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300"
    :class="typeClasses"
  >
    <div
      class="flex items-center justify-between"
    >
      <div class="flex items-center">
        <svg
          v-if="type === 'success'"
          class="w-5 h-5 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>

        <svg
          v-else-if="type === 'error'"
          class="w-5 h-5 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>

        <span>{{ message }}</span>
      </div>

      <button
        @click="$emit('close')"
        class="ml-4 text-white hover:text-gray-200"
      >
        <svg
          class="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  message: string;
  type: 'success' | 'error' | 'info';
  show?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
});

defineEmits<{
  (e: 'close'): void;
}>();

const typeClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-500 text-white';
    case 'error':
      return 'bg-red-500 text-white';
    case 'info':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
});
</script>
