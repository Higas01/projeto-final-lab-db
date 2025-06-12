<script setup lang="ts">
import {
  onMounted,
  provide,
  ref,
  watch,
  computed,
} from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useFriendsStore } from './stores/friends';
import Navbar from './components/layout/Navbar.vue';
import Footer from './components/layout/Footer.vue';
import Toast from './components/ui/Toast.vue';
import AuthLoading from './components/ui/AuthLoading.vue';
import ChatNotifications from './components/chat/ChatNotifications.vue';
import { useToast } from './composables/useToast';

const { toasts, addToast } = useToast();
const authStore = useAuthStore();
const friendsStore = useFriendsStore();
const route = useRoute();
const loading = ref(true);

// Provide toast functionality globally
provide('toast', addToast);

onMounted(async () => {
  await authStore.initAuth();
  loading.value = false;
});

// Listen for auth state changes
watch(
  () => authStore.user,
  (newUser, oldUser) => {
    if (newUser && !oldUser) {
      // Initialize friends store when user logs in for the first time in this session
      friendsStore.initialize();
      // Só mostrar toast se for um login novo (não sessão restaurada)
      if (!authStore.loading) {
        addToast({
          type: 'success',
          message: 'Login realizado com sucesso',
          duration: 3000,
        });
      }
    }
  }
);

// Determine if navbar should be shown
const showNavbar = computed(() => {
  return !['login', 'signup'].includes(
    route.name as string
  );
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AuthLoading v-if="loading" />

    <template v-else>
      <Navbar v-if="showNavbar" />

      <main
        class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <router-view />
      </main>

      <Footer v-if="showNavbar" />

      <!-- Chat notifications (only when user is logged in) -->
      <ChatNotifications v-if="authStore.user" />

      <!-- Toast notifications -->
      <div class="fixed top-4 right-4 z-50">
        <Toast
          v-for="toast in toasts"
          :key="toast.id"
          :toast="toast"
        />
      </div>
    </template>
  </div>
</template>
