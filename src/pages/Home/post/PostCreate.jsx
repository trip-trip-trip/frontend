import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import './PostCreate.css'; 
import { useAuth } from '../../../contexts/AuthContext';
import Navbar from '../../../components/NavBar/NavBar';
import default_pic from "../../../assets/default-profile.png";

const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';

export default function PostCreate() {
  const navigate = useNavigate();
  const { token } = useAuth(); 

  // --- 상태 관리 ---
  const [step, setStep] = useState(1); // 1: 여행선택, 2: 미디어선택, 3: 글작성
  
  const [myTripsData, setMyTripsData] = useState([]); 
  const [selectedTripData, setSelectedTripData] = useState(null); 
  const [selectedMedia, setSelectedMedia] = useState([]); 
  const [filterType, setFilterType] = useState('ALL'); 
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  // 여행 목록 불러오기
  useEffect(() => {
    const fetchMyTrips = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/trips?completedOnly=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        if (data.isSuccess) {
          setMyTripsData(data.result || []);
        }
      } catch (e) {
        console.error("여행 목록 로드 실패", e);
      }
    };
    fetchMyTrips();
  }, [token]);

  // --- [Step 1 -> 2] 여행 선택 핸들러 ---
  const handleSelectTrip = (tripItem) => {
    setSelectedTripData(tripItem);
    setSelectedMedia([]); 
    setStep(2);
  };
  
  // --- [Step 2] 미디어 필터링 및 평탄화 ---
  const filteredMedia = useMemo(() => {
    if (!selectedTripData || !selectedTripData.contents) return [];
    
    const { contents } = selectedTripData;
    let list = [];

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
      const exists = prev.find(m => m.mediaAssetId === media.mediaAssetId);
      if (exists) {
        return prev.filter(m => m.mediaAssetId !== media.mediaAssetId);
      }
      return [...prev, media];
    });
  };

  // --- [Step 3] 최종 업로드 ---
  const handleUpload = async () => {
    if (!content.trim()) return alert("코멘트를 작성해주세요.");
    if (!selectedTripData) return;

    setLoading(true);

    try {
      const payload = {
        tripId: selectedTripData.trip.id,
        visibility: isPrivate ? 'PRIVATE' : 'FRIENDS',
        caption: content,
        location_text: selectedTripData.trip.placeName || "",
        lat: selectedTripData.trip.lat || null,
        lng: selectedTripData.trip.lng || null,
        media: selectedMedia.map(m => {
          let objectType = 'MEDIA'; 

          if (m.type === 'VIDEO') objectType = 'SHORT_REEL';
          else if (m.type === 'SCRAPBOOK') objectType = 'SCRAPBOOK';

          return {
             media_id: m.mediaAssetId,
             object_type: objectType 
          }
        })
      };

      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.isSuccess) {
        alert("게시물이 등록되었습니다!");
        navigate('/home', { replace: true });
      } else {
        alert(data.message || "업로드 실패");
      }
    } catch (e) {
      console.error(e);
      alert("오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // 헤더 타이틀 & 뒤로가기
  const getTitle = () => {
    if(step === 1) return "여행 선택";
    if(step === 2) return "미디어 선택";
    return "게시물 작성";
  };

  const handleBackClick = () => {
      if (step > 1) {
          setStep(step - 1); 
      } else {
          navigate(-1); 
      }
  };

  return (
    <div className="post-create-container">
      <Header title={getTitle()} toBack={true} onBackClick={handleBackClick} /> 

      <main className="post-body">
        
        {/* === STEP 1: 여행 선택 === */}
        {step === 1 && (
          <div className="step-trip-list">
            <h2 className="step-title">포스트를 게시할 여행을 선택해주세요</h2>
            <div className="trip-list">
              {myTripsData.map((item) => {
                const t = item.trip;
                const coverImg = item.contents?.photos?.[0]?.media?.url || default_pic;
                
                // 빈 값 제거 및 친구가 있는 경우만 표시하기 위한 로직
                const members = (t.inviteesProfileImgList || []).filter(url => url && url.trim() !== "");

                return (
                    <div key={t.id} className="trip-item" onClick={() => handleSelectTrip(item)}>
                        <div className="trip-cover">
                            <img src={coverImg} alt="cover" onError={(e)=>e.target.src=default_pic} />
                        </div>
                        <div className="trip-info">
                            <div className="trip-top-row">
                                <span className="trip-location">{t.placeName || '여행'}</span> 
                                <span className="trip-date">{t.startDate} ~ {t.endDate}</span>
                            </div>
                            <div className="trip-title">{t.title}</div>
                            
                            {/* 친구 프사 영역: members가 있을 때만 렌더링 */}
                            {members.length > 0 && (
                                <div className="trip-members">
                                  {members.slice(0, 3).map((url, i) => (
                                    <img 
                                        key={i} 
                                        src={url} 
                                        alt="member" 
                                        className="member-avatar"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  ))}
                                  {members.length > 3 && <span className="member-more">+{members.length-3}</span>}
                                </div>
                            )}
                        </div>
                    </div>
                );
              })}
            </div>
            {myTripsData.length === 0 && (
                <div style={{textAlign: 'center', marginTop: '50px', color: '#999'}}>
                    작성 가능한(완료된) 여행이 없습니다.
                </div>
            )}
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
                                {m.type === 'VIDEO' ? (
                                    <video src={m.url} className="grid-video" muted />
                                ) : (
                                    <img src={m.url} alt="media" />
                                )}
                                {m.type === 'VIDEO' && <span className="video-badge">▶</span>}
                                {isSelected && <div className="check-overlay">✔</div>}
                            </div>
                        )
                    })
                )}
            </div>

            {selectedMedia.length > 0 && (
                <div className="bottom-sheet">
                    <div className="sheet-header">
                        <span>{selectedMedia.length}장 선택됨</span>
                    </div>
                    <div className="sheet-preview-list">
                        {selectedMedia.map(m => (
                            <div key={m.mediaAssetId} className="mini-preview-wrap">
                                {m.type === 'VIDEO' ? (
                                    <video src={m.url} className="mini-preview" muted />
                                ) : (
                                    <img src={m.url} alt="" className="mini-preview"/>
                                )}
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
                       {selectedMedia[0].type === 'VIDEO' ? (
                            <video src={selectedMedia[0].url} controls autoPlay muted className="main-video-preview" />
                       ) : (
                            <img src={selectedMedia[0].url} alt="main" />
                       )}
                   </div>
               )}
               <div className="preview-thumbnails">
                   {selectedMedia.map(m => (
                       m.type === 'VIDEO' ? (
                           <video 
                               key={m.mediaAssetId} 
                               src={m.url} 
                               className={`thumb-video ${m.mediaAssetId === selectedMedia[0].mediaAssetId ? 'active' : ''}`}
                               muted
                           />
                       ) : (
                           <img 
                               key={m.mediaAssetId} 
                               src={m.url} 
                               alt="" 
                               className={m.mediaAssetId === selectedMedia[0].mediaAssetId ? 'active' : ''}
                           />
                       )
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
