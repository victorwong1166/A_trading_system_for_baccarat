// 服務工作線程版本
const CACHE_NAME = "trading-system-v1"

// 需要緩存的資源
const urlsToCache = ["/", "/dashboard", "/members", "/transactions", "/settlements", "/offline.html", "/manifest.json"]

// 安裝服務工作線程
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("已打開緩存")
      return cache.addAll(urlsToCache)
    }),
  )
})

// 激活服務工作線程
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// 攔截網絡請求
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 如果在緩存中找到了響應，則返回緩存的版本
      if (response) {
        return response
      }

      // 否則嘗試從網絡獲取
      return fetch(event.request)
        .then((response) => {
          // 檢查是否收到有效的響應
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // 克隆響應，因為響應是流，只能使用一次
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // 如果網絡請求失敗，則返回離線頁面
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html")
          }
        })
    }),
  )
})

// 後台同步
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-transactions") {
    event.waitUntil(syncTransactions())
  }
})

// 推送通知
self.addEventListener("push", (event) => {
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    data: {
      url: data.url,
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// 點擊通知
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url))
  }
})

// 同步交易的函數
async function syncTransactions() {
  // 從 IndexedDB 獲取待同步的交易
  // 發送到服務器
  // 成功後從 IndexedDB 刪除
}

