import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import './Post.css';

const PostItem = ({ post = {}, isMine = false, isDetail = false }) => {
    const { 
        id, author, author_avatar, location, date, caption, title, image, 
        like_count, comment_count, is_liked 
    } = post;
    
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(is_liked || false);
    const [currentLikeCount, setCurrentLikeCount] = useState(like_count || 0);

    const toggleLike = (e) => {
        e.stopPropagation();
        const next = !isLiked;
        setIsLiked(next);
        setCurrentLikeCount(prev => next ? prev + 1 : prev - 1);
    };

    const goToDetail = () => {
        if (!isDetail && id) navigate(`/post/${id}`);
    };

    if (!id) return null;

    return (
        <article className="post-item">
            <div className="post-header" onClick={goToDetail}>
                <div className="user-info">
                    <img src={author_avatar || '/assets/default-avatar.png'} alt={author} className="avatar" />
                    <div className="user-details">
                        <span className="username">{author}</span>
                        {location && <span className="location">📍 {location}</span>}
                    </div>
                </div>
            </div>

            <div className="post-media-container" onClick={goToDetail}>
                <img src={image || '/assets/placeholder-image.png'} alt={title || 'image'} className="post-image" />
            </div>

            <div className="post-actions">
                <div className="like-row">
                    <button className={`like-btn ${isLiked ? 'liked' : ''}`} onClick={toggleLike}>
                        {isLiked 
                        ? <Heart fill="#f04438" color="#f04438" size={24} /> 
                        : <Heart color="#333" size={24} />}
                    </button>
                    <span className="like-count">좋아요 {currentLikeCount}개</span>
                </div>

                <div className="post-caption-block">
                    <span className="post-date">{date || new Date().toLocaleDateString()}</span>
                    <div className="post-content-text">{caption || title || '내용 없음'}</div>
                </div>
            </div>

            {!isDetail && (
                <button 
                    className="comment-toggle-btn"
                    onClick={() => navigate(`/post/${post.id}`)}
                >
                    댓글 보기
                </button>
            )}
        </article>
    );
};

export default PostItem;
