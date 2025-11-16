import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./SettingPage.css";
import NavBar from "../../components/NavBar/NavBar";
import { useAuth } from "../../contexts/AuthContext"; 

const API_BASE =(import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");

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

export default function SettingPage() {
   const navigate = useNavigate();
  // 1. [수정] user가 null일 수 있으므로 안전하게 user만 가져옴
   const { user } = useAuth(); 

   const [isOn, setIsOn] = useState(false); // 2. [수정] 기본값 false로 변경
   const [alertCount, setAlertCount] = useState(3);
   const [selectedTimes, setSelectedTimes] = useState(["오전"]);

    const TIME_RANGES = {
    오전: [7, 12],   // 07~12
    오후: [12, 17],  // 12~17
    저녁: [17, 20],  // 17~20
    밤: [20, 24],    // 20~24
    새벽: [0, 6],    // 00~06
    점심: [11, 14],  // 11~14
  };

    const buildTimezoneRange = (times) => {
    const hours = times.flatMap((t) => TIME_RANGES[t] || []);
    if (hours.length === 0) {
      // 아무것도 선택 안 했으면 기본값 (예: 9~21)
      return [9, 21];
    }
    const start = Math.min(...hours);
    const end = Math.max(...hours);
    return [start, end];
  };

    const saveSettingsToBE = async (count, times) => {
    if (!user) return;

    const timezone = buildTimezoneRange(times);
    console.log("BE로 알림 설정 전송:", { timesPerDay: count, timezone });

    try {
      const res = await fetch(`${API_BASE}/push/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timesPerDay: count,
          timezone, // [start, end]
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        console.error("설정 저장 실패:", res.status, msg);
        return;
      }

      const data = await res.json().catch(() => ({}));
      console.log("BE 알림 설정 저장 완료:", data);
    } catch (err) {
      console.error("BE 알림 설정 저장 실패:", err);
    }
  };

    const handleToggle = async () => {
    const nextState = !isOn;

    if (nextState) {
      // --- 알림 켜기 ---
      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        alert("푸시 알림이 지원되지 않는 환경입니다. (홈 화면에 추가 필요)");
        return;
      }

      console.log("푸시 알림 구독 시작...");

      try {
        // 1) VAPID 공개 키 받아오기
        const vapidKeyRes = await fetch(`${API_BASE}/push/vapid-key`);
        if (!vapidKeyRes.ok) {
          throw new Error(`vapid-key 실패: ${vapidKeyRes.status}`);
        }

        // 🔥 수정: 스펙에 맞게 파싱 (result X)
        const vapidJson = await vapidKeyRes.json();
        const vapidPublicKey = vapidJson.vapidPublicKey;
        if (!vapidPublicKey) {
          throw new Error("vapidPublicKey 없음");
        }

        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

        // 2) 서비스 워커 준비
        const reg = await navigator.serviceWorker.ready;

        // 3) 브라우저에 푸시 구독 요청
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });

        console.log("구독 성공:", subscription.endpoint);
        const { endpoint, keys } = subscription.toJSON();

        // 4) BE 서버로 구독 정보 전송
        const subRes = await fetch(`${API_BASE}/push/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: String(user.id), // 🔥 String으로 맞춰줌
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth,
          }),
        });

        if (!subRes.ok) {
          const msg = await subRes.text();
          throw new Error(`구독 정보 전송 실패: ${subRes.status} ${msg}`);
        }

        console.log("BE 구독 정보 전송 완료");

        // 5) BE 서버로 알림 설정 전송
        await saveSettingsToBE(alertCount, selectedTimes);

        setIsOn(true); // 모든 게 성공하면 켜짐
      } catch (err) {
        console.error("푸시 알림 구독 실패:", err);
        alert("알림을 구독하는 데 실패했습니다.");
      }
    } else {
      // --- 알림 끄기 ---
      console.log("푸시 알림 구독 취소...");

      try {
        // (선택) 실제 브라우저 구독 해제
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            await sub.unsubscribe();
            console.log("브라우저 구독 해제 완료");
          }
        }
      } catch (e) {
        console.warn("unsubscribe 중 에러:", e);
      }

      // BE에 "알림 0회"로 저장해서 끈 상태 표시
      await saveSettingsToBE(0, []);
      setIsOn(false);
    }
  };
   // ✅ 시간대 선택
   const toggleTime = (time) => {
      setSelectedTimes((prev) =>
         prev.includes(time)
            ? prev.filter((t) => t !== time)
            : [...prev, time]
      );
   };
  
  useEffect(() => {
    if (isOn) {
      saveSettingsToBE(alertCount, selectedTimes);
    }
  }, [alertCount, selectedTimes, isOn]);
 return (
    <div className="setting-page"> {/* 1. className 오타 수정 */}

      <header className="setting-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <h2 className="header-title">설정</h2>
      </header>


      <main className="setting-content">
        <section className="setting-section">
          <h3>🔔 알림 설정</h3>
          <div className="setting-item">
            <label htmlFor="alert-toggle">순간 기록 알림</label>
            <label className="switch">
              <input
                id="alert-toggle"
                type="checkbox" /* 2. 따옴표 수정 */
                checked={isOn}
                onChange={handleToggle}
              />
              <span className="slider"></span>
            </label>
          </div>
          <p className="setting-subtext">여행 중 특별한 순간을 놓치지 마세요!</p>
        </section>

        {/* 3. no-border 오타 수정 */}
        <section className="setting-section no-border">
          <div className="setting-item">
            <label htmlFor="alert-count">하루 알림 횟수 </label>
            {/* 4. 변수 위치 수정 */}
            <span>{alertCount}회</span>
          </div>

          {/* 5, 6. 구조 오류 수정 */}
          <div className="range-slider-wrapper">
            <input
              id="alert-count"
              type="range"
              min="1"
              max="10"
              value={alertCount}
              onChange={(e) => setAlertCount(Number(e.target.value))}
              className="range-slider"
            />
            <div className="range-labels">
              <span>1회</span>
              <span>5회</span>
              <span>10회</span>
            </div>
          </div>
        </section>
        
        <section className="setting-section">
          <h3>알림 시간대</h3>
          <p className="setting-subtext">설정한 시간대에 알림을 받을 수 있어요.</p>
          <div className="time-grid">
            {Object.keys(TIME_RANGES).map((t) => (
              <button
                key={t}
                onClick={() => toggleTime(t)}
                className={selectedTimes.includes(t) ? "selected" : ""}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* 기타 섹션 (피그마 디자인 반영) */}
        <section className="setting-section">
          <h3>기타</h3>
          <div className="setting-item-row">
            <span>저장 공간</span>
            <span className="item-value">2.2GB / 5GB 사용 중</span>
          </div>
          <div className="setting-item-row">
            <span>고객 지원</span>
            <span className="item-value">&gt;</span>
          </div>
        </section>

      </main>
      
      <NavBar current="mypage" />
    </div>
  );
}