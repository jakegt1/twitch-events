const KEY_TOKEN = "accessToken";
const SUBSCRIPTION_ID = "subscriptionId";

function getSubscription(): string{
  return localStorage.getItem(SUBSCRIPTION_ID)
}

function setSubscription(id: string) {
  localStorage.setItem(SUBSCRIPTION_ID, id);
}

function deleteSubscription() {
  localStorage.removeItem(SUBSCRIPTION_ID);
}

function getToken(): string | null {
  return localStorage.getItem(KEY_TOKEN);
}

function setToken(token: string) {
  localStorage.setItem(KEY_TOKEN, token);
}

function hasToken(): boolean {
  return getToken() !== null;
}

export {
  hasToken,
  getToken,
  setToken,
  getSubscription,
  setSubscription,
  deleteSubscription
}