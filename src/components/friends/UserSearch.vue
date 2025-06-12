<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2
      class="text-xl font-semibold text-gray-800 mb-4"
    >
      Buscar Usuários
    </h2>

    <div class="mb-6">
      <div
        class="flex flex-col sm:flex-row gap-3 sm:gap-4"
      >
        <input
          v-model="searchEmail"
          type="email"
          placeholder="Digite o email do usuário para buscar..."
          class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
          @keyup.enter="searchUser"
        />
        <button
          @click="searchUser"
          :disabled="!searchEmail || searching"
          class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 text-sm sm:text-base font-medium whitespace-nowrap"
        >
          {{
            searching ? 'Buscando...' : 'Buscar'
          }}
        </button>
      </div>
      <p
        v-if="searchError"
        class="text-red-600 text-sm mt-2"
      >
        {{ searchError }}
      </p>
    </div>

    <!-- Search Results -->
    <div
      v-if="searchResults.length > 0"
      class="space-y-4"
    >
      <h3
        class="text-lg font-medium text-gray-800 mb-3"
      >
        Resultados da Busca
      </h3>

      <div
        v-for="user in searchResults"
        :key="user.uid"
        class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div
          class="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0"
        >
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0"
          >
            <span
              class="text-gray-600 font-semibold text-sm sm:text-base"
            >
              {{
                user.displayName
                  .charAt(0)
                  .toUpperCase()
              }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <h4
              class="font-semibold text-gray-800 truncate text-sm sm:text-base"
            >
              {{ user.displayName }}
            </h4>
            <p
              class="text-gray-600 text-xs sm:text-sm truncate"
            >
              {{ user.email }}
            </p>
            <p class="text-gray-500 text-xs">
              Membro desde
              {{ formatDate(user.createdAt) }}
            </p>
          </div>
        </div>

        <div
          class="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 w-full sm:w-auto"
        >
          <router-link
            :to="`/profile/${user.uid}`"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm text-center transition-colors"
          >
            Ver Perfil
          </router-link>

          <!-- Friend Action Button -->
          <div
            v-if="
              user.uid !== authStore.user?.uid
            "
            class="w-full sm:w-auto"
          >
            <!-- Already friends -->
            <router-link
              v-if="
                friendsStore.isFriend(user.uid)
              "
              :to="`/chat?user=${user.uid}`"
              class="block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm text-center transition-colors"
            >
              Conversar
            </router-link>

            <!-- Request already sent -->
            <span
              v-else-if="hasSentRequest(user.uid)"
              class="block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm text-center"
            >
              Convite Enviado
            </span>

            <!-- Can send request -->
            <button
              v-else
              @click="
                sendFriendRequest(user.email)
              "
              :disabled="loading"
              class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm transition-colors"
            >
              Adicionar Amigo
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="
        hasSearched && searchResults.length === 0
      "
      class="text-center py-8"
    >
      <p class="text-gray-500">
        Nenhum usuário encontrado com este email
      </p>
    </div>

    <!-- Toast -->
    <Toast
      v-if="toast.show"
      :message="toast.message"
      :type="toast.type"
      :show="toast.show"
      @close="toast.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useFriendsStore } from '../../stores/friends';
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { getFirebaseServices } from '../../firebase/config';
import Toast from '../ui/SimpleToast.vue';

const { db } = getFirebaseServices();
const authStore = useAuthStore();
const friendsStore = useFriendsStore();

const searchEmail = ref('');
const searching = ref(false);
const searchError = ref('');
const searchResults = ref<any[]>([]);
const hasSearched = ref(false);
const loading = ref(false);
const toast = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
});

// Check if request was already sent to this user
function hasSentRequest(userId: string) {
  return friendsStore.sentRequests.some(
    (req) =>
      req.receiverId === userId &&
      req.status === 'pending'
  );
}

async function searchUser() {
  if (!searchEmail.value) return;

  searching.value = true;
  searchError.value = '';
  searchResults.value = [];

  try {
    const usersQuery = query(
      collection(db, 'users'),
      where(
        'email',
        '==',
        searchEmail.value.toLowerCase()
      )
    );

    const querySnapshot = await getDocs(
      usersQuery
    );

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        searchResults.value.push({
          uid: doc.id,
          ...userData,
          createdAt:
            userData.createdAt?.toDate() ||
            new Date(),
        });
      });
    }

    hasSearched.value = true;
  } catch (error: any) {
    searchError.value = 'Erro ao buscar usuário';
    console.error('Search error:', error);
  } finally {
    searching.value = false;
  }
}

async function sendFriendRequest(email: string) {
  loading.value = true;

  const success =
    await friendsStore.sendFriendRequest(email);

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

  loading.value = false;
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
  }).format(date);
}
</script>
