<template>
  <div
    class="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-7xl mx-auto">
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
      >
        <h1
          class="text-2xl font-bold text-gray-800 mb-6"
        >
          Gerenciar Amizades
        </h1>

        <!-- User Search Component -->
        <UserSearch class="mb-8" />

        <!-- Pending Requests (Received) -->
        <div class="mb-8">
          <h2
            class="text-lg font-semibold text-gray-700 mb-4 flex flex-wrap items-center gap-2"
          >
            <span>Solicitações Recebidas</span>
            <span
              v-if="pendingRequests.length > 0"
              class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"
            >
              {{ pendingRequests.length }}
            </span>
          </h2>

          <div
            v-if="pendingRequests.length === 0"
            class="text-gray-500 text-center py-8"
          >
            Nenhuma solicitação pendente
          </div>

          <div
            v-else
            class="grid-responsive-requests"
          >
            <div
              v-for="request in pendingRequests"
              :key="request.id"
              class="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div
                class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-3"
              >
                <div
                  class="flex items-center space-x-3 flex-1 min-w-0"
                >
                  <div class="flex-shrink-0">
                    <div
                      class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-sm"
                    >
                      <span
                        class="text-white font-bold text-sm sm:text-lg"
                      >
                        {{
                          request.senderName
                            .charAt(0)
                            .toUpperCase()
                        }}
                      </span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3
                      class="font-semibold text-gray-900 truncate text-sm sm:text-base"
                    >
                      {{ request.senderName }}
                    </h3>
                    <p
                      class="text-gray-600 text-xs sm:text-sm truncate"
                    >
                      {{ request.senderEmail }}
                    </p>
                    <p
                      class="text-gray-500 text-xs"
                    >
                      {{
                        formatDate(
                          request.createdAt
                        )
                      }}
                    </p>
                  </div>
                </div>
                <div
                  class="flex flex-row sm:flex-row gap-2 sm:flex-shrink-0 w-full sm:w-auto"
                >
                  <button
                    @click="
                      acceptRequest(request.id)
                    "
                    :disabled="loading"
                    class="flex-1 sm:flex-none px-3 py-2 sm:px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors text-xs sm:text-sm font-medium"
                  >
                    ✓ Aceitar
                  </button>
                  <button
                    @click="
                      rejectRequest(request.id)
                    "
                    :disabled="loading"
                    class="flex-1 sm:flex-none px-3 py-2 sm:px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors text-xs sm:text-sm font-medium"
                  >
                    ✗ Rejeitar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sent Requests -->
        <div class="mb-8">
          <h2
            class="text-lg font-semibold text-gray-700 mb-4 flex flex-wrap items-center gap-2"
          >
            <span>Solicitações Enviadas</span>
            <span
              v-if="sentRequests.length > 0"
              class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {{ sentRequests.length }}
            </span>
          </h2>

          <div
            v-if="sentRequests.length === 0"
            class="text-gray-500 text-center py-8"
          >
            Nenhuma solicitação enviada
          </div>

          <div
            v-else
            class="grid-responsive-requests"
          >
            <div
              v-for="request in sentRequests"
              :key="request.id"
              class="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div
                class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-3"
              >
                <div
                  class="flex items-center space-x-3 flex-1 min-w-0"
                >
                  <div class="flex-shrink-0">
                    <div
                      class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-sm"
                    >
                      <span
                        class="text-white font-bold text-sm sm:text-lg"
                      >
                        {{
                          request.receiverName
                            .charAt(0)
                            .toUpperCase()
                        }}
                      </span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3
                      class="font-semibold text-gray-900 truncate text-sm sm:text-base"
                    >
                      {{ request.receiverName }}
                    </h3>
                    <p
                      class="text-gray-600 text-xs sm:text-sm truncate"
                    >
                      {{ request.receiverEmail }}
                    </p>
                    <p
                      class="text-gray-500 text-xs"
                    >
                      Enviada em
                      {{
                        formatDate(
                          request.createdAt
                        )
                      }}
                    </p>
                  </div>
                </div>
                <div
                  class="flex-shrink-0 w-full sm:w-auto"
                >
                  <span
                    class="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 bg-yellow-100 text-yellow-800 text-xs sm:text-sm rounded-full border border-yellow-200"
                  >
                    ⏳ Pendente
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Friends List -->
        <div>
          <h2
            class="text-lg font-semibold text-gray-700 mb-4 flex flex-wrap items-center gap-2"
          >
            <span>Meus Amigos</span>
            <span
              v-if="friends.length > 0"
              class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
            >
              {{ friends.length }}
            </span>
          </h2>

          <div
            v-if="friends.length === 0"
            class="text-gray-500 text-center py-8"
          >
            Você ainda não tem amigos
          </div>

          <div
            v-else
            class="grid-responsive-cards"
          >
            <div
              v-for="friend in friends"
              :key="friend.id"
              class="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-lg transition-all duration-200 flex flex-col h-full min-h-[120px] sm:min-h-[140px]"
            >
              <!-- Header com avatar e info -->
              <div
                class="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4 flex-1"
              >
                <div class="flex-shrink-0">
                  <div
                    class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-sm"
                  >
                    <span
                      class="text-white font-bold text-sm sm:text-lg"
                    >
                      {{
                        friend.friendName
                          .charAt(0)
                          .toUpperCase()
                      }}
                    </span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3
                    class="font-semibold text-gray-900 text-xs sm:text-sm truncate"
                    :title="friend.friendName"
                  >
                    {{ friend.friendName }}
                  </h3>
                  <p
                    class="text-gray-500 text-xs truncate mt-0.5 sm:mt-1"
                    :title="friend.friendEmail"
                  >
                    {{ friend.friendEmail }}
                  </p>
                </div>
              </div>

              <!-- Botões -->
              <div class="flex gap-2 mt-auto">
                <router-link
                  :to="`/chat?user=${friend.friendId}`"
                  class="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-primary-600 text-white text-center rounded-md hover:bg-primary-700 transition-colors text-xs font-medium"
                >
                  💬 Chat
                </router-link>
                <button
                  @click="
                    confirmRemoveFriend(friend)
                  "
                  class="px-2 py-1.5 sm:px-3 sm:py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-xs font-medium border border-red-200 flex-shrink-0"
                  :title="`Remover ${friend.friendName}`"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      v-if="showConfirmDialog"
      :title="'Remover Amigo'"
      :message="`Tem certeza que deseja remover ${friendToRemove?.friendName} da sua lista de amigos?`"
      @confirm="removeFriendConfirmed"
      @cancel="cancelRemoveFriend"
    />

    <!-- Toast -->
    <SimpleToast
      v-if="toast.show"
      :message="toast.message"
      :type="toast.type"
      :show="toast.show"
      @close="toast.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFriendsStore } from '../../stores/friends';
