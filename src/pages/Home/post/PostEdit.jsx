import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/Header/Header';
import './PostEdit.css'; 

const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';

const PostEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false); 
  const [mediaList, setMediaList] = useState([]); 
  const [loading, setLoading] = useState(false);

  // 기존 게시물 정보 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.isSuccess) {
          const p = data.result;
          
          // 권한 체크
          if (p.author?.id !== user?.id && p.author?.username !== user?.username) {
             // API에 따라 author 구조가 다를 수 있어 안전하게 체크
             // (본인 확인 로직이 확실하다면 생략 가능)
          }

          // 데이터 매핑
          setContent(p.caption || '');
          setIsPrivate(p.visibility === 'PRIVATE');

          // 미디어 데이터 매핑 
          if (p.media && Array.isArray(p.media)) {
             setMediaList(p.media.map(m => ({
                 mediaAssetId: m.mediaAssetId || m.id, // ID 필드명 주의
                 url: m.url || m.mediaUrl || '',       // 이미지 URL
                 type: m.type || 'MEDIA'               // 타입
             })));
          }
        } else {
          alert("게시물 정보를 불러오지 못했습니다.");
          navigate(-1);
        }
      } catch (e) {
        console.error(e);
        alert("오류가 발생했습니다.");
      }
    };
    fetchPost();
  }, [id, token, user, navigate]);

  // 수정 요청 (PATCH)
  const handleUpdate = async () => {
    if (!content.trim()) return alert("내용을 입력해주세요.");
    // if (!confirm("게시물을 수정하시겠습니까?")) return;

    setLoading(true);

    const payload = {
        caption: content,
        visibility: isPrivate ? 'PRIVATE' : 'FRIENDS',
        media: mediaList.map((m, index) => ({
            media_id: m.mediaAssetId,
            object_type: m.type === 'SCRAPBOOK' ? 'SCRAPBOOK' : 'MEDIA',
            position: index + 1
        }))
    };

    try {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.isSuccess) {
            alert("수정되었습니다.");
            navigate('/home', { replace: true });
        } else {
            alert(`수정 실패: ${data.message}`);
        }
    } catch (e) {
        console.error(e);
        alert("수정 중 오류 발생");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="post-edit-container">
      {/* 헤더: 뒤로가기 버튼 연결 */}
      <Header toBack={true} />
      <main className="post-body">
        <h2 className="page-title">포스트 수정하기</h2>

        <div className="write-preview-box">
           {mediaList.length > 0 && (
               <div className="preview-image-main">
                    {/* 대표 이미지 */}
                    <img src={mediaList[0].url} alt="main" />
               </div>
           )}
           {/* 썸네일 리스트 */}
           <div className="preview-thumbnails">
               {mediaList.map((m, idx) => (
                   <img 
                     key={m.mediaAssetId || idx} 
                     src={m.url} 
                     alt="" 
                     className={idx === 0 ? 'active' : ''} 
                   />
               ))}
           </div>
        </div>

        {/* 코멘트 라벨 + 비공개 체크박스 */}
        <div className="comment-label-row">
            <span className="label-text">코멘트</span>
            <label className="privacy-check">
                <input 
                    type="checkbox" 
                    checked={isPrivate} 
                    onChange={(e) => setIsPrivate(e.target.checked)} 
                />
                비공개 포스트로 올리기
            </label>
        </div>

        {/* 점선 텍스트 박스 */}
        <textarea 
            className="comment-box" 
            placeholder="내용을 입력해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
        ></textarea>

        {/* 수정하기 버튼 (색상: 짙은 회색) */}
        <button 
            className="submit-btn edit-mode-btn" 
            onClick={handleUpdate} 
            disabled={loading}
        >
            {loading ? '수정 중...' : '수정하기'} 
        </button>

      </main>
    </div>
  );
};

export default PostEdit;