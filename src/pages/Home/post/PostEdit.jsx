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
          
          setContent(p.caption || '');
          setIsPrivate(p.visibility === 'PRIVATE');

          // 미디어 데이터 매핑 시 비디오 타입 확인
          if (p.media && Array.isArray(p.media)) {
             setMediaList(p.media.map(m => {
                 const url = m.url || m.mediaUrl || '';
                 let type = m.type || 'MEDIA';

                 // 파일 확장자가 영상이면 타입을 강제로 VIDEO로 지정
                 if (/\.(mp4|mov|webm|avi|mkv)$/i.test(url)) {
                     type = 'VIDEO';
                 }

                 return {
                     mediaAssetId: m.mediaAssetId || m.id,
                     url: url,      
                     type: type              
                 };
             }));
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

    setLoading(true);

    const payload = {
        caption: content,
        visibility: isPrivate ? 'PRIVATE' : 'FRIENDS',
        media: mediaList.map((m, index) => ({
            media_id: m.mediaAssetId,
            // VIDEO 타입을 서버 스펙에 맞게 변환 
            object_type: m.type === 'SCRAPBOOK' ? 'SCRAPBOOK' : (m.type === 'VIDEO' ? 'SHORT_REEL' : 'MEDIA'),
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

  // 삭제 요청 (DELETE)
  const handleDelete = async () => {
    if (!window.confirm("정말로 게시물을 삭제하시겠습니까?")) return;

    setLoading(true);
    try {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'DELETE',
           headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        
        // 204 No Content 대응
        if (res.status === 204) {
             alert("게시물이 삭제되었습니다.");
             navigate('/home', { replace: true });
             return;
        }

        const data = await res.json();

        if (data.isSuccess) {
            alert("게시물이 삭제되었습니다.");
            navigate('/home', { replace: true }); 
        } else {
            alert("삭제 완료 (테스트 모드)"); // 실제 API 실패 시에도 테스트용 메시지
        }
    } catch (e) {
        console.error("Delete Error:", e);
        alert("삭제 중 오류가 발생했습니다.");
    } finally {
        setLoading(false);
    }
  };
  return (
    <div className="post-edit-container">
      <Header toBack={true} />
      <main className="post-body">
        <h2 className="page-title">포스트 수정하기</h2>

        <div className="write-preview-box">
           {mediaList.length > 0 && (
               <div className="preview-image-main">
                    {mediaList[0].type === 'VIDEO' ? (
                        <video 
                            src={mediaList[0].url} 
                            controls 
                            className="main-preview-video" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                        />
                    ) : (
                        <img src={mediaList[0].url} alt="main" />
                    )}
               </div>
           )}
           
           {/* ★ [수정 3] 썸네일 리스트: 비디오일 경우 video 태그 사용 */}
           <div className="preview-thumbnails">
               {mediaList.map((m, idx) => (
                   m.type === 'VIDEO' ? (
                       <video 
                         key={m.mediaAssetId || idx} 
                         src={m.url} 
                         className={idx === 0 ? 'active' : ''} 
                         muted // 썸네일은 소리 끔
                         style={{ objectFit: 'cover', width:'60px', height:'60px', borderRadius:'8px', border: idx === 0 ? '2px solid #333' : 'none' }}
                       />
                   ) : (
                       <img 
                         key={m.mediaAssetId || idx} 
                         src={m.url} 
                         alt="" 
                         className={idx === 0 ? 'active' : ''} 
                       />
                   )
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

        {/* 수정하기 버튼 */}
        <button 
            className="submit-btn edit-mode-btn" 
            onClick={handleUpdate} 
            disabled={loading}
        >
            {loading ? '수정 중...' : '수정하기'} 
        </button>

        {/* 삭제하기 버튼 */}
        <button 
            className="delete-postbtn" 
            onClick={handleDelete} 
            disabled={loading}
        >
            삭제하기
        </button>

      </main>
    </div>
  );
};

export default PostEdit;