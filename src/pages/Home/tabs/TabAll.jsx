import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostItem from '../post/PostItem'; 
import './TabAll.css';
import { useAuth } from '../../../contexts/AuthContext';

// API_BASE 환경 변수 처리
const API_BASE = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '');

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
    if (onPostsLoaded) onPostsLoaded(posts);
  }, [posts, onPostsLoaded]);
  
  const canShoot = useMemo(() => !!activeTrip, [activeTrip]);

  // 날짜 처리 → created_at / createdAt 둘 다 지원
  const extractCreatedDate = (p) => {
    const t = p.created_at || p.createdAt;
    if (!t) return '날짜 없음';
    return new Date(t).toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).replace(/\./g, '.').trim();
  };

  // API post → 앱용 구조
  const mapApiPost = (p) => ({
    id: p.id,
    author: p.author?.username ?? '알 수 없음',
    author_avatar: p.author?.avatar_url ?? '/assets/default-avatar.png',
    caption: p.caption ?? '',
    images: p.media ? p.media.map(m => m.thumbnail_url || m.url) : [], 
    image: p.media?.[0]?.thumbnail_url || p.media?.[0]?.url || null,
    location: p.location ?? '',
    date: extractCreatedDate(p),
    like_count: p.like_count ?? 0,
    comment_count: p.comment_count ?? 0,
    is_liked: !!p.is_liked,
    is_mine: p.author?.id === currentUserId,
    lat: p.lat ?? null,
    lng: p.lng ?? null,
  });

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

      } catch (err) {
        console.error(err);
        setErr(err.message);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [token, user]);

  const goShoot = () => {
    if (!canShoot) return;
    if (activeTripId) navigate(`/camera/${activeTripId}`);
    else alert("활성 여행 ID를 찾을 수 없습니다.");
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
