import React, { useEffect, useState } from 'react';
import PostItem from '../post/PostItem';
import './TabAll.css';
import { useAuth } from '../../../contexts/AuthContext';
import default_pic from "../../../assets/default-profile.png";

// 1. HTTPS 주소 적용
const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';

const TabAll = ({ activeTrip = null , onPostsLoaded=()=>{} }) => {
  const { token, user } = useAuth();
  
  // ★ [수정 1] 원본 데이터와 가공된 데이터를 분리합니다.
  const [rawPosts, setRawPosts] = useState([]); // API에서 온 원본
  const [posts, setPosts] = useState([]);       // 화면에 보여질 가공된 데이터
  
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

  // API post → 앱용 구조 매핑 (함수 분리 안 해도 됨, useEffect 안에서 처리)

  // API 데이터 가져오기
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

        // 가공하지 않고 원본 그대로 저장
        setRawPosts(data.result.posts || []);

      } catch (error) {
        if (error.name !== 'AbortError') {
            console.error(error);
            setErr(error.message);
            setRawPosts([]);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [token, user]);

  // rawPosts나 activeTrip이 바뀔 때마다 데이터를 다시 가공 
  useEffect(() => {
    const processedPosts = rawPosts.map(p => {
        const mediaList = p.media ? p.media.map(m => {
            let type = m.object_type || 'MEDIA';
            if (type === 'MEDIA' && m.url && /\.(mp4|mov|webm|avi|mkv)$/i.test(m.url)) {
              type = 'SHORT_REEL';
            }
            return {
              url: m.url,
              thumbnail: m.thumbnail_url || m.thumbnailUrl, 
              type: type 
            };
        }) : [];
    
        let locationName = p.location || '';
        
        // 현재 여행 중인 게시물이라면 여행 장소 이름 덮어쓰기
        if (!locationName && activeTrip && Number(p.trip_id) === Number(activeTrip.id)) {
            locationName = activeTrip.placeName;
        }
    
        return {
          id: p.id,
          author: p.author?.username ?? '알 수 없음',
          author_avatar: p.author?.avatar_url ?? default_pic,
          caption: p.caption ?? '',
          
          images: mediaList.map(m => m.url), 
          media: mediaList, 
    
          image: mediaList[0]?.thumbnail || mediaList[0]?.url || null,
          location: locationName || '어딘가', 
          date: extractCreatedDate(p),
          like_count: p.like_count ?? 0,
          comment_count: p.comment_count ?? 0,
          is_liked: !!p.is_liked,
          is_mine: String(p.author?.id) === String(currentUserId), 
          lat: p.lat ?? null,
          lng: p.lng ?? null,
        };
    });

    setPosts(processedPosts);

  }, [rawPosts, activeTrip, currentUserId]); // activeTrip이 변하면 여기도 다시 실행됨!

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