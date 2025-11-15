import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StartPage.css';
import tripshot_logo from '../../assets/firstpage.png';

const StartPage = () => {
  const navigate = useNavigate();

  const goNext = () => {
    navigate('/login');
  };

  return (
    <main
      className="startpage"
      onClick={goNext}
      onTouchEnd={goNext}     // 모바일 터치 대응
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goNext()}
    >
      <img
        src={tripshot_logo}
        alt="TripShot Main"
        className="logo"
        draggable="false"
      />
    </main>
  );
};

export default StartPage;
