const CACHE_NAME = "racectrl-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        "/manifest.webmanifest",
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !event.request.headers.get("accept")?.includes("text/html")) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(OFFLINE_URL) || caches.match("/");
    })
  );
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "RaceCtrl",
    body: "New race weekend update.",
    url: "/weekend",
    tag: "session-reminder"
  };

  if (event.data) {
    try {
      const data = event.data.json();
      if (data && typeof data === "object") {
        if (data.title && typeof data.title === "string") payload.title = data.title;
        if (data.body && typeof data.body === "string") payload.body = data.body;
        if (data.url && typeof data.url === "string") {
          // Safe URL extraction
          let rawUrl = data.url;
          try {
            const parsed = new URL(rawUrl, self.location.origin);
            if (parsed.origin === self.location.origin) {
              payload.url = parsed.pathname + parsed.search + parsed.hash;
            } else {
              payload.url = "/weekend";
            }
          } catch {
            if (rawUrl.startsWith("/")) {
              payload.url = rawUrl;
            } else {
              payload.url = "/" + rawUrl;
            }
          }
        }
        if (data.tag && typeof data.tag === "string") payload.tag = data.tag;
      }
    } catch (e) {
      // Fallback to text payload if not JSON
      const text = event.data.text();
      if (text) payload.body = text;
    }
  }

  const options = {
    body: payload.body,
    icon: "/icon?sizes=192x192",
    badge: "/icon?sizes=192x192",
    tag: payload.tag,
    data: {
      url: payload.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const rawUrl = event.notification.data?.url || "/weekend";
  let targetPath = "/weekend";
  try {
    const parsed = new URL(rawUrl, self.location.origin);
    if (parsed.origin === self.location.origin) {
      targetPath = parsed.pathname + parsed.search + parsed.hash;
    }
  } catch {
    if (typeof rawUrl === "string" && rawUrl.startsWith("/")) {
      targetPath = rawUrl;
    }
  }

  const targetUrl = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Try to focus an existing window client
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if ("focus" in client) {
          return client.focus().then((focusedClient) => {
            if ("navigate" in focusedClient) {
              return focusedClient.navigate(targetUrl);
            }
          });
        }
      }
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
