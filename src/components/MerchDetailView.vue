<template>
  <div class="merch-detail-overlay" v-if="visible" @click.self="close">
    <div class="detail-stage" :class="entranceClass">

      <!-- 左上角装饰文字 -->
      <div class="stage-brand">*TOMO time.</div>

      <!-- 装饰星 -->
      <div class="stage-star s1">★</div>
      <div class="stage-star s2">★</div>
      <div class="stage-star s3">★</div>
      <div class="stage-star s4">★</div>

      <!-- 中央展示区 -->
      <div class="stage-canvas-wrapper">
        <canvas ref="stageCanvas" width="360" height="360" class="stage-canvas"></canvas>
        <div class="stage-glow"></div>
      </div>

      <!-- 信息区 -->
      <div class="stage-info">
        <div class="stage-name">{{ item?.name }}</div>
        <div class="stage-style">{{ item?.style }}</div>
        <div class="stage-desc">{{ item?.desc }}</div>
        <div class="stage-tags">
          <span class="stage-tag" v-for="tag in item?.tags" :key="tag">{{ tag }}</span>
        </div>
        <button class="stage-download" @click="download">保存插画 ↓</button>
      </div>

      <!-- 关闭 -->
      <button class="stage-close" @click="close"><TomoIcon name="close" /></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

export interface MerchDisplay {
  id: string
  name: string
  style: string
  desc: string
  tags: string[]
  type: 'art' | 'magnet' | 'keychain' | 'pin' | 'figure_wave' | 'figure_sit' | 'figure_jump'
  imageUrl?: string // for art type
}

const props = defineProps<{
  visible: boolean
  item: MerchDisplay | null
}>()

const emit = defineEmits<{ close: [] }>()

const stageCanvas = ref<HTMLCanvasElement>()
const entranceClass = ref('')

function close() {
  entranceClass.value = 'leaving'
  setTimeout(() => { emit('close') }, 300)
}

function download() {
  if (!stageCanvas.value) return
  const link = document.createElement('a')
  link.download = `tomo-${props.item?.id}-${Date.now()}.png`
  link.href = stageCanvas.value.toDataURL('image/png')
  link.click()
}

watch(() => props.visible, (v) => {
  if (v) {
    entranceClass.value = ''
    nextTick(() => {
      entranceClass.value = 'entering'
      drawStage()
    })
  }
})

watch(() => props.item, () => { if (props.visible) drawStage() })

function drawStage() {
  const canvas = stageCanvas.value
  const item = props.item
  if (!canvas || !item) return
  const ctx = canvas.getContext('2d')!
  const w = canvas.width, h = canvas.height

  // 背景：暖沙色渐变
  const bgGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.1, w / 2, h / 2, w * 0.7)
  bgGrad.addColorStop(0, '#fef0d8')
  bgGrad.addColorStop(0.7, '#f5e0b8')
  bgGrad.addColorStop(1, '#e8d098')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, w, h)

  // 光晕
  const glow = ctx.createRadialGradient(w / 2, h * 0.42, w * 0.05, w / 2, h * 0.42, w * 0.35)
  glow.addColorStop(0, 'rgba(255,245,200,0.4)')
  glow.addColorStop(1, 'rgba(255,245,200,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  // 阴影（物体下方）
  ctx.fillStyle = 'rgba(120,80,40,0.12)'
  ctx.beginPath()
  ctx.ellipse(w / 2, h * 0.78, w * 0.25, w * 0.04, 0, 0, Math.PI * 2)
  ctx.fill()

  if (item.type === 'art' && item.imageUrl) {
    // AI 插画直接画上来
    const img = new Image()
    img.onload = () => {
      // 圆角裁剪
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(w * 0.1, h * 0.08, w * 0.8, h * 0.72, 16)
      ctx.clip()
      ctx.drawImage(img, w * 0.1, h * 0.08, w * 0.8, h * 0.72)
      ctx.restore()
      // 白边框
      ctx.strokeStyle = '#fffaf0'
      ctx.lineWidth = 8
      ctx.beginPath()
      ctx.roundRect(w * 0.1 - 4, h * 0.08 - 4, w * 0.8 + 8, h * 0.72 + 8, 18)
      ctx.stroke()
      // 装饰星
      drawDecoStars(ctx, w, h)
    }
    img.src = item.imageUrl
  } else {
    // 3D 周边 - 用 Canvas 精致绘制
    draw3DMerch(ctx, w, h, item.type)
    drawDecoStars(ctx, w, h)
  }
}

