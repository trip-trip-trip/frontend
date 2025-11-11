import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StartPage.css';
import tripshot_logo from '../../assets/tripshot_logo.png'


const StartPage = () => {
  const navigate = useNavigate();
  return (
    <main className="startpage">
      <img src={tripshot_logo} alt="tripshot-logo" className="logo" />
      <div className='sp-content'>
      <h1 className="sp-title">여행의 순간을 기록해보세요</h1>

      <p className="sp-sub">
        소중한 여행 추억을 사진과 글로 남기고,<br/>
        시간과 장소별로 추억을 되돌아보세요
      </p>
      </div>
      <button
        type="button"
        className="sp-cta"
        onClick={() => navigate('/login')}
        aria-label="시작하기"
      >
        시작하기
      </button>
    </main>
  );
};

export default StartPage;
