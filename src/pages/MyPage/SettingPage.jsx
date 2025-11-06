import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./SettingPage.css";
import {
  requestNotificationPermission,
  showPushNotification,
} from "../../utils/notification";

export default function SettingPage() {
  const navigate = useNavigate();

  const [isOn, setIsOn] = useState(true);
  const [alertCount, setAlertCount] = useState(3);
  const [selectedTimes, setSelectedTimes] = useState(["오전"]);
  const timers = useRef([]);

  //  시간대별 범위 설정
  const TIME_RANGES = {
    오전: [7, 12], // 7시 ~ 12시
    오후: [12, 17], // 12시 ~ 17시
    저녁: [17, 20], // 17시 ~ 20시
    밤: [20, 24], // 20시 ~ 24시
    새벽: [0, 6], // 0시 ~ 6시
    점심: [11, 13], // 11시 ~ 13시
  };

  //  랜덤 시각 생성
  function getRandomTimeInRange(startHour, endHour) {
    const now = new Date();
    let target = new Date();

    const hour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
    const minute = Math.floor(Math.random() * 60);
    target.setHours(hour, minute, 0, 0);

    // 이미 지난 시각이면 다음날로
    if (target < now) {
      target.setDate(target.getDate() + 1);
    }
    return target;
  }

  // ✅ 토글 스위치
  const handleToggle = async () => {
    const nextState = !isOn;
    setIsOn(nextState);
    if (nextState) {
      await requestNotificationPermission();
      scheduleRandomNotifications(); // ON으로 바뀌면 즉시 스케줄 시작
    } else {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      console.log("🛑 알림 스케줄 중단");
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

  const scheduleRandomNotifications = () => {
  console.log("🕒 알림 스케줄 시작...");
  timers.current.forEach(clearTimeout);
  timers.current = [];

  // 전체 알림 횟수
  const totalAlerts = alertCount;
  const totalSlots = selectedTimes.length;

  if (totalSlots === 0) {
    console.warn("시간대가 선택되지 않음 — 알림 예약 중단");
    return;
  }

  // 각 시간대에 배분할 개수 (랜덤 오차 허용)
  let remaining = totalAlerts;
  const counts = selectedTimes.map((_, i) => {
    const avg = Math.floor(totalAlerts / totalSlots);
    const isLast = i === totalSlots - 1;
    const random = Math.random() < 0.5 ? 0 : 1; // 약간 랜덤하게
    const count = isLast ? remaining : Math.min(avg + random, remaining);
    remaining -= count;
    return count;
  });

  // 각 시간대별로 해당 개수만큼 예약
  selectedTimes.forEach((timeName, idx) => {
    const [start, end] = TIME_RANGES[timeName];
    const count = counts[idx];

    for (let i = 0; i < count; i++) {
      const randomTime = getRandomTimeInRange(start, end);
      const delay = randomTime - new Date();

      if (delay > 0) {
        const timer = setTimeout(() => {
          showPushNotification(
            "📸 지금 이 순간을 담아보세요!",
            `3초 영상으로 여행의 특별한 순간을 기록해보세요.`
          );
        }, delay);

        timers.current.push(timer);
        console.log(`⏰ [${timeName}] ${randomTime.toLocaleTimeString()} 에 알림 예정`);
      }
    }
  });
};


  useEffect(() => {
    if (isOn) scheduleRandomNotifications();
  }, [alertCount, selectedTimes]);
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
    </div>
  );
}