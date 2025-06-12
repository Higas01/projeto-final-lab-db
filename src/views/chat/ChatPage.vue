<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import {
  useChatStore,
  type ChatUser,
} from '../../stores/chat';
import { useAuthStore } from '../../stores/auth';
import { useFriendsStore } from '../../stores/friends';
import ChatUserList from '../../components/chat/ChatUserList.vue';
import ChatMessages from '../../components/chat/ChatMessages.vue';
import ChatInput from '../../components/chat/ChatInput.vue';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';

const chatStore = useChatStore();
const authStore = useAuthStore();
const friendsStore = useFriendsStore();

const windowWidth = ref(window.innerWidth);
const showUserList = ref(windowWidth.value > 768);

// Track window resize for responsive layout
function handleResize() {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value > 768) {
    showUserList.value = true;
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize);

  // Initialize chat functionality
  if (authStore.user) {
    friendsStore.initialize();
    chatStore.trackOnlineStatus();
    chatStore.fetchFriendsForChat();
    chatStore.listenForUnreadCounts();
  }
});

onUnmounted(() => {
  window.removeEventListener(
    'resize',
    handleResize
  );
  chatStore.cleanup();
});

// Watch for auth state changes
watch(
  () => authStore.user,
  (newUser, oldUser) => {
    if (newUser && !oldUser) {
      // User logged in
      friendsStore.initialize();
      chatStore.trackOnlineStatus();
      chatStore.fetchOnlineUsers();
      chatStore.listenForUnreadCounts();
    } else if (!newUser && oldUser) {
      // User logged out
      chatStore.cleanup();
    }
  }
);

function selectUser(user: ChatUser) {
  chatStore.selectUser(user);
  if (windowWidth.value <= 768) {
    showUserList.value = false;
  }
}

function toggleUserList() {
  showUserList.value = !showUserList.value;
}
</script>

<template>
  <div
    class="h-[calc(100vh-12rem)] flex flex-col"
  >
    <div
      class="flex justify-between items-center mb-4"
    >
      <h1
        class="text-3xl font-bold text-gray-900 dark:text-white"
      >
        Chat
      </h1>
      <button
        v-if="windowWidth <= 768"
        @click="toggleUserList"
        class="md:hidden btn-secondary flex items-center"
      >
        <span v-if="!showUserList"
          >Show Users</span
        >
        <span v-else>Show Chat</span>
      </button>
    </div>

    <div
      class="flex flex-1 gap-4 h-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <!-- User list (sidebar) -->
      <div
        v-show="showUserList"
        :class="{
          'w-full md:w-1/3 lg:w-1/4': true,
          'hidden md:block':
            !showUserList && windowWidth > 768,
        }"
        class="bg-white dark:bg-gray-800 overflow-hidden flex flex-col"
      >
        <div
          class="p-4 border-b border-gray-200 dark:border-gray-700"
        >
          <h2
            class="font-semibold text-gray-900 dark:text-white"
          >
            Amigos Online
          </h2>
          <p
            class="text-sm text-gray-500 dark:text-gray-400"
          >
            Você só pode conversar com amigos
          </p>
        </div>

        <div
          v-if="chatStore.loading"
          class="flex-1 flex items-center justify-center"
        >
          <LoadingSpinner />
        </div>

        <ChatUserList
          v-else
          :users="chatStore.users"
          :selected-user="chatStore.selectedUser"
          :unread-counts="chatStore.unreadCounts"
          @select-user="selectUser"
          class="flex-1 overflow-y-auto"
        />
      </div>

      <!-- Chat area -->
      <div
        v-show="
          !showUserList || windowWidth > 768
        "
        class="flex-1 flex flex-col bg-white dark:bg-gray-800 overflow-hidden"
      >
        <div
          v-if="!chatStore.selectedUser"
          class="flex-1 flex flex-col items-center justify-center p-6 text-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p
            class="text-gray-600 dark:text-gray-300 mb-2"
          >
            Selecione um amigo para começar a
            conversar
          </p>
          <p
            class="text-sm text-gray-500 dark:text-gray-400 mb-4"
          >
            Você só pode conversar com pessoas que
            são seus amigos
          </p>
          <router-link
            to="/friends"
            class="btn-primary mb-2"
          >
            Gerenciar Amigos
          </router-link>
          <button
            v-if="windowWidth <= 768"
            @click="toggleUserList"
            class="btn-secondary"
          >
            Mostrar Amigos
          </button>
        </div>

        <template v-else>
          <!-- Chat header -->
          <div
            class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center"
          >
            <button
              v-if="windowWidth <= 768"
              @click="toggleUserList"
              class="mr-2 text-gray-600 dark:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div class="flex items-center">
              <div
                v-if="
                  chatStore.selectedUser.photoURL
                "
                class="h-8 w-8 rounded-full mr-3 bg-cover bg-center"
                :style="`background-image: url(${chatStore.selectedUser.photoURL})`"
              ></div>
              <div
                v-else
                class="h-8 w-8 rounded-full mr-3 bg-primary-500 text-white flex items-center justify-center text-sm"
              >
                {{
                  chatStore.selectedUser.displayName.charAt(
                    0
                  )
                }}
              </div>

              <div>
                <h3
                  class="font-medium text-gray-900 dark:text-white"
                >
                  {{
                    chatStore.selectedUser
                      .displayName
                  }}
                </h3>
                <div
                  class="flex items-center text-sm"
                >
                  <span
                    :class="{
                      'h-2 w-2 rounded-full mr-2': true,
                      'bg-green-500':
                        chatStore.selectedUser
                          .isOnline,
                      'bg-gray-400':
                        !chatStore.selectedUser
                          .isOnline,
                    }"
                  ></span>
                  <span
                    class="text-gray-500 dark:text-gray-400"
                    >{{
                      chatStore.selectedUser
                        .isOnline
                        ? 'Online'
                        : 'Offline'
                    }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <ChatMessages
            :messages="chatStore.messages"
            :current-user-id="authStore.user?.uid"
            class="flex-1"
          />

          <!-- Message input -->
          <ChatInput
            @send-message="chatStore.sendMessage"
          />
        </template>
      </div>
    </div>
  </div>
</template>
