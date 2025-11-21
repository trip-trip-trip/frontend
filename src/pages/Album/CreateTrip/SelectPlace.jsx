import React, { useState, useMemo } from 'react';
import './SelectPlace.css';
import Header from '../../../components/Header/Header';
import Navbar from '../../../components/NavBar/NavBar'; // 가정: 하단 네비게이션
import { useNavigate } from 'react-router-dom';

// 데이터 구조 정의 (변수명은 그대로 유지)
const travelData = [
    { id: 'japan', label: '일본', areas: ['도쿄', '하코네', '요코하마', '가마쿠라'], placeIdBase: 1100 },
    { id: 'usa', label: '미국', areas: ['뉴욕', '워싱턴', '캘리포니아'], placeIdBase: 2200 },
    { id: 'sea', label: '동남아시아', areas: ['필리핀', '태국', '베트남', '사이판'], placeIdBase: 3300 },
    { id: 'pacific', label: '남태평양', areas: ['괌', '하와이'], placeIdBase: 4400 },
    { id: 'europe', label: '유럽', areas: ['독일', '프랑스', '영국', '스페인', '이탈리아'], placeIdBase: 5500 },
];

const domesticData = [
    { id: 'seoul', label: '서울', areas: ['혜화', '경복궁', '남산', '해방촌'], placeIdBase: 6600 },
    { id: 'busan', label: '부산', areas: ['해운대', '광안리'], placeIdBase: 7700 },
    { id: 'gangwondo', label: '강원도', areas: ['강릉', '묵호', '속초'], placeIdBase: 8800 },
];


