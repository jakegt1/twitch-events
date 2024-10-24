import { getToken, setToken } from './storage';

const CLIENT_ID = "au24gwo6fw1akn4l1c1j567a5gmrje";
const TWITCH_URL = "https://id.twitch.tv/oauth2/authorize?"
const SCOPES = "user:read:chat user:read:follows user:read:subscriptions"

function twitchRedirectUrl(): string {
  const params = new URLSearchParams();
  params.set("client_id", CLIENT_ID);
  params.set("redirect_uri", window.location.href);
  params.set("response_type", "token");
  params.set("scope", SCOPES);
  return `${TWITCH_URL}${params}`
}

function init() {
  const params = new URLSearchParams(document.location.hash);
  if(params.has("#access_token")) {
    setToken(params.get("#access_token"));
    const url = new URL(window.location.href);
    url.search = "";
    history.replaceState({}, undefined, url);
  }
}

async function validToken(): Promise<boolean> {
  const token = getToken();
  if(token === null) {
    return false;
  }

  return true;
}


export {
  validToken,
  twitchRedirectUrl,
  init,
  CLIENT_ID
}