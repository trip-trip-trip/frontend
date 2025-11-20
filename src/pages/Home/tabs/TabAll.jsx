import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostItem from '../post/PostItem'; 
import './TabAll.css';
import { useAuth } from '../../../contexts/AuthContext';

// API_BASE 환경 변수 안전하게 가져오기
const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE_URL) 
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') 
  : '';

// PostCreate에서 업로드 실패 시 저장하는 로컬 스토리지 키
const LS_KEY = 'tripshot_posts'; 

const readLocalPosts = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
};

const TabAll = ({ activeTrip = null , onPostsLoaded=()=>{} }) => {
  const navigate = useNavigate();
  const { activeTripId, token, user } = useAuth(); 
  const [posts, setPosts] = useState([]);
  const currentUserName = user?.username || user?.tag || 'me';
  const currentUserId = user?.id; 
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
   
  useEffect(() => {
    if (onPostsLoaded) {
      onPostsLoaded(posts);
    }
  }, [posts, onPostsLoaded]);
  
  const canShoot = useMemo(() => !!activeTrip, [activeTrip]);

  // API 응답 데이터를 앱 내 포스트 구조로 변환
  const mapApiPost = (p) => ({
    id: p.id,
    author: p.author?.username ?? '알 수 없음', 
    author_avatar: p.author?.avatar_url ?? '/assets/default-avatar.png',
    caption: p.caption ?? '',
    
    images: p.media ? p.media.map(m => m.thumbnail_url || m.url) : [], 
    
    // 썸네일 (첫 번째 미디어)
    image: p.media?.[0]?.thumbnail_url || p.media?.[0]?.url || null, 
    
    location: p.location ?? '', // API에 없으면 빈 문자열
    
    date: p.created_at ? new Date(p.created_at).toLocaleDateString('ko-KR', { 
      year: 'numeric', month: '2-digit', day: '2-digit' 
    }).replace(/\./g, '.').trim() : '날짜 없음', 
    
    like_count: p.like_count ?? 0,
    comment_count: p.comment_count ?? 0,
    is_liked: !!p.is_liked,
    
    is_mine: p.author?.id === currentUserId, 
    lat: p.lat ?? null,
    lng: p.lng ?? null,
  });

  // 로컬 스토리지 데이터(업로드 실패분) 매핑
  const mapLocalPost = (p) => ({
    id: p.id,
    author: p.userName === 'me' ? currentUserName : p.userName,
    author_avatar: p.author_avatar ?? 'https://placehold.co/48x48/CCCCCC/FFF?text=ME',
    caption: p.content ?? '', 
      
    images: p.images || (p.image ? [p.image] : []), 
    image: (p.images && p.images[0]) || p.image || null, 
    
    location: p.location || (p.lat && p.lng ? '위치 정보 있음' : '위치 정보 없음'),                
    date: new Date(p.createdAt || Date.now()).toLocaleDateString('ko-KR', { 
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
      // 로컬에 임시 저장된 포스트(업로드 실패 등) 먼저 불러오기
      let rawLocalPosts = readLocalPosts();
      let localPosts = rawLocalPosts.map(mapLocalPost);
      
      // 일단 로컬 데이터가 있으면 먼저 보여줌 (빠른 렌더링)
      if (localPosts.length > 0) {
          setPosts(localPosts);
      }

      if (!API_BASE) {
          setLoading(false);
          return;
      }
      
      try {
        setLoading(true);
        setErr('');
        
        // 2서버에서 최신 게시물 가져오기
        const url = `${API_BASE}/posts?feed_type=all&limit=200`;
        const res = await fetch(url, { 
          signal: ac.signal, 
          headers: {
             'Authorization': `Bearer ${token || ''}`,
          }
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (!data?.isSuccess || !Array.isArray(data?.result?.posts)) {
          throw new Error(data?.message || 'Invalid payload');
        }
        
        const apiPosts = data.result.posts.map(mapApiPost);
        
        //로컬 데이터와 서버 데이터 병합 (중복 제거: 서버에 이미 올라간 ID는 로컬에서 제외)
        const combinedPosts = [
            ...localPosts.filter(lp => !apiPosts.some(ap => ap.id === lp.id)), 
            ...apiPosts
        ];
        
        setPosts(combinedPosts);

      } catch (error) {
        console.error('게시물 로드 실패:', error.message);
        setErr(error.message || '게시물 로드 실패');
        // 에러 나도 로컬 데이터가 있으면 그것만이라도 보여줌
        if (posts.length === 0 && localPosts.length > 0) {
            setPosts(localPosts);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [token, user]);

  const goShoot = () => {
    if (!canShoot) return;
    if (activeTripId) {
        navigate(`/camera/${activeTripId}`); 
    } else {
      alert("활성 여행 ID를 찾을 수 없습니다.");
    }
  };

  return (
    <section className="taball">
      <div className="feed-list">
        {loading && <div className="feed-skeleton">불러오는 중…</div>}
        
        {!loading && posts.length === 0 && (
            <div className="no-posts">게시물이 없습니다. 첫 게시물을 올려보세요!</div>
        )}

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