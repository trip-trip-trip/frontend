import React from 'react';
import './AddToHomeScreenPrompt.css';

const AddToHomeScreenPrompt = () => {

  // 1. iOS Safari인지 확인 (iPad, iPhone, iPod)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // 2. 이미 홈 화면 앱(Standalone)으로 실행 중인지 확인
  const isStandalone = ('standalone' in window.navigator) && (window.navigator.standalone);

  // 3. iOS이고, Safari 브라우저이며, 아직 설치되지 않았을 때만 렌더링
  if (!isIOS || isStandalone) {
    return null;
  }

  return (
    <div className="a2hs-prompt">
      <div className="a2hs-content">
        <p>
          앱을 홈 화면에 추가하여<br />
          푸시 알림 등 모든 기능을 이용하세요!
        </p>
       
       <p className="a2hs-instructions">
          하단의 <span className="ios-share-icon">⬆️</span> 버튼을 누른 뒤<br />
          [홈 화면에 추가]를 선택하세요.
        </p>
      </div>
    </div>
  );
};

export default AddToHomeScreenPrompt;