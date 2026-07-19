export const compressImageToWebp = (file: File, maxSizeKB: number = 400): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get 2d context"));
        return;
      }

      // Max dimension 1024x1024 to keep memory low and compression efficient
      const MAX_DIM = 1024;
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        }
      } else {
        if (height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }
      }
      
      width = Math.floor(width);
      height = Math.floor(height);
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Sharpen (Convolution Matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0])
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const w = width;
      const h = height;
      const output = ctx.createImageData(w, h);
      const outData = output.data;
      
      const kernel = [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
      ];
      
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dstOff = (y * w + x) * 4;
          let r = 0, g = 0, b = 0;
          
          for (let cy = 0; cy < 3; cy++) {
            for (let cx = 0; cx < 3; cx++) {
              const scy = Math.min(Math.max(y + cy - 1, 0), h - 1);
              const scx = Math.min(Math.max(x + cx - 1, 0), w - 1);
              const srcOff = (scy * w + scx) * 4;
              const wt = kernel[cy * 3 + cx];
              r += data[srcOff] * wt;
              g += data[srcOff + 1] * wt;
              b += data[srcOff + 2] * wt;
            }
          }
          outData[dstOff] = Math.min(Math.max(r, 0), 255);
          outData[dstOff + 1] = Math.min(Math.max(g, 0), 255);
          outData[dstOff + 2] = Math.min(Math.max(b, 0), 255);
          outData[dstOff + 3] = data[dstOff + 3]; // keep original alpha
        }
      }
      
      ctx.putImageData(output, 0, 0);

      const targetSize = maxSizeKB * 1024;
      let quality = 0.9;
      
      const tryCompress = () => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Compression failed"));
            return;
          }
          if (blob.size <= targetSize || quality <= 0.1) {
            resolve(blob);
          } else {
            quality -= 0.1;
            tryCompress();
          }
        }, 'image/webp', quality);
      };
      
      tryCompress();
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};
