import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext'; 

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
    location: postLocation,
    date,
    caption,
    media,          
    images: postImages, 
    image: singleImage,
    like_count,
    is_liked
  } = post;

  const navigate = useNavigate();
  const { token } = useAuth();

  const safeAuthor = typeof post.author === 'object' && post.author !== null ? post.author : {};
  const authorId = post.authorId || safeAuthor.id;
  
  const displayAuthorName = safeAuthor.username || (typeof post.author === 'string' ? post.author : 'Unknown');
  const displayAuthorAvatar = safeAuthor.avatar_url || post.author_avatar || default_pic;

  const goToUserProfile = (e) => { 
    e.stopPropagation(); 
    e.preventDefault();

    console.log("프사 클릭됨! 추출된 ID:", authorId);

    if (authorId) {
      navigate(`/user/${authorId}`);
    } else {
      console.warn("이동 실패: 사용자 ID가 없습니다. (데이터 구조 확인 필요)");
    }
  };

  const goToDetail = () => {
    if (!isDetail && id) navigate(`/post/${id}`);
  };

  const mediaList = useMemo(() => {
    if (media && media.length > 0) return media; 
    if (Array.isArray(postImages) && postImages.length > 0) return postImages.map(url => ({ url, type: 'MEDIA' }));
    if (singleImage) return [{ url: singleImage, type: 'MEDIA' }];
    return [];
  }, [media, postImages, singleImage]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(is_liked || false);
  const [currentLikeCount, setCurrentLikeCount] = useState(like_count || 0);

  const nextImage = (e) => {
    e.stopPropagation();
    if (mediaList.length > 0) setCurrentImageIndex((prev) => (prev + 1) % mediaList.length);
  };
  
  const prevImage = (e) => {
    e.stopPropagation();
    if (mediaList.length > 0) setCurrentImageIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

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
      setIsLiked(!nextIsLiked);
      setCurrentLikeCount(currentLikeCount); 
    }
  };

  const goToEdit = (e) => {
    e.stopPropagation();
    if (isMine) navigate(`/post/edit/${id}`);
  };

  if (!id) return null;
  const currentItem = mediaList[currentImageIndex] || {};

  return (
    <article className="post-item">
      
      <div className="post-header" onClick={goToDetail} style={{ cursor: isDetail ? 'default' : 'pointer' }}>
        <div className="user-info">
          <img
            src={displayAuthorAvatar}
            alt={displayAuthorName}
            className="avatar"
            onClick={goToUserProfile}
            onError={(e) => e.target.src = default_pic}
            style={{ cursor: 'pointer', position: 'relative', zIndex: 10 }} 
          />
          
          <div className="user-details">
            <span className="username" onClick={goToUserProfile} style={{ cursor: 'pointer', position: 'relative', zIndex: 10 }}>
              {displayAuthorName}
            </span>
            {postLocation && (
              <span className="location">
                <img src={location_icon} alt="" />
                {postLocation}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="post-media-container" onClick={goToDetail}>
        {currentItem.type === 'SHORT_REEL' ? (
             <video
                src={currentItem.url}
                className="post-video"
                controls
                autoPlay
                muted
                playsInline
                loop
                onClick={(e) => e.stopPropagation()} 
             />
        ) : (
             <img
                src={currentItem.url || '/placeholder.png'}
                alt="post"
                className="post-image"
             />
        )}
 
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
      <div className="post-actions">
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

        <div className="post-caption-block">
          <strong className="post-date">{date}</strong>
          <div className="post-content-text">
            {caption || "내용 없음"}
          </div>
        </div>
      </div>
      <div className="post-comments-section">
        <div className="post-footer-actions">
          {!isDetail && (
            <button
              className="comment-link-btn"
              onClick={() => navigate(`/post/${id}`)}
            >
              댓글보기
            </button>
          )}

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
