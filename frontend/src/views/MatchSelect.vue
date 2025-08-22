<template>
  <div class="w-full max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-center">Select Players</h1>

    <!-- step 1: select 4 players -->
    <button
      v-if="step === 'select'"
      class="mt-6 block mx-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded disabled:opacity-50"
      :disabled="selectedIds.length !== 4"
      @click="step = 'assign'"
    >
      Next: Assign Roles
    </button>

    <div v-if="step === 'select'">
      <p class="my-4 text-gray-600 text-center">Select 4 players to participate</p>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div
          v-for="user in users"
          :key="user.id"
          class="border rounded-lg p-3 flex flex-col items-center justify-center text-center cursor-pointer transition hover:shadow"
          :class="selectedIds.includes(user.id) ? 'border-blue-500 bg-blue-50' : 'bg-white'"
          @click="toggleSelect(user.id)"
        >
          <div
            class="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-white text-xl font-bold overflow-hidden"
          >
            <img
              v-if="user.avatar"
              :src="`${baseUrl}/api/files/users/${user.id}/${user.avatar}?thumb=100x100`"
              class="w-full h-full object-cover"
              alt="avatar"
            />
            <span v-else>{{ user.name?.charAt(0) }}</span>
          </div>
          <div class="mt-2 text-sm font-medium truncate">{{ user.name }}</div>
        </div>
      </div>
    </div>

    <!-- step 2: assign players (tap/tap workflow) -->
    <div v-else>
      <p class="my-4 text-gray-600 text-center">
        <span v-if="selectedPlayerId">
          Selected: <span class="font-semibold">{{ getUserById(selectedPlayerId)?.name }}</span> — tap a role to assign
        </span>
        <span v-else>Tap a player, then tap a role</span>
      </p>

      <!-- role assignment grid -->
      <div class="grid grid-cols-2 gap-6 justify-items-center">
        <button
          v-for="role in roleOrder"
          :key="role.key"
          type="button"
          class="relative pt-10 w-48 h-64 bg-white text-gray-900 rounded-2xl shadow-lg flex flex-col items-center justify-center p-4 overflow-hidden transition border-2"
          :class="[
            assignments[role.key]
              ? role.team === 'blue'
                ? 'border-blue-500'
                : 'border-gray-800'
              : 'border-dashed border-gray-300',
            selectedPlayerId ? 'ring-2 ring-blue-300' : '',
          ]"
          @click="handleRoleClick(role.key)"
        >
          <!-- team + role visible from the start -->
          <div class="absolute top-2 inset-x-0 flex items-center justify-center gap-2 pointer-events-none">
            <span
              class="px-2 py-0.5 rounded-full text-xs font-semibold"
              :class="role.team === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'"
            >
              {{ role.team === 'blue' ? 'Blue' : 'Black' }}
            </span>
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              :class="role.team === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'"
            >
              <span v-if="role.position === 'attacker'">⚽️ Attacker</span>
              <span v-else>🛡️ Keeper</span>
            </span>
          </div>

          <!-- clear button -->
          <button
            v-if="assignments[role.key]"
            type="button"
            class="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-sm grid place-items-center hover:bg-gray-200"
            aria-label="Clear"
            title="Clear"
            @click.stop="clearRole(role.key)"
          >
            ×
          </button>

          <!-- assigned or placeholder -->
          <div v-if="assignments[role.key]" class="w-full flex flex-col items-center">
            <div
              class="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4"
              :class="role.team === 'blue' ? 'bg-blue-500 border-blue-400' : 'bg-gray-800 border-gray-700'"
              :style="selectedFromRoleKey === role.key ? 'outline: 3px solid #f59e0b; outline-offset: 3px;' : ''"
            >
              <template v-if="assignments[role.key]?.avatar">
                <img
                  :src="`${baseUrl}/api/files/users/${assignments[role.key]?.id}/${assignments[role.key]?.avatar}?thumb=100x100`"
                  class="w-full h-full rounded-full object-cover"
                  alt="avatar"
                />
              </template>
              <template v-else>
                {{ assignments[role.key]?.name?.charAt(0) ?? '?' }}
              </template>
            </div>
            <div class="mt-3 text-center">
              <div class="text-lg font-semibold truncate">
                {{ assignments[role.key]?.name }}
              </div>
            </div>
          </div>

          <div v-else class="text-gray-400 italic">Tap to set {{ role.position }}</div>
        </button>
      </div>

      <!-- pool -->
      <p class="mt-6 mb-2 text-center text-gray-600">Available Players</p>
      <div class="flex flex-wrap justify-center gap-4">
        <button
          v-for="id in availableIds"
          :key="id"
          type="button"
          class="w-20 h-20 rounded-full flex items-center justify-center bg-gray-200 transition"
          :class="selectedPlayerId === id ? 'ring-4 ring-blue-300' : 'hover:ring-2 hover:ring-gray-300'"
          @click="selectFromPool(id)"
        >
          <template v-if="getUserById(id)?.avatar">
            <img
              :src="`${baseUrl}/api/files/users/${id}/${getUserById(id)?.avatar}?thumb=100x100`"
              class="w-full h-full rounded-full object-cover"
              alt="avatar"
            />
          </template>
          <template v-else>
            <span class="text-xl font-bold text-gray-700">
              {{ getUserById(id)?.name?.charAt(0) ?? '?' }}
            </span>
          </template>
        </button>
      </div>

      <!-- confirm button -->
      <button
        class="mt-6 block mx-auto px-6 py-2 bg-green-600 text-white font-semibold rounded disabled:opacity-50"
        :disabled="!isComplete"
        @click="submitSelection"
      >
        Confirm Match
      </button>

      <button
        class="mt-6 block mx-auto px-6 py-2 bg-white text-black border border-gray-200 font-semibold rounded disabled:opacity-50"
        @click="randomize"
      >
        Randomize
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { pb, safe, baseUrl } from '@/lib/pb';
import { UserDto } from '@/dto/match.dto';

