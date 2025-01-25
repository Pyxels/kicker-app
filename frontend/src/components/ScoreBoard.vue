<template>
  <div
    class="bg-white rounded-xl shadow-md px-6 py-4 text-center w-full max-w-xs border border-gray-200"
  >
    <!-- score numbers -->
    <div
      class="flex items-center justify-center text-4xl font-bold text-gray-900 space-x-4"
    >
      <span :class="leftTeamColor">
        {{ leftTeamScore }}
      </span>
      <span>:</span>
      <span :class="rightTeamColor">{{ rightTeamScore }}</span>
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
import { computed } from "vue";

const props = defineProps<{
  leftTeam: string | undefined;
  rightTeam: string | undefined;
  leftTeamScore: number | undefined;
  rightTeamScore: number | undefined;
  rounds: ("l" | "r")[];
}>();

const leftTeamColor = computed(() => {
  if (
    props?.leftTeamScore === 0 &&
    props?.rightTeamScore !== 0 &&
    !props?.rounds?.includes("l")
  )
    return "text-red-500";
  if ((props?.leftTeamScore || 0) > (props?.rightTeamScore || 0))
    return "text-green-500";
  return "text-gray-800";
});

const rightTeamColor = computed(() => {
  if (
    props?.rightTeamScore === 0 &&
    props?.leftTeamScore !== 0 &&
    !props?.rounds?.includes("r")
  )
    return "text-red-500";
  if ((props?.rightTeamScore || 0) > (props?.leftTeamScore || 0))
    return "text-green-500";
  return "text-gray-800";
});
</script>
