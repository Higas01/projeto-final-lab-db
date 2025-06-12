<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { usePostsStore } from '../../stores/posts';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseServices } from '../../firebase/config';
import PostList from '../../components/posts/PostList.vue';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';
import FriendButton from '../../components/friends/FriendButton.vue';
import ProfileEditForm from '../../components/profile/ProfileEditForm.vue';

const route = useRoute();
const authStore = useAuthStore();
const postsStore = usePostsStore();
const { db } = getFirebaseServices();

const profileUser = ref<any>(null);
const loading = ref(true);
const showEditForm = ref(false);

const userId = computed(
  () => route.params.id as string
);
const isOwnProfile = computed(
  () => authStore.user?.uid === userId.value
);

onMounted(async () => {
  loading.value = true;

  try {
    // Fetch user profile data
    const userDoc = await getDoc(
      doc(db, 'users', userId.value)
    );
    if (userDoc.exists()) {
      profileUser.value = userDoc.data();
    }

    // Fetch user posts
    await postsStore.fetchUserPosts(userId.value);
  } catch (error) {
    console.error(
      'Error fetching profile:',
      error
    );
  } finally {
    loading.value = false;
  }
});

function toggleEditForm() {
  showEditForm.value = !showEditForm.value;
}

async function handleProfileUpdated() {
  showEditForm.value = false;

  // Recarregar dados do perfil
  try {
    const userDoc = await getDoc(
      doc(db, 'users', userId.value)
    );
    if (userDoc.exists()) {
      profileUser.value = userDoc.data();
    }
  } catch (error) {
    console.error(
      'Error reloading profile:',
      error
    );
  }
}
</script>

<template>
  <div>
    <LoadingSpinner
      v-if="loading"
      class="flex justify-center py-8"
    />

    <div v-else>
      <div
        class="bg-white shadow rounded-lg mb-8"
      >
        <div class="px-4 py-5 sm:px-6">
          <div
            class="flex flex-col sm:flex-row sm:justify-between sm:items-start"
          >
            <div
              class="flex items-center mb-4 sm:mb-0"
            >
              <div
                class="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mr-4"
              >
                <span
                  class="text-gray-600 font-semibold text-xl"
                >
                  {{
                    (
                      profileUser?.displayName ||
                      'U'
                    )
                      .charAt(0)
                      .toUpperCase()
                  }}
                </span>
              </div>
              <div>
                <h1
                  class="text-2xl font-bold text-gray-900"
                >
                  {{
                    profileUser?.displayName ||
                    'Usuário'
                  }}
                </h1>
                <p class="text-gray-500">
                  {{ profileUser?.email }}
                </p>
                <p class="text-sm text-gray-400">
                  Membro desde
                  {{
                    new Date(
                      profileUser?.createdAt?.toDate?.() ||
                        Date.now()
                    ).toLocaleDateString('pt-BR')
                  }}
                </p>
              </div>
            </div>

            <div class="flex flex-col space-y-2">
              <div v-if="isOwnProfile">
                <button
                  v-if="!showEditForm"
                  @click="toggleEditForm"
                  class="btn-secondary"
                >
                  Editar Perfil
                </button>
                <button
                  v-else
                  @click="toggleEditForm"
                  class="btn-secondary"
                >
                  Cancelar Edição
                </button>
              </div>

              <!-- Friend Button Component -->
              <FriendButton
                v-if="
                  !isOwnProfile && profileUser
                "
                :user-id="userId"
                :user-email="profileUser.email"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Profile Form -->
      <div
        v-if="
          showEditForm &&
          isOwnProfile &&
          profileUser
        "
        class="mb-8"
      >
        <ProfileEditForm
          :current-display-name="
            profileUser.displayName || ''
          "
          @updated="handleProfileUpdated"
          @cancel="toggleEditForm"
        />
      </div>

      <div class="mb-6">
        <h2
          class="text-xl font-semibold mb-4 text-gray-900"
        >
          Posts
        </h2>

        <LoadingSpinner
          v-if="postsStore.loading"
        />

        <div
          v-else-if="
            postsStore.posts.length === 0
          "
          class="bg-white shadow rounded-lg p-6 text-center"
        >
          <p class="text-gray-500">
            Nenhum post ainda
          </p>
          <router-link
            v-if="isOwnProfile"
            to="/"
            class="btn-primary mt-4 inline-block"
            >Criar seu primeiro post</router-link
          >
        </div>

        <PostList
          v-else
          :posts="postsStore.posts"
        />
      </div>
    </div>
  </div>
</template>
