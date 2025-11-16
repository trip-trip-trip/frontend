// src/pages/Camera/CameraPage.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useNavigate, useParams } from 'react-router-dom';
import './CameraPage.css';

// 1. 사용할 모든 '재료' 임포트
import frameAsset from '../../assets/cameralens22.png'; // 님의 고정 프레임
import textureAsset from '../../assets/filmeffect.png'; // 님의 고정 텍스처
import switchmode from '../../assets/switchcam.png';

// 2. [핵심] "필터 조합 팩"을 배열로 정의
// (프레임: null = 없음, 텍스처: null = 없음, cssFilter: 'none' = 없음)
const FILTERS = [
  { 
    name: '코닥 (풀)', 
    frame: frameAsset,    // 프레임 O
    texture: textureAsset,  // 텍스처 O
    cssFilter: 'sepia(15%) contrast(85%) brightness(100%) saturate(80%)' // CSS 색감 O
  },
   { 
    name: '코닥2 (풀)', 
    frame: frameAsset,    // 프레임 O
    texture: textureAsset,  // 텍스처 O
    cssFilter: 'sepia(15%) contrast(105%) brightness(100%) saturate(90%)' // CSS 색감 O
  },
  { 
    name: '프레임만', 
    frame: frameAsset,    // 프레임 O
    texture: null,          // 텍스처 X
    cssFilter: 'sepia(20%) contrast(80%) brightness(85%) saturate(110%)' // CSS 색감 O
  },
   { 
    name: '프레임만2', 
    frame: frameAsset,    // 프레임 O
    texture: null,          // 텍스처 X
    cssFilter: 'sepia(0%) contrast(105%) brightness(100%) saturate(80%)' // CSS 색감 O
  },
  { 
    name: '프레임만3', 
    frame: frameAsset,    // 프레임 O
    texture: null,          // 텍스처 X
    cssFilter: 'sepia(20%) contrast(85%) brightness(85%) saturate(110%)' // CSS 색감 O
  },
   { 
    name: '프레임만4', 
    frame: frameAsset,    // 프레임 O
    texture: null,          // 텍스처 X
    cssFilter: 'sepia(20%) contrast(75%) brightness(105%) saturate(130%)' // CSS 색감 O
  },
  { 
    name: '텍스처 + 색감', 
    frame: null,            // 프레임 X
    texture: textureAsset,  // 텍스처 O
    cssFilter: 'sepia(10%) contrast(80%) brightness(105%) saturate(110%)' // CSS 색감 O
  },
   { 
    name: '텍스처 + 색감2', 
    frame: null,            // 프레임 X
    texture: textureAsset,  // 텍스처 O
    cssFilter: 'sepia(20%) contrast(90%) brightness(115%) saturate(85%)' // CSS 색감 O
  },
  { 
    name: '텍스처 + 색감3', 
    frame: null,            // 프레임 X
    texture: textureAsset,  // 텍스처 O
    cssFilter: 'sepia(0%) contrast(70%) brightness(95%) saturate(75%)' // CSS 색감 O
  },
  { 
    name: '흑백 (프레임 없음)', 
    frame: null,            // 프레임 X
    texture: null,  // 텍스처 O
    cssFilter: 'grayscale(50%) contrast(100%) brightness(100%)' // CSS 색감 O (텍스처는 흑백으로)
  },
   { 
    name: 'ㅈㄴ흑백 (프레임 없음)', 
    frame: null,            // 프레임 X
    texture: null,  // 텍스처 O
    cssFilter: 'grayscale(90%) contrast(100%) brightness(100%)' // CSS 색감 O (텍스처는 흑백으로)
  },
  { 
    name: '기본', 
    frame: null,            // 프레임 X
    texture: null,          // 텍스처 X
    cssFilter:'sepia(10%) contrast(100%) brightness(105%) saturate(80%)'      // CSS 색감 X
  },
  { 
    name: '기본2', 
    frame: null,            // 프레임 X
    texture: null,          // 텍스처 X
    cssFilter:'sepia(10%) contrast(85%) brightness(120%) saturate(100%)'      // CSS 색감 X
  }
];