const SelectPlace = () => {
    const navigate = useNavigate();
    // 국내/해외 선택
    const [typeSelected, setTypeSelected] = useState('domestic'); 
    // 현재 선택된 국가/지역 카테고리 ID (예: 'japan', 'seoul')
    const [selectedCategoryId, setSelectedCategoryId] = useState('japan'); 
    // 사용자가 선택한 도시 객체 { name: string, id: number } 목록
    const [selectedPlaces, setSelectedPlaces] = useState([]); 

    // 1. 현재 탭에 맞는 데이터 (travelData 또는 domesticData)
    const currentData = typeSelected === 'overseas' ? travelData : domesticData;

    // 2. 현재 선택된 카테고리 객체 (예: { id: 'japan', ... })
    const selectedCategory = useMemo(() => {
        // 초기 렌더링 시 selectedCategoryId가 currentData에 없으면 첫 번째 항목을 기본으로 설정
        const category = currentData.find(d => d.id === selectedCategoryId);
        return category || currentData[0];
    }, [typeSelected, selectedCategoryId, currentData]);

    // 3. 도시 선택/해제 핸들러
    const handlePlaceToggle = (placeName, placeId) => {
        const isSelected = selectedPlaces.some(p => p.id === placeId);
        
        if (isSelected) {
            // 선택 해제
            setSelectedPlaces(prev => prev.filter(p => p.id !== placeId));
        } else {
            // 선택 추가
            setSelectedPlaces(prev => [...prev, { name: placeName, id: placeId }]);
        }
    };

    // 4. 여행 만들기 버튼 핸들러
    const handleCompleteSelection = () => {
        if (selectedPlaces.length === 0) {
            alert("여행지를 1개 이상 선택해주세요.");
            return;
        }

        // [핵심] 선택된 모든 여행지 정보를 다음 페이지로 전달
        // 현재는 첫 번째 여행지만 대표로 전달하도록 구현
        const firstPlace = selectedPlaces[0]; 
        
        navigate('/create-trip', { 
            state: { 
                selectedPlaceName: firstPlace.name,      // 예: "도쿄"
                selectedPlaceId: firstPlace.id,            // 예: 1101
                allSelectedPlaces: selectedPlaces        // 다중 선택 시 전체 목록
            } 
        });
    };

    // Helper: placeId 생성 (실제 API placeId는 서버에서 받아와야 함. 여기선 임시로 생성)
    const getPlaceId = (categoryBase, index) => categoryBase + index + 1;


    // 초기 선택된 카테고리 ID 설정 (탭 전환 시)
    // NOTE: 이 부분이 없으면 overseas -> domestic 전환 시 selectedCategoryId='japan'이 남아 에러 발생 가능
    useState(() => {
        if (selectedCategory && selectedCategory.id !== selectedCategoryId) {
            setSelectedCategoryId(selectedCategory.id);
        }
    }, [typeSelected]);


    return (
        <div className='select-place'>
            <Header toBack={true}/>
            <div className="select-place-cont">
                <h2>여행, 어디로 떠나시나요?</h2>
                
                {/* 탭 선택: 국내/해외 */}
                <div className="place-tab">
                    <div 
                        className={`place-type-tab ${(typeSelected === 'domestic') ? 'selected' : 'unselected'}`}
                        onClick={() => {
                            setTypeSelected('domestic');
                            setSelectedCategoryId(domesticData[0].id); // 새 탭의 첫 번째 카테고리로 설정
                        }}>
                        <h3>국내</h3>
                    </div>
                    <div
                        className={`place-type-tab ${(typeSelected === 'overseas') ? 'selected' : 'unselected'}`}
                        onClick={() => {
                            setTypeSelected('overseas');
                            setSelectedCategoryId(travelData[0].id); // 새 탭의 첫 번째 카테고리로 설정
                        }}>
                        <h3>해외</h3>
                    </div>
                </div>

                {/* 국가/지역 카테고리 선택 바 */}
                <div className="country-select-bar scroll-area">
                    {currentData.map(d => (
                        <button
                            key={d.id}
                            className={`country-item ${selectedCategoryId === d.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategoryId(d.id)}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>

                {/* 도시 목록 */}
                {selectedCategory && (
                    <div className="city-info">
                        <h2>{selectedCategory.label}</h2>
                        <div className="city-container">
                            {selectedCategory.areas.map((cityName, index) => {
                                const placeId = getPlaceId(selectedCategory.placeIdBase, index);
                                const isSelected = selectedPlaces.some(p => p.id === placeId);
                                
                                return (
                                    <CityItem 
                                        key={placeId}
                                        cityName={cityName}
                                        placeId={placeId}
                                        isSelected={isSelected}
                                        onToggle={handlePlaceToggle}
                                        categoryName={selectedCategory.areas.join(', ')}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* 하단 선택 완료 바 */}
            <BottomActionBar 
                selectedPlaces={selectedPlaces} 
                onComplete={handleCompleteSelection}
            />
        </div>
    );
};

// 도시 아이템 컴포넌트
const CityItem = ({ cityName, categoryName, placeId, isSelected, onToggle }) => (
    <div 
        className='city-item'
        onClick={() => onToggle(cityName, placeId)}
    >
        <div className="city-content">
            {/* 왼쪽 원형 이미지 Placeholder */}
            <div className={`city-image-placeholder ${isSelected ? 'selected-bg' : ''}`}>
                {/*  */}
            </div>
            {/* 텍스트 정보 */}
            <div>
                <p className="city-title">{cityName}</p>
                <p className="city-subtext">{categoryName}</p>
            </div>
        </div>
        {/* 오른쪽 체크 박스 Placeholder */}
        <div className={`checkbox-placeholder ${isSelected ? 'checked' : 'unchecked'}`}>
            {isSelected && '✅'} {/* 체크 표시 */}
        </div>
    </div>
);

// 하단 선택 완료 액션 바 컴포넌트
const BottomActionBar = ({ selectedPlaces, onComplete }) => {
    const isVisible = selectedPlaces.length > 0;

    return (
        <div className={`bottom-action-bar ${isVisible ? 'visible' : 'hidden'}`}>
            <div className='selected-chips-container scroll-area'>
                {selectedPlaces.map(p => (
                    <div key={p.id} className='selected-chip'>
                        {p.name}
                    </div>
                ))}
            </div>
            <button 
                className='complete-btn'
                onClick={onComplete}
            >
                여행지 {selectedPlaces.length}개 선택 완료
            </button>
        </div>
    );
}

export default SelectPlace;