import { precacheAndRoute  } from "workbox-precaching";
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener("install", () => {
  console.log(" Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log(" Service Worker activated");
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() || { 
    title: "기록 알림", 
    body: "지금 여행의 순간을 남겨보세요!" 
  };
  

  // 알림을 클릭했을 때 필요한 정보를 'data' 속성에 넣어줍니다.
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "icons/tripshot_logo.png",
      data: {
        url: '/home' //home으로 이동
      }
    })
  );
});


// 알림 클릭 이벤트 핸들러
self.addEventListener('notificationclick', (event) => {
  // 알림창을 닫습니다.
  event.notification.close();

  // 'push' 이벤트에서 넘겨준 data.url 값을 가져옵니다.
  const urlToOpen = event.notification.data?.url;

  // 일치하는 탭이 있으면 포커스, 없으면 새 탭 열기
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      
      // 1. 이미 해당 URL을 가진 탭이 열려있는지 확인
      for (const client of clientList) {
        // pathname을 비교하여 정확히 '/camera' 페이지만 찾도록 함
        if (new URL(client.url).pathname === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // 2. 열린 탭이 없다면 새 탭으로 URL 열기
      if (self.clients.openWindow && urlToOpen) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});