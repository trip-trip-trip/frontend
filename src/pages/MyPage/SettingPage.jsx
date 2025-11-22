import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SettingPage.css";
import NavBar from "../../components/NavBar/NavBar";
import { useAuth } from "../../contexts/AuthContext"; 

// 아이콘 임포트
import offIcon from "../../assets/off.png";
import onIcon from "../../assets/on.png";
import bellIcon from "../../assets/bell.png";
import settingIcon from "../../assets/setting.png";

const API_BASE = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
  : '/api';

// 유틸 함수: Base64 -> Uint8Array
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
  const { user, token } = useAuth(); 

  const [isOn, setIsOn] = useState(false); 
  const [alertCount, setAlertCount] = useState(3);
  const [selectedTimes, setSelectedTimes] = useState(["오전"]);

  //
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
      return [9, 21]; // 기본값
    }
    const start = Math.min(...hours);
    const end = Math.max(...hours);
    return [start, end];
  };

  const restoreSelectedTimes = (timezone) => {
    if (!timezone || timezone.length < 2) return ["오전"];
    const [start, end] = timezone;
    return Object.entries(TIME_RANGES)
      // 범위가 겹치는 시간대를 찾음
      .filter(([_, range]) => !(range[1] <= start || range[0] >= end))
      .map(([key]) => key);
  };

  // 1. BE에서 설정 불러오기 (초기화)
  useEffect(() => {
    if (!user || !token) return;

    const loadSettingsFromBE = async () => {
      try {
        const res = await fetch(`${API_BASE}/push/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("설정 불러오기 실패");

        const data = await res.json();

        if (data.isSuccess && data.result) {
          const { timesPerDay, timezone } = data.result;
          setAlertCount(timesPerDay);
          // BE에서 받은 [start, end]를 UI용 ["오전", "오후"]로 변환
          setSelectedTimes(restoreSelectedTimes(timezone));
          setIsOn(timesPerDay > 0);
        }
      } catch (err) {
        console.error("설정 로드 실패:", err);
      }
    };

    loadSettingsFromBE();
  }, [user, token]);


  // 2. 설정을 BE에 저장하는 함수
  const saveSettingsToBE = async (count, times) => {
    if (!user || !token) return;

    // 
    const timezone = buildTimezoneRange(times);
    console.log("BE 저장:", { timesPerDay: count, timezone });

    try {
      const res = await fetch(`${API_BASE}/push/settings`, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          timesPerDay: count,
          timezone, 
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

  // 3. 토글 핸들러
  const handleToggle = async () => {
    const nextState = !isOn;
    
    if (nextState) { // ON
      if (!user || !user.id || !token) return alert("로그인 필요");
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return alert("푸시 미지원");

      try {
        const vapidKeyRes = await fetch(`${API_BASE}/push/vapid-key`);
        if (!vapidKeyRes.ok) throw new Error('VAPID 키 로드 실패');
        const vapidData = await vapidKeyRes.json();
        const vapidPublicKey = vapidData.result?.vapidPublicKey || vapidData.vapidPublicKey;
        
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

        const reg = await navigator.serviceWorker.ready;
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });

               console.log("구독 성공:", subscription.endpoint);
        const { endpoint, keys } = subscription.toJSON();
        
        const subRes = await fetch(`${API_BASE}/push/subscribe`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({
            userId: String(user.id), 
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

  // 4. 시간대 버튼 클릭 핸들러
  const toggleTime = (time) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };
 
  // 5. 설정 변경 시 자동 저장 (토글 켜져 있을 때만)
  useEffect(() => {
    if (isOn && user && token) { 
      saveSettingsToBE(alertCount, selectedTimes);
    }
  }, [alertCount, selectedTimes, isOn]);

  // 6. 수동 저장 버튼 핸들러
  const handleManualSave = () => {
      if (isOn) {
          saveSettingsToBE(alertCount, selectedTimes);
          alert("설정이 저장되었습니다.");
      } else {
          alert("알림이 꺼져있습니다.");
      }
  };

  return (
    <div className="setting-page"> 
      {/* 상단바 */}
      <header className="setting-header">
        <button className="back-button" onClick={() => navigate(-1)}>&lt;</button>
        <h2 className="header-title"></h2>
      </header>

      <main className="setting-content">
        
        {/* 페이지 타이틀 */}
        <div className="page-title-section">
            <img src={settingIcon} alt="설정" className="page-title-icon" />
            <h1 className="page-title-text">계정 설정</h1>
        </div>

        {/* 알림 설정 섹션 */}
        <section className="setting-section">
         <div className="notification-item">
             {/* 왼쪽: 벨 아이콘 (원형 배경) */}
             <div className="notification-icon-wrapper">
               <img src={bellIcon} alt="bell" className="bell-icon" />
             </div>

             {/* 가운데: 텍스트 */}
             <div className="notification-text-wrapper">
               <span className="notification-title">순간 기록 알림</span>
               <span className="notification-desc">여행 중 특별한 순간을 놓치지 마세요!</span>
             </div>
             <button className="toggle-btn" onClick={handleToggle}>
               <img src={isOn ? onIcon : offIcon} alt="toggle" className="toggle-icon" />
             </button>
          </div>
        </section>

        {/* 횟수 설정 섹션 */}
        <section className="setting-section">
          <div className="count-row">
             <span className="count-label">하루 알림 횟수</span>
             <span className="count-value">{alertCount}회</span>
          </div>
          
          <div className="range-slider-wrapper">
             <div className="range-labels">
              <span>1회</span>
              <span>5회</span>
              <span>10회</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={alertCount}
              onChange={(e) => setAlertCount(Number(e.target.value))}
              className="range-slider"
            />
           
          </div>
        </section>
        
        {/* 시간대 설정 섹션 */}
        <section className="setting-section">
          <h3>알림 시간대</h3>
          <p className="setting-subtext">설정한 시간대에 알림을 받을 수 있어요.</p>
          <div className="time-grid">
            {Object.keys(TIME_RANGES).map((t) => (
              <button
                key={t}
                onClick={() => toggleTime(t)}
                className={`time-btn ${selectedTimes.includes(t) ? "selected" : ""}`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

      
<div className="save-btn-container">
          <button className="save-btn" onClick={handleManualSave}>
              저장하기
          </button>
      </div>
      </main>

      {/* 하단 저장 버튼 */}
      
      
      <NavBar current="mypage" />
    </div>
  );
}