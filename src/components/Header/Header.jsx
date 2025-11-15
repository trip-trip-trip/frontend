import React,{lazy, useEffect, useState} from 'react';
import './Header.css';
import { useLocation, useNavigate } from 'react-router-dom';
import logoTop from '../../assets/logoTop.png';
import go_map from '../../assets/go-map.png';

const Header = ({ title, setTab, currentTab }) => { 
    
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const isHome = pathname === '/home';
    
    return (
        <header className="header">
            <div className="header-inner">
                <div className="header-side" />

                <div className="page-name">
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

                {/* 홈 페이지일 때만 지도 아이콘을 표시합니다. */}
                {isHome && (
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
                {!isHome && <div className="header-side" />} 
            </div>
            {/* 탭 구분선은 Header가 아닌 Home에서 관리하므로 제거할 수 있지만, 현재 코드에서는 유지합니다. */}
            <div className="header-divider" /> 
        </header>
    );
};

export default Header;