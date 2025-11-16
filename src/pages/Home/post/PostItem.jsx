import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MoreVertical } from 'lucide-react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import location_icon from '../../../assets/location_icon.png';

import './Post.css';


const PostItem = ({ post = {}, isMine = false, isDetail = false }) => {
    
    const { 
        id, author, author_avatar, 
        location: postLocation,
        date, caption, title, 
        images: postImages,
        like_count, comment_count, is_liked 
    } = post;

    // const postLocation =  post.location_text || null;

    const images = postImages || (post.image ? [post.image]: []);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(is_liked || false);
    const [currentLikeCount, setCurrentLikeCount] = useState(like_count || 0);
    const [showComments, setShowComments] = useState(isDetail || false);

    const nextImage = (e) =>{
        e.stopPropagation();
        setCurrentImageIndex(prev=>(prev+1)%images.length);
    };
    const prevImage=(e)=>{
        e.stopPropagation();
        setCurrentImageIndex(prev=>(prev-1+images.length)%images.length);
    }

    const toggleLike = (e) => {
        e.stopPropagation();
        const next = !isLiked;
        setIsLiked(next);
        setCurrentLikeCount(prev => next ? prev + 1 : prev - 1);
    };

    const goToDetail = () => {
        if (!isDetail && id) navigate(`/post/${id}`);
    };
    const goToEdit = (e) => {
        e.stopPropagation(); // 옵션 버튼 클릭 시 상세 페이지로 이동 방지
        if (isMine && id) {
            // 실제: navigate(`/post/edit/${id}`);
            alert('수정 페이지로 이동합니다.');
        }
    };
    
    const dummyComments = useMemo(() => {
        return [
            { id: 1, user: { username: "친구1", avatar_url: '' }, content: "와, 사진 정말 멋지다!", created_at: "2025-11-13" },
            { id: 2, user: { username: "친구2", avatar_url: '' }, content: "어디야? 나도 가보고 싶어!", created_at: "2025-11-13" }
        ].slice(0, comment_count > 0 ? 2 : 0); // 댓글 카운트에 따라 표시 여부 결정
    }, [comment_count]);

    if (!id) return null;
    console.log("HOME ITEM:", post);
console.log("images:", images);


return (
  <article className="post-item">
    {/* 1. 헤더 영역 (사용자 정보, 위치, 옵션 버튼) */}
    <div className="post-header" onClick={goToDetail}>
      <div className="user-info">
        <img src={author_avatar || '/assets/default-avatar.png'} alt={author} className="avatar" />
        <div className="user-details">
            <span className="username">{author}</span>
            {postLocation && <span className="location">
                <img src={location_icon} alt="Location" />
                {postLocation}
                </span>}
                </div>
      </div>
     
    </div>

    {/* 2. 미디어 영역 (슬라이더) */}
    <div className="post-media-container" onClick={goToDetail}>
      {/* 현재 이미지 표시 */}
      <img
        src={images[currentImageIndex] || '/assets/placeholder-image.png'}
        alt={title || '게시물 사진'}
        className="post-image"
      />
      {/* 다중 이미지일 경우 슬라이더 컨트롤 및 인디케이터 */}
      {images.length > 1 && (
        <>
          {/* 왼쪽 화살표 */}
          <button className="slider-arrow left" onClick={prevImage} aria-label="이전 사진">
            <ChevronLeft size={24} color="white" />
          </button>
          {/* 오른쪽 화살표 */}
          <button className="slider-arrow right" onClick={nextImage} aria-label="다음 사진">
            <ChevronRight size={24} color="white" />
          </button>
          {/* 인디케이터 */}
          <div className="post-media-indicators">
            {images.map((_, index) => (
              <span key={index} className={`dot ${index === currentImageIndex ? 'active' : ''}`} />
            ))}
          </div>
        </>
      )}
    </div>

    {/* 3. 액션 영역 (좋아요, 날짜, 캡션) */}
    <div className="post-actions">
      <div className="like-row">
        <button className={`like-btn ${isLiked ? 'liked' : ''}`} onClick={toggleLike} aria-label="좋아요 토글">
          {isLiked ? (
            <Heart fill="#f04438" color="#f04438" size={24} />
          ) : (
            <Heart color="#333" size={24} />
          )}
        </button>
        <span className="like-count"> {currentLikeCount}개</span>
      </div>

      <div className="post-caption-block">
        {/* 날짜 */}
        <span className="post-date">{date || new Date().toLocaleDateString()}</span>
        {/* 캡션/내용 */}
        <div className="post-content-text">{caption || title || '내용 없음'}</div>
      </div>
    </div>

    {/* 4. 댓글 영역 (상세 페이지가 아닐 때만 댓글 보기 토글) */}
    <div className="post-comments-section">
      {!isDetail && comment_count > 0 && (
        <button className="comment-toggle-btn" onClick={() => setShowComments(v => !v)}>
          {showComments ? '댓글 접기' : '댓글 보기'}
        </button>
      )}
      {/* 댓글 미리보기 */}
      {showComments && (
        <div className="comments-list">
          {dummyComments.map(comment => (
            <div key={comment.id} className="comment-item">
              <span className="comment-username">{comment.user.username}</span>
              <span className="comment-text">{comment.content}</span>
            </div>
          ))}
        </div>
      )}
      {!isDetail && (
                <button 
                    className="comment-toggle-btn"
                    onClick={() => navigate(`/post/${post.id}`)}
                >
                    댓글 보기
                </button>
            )}

      {/* 내 게시물일 때만 수정하기 링크 표시 (목록 뷰) */}
      {isMine && !isDetail && (
        <button className="edit-link-btn" onClick={goToEdit}>수정하기</button>
      )}
    </div>

    
  </article>
);
};


export default PostItem;
