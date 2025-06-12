<script setup lang="ts">
import { computed } from 'vue';
import type { ChatUser } from '../../stores/chat';
import { formatDistanceToNow } from 'date-fns';

const props = defineProps<{
  users: ChatUser[];
  selectedUser: ChatUser | null;
  unreadCounts: Record<string, number>;
}>();

const emit = defineEmits<{
  (e: 'select-user', user: ChatUser): void;
}>();

// Sort users: online first, then by unread count
const sortedUsers = computed(() => {
  return [...props.users].sort((a, b) => {
    // First by online status
    if (a.isOnline !== b.isOnline) {
      return a.isOnline ? -1 : 1;
    }

    // Then by unread count
    const unreadA =
      props.unreadCounts[a.uid] || 0;
    const unreadB =
      props.unreadCounts[b.uid] || 0;
    if (unreadA !== unreadB) {
      return unreadB - unreadA;
    }

    // Finally by name
    return a.displayName.localeCompare(
      b.displayName
    );
  });
});

function formatLastSeen(date?: Date) {
  if (!date) return 'unknown';
  return formatDistanceToNow(date, {
    addSuffix: true,
  });
}

function handleSelectUser(user: ChatUser) {
  emit('select-user', user);
}
</script>

<template>
  <div
    class="divide-y divide-gray-200 dark:divide-gray-700"
  >
    <div
      v-if="sortedUsers.length === 0"
      class="p-4 text-center text-gray-500 dark:text-gray-400"
    >
      Nenhum usuário encontrado no chat.
    </div>

    <div
      v-for="user in sortedUsers"
      :key="user.uid"
      :class="{
        'p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700': true,
        'bg-gray-50 dark:bg-gray-700':
          selectedUser?.uid === user.uid,
      }"
      @click="handleSelectUser(user)"
    >
      <div
        class="flex items-center justify-between"
      >
        <div class="flex items-center">
          <div
            v-if="user.photoURL"
            class="h-10 w-10 rounded-full mr-3 bg-cover bg-center"
            :style="`background-image: url(${user.photoURL})`"
          ></div>
          <div
            v-else
            class="h-10 w-10 rounded-full mr-3 bg-primary-500 text-white flex items-center justify-center text-lg"
          >
            {{ user.displayName.charAt(0) }}
          </div>

          <div>
            <div
              class="font-medium text-gray-900 dark:text-white"
            >
              {{ user.displayName }}
            </div>
            <div
              class="flex items-center text-sm"
            >
              <span
                :class="{
                  'h-2 w-2 rounded-full mr-2': true,
                  'bg-green-500': user.isOnline,
                  'bg-gray-400': !user.isOnline,
                }"
              ></span>
              <span
                class="text-gray-500 dark:text-gray-400"
              >
                {{
                  user.isOnline
                    ? 'Online'
                    : `Last seen ${formatLastSeen(
                        user.lastSeen
                      )}`
                }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="unreadCounts[user.uid]"
          class="bg-red-500 text-white rounded-full px-2 py-1 text-xs font-medium min-w-5 text-center"
        >
          {{ unreadCounts[user.uid] }}
        </div>
      </div>
    </div>
  </div>
</template>
