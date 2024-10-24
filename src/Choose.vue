<script setup lang="ts">
import { ref, Ref } from 'vue';
import { validToken } from './lib/auth';
import Login from './Login.vue';
import Events from './Events.vue';

const ready: Ref<boolean> = ref(await validToken());
</script>

<template>
  <Login v-if="!ready"></Login>
  <Events v-if="ready"></Events>
</template>

<style>
</style>