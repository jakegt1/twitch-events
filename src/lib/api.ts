import { type Ref } from "vue";
import { CLIENT_ID } from "./auth";
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


function loadWebsocket(messages: Ref<WebsocketMessage[]>): WebSocket {
  const socket = new WebSocket("wss://eventsub.wss.twitch.tv/ws");
  socket.onopen = async (e) => {
    console.log("opened socket");
  };
  socket.onclose = async (e) => {
    console.log("wtf going on");
  };
  socket.onmessage = async (e) => {
    const data: WebsocketMessage = JSON.parse(e.data);
    if(data.metadata.message_type == MessageType.session_welcome) {
      const session = data.payload.session
      createSubscription(session.id);
    } else if(data.metadata.subscription_type !== undefined) {
      switch(data.metadata.subscription_type) {
        case SubscriptionType.channel_chat_message:
          messages.value.push(data);
          break;
        default:
          console.log("message received.");
      }
    }
  }
  socket.onerror = async (e) => {
    console.log("big error lads");
  }
  return socket;
}

async function makeRequest(info: RequestInfo | URL, init?: RequestInit): Response {
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

async function createSubscription(sessionId: string) {
  const currentSubscription = storage.getSubscription();
  if(currentSubscription !== null) {
    deleteSubscription(currentSubscription);
  }
  const user = await getUser();
  const data = {
    type: "channel.chat.message",
    version: "1",
    condition: {
      broadcaster_user_id: user.id,
      user_id: user.id
    },
    transport: {
      method: "websocket",
      session_id: sessionId
    }
  }
  const subscription = await makeRequest(SUB_API, {
    method: "POST",
    body: JSON.stringify(data)
  });
  const respData = await subscription.json();
  storage.setSubscription(respData.data[0].id);
}

export {
  createSubscription,
  loadWebsocket,
  getUser,
  WebsocketMessage,
  SubscriptionType,
  EventChannelChatMessage
}