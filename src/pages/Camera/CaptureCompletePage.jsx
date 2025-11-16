import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './CaptureCompletePage.css';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org')
  : '/api';

const CaptureCompletePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tripId } = useParams();

  const { token } = useAuth(); // AuthContext에서 token 가져오기
  const { media, type, blob } = location.state || {};
  const [comment, setComment] = useState('');

  if (!media) {
    navigate('/trips');
    return null;
  }

  // 🔥 dataURL → Blob 변환
  const dataURLtoBlob = (dataURL) => {
    const [header, data] = dataURL.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
  };

  const handleSave = async () => {
    if (!tripId) {
      alert("유효하지 않은 여행입니다. (tripId 없음)");
      return;
    }

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    console.log("[업로드 시작] tripId =", tripId);

    // -------------------------------
    // 📌 meta 구조 BE 스펙에 정확히 맞춤
    // -------------------------------
    let meta = {};
    let endpoint = "";

    if (type === "photo") {
      endpoint = `${API_BASE}/media/upload`;
      meta = {
        tripId: Number(tripId),
        mediaKind: "PHOTO",
        captureType: "NORMAL",
        comment: comment || "",
      };
    } 
    else if (type === "video") {
      endpoint = `${API_BASE}/media/upload/reelItem`;
      meta = {
        media:{
        tripId: Number(tripId),
        mediaKind: "VIDEO",
        captureType: "VIDEO",
        comment: comment || "",
      },
      tripId:Number(tripId),
    };
    }

    // -------------------------------
    // 📌 FormData 구성
    // -------------------------------
    const formData = new FormData();
    formData.append(
      "meta",
      new Blob([JSON.stringify(meta)], { type: "application/json" })
    );

    // 사진 업로드
    if (type === "photo") {
      const photoBlob = dataURLtoBlob(media);
      formData.append("file", photoBlob, "photo.jpg");
    }

    // 영상 업로드
    else {
      const videoBlob = blob ? blob : await (await fetch(media)).blob();
      formData.append("file", videoBlob, "video.webm");
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log("업로드 응답:", data);

      if (!data.isSuccess) {
        throw new Error(data.message || "업로드 실패");
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