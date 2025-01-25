<template>
  <div
    class="bg-white rounded-xl shadow-md px-6 py-4 w-full max-w-xs border border-gray-200"
  >
    <h2 class="text-lg font-semibold text-gray-700 mb-4 text-center">
      Actions
    </h2>

    <div class="flex justify-between gap-3">
      <button
        @click="$emit('undo')"
        class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded"
      >
        Undo
      </button>

      <button
        @click="$emit('next')"
        class="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-600 font-medium px-4 py-2 rounded"
      >
        {{ props.continueLabel }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineEmits(["undo", "next"]);
const props = defineProps<{ continueLabel: string }>();
</script>
