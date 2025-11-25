import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TabPlace.css';
import homePlace from '../../../assets/home_placeLogo.png';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { useAuth } from '../../../contexts/AuthContext';

// API 키 및 상수 설정
const MAPS_KEY = 'AIzaSyBxUpz_y5O2nOTivngRz6fVvYHtG91i75M';
const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';
const FALLBACK_THUMB = `${window.location.origin}/icons/tripshot.png`;
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 }; // 서울 중심
const LS_KEY = 'tripshot_posts';

/* 로컬 스토리지 읽기 헬퍼 */
const readLocalPosts = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch { return []; }
};

/* 이미지 경로 절대 경로 변환 */
const toAbsolute = (path) => {
    if (!path) return FALLBACK_THUMB;
    if (path.startsWith('http')) return path;
    return `${window.location.origin}${path}`;
};
const addJitter = (coord) =>{
    const jitterAmount = 0.0005; 
    // -0.00025 ~ +0.00025 사이의 랜덤 값 추가
    return Number(coord) + (Math.random() - 0.5) * jitterAmount;
}

const mapLocalPostForMap = (p) => ({
    id: p.id,
    post_id: p.id,
    lat: addJitter(p.lat), // 로컬 데이터에도 적용
    lng: addJitter(p.lng),
    title: p.title || p.content || "제목 없음",
    thumbnail_url: toAbsolute(p.images?.[0] || p.image),
    author_avatar: p.author_avatar,
});

/* 더미 데이터 (API 실패 시 사용) */
// const hardcodedDummies = [
//     { id: 2, post_id: 2, lat: 37.550000, lng: 126.988000, thumbnail_url: 'https://img1.daumcdn.net/thumb/R1280x0.fjpg/?fname=https://t1.daumcdn.net/brunch/service/user/bUxO/image/CNVUiFf4ZuP8oLPqZr9L83WoopE.jpg', title: '남산 1' },
//     { id: 3, post_id: 3, lat: 37.550500, lng: 126.988500, thumbnail_url: 'https://media.triple.guide/triple-cms/c_limit,f_auto,h_1024,w_1024/5623e2d7-aee0-4933-85ff-e48db3d31da1.jpeg', title: '남산 2' }
// ];