function drawDecoStars(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const stars = [
    [w * 0.12, h * 0.15, 10, '#ee4444'],
    [w * 0.88, h * 0.2, 8, '#ee4444'],
    [w * 0.15, h * 0.85, 7, '#c8884a'],
    [w * 0.85, h * 0.82, 9, '#ee4444'],
  ]
  stars.forEach(([x, y, s, c]) => {
    ctx.fillStyle = c as string
    ctx.beginPath()
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2
      const r = i % 2 === 0 ? s as number : (s as number) * 0.4
      if (i === 0) ctx.moveTo(x as number + Math.cos(a) * r, y as number + Math.sin(a) * r)
      else ctx.lineTo(x as number + Math.cos(a) * r, y as number + Math.sin(a) * r)
    }
    ctx.closePath()
    ctx.fill()
  })
}

// ── 精致 3D 周边展示（Canvas 绘制）──
function draw3DMerch(ctx: CanvasRenderingContext2D, w: number, h: number, type: string) {
  const cx = w / 2, cy = h * 0.42

  if (type.startsWith('figure')) {
    drawFigureDetail(ctx, cx, cy, w, type)
  } else if (type === 'magnet') {
    drawMagnetDetail(ctx, cx, cy, w)
  } else if (type === 'keychain') {
    drawKeychainDetail(ctx, cx, cy, w)
  } else if (type === 'pin') {
    drawPinDetail(ctx, cx, cy, w)
  }
}

function drawTomatoFace(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, happy = true) {
  // 身体
  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r)
  grad.addColorStop(0, '#ff8888')
  grad.addColorStop(1, '#cc2222')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  // 高光
  ctx.fillStyle = 'rgba(255,200,200,0.4)'
  ctx.beginPath()
  ctx.ellipse(cx - r * 0.3, cy - r * 0.35, r * 0.15, r * 0.08, -0.5, 0, Math.PI * 2)
  ctx.fill()
  // 叶子
  ctx.fillStyle = '#2ed573'
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2
    const lx = cx + Math.cos(a) * r * 0.2
    const ly = cy - r + r * 0.1 + Math.sin(a) * r * 0.15
    ctx.beginPath()
    ctx.moveTo(lx, ly - r * 0.3)
    ctx.lineTo(lx - r * 0.13, ly + r * 0.04)
    ctx.lineTo(lx + r * 0.13, ly + r * 0.04)
    ctx.closePath()
    ctx.fill()
  }
  // 眼睛
  ctx.fillStyle = '#2a1810'
  if (happy) {
    ctx.strokeStyle = '#2a1810'
    ctx.lineWidth = r * 0.06
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(cx - r * 0.28, cy - r * 0.05, r * 0.1, Math.PI * 1.2, Math.PI * 1.8)
    ctx.arc(cx + r * 0.28, cy - r * 0.05, r * 0.1, Math.PI * 1.2, Math.PI * 1.8)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.arc(cx - r * 0.28, cy - r * 0.08, r * 0.08, 0, Math.PI * 2)
    ctx.arc(cx + r * 0.28, cy - r * 0.08, r * 0.08, 0, Math.PI * 2)
    ctx.fill()
  }
  // 腮红
  ctx.fillStyle = 'rgba(255,155,179,0.6)'
  ctx.beginPath()
  ctx.arc(cx - r * 0.38, cy + r * 0.12, r * 0.1, 0, Math.PI * 2)
  ctx.arc(cx + r * 0.38, cy + r * 0.12, r * 0.1, 0, Math.PI * 2)
  ctx.fill()
  // 嘴
  ctx.strokeStyle = '#2a1810'
  ctx.lineWidth = r * 0.05
  ctx.beginPath()
  ctx.arc(cx, cy + r * 0.2, r * 0.18, Math.PI * 0.15, Math.PI * 0.85)
  ctx.stroke()
}

function drawFigureDetail(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, type: string) {
  const r = w * 0.12
  // 展示底座
  ctx.fillStyle = '#f5ead0'
  ctx.beginPath()
  ctx.ellipse(cx, cy + r * 1.5, r * 1.4, r * 0.3, 0, 0, Math.PI * 2)
  ctx.fill()
  // 金色底座圈
  ctx.strokeStyle = '#c8884a'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(cx, cy + r * 1.5, r * 1.4, r * 0.3, 0, 0, Math.PI * 2)
  ctx.stroke()

  // 身体
  drawTomatoFace(ctx, cx, cy, r, type !== 'figure_sit')

  // 姿势手臂
  ctx.strokeStyle = '#cc2222'
  ctx.lineWidth = r * 0.15
  ctx.lineCap = 'round'
  if (type === 'figure_wave') {
    ctx.beginPath()
    ctx.moveTo(cx + r * 0.8, cy - r * 0.2)
    ctx.lineTo(cx + r * 1.3, cy - r * 0.6)
    ctx.stroke()
  } else if (type === 'figure_jump') {
    ctx.beginPath()
    ctx.moveTo(cx + r * 0.8, cy - r * 0.3)
    ctx.lineTo(cx + r * 1.2, cy - r * 0.8)
    ctx.moveTo(cx - r * 0.8, cy - r * 0.3)
    ctx.lineTo(cx - r * 1.2, cy - r * 0.8)
    ctx.stroke()
  }
}

