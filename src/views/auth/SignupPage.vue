<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

const authStore = useAuthStore()
const router = useRouter()

async function handleSubmit() {
  if (!displayName.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Por favor, preencha todos os campos'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = 'As senhas não coincidem'
    return
  }
  
  if (password.value.length < 6) {
    error.value = 'A senha deve ter pelo menos 6 caracteres'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    await authStore.register(email.value, password.value, displayName.value)
    router.push('/')
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      error.value = 'Este email já está em uso'
    } else if (err.code === 'auth/invalid-email') {
      error.value = 'Email inválido'
    } else if (err.code === 'auth/weak-password') {
      error.value = 'A senha é muito fraca'
    } else {
      error.value = 'Erro ao criar conta. Tente novamente'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h1 class="text-center text-3xl font-bold leading-9 tracking-tight text-primary-600">Rede Social</h1>
      <h2 class="mt-3 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">Criar uma conta</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="displayName" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Nome de Exibição</label>
          <div class="mt-2">
            <input v-model="displayName" id="displayName" name="displayName" type="text" autocomplete="name" required 
              class="form-input block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Email</label>
          <div class="mt-2">
            <input v-model="email" id="email" name="email" type="email" autocomplete="email" required 
              class="form-input block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Senha</label>
          <div class="mt-2">
            <input v-model="password" id="password" name="password" type="password" autocomplete="new-password" required 
              class="form-input block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Confirmar Senha</label>
          <div class="mt-2">
            <input v-model="confirmPassword" id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" required 
              class="form-input block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-500 text-sm py-2">{{ error }}</div>

        <div>
          <button 
            type="submit" 
            :disabled="loading"
            class="flex w-full justify-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:bg-primary-300 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="mr-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            Criar Conta
          </button>
        </div>
      </form>

      <p class="mt-10 text-center text-sm text-gray-500">
        Já tem uma conta?
        <router-link to="/login" class="font-semibold leading-6 text-primary-600 hover:text-primary-500">Entrar</router-link>
      </p>
    </div>
  </div>
</template>