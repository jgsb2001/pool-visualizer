/**
 * Generates procedural textures for pool interior presets.
 * These serve as built-in defaults until real PBR textures are added.
 * Each returns a tileable canvas suitable for use as a Three.js texture source.
 */

const TEXTURE_SIZE = 512;

/**
 * Pebble Tec — granular, speckled surface with visible aggregate.
 */
export function createPebbleTecCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext('2d')!;

  // Base color — warm sandy tone
  ctx.fillStyle = '#b8a88a';
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  // Add random pebble-like speckles
  const pebbleColors = [
    '#a09070', '#c0b090', '#8a7a60', '#d0c0a0',
    '#907860', '#b0a080', '#706050', '#c8b898',
  ];

  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * TEXTURE_SIZE;
    const y = Math.random() * TEXTURE_SIZE;
    const radius = 1 + Math.random() * 3;
    const color = pebbleColors[Math.floor(Math.random() * pebbleColors.length)];

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  // Subtle noise overlay for texture
  const imageData = ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 15;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);

  return canvas;
}

/**
 * Plaster — smooth, lightly textured surface.
 */
export function createPlasterCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext('2d')!;

  // Base color — light blue-white
  ctx.fillStyle = '#d8e8f0';
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  // Subtle variation with very soft noise
  const imageData = ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);

  // Add very faint trowel streaks
  ctx.strokeStyle = 'rgba(200, 220, 230, 0.3)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    const y = Math.random() * TEXTURE_SIZE;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      TEXTURE_SIZE * 0.3,
      y + (Math.random() - 0.5) * 20,
      TEXTURE_SIZE * 0.7,
      y + (Math.random() - 0.5) * 20,
      TEXTURE_SIZE,
      y + (Math.random() - 0.5) * 10,
    );
    ctx.stroke();
  }

  return canvas;
}
