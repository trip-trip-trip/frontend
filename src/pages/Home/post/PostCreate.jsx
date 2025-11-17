import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Post.css';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// 데모 데이터 
const MOCK_TRIP_LIST = [
  { id: 10, title: "2025 도쿄여행 🗼" },
  { id: 20, title: "부산맛집탐방 🍜" },
  { id: 21, title: "친구들과 졸업여행! 🎓" }
];
const MOCK_MEDIA_DATA = {
  10: {
    contents: {
      photos: [
        { media: { mediaAssetId: 101, contentType: 'PHOTO', url: 'https://placehold.co/400x400/e9c46a/264653?text=Tokyo1' } },
        { media: { mediaAssetId: 102, contentType: 'PHOTO', url: 'https://placehold.co/400x400/f4a261/264653?text=Tokyo2' } },
        { media: { mediaAssetId: 103, contentType: 'PHOTO', url: 'https://placehold.co/400x400/e76f51/264653?text=Tokyo3' } }
      ],
      scrapbooks: [
        { media: { mediaAssetId: 104, contentType: 'SCRAPBOOK', url: 'https://placehold.co/400x400/2a9d8f/ffffff?text=Scrapbook' } }
      ],
      reelItems: []
    }
  },
  20: {
    contents: {
      photos: [
        { media: { mediaAssetId: 201, contentType: 'PHOTO', url: 'https://placehold.co/400x400/ade8f4/000000?text=Busan1' } },
        { media: { mediaAssetId: 202, contentType: 'PHOTO', url: 'https://placehold.co/400x400/90e0ef/000000?text=Busan2' } }
      ],
      scrapbooks: [],
      reelItems: [
        { media: { mediaAssetId: 203, contentType: 'VIDEO', url: 'https://placehold.co/400x400/0077b6/ffffff?text=Reel1' } },
        { media: { mediaAssetId: 204, contentType: 'VIDEO', url: 'https://placehold.co/400x400/00b4d8/ffffff?text=Reel2' } }
      ]
    }
  },
  21: {
    contents: {
      photos: [
        { media: { mediaAssetId: 301, contentType: 'PHOTO', url: 'https://placehold.co/400x400/ffd6ff/000000?text=Graduation' } }
      ],
      scrapbooks: [],
      reelItems: []
    }
  }
};

