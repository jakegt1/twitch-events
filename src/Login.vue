<script setup lang="ts">
import { twitchRedirectUrl } from './lib/auth';

window.location.href = twitchRedirectUrl();
</script>

<template>
  <div>Loading..</div>
</template>

<style lang="scss">
</style>