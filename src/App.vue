<script setup lang="ts">
import Choose from './Choose.vue';
import { init } from './lib/auth';
init();
</script>

<template>
  <Suspense>
    <Choose></Choose>
    <template #fallback>
      Loading..
    </template>
  </Suspense>
</template>

<style lang="scss">
</style>
