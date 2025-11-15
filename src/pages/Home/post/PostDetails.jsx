import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PostItem from './PostItem';
import './Post.css';

const LS_KEY = 'tripshot_posts';
const readPosts = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch { return []; }
};

const PostDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);

    const currentUserId = 'me';

    useEffect(() => {
        setLoading(true);
        const allPosts = readPosts();
        const foundPost = allPosts.find(p => String(p.id) === id);

        if (foundPost) {
            const postWithDetails = {
                ...foundPost,
                author: foundPost.userName,
                location: foundPost.location,
                caption: foundPost.content,
                image: foundPost.image,
                like_count: foundPost.likes || 0,
                comment_count: foundPost.comments || 0,
                is_liked: foundPost.is_liked || false,
                comments: [
                    { id: 1, user: { username: '친구1' }, content: '와, 사진 정말 멋지다!', created_at: '2025-11-13' },
                    { id: 2, user: { username: '친구2' }, content: '어디야? 나도 가보고 싶어!', created_at: '2025-11-13' },
                    { id: 3, user: { username: '나그네' }, content: '여행 가고 싶네요 :)', created_at: '2025-11-14' }
                ]
            };
            setPost(postWithDetails);
            setComments(postWithDetails.comments);
        }
        setLoading(false);
    }, [id]);

    const isMine = useMemo(() => post?.userName === currentUserId, [post]);

    if (loading) return <div className="post-detail-loading"><p>게시물을 불러오는 중...</p></div>;
    if (!post) return <div className="post-detail-error"><p>게시물을 찾을 수 없습니다.</p></div>;

    return (
        <div className="post-detail-page">
            <PostItem post={post} isMine={isMine} isDetail={true} />

            <div className="detail-comments-area">
                <div className="comments-list-detail">
                    {comments.map(comment => (
                        <div key={comment.id} className="comment-item detail-item">
                            <img src={comment.user.avatar_url || '/assets/default-avatar.png'} className="avatar small-avatar" />
                            <div className="comment-content-wrap">
                                <span className="comment-username">{comment.user.username}</span>
                                <span className="comment-text">{comment.content}</span>
                                <span className="comment-date">{comment.created_at}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="comment-input-area detail-input">
                    <input type="text" placeholder="댓글을 입력해주세요..." className="comment-input-field" />
                    <button className="comment-submit-btn">작성</button>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
