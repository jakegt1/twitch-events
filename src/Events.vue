<script setup lang="ts">
import { Ref, ref } from 'vue';
import { loadWebsocket } from './lib/api';

interface Event{
  type: string
  header: string
  body: string
}

const events: Ref<Event[]> = ref([]);

let websocket: WebSocket | null = null;
async function init() {
  websocket = loadWebsocket(events);
}
init();
</script>

<template>
  <div class="container pt-4 is-flex-direction-column-reverse is-flex">
    <article :class="event.type" v-for="event in events">
      <div class="message-header">
        {{ event.header }}
      </div>
      <div class="message-body">
        {{ event.body }}
      </div>
    </article>
  </div>
</template>

<style lang="scss">
  article:last-child {
    margin-bottom: 24px;
  }
</style>