// src/pages/Camera/CaptureCompletePage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate,useParams } from 'react-router-dom';
import './CaptureCompletePage.css'; // CSS 파일 생성

const CaptureCompletePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tripId } = useParams();
  
  const { media, type, blob } = location.state || {}; // CameraPage에서 넘긴 state
  const [comment, setComment] = useState('');

  const handleSave = async () => {
    // 1. tripId가 있는지 확인 (URL에서)
    if (!tripId) {
      alert("유효하지 않은 여행입니다. (tripId 없음)");
      return;
    }

  // 저장하기 버튼 클릭 시
  const formData = new FormData();
    formData.append('comment', comment);
    formData.append('type', type);

    // 2. 미디어 파일 추가
    if (type === 'photo') {
      // Base64 이미지를 Blob으로 변환
      const res = await fetch(media);
      const photoBlob = await res.blob();
      formData.append('mediaFile', photoBlob, 'capture.jpg');
    } else {
      // 비디오 Blob (state로 blob을 못 넘겼다면 media(url)을 fetch)
      if (blob) {
         formData.append('mediaFile', blob, 'capture.webm');
      } else {
         const res = await fetch(media);
         const videoBlob = await res.blob();
         formData.append('mediaFile', videoBlob, 'capture.webm');
      }
    }

  try {
      // 2. 이 여행의 미디어 저장 키 
      const mediaStorageKey = `media_${tripId}`;
      
      // 3. 기존에 저장된 미디어 불러오기 (없으면 빈 배열)
      const existingMedia = JSON.parse(localStorage.getItem(mediaStorageKey)) || [];
      
      // 4. 새로 저장할 미디어 객체
      // (Blob은 localStorage에 저장이 안되므로, base64(사진)나 url(영상)인 'media'를 저장)
      const newMedia = {
        id: new Date().getTime(), // 고유 ID
        type: type, // 'photo' or 'video'
        dataUrl: media, // base64 이미지 또는 Blob URL
        comment: comment,
        timestamp: new Date().toISOString()
      };

      // 5. 새 미디어를 기존 배열에 추가해서 다시 저장
      localStorage.setItem(mediaStorageKey, JSON.stringify([...existingMedia, newMedia]));
      
      console.log(`[${tripId}] 미디어 저장 완료. 총 ${existingMedia.length + 1}개`);
      alert('저장되었습니다!');
      
      // 6. 저장이 완료되면 앨범 메인 페이지로 이동
      navigate('/trips'); 
    } catch (error) {
      console.error('localStorage 저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };
return (
    <div className="capture-complete-wrapper">
      
      {/* 1. 헤더 텍스트 수정 */}
      <header className="capture-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
        {/* 👇 "완료된 사진 또는 영상" 텍스트를 지웁니다 */}
        <span className="header-title"></span>
      </header>

      <div className="content-area">
        
        {/* 2. 이미지 위에 텍스트 오버레이 추가 */}
        <div className="preview-wrapper">
          {type === 'photo' ? (
            <img src={media} alt="촬영된 사진" className="blurred-preview" />
          ) : (
            <video src={media} muted className="blurred-preview" />
          )}
          
          {/* 👇 블러 화면 위에 텍스트를 추가합니다 */}
          <div className="blur-overlay-text">
            여행이 끝난 후 확인해보세요!
          </div>
        </div>

        {/* 코멘트 박스 (JSX는 수정 없음) */}
        <div className="comment-box">
          <textarea
            placeholder="코멘트 작성 (선택 사항)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      </div>

      <div className="footer-area">
        <button onClick={handleSave} className="save-button">
          저장하기
        </button>
      </div>
    </div>
  );
};

export default CaptureCompletePage;