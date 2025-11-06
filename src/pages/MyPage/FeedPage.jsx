import React from "react";
import "./MyPage.css";
// import BottomNav from "../../components/BottomNav"; //navbar
 import dummyUser from "./dummyUser";

export default function FeedPage() {
  const posts = dummyUser.posts;

  return (
    <div className="page-container">
      <header className="feed-header">
        <img
          src={dummyUser.profileImage || "/default-profile.png"}
          alt="프로필"
          className="feed-profile"
        />
        <span className="feed-username">{dummyUser.username}</span>
      </header>

      <section className="feed-list">
        {posts.map((post, i) => (
          <div key={i} className="feed-card">
            <div className="feed-image" style={{ backgroundColor: post.color }} />
            <p className="feed-caption">{post.caption}</p>
          </div>
        ))}
      </section>

      <BottomNav current="feed" />
    </div>
  );
}
