import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PostItem from './PostItem';
import './Post.css';
import { useAuth } from '../../../contexts/AuthContext'; 
import Header from '../../../components/Header/Header';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const PostDetail = () => {
  const { id } = useParams(); // URL에서 post id 가져오기
  const navigate = useNavigate();
  const { user, token } = useAuth(); // 인증 정보
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const isMine = useMemo(() => {
    if (!post || !user) return false;
    return Number(post.authorId) === Number(user.id);
  }, [post, user]);

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
        const resultList = Array.isArray(data.result) ? data.result : [];
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
        console.log('상세 조회 원본 데이터:', postData);

        if (postData.isSuccess) {
          const p = postData.result;

          const normalized = {
            id: p.id,
            
            // 1) 작성자 처리: API는 author 객체를 줌 -> username만 뽑아서 author에 넣기
            author: p.author?.username || '알 수 없음',
            author_avatar: p.author?.avatar_url || '/assets/default-avatar.png',
            authorId: p.author?.id, // isMine 판별용으로 따로 저장
            
            // 2) 이미지 처리: API는 media 배열을 줌 -> images 배열로 변환
            images: p.media ? p.media.map(m => m.url) : [],
            image: p.media?.[0]?.url || null, // 대표 이미지
            
            // 3) 기타 필드 매핑
            caption: p.caption || '',
            location: p.location || '', // API에 location이 없다면 빈 값 처리

            date: p.created_at 
              ? new Date(p.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric', month: '2-digit', day: '2-digit'
                }).replace(/\./g, '.').trim()
              : '날짜 미상',
            
            like_count: p.like_count ?? 0,
            comment_count: p.comment_count ?? 0,
            is_liked: !!p.is_liked
          };
          console.log("변환된 데이터:", normalized);
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
  

  //댓글 삭제
  const handleCommentDelete = async(commentId) =>{
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
        // DELETE /posts/{post_id}/comment/{comment_id}
        const res = await fetch(`${API_BASE}/posts/${id}/comment/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (data.isSuccess) {
            // 성공 시 목록 새로고침
            fetchComments();
        } else {
            alert(data.message || "댓글 삭제 실패");
        }
    } catch (err) {
        console.error(err);
        alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div className="post-detail-loading">불러오는 중...</div>;
  // 게시물 데이터가 없을 때 

 if (!post) return (
    <div className="post-detail-page">
       <Header title="" toBack={true} />
       
       <div style={{marginTop: 100, textAlign: 'center', color:'#999'}}>
           게시물을 찾을 수 없습니다.
       </div>
    </div>
  );

return (
  <div className="post-detail-page">
    <Header toBack={true}/>  

    <PostItem post={post} isMine={isMine} isDetail={true} />

      <div className="detail-comments-area">
        <div className="comments-list-detail">
          {Array.isArray(comments) && comments.map(c => {
            const isCommentMine = c.user?.id === user?.id;
            return (
            <div key={c.id} className="comment-item detail-item">
              <div className="comment-line">
                <span className="comment-avatar-circle">
                  <img src={c.user?.avatar_url || '/assets/default-avatar.png'} alt="" />
                  </span>
                  <div className="comment-right" style={{width: '100%'}}>
                    <div className="comment-header" style={{display:'flex', justifyContent:'space-between'}}>
                      <div>
                        <span className="comment-user">{c.user?.username || 'Unknown'}</span>
                        <span className="comment-date">
                          {new Date(c.created_at).toLocaleDateString('ko-KR')}
                          </span>
                          </div>
                          {isCommentMine && (
                            <button 
                            onClick={() => handleCommentDelete(c.id)}
                            className="comment-delete-btn"
                          >
                             삭제
                             </button>
                            )}
                            </div>
                            <div className="comment-body">{c.content}</div>
                            </div>
                      </div>
                    </div>
                );
            })}
            
            {comments.length === 0 && (
              <div className="comment-empty">
                첫 번째 댓글을 남겨보세요!
              </div>
            )}
          </div>

          <div className="comment-input-area detail-input">
              <input 
                type="text" 
                placeholder="댓글 달기..." 
                className="comment-input-field" 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
              />
              <button 
                className="comment-submit-btn" 
                onClick={handleCommentSubmit}
                disabled={!newComment.trim()} 
              >
                게시
              </button>
          </div>
      </div>
  </div>
)};

export default PostDetail;