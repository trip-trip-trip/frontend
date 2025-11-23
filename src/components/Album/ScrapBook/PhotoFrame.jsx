import React, { useRef } from 'react';
// import './PhotoFrame.css'; // 필요하다면 이 컴포넌트만의 스타일 파일을 생성하세요.

const PhotoFrame = ({ frameId, imageUrl, onImageSelect, children, frameStyle }) => {
  // 1. 숨겨진 파일 입력을 참조하기 위한 ref
  const fileInputRef = useRef(null);

  // 2. 프레임 클릭 시 파일 입력 클릭을 트리거
  const handleClick = () => {
    fileInputRef.current.click();
  };

  // 3. 파일이 선택되었을 때 호출되는 함수
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // FileReader를 사용하여 이미지를 URL로 변환
      const reader = new FileReader();
      reader.onloadend = () => {
        // 부모 컴포넌트(ScrapbookCreate)로 프레임 ID와 새 이미지 URL 전달
        onImageSelect(frameId, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    // frameStyle prop을 사용하여 위치, 크기, 회전 등을 적용
    <div className="photo-frame" style={frameStyle} onClick={handleClick}>
      
      {/* 실제 파일 선택 창 (숨겨짐) */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />

      {imageUrl ? (
        // 이미지가 있으면 표시
        <img 
          src={imageUrl} 
          alt={`Scrapbook photo ${frameId}`}
          crossOrigin="anonymous"   // ★ 추가 
          className="scrap-img"
          // 사진이 프레임에 맞게 보이도록 인라인 스타일 적용
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      ) : (
        // 이미지가 없으면 기본 플레이스홀더 표시
        <div className="placeholder">
          {children}
          <p>사진을 교체하려면 클릭</p>
        </div>
      )}
    </div>
  );
};

export default PhotoFrame;