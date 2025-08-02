<template>
  <div class="min-h-screen flex flex-col items-center px-4 py-6 space-y-6">
    <h1 class="text-2xl font-bold">Select Players</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <div>
        <label class="block mb-1 font-semibold">Blue Attacker</label>
        <select
          v-model="selected.blue_attacker"
          class="w-full p-2 border rounded"
        >
          <option :value="null" disabled>Select player</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="block mb-1 font-semibold">Blue Keeper</label>
        <select
          v-model="selected.blue_keeper"
          class="w-full p-2 border rounded"
        >
          <option :value="null" disabled>Select player</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="block mb-1 font-semibold">Black Keeper</label>
        <select
          v-model="selected.black_keeper"
          class="w-full p-2 border rounded"
        >
          <option :value="null" disabled>Select player</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="block mb-1 font-semibold">Black Attacker</label>
        <select
          v-model="selected.black_attacker"
          class="w-full p-2 border rounded"
        >
          <option :value="null" disabled>Select player</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>
    </div>

    <button
      class="mt-6 px-6 py-2 text-white font-semibold rounded"
      :class="
        isComplete
          ? 'bg-blue-600 hover:bg-blue-700'
          : 'bg-gray-400 cursor-not-allowed'
      "
      :disabled="!isComplete"
      @click="submitSelection"
    >
      Confirm Match
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

import { pb, safe } from "@/lib/pb";
import { UserDto } from "@/dto/match.dto";

const router = useRouter();

const users = ref<UserDto[]>();
const selected = ref({
  black_keeper: null,
  black_attacker: null,
  blue_attacker: null,
  blue_keeper: null,
});

onMounted(async () => {
  users.value = await safe(() =>
    pb.collection("users").getFullList({ fields: "id,name,avatar" }),
  );
});

const isComplete = computed(() => {
  const values = Object.values(selected.value);
  const hasAll = values.every((v) => v !== null);
  const hasDuplicates = new Set(values).size !== values.length;
  return hasAll && !hasDuplicates;
});

async function submitSelection() {
  const newMatchId = (
    await safe(() =>
      pb.collection("match").create({
        team1: [selected.value.black_attacker, selected.value.black_keeper],
        team2: [selected.value.blue_keeper, selected.value.blue_attacker],
        team1_score: 0,
        team2_score: 0,
        rounds: [
          {
            black: {
              attacker: selected.value.black_attacker,
              keeper: selected.value.black_keeper,
              score: 0,
            },
            blue: {
              attacker: selected.value.blue_attacker,
              keeper: selected.value.blue_keeper,
              score: 0,
            },
          },
        ],
      }),
    )
  )?.id;
  if (newMatchId) router.push(`/match/${newMatchId}`);
}
</script>
