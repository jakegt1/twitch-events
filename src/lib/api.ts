import { type Ref } from "vue";
import { CLIENT_ID } from "./auth";
import { Event } from './interfaces';
import * as storage from './storage';

const USER_API = "https://api.twitch.tv/helix/users";
const SUB_API = "https://api.twitch.tv/helix/eventsub/subscriptions";

enum MessageType {
  session_welcome = "session_welcome",
  notification = "notifaction"
}

enum SubscriptionType {
  channel_chat_message = "channel.chat.message",
  channel_follow = "channel.follow"
}

interface User {
  id: string
  display_name: string
}

interface WebsocketMetadata {
  message_id: string
  message_type: MessageType
  message_timestamp: string
  subscription_type?: SubscriptionType
}

interface SessionPayload {
  id: string
}

interface Message {
  text: string
}

interface EventFollow {
  user_name: string
}

interface EventChannelChatMessage {
  chatter_user_name: string
  message: Message
}

interface PayloadType {
  session?: SessionPayload
  event?: any
}

interface WebsocketMessage {
  metadata: WebsocketMetadata
  payload: PayloadType
}

function websocketMessageToEvent(msg: WebsocketMessage): Event {
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
}

function loadWebsocket(notifications: Ref<Event[]>): WebSocket {
  const socket = new WebSocket("wss://eventsub.wss.twitch.tv/ws");
  socket.onopen = async (e) => {
    notifications.value.push({
      type: "message is-info",
      header: "Connecting",
      body: "Connecting to twitch.."
    })
  };
  socket.onclose = async (e) => {
    notifications.value.push({
      type: "message is-error",
      header: "Error - Disconnected",
      body: "Disconnected from twitch api. This should not happen! Please refresh the page!"
    })
  };
  socket.onmessage = async (e) => {
    const data: WebsocketMessage = JSON.parse(e.data);
    if(data.metadata.message_type == MessageType.session_welcome) {
      const session = data.payload.session
      await deleteAllSubscriptions();
      createSubscription(session.id, SubscriptionType.channel_chat_message, "1");
      createSubscription(session.id, SubscriptionType.channel_follow, "2");
      notifications.value.push({
        type: "message is-primary",
        header: "Ready",
        body: "Successfully connected to twitch, all ready!"
      })
    } else if(data.metadata.subscription_type !== undefined) {
      switch(data.metadata.subscription_type) {
        case SubscriptionType.channel_chat_message:
          notifications.value.push(websocketMessageToEvent(data));
          break;
        case SubscriptionType.channel_follow:
          notifications.value.push(websocketMessageToEvent(data));
          break;
        default:
          console.log("message received.");
      }
    }
  }
  socket.onerror = async (e) => {
    notifications.value.push({
      type: "message is-error",
      header: "Error - Disconnected",
      body: "Disconnected from twitch api. This should not happen! Please refresh the page!"
    })
  }
  return socket;
}

async function makeRequest(info: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if(init == undefined) {
    init = {};
  }
  const headers = init.headers ?? {};
  headers["Authorization"] = `Bearer ${storage.getToken()}`;
  headers["Client-Id"] = CLIENT_ID;
  headers["Content-Type"] = "application/json";
  return await fetch(info, Object.assign({headers: headers}, init));
}

async function getUser(): Promise<User | null> {
  const resp = await makeRequest(USER_API);
  const json: any = await resp.json();
  if("data" in json) {
    return json.data[0];
  } else {
    return null;
  }
}

async function getSubscriptions(): Promise<any[]> {
  const resp = await makeRequest(SUB_API);
  const json: any = await resp.json();
  if("data" in json) {
    return json.data;
  } else {
    return null;
  }
}

async function deleteSubscription(id: string) {
  await makeRequest(`${SUB_API}?id=${id}`, {
    method: "DELETE"
  })
}

async function deleteAllSubscriptions() {
  (await getSubscriptions()).forEach(element => {
    deleteSubscription(element.id);
  });
}

async function createSubscription(sessionId: string, type: SubscriptionType, version: string) {
  const user = await getUser();
  const data = {
    type: type,
    version: version,
    condition: {
      broadcaster_user_id: user.id,
      moderator_user_id: user.id,
      user_id: user.id
    },
    transport: {
      method: "websocket",
      session_id: sessionId
    }
  }
  try {
    const subscription = await makeRequest(SUB_API, {
      method: "POST",
      body: JSON.stringify(data)
    });
    const respData = await subscription.json();
    return respData.data[0].id;
  } catch {
    localStorage.removeItem("accessToken");
    window.location.reload();
  }
}

export {
  createSubscription,
  loadWebsocket,
  getUser,
  websocketMessageToEvent,
  WebsocketMessage,
  SubscriptionType,
  EventChannelChatMessage,
  EventFollow
}