export default function PostCreate() {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [locationText, setLocationText] = useState('');
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState('friends');
  const [loading, setLoading] = useState(false); // 미디어 로딩 + 공유 버튼 로딩
  
  const [myTrips, setMyTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);

  const [tripContents, setTripContents] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState([]);

  // 실제 API 로직을 위한 여행 목록 로딩 상태
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);

  // 여행 목록 불러오기
  useEffect(() => {
    
    const fetchMyTrips = async () => {
      setIsLoadingTrips(true);
      const token = localStorage.getItem('jwtToken');
      try {
        const res = await fetch(`${API_BASE}/trips`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.isSuccess) {
          const extractedTrips = data.result.map(tripPackage => ({
            id: tripPackage.trip.id,
            title: tripPackage.trip.title
          }));
          setMyTrips(extractedTrips || []);
        } else {
          throw new Error(data.message || '여행 목록 로드 실패');
        }
      } catch (e) {
        console.error('여행 목록 로드 실패:', e);
        alert(e.message);
      } finally {
        setIsLoadingTrips(false);
      }
    };
    fetchMyTrips();
    
    // setMyTrips(MOCK_TRIP_LIST);
  }, []);

  // 선택된 여행의 미디어 불러오기
  useEffect(() => {
    if (!selectedTripId) {
      setTripContents(null);
      setSelectedMedia([]);
      return;
    }

    
    const fetchTripMedia = async () => {
      setLoading(true);
      const token = localStorage.getItem('jwtToken');
      try {
        const res = await fetch(`${API_BASE}/trips/${selectedTripId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.isSuccess) {
          setTripContents(data.result.contents);
        } else {
          throw new Error(data.message || '미디어 로드 실패');
        }
      } catch (e) {
        console.error('Trip 미디어 로드 실패:', e);
        alert(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTripMedia();
    

    setLoading(true);
    const timer = setTimeout(() => {
      const data = MOCK_MEDIA_DATA[selectedTripId];
      if (data) {
        setTripContents(data.contents);
      } else {
        setTripContents(null);
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
    
  }, [selectedTripId]);

  const handleTripChange = (e) => {
    const newTripId = e.target.value;
    setSelectedTripId(newTripId ? Number(newTripId) : null);
  };

  const allMedia = useMemo(() => {
    if (!tripContents) return [];
    
    const photos = tripContents.photos.map(p => p.media);
    const scrapbooks = tripContents.scrapbooks.map(s => s.media);
    const reelItems = tripContents.reelItems.map(r => r.media);

    const mediaMap = new Map();
    [...photos, ...scrapbooks, ...reelItems].forEach(media => {
      if (media && media.mediaAssetId) {
        mediaMap.set(media.mediaAssetId, media);
      }
    });

    return Array.from(mediaMap.values());
  }, [tripContents]);

  const toggleMediaSelection = (media) => {
    setSelectedMedia((prev) => {
      const isSelected = prev.find(m => m.mediaAssetId === media.mediaAssetId);
      if (isSelected) {
        return prev.filter(m => m.mediaAssetId !== media.mediaAssetId);
      } else {
        return [...prev, media];
      }
    });
  };
  
  const canShare = useMemo(() => {
      return selectedMedia.length > 0 && !!selectedTripId && !loading;
  }, [selectedMedia, selectedTripId, loading]);

  async function geocodeAddress(address) {
    if (!address || !MAPS_KEY) {
      console.warn("Geocoding: 주소가 없거나 Maps API 키가 없습니다.");
      return { lat: null, lng: null };
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${MAPS_KEY}`;
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

  const share = async () => {
    if (!canShare) return;

    setLoading(true);

    try {
      // 실제 Geocoding 호출
      let lat = null;
      let lng = null;
      if (locationText) {
        const r = await geocodeAddress(locationText);
        lat = r.lat;
        lng = r.lng;
      }

      const visibilityMap = {
        friends: 'friends',
        private: 'private',
        public: 'public',
      };

      const payload = {
        tripId: selectedTripId,
        visibility: visibilityMap[privacy] || 'friends',
        caption: content || title,
        location_text: locationText,
        lat,
        lng,
        media: selectedMedia.map((media) => ({
          media_id: media.mediaAssetId,
          object_type: media.contentType,
        })),
      };

      console.log("--- 실제 API 호출: 공유 페이로드 ---", payload);

      // 실제 POST /posts API 호출
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
    <>
      <div className="compose">
        <header className="compose-header">
          <button onClick={() => nav(-1)}>←</button>
          <div>새 게시물</div>
          <button className="share" disabled={!canShare} onClick={share}>
            {loading ? '업로드...' : '공유'}
          </button>
        </header>

        <main className="compose-body">
          <div className="form-row">
            <select 
              className="trip-select"
              value={selectedTripId || ""} 
              onChange={handleTripChange}
              disabled={isLoadingTrips} //  실제 API 로드 시 드롭다운 비활성화
            >
              <option value="">
                {isLoadingTrips ? "여행 로딩 중..." : "클릭하여 여행 선택"}
              </option>
              {myTrips.map(trip => (
                <option key={trip.id} value={trip.id}>
                  {trip.title}
                </option>
              ))}
            </select>
          </div>

          <div className="picker-row">
            {loading && <div>미디어 불러오는 중...</div>}
             
            {selectedTripId && !loading && (
              <div className="media-picker-grid">
                {allMedia.length === 0 && (
                  <div>이 여행에는 미디어가 없습니다.</div>
                )}
                {allMedia.map((media) => {
                  const imageUrl = media.url.replace(/<|>/g, '');
                  const isSelected = !!selectedMedia.find(m => m.mediaAssetId === media.mediaAssetId);

                  return (
                    <div
                      key={media.mediaAssetId}
                      className={`media-thumb ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleMediaSelection(media)}
                    >
                      <img src={imageUrl} alt={media.comment || 'Trip Media'} />
                    </div>
                  );
                })}
              </div>
            )}
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
    </>
  );
}
