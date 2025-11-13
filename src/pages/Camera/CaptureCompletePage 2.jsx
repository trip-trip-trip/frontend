// src/pages/Camera/CaptureCompletePage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CaptureCompletePage.css'; // CSS 파일 생성

const CaptureCompletePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { media, type, blob } = location.state || {}; // CameraPage에서 넘긴 state
  const [comment, setComment] = useState('');

  if (!media) {
    // 잘못된 접근 처리
    navigate('/camera');
    return null;
  }

  // 저장하기 버튼 클릭 시
  const handleSave = async () => {
    // 1. FormData 생성
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

    // 3. 백엔드로 FormData 전송 (axios 예시)
    try {
      // const response = await axios.post('/api/travel/media', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //     // 로그인 토큰 등도 헤더에 추가
      //   },
      // });
      console.log('서버로 전송할 데이터:', formData);
      alert('저장되었습니다! (여행이 끝나면 확인하세요)');
      
      // 저장이 완료되면 메인 페이지 등으로 이동
      navigate('/'); // 혹은 여행 메인 페이지
    } catch (error) {
      console.error('업로드 실패:', error);
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