import React, { useState, useMemo } from 'react';
import './SelectPlace.css';
import Header from '../../../components/Header/Header';
import Navbar from '../../../components/NavBar/NavBar'; // 가정: 하단 네비게이션
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

const SelectPlace = () => {
    const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';
    const navigate = useNavigate();
    const location = useLocation();
    const { token, activeTripId } = useAuth();
    const [isLoading, setIsLoading] = useState();
    const [domesticData, setDomesticData] = useState([]);
    const [overseasData, setOverseasData] = useState([]);
    const [isEdit, setIsEdit] = useState(location.state?.isEdit || false);
    const [tripName, setTripName] = useState(location.state?.tripName || '');
    const [tripStartDate, setTripStartDate] = useState(location.state?.startDate || '');
    const [tripEndDate, setTripEndDate] = useState(location.state?.endDate || '');
    const returnPath = location.state?.returnPath || null; 

    // 국내/해외 선택
    const [typeSelected, setTypeSelected] = useState('domestic'); 
    // 현재 선택된 국가/지역 카테고리 ID -> 기본 한국 10
    const [selectedCategoryId, setSelectedCategoryId] = useState(10); 
    // 사용자가 선택한 도시 목록
    const [selectedPlace, setSelectedPlace] = useState(location.state?.selectedPlace); 

    // 국내/해외 선택 -> 데이터 다르게 표시
    const currentData = typeSelected === 'overseas' ? overseasData : domesticData;

    const selectedCategory = useMemo(() => {
        return currentData.find(d => d.id === selectedCategoryId) || currentData[0] || null;
    }, [selectedCategoryId, currentData]);

    useEffect(() => {
      if (currentData.length > 0) {
          const firstCountryId = currentData[0].id;
          if (currentData.find(d => d.id === selectedCategoryId) === undefined) { 
            setSelectedCategoryId(firstCountryId);
        }
    } else if(selectedCategoryId !== null) {
      setSelectedCategoryId(null);
    }
  }, [typeSelected, currentData]);

    const handlePlaceToggle = (placeName, placeId) => {
      if (selectedPlace && selectedPlace.id === placeId) {
        setSelectedPlace(null);
      } else{
        setSelectedPlace({ name: placeName, id: placeId })
      }
  };

    const handleCompleteSelection = () => {
      if (!selectedPlace) {
        alert("여행지를 1개 이상 선택해주세요.");
        return;
      }
      if (isEdit && returnPath) {
        navigate(returnPath, { state: { selectedPlace, tripName, tripStartDate, tripEndDate } });
        return;
      }
      if (isEdit && !returnPath) {
        // returnPath가 없다면 그냥 뒤로 가기 (state 전달 불가하므로 경고)
        alert("돌아갈 경로 정보가 없어 자동으로 뒤로갑니다.");
        navigate(-1);
        return;
      }
      navigate('/trips/create', { state: { selectedPlace } });
    };

    // 현재 선택된 도시의 ID를 확인하는 헬퍼 함수
    const isPlaceSelected = (placeId) => {
      return selectedPlace && selectedPlace.id === placeId;
    }
// /////-------------------------------------- API --------------------------
    useEffect(() => {
        async function fetchTrips() {
          setIsLoading(true);
          
          if (!token) {
            console.error("인증 토큰(accessToken)이 로컬 스토리지에 없습니다. 로그인 상태를 확인하세요.");
            setIsLoading(false);
            navigate('/login');
            return;
          }

          if (!isEdit){
            if(activeTripId){
              alert("이미 생성된 여행이 있습니다. 해당 여행이 끝난 후 새 여행 생성이 가능합니다.");
              setIsLoading(false);
              // navigate('/login');
              return;
            }
          }
    
          try {
            const response = await fetch(
              `${API_BASE}/trips/places`,
              {
                method: "GET",
                headers: {
                  "Content-type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
    
            if (!response.ok) {
              throw new Error(`여행지 목록 조회 실패: ${response.status}`);
            }
    
            const data = await response.json();
            const fetchedPlaces = data.result || [];
    
            const parceDomestic = []; // 국내 (South Korea)
            const parceOverseas = []; // 해외 (나머지 COUNTRY)
            const allItems = new Map(fetchedPlaces.map(item => [item.id, { ...item, cities: [], spots: [] }]));

            fetchedPlaces.forEach(item => {
                const parent = allItems.get(item.parentId);
                const currentItem = allItems.get(item.id);

                if (parent) {
                    // Country(카테고리) -> 하위 City/Region(선택가능) -> 하위 spot(설명)
                    if (item.type === 'CITY' || item.type === 'REGION') {
                        parent.cities.push(currentItem);
                    } else if (item.type === 'SPOT') {
                        parent.spots.push(currentItem);
                    }
                }
            });

            // 최상위 COUNTRY (parentId가 null) 항목들을 국내/해외로 분류
            allItems.forEach(item => {
                if (item.parentId === null && item.type === 'COUNTRY') {
                    if (item.name === '대한민국') {
                      parceDomestic.push(item);   
                    } else {
                      parceOverseas.push(item);
                    }
                }
            });
    
            setDomesticData(parceDomestic);
            setOverseasData(parceOverseas);
    
          } catch (error) {
            console.error("Error fetching trips:", error);
          }finally{
            setIsLoading(false);
          }
        }
        fetchTrips();
      }, [token, activeTripId]);
    
      if (isLoading) {
        return (
          <div className='album'>
            <Header/>
              <div className="album-container">
                <div className="ment">여행 정보를 불러오는 중...</div>
              </div>
            <Navbar/>
          </div>
        );
      }
    

    return (
      <div className='select-place'>
          <Header toBack={true}/>
          <div className="select-place-cont">
              <h2>여행, 어디로 떠나시나요?</h2>
              
              {/* 탭 선택: 국내/해외 */}
              <div className="place-tab">
                  <div 
                      className={`place-type-tab ${(typeSelected === 'domestic') ? 'selected' : 'unselected'}`}
                      onClick={() => { setTypeSelected('domestic'); }}>
                      <h3>국내</h3>
                  </div>
                  <div
                      className={`place-type-tab ${(typeSelected === 'overseas') ? 'selected' : 'unselected'}`}
                      onClick={() => { setTypeSelected('overseas'); }}>
                      <h3>해외</h3>
                  </div>
              </div>

              {/* 국가/지역 카테고리 선택 바 */}
              <div className="country-select-bar scroll-area">
                  {currentData.map(d => (
                      <button
                          key={d.id}
                          className={`country-item ${selectedCategory && selectedCategoryId === d.id ? 'active' : ''}`}
                          onClick={() => setSelectedCategoryId(d.id)}
                      >
                          {d.name} 
                      </button>
                  ))}
              </div>

              {/* 도시 목록 */}
              {selectedCategory && (
                <div className="city-info">
                  <h2>{selectedCategory.name}</h2> 
                  <div className="city-container">
                    {selectedCategory.cities.map(cityItem => {
                        const placeId = cityItem.id; 
                        return (
                            <CityItem 
                              key={placeId}
                              cityName={cityItem.name}
                              spotInfo={cityItem.spots.map(spot => spot.name).join(', ') || ''}
                              placeId={placeId}
                              isSelected={isPlaceSelected(placeId)}
                              onToggle={handlePlaceToggle}
                            />
                        );
                    })}
                  </div>
                </div>
              )}

              { selectedPlace &&
              <div className="complete-btn-cont">
                <button 
                    className='complete-btn'
                    onClick={handleCompleteSelection}
                >
                    여행지 선택 완료
                </button>
              </div>
              }
          </div>
      </div>
  );
};

// 도시 아이템 컴포넌트
const CityItem = ({ cityName, spotInfo, placeId, isSelected, onToggle }) => (
  <div 
      className={`city-item ${isSelected ? 'selected' : ''}`} // 시각적 구분을 위해 클래스 추가
      onClick={() => onToggle(cityName, placeId)}
  >
      <div className="city-content">
        <p className="city-title">{cityName}</p>
        <p className="city-spots">스팟: {spotInfo}</p>
      </div>

      <div className={`checkbox-placeholder ${isSelected ? 'checked' : 'unchecked'}`}>
      </div>
  </div>
);

export default SelectPlace;