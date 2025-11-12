// src/utils/notification.js
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    alert("이 브라우저는 알림을 지원하지 않습니다.");
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    console.log("알림 권한 허용됨");
    new Notification("테스트 알림", {
      body: "푸시 알림이 정상적으로 동작합니다 🎉",
      icon: "/icons/icon-192x192.png",
    });
    return true;
  } else {
    alert("알림 권한이 거부되었습니다 😢");
    return false;
  }
};
// 실제 랜덤 푸시 표시
export const showPushNotification = (title, body) => {
  navigator.serviceWorker.ready.then((reg) => {
    reg.showNotification(title, {
      body,
      icon: "/icons/icon-192x192.png",
      data: {
        url: '/camera',
      },
    });
  });
};