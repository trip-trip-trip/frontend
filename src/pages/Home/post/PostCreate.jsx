import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import './PostCreate.css'; // CSS 파일명 변경 추천
import default_pic from '../../../assets/default_pic.jpg';
import { useAuth } from '../../../contexts/AuthContext';
import Navbar from '../../../components/NavBar/NavBar';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const MOCK_DATA = [
  {
    trip: {
      id: 1,
      title: "어쩌구저쩌구 여행 1",
      startDate: "2025.01.01",
      endDate: "2025.01.15",
      inviteesNameList: [
        "https://placehold.co/100x100/orange/white?text=A",
        "https://placehold.co/100x100/green/white?text=B",
        "https://placehold.co/100x100/blue/white?text=C"
      ],
    },
    contents: {
      photos: Array.from({ length: 20 }).map((_, i) => ({
        media: {
          mediaAssetId: 100 + i,
          url: `https://placehold.co/400x400/525B65/white?text=Photo${i+1}`, 
          // 실제 사진 느낌을 원하면 아래 URL 사용 (랜덤 이미지)
          // url: `https://picsum.photos/400/400?random=${i}` 
        }
      })),
      reelItems: [],
      scrapbooks: []
    }
  },
  {
    trip: {
      id: 2,
      title: "오사카 맛집 탐방",
      startDate: "2025.02.10",
      endDate: "2025.02.14",
      inviteesNameList: ["https://placehold.co/100"],
    },
    contents: { photos: [], reelItems: [], scrapbooks: [] }
  }
];

