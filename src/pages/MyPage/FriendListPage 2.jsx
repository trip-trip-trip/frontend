import React ,{useMemo,useState} from "react";
//하단 navbar import
import {useNavigate} from "react-router-dom";
import "./MyPage.css";
import defaultProfile from "../../assets/default-profile.png";
import "./FriendListPage.css"

const initialRequests = [
  { id: "req1", name: "김친구", mutualCount: 3, avatar: "" },
];
const initialFriends = Array.from({ length: 18 }).map((_, i) => ({
  id: `f${i + 1}`,
  name: `친구${i + 1}`,
  recentTrip: i % 2 === 0 ? "부산" : "경주",
  avatar: "",
}));

export default function FriendListPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [requests, setRequests] = useState(initialRequests);
  const [friends, setFriends] = useState(initialFriends);

  const filtered = useMemo(() => {
      const keyword = q.trim();
    if (!keyword) return friends;
    return friends.filter((f) => f.name.includes(keyword));
  }, [q, friends]);

  // 수락: 요청 → 친구목록으로 이동
  const acceptRequest = (id) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    //요청에서 제거
    setRequests((prev) => prev.filter((r) => r.id !== id));

    //친구목록에 추가
    setFriends((prev) => [
      { id: `f_${Date.now()}`, name: req.name, recentTrip: "-", avatar: req.avatar },
      ...prev,
    ]);
  };

  const rejectRequest = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };


  return (
    <div className="mypage friend-page">
      {/* 상단바 */}
      <div className="friend-topbar">
        <button className="icon-btn" onClick={() => navigate(-1)}>←</button>
        <h2>친구관리</h2>
        <div style={{ width: 24 }} /> {/* 오른쪽 여백 정렬용 */}
      </div>

      {/* 검색 */}
      <div className="friend-search-wrap">
        <input
          className="friend-search-input"
          type="text"
          placeholder="친구 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* 친구 요청 / 친구 목록 */}
    <div className="friend-scroll-area">
      {requests.length > 0 && (
        <section className="friend-section">
          <h3 className="friend-section-title">친구 요청</h3>
          {requests.map((r) => (
            <div key={r.id} className="friend-request-item">
              <img
                src={r.avatar || defaultProfile}
                alt=""
                className="friend-avatar"
              />
              <div className="friend-info">
                <div className="friend-name">{r.name}</div>
                <div className="friend-sub">공통 친구 {r.mutualCount}명</div>
              </div>
              <div className="friend-request-actions">
                <button className="btn-accept" onClick={() => acceptRequest(r.id)}>수락</button>
                <button className="btn-reject" onClick={() => rejectRequest(r.id)}>거절</button>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="friend-section">
        <h3 className="friend-section-title">
          친구 목록 <span className="count">({friends.length}명)</span>
        </h3>
        <ul className="friend-list">
          {filtered.map((f) => (
            <li key={f.id} className="friend-item">
          <img
                src={f.avatar || defaultProfile}
                alt=""
                className="friend-avatar"
              />
              <div className="friend-info">
                <div className="friend-name">{f.name}</div>
                <div className="friend-sub">최근 여행: {f.recentTrip}</div>
              </div>
              <button className="kebab" aria-label="more">⋮</button>
            </li>
          ))}
           
        </ul>
      </section>


   
      <div style={{ height: 64 }} />
    </div>
     </div>
  );
}