import type { Friend } from '../../stores/friends';
import ConfirmDialog from '../../components/ui/ConfirmDialog.vue';
import SimpleToast from '../../components/ui/SimpleToast.vue';
import UserSearch from '../../components/friends/UserSearch.vue';

const friendsStore = useFriendsStore();

const showConfirmDialog = ref(false);
const friendToRemove = ref<Friend | null>(null);
const toast = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
});

// Computed properties
const pendingRequests = computed(
  () => friendsStore.pendingRequests
);
const sentRequests = computed(
  () => friendsStore.sentRequests
);
const friends = computed(
  () => friendsStore.friends
);
const loading = computed(
  () => friendsStore.loading
);
const error = computed(() => friendsStore.error);

// Methods
async function acceptRequest(requestId: string) {
  const success =
    await friendsStore.acceptFriendRequest(
      requestId
    );

  if (success) {
    showToast('Solicitação aceita!', 'success');
  } else {
    showToast(
      error.value ||
        'Erro ao aceitar solicitação',
      'error'
    );
  }
}

async function rejectRequest(requestId: string) {
  const success =
    await friendsStore.rejectFriendRequest(
      requestId
    );

  if (success) {
    showToast('Solicitação rejeitada', 'success');
  } else {
    showToast(
      error.value ||
        'Erro ao rejeitar solicitação',
      'error'
    );
  }
}

function confirmRemoveFriend(friend: Friend) {
  friendToRemove.value = friend;
  showConfirmDialog.value = true;
}

async function removeFriendConfirmed() {
  if (!friendToRemove.value) return;

  const success = await friendsStore.removeFriend(
    friendToRemove.value.friendId
  );

  if (success) {
    showToast(
      'Amigo removido com sucesso',
      'success'
    );
  } else {
    showToast(
      error.value || 'Erro ao remover amigo',
      'error'
    );
  }

  cancelRemoveFriend();
}

function cancelRemoveFriend() {
  showConfirmDialog.value = false;
  friendToRemove.value = null;
}

function showToast(
  message: string,
  type: 'success' | 'error'
) {
  toast.value = {
    show: true,
    message,
    type,
  };

  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

onMounted(() => {
  friendsStore.initialize();
});
</script>
