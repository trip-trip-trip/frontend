import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostCreate.css';

const LS_KEY = 'tripshot_posts';

export default function PostCreate() {
  const nav = useNavigate();

  const readPosts = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch { return []; }
  };
  const writePosts = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));

  // form states
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [title, setTitle] = useState('');
  const [locationText, setLocationText] = useState('');
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState('friends');
  const [loading, setLoading] = useState(false);

  const canShare = useMemo(() => !!preview && !loading, [preview, loading]);

  const onPick = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (!f) { setPreview(''); return; }
    const r = new FileReader();
    r.onload = () => setPreview(String(r.result));
    r.readAsDataURL(f);
  };

  // 게시물 저장
  const share = () => {
    if (!preview) return alert('사진을 선택하세요.');
    setLoading(true);
    try {
      const posts = readPosts();
      posts.unshift({
        id: String(Date.now()),
        userName: 'me',
        author_avatar: 'https://placehold.co/48x48/CCCCCC/FFF?text=ME',
        image: preview,
        title: title,
        content: content,
        location: locationText,   // 텍스트 위치 저장
        privacy,
        likes: 0,
        comments: 0,
        is_liked: false,
        createdAt: Date.now(),
      });
      writePosts(posts);

      nav('/', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compose">
      <header className="compose-header">
        <button onClick={() => nav(-1)} aria-label="뒤로">←</button>
        <div>새 게시물</div>
        <button className="share" disabled={!canShare} onClick={share}>
          {loading ? '업로드…' : '공유'}
        </button>
      </header>

      <main className="compose-body">

        {/* 파일 선택 */}
        <div className="picker-row">
          <label className="picker">
            {preview
              ? <img src={preview} alt="preview" />
              : <div className="placeholder">사진/영상 선택</div>
            }
            <input type="file" accept="image/*,video/*" hidden onChange={onPick} />
          </label>
        </div>

        {/* 제목 */}
        <div className="form-row">
          <label>제목</label>
          <input
            placeholder="제목(선택)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 위치 텍스트 입력 */}
        <div className="form-row">
          <label>위치</label>
          <input
            placeholder="예: 서울 종로구 / 도쿄 시부야"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
          />
        </div>

        {/* 내용 */}
        <div className="form-row">
          <label>내용</label>
          <textarea
            rows={4}
            placeholder="오늘의 여행은 어떠셨나요?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* 공개 범위 */}
        <div className="form-row">
          <label>공개설정</label>
          <div className="radios">
            <label>
              <input
                type="radio"
                value="friends"
                checked={privacy === 'friends'}
                onChange={() => setPrivacy('friends')}
              /> 친구만
            </label>
            <label>
              <input
                type="radio"
                value="private"
                checked={privacy === 'private'}
                onChange={() => setPrivacy('private')}
              /> 비공개
            </label>
          </div>
        </div>

      </main>
    </div>
  );
}