const router = useRouter();
const users = ref<UserDto[]>([]);
const selectedIds = ref<string[]>([]);
const step = ref<'select' | 'assign'>('select');

type RoleKey = 'black_attacker' | 'black_keeper' | 'blue_attacker' | 'blue_keeper';

const assignments = reactive<Record<RoleKey, UserDto | null>>({
  black_attacker: null,
  black_keeper: null,
  blue_attacker: null,
  blue_keeper: null,
});

const roleOrder: Array<{ key: RoleKey; team: 'black' | 'blue'; position: 'attacker' | 'keeper' }> = [
  { key: 'black_attacker', team: 'black', position: 'attacker' },
  { key: 'black_keeper', team: 'black', position: 'keeper' },
  { key: 'blue_keeper', team: 'blue', position: 'keeper' },
  { key: 'blue_attacker', team: 'blue', position: 'attacker' },
];

const selectedPlayerId = ref<string | null>(null);
const selectedFromRoleKey = ref<RoleKey | null>(null);

onMounted(async () => {
  users.value = (await safe(() => pb.collection('users').getFullList({ fields: 'id,name,avatar' }))) || [];
});

function toggleSelect(id: string) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((i) => i !== id);
  } else if (selectedIds.value.length < 4) {
    selectedIds.value.push(id);
  }
}

const isComplete = computed(() => Object.values(assignments).every((v) => v?.id != null));

const availableIds = computed(() =>
  selectedIds.value.filter((id) => !Object.values(assignments).some((u) => u?.id === id))
);

function getUserById(id: string) {
  return users.value.find((u) => u.id === id);
}

function selectFromPool(id: string) {
  selectedPlayerId.value = id;
  selectedFromRoleKey.value = null;
}

function handleRoleClick(targetRoleKey: RoleKey) {
  if (!selectedPlayerId.value) {
    if (assignments[targetRoleKey]) {
      selectedPlayerId.value = assignments[targetRoleKey]!.id!;
      selectedFromRoleKey.value = targetRoleKey;
    }
    return;
  }

  const incoming = getUserById(selectedPlayerId.value);
  if (!incoming) return;

  if (selectedFromRoleKey.value) {
    if (selectedFromRoleKey.value === targetRoleKey) {
      clearSelection();
      return;
    }
    const targetCurrent = assignments[targetRoleKey];
    assignments[targetRoleKey] = incoming;
    assignments[selectedFromRoleKey.value] = targetCurrent ? targetCurrent : null;
    clearSelection();
  } else {
    assignments[targetRoleKey] = incoming;
    clearSelection();
  }
}

function clearRole(roleKey: RoleKey) {
  if (!assignments[roleKey]) return;
  if (selectedFromRoleKey.value === roleKey) clearSelection();
  assignments[roleKey] = null;
}

function clearSelection() {
  selectedPlayerId.value = null;
  selectedFromRoleKey.value = null;
}

function randomize() {
  const roles = Object.keys(assignments) as RoleKey[];
  const shuffled = [...selectedIds.value].sort(() => Math.random() - 0.5);

  roles.forEach((role, i) => {
    assignments[role] = getUserById(shuffled[i]) ?? null;
  });
}

async function submitSelection() {
  const newMatchId = (
    await safe(() =>
      pb.collection('match').create({
        team1: [assignments.black_attacker?.id, assignments.black_keeper?.id],
        team2: [assignments.blue_keeper?.id, assignments.blue_attacker?.id],
        team1_score: 0,
        team2_score: 0,
        rounds: [
          {
            black: {
              attacker: assignments.black_attacker?.id,
              keeper: assignments.black_keeper?.id,
              score: 0,
            },
            blue: {
              attacker: assignments.blue_attacker?.id,
              keeper: assignments.blue_keeper?.id,
              score: 0,
            },
          },
        ],
      })
    )
  )?.id;

  if (newMatchId) router.push(`/match/${newMatchId}`);
}
</script>
