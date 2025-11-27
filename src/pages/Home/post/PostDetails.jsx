import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PostItem from './PostItem';
import './Post.css';
import { useAuth } from '../../../contexts/AuthContext'; 
import Header from '../../../components/Header/Header';
import default_pic from "../../../assets/default-profile.png";

const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const isMine = useMemo(() => {
    if (!post || !user) return false;
    return Number(post.authorId) === Number(user.id);
  }, [post, user]);  

  /** 댓글 불러오기 */
  const fetchComments = useCallback(async () => {
    if (!id || !token) return;

    try {
      const res = await fetch(`${API_BASE}/posts/${id}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('댓글 로드 실패');

      const data = await res.json();

      const commentsList = data.result?.comments || [];
      setComments(commentsList);

    } catch (err) {
      console.error(err);
    }
  }, [id, token]);

  /** 게시물 + 댓글 로딩 */
  useEffect(() => {
    const fetchPostAndComments = async () => {
      if (!id || !token) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const postRes = await fetch(`${API_BASE}/posts/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!postRes.ok) throw new Error('게시물을 찾을 수 없습니다.');

        const postData = await postRes.json();

        if (!postData.isSuccess) {
          throw new Error(postData.message || '게시물 로드 실패');
        }

        const p = postData.result;
        const createdTime = p.created_at || p.createdAt;

        const processedMedia = p.media ? p.media.map(m => {
          let type = m.object_type || 'MEDIA';

          // 파일 주소가 있고, 동영상 확장자라면 강제로 'SHORT_REEL'로 변경
          if (type === 'MEDIA' && m.url && /\.(mp4|mov|webm|avi|mkv)$/i.test(m.url)) {
            type = 'SHORT_REEL';
          }

          return {
            url: m.url,
            thumbnail: m.thumbnail_url,
            type: type
          };
        }) : [];

        const normalized = {
          id: p.id,
          author: p.author?.username || '알 수 없음',
          author_avatar: p.author?.avatar_url || default_pic,
          authorId: p.author?.id,
          
          // [수정] 가공된 media 데이터를 우선 전달해야 PostItem이 비디오로 인식함
          media: processedMedia, 
          
          images: processedMedia.map(m => m.url), // 단순 URL 배열 호환성 유지
          image: processedMedia[0]?.thumbnail || processedMedia[0]?.url || null,
          
          caption: p.caption || '',
          location: p.location || '',
          date: createdTime
            ? new Date(createdTime).toLocaleDateString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit'
              }).replace(/\./g, '.').trim()
            : '날짜 미상',
          like_count: p.like_count ?? 0,
          comment_count: p.comment_count ?? 0,
          is_liked: !!p.is_liked
        };

        setPost(normalized);

        await fetchComments();

      } catch (err) {
        console.error(err);
        setPost(null);

      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id, token, fetchComments]);

  /** 댓글 작성 */
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    if (!token) return alert("로그인이 필요합니다.");

    try {
      const res = await fetch(`${API_BASE}/posts/${id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment: newComment })
      });

      const data = await res.json();

      if (!res.ok || !data.isSuccess) {
        throw new Error(data.message || '댓글 작성 실패');
      }

      setNewComment("");
      fetchComments();

    } catch (err) {
      alert(`댓글 작성 오류: ${err.message}`);
    }
  };

  //  댓글 객체에서 실제 commentId를 추출하는 함수
const extractCommentId = (c) => {
  return (
    c.comment_id ??
    c.commentId ??
    c.id ??
    c.comment?.id ??
    null
  );
};

// 댓글 삭제 함수 (모든 경우 대응)
const handleCommentDelete = async (comment) => {
  const commentId = extractCommentId(comment);

  if (!commentId) {
    console.error("❌ 댓글 ID를 찾을 수 없습니다:", comment);
    alert("댓글 ID를 인식할 수 없습니다.");
    return;
  }

  if (!confirm("댓글을 삭제하시겠습니까?")) return;

  try {
    const res = await fetch(`${API_BASE}/posts/${id}/comment/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (data.isSuccess) {
      fetchComments();
    } else {
      alert(data.message || "댓글 삭제 실패");
    }
  } catch (err) {
    console.error(err);
    alert("댓글 삭제 중 오류가 발생했습니다.");
  }
};

  const handleKeyDown = (e) => {
    // 한글 입력 중 조합(composing) 상태일 때 이벤트 중복 방지
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter') {
      e.preventDefault(); // 줄바꿈 방지
      handleCommentSubmit();
    }
  };
  /** UI 렌더링 */
  if (loading) return <div className="post-detail-loading">불러오는 중...</div>;

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
      <Header toBack={true} />
      <div className="scroll-content">
        <PostItem post={post} isMine={isMine} isDetail={true} />

        <div className="detail-comments-area">
          <div className="comments-list-detail">
            {Array.isArray(comments) && comments.map(c => {
              // 댓글 작성자 정보 안전하게 추출
              const commenter = c.commenter || c.user || {};
              const isCommentMine = Number(commenter.id) === Number(user?.id);

              return (
                <div key={c.id} className="comment-item detail-item">
                  <div className="comment-line">
                    {/* 댓글 작성자 프사 */}
                    <span className="comment-avatar-circle">
                      <img
                        src={commenter.avatar_url || default_pic}
                        alt="user"
                        onError={(e) => e.target.src=default_pic}
                      />
                    </span>

                    <div className="comment-right">
                      <div className="comment-header">
                        <div>
                          <span className="comment-user">{commenter.username || 'Unknown'}</span>
                          <span className="comment-date">
                            {new Date(c.createdAt || c.created_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>

                        {/* 내 댓글일 때만 삭제 버튼 표시 */}
                        {isCommentMine && (
                          <button
                            onClick={() => handleCommentDelete(c)}
                            className="comment-delete-btn"
                          >
                            삭제
                          </button>
                        )}
                      </div>

                      <div className="comment-body">
                        {c.comment || c.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 댓글 없을 때 */}
            {comments.length === 0 && (
              <div className="comment-empty" style={{textAlign:'center', padding:'40px 0', color:'#999', fontSize:'14px'}}>
                아직 댓글이 없습니다.<br/>첫 번째 댓글을 남겨보세요!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="comment-input-area detail-input">
        
        {/* 내 프로필 사진 (왼쪽) */}
        <div className="my-profile-thumb">
           <img 
             src={
                user?.avatarUrl ||      // 1순위: ProfilePage에서 쓰는 이름
                user?.avatar_url ||     // 2순위: API 등에서 쓰는 이름
                user?.profile_url ||    // 3순위: 혹시 모를 다른 이름
                default_pic // 기본 이미지 
             } 
             alt="me" 
             className="my-profile-img"
             // 이미지가 깨지면 기본 이미지로 대체
             onError={(e) => {
                e.target.onerror = null;
                e.target.src= default_pic;
             }}
           />
        </div>

        {/* 입력 필드 (중앙) */}
        <input 
          type="text"
          placeholder="댓글 달기..." 
          className="comment-input-field"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown} // 엔터키 입력 시 전송
          autoComplete="off"
        />

        {/* 게시 버튼 (오른쪽, 텍스트 스타일) */}
        {/* 내용이 있을 때만 활성화된 색상으로 표시 */}
        <button 
          className="comment-submit-btn"
          onClick={handleCommentSubmit}
          disabled={!newComment.trim()}
          style={{ opacity: newComment.trim() ? 1 : 0.5 }}
        >
          게시
        </button>
      </div>
    </div>
  );
}

export default PostDetail;
