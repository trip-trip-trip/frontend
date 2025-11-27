import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './SharePhoto.css';
import shared_icon from '/icons/shared_icon.png';
import Header from '../../components/Header/Header';
import Navbar from '../../components/NavBar/NavBar';
import { useAuth } from '../../contexts/AuthContext';


const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';

const SharePhoto = () => {
    // 상태 정의
    const { tripId } = useParams();
    const navigate = useNavigate();
    
    const [allMedia, setAllMedia] = useState([]);
    const [prevSelected, setPrevSelected] = useState([]);
    const [selectedMediaIds, setSelectedMediaIds] = useState([]);
    const [changedMediaIds, setChangedMediaIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const {token} = useAuth();
    
     //여행 상세정보
    const fetchMedia = async () => {
        setIsLoading(true);
        try {
        const response = await fetch(
            `${API_BASE}/trips/${tripId}`,
            {
            method: "GET",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            }
        );

        if (!response.ok) {
            throw new Error(`여행 상세정보 조회 실패: ${response.status}`);
        }
        const data = await response.json();
        const fetchedMedia = data.result.contents;

        // PHOTO, SCRAPBOOK, REEL 미디어를 하나의 목록으로 통합
        const aggregatedMedia = [
            ...(fetchedMedia.photos||[]).map(p => p.media),
            ...(fetchedMedia.scrapbooks||[]).map(s => s.media).filter(m => m !== null),
            ...(fetchedMedia.reelItems||[]).map(r => r.media).filter(m => m !== null),
            ...(fetchedMedia.reel && fetchedMedia.reel.media !== null ? 
              [fetchedMedia.reel.media]
              : 
              [])
        ].map(media => ({
            mediaAssetId: media.mediaAssetId,
            url: media.url,
            isShared: media.isShared,
            contentType: media.contentType
        }));

        setAllMedia(aggregatedMedia);
        
        // 초기 선택 상태 설정: 현재 isShared=true 인 미디어를 선택 상태로 설정
        const initiallySharedIds = aggregatedMedia
            .filter(media => media.isShared)
            .map(media => media.mediaAssetId);
        
        setPrevSelected(initiallySharedIds);
        setSelectedMediaIds(initiallySharedIds);

        } catch (error) {
            console.error("Error fetching trip data:", error);
        } finally{
            setIsLoading(false);
        }
    };

    useEffect(() => {
      if (token && tripId) {
        fetchMedia();
      }
    }, [token, tripId]);


    // 이미지 개별 선택/선택 해제
    const handleSelectShare = (mediaAssetId) => {
        setSelectedMediaIds(prev => {
            const isSelected = prev.includes(mediaAssetId);
            if (isSelected) {
                return prev.filter(id => id !== mediaAssetId); // 선택 해제
            } else {
                return [...prev, mediaAssetId]; // 선택
            }
        });
    };

    // 전체 선택/전체 해제
    const handleSelectAll = () => {
        const allIds = allMedia.map(m => m.mediaAssetId);

        // 현재 선택된 개수가 전체 개수보다 적으면 -> 전체 선택
        if (selectedMediaIds.length < allIds.length) {
            setSelectedMediaIds(allIds);
        } else { // 현재 전체 선택이거나 0개인 경우 -> 전체 해제
            setSelectedMediaIds([]);
        }
    };
    
    const handleShare = async () => {
      const changedMediaList = [];

      selectedMediaIds.forEach((m)=>{
        const selected = prevSelected.includes(m);
        if (!selected){
          changedMediaList.push(m);
        }
      })

      prevSelected.forEach((m)=>{
        const unselected = selectedMediaIds.includes(m);
        if (!unselected){
          changedMediaList.push(m);
        }
      })

        const requestBody = {
            sharedMediaIds: changedMediaList // 선택된 미디어 ID 목록
        };
        
        try {
            const response = await fetch(
                `${API_BASE}/trips/${tripId}/shared_media/toggle`,
                {
                    method: 'PATCH',
                    headers: {
                      "Content-type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestBody)
                }
            );
            
            const data = await response.json();

            if (response.ok && data.isSuccess) {
                alert(data.message);
                navigate(`/trips/detail/${tripId}`); // 성공 후 상세 페이지로 이동
            } else {
                throw new Error(data.message || `공유 상태 변경에 실패했습니다. (HTTP Status: ${response.status})`);
            }
        } catch (err) {
            const errorMessage = err.message || "네트워크 오류 또는 알 수 없는 에러가 발생했습니다.";
            alert(`공유 실패: ${errorMessage}`);
            console.error("공유 API 호출 에러:", err);
        }
    };

    // 로딩 및 에러 처리
    if (isLoading) {
      return(
        <div className='share-photo'>
          <Header/>
            <div className="ment">
              미디어를 불러오는 중입니다...
            </div>
          <Navbar/>
        </div>
      )
    }
    if (error) {
      return(
        <div className='share-photo'>
          <div className="ment">
            오류가 발생했습니다. 다시 시도해주세요.
          </div>
        </div>
      )
    }
    
    const isAllSelected = allMedia.length > 0 && selectedMediaIds.length === allMedia.length;

    return (
        <div className='share-photo'>
            <Header toBack={true} />
            <div className="share-photo-cont">
                <h1>여행 멤버들에게 사진을 공유해요</h1>
                <h3>멤버들은 공유된 사진으로 릴스, 스크랩북을 만들고 게시물을 올릴 수 있어요. 여행의 추억을 함께 간직해요!</h3>
                
                <div className="share-all">
                    <input 
                        type="checkbox" 
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                    />
                    <h2>전체 선택 ({selectedMediaIds.length}/{allMedia.length})</h2>
                </div>
                
                <div className='photo-grid-detail'>
                {allMedia.map((mediaItem) => {
                    const isSelected = selectedMediaIds.includes(mediaItem.mediaAssetId);
                    return (
                      <div 
                          key={mediaItem.mediaAssetId} 
                          className={`photo-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectShare(mediaItem.mediaAssetId)}
                      >
                        {
                          mediaItem.contentType === 'VIDEO'
                          ? <video src={mediaItem.url} alt={`미디어 ${mediaItem.mediaAssetId} (${mediaItem.contentType})`} />
                          : <img src={mediaItem.url} alt={`미디어 ${mediaItem.mediaAssetId} (${mediaItem.contentType})`} />
                        }
                        {
                          // 선택했을 때 (공유될 미디어)
                          isSelected && (
                            <div className="share-selected-overlay">
                              <div className='shared-link-icon'>
                                  <img src={shared_icon} alt="공유됨" />
                              </div>
                            </div>
                          )
                        }
                      </div>
                    );
                    })}
                </div>
                
            </div>
            {
              selectedMediaIds.length > 0 &&
              <div className="share-media-btn-cont">
                <button 
                  className='share-media-btn' 
                  onClick={handleShare}
                >
                  {`선택된 미디어 ${selectedMediaIds.length}개 공유하기`}
                </button>
              </div>
            }
            {/* <Navbar/> */}
        </div>
    );
}

export default SharePhoto;