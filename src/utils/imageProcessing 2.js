// src/utils/imageProcessing.js (새 파일 생성)
export const applyFilmEffect = (imageDataUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageDataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0);

      // 흑백 + 세피아 + 콘트라스트 조절 (예시)
      ctx.filter = 'grayscale(30%) sepia(50%) contrast(120%)';
      ctx.drawImage(img, 0, 0); // 필터 적용된 이미지를 다시 그림

      // 노이즈 추가 (더 복잡한 로직이 필요할 수 있습니다)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (0.5 - Math.random()) * 20; // -10 ~ +10 랜덤 노이즈
        data[i] = data[i] + noise;     // R
        data[i + 1] = data[i + 1] + noise; // G
        data[i + 2] = data[i + 2] + noise; // B
      }
      ctx.putImageData(imageData, 0, 0);

      resolve(canvas.toDataURL('image/jpeg'));
    };
  });
};