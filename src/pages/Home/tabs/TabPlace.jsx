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

/* 이미지 경로 절대 경로 변환 */
const toAbsolute = (path) => {
    if (!path) return FALLBACK_THUMB;
    if (path.startsWith('http')) return path;
    return `https://tripshot.duckdns.org${path}`;
};

const addJitter = (coord, id) => {
    const jitterAmount = 0.002; 
    const seed = (id * 9301 + 49297) % 233280; // 간단한 유사 난수 생성
    const pseudoRandom = seed / 233280; 
    
    return Number(coord) + (pseudoRandom - 0.5) * jitterAmount;
}


/* 구글 맵 스크립트 로더 */
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
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#a7c5df" }, { saturation: 0 }, { lightness: 0 }] }
];

export default function TabPlace({ setTab, activeTrip }) {
    const navigate = useNavigate();
    const { token } = useAuth();

    const mapRef = useRef(null);        
    const mapInstanceRef = useRef(null); 
    const infoWindowRef = useRef(null);  
    // const clustererRef = useRef(null);   

    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [photos, setPhotos] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [placeTabs, setPlaceTabs] = useState(false);
    const [selectedPlaceId, setSelectedPlaceId] = useState(null);

    /* 1. 지도 스크립트 로드 */
    useEffect(() => {
        loadGoogleMaps().then(() => setIsMapLoaded(true)).catch(console.error);
    }, []);

    /* 2. 지도 초기화 */
    useEffect(() => {
        if (!isMapLoaded || !mapRef.current || mapInstanceRef.current) return;

        const maps = window.google.maps;
        
        const map = new maps.Map(mapRef.current, {
            center: DEFAULT_CENTER,
            zoom: 12,
            disableDefaultUI: true,
            gestureHandling: "greedy",
            styles: MAP_STYLES,
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new maps.InfoWindow({
            disableAutoPan: true
        });

        setTimeout(() => {
             maps.event.trigger(map, "resize");
             map.setCenter(DEFAULT_CENTER);
        }, 100);

    }, [isMapLoaded]);

    /* 3. 데이터 Fetch (순수 API 데이터만 사용) */
    useEffect(() => {
        if (!isMapLoaded) return;
        
        let cancel = false;
        const loadData = async () => {
            setLoading(true);
            
            if (!API_BASE) {
                setLoading(false);
                return;
            }

            try {
                // (1) 상세 정보
                const detailRes = await fetch(`${API_BASE}/posts?feed_type=all&limit=200`, {
                   headers: { Authorization: `Bearer ${token || ""}` }
                });
                const detailJson = await detailRes.json();
                const details = detailJson?.result?.posts ?? [];

                const detailMap = new Map();
                details.forEach(p => detailMap.set(p.id, {
                    title: p.caption ?? "사진",
                    thumbnail_url: p.media?.[0]?.thumbnail_url ? toAbsolute(p.media[0].thumbnail_url) : null,
                    avatar_url: p.author?.avatar_url,
                }));

                // (2) 위치 정보
                const locRes = await fetch(`${API_BASE}/posts/locations?feed_type=all`, {
                    headers: { Authorization: `Bearer ${token || ""}` }              
                });

                const locJson = await locRes.json();
                const locList = locJson?.result?.posts ?? [];
                
                const tabs =locJson?.result?.place_tabs??[];
                if (!cancel) setPlaceTabs(tabs);

                // const placeTabs = locJson?.result?.place_tabs ?? [];

                if (activeTrip && activeTrip.placeName && mapInstanceRef.current) {
                    const targetPlace = tabs.find(p => p.name === activeTrip.placeName);
                    if (targetPlace) {
                        const movePos = { lat: targetPlace.lat, lng: targetPlace.lng };
                        mapInstanceRef.current.setCenter(movePos);
                        mapInstanceRef.current.setZoom(11);
                        if(!cancel) setSelectedPlaceId(targetPlace.place_id); 
                    }
                }

                // (3) 데이터 병합 (로컬 데이터 병합 로직 제거됨)
                const merged = locList.map(loc => {
                    const d = detailMap.get(loc.post_id) || {};
                    
                    let rawThumb = loc.thumbnail_url || d.thumbnail_url;
                    let finalThumb = rawThumb ? toAbsolute(rawThumb) : FALLBACK_THUMB;

                    // 비디오 썸네일이면 기본 이미지로 대체
                    if (/\.(mp4|mov|webm|avi|mkv)$/i.test(finalThumb)) {
                        finalThumb = FALLBACK_THUMB; 
                    }

                    return {
                        id: loc.post_id,
                        lat: addJitter(loc.lat),
                        lng: addJitter(loc.lng),
                        title: d.title || "게시물",
                        thumbnail_url: finalThumb,
                        avatar_url: d.avatar_url,
                    };
                }).filter(Boolean);

                if (!cancel) setPhotos(merged); // 순수 서버 데이터만 설정

            } catch (e) {
                console.error("Map Data Load Error:", e);
                if (!cancel) setPhotos([]); // 에러 시 빈 배열 (더미 안 보여줌)
            } finally {
                setLoading(false);
            }
        };

        loadData();
        return () => { cancel = true; };
    }, [isMapLoaded, activeTrip, token]);

    /* 4. 마커 렌더링 */
    useEffect(() => {
        const map = mapInstanceRef.current;
        const info = infoWindowRef.current;
        const maps = window.google?.maps;

        if (!map || !info || !maps || photos.length === 0) return;

        // if (clustererRef.current) {
        //     clustererRef.current.clearMarkers();
        // }

        const markers = photos.map(p => {
            const marker = new maps.Marker({
                position: { lat: p.lat, lng: p.lng },
                map: map,
                icon: {
                    url: p.thumbnail_url,
                    size: new maps.Size(56, 56),
                    scaledSize: new maps.Size(56, 56),
                    anchor: new maps.Point(28, 56),
                },
                title: p.title
            });

            marker.addListener("click", () => {
                const contentString = `
                    <div class="info-window" id="info-window-${p.id}">
                        <img src="${p.thumbnail_url}" class="info-img" />
                        <div class="info-content">
                            <div class="info-title">${p.title}</div>
                            <div class="info-more">보러가기 &gt;</div>
                        </div>
                    </div>
                `;
                
                info.setContent(contentString);
                info.open(map, marker);

                maps.event.addListenerOnce(info, 'domready', () => {
                    const el = document.getElementById(`info-window-${p.id}`);
                    if (el) {
                        el.addEventListener('click', () => {
                            navigate(`/post/${p.id}`);
                        });
                    }
                });
            });

            return marker;
        });
        // clustererRef.current = new MarkerClusterer({ map, markers });

    }, [photos, navigate]);

     const handlePlaceClick = (place) => {
        if (!mapInstanceRef.current) return;
        
        mapInstanceRef.current.panTo({ lat: place.lat, lng: place.lng });
        mapInstanceRef.current.setZoom(12); 
        
        setSelectedPlaceId(place.place_id);
    };

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

            <div className='place-guide-text'>
                장소를 클릭하여 지도가 해당 위치로 이동해요.
            </div>
            {/* 탭  */}
            {placeTabs.length > 0 && (
                <div className="place-tabs-container">
                    {placeTabs.map(place => (
                        <button 
                            key={place.place_id}
                            className={`place-chip ${selectedPlaceId === place.place_id ? 'active' : ''}`}
                            onClick={() => handlePlaceClick(place)}
                        >
                            {place.name}
                        </button>
                    ))}
                </div>
            )} 

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