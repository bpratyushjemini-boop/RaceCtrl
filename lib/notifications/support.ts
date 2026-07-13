import { NotificationCapability } from "./types";

export function isServer(): boolean {
  return typeof window === "undefined" || typeof navigator === "undefined";
}

export function checkIsIOS(): boolean {
  if (isServer()) return false;
  const ua = navigator.userAgent.toLowerCase();
  return /ipad|iphone|ipod/.test(ua);
}

export function checkIsStandalone(): boolean {
  if (isServer()) return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function getNotificationCapability(): NotificationCapability {
  if (isServer()) {
    return "unsupported";
  }

  // Check basic support
  const hasServiceWorker = "serviceWorker" in navigator;
  const hasNotification = "Notification" in window;
  const hasPushManager = "PushManager" in window;

  if (!hasServiceWorker || !hasNotification || !hasPushManager) {
    return "unsupported";
  }

  // iOS check
  const isIOS = checkIsIOS();
  const isStandalone = checkIsStandalone();

  if (isIOS && !isStandalone) {
    return "standalone-required";
  }

  // Permission checks
  const permission = Notification.permission;
  if (permission === "granted") {
    return "ready";
  } else if (permission === "denied") {
    return "permission-denied";
  } else {
    return "permission-default";
  }
}

export async function requestNotificationPermission(): Promise<NotificationCapability> {
  if (isServer()) return "unsupported";

  const currentCapability = getNotificationCapability();
  if (currentCapability === "unsupported" || currentCapability === "standalone-required") {
    return currentCapability;
  }

  try {
    const result = await Notification.requestPermission();
    if (result === "granted") {
      return "ready";
    } else if (result === "denied") {
      return "permission-denied";
    }
  } catch (err) {
    console.error("Failed to request notification permission:", err);
  }

  return getNotificationCapability();
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (isServer() || !("serviceWorker" in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.error("Failed to get push subscription:", err);
    return null;
  }
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (isServer() || !("serviceWorker" in navigator)) return null;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    console.warn("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured. Skipping server push subscription.");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource
    });
    return subscription;
  } catch (err) {
    console.error("Failed to subscribe to push notifications:", err);
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (isServer() || !("serviceWorker" in navigator)) return false;
  try {
    const subscription = await getPushSubscription();
    if (subscription) {
      const ok = await subscription.unsubscribe();
      return ok;
    }
    return true;
  } catch (err) {
    console.error("Failed to unsubscribe from push notifications:", err);
    return false;
  }
}
