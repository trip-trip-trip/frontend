import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PostItem from './PostItem';
import './Post.css';

const LS_KEY = 'tripshot_posts';
const readPosts = () => {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    } catch {
        return [];
    }
};

const PostDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);

    const currentUserId = "me"; // 로그인 된 유저라고 가정

    useEffect(() => {
        setLoading(true);
        const all = readPosts();
        const found = all.find(p => String(p.id) === id);

        if (found) {
            const normalized = {
                ...found,
                author: found.userName,
                location: found.location,
                caption: found.content,
                images: found.images || (found.image ? [found.image] : []),
                like_count: found.likes || 0,
                comment_count: found.comments?.length || 0,
                comments: [
                    {
                        id: 1,
                        user: { username: "그냥미친사람", avatar_url: "" },
                        content: "도쿄에 다녀왔대 너무너무 재밌었다 또 가고 싶다.",
                        created_at: "2025.11.12"
                    },
                    {
                        id: 2,
                        user: { username: "그냥미친사람", avatar_url: "" },
                        content: "도쿄에 다녀왔대 너무너무 재밌었다 또 가고 싶다.",
                        created_at: "2025.11.12"
                    }
                ]
            };
            setPost(normalized);
            setComments(normalized.comments);
        }

        setLoading(false);
    }, [id]);

    const isMine = useMemo(() => post?.userName === currentUserId, [post]);

    if (loading) return <div className="post-detail-loading">불러오는 중...</div>;
    if (!post) return <div className="post-detail-error">게시물을 찾을 수 없습니다.</div>;

    return (
        <div className="post-detail-page">
            <PostItem post={post} isMine={isMine} isDetail={true} />

            {/* 댓글 영역 */}
            <div className="detail-comments-area">

                <div className="comments-list-detail">
                    {comments.map(c => (
                        <div key={c.id} className="comment-item detail-item">
                            <div className="comment-line">
                                <span className="comment-avatar-circle"></span>

                                <div className="comment-right">
                                    <div className="comment-header">
                                        <span className="comment-user">{c.user.username}</span>
                                        <span className="comment-date">{c.created_at}</span>
                                    </div>

                                    <div className="comment-body">{c.content}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 댓글 입력 */}
                <div className="comment-input-area detail-input">
                    <input type="text" placeholder="댓글을 입력해주세요..." className="comment-input-field" />
                    <button className="comment-submit-btn">작성</button>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
