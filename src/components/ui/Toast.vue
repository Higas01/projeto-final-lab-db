<script setup lang="ts">
import { onMounted, computed } from 'vue';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

const props = defineProps<{
  toast: ToastMessage;
}>();

const emit = defineEmits<{
  (e: 'close', id: number): void;
}>();

onMounted(() => {
  if (props.toast.duration) {
    setTimeout(() => {
      emit('close', props.toast.id);
    }, props.toast.duration);
  }
});

const typeClasses = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return 'bg-green-500 text-white';
    case 'error':
      return 'bg-red-500 text-white';
    case 'info':
    default:
      return 'bg-blue-500 text-white';
  }
});
</script>

<template>
  <div
    :class="[
      'rounded-lg shadow-lg p-4 mb-3 flex items-center',
      typeClasses,
    ]"
    :data-toast-id="toast.id"
    class="animate-slide-up"
  >
    <!-- Icon based on type -->
    <div class="mr-3">
      <svg
        v-if="toast.type === 'success'"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
      <svg
        v-else-if="toast.type === 'error'"
        class="h-5 w-5"
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
      <svg
        v-else
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>

    <!-- Message -->
    <div class="flex-1">{{ toast.message }}</div>

    <!-- Close button -->
    <button
      @click="emit('close', toast.id)"
      class="ml-3 text-white hover:text-gray-200 focus:outline-none"
    >
      <svg
        class="h-5 w-5"
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
</template>
