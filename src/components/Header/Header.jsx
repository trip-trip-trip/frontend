import React from 'react';
import './Header.css';
import { useLocation, useNavigate } from 'react-router-dom';
import logoTop from '../../assets/logoTop.png';
import go_map from '../../assets/go-map.png';
<<<<<<< HEAD
import lgt from '../../assets/logout_icon.png'; 
import { useAuth } from '../../contexts/AuthContext'; // 

const Header = ({ title, setTab, currentTab }) => { 
=======
import back_btn from '/icons/back_btn.png'

const Header = ({ title, setTab, currentTab, toBack }) => { 
    
>>>>>>> 23b6eff (디자인 수정 #1)
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth(); 
    const isHome = pathname === '/home';
    const isAlbum = pathname ==='/trips';
    
    const handleLogout = () => {
        logout(); // Context의 로그아웃 함수 실행
        navigate('/login', { replace: true }); // 로그인 페이지로 이동
    };

 return (
        <header className="header">
            <div className="header-inner">
                
                {/* 1. 왼쪽 - 로그아웃 버튼 (별도의 flex-basis를 가짐) */}
                <div className="header-left"> 
                    {isHome && (
                        <button 
                            className="header-icon-btn" // CSS에서 이미지 크기를 제어할 클래스 사용
                            onClick={handleLogout}
                            aria-label="로그아웃"
                        >
                            <img src={lgt} alt="로그아웃" className="header-icon" />
                        </button>
                    )}
                </div>

<<<<<<< HEAD
                {/* 2. 중앙 - 로고 (Flex-grow로 중앙 정렬 담당) */}
                <div className="header-center">
                    {isHome ? (
=======
                <div className="page-name">
                    {(isHome || isAlbum) ? (
>>>>>>> 23b6eff (디자인 수정 #1)
                        <img
                            src={logoTop}
                            alt="TripShot"
                            className="header-logo"
                            onClick={() => navigate('/home')}
                        />
                    ) : (
                        <span className="page-title">{title}</span>
                    )}
                </div>

<<<<<<< HEAD
                {/* 3. 오른쪽 - 지도 아이콘 (대칭되는 flex-basis를 가짐) */}
                <div className="header-right">
                    {isHome && (
                        <button
                            className="header-icon-btn" // CSS에서 이미지 크기를 제어할 클래스 사용
                            onClick={() => setTab('place')} 
                            aria-label="지도 가기"
                        >
                            <img 
                                src={go_map}
                                alt="지도 아이콘"
                                className="header-icon" // 아이콘 클래스 추가
                            />
                        </button>
                    )}
                </div>
=======
                {/* 홈 페이지일 때만 지도 아이콘을 표시합니다. */}
                {(isHome || isAlbum) && (
                    <button
                        className="header-add-btn"
                        // 클릭 시 Home 컴포넌트의 setTab 함수를 사용하여 'place' 탭으로 변경
                        onClick={() => setTab('place')} 
                        aria-label="지도 가기"
                    >
                        <img 
                            src={go_map}
                            alt="지도 아이콘"
                        />
                    </button>
                )}
                {/* 홈 페이지가 아닐 때는 오른쪽 공간을 비워둡니다. */}
                {!isHome && !isAlbum && <div className="header-side" />} 
                {toBack && 
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <img src={back_btn} alt=""/>
                    </button>}
>>>>>>> 23b6eff (디자인 수정 #1)
            </div>
            {/* 탭 구분선 */}
            <div className="header-divider" /> 
        </header>
    );
};

export default Header;