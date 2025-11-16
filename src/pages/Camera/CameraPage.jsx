// src/pages/Camera/CameraPage.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import './CameraPage.css';
 import { applyFilmEffect } from '../../utils/imageProcessing';

const videoConstraints = {
  width: { ideal: 720 },
  height: { ideal: 1280 },
  facingMode: 'user',
};

// 날짜 포맷 함수
function getFilmDate() {
  const d = new Date();
  const year = d.getFullYear().toString().slice(-2); // '25'
  const month = (d.getMonth() + 1).toString().padStart(2, '0'); // '11'
  const day = d.getDate().toString().padStart(2, '0'); // '02'
  return `${year} ${month} ${day}`; // "25 11 02"
}

// 최대 총 촬영 횟수
const MAX_TOTAL_SHOTS = 24;

const CameraPage = () => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [mode, setMode] = useState('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [countdown, setCountdown] = useState(0);
  const [shotCount, setShotCount] = useState(0);
  const navigate = useNavigate();


  const [currentTripId] = useState('trip123'); 
  const storageKey = `totalShotCount_${currentTripId}`;

  // 마운트 시 localStorage에서 횟수 불러오기
  useEffect(() => {
    if (currentTripId) {
      const savedCount = localStorage.getItem(storageKey);
      setShotCount(Number(savedCount) || 0);
      console.log(`[총 촬영] ${currentTripId} 여행, 현재 ${savedCount || 0}회 촬영`);
    }
  }, [currentTripId, storageKey]);

  const switchMode = (newMode) => setMode(newMode);
  const flipCamera = () => {
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
  };
  const handleDataAvailable = useCallback(({ data }) => {
    if (data.size > 0) setRecordedChunks((prev) => prev.concat(data));
  }, []);

  // 6. [수정] 캔버스 합성 함수 (filterConfig 객체를 받도록 수정)
  const applyFilmFrame = async (imageSrc, filmOverlaySrc, filmTextureSrc, dateStamp, cssFilter) => {
   // const { cssFilter, frame, texture } = filterConfig; // 필터 설정값 분해

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const originalImg = new Image();
      originalImg.crossOrigin = "anonymous"; // CORS 문제 방지
      originalImg.src = imageSrc;
      originalImg.onload = async () => { // 비동기 처리를 위해 async 추가
        canvas.width = originalImg.width; canvas.height = originalImg.height;

        // 1. 원본 사진
        ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

        // 2. CSS 필터 적용
        ctx.filter = cssFilter || 'none';
        ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';

        // 3. [수정] 텍스처가 있을 때만 합성
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
                h = canvas.height; w = textureImg.width * (h / textureImg.height);
                x = (canvas.width - w) / 2; y = 0;
              } else { 
                w = canvas.width; h = textureImg.height * (w / textureImg.width);
                x = 0; y = (canvas.height - h) / 2;
              }
              ctx.drawImage(textureImg, x, y, w, h);
              ctx.globalAlpha = 1.0; 
              ctx.globalCompositeOperation = 'source-over';
              textureResolve();
            };
            textureImg.onerror = () => textureResolve(); // 텍스처 로드 실패해도 계속
          });
        }

        // 4. [수정] 프레임이 있을 때만 합성
        if (filmOverlaySrc) {
          await new Promise((frameResolve) => {
            const filmOverlayImg = new Image();
            filmOverlayImg.crossOrigin = "anonymous";
            filmOverlayImg.src = filmOverlaySrc;
            filmOverlayImg.onload = () => {
              const overlayRatio = filmOverlayImg.width / filmOverlayImg.height;
              let drawWidth, drawHeight, offsetX, offsetY;
              
              const canvasRatio = canvas.width / canvas.height;
              if (overlayRatio > canvasRatio) { 
                drawHeight = canvas.height; drawWidth = filmOverlayImg.width * (drawHeight / filmOverlayImg.height);
                offsetX = (canvas.width - drawWidth) / 2; offsetY = 0;
              } else { 
                drawWidth = canvas.width; drawHeight = filmOverlayImg.height * (drawWidth / filmOverlayImg.width);
                offsetX = 0; offsetY = (canvas.height - drawHeight) / 2;
              }
              ctx.drawImage(filmOverlayImg, offsetX, offsetY, drawWidth, drawHeight);
              frameResolve();
            };
            filmOverlayImg.onerror = () => frameResolve(); // 프레임 로드 실패해도 계속
          });
        }

        // 5. 날짜 스탬프
        if (dateStamp) {
            ctx.font = `${Math.max(16, canvas.width * 0.04)}px Courier`;
            ctx.fillStyle = '#FFB800';
            ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
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
    
    // 1. 횟수 검사
    if (shotCount >= MAX_TOTAL_SHOTS) {
      alert(`이번 여행의 최대 촬영 횟수(${MAX_TOTAL_SHOTS}회)를 모두 사용했습니다! 📸`);
      return;
    }

    console.log(`[Debug] 촬영 버튼 클릭. 현재 모드: ${mode}`);
    
    // 2. 영상 모드
    if (mode === 'video') {
      console.log('[Debug] 영상 녹화 시작...');

      if (!webcamRef.current || !webcamRef.current.stream) {
        console.error('[Debug] Webcam 스트림을 찾을 수 없습니다.');
        alert('카메라 스트림에 접근할 수 없습니다.');
        return;
      }
      const originalStream = webcamRef.current.stream;
      const videoTracks = originalStream.getVideoTracks();

      if (videoTracks.length === 0) {
        console.error('[Debug] 스트림에서 비디오 트랙을 찾을 수 없습니다.');
        alert('카메라 비디오를 가져올 수 없습니다.');
        return;
      }

      const videoOnlyStream = new MediaStream(videoTracks);
      // 👇 [수정] Safari 호환성 MimeType 검사
      const mimeType = MediaRecorder.isTypeSupported('video/mp4') 
        ? 'video/mp4' 
        : 'video/webm';
      console.log(`[Debug] MimeType: ${mimeType} 사용`);

      setIsRecording(true);
      setCountdown(3);
      
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
        mediaRecorderRef.current = new MediaRecorder(videoOnlyStream, {
          mimeType: mimeType,
        });

        mediaRecorderRef.current.addEventListener(
          'dataavailable',
          handleDataAvailable
        );

        mediaRecorderRef.current.onerror = (event) => {
          console.error('[Debug] MediaRecorder 에러:', event.error);
          alert(`녹화 중 에러 발생: ${event.error.name}`);
          setIsRecording(false);
          setCountdown(0);
        };

        mediaRecorderRef.current.onstop = () => {
          console.log('[Debug] 녹화 중지됨.');
          setIsRecording(false);
          setCountdown(0);
        };

        mediaRecorderRef.current.start();
        console.log('[Debug] MediaRecorder.start() 호출됨');

        // 3. (영상) 녹화 *시작 성공 시* 카운트 증가
        const newCount = shotCount + 1;
        setShotCount(newCount);
        localStorage.setItem(storageKey, newCount.toString());
        console.log(`[총 촬영] ${newCount} / ${MAX_TOTAL_SHOTS} 회 (영상)`);

        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            console.log('[Debug] 3초 경과, 녹화 중지 시도...');
            mediaRecorderRef.current.stop();
          }
        }, 3000);

      } catch (e) {
        console.error('[Debug] MediaRecorder 초기화 실패:', e);
        alert(`영상 녹화를 시작할 수 없습니다. (에러: ${e.message})`);
        setIsRecording(false);
        setCountdown(0);
      }

    } else { 
      // 2. 사진 또는 필름 모드
      console.log('[Debug] 사진 촬영');
      
      const imageSrc = webcamRef.current.getScreenshot();

      if (!imageSrc) {
        alert('카메라가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
        return; 
      }

      // 3. (사진/필름) *촬영 성공 시* 카운트 증가
      const newCount = shotCount + 1;
      setShotCount(newCount);
      localStorage.setItem(storageKey, newCount.toString());
      console.log(`[총 촬영] ${newCount} / ${MAX_TOTAL_SHOTS} 회 (사진/필름)`);
      
      console.log('[Debug] 필름 모드 사진 촬영, 효과 적용 예정.');
      // 8. [수정] 현재 선택된 필터 팩 전체를 전달
      const selectedFilter = FILTERS[currentFilterIndex];
        const processedImageSrc = await applyFilmFrame(
        imageSrc, 
          selectedFilter.frame,   // 👈 2번째 인자 (프레임)
          selectedFilter.texture, // 👈 3번째 인자 (텍스처)
          getFilmDate(),          // 👈 4번째 인자 (날짜)
          selectedFilter.cssFilter
      
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
    //currentTripId // currentTripId 의존성 추가 (StorageKey 생성)
  ]);

  // 영상 녹화 완료 시 페이지 이동
  useEffect(() => {
    if (recordedChunks.length > 0 && !isRecording) {
      console.log('[Debug] useEffect: 녹화 완료, 청크 처리 중...');
      const blob = new Blob(recordedChunks, {
        type: 'video/webm', // (mimeType과 일치시키는 게 좋지만, webm이 보편적)
      });
      const url = URL.createObjectURL(blob);
      setRecordedChunks([]);

      navigate('/capture-complete', {
        state: { media: url, type: 'video', blob: blob }, 
      });
    }
  }, [recordedChunks, isRecording, navigate]);

  return (
    <div className="camera-page-wrapper">
      <header className="camera-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <span className="header-title">촬영</span>
      </header>

      <div className="camera-view-container">
        <Webcam
         audio={true} 
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="webcam-feed"
          // (레이아웃 밀림은 CameraPage.css의 .webcam-feed { width: 100%; } 로 해결)
        />
        
        {mode === 'film' && (
          <div className="film-overlay">
            <div className="film-date-stamp">
              {getFilmDate()}
            </div>
          </div>
        )}

        {mode === 'video' && isRecording && countdown > 0 && (
          <div className="countdown-overlay">
            <span>{countdown}</span>
          </div>
        )}
        
        {!isRecording && mode !== 'film' && (
            <div className="camera-view-text">
                카메라 뷰
            </div>
        )}
      </div>

      <div className="camera-controls-bar">
        <div className="mode-selector">
          <button 
            onClick={() => switchMode('film')} 
            className={mode === 'film' ? 'active' : ''}
          >
            필름
          </button>
          <button 
            onClick={() => switchMode('photo')} 
            className={mode === 'photo' ? 'active' : ''}
          >
            사진
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