export default function PostCreate() {
  const navigate = useNavigate();
  const token = useAuth(); // 토큰 가져오기

  // --- 상태 관리 ---
  const [step, setStep] = useState(1); // 1: 여행선택, 2: 미디어선택, 3: 글작성
  
  const [myTripsData, setMyTripsData] = useState([]); // API로 받아온 원본 데이터 리스트
  
  // 사용자 선택 상태
  const [selectedTripData, setSelectedTripData] = useState(null); // 선택된 여행의 전체 데이터 (trip + contents)
  const [selectedMedia, setSelectedMedia] = useState([]); // 선택된 미디어 객체들
  const [filterType, setFilterType] = useState('ALL'); // ALL, PHOTO, VIDEO, SCRAPBOOK
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMyTripsData(MOCK_DATA);
  //   const fetchMyTrips = async () => {
  //     try {
  //       const res = await fetch(`${API_BASE}/trips`, { // 혹은 보내주신 것처럼 /posts ?? 확인 필요. 보통은 /trips
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       const data = await res.json();
        
  //       if (data.isSuccess) {
  //         // 제공해주신 JSON 구조 그대로 저장 (result 배열)
  //         setMyTripsData(data.result || []);
  //       }
  //     } catch (e) {
  //       console.error("여행 목록 로드 실패", e);
  //     }
  //   };
  //   fetchMyTrips();
  // }, [token]);
}, []);

  // --- [Step 1 -> 2] 여행 선택 핸들러 ---
  const handleSelectTrip = (tripItem) => {
    // tripItem 구조: { trip: {...}, contents: {...} }
    setSelectedTripData(tripItem);
    setSelectedMedia([]); // 미디어 선택 초기화
    setStep(2);
  };

  // --- [Step 2] 미디어 필터링 및 평탄화 (Flatten) ---
  const filteredMedia = useMemo(() => {
    if (!selectedTripData || !selectedTripData.contents) return [];
    
    const { contents } = selectedTripData;
    let list = [];

    // JSON 구조: contents.photos[i].media 가 실제 데이터임
    if (contents.photos) {
        list = [...list, ...contents.photos.map(item => ({ ...item.media, type: 'PHOTO' }))];
    }
    if (contents.reelItems) {
        list = [...list, ...contents.reelItems.map(item => ({ ...item.media, type: 'VIDEO' }))];
    }
    if (contents.scrapbooks) {
        list = [...list, ...contents.scrapbooks.map(item => ({ ...item.media, type: 'SCRAPBOOK' }))];
    }

    if (filterType === 'ALL') return list;
    return list.filter(m => m.type === filterType);
  }, [selectedTripData, filterType]);

  // 미디어 선택 토글
  const toggleMedia = (media) => {
    setSelectedMedia(prev => {
      // mediaAssetId 기준으로 중복 체크
      const exists = prev.find(m => m.mediaAssetId === media.mediaAssetId);
      if (exists) {
        return prev.filter(m => m.mediaAssetId !== media.mediaAssetId);
      }
      return [...prev, media];
    });
  };

  // --- [Step 3] 최종 업로드 ---
  // const handleUpload = async () => {
  //   if (!content.trim()) return alert("코멘트를 작성해주세요.");
  //   if (!selectedTripData) return;

  //   setLoading(true);

  //   try {
  //     const payload = {
  //       tripId: selectedTripData.trip.id,
  //       visibility: isPrivate ? 'PRIVATE' : 'FRIENDS',
  //       caption: content,
  //       location_text: "", // 필요하다면 추가
  //       lat: null,
  //       lng: null,
  //       media: selectedMedia.map(m => ({
  //         media_id: m.mediaAssetId,
  //         // 서버가 기대하는 object_type에 맞춰 매핑
  //         object_type: m.type === 'SCRAPBOOK' ? 'SCRAPBOOK' : 'MEDIA' 
  //       }))
  //     };

  //     const res = await fetch(`${API_BASE}/posts`, {
  //       method: 'POST',
  //       headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(payload)
  //     });
      
  //     const data = await res.json();
  //     if (data.isSuccess) {
  //       alert("게시물이 등록되었습니다!");
  //       navigate('/home', { replace: true });
  //     } else {
  //       alert(data.message || "업로드 실패");
  //     }
  //   } catch (e) {
  //     console.error(e);
  //     alert("오류 발생");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleUpload = async () => {
    if (!content.trim()) return alert("코멘트를 작성해주세요.");
    
    // 로딩 흉내 1초
    setLoading(true);
    setTimeout(() => {
        alert("게시물이 등록되었습니다! (더미 테스트)");
        navigate('/home', { replace: true });
        setLoading(false);
    }, 1000);
  };

  // 헤더 타이틀 동적 변경
  const getTitle = () => {
    if(step === 1) return "여행 선택";
    if(step === 2) return "미디어 선택";
    return "게시물 작성";
  };

  return (
    <div className="post-create-container">
      <Header title={getTitle()}toBack={true} /> {/* Header에 onBackClick 연동 필요 */}

      <main className="post-body">
        
        {/* === STEP 1: 여행 선택 === */}
        {step === 1 && (
          <div className="step-trip-list">
            <h2 className="step-title">포스트를 게시할 여행을 선택해주세요</h2>
            <div className="trip-list">
              {myTripsData.map((item) => {
                const t = item.trip;
                const coverImg = item.contents?.photos?.[0]?.media?.url ||  default_pic;
                
                const members = t.inviteesNameList || [];

                return (
                    <div key={t.id} className="trip-item" onClick={() => handleSelectTrip(item)}>
                    <div className="trip-cover">
                        <img src={coverImg} alt="cover" onError={(e)=>e.target.src='/assets/default_cover.png'} />
                    </div>
                    <div className="trip-info">
                        <div className="trip-top-row">
                            {/* location 관련 필요 */}
                            <span className="trip-location">{t.title.split(' ')[1] || '여행'}</span> 
                            <span className="trip-date">{t.startDate} ~ {t.endDate}</span>
                        </div>
                        <div className="trip-title">{t.title}</div>
                        <div className="trip-members">
                        {members.slice(0, 3).map((url, i) => (
                            <img key={i} src={url} alt="member" className="member-avatar"/>
                        ))}
                        {members.length > 3 && <span className="member-more">+{members.length-3}</span>}
                        </div>
                    </div>
                    </div>
                );
              })}
            </div>
          </div>
        )}

        {/* === STEP 2: 미디어 선택 === */}
        {step === 2 && (
          <div className="step-media-select">
            <h2 className="step-title">포스트를 게시할 사진, 영상, 스크랩북을 선택해주세요</h2>
            <p className="step-subtitle">필터를 사용하여 원하는 미디어 목록을 볼 수 있어요.</p>
            
            <div className="filter-tabs">
                {['ALL', 'PHOTO', 'VIDEO', 'SCRAPBOOK'].map(type => (
                    <button 
                        key={type}
                        className={filterType === type ? 'active' : ''} 
                        onClick={()=>setFilterType(type)}
                    >
                        {type === 'ALL' ? '≡ 전체' : type === 'PHOTO' ? '사진' : type === 'VIDEO' ? '영상' : '스크랩북'}
                    </button>
                ))}
            </div>

            <div className="media-grid">
                {filteredMedia.length === 0 ? (
                    <div className="no-media-msg">선택 가능한 미디어가 없습니다.</div>
                ) : (
                    filteredMedia.map(m => {
                        const isSelected = selectedMedia.find(sel => sel.mediaAssetId === m.mediaAssetId);
                        return (
                            <div key={m.mediaAssetId} className={`media-item ${isSelected ? 'selected' : ''}`} onClick={()=>toggleMedia(m)}>
                                <img src={m.url} alt="media" />
                                {m.type === 'VIDEO' && <span className="video-badge">▶</span>}
                                {isSelected && <div className="check-overlay">✔</div>}
                            </div>
                        )
                    })
                )}
            </div>

            {/* 하단 선택 완료 시트 */}
            {selectedMedia.length > 0 && (
                <div className="bottom-sheet">
                    <div className="sheet-header">
                        <span>{selectedMedia.length}장 선택됨</span>
                    </div>
                    <div className="sheet-preview-list">
                        {selectedMedia.map(m => (
                            <div key={m.mediaAssetId} className="mini-preview-wrap">
                                <img src={m.url} alt="" className="mini-preview"/>
                                <button className="mini-delete" onClick={(e)=>{e.stopPropagation(); toggleMedia(m);}}>×</button>
                            </div>
                        ))}
                    </div>
                    <button className="next-btn" onClick={() => setStep(3)}>선택 완료</button>
                </div>
            )}
          </div>
        )}

        {/* === STEP 3: 글 작성 === */}
        {step === 3 && (
          <div className="step-write">
            <h2 className="step-title">코멘트를 작성해주세요</h2>
            
            <div className="write-preview-box">
               {selectedMedia.length > 0 && (
                   <div className="preview-image-main">
                        <img src={selectedMedia[0].url} alt="main" />
                   </div>
               )}
               <div className="preview-thumbnails">
                   {selectedMedia.map(m => (
                       <img key={m.mediaAssetId} src={m.url} alt="" className={m.mediaAssetId === selectedMedia[0].mediaAssetId ? 'active' : ''}/>
                   ))}
               </div>
            </div>

            <div className="privacy-check">
                <label>
                    <input type="checkbox" checked={isPrivate} onChange={(e)=>setIsPrivate(e.target.checked)} />
                    비공개 포스트로 올리기
                </label>
            </div>

            <textarea 
                className="comment-box" 
                placeholder="내용을 입력해주세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            ></textarea>

            <button className="submit-btn" onClick={handleUpload} disabled={loading}>
                {loading ? '게시 중...' : '게시하기!'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}