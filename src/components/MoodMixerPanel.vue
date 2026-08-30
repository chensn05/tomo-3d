<template>
  <div class="feature-panel mixer-panel">
    <div class="panel-header">
      <span class="panel-title">🎨 心情鸡尾酒</span>
      <button class="panel-close" @click="$emit('close')">✕</button>
    </div>
    <div class="panel-body">

      <!-- 步骤说明 -->
      <div class="mixer-hint" v-if="stage === 'select'">
        选 3 种今天的心情，TOMO 帮你调出一杯专属的心情鸡尾酒
      </div>

      <!-- 选择区 -->
      <div class="mixer-select-area" v-if="stage === 'select'">
        <div class="mixer-glass-preview">
          <div class="glass-shape">
            <div class="glass-liquid" :style="liquidGradient"></div>
            <div class="glass-shine"></div>
          </div>
          <div class="glass-picked">
            <span v-for="(m, i) in picked" :key="i" class="picked-badge">
              {{ moodMap[m].emoji }}
            </span>
            <span v-for="i in 3 - picked.length" :key="'e'+i" class="picked-empty">·</span>
          </div>
        </div>

        <div class="mixer-mood-grid">
          <div
            v-for="mood in moods"
            :key="mood.id"
            class="mood-chip"
            :class="{ selected: picked.includes(mood.id), disabled: picked.length >= 3 && !picked.includes(mood.id) }"
            @click="toggleMood(mood.id)"
          >
            <span class="mood-emoji">{{ mood.emoji }}</span>
            <span class="mood-name">{{ mood.name }}</span>
          </div>
        </div>

        <button class="mixer-generate-btn" @click="generate" :disabled="picked.length !== 3">
          🍸 调制我的鸡尾酒
        </button>

        <!-- Key 提示 -->
        <div class="mixer-api-hint" v-if="!hasApiKey">
          当前是「心情配方卡」模式。配置 Gemini Key 后，可升级为 AI 手绘插画。<br/>
          <a href="https://aistudio.google.com/apikey" target="_blank" style="color:#b8845f">免费获取 Gemini Key →</a>
        </div>
      </div>

      <!-- 生成中 -->
      <div class="mixer-generating" v-if="stage === 'generating'">
        <div class="mixer-glass-large">
          <div class="glass-shape big">
            <div class="glass-liquid animated" :style="liquidGradient"></div>
            <div class="glass-shine"></div>
            <div class="glass-bubbles">
              <span v-for="i in 6" :key="i" :style="bubbleStyle(i)"></span>
            </div>
          </div>
        </div>
        <div class="mixer-gen-text">{{ genStepText }}</div>
        <div class="mixer-gen-progress">
          <div class="mixer-gen-fill" :style="{ width: genProgress + '%' }"></div>
        </div>
      </div>

      <!-- 结果 -->
      <div class="mixer-result" v-if="stage === 'result' && resultImage">
        <div class="result-cocktail-name">《{{ cocktailName }}》</div>
        <div class="result-flavor">{{ cocktailFlavor }}</div>
        <div class="result-image-wrapper">
          <img :src="resultImage" class="result-image" />
        </div>
        <div class="result-recipe">
          <span v-for="m in picked" :key="m" class="recipe-badge">
            {{ moodMap[m].emoji }} {{ moodMap[m].name }}
          </span>
        </div>
        <div class="result-actions">
          <button class="result-save-btn" @click="download">保存图片 ↓</button>
          <button class="result-again-btn" @click="reset">再调一杯</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{ close: []; setEmotion: [id: string] }>()

interface Mood {
  id: string
  emoji: string
  name: string
  color: string
  keyword: string
}

const moods: Mood[] = [
  { id: 'happy', emoji: '😊', name: '开心', color: '#ffd93d', keyword: 'joyful cheerful' },
  { id: 'calm', emoji: '🌿', name: '平静', color: '#8fd694', keyword: 'peaceful calm zen' },
  { id: 'excited', emoji: '✨', name: '兴奋', color: '#ff6b9d', keyword: 'excited sparkling energetic' },
  { id: 'sad', emoji: '💧', name: '难过', color: '#5b9bd5', keyword: 'melancholic wistful blue' },
  { id: 'angry', emoji: '🔥', name: '生气', color: '#ff4747', keyword: 'fiery angry intense red' },
  { id: 'tired', emoji: '☁️', name: '疲惫', color: '#a8a8b8', keyword: 'exhausted sleepy gray' },
  { id: 'confused', emoji: '🌀', name: '迷茫', color: '#9b7ec7', keyword: 'confused dreamy purple' },
  { id: 'love', emoji: '💕', name: '被爱', color: '#ff9bb3', keyword: 'loving warm cozy pink' },
  { id: 'lucky', emoji: '🍀', name: '好运', color: '#68d391', keyword: 'lucky lucky sparkle green' },
  { id: 'lazy', emoji: '🍵', name: '慵懒', color: '#d4a878', keyword: 'lazy afternoon warm brown' },
  { id: 'brave', emoji: '⚡', name: '勇敢', color: '#ffa502', keyword: 'brave bold heroic' },
  { id: 'shy', emoji: '🌸', name: '害羞', color: '#ffb3d1', keyword: 'shy blushing soft pink' },
]

