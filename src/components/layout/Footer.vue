<template>
  <footer class="bg-white shadow mt-auto py-4">
    <div
      class="container mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div
        class="flex flex-col items-center md:flex-row md:justify-between"
      >
        <div
          class="text-center md:text-left mb-4 md:mb-0"
        >
          <span class="text-sm text-gray-500"
            >© {{ new Date().getFullYear() }} Rede
            Social. Todos os direitos
            reservados.</span
          >
        </div>
        <div class="flex space-x-6">
          <a
            href="#"
            class="text-gray-500 hover:text-primary-500"
          >
            <span class="sr-only">Termos</span>
            <span>Termos de Serviço</span>
          </a>
          <a
            href="#"
            class="text-gray-500 hover:text-primary-500"
          >
            <span class="sr-only"
              >Privacidade</span
            >
            <span>Política de Privacidade</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
