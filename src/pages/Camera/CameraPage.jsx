// src/pages/Camera/CameraPage.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useNavigate, useParams } from 'react-router-dom';
import './CameraPage.css';
//import filmFrame from '../../assets/filmvideo.png';  //notbad
//import filmFrame from '../../assets/filmstrip2.png'; //세로방향 notbad
//import filmFrame from '../../assets/cameralens.png'; //카메라렌즈스타일ㄱㅊ

import filmFrame from '../../assets/filmvideo.png';
import filmTexture from '../../assets/filmgrain.png';



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

  const [facingMode, setFacingMode] = useState('user'); // 'user' = 전면

  const { tripId } = useParams();
  const storageKey = `totalShotCount_${tripId}`;

  useEffect(() => {
    if (tripId) {
      const savedCount = localStorage.getItem(storageKey);
      setShotCount(Number(savedCount) || 0);
      console.log(`[총 촬영] ${tripId} 여행, 현재 ${savedCount || 0}회 촬영`);
    }
  }, [tripId, storageKey]);

  const switchMode = (newMode) => {
    console.log(`[Debug] 모드 변경 시도: ${newMode}`);
    setMode(newMode);
  };

  const flipCamera = () => {
    console.log("카메라 전환");
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
  };

  const handleDataAvailable = useCallback(
    ({ data }) => {
      console.log('[Debug] 영상 데이터 수신 (dataavailable 이벤트)');
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  // 2. [추가] 필름 프레임 합성 함수
  const applyFilmFrame = async (imageSrc, filmOverlaySrc, dateStamp) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const originalImg = new Image();
      originalImg.src = imageSrc;
      originalImg.onload = () => {
        canvas.width = originalImg.width;
        canvas.height = originalImg.height;

        // 1. 원본 사진을 캔버스에 그립니다.
       ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

// ✅ Kodak Warm Tone 효과 추가
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = imageData.data;

for (let i = 0; i < data.length; i += 4) {
  // 약간 따뜻한 색감 (Red +5%, Green +2%, Blue -5%)
  data[i] = Math.min(data[i] * 1.08 + 5, 255);   // Red
  data[i + 1] = Math.min(data[i + 1] * 1.02 + 2, 255); // Green
  data[i + 2] = Math.max(data[i + 2] * 0.95 - 3, 0);   // Blue

  // 약간 대비 낮추기
  const brightness = (data[i] + data[i+1] + data[i+2]) / 3;
  data[i] = data[i] * 0.95 + brightness * 0.05;
  data[i + 1] = data[i + 1] * 0.95 + brightness * 0.05;
  data[i + 2] = data[i + 2] * 0.95 + brightness * 0.05;
}

// 수정된 색감 적용
ctx.putImageData(imageData, 0, 0);
        const filmOverlayImg = new Image();
        filmOverlayImg.src = filmOverlaySrc; // 님이 주신 필름 오버레이 이미지
        filmOverlayImg.onload = () => {
          // 2. 그 위에 필름 오버레이 이미지를 그립니다.
          // 오버레이 이미지가 캔버스 크기에 맞게 꽉 차도록 그립니다.
          // object-fit: cover 처럼 중앙에 맞춰 확대/축소되도록 합니다.
          const overlayRatio = filmOverlayImg.width / filmOverlayImg.height;
          const canvasRatio = canvas.width / canvas.height;
          
          let drawWidth, drawHeight, offsetX, offsetY;

          if (overlayRatio > canvasRatio) { 
            drawHeight = canvas.height;
            drawWidth = filmOverlayImg.width * (canvas.height / filmOverlayImg.height);
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
          } else { 
            drawWidth = canvas.width;
            drawHeight = filmOverlayImg.height * (canvas.width / filmOverlayImg.width);
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
          }

          ctx.drawImage(filmOverlayImg, offsetX, offsetY, drawWidth, drawHeight);
          // 3. 날짜 스탬프 추가
          if (dateStamp) {
            // 폰트 크기 및 위치 조정 (캔버스 크기에 비례)
            ctx.font = `${Math.max(16, canvas.width * 0.04)}px Arial`; 
            ctx.fillStyle = 'white';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            // 적절한 마진을 줍니다. (캔버스 너비의 3~5% 정도)
            const marginX = canvas.width * 0.05;
            const marginY = canvas.height * 0.05;
            ctx.fillText(dateStamp, canvas.width - marginX, canvas.height - marginY);
          }

          // 합성된 이미지를 Data URL로 변환
          resolve(canvas.toDataURL('image/jpeg'));
        };filmOverlayImg.onerror = () => {
          console.error("필름 오버레이 이미지 로드 실패:", filmOverlaySrc);
          resolve(imageSrc); // 오버레이 로드 실패 시 원본 이미지 반환
        };
      };
      originalImg.onerror = () => {
        console.error("원본 이미지 로드 실패:", imageSrc);
        resolve(imageSrc); // 원본 이미지 로드 실패 시
      };
    });
  };


  const handleStartCaptureClick = useCallback(async () => {
    
    if (shotCount >= MAX_TOTAL_SHOTS) {
      alert(`이번 여행의 최대 촬영 횟수(${MAX_TOTAL_SHOTS}회)를 모두 사용했습니다! 📸`);
      return;
    }

    console.log(`[Debug] 촬영 버튼 클릭. 현재 모드: ${mode}`);
    
    if (mode === 'video') {
      // ... (영상 녹화 로직은 기존과 동일) ...
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
      // 사진 또는 필름 모드
      console.log('[Debug] 사진 촬영');
      
      const imageSrc = webcamRef.current.getScreenshot();

      if (!imageSrc) {
        alert('카메라가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
        return; 
      }

      const newCount = shotCount + 1;
      setShotCount(newCount);
      localStorage.setItem(storageKey, newCount.toString());
      console.log(`[총 촬영] ${newCount} / ${MAX_TOTAL_SHOTS} 회 (사진/필름)`);
      
      let processedImageSrc = imageSrc;
      if (mode === 'film') {
        console.log('[Debug] 필름 모드 사진 촬영, 효과 적용 예정.');
        // 3. [수정] 필름 모드일 때만 합성 함수 호출
        processedImageSrc = await applyFilmFrame(imageSrc, filmFrame, filmTexture,getFilmDate());
      }

      navigate(`/capture-complete/${tripId}`, {
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
    tripId // tripId 의존성 추가
  ]);

  useEffect(() => {
    if (recordedChunks.length > 0 && !isRecording) {
      console.log('[Debug] useEffect: 녹화 완료, 청크 처리 중...');
      const blob = new Blob(recordedChunks, {
        type: 'video/webm', // (mimeType과 일치시키는 게 좋지만, webm이 보편적)
      });
      const url = URL.createObjectURL(blob);
      setRecordedChunks([]);

      navigate(`/capture-complete/${tripId}`, {
        state: { media: url, type: 'video', blob: blob }, 
      });
    }
  }, [recordedChunks, isRecording, navigate,tripId]);

  const videoConstraints = {
    width: { ideal: 720 },
    height: { ideal: 1280 },
    facingMode: facingMode // state에서 값을 받아옴
  };
  return (
    <div className="camera-page-wrapper">
  <header className="camera-header">
 <button className="back-button" onClick={() => navigate(-1)}>
&lt;
</button>
<span className="header-title">촬영</span>
        {/* 5. [추가] 카메라 전환 버튼 */}
        <button className="flip-camera-button" onClick={flipCamera}>
          {/* (아이콘 🔄 대신 임시 텍스트) */}
          전환
        </button>
</header>

      <div className="camera-view-container">
        <Webcam
          audio={true} 
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="webcam-feed"
        />
        
        {/* 4. [수정] 필름 모드일 때만 필름 프레임과 날짜 스탬프 오버레이 */}
{mode === 'film' && (
          <>
            <div className="film-overlay">
              {/* 프레임 이미지는 웹캠 위에 직접  */}
              <img src={filmFrame} alt="Film Frame" className="film-frame-overlay" />
              {/* 질감 오버레이는 프레임보다 위에 오도록 별도의 클래스로 설정 */}
              <img src={filmTexture} alt="Film Texture" className="film-texture-overlay" />
              <div className="film-date-stamp">
                {getFilmDate()}
              </div>
            </div>
          </>
        )}

        {mode === 'video' && isRecording && countdown > 0 && (
          <div className="countdown-overlay">
            <span>{countdown}</span>
          </div>
        )}
        
        {/* 5. [수정] 필름 모드일 때는 '카메라 뷰' 텍스트를 숨김 */}
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