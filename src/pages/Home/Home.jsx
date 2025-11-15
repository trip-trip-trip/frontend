import React, {useState, lazy, Suspense, useEffect} from 'react'
import './Home.css'
import Navbar from '../../components/NavBar/NavBar'
import Header from '../../components/Header/Header' 

// 탭별 콘텐츠는 필요할 때만 로드
const TabAll = lazy(() => import('./tabs/TabAll')); 	// 전체
const TabPlace = lazy(() => import('./tabs/TabPlace')); // 장소

const Home = () => {
    // URL 쿼리 파라미터에서 초기 탭 상태를 가져오는 함수
    const getInitialTab = () => {
        const p = new URLSearchParams(window.location.search).get('tab');
        return p === 'place' ? 'place' : 'all';
    };

    const [tab, setTab] = useState(getInitialTab);
    const [activeTrip, setActiveTrip] = useState(null); 	

    // 여행 진행 중 여부 설정 (더미 데이터)
    useEffect(() => {
        const ongoingTrip = true; // false면 LIVE 카드 안 보임
        if (ongoingTrip) {
            setActiveTrip({ title: '제주도 여행', members: 3 });
        } else {
            setActiveTrip(null);
        }
    }, []);

    // 탭 상태가 변경될 때 URL 쿼리 파라미터에 반영
    useEffect(() => {
        const url = new URL(window.location);
        url.searchParams.set('tab', tab);
        window.history.replaceState({}, '', url);
    }, [tab]);

    return (
        <div className="home">
            {/* tab이 'place'가 아닐 때만 Header (로고 + 지도 아이콘)를 렌더링합니다. */}
            {tab !== 'place' && <Header setTab={setTab} currentTab={tab} />} 

            {/* 🛑 TABS BAR 영역을 Home.jsx에서 완전히 제거합니다. */}

            <main className="home-body" role="tabpanel">
                <Suspense fallback={<div className="skeleton">불러오는 중…</div>}>
                    {tab === 'all' ? (
                        // 🎯 TabAll에게 탭 상태 변경 함수를 전달 (TabAll 내부에서 탭 바를 렌더링)
                        <TabAll activeTrip={activeTrip} setTab={setTab} /> 	
                    ) : (
                        // TabPlace는 이미 탭 변경 함수를 가지고 있음
                        <TabPlace activeTrip={activeTrip} setTab={setTab} /> 
                    )}
                </Suspense>
            </main>

            <Navbar />
        </div>
    );
};

export default Home;
