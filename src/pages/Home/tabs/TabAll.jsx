import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TabAll.css';

const TabAll = ({ activeTrip, posts = [] }) => {
  const navigate = useNavigate();
  const goShoot = () => navigate('/camera');

  return (
    <section className="taball">
      {activeTrip && (
        <div className="live-card">
          <div className="live-head">
            <div>
              <h3 className="live-title">{activeTrip.title}</h3>
              <p className="live-sub">진행중 · {activeTrip.members}명 참여</p>
            </div>
            <span className="live-badge">LIVE</span>
          </div>

          <button className="live-cta" onClick={goShoot} aria-label="지금 촬영하러 가기">
            <span className="rec-dot" />
            지금 촬영하러 가기
          </button>
        </div>
      )}
      
      <div className="feed-list">
        {posts.map((p) => (
          <article className="post" key={p.id}>
            <header className="post-header">
              <div className="avatar" />
              <div className="ph-meta">
                <div className="ph-top">
                  <strong className="name">{p.userName ?? 'username'}</strong>
                  <span className="location">{p.location ?? '부산'}</span>
                </div>
                <div className="time">{p.timeAgo ?? '3시간 전'}</div>
              </div>
            </header>

            <div className="post-media" />

            <div className="post-reactions">
              {/* <span className="mag">💬</span> */}
              <span className="r">❤️ {p.likes ?? 24}</span>
              <span className="r">😊 {p.smiles ?? 13}</span>
              <span className="r">👍 {p.thumbs ?? 2}</span>
              <span className="r">😮 {p.wows ?? 0}</span>
              <span className="r">😡 {p.angry ?? 0}</span>
            </div>

            <div className="post-caption">
              <strong className="name">{p.userName ?? 'username'}</strong>
              <span className="text">{p.caption ?? '부산에서 여유로운 하루... #여행'}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TabAll;