/* 구글 맵 스크립트 로더 (싱글톤 패턴) */
let mapsLoaderPromise = null;
function loadGoogleMaps() {
    if (window.google?.maps) return Promise.resolve(window.google.maps);
    if (mapsLoaderPromise) return mapsLoaderPromise;

    mapsLoaderPromise = new Promise((resolve, reject) => {
        const cb = "initMap_" + Date.now();
        window[cb] = () => {
            resolve(window.google.maps);
            delete window[cb];
        };
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&callback=${cb}`;
        script.async = true;
        script.onerror = reject;
        document.head.appendChild(script);
    });
    return mapsLoaderPromise;
}

/* 지도 스타일 */
const MAP_STYLES = [
    { featureType: "all", elementType: "all", stylers: [{ hue: "#a7c5df" }] },
    { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
    { featureType: "road", elementType: "all", stylers: [{ saturation: "0" }, { lightness: "0" }] },
    { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
    { 
        featureType: "water", elementType: "geometry", stylers: [{ color: "#a7c5df" }, { saturation: 0 }, { lightness: 0 }] 
    }
];

export default function TabPlace({ setTab, activeTrip }) {
    const navigate = useNavigate();
    const { token } = useAuth();

    const mapRef = useRef(null);         // DOM 엘리먼트
    const mapInstanceRef = useRef(null); // Google Map 인스턴스
    const infoWindowRef = useRef(null);  // InfoWindow 인스턴스
    const clustererRef = useRef(null);   // Marker Clusterer

    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);

    /* 1. 지도 스크립트 로드 */
    useEffect(() => {
        loadGoogleMaps().then(() => setIsMapLoaded(true)).catch(console.error);
    }, []);

    

    /* 2. 지도 초기화 (스크립트 로드됨 + DOM 준비됨) */
    useEffect(() => {
        if (!isMapLoaded || !mapRef.current || mapInstanceRef.current) return;

        const maps = window.google.maps;
        
        // 지도 생성
        const map = new maps.Map(mapRef.current, {
            center: DEFAULT_CENTER,
            zoom: 12,
            disableDefaultUI: true,
            gestureHandling: "greedy",
            styles: MAP_STYLES,
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new maps.InfoWindow();

        // 탭 전환 등으로 컴포넌트가 다시 마운트될 때 지도가 깨지는 것 방지 (Resize)
        // 약간의 지연 후 resize 이벤트를 트리거해주면 안전합니다.
        setTimeout(() => {
             maps.event.trigger(map, "resize");
             map.setCenter(DEFAULT_CENTER);
        }, 100);

    }, [isMapLoaded]); // mapRef.current는 ref라 의존성에 넣지 않아도 되지만, isMapLoaded가 핵심

    /* 3. 데이터 Fetch */
    useEffect(() => {
        if (!isMapLoaded) return;
        
        let cancel = false;
        const loadData = async () => {
            setLoading(true);
            
            const localPosts = readLocalPosts()
                .map(mapLocalPostForMap)
                .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));

            if (!API_BASE) {
                setPhotos([...localPosts]);
                setLoading(false);
                return;
            }

            try {
                // (1) 게시물 상세 정보 가져오기
                const detailRes = await fetch(`${API_BASE}/posts?feed_type=all&limit=200`, {
                   headers: { Authorization: `Bearer ${token || ""}` }
                });
                const detailJson = await detailRes.json();
                const details = detailJson?.result?.posts ?? [];

                const detailMap = new Map();
                details.forEach(p => detailMap.set(p.id, {
                    title: p.caption ?? "사진",
                    thumbnail_url: p.media?.[0]?.thumbnail_url ? toAbsolute(p.media[0].thumbnail_url) : null,                    avatar_url: p.author?.avatar_url,
                }));

                // (2) 위치 정보 & 장소 탭 정보 가져오기
                const locRes = await fetch(`${API_BASE}/posts/locations`, {
                    headers: { Authorization: `Bearer ${token || ""}` }               
                });

                const locJson = await locRes.json();
                
                const locList = locJson?.result?.posts ?? [];
                const placeTabs = locJson?.result?.place_tabs ?? []; // ★ 장소 좌표 리스트

                if (activeTrip && activeTrip.placeName && mapInstanceRef.current) {
                    const targetPlace = placeTabs.find(p => p.name === activeTrip.placeName);
                    
                    if (targetPlace) {
                        console.log("📍 여행 장소로 이동:", targetPlace.name);
                        const movePos = { lat: targetPlace.lat, lng: targetPlace.lng };
                        
                        mapInstanceRef.current.setCenter(movePos);
                        mapInstanceRef.current.setZoom(10); // 여행지 전체가 보이도록 줌 아웃
                    }
                }

                // (3) 데이터 병합
                const merged = locList.map(loc => {
                    const d = detailMap.get(loc.post_id) || {};
                    // if (!d) return null;
                    const thump = loc.thumbnail_url
                    ? toAbsolute(loc.thumbnail_url)
                    : (d.thumbnail_url || FALLBACK_THUMB);
                    return {
                        id: loc.post_id,
                        lat: addJitter(loc.lat),
                        lng: addJitter(loc.lng),
                        title: d.title || "게시물",
                        thumbnail_url: thump,
                        avatar_url: d.avatar_url,
                    };
                }).filter(Boolean);

                const finalPhotos = [
                    ...localPosts,
                    ...merged.filter(p => !localPosts.some(lp => lp.id === p.id))
                ];

                if (!cancel) setPhotos(finalPhotos);
            } catch (e) {
                console.error("Map Data Load Error:", e);
                if (!cancel) setPhotos([...localPosts]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
        return () => { cancel = true; };
    }, [isMapLoaded, activeTrip, token]);

    /* 4. 마커 및 클러스터링 렌더링 */
    useEffect(() => {
        const map = mapInstanceRef.current;
        const info = infoWindowRef.current;
        const maps = window.google?.maps;

        if (!map || !info || !maps || photos.length === 0) return;

        // 기존 클러스터/마커 정리
        if (clustererRef.current) {
            clustererRef.current.clearMarkers();
        }

        const markers = photos.map(p => {
            const marker = new maps.Marker({
                position: { lat: p.lat, lng: p.lng },
                map: map, // 클러스터러를 쓰더라도 일단 map 지정 가능
                icon: {
                    url: p.thumbnail_url,
                    size: new maps.Size(56, 56),
                    scaledSize: new maps.Size(56, 56),
                    anchor: new maps.Point(28, 56),
                },
                title: p.title
            });

            //  InfoWindow 클릭 이벤트 핸들링 
            marker.addListener("click", () => {
                // HTML 컨텐츠 설정 (ID 부여)
                const contentString = `
                    <div id="info-window-${p.id}" style="cursor: pointer; text-align: center;">
                        <img src="${p.thumbnail_url}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 5px;" />
                        <div style="font-weight: bold; font-size: 14px; color: #333;">${p.title}</div>
                        <div style="color: #007AFF; font-size: 12px; margin-top: 4px;">보러가기 &gt;</div>
                    </div>
                `;
                
                info.setContent(contentString);
                info.open(map, marker);

                // 'domready': InfoWindow의 HTML이 지도 위에 완전히 그려진 후 발생
                maps.event.addListenerOnce(info, 'domready', () => {
                    const el = document.getElementById(`info-window-${p.id}`);
                    if (el) {
                        // 기존 클릭 이벤트 방지 후 리액트 네비게이션 실행
                        el.addEventListener('click', () => {
                            navigate(`/post/${p.id}`);
                        });
                    }
                });
            });

            return marker;
        });

        // 클러스터러 생성 및 마커 추가
        clustererRef.current = new MarkerClusterer({ map, markers });

    }, [photos, navigate]); // photos가 바뀌면 마커 다시 그림

    const goBack = () => {
        if (setTab) setTab("all");
        else navigate("/home");
    };

    return (
        <section className="tabplace" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="place-header-controls">
                <div className="place-title-group">
                    <img src={homePlace} alt="map-icon" className="place-icon" />
                </div>
                <button className="back-to-feed-btn" onClick={goBack}>
                    피드로 돌아가기
                </button>
            </div>

            {/* 지도 컨테이너: CSS에서 반드시 height가 지정되어 있어야 함 */}
            <div ref={mapRef} className="map-container" style={{ flex: 1, minHeight: '400px', width: '100%' }}>
                {(!isMapLoaded || loading) && (
                    <div className="map-loading" style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10
                    }}>
                        지도를 불러오는 중…
                    </div>
                )}
            </div>
        </section>
    );
}
