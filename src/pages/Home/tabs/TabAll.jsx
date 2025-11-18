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


// API 데이터 매핑 함수
const mapApiPost = (p) => ({
  id: p.id,
  author: p.author?.username ?? 'username', 
  author_avatar: p.author?.avatar_url ?? '/assets/default-avatar.png',
  caption: p.caption ?? '',
    
  // ⭐ API 응답의 media 배열에서 URL 추출
  images: p.media ? p.media.map(m => m.thumbnail_url || m.url) : [], 
  
  // 썸네일
  image: p.media?.[0]?.thumbnail_url || p.media?.[0]?.url || null, 
  
  location: p.location ?? '위치 정보 없음',                 
  date: new Date(p.created_at).toLocaleDateString('ko-KR', { 
    year: 'numeric', month: '2-digit', day: '2-digit' 
  }).replace(/\./g, '.').trim(), 
  like_count: p.like_count ?? 0,
  comment_count: p.comment_count ?? 0,
  is_liked: !!p.is_liked,
  is_mine: p.author?.id === 'current_user_id', 
});

const createInitialDummyPosts = () => {
    const now = Date.now();
    writePosts([
      { id: String(now - 1), userName: 'demo', image: '/trip-img/trip1.jpeg', title: '경복궁', content: '서울 한 컷', lat: 37.579617, lng: 126.977041, privacy: 'friends', likes: 0, comments: 0, createdAt: now - 1, is_liked: false, author_avatar: 'https://placehold.co/48x48/CCCCCC/FFF?text=D1' },
      { id: String(now - 2), userName: 'demo', image: '/trip-img/trip2.jpeg', title: '제주', content: '한라산', lat: 33.4996, lng: 126.5312, privacy: 'friends', likes: 10, comments: 3, createdAt: now - 2, is_liked: true, author_avatar: 'https://placehold.co/48x48/CCCCCC/FFF?text=D2' },
      { id: String(now - 3), userName: 'me', image: '/trip-img/trip3.jpeg', title: '비공개', content: '내가 올린 게시물', lat: 37.5665, lng: 126.9780, privacy: 'private', likes: 0, comments: 0, createdAt: now - 3, is_liked: false, author_avatar: 'https://placehold.co/48x48/CCCCCC/FFF?text=ME' }
    ]);
};

const TabAll = ({ activeTrip = null }) => {
  const navigate = useNavigate();
  const { activeTripId, token, user } = useAuth();

  const currentUserName = user?.username || user?.tag || 'me';
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [posts, setPosts] = useState([]);

  
  const canShoot = useMemo(() => !!activeTrip, [activeTrip]);


  // ⭐ 로컬 데이터 매핑 함수 (다중 이미지 지원)
const mapLocalPost = (p) => ({
  id: p.id,
  author: p.userName === 'me' ? currentUserName : p.userName,
  author_avatar: p.author_avatar ?? 'https://placehold.co/48x48/CCCCCC/FFF?text=ME',
  caption: p.content ?? '', 
    
  // ⭐ PostItem의 images prop으로 배열 전달 (PostCreate에서 저장한 images 사용)
  images: p.images || (p.image ? [p.image] : []), 
  
  // ⭐ 썸네일 (PostItem의 image prop): images 배열의 첫 번째 항목 사용 (피드 썸네일)
  image: (p.images && p.images[0]) || p.image || null, 
  
  location: p.location || (p.lat && p.lng ? '위치 정보 있음' : '위치 정보 없음'),                
  date: new Date(p.createdAt).toLocaleDateString('ko-KR', { 
    year: 'numeric', month: '2-digit', day: '2-digit' 
  }).replace(/\./g, '.').trim(),
  like_count: p.likes ?? 0,
  comment_count: p.comments ?? 0,
  is_liked: !!p.is_liked,
  is_mine: p.userName === 'me', 
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
      
      try {
        setLoading(true);
        setErr('');
        
        const url = `${API_BASE}/posts?feed_type=all&limit=20`;
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
            caption: '도쿄에 다녀왔다!! 너무너무 재밌었다 또 가고 싶다.',
            image: randomImage,
            images: [randomImage],
            location: '도쿄',
            date: '2025.11.12',
            like_count: 36, 
            comment_count: 2, 
            is_liked: false,
            is_mine: true, 
          }]);
        }
        setErr(error.message || '게시물 로드 실패');
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [user, token]);

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
      {/*진행 중 여행 카드->activeTrip 있을 때만 */}
      {activeTrip && (
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
      )}

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

