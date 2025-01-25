<template>
  <div
    :class="[
      `w-full max-w-xs rounded-xl p-4 shadow-md `,
      props.border === 'l' ? 'border-l-8' : 'border-r-8',
      props.color === 'blue' ? 'border-blue-600' : 'border-stone-700',
      'bg-white text-gray-900',
    ]"
    @click="
      emit('goal', { id: props.user?.id, color: props.color, role: props.role })
    "
  >
    <div class="text-lg font-semibold mb-2">{{ props.user?.name }}</div>

    <div class="flex items-center text-sm text-gray-600">
      <component :is="roleIcon" class="w-5 h-5" />
      <span class="capitalize">{{ props.role }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { ShieldCheckIcon, BoltIcon } from "@heroicons/vue/24/solid";
import { UserDto } from "@/dto/match.dto";

const emit = defineEmits(["goal"]);
const props = defineProps<{
  user?: UserDto;
  color: "blue" | "black";
  role: "attacker" | "keeper";
  border: "l" | "r";
}>();

const roleIcon = computed(() =>
  props.role === "attacker" ? BoltIcon : ShieldCheckIcon,
);
</script>
