import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TabPlace.css';
import homePlace from '../../../assets/home_placeLogo.png';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

const MAPS_KEY = 'AIzaSyBxUpz_y5O2nOTivngRz6fVvYHtG91i75M';
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const FALLBACK_THUMB = `${window.location.origin}/icons/tripshot.png`;
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 }; //서울 중심

const LS_KEY = 'tripshot_posts';

const readLocalPosts = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch { return []; }
};

const toAbsolute = (path) => {
    if (!path) return FALLBACK_THUMB;
    if (path.startsWith('http')) return path;
    return `${window.location.origin}${path}`;
};

const mapLocalPostForMap = (p) => ({
    id: p.id,
    post_id: p.id,
    lat: p.lat,
    lng: p.lng,
    title: p.title || p.content,
    thumbnail_url: toAbsolute(p.images?.[0] || p.image),
    author_avatar: p.author_avatar,
});

/*  fallback dummy */
const hardcodedDummies = [
    // { id: 1, post_id: 1, lat: 37.579617, lng: 126.977041, thumbnail_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNPabH4euPCr6sZ75LzJGWSz4c7X8lTPeK1A&s', title: '경복궁 데모' },
    { id: 2, post_id: 2, lat: 37.550000, lng: 126.988000, thumbnail_url: 'https://img1.daumcdn.net/thumb/R1280x0.fjpg/?fname=https://t1.daumcdn.net/brunch/service/user/bUxO/image/CNVUiFf4ZuP8oLPqZr9L83WoopE.jpg', title: '남산 1' },
    { id: 3, post_id: 3, lat: 37.550500, lng: 126.988500, thumbnail_url: 'https://media.triple.guide/triple-cms/c_limit,f_auto,h_1024,w_1024/5623e2d7-aee0-4933-85ff-e48db3d31da1.jpeg', title: '남산 2' }
];

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

/* 지도 스타일  */
const MAP_STYLES = [
  { featureType: "all", elementType: "all", stylers: [{ hue: "#a7c5df" }] },
  { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "all", stylers: [{ saturation: "0" }, { lightness: "0" }] },
  { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      { color: "#a7c5df" },   //  물 색깔
      { saturation: 0 },
      { lightness: 0 }
    ]
  }
];



/* 메인 컴포넌트  */
export default function TabPlace({ activeTrip = true, photos: photosProp = [], setTab }) {
    const navigate = useNavigate();

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const infoWindowRef = useRef(null);
    const clustererRef = useRef(null);

    const [ready, setReady] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);

    /* 지도 SDK 로드 */
    useEffect(() => {
        let cancel = false;
        loadGoogleMaps().then(() => {
            if (!cancel) setReady(true);
        });
        return () => (cancel = true);
    }, []);

    /* 지도 생성 */
    useEffect(() => {
        if (!ready || !mapRef.current) return;

        const maps = window.google.maps;
        const map = new maps.Map(mapRef.current, {
            center: DEFAULT_CENTER,
            zoom: 12,
            disableDefaultUI: true,
            gestureHandling: "greedy",
            styles: MAP_STYLES,
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new maps.InfoWindow();
    }, [ready]);

    /* 데이터 fetch */
    useEffect(() => {
        if (!ready) return;

        let cancel = false;

        const load = async () => {
            let localPosts = readLocalPosts()
                .map(mapLocalPostForMap)
                .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));

            if (!API_BASE) {
                setPhotos([...localPosts, ...hardcodedDummies]);
                return;
            }

            setLoading(true);

            try {
                const detailRes = await fetch(`${API_BASE}/posts?feed_type=all&limit=200`);
                const detailJson = await detailRes.json();
                const details = detailJson?.result?.posts ?? [];

                const detailMap = new Map();
                details.forEach((p) => detailMap.set(p.id, {
                    title: p.caption ?? "사진",
                    thumbnail_url: p.media?.[0]?.thumbnail_url
                        ? toAbsolute(p.media[0].thumbnail_url)
                        : FALLBACK_THUMB,
                    avatar_url: p.author?.avatar_url,
                }));

                const locRes = await fetch(`${API_BASE}/posts/locations`);
                const locJson = await locRes.json();
                const locList = locJson?.result?.posts ?? [];

                const merged = locList.map((loc) => {
                    const d = detailMap.get(loc.post_id);
                    if (!d) return null;
                    return {
                        id: loc.post_id,
                        lat: loc.lat,
                        lng: loc.lng,
                        title: d.title,
                        thumbnail_url: d.thumbnail_url,
                        avatar_url: d.avatar_url,
                    };
                }).filter(Boolean);

                const finalPhotos = [
                    ...localPosts,
                    ...merged.filter((p) => !localPosts.some(lp => lp.id === p.id))
                ];

                if (!cancel) setPhotos(finalPhotos);
            }
            catch (e) {
                console.error("API failed → fallback", e);
                if (!cancel) setPhotos([...localPosts, ...hardcodedDummies]);
            }
            finally {
                setLoading(false);
            }
        };

        load();
        return () => (cancel = true);
    }, [ready]);

    /* 마커 + 클러스터 표시 */
    useEffect(() => {
        const maps = window.google?.maps;
        const map = mapInstanceRef.current;
        const info = infoWindowRef.current;

        if (!maps || !map || !info) return;

        if (clustererRef.current) clustererRef.current.clearMarkers();

        const list = photos.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));

        if (list.length === 0) return;

        const markers = list.map((p) => {
            const marker = new maps.Marker({
                position: { lat: p.lat, lng: p.lng },
                map,
                icon: {
                    url: p.thumbnail_url,
                    size: new maps.Size(56, 56),
                    scaledSize: new maps.Size(56, 56),
                    anchor: new maps.Point(28, 56),
                }
            });

            marker.addListener("click", () => {
                info.setContent(`
                    <div class="info-window">
                        <img src="${p.thumbnail_url}" class="info-img" />
                        <div class="info-title">${p.title}</div>
                    </div>
                `);
                info.open(map, marker);

                setTimeout(() => {
                    const el = document.querySelector(".info-window");
                    if (el) el.onclick = () => navigate(`/post/${p.id}`);
                }, 50);
            });

            return marker;
        });

        clustererRef.current = new MarkerClusterer({ map, markers });
    }, [photos]);

    /* 피드로 돌아가기 */
    const goBack = () => {
        if (setTab) setTab("all");
        else navigate("/home");
    };

    /* 렌더링 */
    return (
        <section className="tabplace">
            <div className="place-header-controls">
                <div className="place-title-group">
                    <img src={homePlace} alt="map-icon" className="place-icon" />
                </div>

                <button className="back-to-feed-btn" onClick={goBack}>
                    피드로 돌아가기
                </button>
            </div>

            <div ref={mapRef} className="map-container">
                {(!ready || loading) && (
                    <div className="map-loading">지도를 불러오는 중…</div>
                )}
            </div>
        </section>
    );
}