const moodMap = moods.reduce((acc, m) => { acc[m.id] = m; return acc }, {} as Record<string, Mood>)

const picked = ref<string[]>([])
type Stage = 'select' | 'generating' | 'result'
const stage = ref<Stage>('select')

const genProgress = ref(0)
const genStepText = ref('')
const resultImage = ref('')
const cocktailName = ref('')
const cocktailFlavor = ref('')

// 从 localStorage 读 API Key（复用食谱打印那套 provider 系统）
const hasApiKey = computed(() => {
  const gemini = localStorage.getItem('tomo-gemini-key')
  const openai = localStorage.getItem('tomo-openai-key')
  return !!(gemini || openai)
})

// 液体渐变（根据选中的心情颜色）
const liquidGradient = computed(() => {
  if (picked.value.length === 0) {
    return { background: 'linear-gradient(180deg, rgba(200,200,200,0.2), rgba(200,200,200,0.3))' }
  }
  const colors = picked.value.map(id => moodMap[id].color)
  while (colors.length < 3) colors.push(colors[colors.length - 1])
  return {
    background: `linear-gradient(180deg, ${colors[0]}, ${colors[1]} 50%, ${colors[2]})`,
  }
})

function bubbleStyle(i: number) {
  return {
    left: `${20 + (i * 12) % 60}%`,
    animationDelay: `${i * 0.3}s`,
    animationDuration: `${2 + (i % 3) * 0.5}s`,
  }
}

function toggleMood(id: string) {
  const idx = picked.value.indexOf(id)
  if (idx >= 0) {
    picked.value.splice(idx, 1)
  } else if (picked.value.length < 3) {
    picked.value.push(id)
  }
}

function generate() {
  if (picked.value.length !== 3) return
  stage.value = 'generating'
  genProgress.value = 0
  emit('setEmotion', 'confused')

  const steps = hasApiKey.value ? [
    { text: '正在调配色彩...', until: 20 },
    { text: 'TOMO 正在摇晃调酒杯...', until: 45 },
    { text: 'AI 正在绘制专属插画...', until: 80 },
    { text: '最后修饰细节...', until: 95 },
  ] : [
    { text: '正在调配色彩...', until: 30 },
    { text: 'TOMO 正在摇晃调酒杯...', until: 60 },
    { text: '正在装杯...', until: 95 },
  ]

  let lastTime = performance.now()
  const tick = (now: number) => {
    const delta = (now - lastTime) / 1000
    lastTime = now
    if (genProgress.value < 95) {
      genProgress.value += delta * (hasApiKey.value ? 6 : 45)  // 无Key时快进 2秒出结果
    }
    for (const s of steps) {
      if (genProgress.value <= s.until) { genStepText.value = s.text; break }
    }
    if (genProgress.value < 95) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)

  doGenerate()
}

async function doGenerate() {
  const [m1, m2, m3] = picked.value.map(id => moodMap[id])
  // 生成一个诗意的名字和描述
  cocktailName.value = generateCocktailName(m1, m2, m3)
  cocktailFlavor.value = generateFlavor(m1, m2, m3)

  const prompt = `A dreamy cocktail-like illustration featuring a cute cartoon TOMO tomato character in a scenic mood scene. The mood is a blend of ${m1.keyword}, ${m2.keyword}, and ${m3.keyword}. Warm Japanese vintage hand-drawn crayon illustration style with colored pencil grain texture. The main colors should incorporate ${m1.color}, ${m2.color}, and ${m3.color}. Cozy healing atmosphere with soft dreamy lighting. Isolated centered composition.`

  const apiKey = localStorage.getItem('tomo-gemini-key') || ''
  if (apiKey) {
    try {
      const result = await callGemini(prompt, apiKey)
      resultImage.value = 'data:image/png;base64,' + result
    } catch (e) {
      console.warn('AI failed, using fallback', e)
      resultImage.value = generateFallback(m1, m2, m3)
    }
  } else {
    // 无 Key 时用 Canvas 生成一个色彩融合的占位图
    resultImage.value = generateFallback(m1, m2, m3)
  }

  genProgress.value = 100
  setTimeout(() => {
    stage.value = 'result'
    emit('setEmotion', 'flattered')
  }, 300)
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent'
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      temperature: 1, topP: 0.95,
      imageConfig: { aspectRatio: '1:1', imageSize: '1K' },
    },
    safetySettings: ['HARM_CATEGORY_HATE_SPEECH', 'HARM_CATEGORY_DANGEROUS_CONTENT', 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'HARM_CATEGORY_HARASSMENT'].map(c => ({ category: c, threshold: 'OFF' })),
  }
  const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }, body: JSON.stringify(body) })
  if (!resp.ok) throw new Error(`Gemini ${resp.status}`)
  const data = await resp.json()
  for (const cand of (data.candidates || [])) for (const part of ((cand.content || {}).parts || [])) if (part.inlineData?.data) return part.inlineData.data
  throw new Error('No image')
}

