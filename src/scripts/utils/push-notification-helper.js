import CONFIG from "../config";

const PushNotificationHelper = {
  async registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker is not supported in this browser");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register("sw.js");
      console.log("Service Worker registered with scope:", registration.scope);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  },

  async getSubscription() {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  },

  async subscribeUser() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(CONFIG.PUSH_MSG_VAPID_PUBLIC_KEY),
      });

      console.log("User subscribed:", subscription);
      return subscription;
    } catch (error) {
      console.error("Failed to subscribe user:", error);
      throw error;
    }
  },

  async unsubscribeUser() {
    const subscription = await this.getSubscription();
    if (subscription) {
      try {
        await subscription.unsubscribe();
        console.log("User unsubscribed");
        return subscription.endpoint;
      } catch (error) {
        console.error("Failed to unsubscribe user:", error);
        throw error;
      }
    }
    return null;
  },
};

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default PushNotificationHelper;
