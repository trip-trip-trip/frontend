import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Post.css';


// 환경 변수에서 API 키 가져오기
const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000';

const LS_KEY = 'tripshot_posts';

// ⓐ 주소 → 좌표 변환 함수
async function geocodeAddress(address) {
  if (!address || !MAPS_KEY) return { lat: null, lng: null };

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${MAPS_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
  } catch (e) {
    console.error('Geocoding failed:', e);
  }

  return { lat: null, lng: null };
}

export default function PostCreate() {
  const nav = useNavigate();

  // localStorage 읽기/쓰기
  const readPosts = () => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    } catch {
      return [];
    }
  };
  const writePosts = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));

  // form state
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [title, setTitle] = useState('');
  const [locationText, setLocationText] = useState('');
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState('friends');
  const [loading, setLoading] = useState(false);

  const [tripId, setTripId] = useState(20);
  const [mediaIds, setMediaIds] = useState([]);

  // 업로드 가능 여부 체크
  const canShare = useMemo(() => previews.length > 0 && !loading, [previews.length, loading]);

  // ⓑ 이미지 선택
  const onPick = async (e) => {
  const selected = Array.from(e.target.files);
  if (selected.length === 0) return;

  const allFiles = [...files, ...selected];
  setFiles(allFiles);

  setMediaIds(allFiles.map((_, idx) => 30 + idx));

  // FileReader → Promise 기반
  const readers = allFiles.map(file => 
    new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(file);
    })
  );

  const previewResults = await Promise.all(readers);
  setPreviews(previewResults);
};


  // ⓒ 공유(업로드) 버튼
  const share = async () => {
    if (!canShare) {
      alert('사진을 선택해주세요!');
      return;
    }

    setLoading(true);

    let lat = null;
    let lng = null;

    // 위치가 있을 때만 좌표 변환
    if (locationText) {
      const loc = await geocodeAddress(locationText);
      lat = loc.lat;
      lng = loc.lng;
    }

    // ⭐ API 호출 비활성화 (로그인 안 했으므로)
    /*
    const jwtToken = sessionStorage.getItem('auth.jwt');
    try {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken || ''}`,
        },
        body: JSON.stringify({
          tripId,
          visibility: privacy === 'friends' ? 'FRIENDS' : 'PRIVATE',
          caption: content || title,
          media: mediaIds.map(id => ({ media_id: id, object_type: 'MEDIA' })),
          location_text: locationText,
          lat, lng,
        }),
      });
      const data = await response.json();
      console.log("API 결과:", data);
    } catch (e) {
      console.error("API 실패:", e);
    }
    */

    // ⭐ localStorage 저장
    const posts = readPosts();
    posts.unshift({
      id: String(Date.now()),
      userName: 'me',
      author_avatar: 'https://placehold.co/48x48/CCCCCC/FFF?text=ME',
      images: previews,
      title,
      content,
      location: locationText,
      lat,
      lng,
      privacy,
      likes: 0,
      comments: 0,
      is_liked: false,
      createdAt: Date.now(),
    });
    writePosts(posts);

    // 홈 이동
    nav('/home', { replace: true });

    setLoading(false);
  };

  return (
    <div className="compose">
      <header className="compose-header">
        <button onClick={() => nav(-1)} aria-label="뒤로">←</button>
        <div>새 게시물</div>
        <button className="share" disabled={!canShare} onClick={share}>
          {loading ? '업로드…' : '공유'}
        </button>
      </header>

      <main className="compose-body">

        {/* 이미지 미리보기 + 플러스 버튼 */}
        <div className="picker-row">
          <div className="preview-multi">

            {/* 기존 이미지 썸네일 */}
            {previews.map((p, i) => (
              <div key={i} className="preview-thumb-wrapper">
                <img src={p} className="preview-thumb" />
              </div>
            ))}

            {/* ➕ 추가 버튼 */}
            <label className="add-thumb-btn">
              +
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                hidden
                onChange={onPick}
              />
            </label>
          </div>
        </div>

        {/* 제목 */}
        <div className="form-row">
          <label>제목</label>
          <input
            placeholder="제목(선택)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 위치 */}
        <div className="form-row">
          <label>위치</label>
          <input
            placeholder="예: 서울 종로구 / 도쿄 시부야"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
          />
        </div>

        {/* 내용 */}
        <div className="form-row">
          <label>내용</label>
          <textarea
            rows={4}
            placeholder="오늘의 여행은 어떠셨나요?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* 공개 설정 */}
        <div className="form-row">
          <label>공개설정</label>
          <div className="radios">
            <label>
              <input
                type="radio"
                value="friends"
                checked={privacy === 'friends'}
                onChange={() => setPrivacy('friends')}
              /> 친구만
            </label>
            <label>
              <input
                type="radio"
                value="private"
                checked={privacy === 'private'}
                onChange={() => setPrivacy('private')}
              /> 비공개
            </label>
          </div>
        </div>

        {/* 테스트용 */}
        <div className="form-row">
          <label>Trip ID / Media IDs (TEST)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              placeholder="Trip ID"
              type="number"
              value={tripId}
              onChange={(e) => setTripId(Number(e.target.value))}
            />
            <input
              placeholder="Media IDs"
              readOnly
              value={mediaIds.join(', ')}
            />
          </div>
        </div>

      </main>
    </div>
  );
}
