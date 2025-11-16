import React, { useState } from 'react';
import { useLocation, useNavigate,useParams } from 'react-router-dom';
import './CaptureCompletePage.css'; // CSS 파일 생성
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
  : '/api';

const CaptureCompletePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { token } = useAuth();

  const { media, type, blob } = location.state || {}; // CameraPage에서 넘긴 state
  const [comment, setComment] = useState('');
const [isLoading, setIsLoading] = useState(false);

  if (!media) {
navigate('/trips');
 return null;
 }

  const handleSave = async () => {
    if (!tripId) {
      alert("유효하지 않은 여행입니다. (tripId 없음)");
      return;
    }
if (!token) {
      alert("로그인 토큰이 없습니다.");
      setIsLoading(false);
      return;
    }
  let meta;
  let endpoint;

   if (type === "photo") {
    endpoint = `${API_BASE}/media/upload`;
    meta = {
      tripId: Number(tripId),
      mediaKind: "PHOTO",
      captureType: "NORMAL",
      comment: comment || "",
    };
  } else {
    // VIDEO
    endpoint = `${API_BASE}/media/upload/reelItem`;
    meta = {
      
      media: {
        tripId: Number(tripId),
        mediaKind: "VIDEO",
        captureType: "VIDEO",
        comment: comment || null,
      },
      tripId: Number(tripId)
    };
  }
  const formData = new FormData();
  formData.append(
    "meta",
    new Blob([JSON.stringify(meta)], { type: "application/json" })
  );
   function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}


  if (type === "photo") {
const photoBlob = dataURLtoBlob(media);
formData.append("file", photoBlob, "photo.jpg");

  } else {
    const videoBlob = blob
      ? blob
      : await (await fetch(media)).blob();

    formData.append("file", videoBlob, "video.webm");
  }
   try {
    //  업로드 요청 (사진/영상 구분)
   const response = await fetch(endpoint, {
 method: "POST",
   headers: {
          // 'Content-Type'은 FormData가 자동으로 설정함
   Authorization: `Bearer ${token}`,
   },
   body: formData,
    });

    const data = await response.json();
    console.log("업로드 완료:", data);

    if (!data.isSuccess) {
      throw new Error(data.message);
    }

    alert("저장되었습니다!");

    navigate("/trips");
     } catch (err) {
    console.error("업로드 실패:", err);
    alert("업로드에 실패했습니다.");
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