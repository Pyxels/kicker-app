<template>
  <div class="min-h-screen flex flex-col items-center px-4 py-6 space-y-6">
    <h1 class="text-2xl font-bold">
      Round {{ match?.rounds.length || "Setup" }}
    </h1>

    <!-- score board - TODO rounds -->
    <ScoreBoard
      :leftTeam="
        match?.expand[bottomTeam.name].map((p: UserDto) => p.name).join(' ')
      "
      :rightTeam="
        match?.expand[topTeam.name].map((p: UserDto) => p.name).join(' ')
      "
      :leftTeamScore="currentRound?.[bottomTeam.color].score"
      :rightTeamScore="currentRound?.[topTeam.color].score"
      :leftTeamScoreTotal="match?.[`${bottomTeam.name}_score`]"
      :rightTeamScoreTotal="match?.[`${topTeam.name}_score`]"
      :roundStart="currentRound?.start"
      :roundEnd="currentRound?.end"
      :rounds="[]"
    />

    <!-- player rows -->
    <div class="w-full flex flex-row gap-4 justify-center">
      <PlayerCard
        :user="playersMap[currentRound?.[topTeam.color].attacker || 'noop']"
        :color="topTeam.color"
        role="attacker"
        border="u"
        @event="handleGoal"
      />
      <PlayerCard
        :user="playersMap[currentRound?.[topTeam.color].keeper || 'noop']"
        :color="topTeam.color"
        role="keeper"
        border="u"
        @event="handleGoal"
      />
    </div>
    <div class="w-full flex flex-row gap-4 justify-center">
      <PlayerCard
        :user="playersMap[currentRound?.[bottomTeam.color].keeper || 'noop']"
        :color="bottomTeam.color"
        role="keeper"
        border="d"
        @event="handleGoal"
      />
      <PlayerCard
        :user="playersMap[currentRound?.[bottomTeam.color].attacker || 'noop']"
        :color="bottomTeam.color"
        role="attacker"
        border="d"
        @event="handleGoal"
      />
    </div>

    <!-- actions footer -->
    <div class="mt-auto px-4 py-6">
      <GameActions :match="match" @next="handleNextButton" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, Ref, computed } from "vue";
import { useRouter } from "vue-router";
import PocketBase, { RecordSubscription } from "pocketbase";

import PlayerCard from "@/components/PlayerCard.vue";
import ScoreBoard from "@/components/ScoreBoard.vue";
import GameActions from "@/components/GameActions.vue";

import {
  Action,
  MatchDto,
  matchFetchOptions,
  Role,
  TeamColor,
  UserDto,
} from "@/dto/match.dto";

const props = defineProps<{ matchId: string }>();

const router = useRouter();
const pb = new PocketBase("http://127.0.0.1:8090");

const match: Ref<MatchDto | null> = ref(null);

const playersMap = computed<Record<string, UserDto>>(() =>
  Object.values(match.value?.expand || {})
    .flat()
    .reduce((acc, user) => ({ ...acc, [user.id]: user }), {}),
);
const currentRound = computed(() => match.value?.rounds?.at(-1));
const userInMatch = computed(
  () =>
    match.value?.team1.includes(pb.authStore.record?.id || "not") ||
    match.value?.team2.includes(pb.authStore.record?.id || "not") ||
    false,
);
const bottomTeam = computed<{ color: TeamColor; name: "team1" | "team2" }>(
  () => {
    if (!currentRound.value || !match.value)
      return { color: "black", name: "team1" };
    if (!userInMatch.value)
      return {
        color: match.value.rounds.length % 2 === 0 ? "blue" : "black",
        name: match.value.rounds.length % 2 === 0 ? "team2" : "team1",
      };
    return {
      color:
        currentRound.value.black.attacker === pb.authStore.record?.id ||
        currentRound.value.black.keeper === pb.authStore.record?.id
          ? "black"
          : "blue",
      name: match.value.team1.includes(pb.authStore.record?.id || "noop")
        ? "team1"
        : "team2",
    };
  },
);
const topTeam = computed<{ color: TeamColor; name: "team1" | "team2" }>(() => ({
  color: bottomTeam.value.color === "black" ? "blue" : "black",
  name: bottomTeam.value.name === "team2" ? "team1" : "team2",
}));
const matchOver = computed(() => {
  let t1 = 0;
  let t2 = 0;
  return match.value?.rounds.some((r, i) => {
    const t1Score = i % 2 === 0 ? r.blue.score : r.black.score;
    const t2Score = i % 2 === 0 ? r.black.score : r.blue.score;
    t1Score > t2Score ? t1++ : t2++;
    return t1 === 2 || t2 === 2;
  });
});

onMounted(async () => {
  if (!pb.authStore.record?.id)
    await pb
      .collection("users")
      .authWithPassword("alice@example.com", "kicker1337");

  match.value = await pb
    .collection("match")
    .getOne(props.matchId, matchFetchOptions);

  pb.collection("match").subscribe(
    props.matchId,
    (e: RecordSubscription<MatchDto>) => {
      console.debug(`action '${e.action}' for match ${props.matchId}`);
      match.value = e.record;
    },
    matchFetchOptions,
  );
});

onUnmounted(() => {
  pb.collection("match").unsubscribe();
});

async function handleGoal(event: {
  id: string;
  color: TeamColor;
  role: Role;
  action: Action;
}) {
  if (!currentRound.value || !match.value) return;
  if (!currentRound.value.start) {
    console.debug(`round ${match.value.rounds.length} has not started yet`);
    return;
  }
  if (!!currentRound.value.end) {
    console.debug(`round ${match.value.rounds.length} is already over`);
    return;
  }

  const newScore = currentRound.value[event.color].score + 1;
  const end = newScore === 5 ? new Date() : undefined;
  const isTeam1 = match.value.team1.includes(event.id);
  const team1_score = isTeam1
    ? match.value.team1_score + 1
    : match.value.team1_score;
  const team2_score = isTeam1
    ? match.value.team2_score
    : match.value.team2_score + 1;

  await pb.collection("match").update(props.matchId, {
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
  } as Partial<MatchDto>);

  await pb.collection("goal").create({
    match: props.matchId,
    user: event.id,
    team: event.color,
    role: event.role,
    action: event.action,
  });
}

async function handleNextButton() {
  if (!currentRound.value || !match.value) return;

  if (!currentRound.value.start) {
    console.debug(`start round ${match.value.rounds.length}`);
    await pb.collection("match").update(props.matchId, {
      rounds: [
        ...match.value.rounds.slice(0, -1),
        {
          ...currentRound.value,
          start: new Date(),
        },
      ],
    });
    return;
  }

  if (matchOver.value) {
    console.debug(`match ${props.matchId} over`);
    router.push(`/match/`);
    return;
  }

  if (currentRound.value.end) {
    console.debug(`init round ${match.value.rounds.length + 1}`);
    pb.collection("match").update(props.matchId, {
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
  }
}
</script>
