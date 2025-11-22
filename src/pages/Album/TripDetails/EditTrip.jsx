import React from 'react'
import './EditTrip.css'
import Header from '../../../components/Header/Header'
import Navbar from '../../../components/NavBar/NavBar'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useState, useRef } from 'react' // useRef 추가
import edit_icon from '/icons/edit_btn.png'
import { useAuth } from '../../../contexts/AuthContext'
import { useMemo, useEffect, useCallback } from 'react' // useCallback 추가

// API 요청에 사용될 PLACEHOLDER placeId (실제로는 GET 요청 응답에서 가져와야 함)
const MOCK_PLACE_ID = 11; 

const EditTrip = () => {
  const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';

  // **Original Data**를 저장하기 위한 Ref: 이것이 변경 여부를 판단하는 기준이 됩니다.
  const originalTripRef = useRef(null); 

  const [tripInfo, setTripInfo] = useState(null); // 초기 데이터는 null
  const [oneday, setOneday] = useState(false);
  const { tripId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const {token} = useAuth();
  const todayDate = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  // 폼 입력 State
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [place, setPlace] = useState('');
  const [placeId, setPlaceId] = useState(MOCK_PLACE_ID); // placeId state 추가

  const [currentTripStatus ,setCurrentTripStatus] = useState('pending');
  const isCompleted = currentTripStatus === 'completed'; 

  const navigate = useNavigate();
  const location = useLocation();

  // 💡 당일치기 로직 통합
  useEffect(() => {
    if (oneday && startDate) {
      setEndDate(startDate);
    }
  }, [oneday, startDate]);


  const fetchTripInfo = useCallback(async () => {
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
      const fetchedTrip = data.result;

      if (fetchedTrip){
        const { id, title, startDate, endDate, place, placeId, status } = fetchedTrip;
        
        // State 초기화 (폼에 채워지는 값)
        setName(title);
        setStartDate(startDate);
        setEndDate(endDate);
        setPlace(place || '장소 없음');
        setPlaceId(placeId || MOCK_PLACE_ID); // placeId가 응답에 포함된다고 가정

        // tripInfo (GET 응답 전체를 저장하거나 필요한 정보만 저장)
        const initialData = {
          tripId: id,
          title: title,
          startDate: startDate, 
          endDate: endDate,
          place: place || '장소 없음',
          placeId: placeId || MOCK_PLACE_ID,
          status: status || 'pending' // API 응답에 status 필드가 있다고 가정
        };

        setTripInfo(initialData);

        originalTripRef.current = initialData; 

        // 당일치기 여부 설정
        setOneday(startDate === endDate);

        setCurrentTripStatus(status || 'pending');
        
      }
    } catch (error) {
      console.error("Error fetching trip data:", error);
      alert('여행 정보를 불러오는 데 실패했습니다. 목록으로 돌아갑니다.');
      // navigate('/trips'); 
    } finally{
      setIsLoading(false);
    }
  }, [API_BASE, tripId, token, navigate]);

  useEffect(() => {
    if (token && tripId){
      fetchTripInfo();
    }
  }, [token, tripId, fetchTripInfo]) // 의존성 배열에 fetchTripInfo 추가

  const getChanges = () => {
    const original = originalTripRef.current;
    if (!original) return {};

    const changes = {};

    // 1. 제목 비교
    if (name !== original.title) {
      changes.title = name;
    }
    
    // 2. 시작일 비교
    if (startDate !== original.startDate) {
      // API 요청 형식에 맞춰 T12:00 추가
      changes.startDate = `${startDate}T12:00`; 
    }
    
    // 3. 종료일 비교
    if (endDate !== original.endDate) {
      // API 요청 형식에 맞춰 T12:00 추가
      changes.endDate = `${endDate}T12:00`; 
    }
    
    // 4. 장소 ID 비교 (장소 변경 로직이 구현되었다고 가정)
    // 현재 코드에서는 placeId 변경 로직이 없으므로, 필요하다면 여기에 추가해야 합니다.
    // 임시로 placeName이 변경되었을 때 placeId를 포함시키지만, 
    // 실제로는 장소 선택 컴포넌트에서 placeId를 업데이트해야 합니다.
    if (placeId !== original.placeId) {
       changes.placeId = placeId;
    }

    return changes;
  };


  const editTrip = async (requestBody) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/trips/${tripId}`,
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`여행 수정 실패: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('여행 수정 성공:', data.result);

      alert('✅ 여행 정보가 성공적으로 수정되었습니다.');
      // 수정 후 상세 페이지로 이동
      navigate(`/trips/${tripId}`); 

    } catch (error) {
      console.error("Error editing trip data:", error);
      alert('❌ 여행 정보 수정에 실패했습니다.');
    } finally{
      setIsLoading(false);
    }
  };

  

  const handleEditBtn = async () => {
    if (isCompleted) {
        alert("이미 완료된 여행은 수정할 수 없습니다.");
        return;
    }
    
    const changes = getChanges();
    
    if (Object.keys(changes).length === 0) {
        alert("수정된 내용이 없습니다.");
        return;
    }
    
    // ⚠️ 수정이 필요한 필드만 포함된 requestBody를 editTrip에 전달
    await editTrip(changes);
  }

  const handlePlaceEdit = () => {
    // 장소 변경 페이지로 이동 시, 돌아올 경로 및 현재 placeId를 state로 전달하는 것이 좋습니다.
    navigate('/trips/places', { state: { currentPlaceId: placeId, currentPlaceName: place } })
  }
    
  if (isLoading) {
    return (
        <div className='edit-trip loading'>
            <p>여행 정보를 불러오는 중...</p>
        </div>
    );
  }
  
  return (
    <div className='edit-trip'>
        <Header toBack={true}/>
        <div className="edit-trip-cont">
        <form action="" className='edit-trip-form' onSubmit={(e) => e.preventDefault()}>
          <div className="edit-trip-name">
            <div className="edit-trip-title">
              <img src={edit_icon} alt="수정 아이콘" />
              <h2>여행 수정</h2>
            </div>
            <h3>제목</h3>
            <div className="input-field">
              <input type="text" value={name} maxLength={7} placeholder='예: 제주도 가족여행' onChange={(e)=>setName(e.target.value)} />
            </div>
            <h3>일정</h3>
            {!isCompleted && 
              <div className="oneday-check" hidden={isCompleted}>
                <input type="checkbox" checked={oneday} onChange={()=>setOneday(!oneday)}/>
                <h4>당일치기</h4>
              </div>
            }

            { oneday
            ? <div className="date-form oneday">
                <input 
                  type="date" 
                  value={startDate} 
                  date-placeholder='여행 시작일' 
                  onChange={(e)=>{setStartDate(e.target.value), setEndDate(e.target.value)}}
                  disabled={isCompleted}
                  className={`date-form ${isCompleted ? 'disabled' : ''}`}
                />
              </div> 
            : <div className="date-info">
                <div className="date-form">
                  <input 
                    type="date" 
                    value={startDate} 
                    date-placeholder='여행 시작일' 
                    onChange={(e)=>setStartDate(e.target.value)}
                    disabled={isCompleted}
                    className={`date-form ${isCompleted ? 'disabled' : ''}`}
                  />
                  <p>부터</p>
                </div>
                <div className="date-form">
                  <input 
                    type="date" 
                    value={endDate} 
                    date-placeholder='여행 종료일' 
                    onChange={(e)=>setEndDate(e.target.value)}
                    disabled={isCompleted}
                    className={`date-form ${isCompleted ? 'disabled' : ''}`}
                    />
                  <p>까지</p>
                </div>
              </div>
            }
            <h3>장소</h3>
            <div className="place-info-row">
              <div className="place-info">
                <h4>{place}</h4>
              </div>
              {!isCompleted
              ? <h4 className='to-edit-complete' onClick={handlePlaceEdit}>변경하기 &gt;</h4>
              : 
                <h4 className='no-edit'>*이미 지난 여행의 일정과 장소는 바꿀 수 없어요.</h4>
              }
            </div>
            </div>
          </form>
          
          {
            name && startDate && endDate && place && !isLoading &&
            <div className="edit-trip-btn-cont">
              <button className='edit-trip-btn' onClick={handleEditBtn}>여행 수정하기</button>
            </div>
          }
        </div>
        <Navbar/>
    </div>
  )
}

export default EditTrip