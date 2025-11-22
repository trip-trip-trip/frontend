import React, { useState } from 'react'; // useState import
import './SelectPic.css';
import SharedFriends from '../../../components/Album/sharedFriends';
import Header from '../../../components/Header/Header';
import Navbar from '../../../components/NavBar/NavBar';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useEffect } from 'react';

const API_BASE = import.meta.env.PROD 
? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
: '/api';

const SelectPic = () => {
    const [selectedPics, setSelectedPics] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const [completedTrips, setCompletedTrips] = useState([]);
    const todayDate = new Date().toISOString().split('T')[0];
    const [isLoading, setIsLoading] = useState(true); 
  
    const {token} = useAuth();

    const selectedPicNum = location.state?.selectedPicNum;
    const selectedFrameUrl = location.state?.selectedFrameUrl;
    const selectedFrameId = location.state?.selectedFrameId;
    const picList = location.state?.picList || [];

    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedTripTitle, setSelectedTripTitle] = useState('클릭하여 여행 선택');
    const [currentPicList, setCurrentPicList] = useState([]);
    const initialTripId = location.state?.tripId || null;

    if (!selectedPicNum || !selectedFrameUrl || !selectedFrameId) {
      console.log(selectedPicNum, selectedFrameUrl, selectedFrameId)
      // alert('선택된 프레임 정보가 없습니다. 프레임 선택 페이지로 돌아갑니다.');
  }


  useEffect(() => {
    async function fetchTrips() {
      setIsLoading(true);
      
      if (!token) {
        console.error("인증 토큰(accessToken)이 로컬 스토리지에 없습니다. 로그인 상태를 확인하세요.");
        setIsLoading(false);
        // navigate('/login');
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/trips`,
          {
            method: "GET",
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`여행 목록 조회 실패: ${response.status}`);
        }

        const data = await response.json();
        const fetchedTrips = data.result || [];

        let completedList =[];

        fetchedTrips.forEach(item => {
          const trip = item.trip;
          const contents = item.contents;
          const isCompleted = trip.endDate < todayDate;
          
          const tripData = {
            id: trip.id,
            title: trip.title,
            image: contents.photos.map(p => p.media.url),
            endDate: trip.endDate,
          };

          if (isCompleted) {
            completedList.push(tripData);
          } 
        });

        setCompletedTrips(completedList);

        // **초기 사진 목록 설정 로직**
        let initialTrip;

        if (initialTripId) {
            // 앨범에서 넘어온 경우: 해당 tripId의 여행 데이터를 찾음
            initialTrip = completedList.find(trip => trip.id === initialTripId);
        } else if (completedList.length > 0) {
            // 앨범에서 넘어오지 않은 경우: 가장 최근에 완료된 여행 (정렬 후 첫 번째 항목)
            initialTrip = completedList[0];
        }

        if (initialTrip) {
            setSelectedTripTitle(initialTrip.title);
            setCurrentPicList(initialTrip.image);
        }

      } catch (error) {
        console.error("Error fetching trips:", error);
      }finally{
        setIsLoading(false);
      }
    }
    fetchTrips();
  }, [token]);


    // 이미지 선택/선택 해제
    const handleSelectPic = (picUrl) => {
      // 이미 선택된건지 확인
      const isSelected = selectedPics.includes(picUrl);

      if (isSelected) {
          // 선택 해제
          setSelectedPics(prev => prev.filter(url => url !== picUrl));
      } else {
          // 선택 추가: 4장 미만일 때만 추가
          if (selectedPics.length < selectedPicNum) {
              setSelectedPics(prev => [...prev, picUrl]);
          } else {
              alert(`최대 ${selectedPicNum}장까지만 선택할 수 있습니다!`);
          }
      }
    };

    // 여행 선택 핸들러
    const handleTripSelect = (trip) => {
      setSelectedTripTitle(trip.title);
      setCurrentPicList(trip.image);
      setSelectedPics([]); // 여행이 바뀌면 선택된 사진 초기화
      setShowDropdown(false);
  }

    return (
        <div className='select-pic'>
          <Header toBack={true}/> 
          
          <div className="photo-pick-container">
              <img src={selectedFrameUrl} alt="" className='frame-preview'/>
              <div className="select-pic-title">
                  <h1>스크랩북에 넣을 사진을 고르세요</h1>
                  <p>총 {selectedPicNum}장의 사진을 골라주세요!</p>
                  <h3>템플릿의 분위기와 어울리는 사진을 고르면 멋진 스크랩북을 만들 수 있어요.</h3>
              </div>

              {/* 드롭다운 UI */}
              <div className='trip-select-dropdown'>
                <button className='dropdown-toggle' onClick={() => setShowDropdown(prev => !prev)}>
                  {selectedTripTitle}
                  <span className={`arrow ${showDropdown ? 'up' : 'down'}`}></span>
                </button>
                {showDropdown && (
                  <ul className='dropdown-menu'>
                    {completedTrips.map(trip => (
                      <li 
                        key={trip.id} 
                        onClick={() => handleTripSelect(trip)}
                        className={selectedTripTitle === trip.title ? 'selected' : ''}
                      >
                        {trip.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="next-btn-container">
                <button 
                  className={`next-button ${selectedPics.length === selectedPicNum ? 'active' : ''}`}
                  disabled={selectedPics.length !== selectedPicNum}
                  onClick={() => {
                    if (selectedPics.length === selectedPicNum) {
                      // 최종 스크랩북 생성 페이지로 이동
                      navigate('/scrapbook/complete', { 
                        state: { 
                          selectedPics: selectedPics,
                          selectedFrameId: selectedFrameId || 1, 
                          selectedPicNum: selectedPicNum || 4, // 프레임 ID가 없을 경우 임시 값 사용
                          selectedFrameUrl: selectedFrameUrl || '/frame1.PNG' // 프레임 URL이 없을 경우 임시 값 사용
                        } 
                      });
                    }
                  }}
              >
                  {(selectedPics.length === selectedPicNum) ? 
                    '스크랩북 만들기!':`${selectedPicNum}장의 사진을 골라주세요 (${selectedPics.length}/${selectedPicNum})`}
              </button>
              </div>

              <div className='photo-grid'>
                {currentPicList.map((media, index) => {
                  const picUrl = media.url;
                  const isSelected = selectedPics.includes(picUrl);
                  return (
                    <div 
                        key={index}
                        className={`photo-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectPic(picUrl)}
                    >
                      <img src={picUrl} alt={`여행 사진 ${index + 1}`} />
                      {
                        isSelected && (
                          <div className="selection-overlay">
                              <span className="check-icon">✓</span>
                          </div>
                        )
                      }
                    </div>
                  );
                })}
              </div>
          </div>
          <Navbar/>
        </div>
    );
}

export default SelectPic;