<script setup lang="ts">
import { computed, ComputedRef, Ref, ref } from 'vue';
import { EventChannelChatMessage, EventFollow, SubscriptionType, WebsocketMessage, loadWebsocket } from './lib/api';

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
  <div class="container pt-4">
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
</style>