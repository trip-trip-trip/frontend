import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostItem from '../post/PostItem'; 
import './TabAll.css';
import { useAuth } from '../../../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

// PostCreate에서 사용하는 LS_KEY
const LS_KEY = 'tripshot_posts'; 

const readLocalPosts = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
};

const writePosts = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));


const createInitialDummyPosts = () => {
    const now = Date.now();
    writePosts([
      { id: String(now - 1), userName: 'jiwoo', image: '/trip-img/trip1.jpeg', title: '서울 여행', content: '서울 한 컷', lat: 37.579617, lng: 126.977041, privacy: 'friends', likes: 0, comments: 0, createdAt: now - 1, is_liked: false, author_avatar: 'https://placehold.co/48x48/CCCCCC/FFF?text=D1' },
      { id: String(now - 2), userName: 'jimin', image: '/trip-img/trip2.jpeg', title: '제주', content: '한라산', lat: 33.4996, lng: 126.5312, privacy: 'friends', likes: 10, comments: 0, createdAt: now - 2, is_liked: true, author_avatar: 'https://placehold.co/48x48/CCCCCC/FFF?text=D2' },
      { id: String(now - 3), userName: 'me', image: '/trip-img/trip3.jpeg', title: '비공개', content: '내가 올린 게시물', lat: 37.5665, lng: 126.9780, privacy: 'private', likes: 0, comments: 0, createdAt: now - 3, is_liked: false, author_avatar: 'https://placehold.co/48x48/CCCCCC/FFF?text=ME' }
    ]);
};
////
const TabAll = ({ activeTrip = null , onPostsLoaded=()=>{} }) => {
  const navigate = useNavigate();
  const { activeTripId, token, user } = useAuth(); // user 정보 가져옴
  const [posts, setPosts] = useState([]);
  const currentUserName = user?.username || user?.tag || 'me';
  const currentUserId = user?.id; // ★ 현재 로그인한 사용자 ID
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
   
  useEffect(() => {
    if (onPostsLoaded) {
      onPostsLoaded(posts);
    }
  }, [posts, onPostsLoaded]);
  
  const canShoot = useMemo(() => !!activeTrip, [activeTrip]);

const mapApiPost = (p) => ({
  id: p.id,
  author: p.author?.username ?? '알 수 없음', 
  author_avatar: p.author?.avatar_url ?? '/assets/default-avatar.png',
  caption: p.caption ?? '',
  
  images: p.media ? p.media.map(m => m.thumbnail_url || m.url) : [], 
  
  // 썸네일
  image: p.media?.[0]?.thumbnail_url || p.media?.[0]?.url || null, 
  location: p.location ?? '', 
  // 날짜 처리 안전장치 추가
  date: p.created_at ? new Date(p.created_at).toLocaleDateString('ko-KR', { 
  year: 'numeric', month: '2-digit', day: '2-digit' 
  }).replace(/\./g, '.').trim() : '날짜 없음', 
  like_count: p.like_count ?? 0,
  comment_count: p.comment_count ?? 0,
  is_liked: !!p.is_liked,
  // 실제 로그인한 유저 ID와 작성자 ID 비교
  is_mine: p.author?.id === currentUserId, 
  lat: p.lat ?? null,
  lng: p.lng ?? null,
});


const mapLocalPost = (p) => ({
  id: p.id,
  author: p.userName === 'me' ? currentUserName : p.userName,
  author_avatar: p.author_avatar ?? 'https://placehold.co/48x48/CCCCCC/FFF?text=ME',
  caption: p.content ?? '', 
    
  images: p.images || (p.image ? [p.image] : []), 
  
  image: (p.images && p.images[0]) || p.image || null, 
  
  location: p.location || (p.lat && p.lng ? '위치 정보 있음' : '위치 정보 없음'),                
  date: new Date(p.createdAt).toLocaleDateString('ko-KR', { 
    year: 'numeric', month: '2-digit', day: '2-digit' 
  }).replace(/\./g, '.').trim(),
  like_count: p.likes ?? 0,
  comment_count: p.comments ?? 0,
  is_liked: !!p.is_liked,
  is_mine: p.userName === 'me', 
  lat: p.lat ?? null,
  lng: p.lng ?? null,
});


  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      let rawLocalPosts = readLocalPosts();
      
      if (rawLocalPosts.length === 0) {
          createInitialDummyPosts();
          rawLocalPosts = readLocalPosts(); 
      }
      
      let localPosts = rawLocalPosts.map(mapLocalPost);
      
      if (localPosts.length > 0) {
          setPosts(localPosts);
      }

      if (!API_BASE) {
          console.warn('API_BASE가 설정되지 않아 API 호출을 건너뛰고 로컬 데이터만 사용합니다.');
          setLoading(false);
          return;
      }
      
      try {
        setLoading(true);
        setErr('');
        
        const url = `${API_BASE}/posts?feed_type=all&limit=200`;
        const res = await fetch(url, { 
          signal: ac.signal, credentials: 'include',
           headers: {
              //JWT 토큰이 있으면 헤더에 포함
              'Authorization': `Bearer ${token || ''}`,
          }
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (!data?.isSuccess || !Array.isArray(data?.result?.posts)) {
          throw new Error(data?.message || 'Invalid payload');
        }
        
        const apiPosts = data.result.posts.map(mapApiPost);
        
        const combinedPosts = [
            ...localPosts.filter(lp => !apiPosts.some(ap => ap.id === lp.id)), 
            ...apiPosts
        ];
        
        setPosts(combinedPosts);

      } catch (error) {
        console.error('API 로드 실패. 로컬 저장소 사용:', error.message);
        
        const dummyImages = Array.from({ length: 10 }, (_, i) => `/trip-img/trip${i + 1}.jpeg`);
        const randomImage = dummyImages[Math.floor(Math.random() * dummyImages.length)];

        //API 실패 시: 로컬 데이터가 없을 경우에만 더미 데이터 로드
        if (localPosts.length === 0) {
          setPosts([{
            id: 'demo-1',
            author: '여행에미친사람', 
            author_avatar: 'https://placehold.co/48x48/CCCCCC/FFF?text=A',
            caption: '도쿄에 다녀왔다!! 너무너무 재밌었다 또 가고 싶네',
            image: randomImage,
            images: [randomImage],
            location: '도쿄',
            date: '2025.11.12',
            like_count: 36, 
            comment_count: 2, 
            is_liked: false,
            is_mine: true, 
            lat: 35.6895, //tokyo location
            lng: 139.6917,
          }]);
        }
        setErr(error.message || '게시물 로드 실패');
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [token, user]);

  const goShoot = () => {
    if (!canShoot) 
      return;
if (activeTripId) {
        navigate(`/camera/${activeTripId}`); 
    } else {
      alert("활성 여행 ID를 찾을 수 없습니다.");
    }
  };

  return (
    <section className="taball">
      {/* {activeTrip && (
        <div className="live-card">
          <div className="live-head">
            <div>
              <h3 className="live-title">{activeTrip.title}</h3>
              <p className="live-sub">진행중 · {activeTrip.members}명 참여</p>
            </div>
            <span className="live-badge">LIVE</span>
          </div>

          <button
            className={`live-cta ${!canShoot ? 'disabled' : ''}`}
            onClick={goShoot}
            aria-label="지금 촬영하러 가기"
            disabled={!canShoot}
            title={canShoot ? '' : '여행 진행 중일 때만 촬영 가능합니다'}
          >
            <span className="rec-dot" />
            지금 촬영하러 가기
          </button>
        </div>
      )} */}

      <div className="feed-list">
        {loading && <div className="feed-skeleton">불러오는 중…</div>}
        {/* {err && <div className="feed-error">{err}</div>} */}

        {!loading && posts.map((p) => (
         <PostItem 
           key={p.id} 
           post={p}       
           isMine={p.is_mine} 
           />
        ))}
      </div>
    </section>
  );
};

export default TabAll;