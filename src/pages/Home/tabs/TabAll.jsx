// import React, { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import PostItem from '../post/PostItem'; 
// import './TabAll.css';
// import { useAuth } from '../../../contexts/AuthContext';

// const API_BASE = import.meta.env.PROD 
//     ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
//     : '/api';

// const LS_KEY = 'tripshot_posts'; 

// const readLocalPosts = () => {
//   try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
//   catch { return []; }
// };

// const TabAll = ({ activeTrip = null , onPostsLoaded=()=>{} }) => {
//   const { token, user } = useAuth();
//   const [posts, setPosts] = useState([]);
//   const currentUserName = user?.username || user?.tag || 'me';
//   const currentUserId = user?.id;
//   const [loading, setLoading] = useState(true);
   
//   useEffect(() => {
//     if (onPostsLoaded) onPostsLoaded(posts);
//   }, [posts, onPostsLoaded]);
  

//   // 날짜 처리 → created_at / createdAt 둘 다 지원
//   const extractCreatedDate = (p) => {
//     const t = p.created_at || p.createdAt;
//     if (!t) return '날짜 없음';
//     return new Date(t).toLocaleDateString('ko-KR', {
//       year: 'numeric', month: '2-digit', day: '2-digit'
//     }).replace(/\./g, '.').trim();
//   };

//   // API post → 앱용 구조
//   const mapApiPost = (p) => ({
//     id: p.id,
//     author: p.author?.username ?? '알 수 없음',
//     author_avatar: p.author?.avatar_url ?? '/assets/default-avatar.png',
//     caption: p.caption ?? '',
//     images: p.media ? p.media.map(m => m.thumbnail_url || m.url) : [], 
//     image: p.media?.[0]?.thumbnail_url || p.media?.[0]?.url || null,
//     location: p.location ?? '',
//     date: extractCreatedDate(p),
//     like_count: p.like_count ?? 0,
//     comment_count: p.comment_count ?? 0,
//     is_liked: !!p.is_liked,
//     is_mine: p.author?.id === currentUserId,
//     lat: p.lat ?? null,
//     lng: p.lng ?? null,
//   });

//   useEffect(() => {
//     const ac = new AbortController();

//     (async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`${API_BASE}/posts?feed_type=all&limit=200`, {
//           signal: ac.signal,
//           headers: { 'Authorization': `Bearer ${token || ''}` }
          
//         });

//         if (!res.ok) throw new Error('HTTP ' + res.status);

//         const data = await res.json();
//         if (!data.isSuccess) throw new Error(data.message);

//         const apiPosts = data.result.posts.map(mapApiPost);
//         setPosts(apiPosts);

//       } catch (err) {
//         console.error(err);
//         setErr(err.message);
//         setPosts([]);
//       } finally {
//         setLoading(false);
//       }
//     })();

//     return () => ac.abort();
//   }, [token, user]);

//   return (
//     <section className="taball">
//       <div className="feed-list">
//         {loading && <div className="feed-skeleton">불러오는 중…</div>}

//         {!loading && posts.length === 0 && (
//           <div className="no-posts-container">
//           <p className="empty-title">아직 기록된 여행 순간이 없어요</p>
//           <p className="empty-subtitle">첫 번째 사진을 올려 추억을 시작해보세요!</p>
//           </div>
//         )}

//         {!loading && posts.map((p) => (
//           <PostItem 
//             key={p.id}
//             post={p}
//             isMine={p.is_mine}
//           />
//         ))}
//       </div>
//     </section>
//   );
// };

// export default TabAll;

import React, { useEffect, useState } from 'react';
import PostItem from '../post/PostItem'; 
import './TabAll.css';
import { useAuth } from '../../../contexts/AuthContext';

// 1. HTTPS 주소 적용
const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';

const TabAll = ({ activeTrip = null , onPostsLoaded=()=>{} }) => {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const currentUserId = user?.id;
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
   
  useEffect(() => {
    if (onPostsLoaded) onPostsLoaded(posts);
  }, [posts, onPostsLoaded]);
  
  // 날짜 처리
  const extractCreatedDate = (p) => {
    const t = p.created_at || p.createdAt;
    if (!t) return '날짜 없음';
    return new Date(t).toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).replace(/\./g, '.').trim();
  };

  // API post -> 앱용 구조 매핑
  const mapApiPost = (p) => {
     const mediaList = p.media ? p.media.map(m => ({
        url: m.url,
        thumbnail: m.thumbnail_url, // 영상 썸네일
        type: m.object_type || 'MEDIA' // SHORT_REEL | MEDIA | SCRAPBOOK
    })) : [];

    return {
      id: p.id,
      author: p.author?.username ?? '알 수 없음',
      author_avatar: p.author?.avatar_url ?? '/assets/default-avatar.png',
      caption: p.caption ?? '',
      
      images: mediaList.map(m => m.url), 
      
      media: mediaList,

      image: mediaList[0]?.thumbnail || mediaList[0]?.url || null, // 커버 이미지
      location: p.location ?? '',
      date: extractCreatedDate(p),
      like_count: p.like_count ?? 0,
      comment_count: p.comment_count ?? 0,
      is_liked: !!p.is_liked,
      is_mine: String(p.author?.id) === String(currentUserId), // 안전한 비교
      lat: p.lat ?? null,
      lng: p.lng ?? null,
    };
  };

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/posts?feed_type=all&limit=200`, {
          signal: ac.signal,
          headers: { 'Authorization': `Bearer ${token || ''}` }
        });

        if (!res.ok) throw new Error('HTTP ' + res.status);

        const data = await res.json();
        if (!data.isSuccess) throw new Error(data.message);

        const apiPosts = data.result.posts.map(mapApiPost);
        setPosts(apiPosts);

      } catch (error) {
        if (error.name !== 'AbortError') {
            console.error(error);
            setErr(error.message);
            setPosts([]);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [token, user]);

  return (
    <section className="taball">
      <div className="feed-list">
        {loading && <div className="feed-skeleton">불러오는 중…</div>}

        {!loading && posts.length === 0 && (
          <div className="no-posts-container">
            <p className="empty-title">아직 기록된 여행 순간이 없어요</p>
            <p className="empty-subtitle">첫 번째 사진을 올려 추억을 시작해보세요!</p>
          </div>
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
