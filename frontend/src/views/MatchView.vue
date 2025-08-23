<template>
  <h1 class="text-2xl font-bold">Round {{ match?.rounds.length || 'Setup' }}</h1>

  <ScoreBoard :match="match" :bottom-team="bottomTeam" :top-team="topTeam" />

  <!-- player rows -->
  <div class="w-full flex flex-row gap-4 justify-center">
    <PlayerCard
      :user="playersMap[currentRound?.[topTeam.color].attacker || 'noop']"
      :color="topTeam.color"
      role="attacker"
      border="u"
      :goals="roundGoals"
      @event="handlePlayerClick"
    />
    <PlayerCard
      :user="playersMap[currentRound?.[topTeam.color].keeper || 'noop']"
      :color="topTeam.color"
      role="keeper"
      border="u"
      :goals="roundGoals"
      @event="handlePlayerClick"
    />
  </div>
  <div class="w-full flex flex-row gap-4 justify-center">
    <PlayerCard
      :user="playersMap[currentRound?.[bottomTeam.color].keeper || 'noop']"
      :color="bottomTeam.color"
      role="keeper"
      border="d"
      :goals="roundGoals"
      @event="handlePlayerClick"
    />
    <PlayerCard
      :user="playersMap[currentRound?.[bottomTeam.color].attacker || 'noop']"
      :color="bottomTeam.color"
      role="attacker"
      border="d"
      :goals="roundGoals"
      @event="handlePlayerClick"
    />
  </div>

  <!-- actions footer -->
  <div class="mt-auto px-4 py-6">
    <GameActions :match="match" @next="handleNextButton" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, Ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { RecordSubscription } from 'pocketbase';

import { pb, safe } from '@/lib/pb';
import PlayerCard from '@/components/PlayerCard.vue';
import ScoreBoard from '@/components/ScoreBoard.vue';
import GameActions from '@/components/GameActions.vue';

import { Action, GoalDto, isMatchOver, MatchDto, matchFetchOptions, Role, TeamColor, UserDto } from '@/dto/match.dto';

const props = defineProps<{ matchId: string }>();

const router = useRouter();

const match: Ref<MatchDto | null> = ref(null);
const roundGoals = ref<GoalDto[]>([]);

const playersMap = computed<Record<string, UserDto>>(() =>
  Object.values(match.value?.expand || {})
    .flat()
    .reduce((acc, user) => ({ ...acc, [user.id]: user }), {})
);
const currentRound = computed(() => match.value?.rounds?.at(-1));
const userInMatch = computed(
  () =>
    match.value?.team1.includes(pb.authStore.record?.id || 'not') ||
    match.value?.team2.includes(pb.authStore.record?.id || 'not') ||
    false
);
const bottomTeam = computed<{ color: TeamColor; name: 'team1' | 'team2' }>(() => {
  if (!currentRound.value || !match.value) return { color: 'black', name: 'team1' };
  if (!userInMatch.value)
    return {
      color: match.value.rounds.length % 2 === 0 ? 'blue' : 'black',
      name: 'team1',
    };
  return {
    color:
      currentRound.value.black.attacker === pb.authStore.record?.id ||
      currentRound.value.black.keeper === pb.authStore.record?.id
        ? 'black'
        : 'blue',
    name: match.value.team1.includes(pb.authStore.record?.id || 'noop') ? 'team1' : 'team2',
  };
});
const topTeam = computed<{ color: TeamColor; name: 'team1' | 'team2' }>(() => ({
  color: bottomTeam.value.color === 'black' ? 'blue' : 'black',
  name: bottomTeam.value.name === 'team2' ? 'team1' : 'team2',
}));
const matchOver = computed(() => isMatchOver(match.value));

onMounted(async () => {
  match.value = (await safe(() => pb.collection('match').getOne(props.matchId, matchFetchOptions))) || null;
  roundGoals.value =
    (await safe(() =>
      pb.collection('goal').getFullList({
        fields: 'user',
        filter: `match = "${props.matchId}" && round = ${match.value?.rounds?.length} && action = "goal"`,
      })
    )) || [];

  pb.collection('match').subscribe(
    props.matchId,
    (e: RecordSubscription<MatchDto>) => {
      match.value = e.record;
    },
    matchFetchOptions
  );
  pb.collection('goal').subscribe(
    '*',
    (e: RecordSubscription<GoalDto>) => {
      if (e.action === 'create') roundGoals.value.push(e.record);
    },
    { filter: `match = "${props.matchId}" && action = "goal"`, fields: 'user' }
  );
});

onUnmounted(() => {
  pb.collection('match').unsubscribe();
  pb.collection('goal').unsubscribe();
});

async function handlePlayerClick(event: { playerId: string; color: TeamColor; role: Role; action: Action }) {
  if (!currentRound.value || !match.value) return;
  if (!currentRound.value.start) return;
  if (!!currentRound.value.end) {
    router.push(`/player/${event.playerId}`);
    return;
  };

  const newScore = currentRound.value[event.color].score + 1;
  const end = newScore === 5 ? new Date().toISOString() : undefined;
  const isTeam1 = match.value.team1.includes(event.id);
  const team1_score = isTeam1 ? match.value.team1_score + 1 : match.value.team1_score;
  const team2_score = isTeam1 ? match.value.team2_score : match.value.team2_score + 1;
  const newMatch = {
    team1_score,
    team2_score,
    rounds: [
      ...match.value.rounds.slice(0, -1),
      {
        ...currentRound.value,
        [event.color]: {
          ...currentRound.value[event.color],
          score: newScore,
        },
        end,
      },
    ],
  };

  await safe(() =>
    pb.collection('match').update(props.matchId, {
      ...newMatch,
      end: isMatchOver(newMatch) ? new Date() : undefined,
    })
  );

  await safe(() =>
    pb.collection('goal').create({
      match: props.matchId,
      user: event.playerId,
      team: event.color,
      role: event.role,
      action: event.action,
      round: match.value?.rounds.length || 0,
    })
  );
}

async function handleNextButton() {
  if (!currentRound.value || !match.value) return;

  if (!currentRound.value.start) {
    await safe(() =>
      pb.collection('match').update(props.matchId, {
        start: match.value!.start || new Date(),
        rounds: [
          ...match.value!.rounds.slice(0, -1),
          {
            ...currentRound.value,
            start: new Date(),
          },
        ],
      })
    );
    return;
  }

  if (matchOver.value) {
    router.push(`/`);
    return;
  }

  if (currentRound.value.end) {
    pb.collection('match').update(props.matchId, {
      rounds: [
        ...match.value.rounds,
        {
          black: {
            attacker: currentRound.value.blue.keeper,
            keeper: currentRound.value.blue.attacker,
            score: 0,
          },
          blue: {
            attacker: currentRound.value.black.keeper,
            keeper: currentRound.value.black.attacker,
            score: 0,
          },
        },
      ],
    });
    roundGoals.value = [];
  }
}
</script>
