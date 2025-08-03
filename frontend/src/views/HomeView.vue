<template>
  <div class="w-full max-w-2xl mx-auto space-y-10">
    <!-- new game section -->
    <section>
      <h2 class="text-xl font-semibold mb-3">Start a New Match</h2>
      <div
        class="group cursor-pointer bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl hover:scale-[1.02] flex items-center justify-between"
        @click="startNewGame"
      >
        <div>
          <h3 class="text-2xl font-semibold">New Game</h3>
          <p class="text-sm opacity-90 mt-1">Create a new match and assign players</p>
        </div>
        <div class="shrink-0">
          <PlusIcon class="w-10 h-10 text-white opacity-90 group-hover:opacity-100" />
        </div>
      </div>
    </section>

    <!-- currently ongoing matches -->
    <section>
      <h2 class="text-xl font-semibold mb-3 flex items-center gap-2">
        Ongoing Matches
        <span class="flex items-center gap-1 text-red-600 text-sm font-semibold">
          <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          LIVE
        </span>
      </h2>

      <div v-if="liveMatches.length === 0" class="text-gray-500 italic">No active matches.</div>

      <ul v-else class="space-y-4">
        <li v-for="match in liveMatches" :key="match.id">
          <MatchSummaryCard :match="match" />
        </li>
      </ul>
    </section>

    <section>
      <h2 class="text-xl font-semibold mb-3">Recent Matches</h2>
      <ul v-if="recentMatches.length" class="space-y-4">
        <li v-for="match in recentMatches" :key="match.id">
          <MatchSummaryCard :match="match" />
        </li>
      </ul>

      <div v-else class="text-gray-500 italic">No recent matches.</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { PlusIcon } from '@heroicons/vue/24/solid';

import { pb, safe } from '@/lib/pb';
import { MatchDto, matchFetchOptions } from '@/dto/match.dto';
import { RecordSubscription } from 'pocketbase';
import MatchSummaryCard from '@/components/MatchSummaryCard.vue';

const router = useRouter();

const now = ref(Date.now());
let interval: number;
const matches = ref<MatchDto[]>([]);

const liveMatches = computed(() => matches.value.filter((m) => !m.end));

const recentMatches = computed(() => matches.value.filter((m) => m.end));

onMounted(async () => {
  interval = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
  await updateMatches();

  pb.collection('match').subscribe(
    '*',
    (e: RecordSubscription<MatchDto>) => {
      console.debug(`action '${e.action}' for match ${e.record?.id}`);
      updateMatches();
    },
    matchFetchOptions
  );
});

onUnmounted(async () => {
  pb.collection('match').unsubscribe('*');
  clearInterval(interval);
});

async function updateMatches() {
  matches.value = (
    ((await safe(() =>
      pb.collection('match').getFullList({ ...matchFetchOptions, sort: '-updated' })
    )) as MatchDto[]) || []
  ).toSorted((a, b) => new Date(b.end || b.created!).getTime() - new Date(a.end || a.created!).getTime());
}

function startNewGame() {
  router.push('/match');
}
</script>
