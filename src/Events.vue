<script setup lang="ts">
import { computed, Ref, ref } from 'vue';
import { EventChannelChatMessage, SubscriptionType, WebsocketMessage, loadWebsocket } from './lib/api';

interface Event{
  type: string
  header: string
  body: string
}

const messages: Ref<WebsocketMessage[]> = ref([]);
const events = computed(() => {
  const asMessages = messages.value;
  return asMessages.map((msg) => {
    switch(msg.metadata.subscription_type) {
      case SubscriptionType.channel_chat_message:
        const data: EventChannelChatMessage = msg.payload.event;
        return {
          type: "",
          header: `${data.chatter_user_name} | ${msg.metadata.message_timestamp}`,
          body: data.message.text
        }
      default:
        return {
          type: "",
          header: "Unknown",
          body: "Unknown event type. Serious bug. Lol"
        }
    }
  });
});

let websocket: WebSocket | null = null;
async function init() {
  websocket = loadWebsocket(messages);
}
init();
</script>

<template>
  <div class="container pt-4">
    <article class="message" v-for="event in events">
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