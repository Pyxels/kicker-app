<template>
  <div
    class="bg-white rounded-xl shadow-md px-6 py-4 text-center w-full max-w-100 border border-gray-200"
  >
    <!-- score numbers -->
    <div
      class="flex items-center justify-center text-4xl font-bold text-gray-900 space-x-4"
    >
      <div class="flex flex-col items-center">
        <span :class="leftTeamColor">{{ leftTeamScore }}</span>
        <span class="text-xs text-gray-500">({{ leftTeamScoreTotal }})</span>
      </div>
      <span>:</span>
      <div class="flex flex-col items-center">
        <span :class="rightTeamColor">{{ rightTeamScore }}</span>
        <span class="text-xs text-gray-500">({{ rightTeamScoreTotal }})</span>
      </div>
    </div>

    <!-- timer display -->
    <div
      class="mt-1 text-sm text-gray-500 font-mono flex items-center justify-center gap-1"
    >
      <ClockIcon class="w-4 h-4" />
      {{ elapsedFormatted || "-:-" }}
    </div>

    <!-- player names -->
    <div class="mt-2 text-sm text-gray-600 flex justify-between font-medium">
      <span class="inline-block truncate" style="max-width: 15ch">{{
        leftTeam
      }}</span>
      <span class="inline-block truncate" style="max-width: 15ch">{{
        rightTeam
      }}</span>
    </div>

    <!-- round win/loss indicators -->
    <div class="mt-2 flex justify-between items-center">
      <div class="flex space-x-1">
        <span
          v-for="(result, index) in rounds"
          :key="'p1-' + index"
          :class="[
            'w-3 h-3 rounded-full',
            result === 'l' ? 'bg-green-500' : 'bg-red-500',
          ]"
        />
      </div>
      <div class="flex space-x-1">
        <span
          v-for="(result, index) in rounds"
          :key="'p2-' + index"
          :class="[
            'w-3 h-3 rounded-full',
            result === 'r' ? 'bg-green-500' : 'bg-red-500',
          ]"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { ClockIcon } from "@heroicons/vue/24/outline";

import { elapsedTime } from "@/lib/time";

const props = defineProps<{
  leftTeam: string | undefined;
  rightTeam: string | undefined;
  leftTeamScore: number | undefined;
  leftTeamScoreTotal: number | undefined;
  rightTeamScore: number | undefined;
  rightTeamScoreTotal: number | undefined;
  roundStart: string | undefined;
  roundEnd: string | undefined;
  rounds: any[]; // TODO later
}>();

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
  if (props?.leftTeamScore === 0 && props?.leftTeamScoreTotal === 0)
    return "text-red-500";
  if ((props?.leftTeamScore || 0) > (props?.rightTeamScore || 0))
    return "text-green-500";
  return "text-gray-800";
});

const rightTeamColor = computed(() => {
  if (props?.rightTeamScore === 0 && props?.rightTeamScoreTotal === 0)
    return "text-red-500";
  if ((props?.rightTeamScore || 0) > (props?.leftTeamScore || 0))
    return "text-green-500";
  return "text-gray-800";
});

const elapsedFormatted = computed(() => {
  if (!props.roundStart) return null;

  return elapsedTime(props.roundStart, now, props.roundEnd);
});
</script>
