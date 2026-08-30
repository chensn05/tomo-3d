<template>
  <div class="feature-panel meme-panel">
    <div class="panel-header">
      <span class="panel-title">🎤 TOMO 表情包生成器</span>
      <button class="panel-close" @click="$emit('close')">✕</button>
    </div>
    <div class="panel-body">
      <!-- 预览区 -->
      <div class="meme-preview-wrapper">
        <canvas ref="memeCanvas" width="500" height="500" class="meme-canvas"></canvas>
      </div>

      <!-- 情绪选择 -->
      <div class="meme-section">
        <div class="section-label">表情</div>
        <div class="meme-emotion-row">
          <div
            v-for="emo in memeEmotions"
            :key="emo.id"
            class="meme-emoji-pick"
            :class="{ active: selectedEmotion === emo.id }"
            @click="selectEmotion(emo.id)"
          >
            {{ emo.emoji }}
          </div>
        </div>
      </div>

      <!-- 文字输入 -->
      <div class="meme-section">
        <div class="section-label">上方文字</div>
        <input v-model="topText" type="text" placeholder="输入上文字..." maxlength="20" class="meme-input" @input="renderMeme" />
      </div>
      <div class="meme-section">
        <div class="section-label">下方文字</div>
        <input v-model="bottomText" type="text" placeholder="输入下文字..." maxlength="20" class="meme-input" @input="renderMeme" />
      </div>

      <!-- 文字样式 -->
      <div class="meme-section">
        <div class="section-label">样式</div>
        <div class="meme-style-row">
          <div class="meme-style-pick" :class="{ active: textStyle === 'white' }" @click="setStyle('white')">白字黑边</div>
          <div class="meme-style-pick" :class="{ active: textStyle === 'yellow' }" @click="setStyle('yellow')">黄字黑边</div>
          <div class="meme-style-pick" :class="{ active: textStyle === 'handwrite' }" @click="setStyle('handwrite')">手写体</div>
        </div>
      </div>

      <!-- 模板 -->
      <div class="meme-section">
        <div class="section-label">快速模板</div>
        <div class="meme-templates">
          <div class="meme-template" v-for="tpl in templates" :key="tpl.top" @click="applyTemplate(tpl)">
            <span class="tpl-emoji">{{ tpl.emoji }}</span>
            <span class="tpl-text">{{ tpl.top }} / {{ tpl.bottom }}</span>
          </div>
        </div>
      </div>

      <!-- 导出 -->
      <button class="meme-export-btn" @click="downloadMeme">下载表情包 ↓</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { emotions } from '../three/emotions'

const emit = defineEmits<{ close: []; setEmotion: [id: string]; screenshot: [] }>()

const memeCanvas = ref<HTMLCanvasElement>()
const topText = ref('我又红了')
const bottomText = ref('')
const selectedEmotion = ref('cool')
const textStyle = ref<'white' | 'yellow' | 'handwrite'>('white')

const memeEmotions = emotions

const templates = [
  { emoji: '😎', top: '我又红了', bottom: '', emotion: 'cool' },
  { emoji: '😠', top: '别碰我', bottom: '我还没熟透', emotion: 'angry' },
  { emoji: '😭', top: '砧板警告', bottom: '今日不宜下厨', emotion: 'crying' },
  { emoji: '🤔', top: '我是谁', bottom: '我在哪', emotion: 'confused' },
  { emoji: '😳', top: '被夸了', bottom: '其实我也没那么红', emotion: 'flattered' },
  { emoji: '🍅', top: '今天也是', bottom: '饱满的一天', emotion: 'idle' },
  { emoji: '🤒', top: 'TOMO 已宕机', bottom: '请稍后再试', emotion: 'sick' },
  { emoji: '😊', top: '只想躺平', bottom: '不想做食材', emotion: 'shy' },
]

function selectEmotion(id: string) {
  selectedEmotion.value = id
  emit('setEmotion', id)
  // 等待3D渲染后截图
  nextTick(() => {
    setTimeout(() => requestScreenshot(), 100)
  })
}

function setStyle(style: 'white' | 'yellow' | 'handwrite') {
  textStyle.value = style
  renderMeme()
}

function applyTemplate(tpl: typeof templates[0]) {
  topText.value = tpl.top
  bottomText.value = tpl.bottom
  selectedEmotion.value = tpl.emotion
  emit('setEmotion', tpl.emotion)
  nextTick(() => {
    setTimeout(() => requestScreenshot(), 100)
  })
}

let currentScreenshot = ''

function requestScreenshot() {
  // 通知父组件截图
  emit('screenshot')
}

// 父组件调用此方法传入截图数据
function setScreenshot(dataUrl: string) {
  currentScreenshot = dataUrl
  renderMeme()
}

defineExpose({ setScreenshot })

function renderMeme() {
  const canvas = memeCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const w = canvas.width
  const h = canvas.height

  // 背景
  ctx.fillStyle = '#1a0a0a'
  ctx.fillRect(0, 0, w, h)

  // 画 TOMO 截图或手绘番茄
  if (currentScreenshot) {
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h)
      drawText(ctx, w, h)
    }
    img.src = currentScreenshot
  } else {
    drawTomatoPlaceholder(ctx, w, h)
    drawText(ctx, w, h)
  }
}

