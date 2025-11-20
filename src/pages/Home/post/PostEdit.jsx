import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext'; 
import './Post.css'; 
// Header는 안 쓰는 것 같아 일단 주석 처리하거나 유지
// import Header from '../../../components/Header/Header';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const PostEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('FRIENDS'); // 기본값
  const [originalMedia, setOriginalMedia] = useState([]); // 기존 미디어 정보 저장용

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
            // 내 글 확인
            if (p.author?.id !== user?.id) {
                alert("수정 권한이 없습니다.");
                navigate(-1);
                return;
            }
            // 데이터 채우기
            setContent(p.caption || '');
            setVisibility(p.visibility || 'FRIENDS'); // 서버에서 받은 공개범위
            
            // ★ 중요: 기존 미디어 정보를 저장해둬야 수정할 때 다시 보낼 수 있음
            // API가 요구하는 형식(media_id, object_type, position)으로 변환해서 저장
            if (p.media && Array.isArray(p.media)) {
                const formattedMedia = p.media.map((m, index) => ({
                    media_id: m.media_id || m.id, // API 응답 필드명 확인 필요
                    object_type: "MEDIA", // 예시에 따라 소문자/대문자 확인 (보통 MEDIA)
                    position: index + 1
                }));
                setOriginalMedia(formattedMedia);
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

  // 수정하기 (PATCH)
  const handleUpdate = async () => {
    if (!confirm("게시물을 수정하시겠습니까?")) return;

    // ★ 수정할 데이터 구성 (API 스펙 준수)
    const payload = {
        caption: content,        // 내용 수정
        visibility: visibility,  // 공개범위 수정
        media: originalMedia     // 미디어는 수정 안 하더라도 기존 것 그대로 전송
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
            navigate(`/home`, { replace: true });
        } else {
            // 에러 메시지를 띄워서 확인
            alert(`수정 실패: ${data.message}`); 
            console.log("Validation Error Detail:", data);
        }
    } catch (e) {
        console.error(e);
        alert("수정 중 오류 발생");
    }
  };

  // 삭제하기
  const handleDelete = async () => {
    if (!confirm("정말로 이 게시물을 삭제하시겠습니까?")) return;
    try {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.isSuccess) {
            alert("삭제되었습니다.");
            navigate('/home', { replace: true });
        } else {
            alert(data.message || "삭제 실패");
        }
    } catch (e) {
        console.error(e);
        alert("삭제 중 오류 발생");
    }
  };

  return (
    <div className="compose">
      <header className="compose-header">
        <button onClick={() => navigate(-1)}>취소</button>
        <div>게시물 수정</div>
        <button className="share" onClick={handleUpdate}>완료</button>
      </header>
      
      <main className="compose-body">
        {/* 내용 수정 */}
        <div className="form-row">
          <label>내용</label>
          <textarea 
              rows={6} 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
          />
        </div>

        {/* 공개범위 수정  */}
        <div className="form-row">
          <label>공개범위</label>
          <select 
              value={visibility} 
              onChange={(e) => setVisibility(e.target.value)}
          >
             <option value="FRIENDS">친구 공개</option>
             <option value="PRIVATE">비공개</option>
          </select>
        </div>

        {/* 삭제 버튼 */}
        <div className="delete-section">
            <button onClick={handleDelete} className="delete-btn">
                게시물 삭제
            </button>
        </div>
      </main>
    </div>
  );
};

export default PostEdit;