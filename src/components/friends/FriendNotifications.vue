<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <svg
        class="w-6 h-6 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>

      <!-- Notification badge -->
      <span
        v-if="pendingCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
      >
        {{
          pendingCount > 9 ? '9+' : pendingCount
        }}
      </span>
    </button>

    <!-- Dropdown -->
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <div class="p-4 border-b border-gray-200">
        <div
          class="flex items-center justify-between"
        >
          <h3 class="font-semibold text-gray-800">
            Solicitações de Amizade
          </h3>
          <router-link
            to="/friends"
            @click="showDropdown = false"
            class="text-blue-600 hover:text-blue-800 text-sm"
          >
            Ver todas
          </router-link>
        </div>
      </div>

      <div class="max-h-96 overflow-y-auto">
        <div
          v-if="pendingRequests.length === 0"
          class="p-4 text-center text-gray-500"
        >
          Nenhuma solicitação pendente
        </div>

        <div v-else>
          <div
            v-for="request in pendingRequests.slice(
              0,
              5
            )"
            :key="request.id"
            class="p-4 border-b border-gray-100 hover:bg-gray-50 last:border-b-0"
          >
            <div
              class="flex items-center space-x-3 mb-3"
            >
              <div
                class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center"
              >
                <span
                  class="text-gray-600 font-semibold"
                >
                  {{
                    request.senderName
                      .charAt(0)
                      .toUpperCase()
                  }}
                </span>
              </div>
              <div class="flex-1">
                <h4
                  class="font-medium text-gray-800"
                >
                  {{ request.senderName }}
                </h4>
                <p class="text-gray-600 text-sm">
                  {{ request.senderEmail }}
                </p>
                <p class="text-gray-500 text-xs">
                  {{
                    getTimeAgo(request.createdAt)
                  }}
                </p>
              </div>
            </div>

            <div class="flex space-x-2">
              <button
                @click="acceptRequest(request.id)"
                :disabled="loading"
                class="flex-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
              >
                Aceitar
              </button>
              <button
                @click="rejectRequest(request.id)"
                :disabled="loading"
                class="flex-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
              >
                Rejeitar
              </button>
            </div>
          </div>

          <div
            v-if="pendingRequests.length > 5"
            class="p-3 text-center border-t border-gray-200"
          >
            <router-link
              to="/friends"
              @click="showDropdown = false"
              class="text-blue-600 hover:text-blue-800 text-sm"
            >
              Ver mais
              {{
                pendingRequests.length - 5
              }}
              solicitações
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay -->
    <div
      v-if="showDropdown"
      @click="showDropdown = false"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
} from 'vue';
import { useFriendsStore } from '../../stores/friends';

const friendsStore = useFriendsStore();
const showDropdown = ref(false);

// Computed properties
const pendingRequests = computed(
  () => friendsStore.pendingRequests
);
const pendingCount = computed(
  () => pendingRequests.value.length
);
const loading = computed(
  () => friendsStore.loading
);

// Methods
function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

async function acceptRequest(requestId: string) {
  await friendsStore.acceptFriendRequest(
    requestId
  );
}

async function rejectRequest(requestId: string) {
  await friendsStore.rejectFriendRequest(
    requestId
  );
}

function getTimeAgo(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  if (diffInSeconds < 60) {
    return 'Agora';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(
      diffInSeconds / 60
    );
    return `${minutes}m atrás`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(
      diffInSeconds / 3600
    );
    return `${hours}h atrás`;
  } else {
    const days = Math.floor(
      diffInSeconds / 86400
    );
    return `${days}d atrás`;
  }
}

// Close dropdown when clicking outside
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement;
  if (!target.closest('.relative')) {
    showDropdown.value = false;
  }
}

onMounted(() => {
  friendsStore.initialize();
  document.addEventListener(
    'click',
    handleClickOutside
  );
});

onUnmounted(() => {
  document.removeEventListener(
    'click',
    handleClickOutside
  );
});
</script>