function drawTomatoPlaceholder(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w / 2
  const cy = h / 2 + 20
  const r = 140

  // 番茄身体
  const grad = ctx.createRadialGradient(cx - 40, cy - 40, 20, cx, cy, r)
  grad.addColorStop(0, '#ff6b6b')
  grad.addColorStop(1, '#cc2222')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // 叶子
  ctx.fillStyle = '#2ed573'
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2
    const lx = cx + Math.cos(angle) * 30
    const ly = cy - r + 10 + Math.sin(angle) * 15
    ctx.beginPath()
    ctx.moveTo(lx, ly - 40)
    ctx.lineTo(lx - 15, ly + 5)
    ctx.lineTo(lx + 15, ly + 5)
    ctx.closePath()
    ctx.fill()
  }

  // 眼睛
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.arc(cx - 35, cy - 10, 12, 0, Math.PI * 2)
  ctx.arc(cx + 35, cy - 10, 12, 0, Math.PI * 2)
  ctx.fill()

  // 嘴巴
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(cx, cy + 25, 25, Math.PI * 0.15, Math.PI * 0.85)
  ctx.stroke()
}

function drawText(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const fontSize = textStyle.value === 'handwrite' ? 36 : 42
  const fontFamily = textStyle.value === 'handwrite'
    ? 'cursive, "PingFang SC"'
    : '"PingFang SC", "Microsoft YaHei", Arial, sans-serif'
  const fillColor = textStyle.value === 'yellow' ? '#ffd700' : '#ffffff'
  const strokeColor = '#000000'

  ctx.font = `bold ${fontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.lineWidth = textStyle.value === 'handwrite' ? 5 : 6
  ctx.strokeStyle = strokeColor
  ctx.fillStyle = fillColor
  ctx.lineJoin = 'round'

  // 上文字
  if (topText.value) {
    ctx.textBaseline = 'top'
    const y = 30
    ctx.strokeText(topText.value, w / 2, y)
    ctx.fillText(topText.value, w / 2, y)
  }

  // 下文字
  if (bottomText.value) {
    ctx.textBaseline = 'bottom'
    const y = h - 30
    ctx.strokeText(bottomText.value, w / 2, y)
    ctx.fillText(bottomText.value, w / 2, y)
  }

  // 水印
  ctx.font = '12px Arial'
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText('TOMO · TOMATO STORIES', w - 10, h - 5)
}

function downloadMeme() {
  const canvas = memeCanvas.value
  if (!canvas) return
  const link = document.createElement('a')
  link.download = `tomo-meme-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

onMounted(() => {
  setTimeout(() => requestScreenshot(), 200)
})
</script>

<style scoped>
.meme-preview-wrapper {
  display: flex; justify-content: center; margin-bottom: 16px;
}
.meme-canvas {
  width: 240px; height: 240px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  background: #1a0a0a;
}

.meme-section { margin-bottom: 12px; }
.section-label { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 6px; }

.meme-emotion-row {
  display: flex; gap: 4px; flex-wrap: wrap;
}
.meme-emoji-pick {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.06);
  border: 1px solid transparent;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; cursor: pointer; transition: all 0.2s;
}
.meme-emoji-pick:hover { background: rgba(255,71,87,0.2); }
.meme-emoji-pick.active {
  background: rgba(255,71,87,0.3);
  border-color: rgba(255,71,87,0.6);
}

.meme-input {
  width: 100%; padding: 10px 14px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; color: #fff;
  font-size: 14px; outline: none;
}
.meme-input:focus { border-color: rgba(255,71,87,0.4); }
.meme-input::placeholder { color: rgba(255,255,255,0.3); }

.meme-style-row { display: flex; gap: 8px; }
.meme-style-pick {
  flex: 1; padding: 8px; text-align: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; font-size: 12px;
  cursor: pointer; transition: all 0.2s;
}
.meme-style-pick:hover { background: rgba(255,255,255,0.1); }
.meme-style-pick.active {
  background: rgba(255,71,87,0.2);
  border-color: rgba(255,71,87,0.5);
}

.meme-templates {
  display: flex; flex-direction: column; gap: 4px;
}
.meme-template {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px;
  background: rgba(255,255,255,0.04);
  border-radius: 10px; cursor: pointer;
  transition: all 0.2s; font-size: 12px;
}
.meme-template:hover { background: rgba(255,71,87,0.15); }
.tpl-emoji { font-size: 18px; }
.tpl-text { color: rgba(255,255,255,0.7); }

.meme-export-btn {
  width: 100%; padding: 12px;
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  border: none; border-radius: 12px; color: #fff;
  font-size: 14px; font-weight: 600; cursor: pointer;
  margin-top: 8px; transition: all 0.2s;
}
.meme-export-btn:hover { transform: scale(1.02); }
</style>
