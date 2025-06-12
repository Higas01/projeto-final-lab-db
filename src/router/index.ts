import {
  createRouter,
  createWebHistory,
} from 'vue-router';
import { useAuthStore } from '../stores/auth';
import HomePage from '../views/HomePage.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () =>
      import('../views/auth/LoginPage.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/signup',
    name: 'signup',
    component: () =>
      import('../views/auth/SignupPage.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/profile/:id',
    name: 'profile',
    component: () =>
      import('../views/profile/ProfilePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/post/:id',
    name: 'post-detail',
    component: () =>
      import('../views/posts/PostDetailPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/chat',
    name: 'chat',
    component: () =>
      import('../views/chat/ChatPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/friends',
    name: 'friends',
    component: () =>
      import('../views/friends/FriendsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () =>
      import('../views/NotFoundPage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards for authentication
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // Aguardar inicialização da autenticação se ainda não foi inicializada
  if (!authStore.initialized) {
    await authStore.initAuth();
  }

  const requiresAuth = to.matched.some(
    (record) => record.meta.requiresAuth
  );
  const requiresGuest = to.matched.some(
    (record) => record.meta.requiresGuest
  );

  if (requiresAuth && !authStore.user) {
    next('/login');
  } else if (requiresGuest && authStore.user) {
    next('/');
  } else {
    next();
  }
});

export default router;
