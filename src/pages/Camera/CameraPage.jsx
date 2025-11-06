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

  // 모드 변경
  const switchMode = (newMode) => {
    console.log(`[Debug] 모드 변경 시도: ${newMode}`);
    setMode(newMode);
  };

  // 영상 데이터 조각 저장
  const handleDataAvailable = useCallback(
    ({ data }) => {
      console.log('[Debug] 영상 데이터 수신 (dataavailable 이벤트)');
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  // 촬영 버튼 핸들러 (async)
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
      
      let processedImageSrc = imageSrc;
      if (mode === 'film') {
        console.log('[Debug] 필름 모드 사진 촬영, 효과 적용 예정.');
        // (필요시) processedImageSrc = await applyFilmEffect(imageSrc);
      }

navigate('/capture-complete', {
state: { media: processedImageSrc, type: 'photo', mode: mode },
});
}
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