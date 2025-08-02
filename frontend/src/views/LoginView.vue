<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 text-gray-900 px-4">
    <div class="w-full max-w-sm bg-white p-6 rounded-xl shadow-md">
      <h2 class="text-2xl font-bold text-center mb-6">
        Sign In
      </h2>

      <form
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <div>
          <label
            class="block text-sm font-medium mb-1"
            for="email"
          >Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
        </div>

        <div>
          <label
            class="block text-sm font-medium mb-1"
            for="password"
          >Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors duration-200"
        >
          Log In
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { toast } from 'vue-sonner';

  import { pb, safe } from '@/lib/pb';

  const router = useRouter();

  const email = ref('');
  const password = ref('');

  async function handleSubmit() {
    if (await safe(() => pb.collection('users').authWithPassword(email.value, password.value))) {
      toast.success('Login successful');
      router.push('/');
    }
  }
</script>
