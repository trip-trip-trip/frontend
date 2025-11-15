import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TabPlace.css';
import homePlace from '../../../assets/home_placeLogo.png'; 
import { MarkerClusterer } from '@googlemaps/markerclusterer';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const FALLBACK_THUMB = '/icons/tripshot.png';         // 썸네일 없을 때 사용
const DEFAULT_CENTER = { lat: 36.5, lng: 127.5 };     // 한국 중심
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_ID; 

let mapsLoaderPromise = null;

function loadGoogleMaps() {
  // 이미 로드된 경우
  if (typeof window !== 'undefined' && window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }
  // 로딩 중이면 그거 재사용
  if (mapsLoaderPromise) return mapsLoaderPromise;

  mapsLoaderPromise = new Promise((resolve, reject) => {
    if (!MAPS_KEY) {
      console.error('[Maps] Missing VITE_GOOGLE_MAPS_API_KEY');
      reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'));
      return;
    }

    const s = document.createElement('script');
    // 'marker' 라이브러리 제거 (Advanced Marker 사용 안 함) 및 'places' 유지
    s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&loading=async`;
    s.async = true;
    s.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        console.error('[Maps] google.maps not available (key error?)');
        resolve(null); // maps 없는 경우도 처리
      }
    };
    s.onerror = (e) => {
      console.error('[Maps] script load error', e);
      reject(e);
    };
    document.head.appendChild(s);
  });

  return mapsLoaderPromise;
}

const MAP_STYLES = [
    {
        "featureType": "all",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#008eff"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": "0"
            },
            {
                "lightness": "0"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "saturation": "-60"
            },
            {
                "lightness": "-20"
            }
        ]
    }
];

export default function TabPlace({
  activeTrip = true,
  photos: photosProp = [],
  setTab,
}) {
  const navigate = useNavigate();

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const clustererRef = useRef(null); 
  const infoWindowRef = useRef(null); 

  const [ready, setReady] = useState(false);  
  const [photos, setPhotos] = useState([]);     
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then((gmaps) => {
        if (cancelled) return;
        if (!gmaps) {
          return;
        }
        setReady(true);
      })
      .catch((e) => console.error('[Maps] load failed:', e));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    if (!window.google || !window.google.maps) return; 

    const maps = window.google.maps;

    const map = new maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 5,
      mapTypeId: maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      clickableIcons: false,
      gestureHandling: 'greedy',
      styles: MAP_STYLES, // 코드 스타일 적용
      // mapId: MAP_ID,
    });

    mapInstanceRef.current = map;

    infoWindowRef.current = new maps.InfoWindow({
      content: '', 
    });

    return () => {
      mapInstanceRef.current = null;
      infoWindowRef.current = null;
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    const fetchLocations = async () => {
      if (!API_BASE) {
        const fallbackData =
          photosProp.length > 0
            ? photosProp
            : [
               // 기존 경복궁 데모
               { id: 1, post_id:1, lat: 37.579617, lng: 126.977041, thumbnail_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNPabH4euPCr6sZ75LzJGWSz4c7X8lTPeK1A&s', title: '경복궁 데모' },
      
               // 서울 남산/명동 주변
               { id: 2, post_id:2, lat: 37.550100, lng: 126.988000, thumbnail_url: 'https://img1.daumcdn.net/thumb/R1280x0.fjpg/?fname=https://t1.daumcdn.net/brunch/service/user/bUxO/image/CNVUiFf4ZuP8oLPqZr9L83WoopE.jpg', title: '남산 1' },
               { id: 3, post_id:3, lat: 37.550500, lng: 126.988500, thumbnail_url: 'https://media.triple.guide/triple-cms/c_limit,f_auto,h_1024,w_1024/5623e2d7-aee0-4933-85ff-e48db3d31da1.jpeg', title: '남산 2' },
               { id: 4, post_id:4, lat: 37.560100, lng: 126.985000, thumbnail_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuFDN7FSHTxCLl_3CQxRVk_luaataMhxPrvA&s', title: '명동 근처' },
               { id: 5, post_id:5, lat: 37.560200, lng: 126.985100, thumbnail_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaVfqRYkbi-rowGnVMw7kocul0Eqbzy5TWOg&s', title: '명동 근처 2' },
               //부산
               { id: 6, post_id:6, lat: 35.150000, lng: 129.060000, thumbnail_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB2HyqKjxWwW_kfRZ3QSZ06uR7rdj-0AXNzw&s', title: '부산 해운대' },
               { id: 7, post_id:7, lat: 35.150500, lng: 129.060500, thumbnail_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSmeIxTOTZB7LRyDfaYsxzLO0k1biVznTblg&s', title: '부산 해운대 2' },
               { id: 8, post_id:8, lat: 35.151000, lng: 129.061000, thumbnail_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfcBXPOIiVaXiHgoGT2OlS8vX2SfhFJFwnrg&s', title: '부산 해운대 3' },
               // 제주
               { id: 9, post_id:9, lat: 33.430000, lng: 126.540000, thumbnail_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoNvoTJJ77o8d2UgWK7jdUE9q0JaZH13vcZg&s', title: '제주도 성산' },
               ];
               if (!cancelled) setPhotos(fallbackData);
        return;
      }

      setLoading(true);
      try {
            const detailedRes = await fetch(`${API_BASE}/posts?feed_type=all&limit=200`); 
            const detailedData = await detailedRes.json();
            const detailedList = detailedData?.result?.posts ?? [];
            
            const detailedMap = new Map();
            detailedList.forEach(p => {
                detailedMap.set(p.id, {
                    title: p.caption ?? '사진',
                    thumbnail_url: p.media?.[0]?.thumbnail_url || FALLBACK_THUMB,
                    avatar_url: p.author?.avatar_url, // 아바타 정보도 가져옴
                });
            });

            const locationRes = await fetch(`${API_BASE}/posts/locations`);
            const locationData = await locationRes.json();
            const locationList = locationData?.result?.posts ?? [];

            const mergedList = locationList
                .map(loc => {
                    const detail = detailedMap.get(loc.post_id); // post_id로 상세 정보 찾기
                    if (!detail) return null; // 상세 정보가 없는 게시물은 제외

                    return {
                        id: loc.post_id,
              
                        lat: loc.lat,
                        lng: loc.lng,
                        title: detail.title,
                        thumbnail_url: detail.thumbnail_url,
                        avatar_url: detail.avatar_url,
                    };
                })
                .filter(item => item !== null); // 제외된 항목 제거

            if (!cancelled) setPhotos(mergedList);

        } catch (e) {
            console.error('[TabPlace] fetch and merge failed', e);
            // API 오류 시 사용자에게 빈 지도 표시를 위해 빈 배열로 설정
            if (!cancelled) setPhotos([]); 
        } finally {
            if (!cancelled) setLoading(false);
        }
    };
    fetchLocations();

    return () => {
      cancelled = true;
    };
  }, [ready, photosProp.length, API_BASE]);

  // 클러스터링 적용
  useEffect(() => {
    const maps = window.google?.maps;
    const map = mapInstanceRef.current;
    const info = infoWindowRef.current; 

    if (!maps || !map || !info) return;

    if (clustererRef.current) {
        clustererRef.current.clearMarkers();
    }

    if (!activeTrip) return;

    const sourceList = photos.length > 0 ? photos : photosProp;
    const listToRender = sourceList.filter((p) => 
        Number.isFinite(p.lat) && Number.isFinite(p.lng)
    );
    
    const newMarkers = [];

    listToRender.forEach((p) => {
        const thumbnail = p.thumbnail_url || p.thumbUrl || FALLBACK_THUMB;

        const marker = new maps.Marker({
            position: { lat: p.lat, lng: p.lng },
            title: p.title || '',
            map: map,
            // 커스텀 아이콘을 사용
            icon: {
                url: thumbnail,
                size: new maps.Size(56, 56),
                scaledSize: new maps.Size(56, 56), // 썸네일 크기 설정
                origin: new maps.Point(0, 0),
                anchor: new maps.Point(28, 56), 
            },
        });
        marker.addListener('click', () => {
            info.setContent(`
                <div class="info-window">
                    <img src="${thumbnail}" 
                        alt="thumb" class="info-img"/>
                    <div class="info-title">${p.title ?? '사진'}</div>
                </div>`);
            
            info.open(map, marker); // Marker에 InfoWindow 연결
            
            // 상세 페이지로 이동
            window.setTimeout(() => { 
                const infoWindowElement = document.querySelector('.info-window');
                if (infoWindowElement) {
                    infoWindowElement.onclick = () => {
                        navigate(`/post/${p.id}`); 
                    };
                }
            }, 100); 
        });

        newMarkers.push(marker);
    });

    const clusterer = new MarkerClusterer({ markers: newMarkers, map: map });
    clustererRef.current = clusterer;

  }, [activeTrip, photos, photosProp, navigate]);

  const handleBackToFeed = () => {
    if (setTab) {
      setTab('all');
    } else {
      navigate('/');
    }
  };

  return (
    <section className="tabplace">
      <div className="place-header-controls">
        <div className="place-title-group">
          <img src={homePlace} alt="지도 아이콘" className="place-icon" />
        </div>

        <button className="back-to-feed-btn" onClick={handleBackToFeed}>
          피드로 돌아가기
        </button>
      </div>

      {/* 설명 텍스트 */}
      <p className="place-description">
        장소를 클릭하면 지도 해당 위치로 이동해요
      </p>

      {/* 지도 영역 */}
      <div ref={mapRef} className="map-container">
        {(!ready || loading) && (
          <div className="map-loading">지도를 불러오는 중…</div>
        )}
      </div>
    </section>
  );
}