// 无 Key 降级：用 Canvas 画一个色彩渐变+简单番茄形的占位图
function generateFallback(m1: Mood, m2: Mood, m3: Mood): string {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // 渐变背景
  const grad = ctx.createLinearGradient(0, 0, 512, 512)
  grad.addColorStop(0, m1.color)
  grad.addColorStop(0.5, m2.color)
  grad.addColorStop(1, m3.color)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 512)

  // 中央小番茄
  ctx.fillStyle = '#ee4444'
  ctx.beginPath()
  ctx.arc(256, 280, 80, 0, Math.PI * 2)
  ctx.fill()
  // 叶子
  ctx.fillStyle = '#2ed573'
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2
    const lx = 256 + Math.cos(a) * 15
    const ly = 200 + Math.sin(a) * 12
    ctx.beginPath()
    ctx.moveTo(lx, ly - 25)
    ctx.lineTo(lx - 10, ly + 4)
    ctx.lineTo(lx + 10, ly + 4)
    ctx.closePath()
    ctx.fill()
  }
  // 简单笑脸
  ctx.fillStyle = '#2a1810'
  ctx.beginPath()
  ctx.arc(230, 270, 6, 0, Math.PI * 2)
  ctx.arc(282, 270, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#2a1810'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(256, 295, 15, 0.2, Math.PI - 0.2)
  ctx.stroke()

  // 心情 emoji 环绕
  ctx.font = '48px system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(m1.emoji, 130, 130)
  ctx.fillText(m2.emoji, 390, 130)
  ctx.fillText(m3.emoji, 256, 430)

  return canvas.toDataURL('image/png')
}

