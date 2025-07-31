<template>
  <div class="min-h-screen flex flex-col items-center px-4 py-6 space-y-6">
    <h1 class="text-2xl font-bold">
      Round {{ match?.game_data.rounds.length || "Setup" }}
    </h1>

    <!-- score board - TODO rounds -->
    <ScoreBoard
      :leftTeam="
        (match?.expand as any)?.[`team_${sides.left}`]
          ?.map((p: UserDto) => p.name)
          .join(' ')
      "
      :rightTeam="
        (match?.expand as any)?.[`team_${sides.right}`]
          ?.map((p: UserDto) => p.name)
          .join(' ')
      "
      :leftTeamScore="(round as any)?.[`${sides.left}_score`]"
      :rightTeamScore="(round as any)?.[`${sides.right}_score`]"
      :rounds="[]"
    />

    <!-- player rows -->
    <div class="w-full flex flex-row gap-4 justify-center">
      <PlayerCard
        :user="
          players?.find(
            (p) => p.id === (round as any)?.[`${sides.left}_keeper`],
          )
        "
        :color="sides.left"
        role="keeper"
        border="l"
        @goal="handleGoal"
      />
      <PlayerCard
        :user="
          players?.find(
            (p) => p.id === (round as any)?.[`${sides.right}_attacker`],
          )
        "
        :color="sides.right"
        role="attacker"
        border="r"
        @goal="handleGoal"
      />
    </div>
    <div class="w-full flex flex-row gap-4 justify-center">
      <PlayerCard
        :user="
          players?.find(
            (p) => p.id === (round as any)?.[`${sides.left}_attacker`],
          )
        "
        :color="sides.left"
        role="attacker"
        border="l"
        @goal="handleGoal"
      />
      <PlayerCard
        :user="
          players?.find(
            (p) => p.id === (round as any)?.[`${sides.right}_keeper`],
          )
        "
        :color="sides.right"
        role="keeper"
        border="r"
        @goal="handleGoal"
      />
    </div>

    <!-- actions footer -->
    <div class="mt-auto px-4 py-6">
      <GameActions
        :continueLabel="hasStarted ? 'Next' : 'Start'"
        @next="handleNextButton"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, Ref, computed } from "vue";
import PocketBase, { RecordSubscription } from "pocketbase";

import PlayerCard from "@/components/PlayerCard.vue";
import ScoreBoard from "@/components/ScoreBoard.vue";
import GameActions from "@/components/GameActions.vue";

import { MatchDto, matchFetchOptions, UserDto } from "@/dto/match.dto";

const props = defineProps<{ matchId: string }>();

const pb = new PocketBase("http://127.0.0.1:8090");

const match: Ref<MatchDto | null> = ref(null);

onMounted(async () => {
  if (!pb.authStore.record?.id)
    await pb.collection("users").authWithPassword("alice@example.com", "kicker1337");

  match.value = await pb
    .collection("match")
    .getOne(props.matchId, matchFetchOptions);

  pb.collection("match").subscribe(
    props.matchId,
    (e: RecordSubscription<MatchDto>) => {
      console.log(`update for match ${props.matchId}`);
      match.value = e.record;
    },
    matchFetchOptions,
  );
});

onUnmounted(() => {
  pb.collection("match").unsubscribe();
});

const round = computed(() => match.value?.game_data.rounds.at(-1));
const roundIndex = computed(() => match.value?.game_data.rounds.length);
const players = computed(() => Object.values(match.value?.expand || {}).flat());
const hasStarted = computed(() => !!round.value?.start);
const isOver = computed(() => !!round.value?.end);
// black is left on games 1 & 3
const sides = computed<{ left: "blue" | "black"; right: "blue" | "black" }>(
  () =>
    roundIndex.value === 2
      ? { left: "blue", right: "black" }
      : { left: "black", right: "blue" },
);

async function handleGoal(event: {
  id: string;
  color: "blue" | "black";
  role: "attacker" | "keeper";
}) {
  if (!match.value || !round.value) return;
  if (isOver.value) {
    console.log("round over");
    return;
  }
  if (hasStarted.value) {
    const newScores =
      event.color === "blue"
        ? {
            blue_score: (round.value.blue_score || 0) + 1,
            black_score: round.value.black_score,
          }
        : {
            black_score: (round.value.black_score || 0) + 1,
            blue_score: round.value.blue_score,
          };
    const end =
      newScores.blue_score! >= 5 || newScores.black_score! >= 5
        ? new Date()
        : undefined;
    await Promise.all([
      pb.collection("goal").create({
        match: props.matchId,
        player: event.id,
        team: event.color,
        role: event.role,
        action: "goal",
      }),
      pb.collection("match").update(props.matchId, {
        ...match.value,
        game_data: {
          rounds: [
            ...match.value.game_data.rounds.slice(0, -1),
            {
              ...match.value.game_data.rounds.at(-1),
              ...newScores,
              start: new Date(),
              end,
            },
          ],
        },
      }),
    ]);
  }
}

async function handleNextButton() {
  console.log(round.value);
  console.log(isOver.value);
  console.log(hasStarted.value);
  if (!match.value || !round.value) return;
  if (!hasStarted.value) {
    await pb.collection("match").update(props.matchId, {
      ...match.value,
      game_data: {
        rounds: [
          ...match.value.game_data.rounds.slice(0, -1),
          {
            ...match.value.game_data.rounds.at(-1),
            blue_score: 0,
            black_score: 0,
            start: new Date(),
          },
        ],
      },
    });
  } else if (!isOver.value) {
    console.log("finish round first");
    return;
  } else {
    await pb.collection("match").update(props.matchId, {
      ...match.value,
      game_data: {
        rounds: [
          ...match.value.game_data.rounds,
          {
            blue_attacker: round.value.black_keeper,
            black_attacker: round.value.blue_keeper,
            blue_keeper: round.value.black_attacker,
            black_keeper: round.value.blue_attacker,
          },
        ],
      },
    });
  }
}
</script>
