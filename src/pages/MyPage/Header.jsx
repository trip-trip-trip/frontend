import React from 'react';
import './Header.css';
import { useLocation, useNavigate } from 'react-router-dom';
import logoTop from '../../assets/logoTop.png';
// 👇 1. [수정] 지도 아이콘 대신 설정 아이콘 임포트 (파일명 확인 필요!)
import settingIcon from '../../assets/setting.png'; 
import lgt from '../../assets/logout_icon.png'; 
import { useAuth } from '../../contexts/AuthContext'; 


const Header = ({ title, setTab, currentTab, toBack }) => { 
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth(); 
    
    // 홈('/'), 홈('/home'), 앨범('/trips') 에서만 헤더 구성을 다르게 함
    const isHome = pathname === '/' || pathname === '/home';
    const isAlbum = pathname === '/trips';
    
    const handleLogout = () => {
        logout(); 
        navigate('/login', { replace: true }); 
    };

    return (
        <header className="header">
            <div className="header-inner">
                
                {/* 1. 왼쪽 - 로그아웃 버튼 */}
                <div className="header-left"> 
                    {isHome && (
                        <button 
                            className="header-icon-btn" 
                            onClick={handleLogout}
                            aria-label="로그아웃"
                        >
                            <img src={lgt} alt="로그아웃" className="header-icon" />
                        </button>
                    )}
                   
                </div>

                {/* 2. 중앙 - 로고 또는 페이지 제목 */}
                <div className="header-center">
                    {(isHome || isAlbum) ? (
                        <img
                            src={logoTop}
                            alt="TripShot"
                            className="header-logo"
                            onClick={() => navigate('/home')}
                            style={{ cursor: 'pointer' }}
                        />
                    ) : (
                        <span className="page-title">{title}</span>
                    )}
                </div>
                
                {/* 3. 오른쪽 - 설정 아이콘 (기존 지도 아이콘 대체) */}
                <div className="header-right">
                    {(isHome || isAlbum) && (
                        <button
                            className="header-icon-btn"
                            // 👇 [수정] 지도 탭(place)으로 이동하는 대신 설정 페이지로 이동
                            onClick={() => navigate('/mypage/settings')} 
                            aria-label="설정"
                        >
                            {/* 👇 [수정] 설정 아이콘으로 변경 */}
                            <img 
                                src={settingIcon} 
                                alt="설정" 
                                className="header-icon" 
                            />
                        </button>
                    )}
                    
                    {/* 홈이나 앨범이 아니고, toBack도 없을 때 빈 공간 유지용 */}
                    {!isHome && !isAlbum && !toBack && <div className="header-side" />} 
                </div>
            </div>
            
            {/* 탭 구분선 (필요 시 유지) */}
            <div className="header-divider" /> 
        </header>
    );
};

export default Header;