// 날짜 포맷 함수
function getFilmDate() {
  const d = new Date();
  const year = d.getFullYear().toString().slice(-2);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year} ${month} ${day}`;
}

const MAX_TOTAL_SHOTS = 24;

const CameraPage = () => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [mode, setMode] = useState('film'); // 3. [수정] 기본 모드를 'film'으로
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [countdown, setCountdown] = useState(0);
  const [shotCount, setShotCount] = useState(0);
  const navigate = useNavigate();
  const [facingMode, setFacingMode] = useState('user');
  const { tripId } = useParams();
  const storageKey = `totalShotCount_${tripId}`;

  // 4. 스와이프 및 필터 인덱스 state
  const [currentFilterIndex, setCurrentFilterIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  const nextFilter = () => setCurrentFilterIndex((prev) => (prev + 1) % FILTERS.length);
  const prevFilter = () => setCurrentFilterIndex((prev) => (prev - 1 + FILTERS.length) % FILTERS.length);

  // 5. 스와이프 이벤트 핸들러
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = 0;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (mode !== 'film') return; // 필름 모드일 때만
    if (touchEndX.current === 0) return; 
    const swipeThreshold = 50; 
    const swipeDistance = touchStartX.current - touchEndX.current;
    if (swipeDistance > swipeThreshold) {
      console.log("Swipe Left (Next Filter)");
      nextFilter();
    } else if (swipeDistance < -swipeThreshold) {
      console.log("Swipe Right (Prev Filter)");
      prevFilter();
    }
  };

  useEffect(() => {
    if (tripId) {
      const savedCount = localStorage.getItem(storageKey);
      setShotCount(Number(savedCount) || 0);
      console.log(`[총 촬영] ${tripId} 여행, 현재 ${savedCount || 0}회 촬영`);
    }
  }, [tripId, storageKey]);

  const switchMode = (newMode) => setMode(newMode);
  const flipCamera = () => {
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
  };
  const handleDataAvailable = useCallback(({ data }) => {
    if (data.size > 0) setRecordedChunks((prev) => prev.concat(data));
  }, []);
const applyFilmFrame = async (imageSrc, filmOverlaySrc, filmTextureSrc, dateStamp, cssFilter) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const originalImg = new Image();
      originalImg.crossOrigin = "anonymous";
      originalImg.src = imageSrc;

      originalImg.onload = async () => {
        canvas.width = originalImg.width;
        canvas.height = originalImg.height;

        // 원본 이미지
        ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

        // CSS 필터 적용
        ctx.filter = cssFilter || 'none';
        ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';

        // 텍스처 적용
        if (filmTextureSrc) {
          await new Promise((textureResolve) => {
            const textureImg = new Image();
            textureImg.crossOrigin = "anonymous";
            textureImg.src = filmTextureSrc;

            textureImg.onload = () => {
              ctx.globalAlpha = 0.7;
              ctx.globalCompositeOperation = 'overlay';

              const ratio = textureImg.width / textureImg.height;
              const canvasRatio = canvas.width / canvas.height;

              let w, h, x, y;

              if (ratio > canvasRatio) {
                h = canvas.height;
                w = textureImg.width * (h / textureImg.height);
                x = (canvas.width - w) / 2;
                y = 0;
              } else {
                w = canvas.width;
                h = textureImg.height * (w / textureImg.width);
                x = 0;
                y = (canvas.height - h) / 2;
              }

              ctx.drawImage(textureImg, x, y, w, h);
              ctx.globalAlpha = 1.0;
              ctx.globalCompositeOperation = 'source-over';

              textureResolve();
            };

            textureImg.onerror = () => textureResolve();
          });
        }

        // 프레임 합성
        if (filmOverlaySrc) {
          await new Promise((frameResolve) => {
            const overlayImg = new Image();
            overlayImg.crossOrigin = "anonymous";
            overlayImg.src = filmOverlaySrc;

            overlayImg.onload = () => {
              const overlayRatio = overlayImg.width / overlayImg.height;
              const canvasRatio = canvas.width / canvas.height;

              let drawWidth, drawHeight, offsetX, offsetY;

              if (overlayRatio > canvasRatio) {
                drawHeight = canvas.height;
                drawWidth = overlayImg.width * (drawHeight / overlayImg.height);
                offsetX = (canvas.width - drawWidth) / 2;
                offsetY = 0;
              } else {
                drawWidth = canvas.width;
                drawHeight = overlayImg.height * (drawWidth / overlayImg.width);
                offsetX = 0;
                offsetY = (canvas.height - drawHeight) / 2;
              }

              ctx.drawImage(overlayImg, offsetX, offsetY, drawWidth, drawHeight);
              frameResolve();
            };

            overlayImg.onerror = () => frameResolve();
          });
        }

        // 날짜 스탬프
        if (dateStamp) {
          ctx.font = `${Math.max(16, canvas.width * 0.04)}px Courier`;
          ctx.fillStyle = '#FFB800';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';

          const marginX = canvas.width * 0.05;
          const marginY = canvas.height * 0.05;

          ctx.fillText(dateStamp, canvas.width - marginX, canvas.height - marginY);
        }

        resolve(canvas.toDataURL('image/jpeg'));
      };
    });
  };

  
  // 7. [수정] 'photo' 모드 삭제, 'video'와 'film'만 남김
  const handleStartCaptureClick = useCallback(async () => {
    if (shotCount >= MAX_TOTAL_SHOTS) { /* ... */ return; }
    console.log(`[Debug] 촬영 버튼 클릭. 현재 모드: ${mode}`);
    
    if (mode === 'video') {
      if (!webcamRef.current || !webcamRef.current.stream) { /* ... */ return; }
      const originalStream = webcamRef.current.stream;
      const videoTracks = originalStream.getVideoTracks();
      if (videoTracks.length === 0) { /* ... */ return; }
      const videoOnlyStream = new MediaStream(videoTracks);
      const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
      setIsRecording(true); setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      try {
        mediaRecorderRef.current = new MediaRecorder(videoOnlyStream, { mimeType });
        mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
        mediaRecorderRef.current.onerror = (event) => {
          console.error('[Debug] MediaRecorder 에러:', event.error);
          alert(`녹화 중 에러 발생: ${event.error.name}`);
          setIsRecording(false); setCountdown(0);
        };
        mediaRecorderRef.current.onstop = () => {
          console.log('[Debug] 녹화 중지됨.');
          setIsRecording(false); setCountdown(0);
        };
        mediaRecorderRef.current.start();
        const newCount = shotCount + 1;
        setShotCount(newCount);
        localStorage.setItem(storageKey, newCount.toString());
        console.log(`[총 촬영] ${newCount} / ${MAX_TOTAL_SHOTS} 회 (영상)`);
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }, 3000);
      } catch (e) {
        console.error('[Debug] MediaRecorder 초기화 실패:', e);
        alert(`영상 녹화를 시작할 수 없습니다. (에러: ${e.message})`);
        setIsRecording(false); setCountdown(0);
      }
    } else if (mode === 'film') { 
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        alert('카메라가 준비되지 않았습니다.');
        return; 
      }

      const newCount = shotCount + 1;
      setShotCount(newCount);
      localStorage.setItem(storageKey, newCount.toString());
      console.log(`[총 촬영] ${newCount} / ${MAX_TOTAL_SHOTS} 회 (${mode})`);
      
      console.log('[Debug] 필름 모드 사진 촬영, 효과 적용 예정.');
      // 8. [수정] 현재 선택된 필터 팩 전체를 전달
      const selectedFilter = FILTERS[currentFilterIndex];
        const processedImageSrc = await applyFilmFrame(
          imageSrc, 
          selectedFilter.frame,   // 👈 선택된 프레임 (null일 수 있음)
          selectedFilter.texture, // 👈 선택된 텍스처 (null일 수 있음)
          getFilmDate(),
          selectedFilter.cssFilter // 👈 선택된 CSS 필터
        );

      navigate(`/capture-complete/${tripId}`, {
        state: { media: processedImageSrc, type: 'photo', mode: mode },
      });
    }
    // 9. [삭제] 'else' (photo 모드) 블록 삭제
  }, [
    webcamRef, 
    mediaRecorderRef, 
    mode, 
    navigate, 
    handleDataAvailable, 
    shotCount, 
    storageKey,
    tripId,
    currentFilterIndex // 10. [추가] 의존성 배열
  ]);

  useEffect(() => {
    if (recordedChunks.length > 0 && !isRecording) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedChunks([]);
      navigate(`/capture-complete/${tripId}`, {
        state: { media: url, type: 'video', blob: blob }, 
      });
    }
  }, [recordedChunks, isRecording, navigate, tripId]);

  const videoConstraints = {
    //width: { ideal: 720 },
   // height: { ideal: 1280 },
    facingMode: facingMode
  };

  return (
    <div className="camera-page-wrapper">
      <header className="camera-header">
        <button className="back-button" onClick={() => navigate(-1)}>&lt;</button>
        <span className="header-title">촬영</span>
        <button className="flip-camera-button" onClick={flipCamera}>
          <img src={switchmode} alt="Switch Camera" className="flip-icon" />
        </button>
      </header>

      {/* 12. [수정] 스와이프 이벤트를 camera-view-container에 바인딩 */}
      <div 
        className="camera-view-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 13. [수정] 현재 필터의 CSS 필터 값을 웹캠에 인라인 스타일로 적용 */}
        <Webcam
          audio={true} 
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className={`webcam-feed ${facingMode}`} 
          style={{ 
            filter: mode === 'film' ? FILTERS[currentFilterIndex].cssFilter : 'none' 
          }}
        />
        
        {/* 실시간 오버레이 */}
        {mode === 'film' && (
          (() => { // 14. [수정] 현재 필터 설정을 변수로 먼저 선언
            const currentFilter = FILTERS[currentFilterIndex];
            return (
              <div className="film-overlay">
                {/* 15. [수정] 프레임이 있을 때만 렌더링 */}
                {currentFilter.frame && (
                  <img 
                    src={currentFilter.frame} 
                    alt="Film Frame" 
                    className="film-frame-overlay" 
                  />
                )}
                {/* 16. [수정] 텍스처가 있을 때만 렌더링 */}
                {currentFilter.texture && (
                  <img 
                    src={currentFilter.texture} 
                    alt="Film Texture" 
                    className="film-texture-overlay"
                    // (텍스처 CSS는 CameraPage.css에서 관리)
                  />
                )}
                <div className="film-date-stamp">
                  {getFilmDate()}
                </div>
                {/* 17. [수정] 현재 필터 이름 표시 */}
                <div className="film-filter-name">
                  {currentFilter.name}
                </div>
              </div>
            );
          })()
        )}

        {mode === 'video' && isRecording && countdown > 0 && (
          <div className="countdown-overlay">
            <span>{countdown}</span>
          </div>
        )}
        
        {/* 18. [삭제] '사진' 모드가 없으므로 '카메라 뷰' 텍스트 불필요 */}
      </div>

      <div className="camera-controls-bar">
        <div className="mode-selector">
          {/* 19. [삭제] '사진' 모드 버튼 삭제 */}
          <button 
            onClick={() => switchMode('film')} 
            className={mode === 'film' ? 'active' : ''}
          >
            필름
          </button>
          <button 
            onClick={() => switchMode('video')} 
            className={mode === 'video' ? 'active' : ''}
          >
            영상
          </button>
        </div>
        
        <div className="capture-button-area">
          <button
            onClick={handleStartCaptureClick}
            disabled={
              isRecording || 
              (shotCount >= MAX_TOTAL_SHOTS)
            }
            className={`capture-button ${isRecording ? 'recording' : ''}`}
          >
            {isRecording && mode === 'video' ? (
              <div className="recording-indicator"></div>
            ) : (
              <div className="shutter-circle"></div>
            )}
          </button>
        </div>

        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${(shotCount / MAX_TOTAL_SHOTS) * 100}%` }}
          ></div>
          <span className="shot-counter-text">
            {shotCount} / {MAX_TOTAL_SHOTS}
          </span>
        </div>
        
      </div>
    </div>
  );
};

export default CameraPage;