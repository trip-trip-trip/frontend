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