function drawMagnetDetail(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number) {
  const r = w * 0.14
  // 侧面厚度（深红）
  ctx.fillStyle = '#aa1818'
  ctx.beginPath()
  ctx.ellipse(cx, cy + 6, r, r, 0, 0, Math.PI * 2)
  ctx.fill()
  // 正面
  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r)
  grad.addColorStop(0, '#ff7878')
  grad.addColorStop(1, '#ee4444')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  // 高光
  ctx.fillStyle = 'rgba(255,220,180,0.3)'
  ctx.beginPath()
  ctx.ellipse(cx - r * 0.3, cy - r * 0.35, r * 0.2, r * 0.1, -0.5, 0, Math.PI * 2)
  ctx.fill()
  // 表情
  ctx.fillStyle = '#2a1810'
  ctx.beginPath()
  ctx.arc(cx - r * 0.3, cy - r * 0.08, r * 0.08, 0, Math.PI * 2)
  ctx.arc(cx + r * 0.3, cy - r * 0.08, r * 0.08, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(cx - r * 0.27, cy - r * 0.11, r * 0.025, 0, Math.PI * 2)
  ctx.arc(cx + r * 0.33, cy - r * 0.11, r * 0.025, 0, Math.PI * 2)
  ctx.fill()
  // 腮红
  ctx.fillStyle = 'rgba(255,155,179,0.5)'
  ctx.beginPath()
  ctx.arc(cx - r * 0.4, cy + r * 0.15, r * 0.08, 0, Math.PI * 2)
  ctx.arc(cx + r * 0.4, cy + r * 0.15, r * 0.08, 0, Math.PI * 2)
  ctx.fill()
  // 嘴
  ctx.strokeStyle = '#2a1810'
  ctx.lineWidth = r * 0.05
  ctx.beginPath()
  ctx.arc(cx, cy + r * 0.18, r * 0.15, Math.PI * 0.15, Math.PI * 0.85)
  ctx.stroke()
  // 叶子
  ctx.fillStyle = '#2ed573'
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2
    const lx = cx + Math.cos(a) * r * 0.2
    const ly = cy - r + r * 0.1 + Math.sin(a) * r * 0.15
    ctx.beginPath()
    ctx.moveTo(lx, ly - r * 0.3)
    ctx.lineTo(lx - r * 0.13, ly + r * 0.04)
    ctx.lineTo(lx + r * 0.13, ly + r * 0.04)
    ctx.closePath()
    ctx.fill()
  }
  // 磁铁背面灰色（露出一小条）
  ctx.fillStyle = '#999'
  ctx.fillRect(cx - r, cy + r - 2, r * 2, 4)
}

function drawKeychainDetail(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number) {
  const plateW = w * 0.22, plateH = w * 0.22
  // 亚克力板背面（深色层）
  ctx.fillStyle = 'rgba(200,200,220,0.3)'
  ctx.beginPath()
  ctx.roundRect(cx - plateW / 2 + 2, cy - plateH / 2 + 2, plateW, plateH, 12)
  ctx.fill()
  // 透明亚克力主层（带渐变高光）
  const grad = ctx.createLinearGradient(cx - plateW / 2, cy - plateH / 2, cx + plateW / 2, cy + plateH / 2)
  grad.addColorStop(0, 'rgba(255,255,255,0.6)')
  grad.addColorStop(0.5, 'rgba(240,240,255,0.3)')
  grad.addColorStop(1, 'rgba(255,255,255,0.5)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.roundRect(cx - plateW / 2, cy - plateH / 2, plateW, plateH, 12)
  ctx.fill()
  // 边框
  ctx.strokeStyle = 'rgba(200,200,220,0.6)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(cx - plateW / 2, cy - plateH / 2, plateW, plateH, 12)
  ctx.stroke()
  // 番茄图案
  drawTomatoFace(ctx, cx, cy, plateW * 0.3, true)
  // 顶部金属圆环
  ctx.strokeStyle = '#c0c0c8'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(cx, cy - plateH / 2 - 12, 8, 0, Math.PI * 2)
  ctx.stroke()
  // 金属高光
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy - plateH / 2 - 12, 8, Math.PI * 1.2, Math.PI * 1.8)
  ctx.stroke()
  // 链条
  ctx.strokeStyle = '#c0c0c8'
  ctx.lineWidth = 2
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.arc(cx, cy - plateH / 2 - 4 - i * 4, 2.5, 0, Math.PI * 2)
    ctx.stroke()
  }
}

