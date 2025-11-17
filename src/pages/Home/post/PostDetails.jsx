import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import PostItem from './PostItem';
import './Post.css';
import { useAuth } from '../../../contexts/AuthContext'; 

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const PostDetail = () => {
  const { id } = useParams(); // URL에서 post id 가져오기
  const { user, token } = useAuth(); // 인증 정보
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const isMine = useMemo(() => post?.author?.id === user?.id, [post, user]);

  // 댓글 목록을 불러오는 함수
  const fetchComments = useCallback(async () => {
    if (!id || !token) return;
    try {
      const res = await fetch(`${API_BASE}/posts/${id}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('댓글 로드 실패');
      const data = await res.json();
      if (data.isSuccess) {
        setComments(data.result || []); 
      }
    } catch (err) {
      console.error(err);
    }
  }, [id, token]);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      if (!id || !token) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // 상세 정보 API 호출
        const postRes = await fetch(`${API_BASE}/posts/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!postRes.ok) throw new Error('게시물을 찾을 수 없습니다.');
        
        const postData = await postRes.json();
        if (postData.isSuccess) {
          const p = postData.result;
          const normalized = {
            ...p,
            author: p.author?.username ?? 'username',
            author_avatar: p.author?.avatar_url ?? '/assets/default-avatar.png',
            caption: p.caption ?? '',
            images: p.media ? p.media.map(m => m.thumbnail_url || m.url) : [],
            image: p.media?.[0]?.thumbnail_url || p.media?.[0]?.url || null,
            location: p.location ?? '위치 정보 없음',
            date: new Date(p.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric', month: '2-digit', day: '2-digit'
            }).replace(/\./g, '.').trim(),
          };
          setPost(normalized);
        } else {
          throw new Error(postData.message || '게시물 로드 실패');
        }

        //댓글 목록 API 호출
        await fetchComments();

      } catch (err) {
        console.error(err);
        setPost(null); // 게시물 로드 실패
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id, token, fetchComments]); // 의존성 변경

  //  댓글 작성 API 호출 함수
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return; // 내용이 없으면 중단
    if (!token) return alert("로그인이 필요합니다.");

    try {
      const res = await fetch(`${API_BASE}/posts/${id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
          },
        body: JSON.stringify({ content: newComment })
      });

      const data = await res.json();
      if (!res.ok || !data.isSuccess) {
        throw new Error(data.message || '댓글 작성 실패');
      }

      // 성공
      setNewComment(""); // 입력창 비우기
      fetchComments(); // 댓글 목록 새로고침

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

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
                        <span className="comment-avatar-circle">
                          {/*아바타 이미지 (있다면) */}
                          {c.user?.avatar_url && <img src={c.user.avatar_url} alt="" />}
                        </span>

                        <div className="comment-right">
                          <div className="comment-header">
                            <span className="comment-user">{c.user.username}</span>
                            <span className="comment-date">{new Date(c.created_at).toLocaleDateString('ko-KR')}</span>
                          </div>

                          <div className="comment-body">{c.content}</div>
                        </div>
                      </div>
                    </div>
                ))}
                {comments.length === 0 && !loading && (
                  <div className="comment-empty">작성된 댓글이 없습니다.</div>
                )}
              </div>

              {/* 댓글 입력 */}
              <div className="comment-input-area detail-input">
                  <input 
                    type="text" 
                    placeholder="댓글을 입력해주세요..." 
                    className="comment-input-field" 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                  />
                  <button 
                    className="comment-submit-btn" 
                    onClick={handleCommentSubmit} 
                  >
                    작성
                  </button>
              </div>
          </div>
      </div>
  );
};

export default PostDetail;
