import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext'; // [추가] 인증 훅

import location_icon from '../../../assets/location_icon.png';
import edit_icon from '../../../assets/edit_icon.png';

import './Post.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';


const PostItem = ({ post = {}, isMine = false, isDetail = false }) => {
  const {
    id,
    author,
    author_avatar,
    location: postLocation,
    date,
    caption,
    title,
    images: postImages,
    like_count,
    comment_count,
    is_liked
  } = post;

  const navigate = useNavigate();
  const { token } = useAuth(); // API 호출 시 필요한 토큰

  const images = Array.isArray(postImages) 
    ? postImages 
    : (post.image ? [post.image] : []);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(is_liked || false);
  const [currentLikeCount, setCurrentLikeCount] = useState(like_count || 0);
  const [showComments, setShowComments] = useState(false);

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // 좋아요 토글 API 연동
  const toggleLike = async (e) => {
    e.stopPropagation();
    if (!token) return alert("로그인이 필요합니다."); // 토큰 확인

    const nextIsLiked = !isLiked;
    const nextLikeCount = nextIsLiked ? currentLikeCount + 1 : currentLikeCount - 1;
    
    setIsLiked(nextIsLiked);
    setCurrentLikeCount(nextLikeCount);

    // API 호출
    try {
      const res = await fetch(`${API_BASE}/posts/${id}/like`, {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('좋아요 처리 실패');
      }
    } catch (err) {
      console.error('toggleLike error:', err);
      
      alert("좋아요 처리에 실패했습니다.");
      setIsLiked(!nextIsLiked); // 원래대로 복구
      setCurrentLikeCount(currentLikeCount); // 원래대로 복구
    }
  };

  const goToDetail = () => {
    if (!isDetail && id) navigate(`/post/${id}`);
  };

  const goToEdit = (e) => {
    e.stopPropagation();
    if (isMine) navigate(`/post/edit/${id}`);
  };

  const dummyComments = useMemo(() => {
    // ... (이 부분은 상세 페이지에서 API로 불러오므로 여기서는 유지)
    return [
      { id: 1, user: { username: "친구1" }, content: "와, 사진 멋지다!" },
      { id: 2, user: { username: "친구2" }, content: "여기 어디야?" }
    ].slice(0, comment_count > 0 ? 2 : 0);
  }, [comment_count]);

  if (!id) return null;

  return (
    <article className="post-item">
      
      {/* ---  헤더 --- */}
      <div className="post-header" onClick={goToDetail}>
        <div className="user-info">
          <img
            src={author_avatar || '/default-avatar.png'}
            alt={author}
            className="avatar"
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

      {/* ---  이미지 슬라이더 --- */}
      <div className="post-media-container" onClick={goToDetail}>
        <img
          src={images[currentImageIndex] || '/placeholder.png'}
          alt="post"
          className="post-image"
        />

        {images.length > 1 && (
          <>
            <button className="slider-arrow left" onClick={prevImage}>
              <ChevronLeft size={24} color="white" />
            </button>
            <button className="slider-arrow right" onClick={nextImage}>
              <ChevronRight size={24} color="white" />
            </button>

            <div className="post-media-indicators">
              {images.map((_, index) => (
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

        {/* 날짜 */}
        <div className="post-caption-block">
          <strong className="post-date">{date}</strong>

          {/* 캡션 */}
          <div className="post-content-text">
            {caption || title || "내용 없음"}
          </div>
        </div>
      </div>

      {/* ---댓글/수정하기 영역 --- */}
      <div className="post-comments-section">

        {/* 댓글 접기 / 보기
        {comment_count > 0 && (
          <button
            className="edit-link-btn"
            onClick={() => setShowComments((v) => !v)}
          >
            {showComments ? "댓글 접1기" : "댓글보기"}
          </button>
        )} */}

        {showComments && (
          <div className="comments-list">
            {dummyComments.map((c) => (
              <div key={c.id} className="comment-item">
                <span className="comment-username">{c.user.username}</span>
                <span className="comment-text">{c.content}</span>
              </div>
            ))}
          </div>
        )}

        {/* 댓글보기 / 수정하기 버튼 */}
        <div className="post-footer-actions">
          {!isDetail && (
            <button
              className="comment-link-btn"
              onClick={() => navigate(`/post/${id}`)}
            >
              댓글보기
            </button>
          )}

          {isMine && !isDetail && (
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