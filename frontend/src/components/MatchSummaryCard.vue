<template>
  <div
    :class="`cursor-pointer bg-white p-5 rounded-2xl shadow hover:shadow-md transition-all duration-200 space-y-4 ${getMatchOutcomeColor()}`"
    @click="router.push(`/match/${match.id}`)"
  >
    <!-- top: match id & time -->
    <div v-if="inProgress">
      <h3 class="text-lg text-center font-semibold text-gray-800">Round {{ match.rounds.length }}</h3>
      <div class="h-px bg-gray-100"></div>
    </div>

    <!-- bottom: teams & score -->
    <div class="grid grid-cols-3 items-center text-sm">
      <div class="flex items-left gap-2 overflow-hidden">
        <div class="flex flex-col items-center">
          <div class="flex -space-x-2">
            <div
              v-for="user in match.expand?.team1 || []"
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
          <!-- round history -->
          <div class="flex items-center gap-1 pt-1">
            <span
              v-for="i in [0, 1, 2]"
              :key="i"
              class="w-3 h-3 rounded-full"
              :class="[
                getRoundResult(i, 1) === 'win'
                  ? 'bg-green-400'
                  : getRoundResult(i, 1) === 'loss'
                    ? 'bg-red-400'
                    : 'bg-gray-300',
              ]"
            />
          </div>
        </div>
      </div>

      <!-- score -->
      <div class="flex flex-col items-center">
        <div class="flex mb-3 gap-1 text-sm text-gray-600">
          <ClockIcon v-if="inProgress" class="w-4 h-4 text-indigo-500" />
          <span>{{ timeOrDate }}</span>
        </div>
        <div class="text-center text-xl font-bold text-gray-800">
          {{ getTeamScore() }}
        </div>
      </div>

      <div class="flex flex-col items-end gap-2 overflow-hidden">
        <div class="flex flex-col items-center">
          <div class="flex -space-x-2">
            <div
              v-for="user in match.expand?.team2 || []"
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

          <!-- round history -->
          <div class="flex items-center gap-1 pt-1">
            <span
              v-for="i in [0, 1, 2]"
              :key="i"
              class="w-3 h-3 rounded-full"
              :class="[
                getRoundResult(i, 2) === 'win'
                  ? 'bg-green-400'
                  : getRoundResult(i, 2) === 'loss'
                    ? 'bg-red-400'
                    : 'bg-gray-300',
              ]"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ClockIcon } from '@heroicons/vue/24/solid';

import { MatchDto, UserDto } from '@/dto/match.dto';
import { elapsedTime, formatShortDate } from '@/lib/time';
import { baseUrl, pb } from '@/lib/pb';

const props = defineProps<{
  match: MatchDto;
  contextUserId?: string
}>();

const router = useRouter();
const now = ref(Date.now());

onMounted(() => {
  window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

const inProgress = computed(() => !props.match.end);
const timeOrDate = computed(() => {
  if (!props.match.rounds.at(-1)?.start) return 'starting...';
  if (inProgress.value) return elapsedTime(props.match.rounds.at(-1)!.start!, now, props.match.end);

  return formatShortDate(props.match.end);
});

function getRoundResult(index: number, team: 1 | 2): 'win' | 'loss' | 'draw' {
  const isTeam1Black = index % 2 === 0;
  const team1Color = isTeam1Black ? 'black' : 'blue';
  const team2Color = isTeam1Black ? 'blue' : 'black';

  const team1Score = props.match.rounds[index]?.[team1Color]?.score ?? 0;
  const team2Score = props.match.rounds[index]?.[team2Color]?.score ?? 0;

  const result = team1Score === 5 ? 1 : team2Score === 5 ? 2 : 0;

  if (result === 0) return 'draw';
  return result === team ? 'win' : 'loss';
}

function getTeamScore(): string {
  if (!inProgress.value) return `${props.match.team1_score} : ${props.match.team2_score}`;
  const r = props.match.rounds.at(-1);
  if (!r) return '';
  const team1Color = props.match.rounds.length % 2 === 0 ? 'blue' : 'black';
  const team2Color = team1Color === 'blue' ? 'black' : 'blue';
  return `${r[team1Color].score} : ${r[team2Color].score}`;
}

function getMatchOutcomeColor(): string {
  if (inProgress.value) return '';
  const userId = props.contextUserId || pb.authStore.record?.id;
  if (!userId) return '';

  const team1Ids = props.match.expand?.team1?.map((u: UserDto) => u.id) || [];
  const team2Ids = props.match.expand?.team2?.map((u: UserDto) => u.id) || [];

  if (!team1Ids.includes(userId) && !team2Ids.includes(userId)) return '';

  const wins = props.match.rounds.filter(
    (r) =>
      (r.black.score === 5 && [r.black.attacker, r.black.keeper].includes(userId)) ||
      (r.blue.score === 5 && [r.blue.attacker, r.blue.keeper].includes(userId))
  ).length;

  return wins === 2 ? 'border-2 border-green-500' : 'border-2 border-red-500';
}
</script>
