<script setup lang="ts">
import { Ref, ref } from 'vue';
import { twitchRedirectUrl } from './lib/auth';

const url: Ref<string> = ref(twitchRedirectUrl());
console.log(twitchRedirectUrl());
</script>

<template>
  <a :href="url">Login</a>
</template>

<style lang="scss">
</style>