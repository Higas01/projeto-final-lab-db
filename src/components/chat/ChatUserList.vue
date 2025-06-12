<script setup lang="ts">
import { computed } from 'vue';
import type { ChatUser } from '../../stores/chat';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  if (!date) return 'desconhecido';
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: ptBR,
  });
}

function handleSelectUser(user: ChatUser) {
  emit('select-user', user);
}
</script>

<template>
  <div class="divide-y divide-gray-200">
    <div
      v-if="sortedUsers.length === 0"
      class="p-4 text-center text-gray-500"
    >
      Nenhum usuário encontrado no chat.
    </div>

    <div
      v-for="user in sortedUsers"
      :key="user.uid"
      :class="{
        'p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors': true,
        'bg-gray-50':
          selectedUser?.uid === user.uid,
      }"
      @click="handleSelectUser(user)"
    >
      <div
        class="flex items-center justify-between"
      >
        <div
          class="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0"
        >
          <div
            v-if="user.photoURL"
            class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-cover bg-center flex-shrink-0"
            :style="`background-image: url(${user.photoURL})`"
          ></div>
          <div
            v-else
            class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm sm:text-lg flex-shrink-0"
          >
            {{ user.displayName.charAt(0) }}
          </div>

          <div class="flex-1 min-w-0">
            <div
              class="font-medium text-gray-900 text-sm sm:text-base truncate"
            >
              {{ user.displayName }}
            </div>
            <div
              class="flex items-center text-xs sm:text-sm"
            >
              <span
                :class="{
                  'h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full mr-1.5 sm:mr-2 flex-shrink-0': true,
                  'bg-green-500': user.isOnline,
                  'bg-gray-400': !user.isOnline,
                }"
              ></span>
              <span
                class="text-gray-500 truncate"
              >
                {{
                  user.isOnline
                    ? 'Online'
                    : `Visto ${formatLastSeen(
                        user.lastSeen
                      )}`
                }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="unreadCounts[user.uid]"
          class="bg-red-500 text-white rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-medium min-w-[18px] sm:min-w-[20px] text-center flex-shrink-0"
        >
          {{ unreadCounts[user.uid] }}
        </div>
      </div>
    </div>
  </div>
</template>
