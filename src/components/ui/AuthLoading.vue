<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"
  >
    <div class="text-center">
      <div
        class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"
      ></div>
      <h2
        class="text-xl font-semibold text-gray-900 dark:text-white mb-2"
      >
        Carregando...
      </h2>
      <p class="text-gray-500 dark:text-gray-400">
        Verificando sua sessão
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
