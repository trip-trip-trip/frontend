import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function PostCreate() {
  const nav = useNavigate();

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [title, setTitle] = useState('');
  const [locationText, setLocationText] = useState('');
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState('friends');

  const [loading, setLoading] = useState(false);

  // ⭐ 업로드된 media_id 리스트
  const [mediaIds, setMediaIds] = useState([]);

  const canShare = useMemo(() => previews.length > 0 && !loading, [previews, loading]);

  // -------------------------------
  // 1) 주소 → 좌표 변환
  // -------------------------------
  async function geocodeAddress(address) {
    if (!address || !MAPS_KEY) return { lat: null, lng: null };

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${MAPS_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK') {
        const loc = data.results[0].geometry.location;
        return { lat: loc.lat, lng: loc.lng };
      }
    } catch (e) {
      console.error('Geocoding 실패:', e);
    }
    return { lat: null, lng: null };
  }

  // -------------------------------
  // 2) 이미지 선택 → 미리보기
  // -------------------------------
  const onPick = async (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length === 0) return;

    const all = [...files, ...selected];
    setFiles(all);

    const previewList = await Promise.all(
      all.map(
        (file) =>
          new Promise((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result);
            r.readAsDataURL(file);
          })
      )
    );
    setPreviews(previewList);
  };

  // -------------------------------
  // 3) 이미지 서버 업로드
  // -------------------------------
  async function uploadMedia(files) {
    const uploaded = [];

    for (const file of files) {
      const form = new FormData();
      form.append('file', file);

      const token = localStorage.getItem('jwtToken');

      const res = await fetch(`${API_BASE}/media/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await res.json();

      if (!res.ok || !data.isSuccess) {
        throw new Error('미디어 업로드 실패');
      }

      uploaded.push(data.result.media_id); // 서버에서 반환하는 media_id
    }

    return uploaded;
  }

  // -------------------------------
  // 4) 게시물 공유
  // -------------------------------
  const share = async () => {
    if (!canShare) return;

    setLoading(true);

    try {
      // (1) 위치 좌표 변환
      let lat = null;
      let lng = null;

      if (locationText) {
        const r = await geocodeAddress(locationText);
        lat = r.lat;
        lng = r.lng;
      }

      // (2) 이미지 업로드 → media_id 획득
      const uploadedMediaIds = await uploadMedia(files);
      setMediaIds(uploadedMediaIds);

      // (3) POST /posts 호출
      const visibilityMap = {
        friends: 'friends',
        private: 'private',
        public: 'public',
      };

      const payload = {
        tripId: 10, // 나중에 실제값
        visibility: visibilityMap[privacy] || 'friends',
        caption: content || title,
        location_text: locationText,
        lat,
        lng,
        media: uploadedMediaIds.map((id) => ({
          media_id: id,
          object_type: 'MEDIA',
        })),
      };

      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.isSuccess) {
        alert(data.message || '게시물 업로드 실패');
        return;
      }

      alert('게시물 업로드 성공!');
      nav('/home', { replace: true });
    } catch (e) {
      console.error('업로드 오류:', e);
      alert('업로드 중 오류 발생');
    }

    setLoading(false);
  };

  return (
    <div className="compose">
      <header className="compose-header">
        <button onClick={() => nav(-1)}>←</button>
        <div>새 게시물</div>
        <button className="share" disabled={!canShare} onClick={share}>
          {loading ? '업로드...' : '공유'}
        </button>
      </header>

      <main className="compose-body">
        {/* 이미지 썸네일 */}
        <div className="picker-row">
          <div className="preview-multi">
            {previews.map((p, i) => (
              <img key={i} src={p} className="preview-thumb" />
            ))}

            <label className="add-thumb-btn">
              +
              <input type="file" hidden multiple onChange={onPick} />
            </label>
          </div>
        </div>

        <div className="form-row">
          <label>제목</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="form-row">
          <label>위치</label>
          <input value={locationText} onChange={(e) => setLocationText(e.target.value)} />
        </div>

        <div className="form-row">
          <label>내용</label>
          <textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
        </div>

        <div className="form-row">
          <label>공개범위</label>
          <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
            <option value="friends">친구만</option>
            <option value="private">비공개</option>
          </select>
        </div>
      </main>
    </div>
  );
}


// import React, { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Post.css';

// const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';
// const LS_KEY = 'tripshot_posts';

// // ⚠️ 경고: Geocoding 함수는 보안상 서버 측에서 실행하는 것이 권장됩니다.
// async function geocodeAddress(address) {
//     if (!address || !MAPS_KEY) return { lat: null, lng: null };
//     const endpoint = 'https://maps.googleapis.com/maps/api/geocode/json';
//     const url = `${endpoint}?address=${encodeURIComponent(address)}&key=${MAPS_KEY}`;
//     try {
//         const res = await fetch(url);
//         const data = await res.json();
//         if (data.status === 'OK' && data.results.length > 0) {
//             const { lat, lng } = data.results[0].geometry.location;
//             return { lat, lng };
//         }
//     } catch (e) {
//         console.error("Geocoding failed:", e);
//     }
//     return { lat: null, lng: null };
// }

// export default function PostCreate() {
//   const nav = useNavigate();

//   const readPosts = () => {
//     try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
//     catch { return []; }
//   };
//   const writePosts = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));

//   // form states
//   const [files, setFiles] = useState([]);
//   const [previews, setPreviews] = useState([]);
//   const [title, setTitle] = useState('');
//   const [locationText, setLocationText] = useState('');
//   const [content, setContent] = useState('');
//   const [privacy, setPrivacy] = useState('friends');
//   const [loading, setLoading] = useState(false);
  
//   // 테스트용 ID (실제는 서버에서 받아와야 함)
//   const [tripId, setTripId] = useState(20); 
//   const [mediaIds, setMediaIds] = useState([30, 31]); 

//   const canShare = useMemo(() => previews.length > 0 && !loading, [previews.length, loading]);

//   // 이미지 선택 및 다중 파일 미리보기 처리
//   const onPick = async (e) => {
//     const selected = Array.from(e.target.files);
//     if (selected.length === 0) return;

//     const allFiles = [...files, ...selected];
//     setFiles(allFiles);

//     // 테스트용 mediaId 생성
//     setMediaIds(allFiles.map((_, idx) => 30 + idx)); 

//     // FileReader를 Promise로 변환하여 병렬 로드
//     const readers = allFiles.map(file => 
//       new Promise((resolve) => {
//         const r = new FileReader();
//         r.onload = () => resolve(r.result);
//         r.readAsDataURL(file);
//       })
//     );

//     const previewResults = await Promise.all(readers);
//     setPreviews(previewResults);
//   };

//   // 게시물 공유 (API 호출 및 로컬 저장)
//   const share = async () => {
//     if (!canShare) {
//       alert('사진을 선택해주세요!');
//       return;
//     }
    
//     setLoading(true);

//     let lat = null;
//     let lng = null;
//     let apiSuccess = false;

//     try {
//         // 1. Geocoding 수행 (좌표 변환)
//         if (locationText) {
//             const loc = await geocodeAddress(locationText);
//             lat = loc.lat;
//             lng = loc.lng;
//         }

//         // 2. API Payload 구성
//         const visibilityMap = { 'friends': 'FRIENDS', 'private': 'PRIVATE' };
//         const apiVisibility = visibilityMap[privacy] || 'FRIENDS';
//         const mediaPayload = mediaIds.map(id => ({ media_id: id, object_type: "MEDIA" }));
        
//         const apiPayload = {
//             tripId: tripId,
//             visibility: apiVisibility,
//             caption: content || title,
//             media: mediaPayload,
//             location_text: locationText, 
//             lat: lat,
//             lng: lng,
//         };

//         const jwtToken = sessionStorage.getItem('auth.jwt');
        
//         // 3. API 호출 (POST 요청)
//         const response = await fetch(`${API_BASE}/posts`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${jwtToken || ''}` // JWT 토큰 포함
//             },
//             body: JSON.stringify(apiPayload),
//         });

//         const data = await response.json();
        
//         if (response.ok && data.isSuccess) {
//             console.log('API 게시물 등록 성공:', data);
//             apiSuccess = true;
//         } else {
//             console.error('API 게시물 등록 실패:', data);
//             alert('게시물 등록에 실패했습니다: ' + (data.message || 'API 오류'));
//         }

//     } catch (e) {
//         console.error('API 통신 실패:', e);
//         alert('서버와 통신하는 데 실패했습니다.');

//     } finally {
//         // 4. 로컬 저장소 저장 (API 실패 대비)
//         try {
//             const posts = readPosts();
//             posts.unshift({
//                 id: String(Date.now()),
//                 userName: 'me',
//                 author_avatar: 'https://placehold.co/48x48/CCCCCC/FFF?text=ME',
//                 images: previews,
//                 title,
//                 content,
//                 location: locationText,
//                 lat: lat,
//                 lng: lng,
//                 privacy,
//                 likes: 0,
//                 comments: 0,
//                 is_liked: false,
//                 createdAt: Date.now(),
//             });
//             writePosts(posts);
//         } catch (e) {
//             console.error('Local storage save failed:', e);
//         }

//         // 5. 홈으로 이동
//         if (apiSuccess || !API_BASE) {
//             nav('/home', { replace: true });
//         }
        
//         setLoading(false);
//     }
//   };

//   return (
//     <div className="compose">
//       <header className="compose-header">
//         <button onClick={() => nav(-1)} aria-label="뒤로">←</button>
//         <div>새 게시물</div>
//         <button className="share" disabled={!canShare} onClick={share}>
//           {loading ? '업로드…' : '공유'}
//         </button>
//       </header>

//       <main className="compose-body">

//         {/* 이미지 미리보기 + 플러스 버튼 */}
//         <div className="picker-row">
//           <div className="preview-multi">

//             {/* 기존 이미지 썸네일 */}
//             {previews.map((p, i) => (
//               <div key={i} className="preview-thumb-wrapper">
//                 <img src={p} alt={`preview ${i}`} className="preview-thumb" />
//               </div>
//             ))}

//             {/* ➕ 추가 버튼 */}
//             <label className="add-thumb-btn">
//               +
//               <input
//                 type="file"
//                 multiple
//                 accept="image/*,video/*"
//                 hidden
//                 onChange={onPick}
//               />
//             </label>
//           </div>
//         </div>

//         {/* 제목 */}
//         <div className="form-row">
//           <label>제목</label>
//           <input
//             placeholder="제목(선택)"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//           />
//         </div>

//         {/* 위치 */}
//         <div className="form-row">
//           <label>위치</label>
//           <input
//             placeholder="예: 서울 종로구 / 도쿄 시부야"
//             value={locationText}
//             onChange={(e) => setLocationText(e.target.value)}
//           />
//         </div>

//         {/* 내용 */}
//         <div className="form-row">
//           <label>내용</label>
//           <textarea
//             rows={4}
//             placeholder="오늘의 여행은 어떠셨나요?"
//             value={content}
//             onChange={(e) => setContent(e.target.value)}
//           />
//         </div>

//         {/* 공개 설정 */}
//         <div className="form-row">
//           <label>공개설정</label>
//           <div className="radios">
//             <label>
//               <input
//                 type="radio"
//                 value="friends"
//                 checked={privacy === 'friends'}
//                 onChange={() => setPrivacy('friends')}
//               /> 친구만
//             </label>
//             <label>
//               <input
//                 type="radio"
//                 value="private"
//                 checked={privacy === 'private'}
//                 onChange={() => setPrivacy('private')}
//               /> 비공개
//             </label>
//           </div>
//         </div>

//         {/* 테스트용 */}
//         <div className="form-row">
//           <label>Trip ID / Media IDs (TEST)</label>
//           <div style={{ display: 'flex', gap: '10px' }}>
//             <input
//               placeholder="Trip ID"
//               type="number"
//               value={tripId}
//               onChange={(e) => setTripId(Number(e.target.value))}
//             />
//             <input
//               placeholder="Media IDs"
//               readOnly
//               value={mediaIds.join(', ')}
//             />
//           </div>
//         </div>

//       </main>
//     </div>
//   );
// }

