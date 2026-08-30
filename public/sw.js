// TOMO PWA Service Worker
const CACHE = 'tomo-v1'
const CORE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/brand/favicon-32.png',
  '/brand/icon-192.png',
  '/brand/icon-512.png',
  '/brand/apple-touch-icon.png',
]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  // 只处理同源 GET
  if (e.request.method !== 'GET' || url.origin !== location.origin) return
  // AI API 调用不走缓存
  if (url.hostname.includes('generativelanguage')) return

  // 网络优先，失败回缓存（保证更新及时，离线可用）
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {})
        return res
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('/index.html')))
  )
})
