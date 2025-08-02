<template>
  <div class="min-h-screen bg-gray-100 text-gray-900 p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-6 text-center">Kicker App</h1>

      <!-- new game section -->
      <section>
        <h2 class="text-xl font-semibold mb-3">Start a New Match</h2>
        <div
          @click="startNewGame"
          class="group cursor-pointer bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl hover:scale-[1.02] flex items-center justify-between"
        >
          <div>
            <h3 class="text-2xl font-semibold">New Game</h3>
            <p class="text-sm opacity-90 mt-1">
              Create a new match and assign players
            </p>
          </div>
          <div class="shrink-0">
            <PlusIcon
              class="w-10 h-10 text-white opacity-90 group-hover:opacity-100"
            />
          </div>
        </div>
      </section>

      <!-- TODO currently ongoing matches -->
      <section class="mt-10">
        <h2 class="text-xl font-semibold mb-3">Live Matches</h2>
        <div class="text-gray-500 italic">No active matches.</div>
      </section>

      <!-- TODO match history -->
      <section class="mt-10">
        <h2 class="text-xl font-semibold mb-3">Recent Matches</h2>
        <div class="text-gray-500 italic">No active matches.</div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { PlusIcon } from "@heroicons/vue/24/solid";

const router = useRouter();

function startNewGame() {
  router.push("/match");
}
</script>
