import React, {useState, lazy, Suspense, useEffect} from 'react'
import './Home.css'
import Navbar from '../../components/NavBar/NavBar'
import Header from '../../components/Header/Header'

//탭별 콘텐츠는 필요할 때만 로드
const TabAll=lazy(()=>import('./tabs/TabAll')); //전체
const TabPlace=lazy(()=>import('./tabs/TabPlace')); //장소

const Home = () => {
  const getInitialTab=()=>{
    const p=new URLSearchParams(window.location.search).get('tab');
    return p==='place'?'place':'all';
  };

  const [tab, setTab]=useState(getInitialTab);

  useEffect(()=>{
    const url=new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url);
  }, [tab]);

  return (
    <div className='home'>
        {/* <Header title={'home'}/> */}
        <header className='home-header'>
           <Header/>
           <div className='tabs'>
            <button 
            className={`tab ${tab==='all'? 'active':""}`}
            onClick={()=>setTab('all')}
            aria-selected={tab==='all'}
            role="tab" > 전체 </button>

            <button 
            className={`tab ${tab==='place'? 'active':""}`}
            onClick={()=>setTab('place')}
            aria-selected={tab==='place'}
            role="tab" > 장소 </button>
           </div>
        </header>
        <main className="home-body" role="tabpanel">
        <Suspense fallback={<div className="skeleton">불러오는 중…</div>}>
          {tab === 'all' ? <TabAll /> : <TabPlace />}
        </Suspense>
        </main>
        <Navbar/>
    </div>
  );
};

export default Home;