<template>
  <div class="bg-white rounded-xl shadow-md px-6 py-4 text-center w-full max-w-100 border border-gray-200">
    <!-- score numbers -->
    <div class="flex items-center justify-between text-4xl font-bold text-gray-900">
      <div class="flex items-center gap-1 pt-1 ml-4">
        <span
          v-for="i in [0, 1, 2]"
          :key="i"
          class="w-3 h-3 rounded-full"
          :class="[
            getRoundResult(i, bottomTeam.name) === 'win'
              ? 'bg-green-400'
              : getRoundResult(i, bottomTeam.name) === 'loss'
                ? 'bg-red-400'
                : 'bg-gray-300',
          ]"
        />
      </div>
      <div class="flex space-x-3">
        <div class="flex flex-col items-center">
          <span :class="leftTeamColor">{{ leftTeamscore }}</span>
          <span class="text-xs text-gray-500">({{ leftTeamscoreTotal }})</span>
        </div>
        <span>:</span>
        <div class="flex flex-col items-center">
          <span :class="rightTeamColor">{{ rightTeamscore }}</span>
          <span class="text-xs text-gray-500">({{ rightTeamscoreTotal }})</span>
        </div>
      </div>
      <div class="flex items-center gap-1 pt-1 mr-4">
        <span
          v-for="i in [0, 1, 2]"
          :key="i"
          class="w-3 h-3 rounded-full"
          :class="[
            getRoundResult(i, topTeam.name) === 'win'
              ? 'bg-green-400'
              : getRoundResult(i, topTeam.name) === 'loss'
                ? 'bg-red-400'
                : 'bg-gray-300',
          ]"
        />
      </div>
    </div>

    <!-- timer display -->
    <div class="mt-1 text-sm text-gray-500 font-mono flex items-center justify-center gap-1">
      <ClockIcon class="w-4 h-4" />
      {{ elapsedFormatted || '-:-' }}
    </div>

    <!-- player names -->
    <div class="mt-2 text-sm text-gray-600 flex justify-between font-medium">
      <div class="flex -space-x-2">
        <div
          v-for="user in match?.expand?.[bottomTeam.name] || []"
          :key="user.id"
          class="flex flex-col items-center space-y-1 w-14"
        >
          <div
            class="w-10 h-10 rounded-full border border-white bg-gray-300 flex items-center justify-center text-sm font-semibold text-white overflow-hidden"
          >
            <template v-if="user.avatar">
              <img
                :src="`${baseUrl}/api/files/users/${user.id}/${user.avatar}?thumb=50x50`"
                class="w-full h-full object-cover"
                :alt="user.name"
              />
            </template>
            <template v-else>
              {{ user.name?.charAt(0) ?? '?' }}
            </template>
          </div>
          <span class="text-xs text-gray-600 truncate text-center max-w-[3.5rem]">
            {{ user.name }}
          </span>
        </div>
      </div>
      <div class="flex -space-x-2">
        <div
          v-for="user in match?.expand?.[topTeam.name] || []"
          :key="user.id"
          class="flex flex-col items-center space-y-1 w-14"
        >
          <div
            class="w-10 h-10 rounded-full border border-white bg-gray-300 flex items-center justify-center text-sm font-semibold text-white overflow-hidden"
          >
            <template v-if="user.avatar">
              <img
                :src="`${baseUrl}/api/files/users/${user.id}/${user.avatar}?thumb=50x50`"
                class="w-full h-full object-cover"
                :alt="user.name"
              />
            </template>
            <template v-else>
              {{ user.name?.charAt(0) ?? '?' }}
            </template>
          </div>
          <span class="text-xs text-gray-600 truncate text-center max-w-[3.5rem]">
            {{ user.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- TODO round win/loss indicators -->
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ClockIcon } from '@heroicons/vue/24/outline';

import { elapsedTime } from '@/lib/time';
import { MatchDto, TeamColor } from '@/dto/match.dto';
import { baseUrl } from '@/lib/pb';

const props = defineProps<{
  match: MatchDto | null;
  bottomTeam: { color: TeamColor; name: 'team1' | 'team2' };
  topTeam: { color: TeamColor; name: 'team1' | 'team2' };
}>();

const leftTeamscore = computed(() => props.match?.rounds.at(-1)?.[props.bottomTeam.color].score);
const rightTeamscore = computed(() => props.match?.rounds.at(-1)?.[props.topTeam.color].score);
const leftTeamscoreTotal = computed(() => props.match?.[`${props.bottomTeam.name}_score`]);
const rightTeamscoreTotal = computed(() => props.match?.[`${props.topTeam.name}_score`]);
const roundStart = computed(() => props.match?.rounds.at(-1)?.start);
const roundEnd = computed(() => props.match?.rounds.at(-1)?.end);

const now = ref(Date.now());
let interval: number;

onMounted(() => {
  interval = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(interval);
});

const leftTeamColor = computed(() => {
  if (leftTeamscore.value === 0 && leftTeamscoreTotal.value === 0) return 'text-red-500';
  if ((leftTeamscore.value || 0) > (rightTeamscore.value || 0)) return 'text-green-500';
  return 'text-gray-800';
});

const rightTeamColor = computed(() => {
  if (rightTeamscore.value === 0 && rightTeamscoreTotal.value === 0) return 'text-red-500';
  if ((rightTeamscore.value || 0) > (leftTeamscore.value || 0)) return 'text-green-500';
  return 'text-gray-800';
});

const elapsedFormatted = computed(() => {
  if (!roundStart.value) return null;

  return elapsedTime(roundStart.value, now, roundEnd.value);
});

function getRoundResult(index: number, team: 'team1' | 'team2'): 'win' | 'loss' | 'draw' {
  const isTeam1Black = index % 2 === 0;
  const team1Color = isTeam1Black ? 'black' : 'blue';
  const team2Color = isTeam1Black ? 'blue' : 'black';

  const team1Score = props.match?.rounds[index]?.[team1Color]?.score ?? 0;
  const team2Score = props.match?.rounds[index]?.[team2Color]?.score ?? 0;

  const result = team1Score === 5 ? 'team1' : team2Score === 5 ? 'team2' : 'draw';

  if (result === 'draw') return 'draw';
  return result === team ? 'win' : 'loss';
}
</script>
