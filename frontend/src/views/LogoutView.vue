<template>
  <div class="text-center text-gray-500 mt-10">
    Logging out...
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { pb } from "@/lib/pb";

const router = useRouter();

onMounted(() => {
  pb.authStore.clear();
  router.replace("/login");
});
</script>
