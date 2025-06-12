<template>
  <div>
    <!-- Friend button for authenticated user viewing other profiles -->
    <div
      v-if="
        authStore.user &&
        userId !== authStore.user.uid
      "
      class="mt-4"
    >
      <!-- Already friends -->
      <div v-if="isFriend" class="flex space-x-2">
        <router-link
          :to="`/chat?user=${userId}`"
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
        >
          Conversar
        </router-link>
        <button
          @click="confirmRemoveFriend"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Remover Amigo
        </button>
      </div>

      <!-- Pending request sent -->
      <div
        v-else-if="hasRequestSent"
        class="flex items-center justify-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Solicitação Enviada
      </div>

      <!-- Pending request received -->
      <div
        v-else-if="hasRequestReceived"
        class="flex space-x-2"
      >
        <button
          @click="acceptFriendRequest"
          :disabled="loading"
          class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Aceitar Amizade
        </button>
        <button
          @click="rejectFriendRequest"
          :disabled="loading"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          Rejeitar
        </button>
      </div>

      <!-- No relationship -->
      <button
        v-else
        @click="sendFriendRequest"
        :disabled="loading"
        class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {{
          loading
            ? 'Enviando...'
            : 'Adicionar Amigo'
        }}
      </button>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      v-if="showConfirmDialog"
      :title="'Remover Amigo'"
      :message="`Tem certeza que deseja remover esta pessoa da sua lista de amigos?`"
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
import { useAuthStore } from '../../stores/auth';
import ConfirmDialog from '../ui/ConfirmDialog.vue';
import SimpleToast from '../ui/SimpleToast.vue';

interface Props {
  userId: string;
  userEmail: string;
}

const props = defineProps<Props>();

const friendsStore = useFriendsStore();
const authStore = useAuthStore();

const showConfirmDialog = ref(false);
const toast = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
});

// Computed properties
const loading = computed(
  () => friendsStore.loading
);
const isFriend = computed(() =>
  friendsStore.isFriend(props.userId)
);

const hasRequestSent = computed(() => {
  return friendsStore.sentRequests.some(
    (req) =>
      req.receiverId === props.userId &&
      req.status === 'pending'
  );
});

const hasRequestReceived = computed(() => {
  return friendsStore.pendingRequests.some(
    (req) =>
      req.senderId === props.userId &&
      req.status === 'pending'
  );
});

const pendingRequest = computed(() => {
  return friendsStore.pendingRequests.find(
    (req) =>
      req.senderId === props.userId &&
      req.status === 'pending'
  );
});

// Methods
async function sendFriendRequest() {
  const success =
    await friendsStore.sendFriendRequest(
      props.userEmail
    );

  if (success) {
    showToast(
      'Solicitação de amizade enviada!',
      'success'
    );
  } else {
    showToast(
      friendsStore.error ||
        'Erro ao enviar solicitação',
      'error'
    );
  }
}

async function acceptFriendRequest() {
  if (!pendingRequest.value) return;

  const success =
    await friendsStore.acceptFriendRequest(
      pendingRequest.value.id
    );

  if (success) {
    showToast(
      'Solicitação aceita! Agora vocês são amigos.',
      'success'
    );
  } else {
    showToast(
      friendsStore.error ||
        'Erro ao aceitar solicitação',
      'error'
    );
  }
}

async function rejectFriendRequest() {
  if (!pendingRequest.value) return;

  const success =
    await friendsStore.rejectFriendRequest(
      pendingRequest.value.id
    );

  if (success) {
    showToast('Solicitação rejeitada', 'success');
  } else {
    showToast(
      friendsStore.error ||
        'Erro ao rejeitar solicitação',
      'error'
    );
  }
}

function confirmRemoveFriend() {
  showConfirmDialog.value = true;
}

async function removeFriendConfirmed() {
  const success = await friendsStore.removeFriend(
    props.userId
  );

  if (success) {
    showToast(
      'Amigo removido com sucesso',
      'success'
    );
  } else {
    showToast(
      friendsStore.error ||
        'Erro ao remover amigo',
      'error'
    );
  }

  cancelRemoveFriend();
}

function cancelRemoveFriend() {
  showConfirmDialog.value = false;
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

onMounted(() => {
  friendsStore.initialize();
});
</script>
