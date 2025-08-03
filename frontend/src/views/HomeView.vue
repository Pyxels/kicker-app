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
        <li
          v-for="match in liveMatches"
          :key="match.id"
          class="cursor-pointer bg-white p-4 rounded-xl shadow hover:shadow-md transition space-y-3"
          @click="goToMatch(match.id)"
        >
          <!-- Top: Title & timer -->
          <div class="flex justify-between items-center">
            <h3 class="font-semibold text-gray-800">Match {{ match.id }}</h3>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <ClockIcon class="w-4 h-4" />
              {{ getElapsedTime(match.start, match.end) }}
            </div>
          </div>

          <!-- Bottom: Teams + Score -->
          <div class="grid grid-cols-3 gap-2 items-center text-sm">
            <div :class="[getLeadingTeam(match) === 1 ? 'text-green-600 font-semibold' : 'text-gray-700', 'truncate']">
              {{ getTeamNames(match, 1) }} ({{ match.team1_score }})
            </div>

            <div class="text-center text-gray-500 font-medium">
              {{ getTeamScore(match) }}
            </div>

            <div
              :class="[
                getLeadingTeam(match) === 2 ? 'text-green-600 font-semibold' : 'text-gray-700',
                'text-right truncate',
              ]"
            >
              {{ getTeamNames(match, 2) }} ({{ match.team2_score }})
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- TODO recent matches -->
    <section>
      <h2 class="text-xl font-semibold mb-3">Recent Matches</h2>
      <ul v-if="recentMatches.length" class="space-y-4">
        <li
          v-for="match in recentMatches"
          :key="match.id"
          :class="[
            'cursor-pointer bg-white p-4 rounded-xl shadow hover:shadow-md transition space-y-3',
            getMatchOutcomeColor(match),
          ]"
          @click="goToMatch(match.id)"
        >
          <!-- Top: Title & time ended -->
          <div class="flex justify-between items-center">
            <h3 class="font-semibold text-gray-800">Match #{{ match.id }}</h3>
            <div class="text-sm text-gray-500">
              {{ formatEndTime(match.end) }}
            </div>
          </div>

          <!-- Bottom: Teams + Score -->
          <div class="grid grid-cols-3 gap-2 items-center text-sm">
            <div :class="[getLeadingTeam(match) === 1 ? 'text-green-600 font-semibold' : 'text-gray-700', 'truncate']">
              {{ getTeamNames(match, 1) }} ({{ match.team1_score }})
            </div>

            <div class="text-center text-gray-500 font-medium">
              {{ getTeamScore(match) }}
            </div>

            <div
              :class="[
                getLeadingTeam(match) === 2 ? 'text-green-600 font-semibold' : 'text-gray-700',
                'text-right truncate',
              ]"
            >
              {{ getTeamNames(match, 2) }} ({{ match.team2_score }})
            </div>
          </div>
        </li>
      </ul>

      <div v-else class="text-gray-500 italic">No recent matches.</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { PlusIcon, ClockIcon } from '@heroicons/vue/24/solid';

import { pb, safe } from '@/lib/pb';
import { elapsedTime } from '@/lib/time';
import { MatchDto, matchFetchOptions, UserDto } from '@/dto/match.dto';
import { RecordSubscription } from 'pocketbase';

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
  ).toSorted((a, b) => new Date(b.created || '').getTime() - new Date(a.created || '').getTime());
}

function getLeadingTeam(match: MatchDto): 1 | 2 | 0 {
  if (match.team1_score > match.team2_score) return 1;
  if (match.team2_score > match.team1_score) return 2;
  return 0;
}

function getTeamNames(match: MatchDto, team: 1 | 2): string {
  const teamKey = team === 1 ? 'team1' : 'team2';
  return match.expand?.[teamKey]?.map((p: UserDto) => p.name).join(' & ') || '';
}

function getTeamScore(match: MatchDto): string {
  const r = match.rounds.at(-1);
  if (!r) return '';
  const team1Color = match.rounds.length % 2 === 0 ? 'blue' : 'black';
  const team2Color = match.rounds.length % 2 === 0 ? 'black' : 'blue';
  const t1 = r[team1Color].score;
  const t2 = r[team2Color].score;
  return `${t1} : ${t2}`;
}

function formatEndTime(end?: string): string {
  if (!end) return '';
  return new Date(end).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function getMatchOutcomeColor(match: MatchDto): string {
  const userId = pb.authStore.record?.id;
  if (!userId) return '';

  const team1Ids = match.expand?.team1?.map((u: UserDto) => u.id) || [];
  const team2Ids = match.expand?.team2?.map((u: UserDto) => u.id) || [];

  const isTeam1 = team1Ids.includes(userId);
  const isTeam2 = team2Ids.includes(userId);

  if (!isTeam1 && !isTeam2) return '';

  const team1Wins = match.team1_score > match.team2_score;
  const userWon = (isTeam1 && team1Wins) || (isTeam2 && !team1Wins);

  return userWon ? 'border-2 border-green-500' : 'border-2 border-red-500';
}

function getElapsedTime(start?: string, end?: string) {
  if (!start) return;
  return elapsedTime(start, now, end);
}

function startNewGame() {
  router.push('/match');
}

function goToMatch(id: string) {
  router.push(`/match/${id}`);
}
</script>
