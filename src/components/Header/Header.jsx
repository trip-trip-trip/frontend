import React from 'react';
import './Header.css';
import { useLocation, useNavigate } from 'react-router-dom';
import logoTop from '../../assets/logoTop.png';
import go_map from '../../assets/go-map.png';
import lgt from '../../assets/logout_icon.png'; 
import { useAuth } from '../../contexts/AuthContext'; // 

const Header = ({ title, setTab, currentTab }) => { 
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth(); 
    const isHome = pathname === '/home';
    
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

                {/* 2. 중앙 - 로고 (Flex-grow로 중앙 정렬 담당) */}
                <div className="header-center">
                    {isHome ? (
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
            </div>
            {/* 탭 구분선 */}
            <div className="header-divider" /> 
        </header>
    );
};

export default Header;