function drawPinDetail(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number) {
  const r = w * 0.14
  // 外圈金色
  const goldGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
  goldGrad.addColorStop(0, '#ffe8a0')
  goldGrad.addColorStop(0.5, '#ffd700')
  goldGrad.addColorStop(1, '#c8a020')
  ctx.fillStyle = goldGrad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  // 内圈珐琅
  ctx.fillStyle = '#fff8e0'
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2)
  ctx.fill()
  // 番茄图案
  drawTomatoFace(ctx, cx, cy, r * 0.65, true)
  // 金属光泽
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.beginPath()
  ctx.ellipse(cx - r * 0.4, cy - r * 0.4, r * 0.2, r * 0.08, -0.6, 0, Math.PI * 2)
  ctx.fill()
  // 背后别针
  ctx.strokeStyle = '#a0a0a8'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.6, cy + r + 5)
  ctx.lineTo(cx + r * 0.6, cy + r + 5)
  ctx.stroke()
  // 别针夹
  ctx.fillStyle = '#a0a0a8'
  ctx.beginPath()
  ctx.roundRect(cx - r * 0.15, cy + r + 3, r * 0.3, 8, 2)
  ctx.fill()
}
</script>

<style scoped>
.merch-detail-overlay {
  position: fixed; inset: 0; z-index: 250;
  background: rgba(10,5,5,0.65);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center;
}

.detail-stage {
  position: relative;
  background: linear-gradient(160deg, #fef0d8, #f5e0b8, #e8d098);
  border-radius: 24px;
  padding: 28px 24px 20px;
  width: 360px; max-width: 92vw;
  box-shadow: 0 20px 60px rgba(60,30,10,0.4), 0 0 0 1px rgba(200,136,74,0.2);
  display: flex; flex-direction: column; align-items: center;
  opacity: 0; transform: scale(0.85) translateY(20px);
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.detail-stage.entering { opacity: 1; transform: scale(1) translateY(0); }
.detail-stage.leaving { opacity: 0; transform: scale(0.9) translateY(10px); }

.stage-brand {
  position: absolute; top: 12px; left: 16px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 13px; font-weight: 700; color: #ee4444;
}

.stage-star {
  position: absolute; color: #ee4444; opacity: 0.7; font-size: 14px;
  pointer-events: none;
}
.s1 { top: 10px; right: 60px; transform: rotate(-15deg); }
.s2 { bottom: 100px; left: 8px; transform: rotate(20deg); font-size: 10px; }
.s3 { top: 50%; right: 6px; transform: rotate(-10deg); font-size: 12px; }
.s4 { bottom: 8px; right: 20px; transform: rotate(25deg); font-size: 9px; color: #c8884a; }

.stage-canvas-wrapper {
  position: relative; margin-bottom: 12px;
}
.stage-canvas {
  border-radius: 16px; display: block;
  box-shadow: 0 8px 20px rgba(120,80,40,0.15);
}
.stage-glow {
  position: absolute; inset: -10px;
  background: radial-gradient(circle, rgba(255,230,180,0.3) 0%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}

.stage-info { text-align: center; width: 100%; }
.stage-name { font-size: 18px; font-weight: 800; color: #3d2c1e; }
.stage-style { font-size: 11px; color: #8b6f47; margin-top: 2px; }
.stage-desc { font-size: 13px; color: #6b5840; line-height: 1.7; margin: 8px 12px; }
.stage-tags { display: flex; gap: 4px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px; }
.stage-tag {
  padding: 3px 10px; background: rgba(238,68,68,0.12);
  border: 1px solid rgba(238,68,68,0.2);
  border-radius: 100px; font-size: 10px; color: #c83838;
}
.stage-download {
  width: 100%; padding: 10px;
  background: linear-gradient(135deg, #ee4444, #ff6b6b);
  border: none; border-radius: 12px; color: #fff;
  font-size: 13px; font-weight: 600; cursor: pointer;
}

.stage-close {
  position: absolute; top: 10px; right: 10px;
  width: 30px; height: 30px; border-radius: 50%;
  border: none; background: rgba(60,40,20,0.1); color: #3d2c1e;
  font-size: 16px; cursor: pointer; transition: all 0.2s;
}
.stage-close:hover { background: rgba(60,40,20,0.2); }
</style>
