<template>
  <div
    class="w-48 bg-white text-gray-900 rounded-2xl shadow-lg flex flex-col items-center p-4 overflow-hidden"
    :class="[border === 'u' ? 'border-t-7' : 'border-b-7', color === 'blue' ? 'border-blue-500' : 'border-gray-800']"
    @click="
      emit('event', {
        id: props.user?.id,
        color: props.color,
        role: props.role,
        action: 'goal',
      })
    "
  >
    <!-- avatar or initial -->
    <div
      class="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4"
      :class="[
        user?.avatar ? '' : 'bg-opacity-80',
        color === 'blue' ? 'bg-blue-500 border-blue-400' : 'bg-gray-800 border-gray-700',
      ]"
    >
      <template v-if="user?.avatar">
        <img
          :src="`http://localhost:8090/api/files/users/${user.id}/${user.avatar}?thumb=100x100`"
          alt="avatar"
          class="w-full h-full rounded-full object-cover"
        >
      </template>
      <template v-else>
        {{ user?.name?.charAt(0) ?? '?' }}
      </template>
    </div>

    <!-- name -->
    <div class="mt-3 text-center">
      <div class="text-lg font-semibold truncate">
        {{ user?.name || 'Unknown' }}
      </div>

      <!-- role tag -->
      <div
        class="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium"
        :class="color === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'"
      >
        <span v-if="role === 'attacker'">⚽️ Attacker</span>
        <span v-else>🛡️ Keeper</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Role, TeamColor, UserDto } from '@/dto/match.dto';

  const emit = defineEmits(['event']);
  const props = defineProps<{
    user?: UserDto;
    color: TeamColor;
    role: Role;
    border: 'u' | 'd';
  }>();
</script>
