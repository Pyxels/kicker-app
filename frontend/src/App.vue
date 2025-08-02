<template>
  <div class="min-h-screen flex flex-col bg-gray-100 text-gray-900">
    <!-- header -->
    <header
      class="bg-white/90 backdrop-blur sticky top-0 z-50 shadow-sm border-b border-gray-200"
    >
      <div
        class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center cursor-pointer select-none transition hover:opacity-90"
        @click="router.push('/')"
      >
        <TrophyIcon class="w-6 h-6 mr-2 text-indigo-600" />
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Kicker App
        </h1>
      </div>
    </header>

    <!-- main content -->
    <main class="flex-1 flex flex-col items-center px-4 py-6 space-y-6">
      <router-view />
    </main>

    <Toaster richColors />
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { Toaster } from "vue-sonner";
import { TrophyIcon } from "@heroicons/vue/24/solid";
import "vue-sonner/style.css";

const router = useRouter();
</script>
