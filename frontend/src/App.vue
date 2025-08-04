<template>
  <div class="min-h-screen flex flex-col bg-gray-100 text-gray-900 select-none">
    <!-- header -->
    <header class="bg-white/90 backdrop-blur sticky top-0 z-50 shadow-sm border-b border-gray-200">
      <div class="relative max-w-4xl mx-auto px-6 py-4 flex items-center justify-center">
        <!-- title -->
        <div
          class="flex items-center gap-2 cursor-pointer select-none transition hover:opacity-90"
          @click="navigate('/')"
        >
          <TrophyIcon class="w-6 h-6 text-indigo-600" />
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Kicker App</h1>
        </div>

        <!-- hamburger -->
        <div class="absolute right-6 top-4 z-50">
          <div class="relative">
            <button
              class="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 focus:outline-none"
              @click="navOpen = !navOpen"
            >
              <Bars3Icon class="h-6 w-6 text-gray-600" />
            </button>

            <transition name="fade">
              <div
                v-if="navOpen"
                class="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg ring-1 ring-black/5 overflow-hidden"
              >
                <button
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="navigate('/account/settings')"
                >
                  Account
                </button>
                <button
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  @click="navigate('/logout')"
                >
                  Logout
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </header>

    <!-- main content -->
    <main class="flex-1 flex flex-col items-center px-4 py-6 space-y-6">
      <router-view />
    </main>

    <Toaster rich-colors />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { TrophyIcon, Bars3Icon } from '@heroicons/vue/24/solid';
import { Toaster } from 'vue-sonner';

const router = useRouter();
const navOpen = ref(false);

function navigate(path: string) {
  navOpen.value = false;
  router.push(path);
}
</script>
