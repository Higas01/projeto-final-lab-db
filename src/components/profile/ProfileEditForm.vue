<script setup lang="ts">
import { ref } from 'vue';
i  <div
    class="b        <label
          for="display-name"
          class="block text-sm font-medium text-gray-700"
        >ite shadow rounded-lg p-6"
  >
    <h2
      class="text-lg font-medium text-gray-900 mb-4"
    >{ useAuthStore } from '../../stores/auth';

const props = defineProps<{
  currentDisplayName: string;
}>();

const emit = defineEmits<{
  (e: 'updated'): void;
  (e: 'cancel'): void;
}>();

const authStore = useAuthStore();

const displayName = ref(props.currentDisplayName);
const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  if (!displayName.value.trim()) {
    error.value =
      'Nome de exibição é obrigatório';
    return;
  }

  if (
    displayName.value.trim() ===
    props.currentDisplayName
  ) {
    error.value =
      'O nome deve ser diferente do atual';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await authStore.updateUserProfile(
      displayName.value.trim()
    );
    emit('updated');
  } catch (err: any) {
    error.value =
      err.message || 'Erro ao atualizar perfil';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h3
      class="text-lg font-medium text-gray-900 mb-4"
    >
      Editar Perfil
    </h3>

    <form
      @submit.prevent="handleSubmit"
      class="space-y-4"
    >
      <div>
        <label
          for="displayName"
          class="block text-sm font-medium text-gray-700"
        >
          Nome de Exibição
        </label>
        <input
          id="displayName"
          v-model="displayName"
          type="text"
          placeholder="Digite seu nome de exibição"
          class="form-input mt-1"
          :disabled="loading"
          maxlength="50"
        />
        <p class="text-xs text-gray-500 mt-1">
          Este nome será exibido em seus posts e
          comentários
        </p>
      </div>

      <div
        v-if="error"
        class="text-red-500 text-sm"
      >
        {{ error }}
      </div>

      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="emit('cancel')"
          class="btn-secondary"
          :disabled="loading"
        >
          Cancelar
        </button>

        <button
          type="submit"
          class="btn-primary"
          :disabled="
            loading ||
            !displayName.trim() ||
            displayName.trim() ===
              currentDisplayName
          "
        >
          <span v-if="loading" class="mr-2">
            <svg
              class="animate-spin h-4 w-4 text-white inline-block"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
          {{
            loading
              ? 'Salvando...'
              : 'Salvar Alterações'
          }}
        </button>
      </div>
    </form>
  </div>
</template>
