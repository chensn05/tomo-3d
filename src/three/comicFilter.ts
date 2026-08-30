/**
 * 漫画/手绘风格滤镜 v3 - 参考喜茶/日式复古手绘风
 * 大幅优化：暖色调映射 + 多级描边 + 贴纸白边 + 纸张纹理 + 晕影
 */

export interface ComicOptions {
  posterizeLevels?: number
  edgeStrength?: number
  warmOverlay?: number
  halftone?: boolean
  saturate?: number
  stickerBorder?: boolean
  vignette?: boolean
}

// 暖色调色板 - 参考手绘插画
const warmPalette = [
  [255, 248, 240],  // 米白
  [255, 235, 200],  // 奶油
  [255, 220, 170],  // 杏色
  [255, 200, 140],  // 暖黄
  [240, 170, 110],  // 姜黄
  [220, 140, 90],   // 棕黄
  [200, 100, 70],   // 砖红
  [180, 70, 50],    // 番茄红
  [140, 50, 40],    // 深红
  [90, 35, 30],     // 暗棕
  [50, 25, 20],     // 深棕
  [20, 10, 8],      // 近黑
]

function findClosestPaletteColor(r: number, g: number, b: number): [number, number, number] {
  let minDist = Infinity
  let closest = warmPalette[0]
  for (const [pr, pg, pb] of warmPalette) {
    const dr = r - pr, dg = g - pg, db = b - pb
    const dist = dr * dr + dg * dg + db * db
    if (dist < minDist) { minDist = dist; closest = [pr, pg, pb] as [number, number, number] }
  }
  return closest
}

