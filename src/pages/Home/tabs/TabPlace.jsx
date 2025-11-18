import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TabPlace.css';
import homePlace from '../../../assets/home_placeLogo.png'; 
import { MarkerClusterer } from '@googlemaps/markerclusterer';

// const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const MAPS_KEY = 'AIzaSyBxUpz_y5O2nOTivngRz6fVvYHtG91i75M';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const FALLBACK_THUMB = '/icons/tripshot.png'; 
const DEFAULT_CENTER = { lat: 36.5, lng: 127.5 }; 
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_ID; 

// ⭐ 로컬 저장소 유틸리티 (PostCreate/TabAll과 동일)
const LS_KEY = 'tripshot_posts';
const readLocalPosts = () => {
    try { 
        return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); 
    } catch { 
        return []; 
    }
};

// PostCreate에서 저장된 로컬 데이터를 지도 포맷으로 변환
const mapLocalPostForMap = (p) => {
    return {
        id: p.id,
        post_id: p.id,
        lat: p.lat,
        lng: p.lng,
        title: p.title || p.content,
        // PostCreate에서 images 배열로 저장한 첫 번째 항목을 썸네일로 사용
        thumbnail_url: p.images ? p.images[0] : (p.image || FALLBACK_THUMB), 
        author_avatar: p.author_avatar,
    };
};

const hardcodedDummies = [
    { id: 1, post_id:1, lat: 37.579617, lng: 126.977041, thumbnail_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNPabH4euPCr6sZ75LzJGWSz4c7X8lTPeK1A&s', title: '경복궁 데모' },
    { id: 2, post_id:2, lat: 37.550100, lng: 126.988000, thumbnail_url: 'https://img1.daumcdn.net/thumb/R1280x0.fjpg/?fname=https://t1.daumcdn.net/brunch/service/user/bUxO/image/CNVUiFf4ZuP8oLPqZr9L83WoopE.jpg', title: '남산 1' },
    { id: 3, post_id:3, lat: 37.550500, lng: 126.988500, thumbnail_url: 'https://media.triple.guide/triple-cms/c_limit,f_auto,h_1024,w_1024/5623e2d7-aee0-4933-85ff-e48db3d31da1.jpeg', title: '남산 2' },
];

let mapsLoaderPromise = null;

function loadGoogleMaps() {
  if (typeof window !== 'undefined' && window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }
  if (mapsLoaderPromise) return mapsLoaderPromise;

  mapsLoaderPromise = new Promise((resolve, reject) => {
    if (!MAPS_KEY) {
      console.error('[Maps] Missing VITE_GOOGLE_MAPS_API_KEY');
      reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'));
      return;
    }

    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&loading=async`;
    s.async = true;
    s.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        console.error('[Maps] google.maps not available (key error?)');
        resolve(null);
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
    { "featureType": "all", "elementType": "all", "stylers": [ { "hue": "#008eff" } ] },
    { "featureType": "poi", "elementType": "all", "stylers": [ { "visibility": "off" } ] },
    { "featureType": "road", "elementType": "all", "stylers": [ { "saturation": "0" }, { "lightness": "0" } ] },
    { "featureType": "transit", "elementType": "all", "stylers": [ { "visibility": "off" } ] },
    { "featureType": "water", "elementType": "all", "stylers": [ { "visibility": "simplified" }, { "saturation": "-60" }, { "lightness": "-20" } ] }
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
      styles: MAP_STYLES,
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
        let localMapPosts = readLocalPosts()
            .map(mapLocalPostForMap)
            .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
        
        if (!API_BASE) {
          const combinedFallback = [
              ...localMapPosts, 
              ...hardcodedDummies.filter(d => !localMapPosts.some(lp => lp.id === d.id))
          ];
          if (!cancelled) setPhotos(combinedFallback);
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
                      avatar_url: p.author?.avatar_url, 
                  });
              });

              const locationRes = await fetch(`${API_BASE}/posts/locations`);
              const locationData = await locationRes.json();
              const locationList = locationData?.result?.posts ?? [];

              const apiMergedList = locationList
                  .map(loc => {
                      const detail = detailedMap.get(loc.post_id); 
                      if (!detail) return null; 
                      return { 
                        id: loc.post_id, 
                        lat: loc.lat, 
                        lng: loc.lng, 
                        title: detail.title, 
                        thumbnail_url: detail.thumbnail_url, 
                        avatar_url: detail.avatar_url };
                  })
                  .filter(item => item !== null);

              const finalPhotos = [
                  ...localMapPosts,
                  ...apiMergedList.filter(ap => !localMapPosts.some(lp => lp.id === ap.id))
              ];
              
              if (!cancelled) setPhotos(finalPhotos);

          } catch (e) {
              console.error('[TabPlace] fetch and merge failed', e);
              if (!cancelled) setPhotos(localMapPosts); 
          } finally {
              if (!cancelled) setLoading(false);
          }
    };
    fetchLocations();

    return () => {
      cancelled = true;
    };
  }, [ready, photosProp.length, API_BASE]);

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
            
            icon: {
                url: thumbnail,
                size: new maps.Size(56, 56),
                scaledSize: new maps.Size(56, 56), 
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
            
            info.open(map, marker); 
            
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
      navigate('/home');
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

      {/* <p className="place-description">
        장소를 클릭하면 지도 해당 위치로 이동해요
      </p> */}

      <div ref={mapRef} className="map-container">
        {(!ready || loading) && (
          <div className="map-loading">지도를 불러오는 중…</div>
        )}
      </div>
    </section>
  );
}


