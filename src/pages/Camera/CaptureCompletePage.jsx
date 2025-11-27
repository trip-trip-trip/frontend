import React, { useState ,useRef} from 'react';
import { useLocation, useNavigate,useParams } from 'react-router-dom';
import './CaptureCompletePage.css'; // CSS 파일 생성
import { useAuth } from '../../contexts/AuthContext';

import backIcon from '../../assets/back.png';
import filmCamCap from '../../assets/filmcamcap.png'; // 중앙 필름모양 오버레이
import commentBoxBg from '../../assets/commentbox.png'; // 코멘트 박스 배경
import saveCamBtn from '../../assets/savecam.png'; 

const API_BASE = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
  : '/api';


  
const CaptureCompletePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
 const { tripId: tripIdParam } = useParams();
 const { token, activeTripId } = useAuth();
  const { media, type, blob } = location.state || {}; // CameraPage에서 넘긴 state
  const [comment, setComment] = useState('');
const [isLoading, setIsLoading] = useState(false);
  const isSavingRef=useRef(false);

  if (!media) {
navigate('/trips');
 return null;
 }
 //console.log("Current tripId:", tripId, "Converted:", Number(tripId));

  const effectiveTripId = tripIdParam
   ? Number(tripIdParam)
   : (typeof activeTripId === "number" ? activeTripId : Number(activeTripId));

 console.log("Current tripIdParam:", tripIdParam,
             "activeTripId:", activeTripId,

             "effectiveTripId:", effectiveTripId);
  const handleSave = async () => {

    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsLoading(true);
    
    if (!effectiveTripId || Number.isNaN(effectiveTripId)) {
      if (isLoading) return;
    setIsLoading(true);
     alert("유효하지 않은 여행입니다. (tripId 없음 / 숫자 아님)");
      isSavingRef.current = false;
    console.error("잘못된 tripId:", { tripIdParam, activeTripId, effectiveTripId });
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
      tripId: effectiveTripId,
      mediaKind: "MEDIA",
      captureType: "NORMAL",
      comment: comment || " ",
    };
  } else {
    // VIDEO
    endpoint = `${API_BASE}/media/upload/reelItem`;
    meta = {
      
     media: {
        tripId: effectiveTripId,
        mediaKind: "MEDIA",
        captureType: "VIDEO",
        comment: comment || " ",
     },
     tripId: effectiveTripId,
    };
  }
  const formData = new FormData();
  
  let finalFileBlob;

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
formData.append("file", photoBlob);
 finalFileBlob=photoBlob;
  } else {
    const videoBlob = blob
      ? blob
      : await (await fetch(media)).blob();

    formData.append("file", videoBlob);
     finalFileBlob=videoBlob;
  }
  formData.append(
     "meta",
     new Blob([JSON.stringify(meta)], { type: "application/json" })
    );
    console.log("--- [업로드 요청 직전 데이터] ---");
    console.log("Endpoint:", endpoint);
    console.log("Token:", token ? `Bearer ${token.substring(0, 15)}...` : "TOKEN 없음!");
    console.log("Meta (JSON):", JSON.stringify(meta, null, 2));
    console.log("File (Blob):", finalFileBlob);
    console.log("-------------------------------");
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
     isSavingRef.current = false;
    alert("업로드에 실패했습니다.");
  }
};
  return (
    <div className="capture-complete-wrapper">
      
      {/* 1. 상단 헤더 (베이지색) */}
      <header className="capture-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <img src={backIcon} alt="Back" />
        </button>
      </header>

      {/* 2. 서브 헤더 (검은색 바 - 다시 찍기) */}
      <div className="sub-header-bar">
        <span className="retake-text" onClick={() => navigate(-1)}>
          다시 찍기
        </span>
      </div>

      <div className="content-scroll-area">
        {/* 3. 프리뷰 영역 (이미지/영상 블러 + 오버레이) */}
        <div className="preview-container">
          {/* 블러 처리된 배경 미디어 */}
          {type === 'photo' ? (
            <img src={media} alt="Preview" className="blurred-media" />
          ) : (
            <video src={media} muted className="blurred-media" />
          )}

          {/* 오버레이 (필름 아이콘 + 텍스트) */}
          <div className="preview-overlay-content">
             <img src={filmCamCap} alt="Complete" className="film-overlay-icon" />
             <p className="overlay-text-main">촬영 완료!</p>
             <p className="overlay-text-sub">여행이 끝난 후에 확인해보세요!</p>
          </div>
        </div>

        {/* 4. 코멘트 섹션 (검은 배경) */}
        <div className="comment-section">
          <label className="comment-label">코멘트</label>
          
          {/* 코멘트 박스 이미지 배경 */}
          <div 
            className="comment-input-wrapper"
            style={{ backgroundImage: `url(${commentBoxBg})` }}
          >
            <textarea
              placeholder="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="transparent-textarea"
            />
          </div>
        </div>
      </div>

      {/* 5. 하단 저장 버튼 영역 */}
      <div className="footer-area">
        <button className="img-save-button" onClick={handleSave} disabled={isLoading}>
          <img src={saveCamBtn} alt="저장하기" />
        </button>
      </div>
    </div>
  );
};
export default CaptureCompletePage;
