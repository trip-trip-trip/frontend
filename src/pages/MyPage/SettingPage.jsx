import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./SettingPage.css";

import NavBar from "../../components/NavBar/NavBar";
import { useAuth } from "../../contexts/AuthContext"; 

export default function SettingPage() {
  const navigate = useNavigate();
const {user}=useAuth();

  const [isOn, setIsOn] = useState(true);
  const [alertCount, setAlertCount] = useState(3);
  const [selectedTimes, setSelectedTimes] = useState(["오전"]);


  //  시간대별 범위 설정
const TIME_RANGES = {
    오전: 7, // 7시
    오후: 12,
    저녁: 17,
    밤: 20,
    새벽: 0,
    점심: 11,
  };

 // 3. [추가] BE에 알림 설정을 저장하는 함수
  const saveSettingsToBE = async (count, times) => {
    if (!user) return; // 로그인 안 했으면 중단

    // BE API가 요구하는 'timezone' 배열로 변환 (예: ["오전", "밤"] -> [7, 20])
    const mappedTimezone = times.map(timeName => TIME_RANGES[timeName]);

    console.log("BE로 알림 설정 전송:", { count, mappedTimezone });

    try {
      await fetch('/api/push/settings', { // (Vite 프록시 /api/ 경로 사용)
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, // (useAuth에서 user.id를 제공한다고 가정)
          timesPerDay: count,
          timezone: mappedTimezone,
        }),
      });
      console.log("BE 알림 설정 저장 완료");
    } catch (err) {
      console.error("BE 알림 설정 저장 실패:", err);
    }
  };


  // 4. [수정] 토글 스위치 (BE 연동)
  const handleToggle = async () => {
    const nextState = !isOn;
    
    if (nextState) { // --- 알림 켜기 ---
      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert("푸시 알림이 지원되지 않는 환경입니다. (홈 화면에 추가 필요)");
        return;
      }

      console.log("푸시 알림 구독 시작...");
      try {
        // 1. VAPID 공개 키 받아오기
        const vapidKeyRes = await fetch('/api/push/vapid-key'); // (Vite 프록시)
        const { vapidPublicKey } = (await vapidKeyRes.json()).result;
        
        // 2. 서비스 워커 준비
        const reg = await navigator.serviceWorker.ready;
        
        // 3. Apple/Google에 "구독 주소" 요청
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey, // BE에서 받은 키
        });

        console.log("구독 성공:", subscription.endpoint);
        const { endpoint, keys } = subscription.toJSON();

        // 4. BE 서버로 "구독 정보" 전송
        await fetch('/api/push/subscribe', { // (Vite 프록시)
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id, // (useAuth에서 user.id를 제공한다고 가정)
            endpoint: endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth,
          }),
        });
        console.log("BE 구독 정보 전송 완료");

        // 5. BE 서버로 "설정" 전송
        await saveSettingsToBE(alertCount, selectedTimes);
        
        setIsOn(true); // 모든 게 성공하면 켜짐

      } catch (err) {
        console.error("푸시 알림 구독 실패:", err);
        alert("알림을 구독하는 데 실패했습니다.");
      }
    } else { // --- 알림 끄기 ---
      console.log("푸시 알림 구독 취소...");
      // (BE에 알림 0회, 시간 없음으로 전송하여 "끄기" 처리)
      await saveSettingsToBE(0, []); 
      setIsOn(false);
      
      // (선택사항: pushManager.unsubscribe() 로직도 추가 가능)
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
    if (isOn) { // 토글이 켜져 있을 때만
      saveSettingsToBE(alertCount, selectedTimes);
    }
    // (isOn이 false면 토글할 때 이미 0, []으로 저장했으므로 무시)
  }, [alertCount, selectedTimes, isOn])
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