export function applyComicStyle(
  srcCanvas: HTMLCanvasElement,
  dstCanvas: HTMLCanvasElement,
  options: ComicOptions = {}
): void {
  const {
    edgeStrength = 0.8,
    warmOverlay = 0.3,
    halftone = true,
    saturate = 1.4,
    stickerBorder = true,
    vignette = true,
  } = options

  const sw = srcCanvas.width, sh = srcCanvas.height
  const dw = dstCanvas.width, dh = dstCanvas.height
  const srcCtx = srcCanvas.getContext('2d')!
  const dstCtx = dstCanvas.getContext('2d')!

  // 1. 画原图
  dstCtx.drawImage(srcCanvas, 0, 0, sw, sh, 0, 0, dw, dh)

  // 2. 读取像素
  const imageData = dstCtx.getImageData(0, 0, dw, dh)
  const data = imageData.data
  const totalPixels = dw * dh
  const gray = new Float32Array(totalPixels)

  // 3. 饱和度 + 暖色偏移 + 灰度
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4
    let r = data[idx], g = data[idx + 1], b = data[idx + 2]
    const avg = (r + g + b) / 3
    gray[i] = avg
    r = avg + (r - avg) * saturate
    g = avg + (g - avg) * saturate
    b = avg + (b - avg) * saturate
    r = Math.min(255, r + 12)
    g = Math.min(255, g + 3)
    b = Math.max(0, b - 15)
    data[idx] = r; data[idx + 1] = g; data[idx + 2] = b
  }

  // 4. 色板映射（用暖色调色板）
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4
    const [pr, pg, pb] = findClosestPaletteColor(data[idx], data[idx + 1], data[idx + 2])
    data[idx] = pr; data[idx + 1] = pg; data[idx + 2] = pb
  }

  // 保存色板映射后的结果
  const palettedData = new Uint8ClampedArray(data)

  // 5. 边缘检测（用更大的核 - 3x3 Sobel）
  const edges = new Float32Array(totalPixels)
  for (let y = 2; y < dh - 2; y++) {
    for (let x = 2; x < dw - 2; x++) {
      const idx = y * dw + x
      // 3x3 Sobel X
      const gx = (
        -gray[idx - 2 - dw * 2] - 2 * gray[idx - dw * 2] - gray[idx + 2 - dw * 2]
        + gray[idx - 2 + dw * 2] + 2 * gray[idx + dw * 2] + gray[idx + 2 + dw * 2]
      ) / 4
      // 3x3 Sobel Y
      const gy = (
        -gray[idx - 2 - dw * 2] - 2 * gray[idx - 2] - gray[idx - 2 + dw * 2]
        + gray[idx + 2 - dw * 2] + 2 * gray[idx + 2] + gray[idx + 2 + dw * 2]
      ) / 4
      const mag = Math.sqrt(gx * gx + gy * gy) / 255
      edges[idx] = Math.min(1, mag * edgeStrength * 4)
    }
  }

  // 6. 合并边缘 + 色板颜色
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4
    const edge = edges[i]
    if (edge > 0.25) {
      // 强边缘 → 深棕黑色描边
      const darkness = 1 - Math.min(0.9, edge * 1.2)
      data[idx] = palettedData[idx] * darkness * 0.5
      data[idx + 1] = palettedData[idx + 1] * darkness * 0.4
      data[idx + 2] = palettedData[idx + 2] * darkness * 0.3
    } else if (edge > 0.1) {
      // 弱边缘 → 轻微加深
      const factor = 0.85
      data[idx] = palettedData[idx] * factor
      data[idx + 1] = palettedData[idx + 1] * factor
      data[idx + 2] = palettedData[idx + 2] * factor
    } else {
      data[idx] = palettedData[idx]
      data[idx + 1] = palettedData[idx + 1]
      data[idx + 2] = palettedData[idx + 2]
    }
  }
  dstCtx.putImageData(imageData, 0, 0)

  // 7. 暖色叠加
  dstCtx.globalCompositeOperation = 'multiply'
  const warmGrad = dstCtx.createLinearGradient(0, 0, dw, dh)
  warmGrad.addColorStop(0, `rgba(255, 230, 200, ${warmOverlay})`)
  warmGrad.addColorStop(0.5, `rgba(255, 240, 220, ${warmOverlay * 0.4})`)
  warmGrad.addColorStop(1, `rgba(250, 215, 180, ${warmOverlay})`)
  dstCtx.fillStyle = warmGrad
  dstCtx.fillRect(0, 0, dw, dh)

  // 8. 高光提亮
  dstCtx.globalCompositeOperation = 'screen'
  dstCtx.fillStyle = 'rgba(255, 250, 235, 0.06)'
  dstCtx.fillRect(0, 0, dw, dh)
  dstCtx.globalCompositeOperation = 'source-over'

  // 9. 半调网点
  if (halftone) {
    const spacing = 5
    dstCtx.save()
    dstCtx.globalAlpha = 0.12
    for (let y = 0; y < dh; y += spacing) {
      for (let x = 0; x < dw; x += spacing) {
        const idx = y * dw + x
        const brightness = (palettedData[idx] + palettedData[idx + 1] + palettedData[idx + 2]) / 3
        const radius = (1 - brightness / 255) * 2.5
        if (radius > 0.5) {
          dstCtx.fillStyle = `rgba(60, 35, 20, ${0.2 + (1 - brightness / 255) * 0.3})`
          dstCtx.beginPath()
          dstCtx.arc(x, y, radius, 0, Math.PI * 2)
          dstCtx.fill()
        }
      }
    }
    dstCtx.restore()
  }

  // 10. 晕影
  if (vignette) {
    const vignette = dstCtx.createRadialGradient(dw / 2, dh / 2, dw * 0.3, dw / 2, dh / 2, dw * 0.7)
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(1, 'rgba(40,20,10,0.25)')
    dstCtx.fillStyle = vignette
    dstCtx.fillRect(0, 0, dw, dh)
  }

  // 11. 贴纸白边
  if (stickerBorder) {
    const borderWidth = 6
    // 外边框 - 白色
    dstCtx.strokeStyle = 'rgba(255, 250, 240, 0.9)'
    dstCtx.lineWidth = borderWidth
    dstCtx.strokeRect(borderWidth / 2, borderWidth / 2, dw - borderWidth, dh - borderWidth)
    // 内描边 - 深棕
    dstCtx.strokeStyle = 'rgba(60, 35, 20, 0.3)'
    dstCtx.lineWidth = 1
    dstCtx.strokeRect(borderWidth, borderWidth, dw - borderWidth * 2, dh - borderWidth * 2)
  }

  // 12. 轻微纸张纹理（用简单的噪点）
  dstCtx.globalCompositeOperation = 'overlay'
  dstCtx.globalAlpha = 0.02
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * dw
    const y = Math.random() * dh
    const size = Math.random() * 2
    dstCtx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000'
    dstCtx.fillRect(x, y, size, size)
  }
  dstCtx.globalAlpha = 1
  dstCtx.globalCompositeOperation = 'source-over'
}
