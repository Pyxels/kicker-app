<template>
  <div class="w-full max-w-md mx-auto bg-white p-6 rounded-xl shadow space-y-6">
    <h2 class="text-2xl font-bold text-center">Account Settings</h2>

    <!-- Avatar -->
    <div class="space-y-2 flex justify-center">
      <div class="flex flex-col items-center gap-4">
        <img
          v-if="previewUrl || user.avatar"
          :src="previewUrl || avatarUrl"
          class="w-32 h-32 rounded-full object-cover border"
        />
        <label
          for="avatar-upload"
          class="inline-block cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium transition"
        >
          Upload Image
        </label>
        <input
          id="avatar-upload"
          ref="avatarInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleAvatar"
        />
      </div>
    </div>

    <!-- Name -->
    <div>
      <label class="block font-medium mb-1">Display Name</label>
      <input
        v-model="name"
        type="text"
        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
      />
    </div>

    <!-- Password Section -->
    <div class="space-y-4">
      <div>
        <label class="block font-medium mb-1">Current Password</label>
        <input
          v-model="oldPassword"
          type="password"
          class="w-full px-4 py-2 border rounded"
          placeholder="Required to change password"
        />
      </div>
      <div>
        <label class="block font-medium mb-1">New Password</label>
        <input
          v-model="password"
          type="password"
          class="w-full px-4 py-2 border rounded"
          placeholder="Leave empty to keep the same"
        />
      </div>
      <div>
        <label class="block font-medium mb-1">Confirm New Password</label>
        <input v-model="passwordConfirm" type="password" class="w-full px-4 py-2 border rounded" />
      </div>
    </div>

    <!-- Save -->
    <button class="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition" @click="save">
      Save Changes
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { baseUrl, pb, safe } from '@/lib/pb';
import { toast } from 'vue-sonner';

const user = pb.authStore.record!;
const name = ref(user.name);
const oldPassword = ref('');
const password = ref('');
const passwordConfirm = ref('');

const file = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const avatarUrl = `${baseUrl}/api/files/users/${user.id}/${user.avatar}?thumb=200x200`;

function handleAvatar(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target?.files?.[0]) {
    file.value = target.files[0];
    previewUrl.value = URL.createObjectURL(file.value);
  }
}

async function save() {
  if (password.value && password.value !== passwordConfirm.value) {
    toast.error('New passwords do not match');
    return;
  }

  const formData = new FormData();
  formData.append('name', name.value);

  if (password.value) {
    if (!oldPassword.value) {
      toast.error('Current password required to change password');
      return;
    }
    formData.append('oldPassword', oldPassword.value);
    formData.append('password', password.value);
    formData.append('passwordConfirm', passwordConfirm.value);
  }

  if (file.value) {
    formData.append('avatar', file.value);
  }

  const updated = await safe(() => pb.collection('users').update(user.id, formData));

  if (updated) {
    toast.success('Account updated');
    if (password.value)
      // reauthenticate
      await safe(() => pb.collection('users').authWithPassword(user.email, password.value));
  }
  oldPassword.value = '';
  password.value = '';
  passwordConfirm.value = '';
}
</script>
