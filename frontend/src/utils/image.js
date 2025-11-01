// frontend/src/utils/image.js
/* eslint-disable no-loop-func */
// Utility to resize/compress an image File to a target max dimension and quality.

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function loadBitmap(file) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file);
    } catch (_) { /* fallback to HTMLImageElement below */ }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function resizeImageFile(file, opts = {}) {
  const {
    maxDimension = 512,
    mimeType = "image/jpeg",
    initialQuality = 0.85,
    maxBytes = 1024 * 1024, // 1MB safety cap after compression
  } = opts;

  const bmp = await loadBitmap(file);
  const srcW = bmp.width;
  const srcH = bmp.height;
  const scale = Math.min(1, maxDimension / Math.max(srcW, srcH));
  const dstW = Math.max(1, Math.round(srcW * scale));
  const dstH = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = dstW;
  canvas.height = dstH;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bmp, 0, 0, dstW, dstH);

  // Try quality ladder if needed to fit under maxBytes
  let quality = initialQuality;
  let blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
  if (!blob) throw new Error("Failed to generate image blob");

  while (blob.size > maxBytes && quality > 0.4) {
    quality -= 0.1;
    // eslint-disable-next-line no-await-in-loop
    blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
    if (!blob) break;
  }

  const dataUrl = await blobToDataURL(blob);
  // Wrap into a File so FormData carries a filename
  const fileName = file.name?.replace(/\.[^.]+$/, ".jpg") || "avatar.jpg";
  const outFile = new File([blob], fileName, { type: blob.type || mimeType, lastModified: Date.now() });
  return { file: outFile, dataUrl, meta: { srcW, srcH, dstW, dstH, quality } };
}
