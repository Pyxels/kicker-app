<template>
    <section>
      <div class="space-y-2 flex justify-center">
        <div class="flex flex-col items-center gap-4">
            <div
            class="w-30 h-30 rounded-full border border-white bg-gray-300 flex items-center justify-center text-4xl font-semibold text-white overflow-hidden"
            >
            <template v-if="user.avatar">
                <img
                :src="`${baseUrl}/api/files/users/${user.id}/${user.avatar}?thumb=250x250`"
                class="w-full h-full object-cover"
                :alt="user.name"
                />
            </template>
            <template v-else>
                {{ user.name?.charAt(0) ?? '?' }}
            </template>
            </div>
        </div>
      </div>
      <div class="text-3xl text-gray-600 truncate text-center w-full">
        {{ user.name }}
      </div>
    </section>
    <section>
      <h2 class="text-xl font-semibold mb-3">Recent Matches</h2>
      <ul v-if="recentMatches.length" class="space-y-4">
        <li v-for="match in recentMatches" :key="match.id">
          <MatchSummaryCard :match="match" :context-user-id="playerId" />
        </li>
      </ul>

      <div v-else class="text-gray-500 italic">No recent matches.</div>
    </section>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, Ref, computed } from 'vue';
import MatchSummaryCard from '@/components/MatchSummaryCard.vue';
import { baseUrl, pb, safe } from '@/lib/pb';
import { MatchDto } from '@/dto/match.dto';


const props = defineProps<{ playerId: string }>();
const recentMatches = ref<MatchDto[]>([]);
const user = ref<any>({});
const avatarUrl = computed(() => {
  return `${baseUrl}/api/files/users/${user.value.id}/${user.value.avatar}?thumb=200x200`;
});

onMounted(async () => {
  const matches = (await safe(() => pb.collection('match').getFullList<MatchDto>({
    filter: `(team1.id ?= "${props.playerId}") || (team2.id ?= "${props.playerId}")`,
    expand: "team1,team2"
  }))) || [];

  user.value = (await safe(() => pb.collection('users').getOne(props.playerId))) || {};

  recentMatches.value = matches as unknown as MatchDto[];
  
});

onUnmounted(() => {
  pb.collection('match').unsubscribe();
  pb.collection('goal').unsubscribe();
});


</script>
