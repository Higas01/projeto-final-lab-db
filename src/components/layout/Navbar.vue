<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useChatStore } from '../../stores/chat';
import FriendNotifications from '../friends/FriendNotifications.vue';

const authStore = useAuthStore();
const chatStore = useChatStore();
const router = useRouter();
const showMobileMenu = ref(false);
const showUserMenu = ref(false);

const user = computed(() => authStore.user);

async function logout() {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value;
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}
</script>

<template>
  <nav class="bg-white shadow">
    <div
      class="container mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div class="flex justify-between h-16">
        <div class="flex">
          <!-- Logo and site name -->
          <router-link
            to="/"
            class="flex-shrink-0 flex items-center"
          >
            <span
              class="text-2xl font-bold text-primary-600"
              >Rede Social</span
            >
          </router-link>

          <!-- Navigation links - Desktop -->
          <div
            class="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4"
          >
            <router-link
              to="/"
              class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >Início</router-link
            >
            <router-link
              :to="`/profile/${user?.uid}`"
              class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >Perfil</router-link
            >
          </div>
        </div>

        <div
          class="hidden sm:ml-6 sm:flex sm:items-center"
        >
          <!-- Friend Notifications -->
          <FriendNotifications />

          <!-- Chat button with notification badge -->
          <router-link
            to="/chat"
            class="mr-4 relative p-1 rounded-full text-gray-700 hover:text-primary-600"
          >
            <span class="sr-only"
              >Ver mensagens</span
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
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span
              v-if="
                chatStore.totalUnreadCount > 0
              "
              class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{
                chatStore.totalUnreadCount > 9
                  ? '9+'
                  : chatStore.totalUnreadCount
              }}
            </span>
          </router-link>

          <!-- User dropdown -->
          <div class="ml-3 relative">
            <div>
              <button
                @click="toggleUserMenu"
                type="button"
                class="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <span class="sr-only"
                  >Abrir menu do usuário</span
                >
                <div
                  class="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm"
                >
                  {{
                    user?.displayName?.charAt(
                      0
                    ) || 'U'
                  }}
                </div>
              </button>
            </div>

            <!-- User dropdown menu -->
            <div
              v-show="showUserMenu"
              class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50"
            >
              <router-link
                :to="`/profile/${user?.uid}`"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >Seu Perfil</router-link
              >
              <router-link
                to="/friends"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >Amigos</router-link
              >
              <button
                @click="logout"
                class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="flex items-center sm:hidden">
          <button
            @click="toggleMobileMenu"
            type="button"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          >
            <span class="sr-only"
              >Abrir menu principal</span
            >
            <svg
              v-if="!showMobileMenu"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              v-else
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div
      v-show="showMobileMenu"
      class="sm:hidden"
    >
      <div class="pt-2 pb-3 space-y-1">
        <router-link
          to="/"
          class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600"
          >Início</router-link
        >
        <router-link
          :to="`/profile/${user?.uid}`"
          class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600"
          >Perfil</router-link
        >
        <router-link
          to="/friends"
          class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600"
          >Amigos</router-link
        >
        <router-link
          to="/chat"
          class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600"
        >
          Chat
          <span
            v-if="chatStore.totalUnreadCount > 0"
            class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white"
          >
            {{ chatStore.totalUnreadCount }}
          </span>
        </router-link>
        <button
          @click="logout"
          class="w-full text-left block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600"
        >
          Sair
        </button>
      </div>
    </div>
  </nav>
</template>