function generateCocktailName(m1: Mood, m2: Mood, m3: Mood): string {
  // 诗意组合模板：避开生硬拼接
  const templates = [
    `三分${m1.name}，七分${m3.name}`,
    `${m1.name}打底，${m2.name}回甘`,
    `${m2.name}通通化在${m3.name}里`,
    `一杯慢慢变${m3.name}的${m1.name}`,
    `${m1.name}与${m2.name}并肩，看${m3.name}发光`,
    `${m3.name}升起在${m1.name}之上`,
    `把${m2.name}藏进${m1.name}的口袋`,
    `${m1.name}、${m2.name}和一点点${m3.name}`,
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}

function generateFlavor(m1: Mood, m2: Mood, m3: Mood): string {
  const verbs = ['打底', '回甘', '漂浮', '入喉', '萦绕', '收尾']
  return `${m1.name} ${verbs[0]} · ${m2.name} ${verbs[Math.floor(Math.random()*6)]} · ${m3.name} 收尾 ✦ TOMO 招牌调配`
}

function download() {
  if (!resultImage.value) return
  const link = document.createElement('a')
  link.download = `tomo-cocktail-${Date.now()}.png`
  link.href = resultImage.value
  link.click()
}

function reset() {
  picked.value = []
  stage.value = 'select'
  resultImage.value = ''
  cocktailName.value = ''
  cocktailFlavor.value = ''
  emit('setEmotion', 'idle')
}
</script>

<style scoped>
.mixer-panel .panel-body { padding-bottom: 24px; }

.mixer-hint {
  font-size: 12px; color: rgba(255,255,255,0.5);
  text-align: center; margin-bottom: 14px; line-height: 1.7;
}

/* 玻璃杯预览 */
.mixer-glass-preview {
  display: flex; justify-content: center; align-items: center;
  gap: 16px; margin-bottom: 16px;
}
.glass-shape {
  position: relative;
  width: 60px; height: 100px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: none; border-radius: 0 0 30px 30px;
  overflow: hidden;
  background: rgba(255,255,255,0.03);
}
.glass-shape.big { width: 100px; height: 150px; border-radius: 0 0 50px 50px; }
.glass-liquid {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 70%;
  transition: background 0.6s ease;
}
.glass-liquid.animated {
  animation: liquidShake 0.5s ease-in-out infinite alternate;
}
@keyframes liquidShake {
  from { transform: skewX(-3deg); }
  to { transform: skewX(3deg); }
}
.glass-shine {
  position: absolute; top: 10%; left: 15%;
  width: 8%; height: 60%;
  background: linear-gradient(180deg, rgba(255,255,255,0.4), transparent);
  border-radius: 4px;
}
.glass-bubbles { position: absolute; inset: 0; overflow: hidden; }
.glass-bubbles span {
  position: absolute; bottom: 0;
  width: 6px; height: 6px;
  background: rgba(255,255,255,0.4);
  border-radius: 50%;
  animation: bubbleUp 2s ease-in infinite;
}
@keyframes bubbleUp {
  from { bottom: 0; opacity: 0.6; }
  to { bottom: 100%; opacity: 0; }
}

.glass-picked {
  display: flex; gap: 6px; align-items: center;
}
.picked-badge {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.picked-empty {
  width: 32px; height: 32px; border-radius: 50%;
  border: 2px dashed rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.2);
}

/* 心情选择格子 */
.mixer-mood-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
  margin-bottom: 16px;
}
.mood-chip {
  padding: 10px 6px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  text-align: center;
  cursor: pointer; transition: all 0.2s;
}
.mood-chip:hover:not(.disabled) { background: rgba(255,255,255,0.1); transform: translateY(-2px); }
.mood-chip.selected {
  background: rgba(255,71,87,0.2);
  border-color: rgba(255,71,87,0.5);
  transform: scale(1.05);
}
.mood-chip.disabled { opacity: 0.3; cursor: not-allowed; }
.mood-emoji { font-size: 22px; display: block; margin-bottom: 2px; }
.mood-name { font-size: 10px; color: rgba(255,255,255,0.7); }

.mixer-generate-btn {
  width: 100%; padding: 14px;
  background: linear-gradient(135deg, #a55eea, #ff6b81);
  border: none; border-radius: 14px; color: #fff;
  font-size: 15px; font-weight: 700; cursor: pointer;
  box-shadow: 0 6px 20px rgba(165,94,234,0.3);
  transition: all 0.2s;
}
.mixer-generate-btn:hover:not(:disabled) { transform: scale(1.02); }
.mixer-generate-btn:disabled { opacity: 0.4; }

.mixer-api-hint {
  font-size: 10px; color: rgba(255,255,255,0.4);
  line-height: 1.6; margin-top: 10px; text-align: center;
}

/* 生成中 */
.mixer-generating { text-align: center; padding: 20px 0; }
.mixer-glass-large { display: flex; justify-content: center; margin-bottom: 16px; }
.mixer-gen-text { font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 10px; }
.mixer-gen-progress { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; margin: 0 30px; }
.mixer-gen-fill {
  height: 100%;
  background: linear-gradient(90deg, #a55eea, #ff6b81, #ffd700);
  border-radius: 3px; transition: width 0.1s linear;
}

/* 结果 */
.mixer-result { text-align: center; }
.result-cocktail-name {
  font-size: 20px; font-weight: 800; margin-bottom: 4px;
  background: linear-gradient(135deg, #ff6b6b, #a55eea);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.result-flavor { font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 14px; }
.result-image-wrapper { display: flex; justify-content: center; margin-bottom: 14px; }
.result-image {
  width: 220px; height: 220px; object-fit: cover;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}
.result-recipe { display: flex; gap: 6px; justify-content: center; margin-bottom: 16px; flex-wrap: wrap; }
.recipe-badge {
  padding: 4px 10px;
  background: rgba(255,71,87,0.12);
  border: 1px solid rgba(255,71,87,0.2);
  border-radius: 100px; font-size: 11px; color: #ff8b8b;
}
.result-actions { display: flex; gap: 8px; }
.result-save-btn {
  flex: 1; padding: 12px;
  background: linear-gradient(135deg, #ff4757, #ff6b6b);
  border: none; border-radius: 12px; color: #fff;
  font-size: 14px; font-weight: 600; cursor: pointer;
}
.result-again-btn {
  flex: 1; padding: 12px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px; color: #fff;
  font-size: 14px; cursor: pointer;
}
</style>
