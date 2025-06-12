<script setup lang="ts">
import {
  ref,
  watch,
  onMounted,
  nextTick,
  computed,
} from 'vue';
import type { ChatMessage } from '../../stores/chat';

const props = defineProps<{
  messages: ChatMessage[];
  currentUserId?: string;
}>();

const messagesContainer = ref<HTMLElement | null>(
  null
);

// Group messages by date
const groupedMessages = computed(() => {
  const groups: {
    date: string;
    messages: ChatMessage[];
  }[] = [];
  let currentDate = '';
  let currentGroup: ChatMessage[] = [];

  props.messages.forEach((message) => {
    const messageDate =
      message.timestamp.toDateString();

    if (messageDate !== currentDate) {
      if (currentGroup.length) {
        groups.push({
          date: currentDate,
          messages: [...currentGroup],
        });
      }
      currentDate = messageDate;
      currentGroup = [message];
    } else {
      currentGroup.push(message);
    }
  });

  if (currentGroup.length) {
    groups.push({
      date: currentDate,
      messages: currentGroup,
    });
  }

  return groups;
});

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(date: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (
    date.toDateString() === today.toDateString()
  ) {
    return 'Today';
  } else if (
    date.toDateString() ===
    yesterday.toDateString()
  ) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
}

// Scroll to bottom when messages change
watch(
  () => props.messages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);

// Also watch for messages length specifically
watch(
  () => props.messages.length,
  () => {
    scrollToBottom();
  }
);

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop =
        messagesContainer.value.scrollHeight;
    }
  });
}

onMounted(() => {
  scrollToBottom();
});
</script>

<template>
  <div
    ref="messagesContainer"
    class="h-full overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900"
  >
    <div
      v-if="!messages || messages.length === 0"
      class="h-full flex items-center justify-center text-gray-500"
    >
      <p>
        No messages yet. Start a conversation!
      </p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(
          group, groupIndex
        ) in groupedMessages"
        :key="groupIndex"
        class="mb-6"
      >
        <div class="text-center mb-4">
          <span
            class="inline-block px-3 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full"
          >
            {{ formatDate(new Date(group.date)) }}
          </span>
        </div>

        <div
          v-for="message in group.messages"
          :key="message.id"
          class="mb-4"
        >
          <div
            :class="{
              flex: true,
              'justify-end':
                message.senderId ===
                currentUserId,
            }"
          >
            <div
              :class="{
                'max-w-[80%] rounded-lg px-4 py-2 break-words': true,
                'bg-primary-500 text-white rounded-tr-none':
                  message.senderId ===
                  currentUserId,
                'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none':
                  message.senderId !==
                  currentUserId,
              }"
            >
              <p>{{ message.content }}</p>
              <div
                :class="{
                  'text-xs mt-1 flex items-center': true,
                  'text-primary-100 justify-end':
                    message.senderId ===
                    currentUserId,
                  'text-gray-500 dark:text-gray-400':
                    message.senderId !==
                    currentUserId,
                }"
              >
                {{
                  formatTime(message.timestamp)
                }}
                <span
                  v-if="
                    message.senderId ===
                    currentUserId
                  "
                  class="ml-1"
                >
                  <svg
                    v-if="message.read"
                    class="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                    />
                  </svg>
                  <svg
                    v-else
                    class="h-3 w-3"
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
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
