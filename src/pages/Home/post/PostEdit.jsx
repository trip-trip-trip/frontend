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
  // const handleDelete = async () => {
  //   if (!window.confirm("정말로 게시물을 삭제하시겠습니까?")) return;

  //   setLoading(true);
  //   try {
  //       const res = await fetch(`${API_BASE}/posts/${id}`, {
  //           method: 'DELETE',
  //           headers: { 
  //               'Authorization': `Bearer ${token}`
  //           }
  //       });
        
  //       // 응답 텍스트를 먼저 가져옵니다. (JSON 파싱 에러 방지)
  //       const text = await res.text(); 
  //       let data = null;
  //       try {
  //           data = JSON.parse(text);
  //       } catch (e) {
  //           // JSON이 아님 (빈 응답일 수 있음) -> 성공으로 간주
  //       }

  //       // HTTP 상태 코드가 실패(400, 500 등)인 경우
  //       if (!res.ok) {
  //           throw new Error((data && data.message) || "삭제 요청이 실패했습니다.");
  //       }

  //       // HTTP는 성공(200)이지만, 서버가 논리적 실패(isSuccess: false)를 보낸 경우 ★ [이게 원인일 확률 높음]
  //       if (data && data.isSuccess === false) {
  //           throw new Error(data.message || "게시물을 삭제하지 못했습니다.");
  //       }

  //       // 진짜 성공
  //       alert("게시물이 삭제되었습니다.");
  //       navigate('/home', { replace: true }); 

  //   } catch (e) {
  //       console.error("Delete Error:", e);
  //       // 사용자에게 진짜 에러 메시지를 보여줍니다.
  //       alert(e.message || "삭제 중 오류가 발생했습니다.");
  //   } finally {
  //       setLoading(false);
  //   }
  // };
  const handleDelete = async () => {
    if (!window.confirm("정말로 게시물을 삭제하시겠습니까?")) return;

    setLoading(true);
    try {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await res.json();

        if (data.isSuccess) {
            alert("게시물이 삭제되었습니다.");
            navigate('/home', { replace: true }); 
        } else {
            // 실패 시 서버 메시지 출력
            alert(`삭제 실패: ${data.message}`);
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