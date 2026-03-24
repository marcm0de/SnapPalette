// K-means clustering color extraction from images — fully client-side

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface ExtractedColor {
  hex: string;
  rgb: RGB;
  hsl: HSL;
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => {
        const hex = Math.round(v).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt(
    (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2
  );
}

function kMeans(pixels: RGB[], k: number, maxIterations = 20): RGB[] {
  // Initialize centroids with k-means++ for better starting points
  const centroids: RGB[] = [];
  centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);

  for (let i = 1; i < k; i++) {
    const distances = pixels.map((p) =>
      Math.min(...centroids.map((c) => colorDistance(p, c)))
    );
    const totalDist = distances.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalDist;
    for (let j = 0; j < distances.length; j++) {
      rand -= distances[j];
      if (rand <= 0) {
        centroids.push(pixels[j]);
        break;
      }
    }
    if (centroids.length <= i) {
      centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
    }
  }

  for (let iter = 0; iter < maxIterations; iter++) {
    const clusters: RGB[][] = Array.from({ length: k }, () => []);

    for (const pixel of pixels) {
      let minDist = Infinity;
      let closest = 0;
      for (let i = 0; i < k; i++) {
        const dist = colorDistance(pixel, centroids[i]);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      }
      clusters[closest].push(pixel);
    }

    let converged = true;
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue;
      const newCentroid: RGB = {
        r: clusters[i].reduce((s, p) => s + p.r, 0) / clusters[i].length,
        g: clusters[i].reduce((s, p) => s + p.g, 0) / clusters[i].length,
        b: clusters[i].reduce((s, p) => s + p.b, 0) / clusters[i].length,
      };
      if (colorDistance(centroids[i], newCentroid) > 1) {
        converged = false;
      }
      centroids[i] = newCentroid;
    }

    if (converged) break;
  }

  return centroids;
}

export function extractColors(
  imageData: ImageData,
  numColors = 6
): ExtractedColor[] {
  const { data, width, height } = imageData;
  const pixels: RGB[] = [];

  // Sample every 4th pixel to speed up processing
  const step = Math.max(1, Math.floor((width * height) / 10000));

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip transparent/near-transparent pixels
    if (a < 128) continue;
    // Skip near-white and near-black
    if (r + g + b < 30 || r + g + b > 735) continue;

    pixels.push({ r, g, b });
  }

  if (pixels.length === 0) {
    return [];
  }

  const centroids = kMeans(pixels, numColors);

  // Sort by luminance (dark to light)
  centroids.sort((a, b) => {
    const lumA = 0.299 * a.r + 0.587 * a.g + 0.114 * a.b;
    const lumB = 0.299 * b.r + 0.587 * b.g + 0.114 * b.b;
    return lumA - lumB;
  });

  return centroids.map((c) => ({
    hex: rgbToHex(c.r, c.g, c.b),
    rgb: {
      r: Math.round(c.r),
      g: Math.round(c.g),
      b: Math.round(c.b),
    },
    hsl: rgbToHsl(c.r, c.g, c.b),
  }));
}

export function imageFileToImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Scale down large images
      const maxDim = 300;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}
