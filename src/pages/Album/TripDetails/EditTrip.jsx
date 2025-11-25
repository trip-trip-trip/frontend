import React from 'react'
import './EditTrip.css'
import Header from '../../../components/Header/Header'
import Navbar from '../../../components/NavBar/NavBar'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useState, useRef } from 'react' // useRef 추가
import edit_icon from '/icons/edit_btn.png'
import { useAuth } from '../../../contexts/AuthContext'
import { useMemo, useEffect } from 'react' // useCallback 추가

// API 요청에 사용될 PLACEHOLDER placeId (실제로는 GET 요청 응답에서 가져와야 함)
const MOCK_PLACE_ID = 11; 

const EditTrip = () => {
  const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';

  // const API_BASE = 'https://tripshot.duckdns.org';
  // const token = 'eyJhbGciOiJIUzUxMiJ9.eyJsdmwiOiJBQ0NFU1MiLCJzdWIiOiIzNCIsImlhdCI6MTc2NDA2OTE0NSwiZXhwIjoxNzY0MDcyNzQ1fQ.Q0PiL1ZAJm1dpIh9jGrciyrI4NookTKFnnjMbiT0wjIZuPkkI5Nx6bVZO6Md4BaU1fx-L741tUBNmErqPB5k-A';

  // **Original Data**를 저장하기 위한 Ref: 이것이 변경 여부를 판단하는 기준이 됩니다.
  const originalTripRef = useRef(null); 

  const [tripInfo, setTripInfo] = useState(null); // 초기 데이터는 null
  const [oneday, setOneday] = useState(false);
  const { tripId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const {token} = useAuth();
  const todayDate = useMemo(() => new Date().toISOString().split('T')[0], []);
  const navigate = useNavigate();
  const location = useLocation();
  
  // 폼 입력 State
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [placeId, setPlaceId] = useState(''); // placeId state 추가

  const [currentTripStatus ,setCurrentTripStatus] = useState('');
  const isCompleted = currentTripStatus === 'COMPLETED'; 

  useEffect(() => {
    if (oneday && startDate) {
      setEndDate(startDate);
    }
  }, [oneday, startDate]);


  useEffect(() => {
    async function fetchTripInfo(){
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
        const fetchedTrip = data?.result?.trip

        if (fetchedTrip.endDate < todayDate){
          setCurrentTripStatus('COMPLETED');
        } else if(fetchedTrip.startDate >todayDate){
          setCurrentTripStatus('UPCOMING');
        } else {
          setCurrentTripStatus('ACTIVE');
        }

        if (fetchedTrip){
          const initialData = {
            tripId : fetchedTrip.id,
            title: fetchedTrip.title,
            startDate: fetchedTrip.startDate, 
            endDate: fetchedTrip.endDate,
            placeName: fetchedTrip.placeName,
            placeId: fetchedTrip.placeId,
          }          
          setName(location.state?.tripName || initialData.title);
          setStartDate(location.state?.tripStartDate || initialData.startDate);
          setEndDate(location.state?.tripEndDate || initialData.endDate);
          setPlaceName(location.state?.selectedPlace.name || initialData.placeName);
          setPlaceId(location.state?.selectedPlace.id || initialData.placeId);

          setTripInfo(initialData);
          originalTripRef.current = initialData; 
    
          setOneday(initialData.startDate === initialData.endDate);
        }
    } catch (error){
      console.error("Error fetching trips:", error);
    }finally{
      setIsLoading(false);
    }
  }
  if (token && tripId){
    fetchTripInfo();
  }
},[API_BASE, tripId, token, todayDate])

  useEffect(() => {
    // console.log("실행됨");
    const returned = location.state?.selectedPlace;
    if (returned) {
      setPlaceName(returned.name || '');
      setPlaceId(returned.id);
    }
  }, [location.state]);

  // 비교 -> 변경된 것만 저장
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
      changes.endDate = `${endDate}T12:00`; 
    }
    
    // 3. 종료일 비교
    if (endDate !== original.endDate) {
      // API 요청 형식에 맞춰 T12:00 추가
      changes.startDate = `${startDate}T12:00`; 
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

      alert('여행 정보가 성공적으로 수정되었습니다.');
      navigate(`/trips/detail/${tripId}`); 

    } catch (error) {
      console.error("Error editing trip data:", error);
      alert('여행 정보 수정에 실패했습니다.');
    } finally{
      setIsLoading(false);
    }
  };



  const handleEditBtn = async () => {
    const changes = getChanges();
    
    if (Object.keys(changes).length === 0) {
        alert("수정된 내용이 없습니다.");
        return;
    }
    
    await editTrip(changes);
  }

  const handlePlaceEdit = () => {
    navigate('/trips/places', 
      { state: { selectedPlace: { name : placeName, id : placeId },
                isEdit: true,
                returnPath: `/trips/detail/${tripId}/edit`,
                tripName: name,
                tripStartDate: startDate,
                tripEndDate: endDate
    } })
  }
    
  if (isLoading) {
    return (
      <div className='edit-trips'>
        <Header/>
          <div className="edit-trip-cont">
            <div className="ment">
              여행 정보를 불러오는 중...
            </div>
          </div>
        <Navbar/>
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
                <h4>{placeName}</h4>
              </div>
              {!isCompleted
              ? <h4 className='to-edit-complete' onClick={handlePlaceEdit}>변경하기 &gt;</h4>
              : 
                <h4 className='no-edit'>*이미 지난 여행의 일정과 장소는 바꿀 수 없어요.</h4>
              }
            </div>
            </div>
          </form>
        </div>
        {
            name && startDate && endDate && placeName && !isLoading &&
            <div className="edit-trip-btn-cont">
              <button className='edit-trip-btn' onClick={handleEditBtn}>여행 수정하기</button>
            </div>
          }
        <Navbar/>
    </div>
  )
}

export default EditTrip