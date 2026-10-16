// Ink texture engine: punches pseudo-random alpha holes into a rendered layer
// so printed stamps look like real, imperfect rubber impressions.

/** Mutates an ImageData buffer, dropping alpha in a noisy, clustered pattern. */
export function distressImageData(imageData, intensity, seed = 1) {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const amount = Math.max(0, Math.min(100, intensity)) / 100;
  if (amount <= 0) return imageData;

  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  // Low frequency blotch field.
  const cell = 7;
  const cw = Math.ceil(w / cell);
  const ch = Math.ceil(h / cell);
  const field = new Float32Array(cw * ch);
  for (let i = 0; i < field.length; i++) field[i] = rand();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] === 0) continue;
      const blotch = field[Math.floor(y / cell) * cw + Math.floor(x / cell)];
      const speck = rand();
      const erosion = blotch * 0.65 + speck * 0.35;
      if (erosion < amount * 0.55) {
        data[idx + 3] = 0;
      } else if (erosion < amount * 0.85) {
        data[idx + 3] = Math.floor(data[idx + 3] * (1 - amount * 0.7));
      }
    }
  }
  return imageData;
}

/** Applies the distress pass to a raw <canvas> element in place. */
export function distressCanvasElement(el, intensity, seed) {
  const ctx = el.getContext("2d", { willReadFrequently: true });
  if (!ctx) return el;
  const img = ctx.getImageData(0, 0, el.width, el.height);
  distressImageData(img, intensity, seed);
  ctx.putImageData(img, 0, 0);
  return el;
}

/** Grayscale + high contrast conversion used by the "stamp filter" toggle. */
export function stampifyCanvasElement(el, threshold = 150) {
  const ctx = el.getContext("2d", { willReadFrequently: true });
  if (!ctx) return el;
  const img = ctx.getImageData(0, 0, el.width, el.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (lum > threshold) {
      d[i + 3] = 0;
    } else {
      d[i] = 0;
      d[i + 1] = 0;
      d[i + 2] = 0;
    }
  }
  ctx.putImageData(img, 0, 0);
  return el;
}
