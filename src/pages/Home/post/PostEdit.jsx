import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext'; 
import './Post.css'; 
import Header from '../../../components/Header/Header';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const PostEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [locationText, setLocationText] = useState(''); // 읽기 전용으로 보여줄 용도
  const [loading, setLoading] = useState(true);

  // 1. 기존 게시물 정보 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      if(!token) return;
      try {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.isSuccess) {
            const p = data.result;
            // 내 글이 아니면 튕겨내기 (보안)
            if (p.author?.id !== user?.id) {
                alert("수정 권한이 없습니다.");
                navigate(-1);
                return;
            }
            setTitle(p.title || ''); // 제목이 없는 경우 대비
            setContent(p.caption || '');
            setLocationText(p.location || '');
        } else {
            alert("게시물 정보를 불러오지 못했습니다.");
            navigate(-1);
        }
      } catch (e) {
        console.error(e);
        alert("오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, token, user, navigate]);

  // 수정하기 (PATCH)
  const handleUpdate = async () => {
    if (!confirm("게시물을 수정하시겠습니까?")) return;

    try {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'PATCH', 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                title: title,
                caption: content
                // location, media 등은 수정하지 않음 
            })
        });
        const data = await res.json();
        
        if (data.isSuccess) {
            alert("수정되었습니다.");
            navigate(`/home`, { replace: true }); // 상세 페이지로 복귀
        } else {
            alert(data.message || "수정 실패");
        }
    } catch (e) {
        console.error(e);
        alert("수정 중 오류 발생");
    }
  };

  // 삭제하기 (DELETE)
  const handleDelete = async () => {
    if (!confirm("정말로 이 게시물을 삭제하시겠습니까? 복구할 수 없습니다.")) return;

    try {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });
        const data = await res.json();

        if (data.isSuccess) {
            alert("삭제되었습니다.");
            navigate('/home', { replace: true }); // 홈으로 이동
        } else {
            alert(data.message || "삭제 실패");
        }
    } catch (e) {
        console.error(e);
        alert("삭제 중 오류 발생");
    }
  };

  // if (loading) return <div style={{padding:20}}>로딩 중...</div>;
  // if (!post) return (
  //     <div className="post-detail-page">
  //        <Header title="" toBack={true} />
         
  //        <div style={{marginTop: 100, textAlign: 'center', color:'#999'}}>
  //            게시물을 찾을 수 없습니다.
  //        </div>
  //     </div>
  //   );

  return (
  <div className="compose">
    <header className="compose-header">
      <button onClick={() => navigate(-1)}>취소</button>
      <div>게시물 수정</div>
      <button className="share" onClick={handleUpdate}>완료</button>
    </header>
    
    <main className="compose-body">
      {/* 위치 (읽기 전용) */}
      <div className="form-row">
        <label>위치</label>
        <input 
            value={locationText} 
            disabled 
            className="input-readonly" 
        />
      </div>

      <div className="form-row">
        <label>제목</label>
        <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
        />
      </div>

      <div className="form-row">
        <label>내용</label>
        <textarea 
            rows={6} 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
        />
      </div>
      <div className="delete-section">
          <button 
              onClick={handleDelete}
              className="delete-btn"
          >
              게시물 삭제
          </button>
      </div>

    </main>
  </div>
)};

export default PostEdit;