<template>
  <div class="bg-white rounded-xl shadow-md px-6 py-5 w-full max-w-xs border border-gray-200">
    <h2 class="text-xl font-semibold text-gray-800 mb-5 text-center">
      Actions
    </h2>

    <div class="flex gap-3 justify-center items-center">
      <!-- undo -->
      <button
        class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 flex justify-center items-center"
        title="Undo"
        @click="$emit('undo')"
      >
        <ArrowUturnLeftIcon class="w-6 h-6" />
      </button>

      <!-- next/finish action -->
      <button
        :disabled="!!roundInProgress"
        class="flex-1 px-4 py-2 rounded-lg transition-colors duration-200 flex justify-center items-center"
        :class="[
          matchOver
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : roundNotStarted
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : roundInProgress
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white',
        ]"
        @click="$emit('next')"
      >
        <component
          :is="currentIcon"
          class="w-6 h-6"
        />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ArrowUturnLeftIcon, ArrowRightIcon, PlayIcon, PauseCircleIcon, FlagIcon } from '@heroicons/vue/24/solid';

  import { computed } from 'vue';
  import { MatchDto } from '@/dto/match.dto';

  defineEmits(['undo', 'next']);

  const props = defineProps<{
    match: MatchDto | null;
  }>();

  const currentRound = computed(() => {
    return props.match?.rounds.at(-1);
  });

  const matchOver = computed(() => {
    let t1 = 0;
    let t2 = 0;
    return props.match?.rounds.some((r, i) => {
      const t1Score = i % 2 === 0 ? r.blue.score : r.black.score;
      const t2Score = i % 2 === 0 ? r.black.score : r.blue.score;
      if (t1Score === 5) t1++;
      if (t2Score === 5) t2++;
      return t1 === 2 || t2 === 2;
    });
  });
  const roundOver = computed(() => currentRound.value?.end);
  const roundNotStarted = computed(() => !currentRound.value?.start);
  const roundInProgress = computed(() => currentRound.value?.start && !currentRound.value?.end);

  const currentIcon = computed(() => {
    if (matchOver.value) return FlagIcon;
    if (roundNotStarted.value || roundOver.value) return PlayIcon;
    if (roundInProgress.value) return PauseCircleIcon;
    return ArrowRightIcon;
  });
</script>
