import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext'; 

// 이미지 경로들은 사용자 환경에 맞춰 유지
import location_icon from '../../../assets/location_icon.png';
import edit_icon from '../../../assets/edit_icon.png';
import default_pic from "../../../assets/default-profile.png";

import './Post.css';

const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';

const PostItem = ({ post = {}, isMine = false, isDetail = false }) => {
  const {
    id,
    author,
    author_avatar,
    location: postLocation,
    date,
    caption,
    // ★ 1. 서버에서 오는 데이터: media(타입 포함 배열) 우선, 없으면 images(문자열 배열) 사용
    media,         
    images: postImages, 
    image: singleImage,
    like_count,
    is_liked
  } = post;

  const navigate = useNavigate();
  const { token } = useAuth();
  const userId = post.userId;

  /// go to profile
  const goToUserProfile = (e) => { 
   e.stopPropagation(); //상위 요소로 이벤트 전파 방지
   if (userId) {
     navigate(`/user/${userId}`);
   }
 };


  // ★ 2. 미디어 리스트 정규화 (모든 데이터를 { url, type } 형태로 통일)
  const mediaList = useMemo(() => {
    // 1순위: media 배열 ({ url, type: 'SHORT_REEL' | 'MEDIA' })
    if (media && media.length > 0) {
        return media; 
    }
    // 2순위: images 배열 (문자열만 있음 -> 모두 사진 'MEDIA'로 취급)
    if (Array.isArray(postImages) && postImages.length > 0) {
        return postImages.map(url => ({ url, type: 'MEDIA' }));
    }
    // 3순위: 단일 image (문자열 -> 사진 'MEDIA')
    if (singleImage) {
        return [{ url: singleImage, type: 'MEDIA' }];
    }
    return [];
  }, [media, postImages, singleImage]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(is_liked || false);
  const [currentLikeCount, setCurrentLikeCount] = useState(like_count || 0);

  // 슬라이더 이동 함수
  const nextImage = (e) => {
    e.stopPropagation();
    if (mediaList.length > 0) {
        setCurrentImageIndex((prev) => (prev + 1) % mediaList.length);
    }
  };
  
  const prevImage = (e) => {
    e.stopPropagation();
    if (mediaList.length > 0) {
        setCurrentImageIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
    }
  };

  // 좋아요 토글
  const toggleLike = async (e) => {
    e.stopPropagation();
    const nextIsLiked = !isLiked;
    const nextLikeCount = nextIsLiked ? currentLikeCount + 1 : currentLikeCount - 1;
    
    setIsLiked(nextIsLiked);
    setCurrentLikeCount(nextLikeCount);

    try {
      const res = await fetch(`${API_BASE}/posts/${id}/like`, {
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${token || ''}` }
      });

      if (!res.ok) throw new Error('좋아요 처리 실패');
    } catch (err) {
      console.error('toggleLike error:', err);
      setIsLiked(!nextIsLiked); // 실패 시 복구
      setCurrentLikeCount(currentLikeCount); 
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  const goToDetail = () => {
    if (!isDetail && id) navigate(`/post/${id}`);
  };

  const goToEdit = (e) => {
    e.stopPropagation();
    if (isMine) navigate(`/post/edit/${id}`);
  };

  if (!id) return null;

  // ★ 3. 현재 보여줄 아이템 (없으면 빈 객체)
  const currentItem = mediaList[currentImageIndex] || {};

  return (
    <article className="post-item">
      
      {/* --- 헤더 --- */}
      <div className="post-header" onClick={goToDetail}>
        <div className="user-info">
          <img
            src={author_avatar || default_pic}
            alt={author}
            className="avatar"
            onClick={goToUserProfile}
            onError={(e) => e.target.src = default_pic}
          />
          <div className="user-details">
            <span className="username">{author}</span>
            {postLocation && (
              <span className="location">
                <img src={location_icon} alt="" />
                {postLocation}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* --- 미디어 슬라이더 (사진/영상 구분 렌더링) --- */}
      <div className="post-media-container" onClick={goToDetail}>
        {/* ★ 4. 타입에 따른 분기 처리: 영상이면 video, 아니면 img */}
        {currentItem.type === 'SHORT_REEL' ? (
             <video
                src={currentItem.url}
                className="post-video" // Post.css에 .post-video { width:100%; height:100%; object-fit:cover; } 추가 필요
                controls
                autoPlay
                muted
                playsInline
                loop
             />
        ) : (
             <img
                src={currentItem.url || '/placeholder.png'}
                alt="post"
                className="post-image"
             />
        )}
 
        {/* 미디어가 2개 이상일 때만 화살표 및 인디케이터 표시 */}
        {mediaList.length > 1 && (
          <>
            <button className="slider-arrow left" onClick={prevImage}>
              <ChevronLeft size={24} color="white" />
            </button>
            <button className="slider-arrow right" onClick={nextImage}>
              <ChevronRight size={24} color="white" />
            </button>

            <div className="post-media-indicators">
              {mediaList.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- 좋아요, 날짜, 캡션 --- */}
      <div className="post-actions">

        {/* 좋아요 */}
        <div className="like-row">
          <button
            className={`like-btn ${isLiked ? 'liked' : ''}`}
            onClick={toggleLike}
          >
            {isLiked ? (
              <Heart fill="#f04438" color="#f04438" size={26} />
            ) : (
              <Heart color="#333" size={26} />
            )}
          </button>
          <span className="like-count">{currentLikeCount}</span>
        </div>

        {/* 날짜 및 캡션 */}
        <div className="post-caption-block">
          <strong className="post-date">{date}</strong>
          <div className="post-content-text">
            {caption || "내용 없음"}
          </div>
        </div>
      </div>

      {/* --- 댓글/수정하기 영역 --- */}
      <div className="post-comments-section">
        <div className="post-footer-actions">
          {/* 상세 페이지가 아닐 때만 '댓글보기' 버튼 노출 */}
          {!isDetail && (
            <button
              className="comment-link-btn"
              onClick={() => navigate(`/post/${id}`)}
            >
              댓글보기
            </button>
          )}

          {/* 내 글이면 수정하기 버튼 노출 */}
          {isMine && (
            <button className="edit-link-btn" onClick={goToEdit}>
              <img src={edit_icon} alt="" className="edit-icon" />
              수정하기
            </button>
          )}
        </div>
      </div>

    </article>
  );
};

export default PostItem;

