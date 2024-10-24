<script setup lang="ts">
import { computed, ComputedRef, Ref, ref } from 'vue';
import { EventChannelChatMessage, EventFollow, SubscriptionType, WebsocketMessage, loadWebsocket } from './lib/api';

interface Event{
  type: string
  header: string
  body: string
}

const messages: Ref<WebsocketMessage[]> = ref([]);
const events: ComputedRef<Event[]> = computed(() => {
  const asMessages = messages.value;
  return asMessages.map((msg) => {
    switch(msg.metadata.subscription_type) {
      case SubscriptionType.channel_chat_message:
        const data: EventChannelChatMessage = msg.payload.event;
        return {
          type: "message",
          header: `${data.chatter_user_name} | ${msg.metadata.message_timestamp}`,
          body: data.message.text
        }
      case SubscriptionType.channel_follow:
        const follow: EventFollow = msg.payload.event;
        return {
          type: "message is-info",
          header: `${follow.user_name} | ${msg.metadata.message_timestamp}`,
          body: `${follow.user_name} followed you! Be nice!`
        }
      default:
        return {
          type: "message",
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