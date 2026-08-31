<template>
  <div class="feature-panel printer-panel">
    <div class="panel-header">
      <span class="panel-title"><TomoIcon name="printer" /> TOMO 美食漫画打印机</span>
      <button class="panel-close" @click="$emit('close')"><TomoIcon name="close" /></button>
    </div>
    <div class="panel-body">

      <!-- API Key 设置入口 -->
      <div class="api-key-bar" v-if="stage === 'input' && !photoDataUrl">
        <button class="api-key-btn" @click="showKeyModal = true">
          {{ hasApiKey ? `${currentProviderName} 已配置` : '配置 AI 生图 Key（可选）' }}
        </button>
        <div class="api-key-hint" v-if="!hasApiKey">
          配置后用 AI 生成手绘漫画风，不配则用本地滤镜
        </div>
      </div>

      <!-- API Key 弹窗 -->
      <div class="key-modal" v-if="showKeyModal" @click.self="showKeyModal = false">
        <div class="key-modal-content">
          <div class="key-modal-title"><TomoIcon name="key" /> AI 生图配置</div>
          <div class="provider-tabs">
            <div class="provider-tab" :class="{ active: provider === 'pollinations' }" @click="provider = 'pollinations'">免费(无Key)</div>
            <div class="provider-tab" :class="{ active: provider === 'gemini' }" @click="provider = 'gemini'">Gemini</div>
            <div class="provider-tab" :class="{ active: provider === 'openai' }" @click="provider = 'openai'">OpenAI</div>
            <div class="provider-tab" :class="{ active: provider === 'stability' }" @click="provider = 'stability'">Stability</div>
          </div>
          <div class="provider-desc">{{ providerDesc }}</div>
          <input v-if="provider !== 'pollinations'" v-model="apiKeyInput" type="password" :placeholder="keyPlaceholder" class="key-input" />
          <div class="key-modal-links" v-if="providerLink">
            <a :href="providerLink" target="blank">{{ providerLinkText }} →</a>
          </div>
          <div class="key-modal-actions">
            <button class="key-save-btn" @click="saveApiKey">保存</button>
            <button class="key-clear-btn" v-if="hasApiKey" @click="clearApiKey">清除</button>
            <button class="key-cancel-btn" @click="showKeyModal = false">取消</button>
          </div>
        </div>
      </div>

      <!-- 阶段1: 拍照/上传 -->
      <div class="printer-input-stage" v-if="stage === 'input'">
        <div class="printer-icon-big"><TomoIcon name="printer" /></div>
        <p class="printer-hint">拍一张食物照片</p>
        <p class="printer-sub-hint">TOMO 自动生成手绘漫画风食谱卡</p>

        <div class="printer-upload-area">
          <label class="printer-camera-btn"><TomoIcon name="camera" /> 拍照
            <input type="file" accept="image/*" capture="environment" @change="onPhotoSelect" hidden />
          </label>
          <label class="printer-upload-btn"><TomoIcon name="photo-frame" /> 从相册选
            <input type="file" accept="image/*" @change="onPhotoSelect" hidden />
          </label>
        </div>

        <div class="printer-preview" v-if="photoDataUrl">
          <img :src="photoDataUrl" class="preview-img" />
          <div class="preview-overlay"><span><TomoIcon name="check" /> 照片已选</span></div>
        </div>

        <div class="recipe-form" v-if="photoDataUrl">
          <div class="recipe-field">
            <label>菜名</label>
            <input v-model="dishName" type="text" placeholder="给这道菜起个名字..." maxlength="12" />
          </div>
          <div class="recipe-field">
            <label>一句话评价</label>
            <input v-model="dishComment" type="text" placeholder="TOMO 觉得..." maxlength="20" />
          </div>
          <div class="recipe-tags-row">
            <div class="recipe-tag-pick" v-for="tag in foodTags" :key="tag"
              :class="{ active: selectedTags.includes(tag) }" @click="toggleTag(tag)">
              {{ tag }}
            </div>
          </div>
        </div>

        <button class="printer-start-btn" v-if="photoDataUrl" @click="generateComic">
          {{ hasApiKey ? ' AI 生成漫画风格' : ' 生成本地漫画风格' }}
        </button>
      </div>

      <!-- 阶段2: 生成中 -->
      <div class="printer-generating-stage" v-if="stage === 'generating'">
        <div class="generating-icon">{{ hasApiKey ? '' : '' }}</div>
        <div class="generating-text">{{ genStepText }}</div>
        <div class="generating-progress">
          <div class="gen-progress-fill" :style="{ width: genProgress + '%' }"></div>
        </div>
        <div class="generating-percent">{{ Math.round(genProgress) }}%</div>
      </div>

      <!-- 阶段3: 对比预览 -->
      <div class="printer-preview-stage" v-if="stage === 'preview'">
        <div class="compare-section">
          <div class="compare-label">原图 → {{ hasApiKey ? 'AI 漫画' : '本地漫画' }}</div>
          <div class="compare-images">
            <div class="compare-item">
              <img :src="photoDataUrl" class="compare-img" />
              <div class="compare-tag"><TomoIcon name="camera" /> 原图</div>
            </div>
            <div class="compare-arrow"><TomoIcon name="arrow-right" /></div>
            <div class="compare-item">
              <canvas ref="comicPreviewCanvas" width="300" height="225" class="compare-canvas"></canvas>
              <div class="compare-tag comic"><TomoIcon name="palette" /> 漫画</div>
            </div>
          </div>
        </div>
        <div class="regen-row">
          <button class="regen-btn" @click="regenerateComic"><TomoIcon name="refresh" /> 重新生成</button>
          <button class="regen-style-btn" @click="changeStyle">切换风格 ({{ currentStyleName }})</button>
        </div>
        <button class="printer-print-btn" @click="startPrinting"><TomoIcon name="printer" /> 开始打印</button>
      </div>

      <!-- 阶段4: 3D打印动画 -->
      <div class="printer-anim-stage" v-if="stage === 'printing'">
        <div ref="printerCanvasContainer" class="printer-canvas-container"></div>
        <div class="printer-status">
          <div class="printer-status-text">{{ statusText }}</div>
          <div class="printer-progress-bar">
            <div class="printer-progress-fill" :style="{ width: printProgress * 100 + '%' }"></div>
          </div>
          <div class="printer-percent">{{ Math.round(printProgress * 100) }}%</div>
        </div>
      </div>

      <!-- 阶段5: 打印完成 -->
      <div class="printer-done-stage" v-if="stage === 'done'">
        <p class="done-title"><TomoIcon name="check" /> 打印完成！</p>
        <div class="done-card-wrapper">
          <canvas ref="recipeCanvas" width="400" height="560" class="recipe-card-canvas"></canvas>
        </div>
        <div class="done-actions">
          <button class="done-download-btn" @click="downloadRecipe">下载食谱卡 ↓</button>
          <button class="done-redo-btn" @click="reset">再打印一张</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { applyComicStyle } from '../three/comicFilter'

const emit = defineEmits<{ close: []; setEmotion: [id: string] }>()

type Stage = 'input' | 'generating' | 'preview' | 'printing' | 'done'
const stage = ref<Stage>('input')
const photoDataUrl = ref('')
const comicDataUrl = ref('')
const dishName = ref('')
const dishComment = ref('')
const selectedTags = ref<string[]>([])
const genProgress = ref(0)
const genStepText = ref('')
const printProgress = ref(0)
const statusText = ref('')
const showKeyModal = ref(false)
const apiKeyInput = ref('')

const comicPreviewCanvas = ref<HTMLCanvasElement>()
const recipeCanvas = ref<HTMLCanvasElement>()
const printerCanvasContainer = ref<HTMLElement>()

const foodTags = ['好吃', '火气大', '回味', '补充能量', '适合夜宵', '早餐好选', '颜值高', '辣']

// ── 多 Provider 配置 ──
type Provider = 'pollinations' | 'gemini' | 'openai' | 'stability'
const provider = ref<Provider>(localStorage.getItem('tomo-provider') as Provider || 'pollinations')
const GEMINI_API_KEY = ref(localStorage.getItem('tomo-gemini-key') || '')
const OPENAI_API_KEY = ref(localStorage.getItem('tomo-openai-key') || '')
const STABILITY_API_KEY = ref(localStorage.getItem('tomo-stability-key') || '')

const hasApiKey = computed(() => {
  if (provider.value === 'pollinations') return true
  if (provider.value === 'gemini') return !!GEMINI_API_KEY.value
  if (provider.value === 'openai') return !!OPENAI_API_KEY.value
  if (provider.value === 'stability') return !!STABILITY_API_KEY.value
  return false
})

const currentProviderName = computed(() => {
  return { pollinations: 'Pollinations', gemini: 'Gemini', openai: 'OpenAI', stability: 'Stability' }[provider.value]
})

const providerDesc = computed(() => {
  const map: Record<string, string> = {
    pollinations: '免费 AI 生图服务，无需 API Key。效果可能不如付费服务，但零门槛。',
    gemini: 'Google Gemini 图生图。需要 Google AI Studio API Key。',
    openai: 'OpenAI DALL-E 图像编辑。需要 OpenAI API Key。',
    stability: 'Stability AI 图生图。需要 Stability API Key。',
  }
  return map[provider.value] || ''
})

const keyPlaceholder = computed(() => {
  const map: Record<string, string> = { gemini: 'AIza...', openai: 'sk-...', stability: 'sk-...' }
  return map[provider.value] || ''
})

const providerLink = computed(() => {
  const map: Record<string, string> = {
    pollinations: 'https://pollinations.ai',
    gemini: 'https://aistudio.google.com/apikey',
    openai: 'https://platform.openai.com/api-keys',
    stability: 'https://platform.stability.ai',
  }
  return map[provider.value] || ''
})

const providerLinkText = computed(() => {
  const map: Record<string, string> = {
    pollinations: '了解 Pollinations',
    gemini: '免费获取 Gemini Key',
    openai: '获取 OpenAI Key',
    stability: '获取 Stability Key',
  }
  return map[provider.value] || ''
})

function saveApiKey() {
  localStorage.setItem('tomo-provider', provider.value)
  if (provider.value === 'gemini') { GEMINI_API_KEY.value = apiKeyInput.value.trim(); localStorage.setItem('tomo-gemini-key', GEMINI_API_KEY.value) }
  if (provider.value === 'openai') { OPENAI_API_KEY.value = apiKeyInput.value.trim(); localStorage.setItem('tomo-openai-key', OPENAI_API_KEY.value) }
  if (provider.value === 'stability') { STABILITY_API_KEY.value = apiKeyInput.value.trim(); localStorage.setItem('tomo-stability-key', STABILITY_API_KEY.value) }
  showKeyModal.value = false; apiKeyInput.value = ''
}
function clearApiKey() {
  if (provider.value === 'gemini') { GEMINI_API_KEY.value = ''; localStorage.removeItem('tomo-gemini-key') }
  if (provider.value === 'openai') { OPENAI_API_KEY.value = ''; localStorage.removeItem('tomo-openai-key') }
  if (provider.value === 'stability') { STABILITY_API_KEY.value = ''; localStorage.removeItem('tomo-stability-key') }
  showKeyModal.value = false
}

// ── 风格预设 ──
const stylePresets = [
  { name: '日式复古手绘', prompt: 'Transform this food photo into a warm Japanese vintage hand-drawn illustration style. Use soft warm tones with cream and amber colors. Add clear dark brown outline strokes with slight hand-drawn wobble. Use flat color blocks with subtle halftone texture. Add a cozy, healing atmosphere like a food journal illustration. Keep the food recognizable but stylized.' },
  { name: '手账贴纸风', prompt: 'Transform this food photo into a cozy hand-drawn journal style illustration. Use warm saturated colors with tomato red, golden yellow, and cream tones. Draw with crayon-like textured lines and thick outlines. Add paper grain texture and sticker-like white border around the food. Make it look like a cute scrapbook food illustration.' },
  { name: '90年代动漫', prompt: 'Transform this food photo into a retro anime food illustration style from 1990s. Use muted warm vintage tones with dusty blue accents. Draw with clear ink outlines and flat color fills with visible brush texture. Add halftone dots in shadow areas. Create a nostalgic, comforting food illustration atmosphere.' },
  { name: '极简水彩', prompt: 'Transform this food photo into a minimalist line art illustration with warm watercolor washes. Use delicate brown outlines with selective coloring - only color the food warmly while background stays cream. Add subtle paper texture. Keep it clean and elegant like a modern food magazine illustration.' },
]
let currentStyleIdx = 0
const currentStyleName = ref(stylePresets[0].name)

function toggleTag(tag: string) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx >= 0) selectedTags.value.splice(idx, 1)
  else if (selectedTags.value.length < 3) selectedTags.value.push(tag)
}

function onPhotoSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    photoDataUrl.value = reader.result as string
    if (!dishName.value) {
      dishName.value = ['今日美味', 'TOMO 推荐菜', '打工人的午餐', '治愈系美食'][Math.floor(Math.random() * 4)]
    }
    if (!dishComment.value) {
      dishComment.value = ['又红又饱满的一天', '吃饱了才有力气摸鱼', 'TOMO 也想吃', '今日份快乐'][Math.floor(Math.random() * 4)]
    }
    emit('setEmotion', 'flattered')
  }
  reader.readAsDataURL(file)
}

function changeStyle() {
  currentStyleIdx = (currentStyleIdx + 1) % stylePresets.length
  currentStyleName.value = stylePresets[currentStyleIdx].name
  regenerateComic()
}

// ── 生成入口 ──
function generateComic() {
  stage.value = 'generating'
  genProgress.value = 0
  emit('setEmotion', 'cool')

  const steps = hasApiKey.value ? [
    { text: '正在上传图片...', until: 10 },
    { text: 'AI 正在分析照片...', until: 25 },
    { text: '正在生成手绘风格...', until: 50 },
    { text: '正在绘制描边和色块...', until: 75 },
    { text: '正在添加纸张纹理...', until: 90 },
  ] : [
    { text: '正在分析图像...', until: 20 },
    { text: '正在色彩扁平化...', until: 40 },
    { text: '正在生成描边...', until: 65 },
    { text: '正在叠加暖色调...', until: 85 },
    { text: '正在添加纹理...', until: 95 },
  ]

  let lastTime = performance.now()
  const tick = (now: number) => {
    const delta = (now - lastTime) / 1000
    lastTime = now
    const maxProg = hasApiKey.value ? 95 : 95
    if (genProgress.value < maxProg) {
      genProgress.value += delta * (hasApiKey.value ? 8 : 35)
    }
    for (const step of steps) {
      if (genProgress.value <= step.until) { genStepText.value = step.text; break }
    }
    if (genProgress.value < maxProg) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
  doApplyComic()
}

function regenerateComic() {
  genProgress.value = 0
  genStepText.value = '正在生成...'
  stage.value = 'generating'
  generateComic()
}

// ── 核心生成逻辑 ──
async function doApplyComic() {
  const img = new Image()
  img.onload = async () => {
    const srcCanvas = document.createElement('canvas')
    const maxW = hasApiKey.value ? 512 : 200  // AI 模式用更大图
    const scale = Math.min(1, maxW / img.width)
    srcCanvas.width = Math.round(img.width * scale)
    srcCanvas.height = Math.round(img.height * scale)
    srcCanvas.getContext('2d')!.drawImage(img, 0, 0, srcCanvas.width, srcCanvas.height)

    if (hasApiKey.value && provider.value !== 'local') {
      // ── AI 模式 ──
      try {
        const base64Data = srcCanvas.toDataURL('image/png').split(',')[1]
        const result = await callAIProvider(base64Data, stylePresets[currentStyleIdx].prompt)
        comicDataUrl.value = 'data:image/png;base64,' + result
      } catch (err) {
        console.error('AI failed, falling back:', err)
        genStepText.value = `${currentProviderName.value} 失败，使用本地滤镜...`
        const dst = document.createElement('canvas')
        dst.width = 300; dst.height = 225
        applyComicStyle(srcCanvas, dst, {})
        comicDataUrl.value = dst.toDataURL('image/png')
      }
    } else {
      // ── 本地模式：Canvas 滤镜 ──
      const dst = document.createElement('canvas')
      dst.width = 300; dst.height = 225
      applyComicStyle(srcCanvas, dst, {})
      comicDataUrl.value = dst.toDataURL('image/png')
    }

    genProgress.value = 100
    genStepText.value = '完成！'
    setTimeout(() => {
      stage.value = 'preview'
      emit('setEmotion', 'flattered')
      nextTick(() => drawPreviewCanvas())
    }, 300)
  }
  img.src = photoDataUrl.value
}

// ── 多 Provider AI 调用 ──
async function callAIProvider(base64Image: string, prompt: string): Promise<string> {
  switch (provider.value) {
    case 'gemini': return callGeminiAPI(base64Image, prompt)
    case 'openai': return callOpenAIAPI(base64Image, prompt)
    case 'stability': return callStabilityAPI(base64Image, prompt)
    case 'pollinations': return callPollinationsAPI(base64Image, prompt)
    default: throw new Error('Unknown provider')
  }
}

// Gemini 公开 API
async function callGeminiAPI(base64Image: string, prompt: string): Promise<string> {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent'
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: 'image/png', data: base64Image } }] }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'], temperature: 1, topP: 0.95, imageConfig: { aspectRatio: '1:1', imageSize: '1K' } },
    safetySettings: [{ category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' }, { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' }, { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' }, { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' }]
  }
  const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY.value }, body: JSON.stringify(body) })
  if (!resp.ok) throw new Error(`Gemini ${resp.status}: ${(await resp.text()).substring(0, 200)}`)
  const data = await resp.json()
  for (const cand of (data.candidates || [])) for (const part of ((cand.content || {}).parts || [])) if (part.inlineData?.data) return part.inlineData.data
  throw new Error('No image in Gemini response')
}

// OpenAI DALL-E 图像编辑
async function callOpenAIAPI(base64Image: string, prompt: string): Promise<string> {
  const formData = new FormData()
  const blob = await (await fetch('data:image/png;base64,' + base64Image)).blob()
  formData.append('image', blob, 'image.png')
  formData.append('prompt', prompt)
  formData.append('model', 'gpt-image-1')
  formData.append('n', '1')
  formData.append('size', '1024x1024')
  const resp = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { 'Authorization': `Bearer ${OPENAI_API_KEY.value}` }, body: formData })
  if (!resp.ok) throw new Error(`OpenAI ${resp.status}: ${(await resp.text()).substring(0, 200)}`)
  const data = await resp.json()
  if (data.data?.[0]?.b64_json) return data.data[0].b64_json
  throw new Error('No image in OpenAI response')
}

// Stability AI
async function callStabilityAPI(base64Image: string, prompt: string): Promise<string> {
  const formData = new FormData()
  const blob = await (await fetch('data:image/png;base64,' + base64Image)).blob()
  formData.append('init_image', blob, 'image.png')
  formData.append('text_prompts[0][text]', prompt)
  formData.append('text_prompts[0][weight]', 1)
  formData.append('image_strength', 0.5)
  formData.append('steps', 30)
  formData.append('cfg_scale', 7)
  const resp = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-v1-6/image-to-image', { method: 'POST', headers: { 'Authorization': `Bearer ${STABILITY_API_KEY.value}` }, body: formData })
  if (!resp.ok) throw new Error(`Stability ${resp.status}: ${(await resp.text()).substring(0, 200)}`)
  const data = await resp.json()
  if (data.artifacts?.[0]?.base64) return data.artifacts[0].base64
  throw new Error('No image in Stability response')
}

// Pollinations 免费服务（无 Key）
async function callPollinationsAPI(base64Image: string, prompt: string): Promise<string> {
  // Pollinations 的 img2img 通过 image model API
  // 先上传图片，再请求转换
  const formData = new FormData()
  const blob = await (await fetch('data:image/png;base64,' + base64Image)).blob()
  formData.append('image', blob)
  formData.append('prompt', prompt)
  const resp = await fetch('https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt.substring(0, 100)), { method: 'GET' })
  if (!resp.ok) throw new Error(`Pollinations ${resp.status}`)
  const imgBlob = await resp.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => { const result = reader.result as string; resolve(result.split(',')[1]) }
    reader.onerror = reject
    reader.readAsDataURL(imgBlob)
  })
}

function drawPreviewCanvas() {
  if (!comicPreviewCanvas.value || !comicDataUrl.value) return
  const ctx = comicPreviewCanvas.value.getContext('2d')!
  const img = new Image()
  img.onload = () => {
    ctx.clearRect(0, 0, 300, 225)
    ctx.drawImage(img, 0, 0, 300, 225)
  }
  img.src = comicDataUrl.value
}

// ── 3D 打印机 ──
let printerScene: THREE.Scene
let printerCamera: THREE.PerspectiveCamera
let printerRenderer: THREE.WebGLRenderer
let printerAnimId = 0
let printPlane: THREE.Mesh | null = null
let printerHead: THREE.Mesh
let photoTexture: THREE.Texture | null = null
let clock = new THREE.Clock()

function startPrinting() {
  stage.value = 'printing'
  printProgress.value = 0
  emit('setEmotion', 'cool')
  nextTick(() => { initPrinterScene(); animatePrinting() })
}

function initPrinterScene() {
  const container = printerCanvasContainer.value
  if (!container) return
  const w = container.clientWidth
  const h = 280

  printerScene = new THREE.Scene()
  printerScene.background = new THREE.Color(0x1a1530)
  printerCamera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50)
  printerCamera.position.set(0, 2.5, 6)
  printerCamera.lookAt(0, 0.5, 0)
  printerRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  printerRenderer.setSize(w, h)
  printerRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  printerRenderer.shadowMap.enabled = true
  printerRenderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(printerRenderer.domElement)

  const ambient = new THREE.AmbientLight(0x8899ff, 0.4); printerScene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
  dirLight.position.set(3, 8, 5); dirLight.castShadow = true; dirLight.shadow.mapSize = { width: 512, height: 512 }
  printerScene.add(dirLight)
  printerScene.add(new THREE.PointLight(0xff6688, 0.6, 10).translateTo?.(-3, 2, 3) || (() => { const l = new THREE.PointLight(0xff6688, 0.6, 10); l.position.set(-3, 2, 3); return l })())

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3e, roughness: 0.6, metalness: 0.2, flatShading: true })
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.15, 2.5), baseMat)
  base.position.y = -0.08; base.receiveShadow = true; printerScene.add(base)

  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x4a4a6e, roughness: 0.5, metalness: 0.3, flatShading: true })
  const pillarGeo = new THREE.BoxGeometry(0.12, 2.2, 0.12)
  ;[[-1.6, -1.1], [1.6, -1.1], [-1.6, 1.1], [1.6, 1.1]].forEach(([x, z]) => {
    const p = new THREE.Mesh(pillarGeo, pillarMat); p.position.set(x, 1.0, z); p.castShadow = true; printerScene.add(p)
  })
  const beamGeo = new THREE.BoxGeometry(3.4, 0.15, 0.12)
  ;[-1.1, 1.1].forEach(z => { const b = new THREE.Mesh(beamGeo, pillarMat); b.position.set(0, 2.0, z); b.castShadow = true; printerScene.add(b) })
  const topPanel = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.1, 2.3), new THREE.MeshStandardMaterial({ color: 0x3a3a5e, roughness: 0.4, metalness: 0.4, flatShading: true }))
  topPanel.position.set(0, 2.1, 0); topPanel.castShadow = true; printerScene.add(topPanel)

  const headMat = new THREE.MeshStandardMaterial({ color: 0xff4757, roughness: 0.3, metalness: 0.5, flatShading: true, emissive: 0xff4757, emissiveIntensity: 0.15 })
  printerHead = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 2.0), headMat)
  printerHead.position.set(0, 1.7, 0); printerHead.castShadow = true; printerScene.add(printerHead)
  const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 6), new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8 }))
  nozzle.position.set(0, -0.15, 0); nozzle.rotation.x = Math.PI; printerHead.add(nozzle)

  const bedMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.3, metalness: 0.6 })
  const printBed = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.05, 2.0), bedMat)
  printBed.position.set(0, 0.05, 0); printBed.receiveShadow = true; printerScene.add(printBed)

  const gridMat = new THREE.MeshBasicMaterial({ color: 0x2a2a4e, transparent: true, opacity: 0.5 })
  for (let i = -1.4; i <= 1.4; i += 0.2) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.001, 2.0), gridMat); l.position.set(i, 0.08, 0); printerScene.add(l) }
  for (let i = -0.9; i <= 0.9; i += 0.2) { const l = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.001, 0.005), gridMat); l.position.set(0, 0.08, i); printerScene.add(l) }

  const img = new Image()
  img.onload = () => {
    photoTexture = new THREE.Texture(img); photoTexture.colorSpace = THREE.SRGBColorSpace; photoTexture.needsUpdate = true
    const ratio = img.width / img.height; const planeW = 2.4; const planeH = planeW / ratio
    printPlane = new THREE.Mesh(new THREE.PlaneGeometry(planeW, planeH), new THREE.MeshStandardMaterial({ map: photoTexture, side: THREE.DoubleSide, roughness: 0.6 }))
    printPlane.rotation.x = -Math.PI / 2; printPlane.position.set(0, 0.09, 0); printPlane.scale.y = 0; printerScene.add(printPlane)
  }
  img.src = comicDataUrl.value

  const led = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00ff00 }))
  led.position.set(1.5, 2.05, 0); printerScene.add(led)
  renderPrinter()
}

function renderPrinter() {
  printerAnimId = requestAnimationFrame(renderPrinter)
  const elapsed = clock.getElapsedTime()
  if (printProgress.value < 1) { const phase = printProgress.value * 10; printerHead.position.x = Math.sin(phase * Math.PI * 2) * 1.3 }
  if (printPlane && printProgress.value < 1) { printPlane.scale.y = printProgress.value; printPlane.position.z = (1 - printProgress.value) * 0.5 }
  if (printerHead) { (printerHead.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.15 + Math.sin(elapsed * 10) * 0.1 }
  printerRenderer.render(printerScene, printerCamera)
}

function animatePrinting() {
  const steps = [
    { text: '正在加热打印头...', until: 15 },
    { text: '正在校准打印床...', until: 25 },
    { text: '正在打印漫画...', until: 70 },
    { text: '正在叠加食谱信息...', until: 90 },
    { text: '最终处理中...', until: 100 },
  ]
  printProgress.value = 0
  let lastTime = performance.now()
  const tick = (now: number) => {
    const delta = (now - lastTime) / 1000; lastTime = now
    printProgress.value = Math.min(1, printProgress.value + delta * 0.25)
    for (const step of steps) { if (printProgress.value * 100 <= step.until) { statusText.value = step.text; break } }
    if (printProgress.value < 1) requestAnimationFrame(tick)
    else { statusText.value = '打印完成！'; setTimeout(() => { stage.value = 'done'; emit('setEmotion', 'cool'); nextTick(() => drawRecipeCard()); cleanupPrinter() }, 500) }
  }
  requestAnimationFrame(tick)
}

function drawRecipeCard() {
  const canvas = recipeCanvas.value; if (!canvas) return
  const ctx = canvas.getContext('2d')!; const w = canvas.width; const h = canvas.height
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h)
  bgGrad.addColorStop(0, '#FFF8F0'); bgGrad.addColorStop(1, '#FFE5C2')
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#FF6B6B'; ctx.fillRect(0, 0, w, 6)
  ctx.fillStyle = '#FFD93D'; ctx.fillRect(0, 6, w, 3)

  const comicImg = new Image()
  comicImg.onload = () => {
    const photoX = 30, photoY = 30, photoW = w - 60
    const photoH = photoW * (comicImg.height / comicImg.width)
    ctx.save(); ctx.beginPath(); ctx.roundRect(photoX, photoY, photoW, photoH, 12); ctx.clip()
    ctx.drawImage(comicImg, photoX, photoY, photoW, photoH); ctx.restore()
    ctx.strokeStyle = '#3D2C1E'; ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.roundRect(photoX, photoY, photoW, photoH, 12); ctx.stroke()
    drawRecipeText(ctx, w, h, photoY + photoH + 16)
  }
  comicImg.src = comicDataUrl.value
}

function drawRecipeText(ctx: CanvasRenderingContext2D, w: number, h: number, startY: number) {
  ctx.fillStyle = '#3D2C1E'; ctx.font = 'bold 26px "PingFang SC", serif'; ctx.textAlign = 'center'
  ctx.fillText(dishName.value || '今日美味', w / 2, startY + 28)
  ctx.fillStyle = '#8B6F47'; ctx.font = '14px "PingFang SC"'
  ctx.fillText(dishComment.value || 'TOMO 觉得不错', w / 2, startY + 52)
  if (selectedTags.value.length > 0) {
    ctx.font = '11px "PingFang SC"'; const tags = selectedTags.value; const tagW = 72; const gap = 8
    const totalW = tags.length * tagW + (tags.length - 1) * gap; let tx = (w - totalW) / 2
    for (const tag of tags) {
      ctx.fillStyle = '#FF6B6B'; ctx.beginPath(); ctx.roundRect(tx, startY + 65, tagW, 22, 11); ctx.fill()
      ctx.fillStyle = '#FFF8F0'; ctx.fillText(tag, tx + tagW / 2, startY + 80); tx += tagW + gap
    }
  }
  ctx.save(); ctx.translate(w - 75, startY + 95); ctx.rotate(-0.15)
  ctx.strokeStyle = '#FF6B6B'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.roundRect(-38, -16, 76, 32, 8); ctx.stroke()
  ctx.fillStyle = '#FF6B6B'; ctx.font = 'bold 11px "PingFang SC"'; ctx.fillText('TOMO 认证', 0, 5); ctx.restore()
  ctx.font = '20px Arial'; ctx.textAlign = 'left'; ctx.fillText('tomato', 25, startY + 100)
  const now = new Date()
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`
  ctx.fillStyle = '#BBA080'; ctx.font = '11px Arial'; ctx.textAlign = 'left'; ctx.fillText(dateStr, 30, h - 18)
  ctx.fillStyle = '#DDB080'; ctx.font = '10px Arial'; ctx.textAlign = 'right'; ctx.fillText('TOMO · TOMATO STORIES', w - 30, h - 18)
  ctx.strokeStyle = '#FFD93D'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(30, h - 30); ctx.lineTo(w - 30, h - 30); ctx.stroke()
}

function downloadRecipe() {
  const canvas = recipeCanvas.value; if (!canvas) return
  const link = document.createElement('a')
  link.download = `tomo-recipe-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png'); link.click()
}

function reset() {
  stage.value = 'input'; photoDataUrl.value = ''; comicDataUrl.value = ''
  dishName.value = ''; dishComment.value = ''; selectedTags.value = []
  emit('setEmotion', 'idle')
}

function cleanupPrinter() {
  cancelAnimationFrame(printerAnimId)
  if (photoTexture) { photoTexture.dispose(); photoTexture = null }
  if (printPlane) { printPlane.geometry.dispose(); (printPlane.material as THREE.Material).dispose(); printPlane = null }
  if (printerRenderer) { printerRenderer.dispose(); printerRenderer.domElement?.parentNode?.removeChild(printerRenderer.domElement) }
}

onUnmounted(() => { cleanupPrinter() })
</script>

<style scoped>
.printer-panel .panel-body { padding-bottom: 24px; }

.api-key-bar { text-align: center; margin-bottom: 16px; }
.api-key-btn {
  padding: 8px 18px; background: rgba(46,213,115,0.15); border: 1px solid rgba(46,213,115,0.3);
  border-radius: 100px; color: #2ed573; font-size: 12px; cursor: pointer; transition: all 0.2s;
}
.api-key-btn:hover { background: rgba(46,213,115,0.25); }
.api-key-hint { font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 6px; }

.key-modal {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
  z-index: 200; display: flex; align-items: center; justify-content: center;
}
.key-modal-content {
  background: rgba(30,15,15,0.95); border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);
  padding: 24px; max-width: 90vw; width: 380px;
}
.key-modal-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
.provider-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
.provider-tab {
  padding: 6px 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 100px; font-size: 11px; cursor: pointer; transition: all 0.2s; color: rgba(255,255,255,0.5);
}
.provider-tab.active { background: rgba(255,71,87,0.2); border-color: rgba(255,71,87,0.5); color: #ff8b8b; }
.provider-tab:hover { background: rgba(255,255,255,0.1); }
.provider-desc { font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.5; margin-bottom: 14px; }
.key-input {
  width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff;
  font-size: 14px; outline: none; margin-bottom: 8px;
}
.key-input:focus { border-color: rgba(46,213,115,0.4); }
.key-modal-links { margin-bottom: 16px; }
.key-modal-links a { font-size: 12px; color: #74b9ff; text-decoration: none; }
.key-modal-actions { display: flex; gap: 8px; }
.key-save-btn { flex: 1; padding: 10px; background: linear-gradient(135deg, #2ed573, #1ea85b); border: none; border-radius: 100px; color: #fff; font-weight: 600; cursor: pointer; }
.key-clear-btn { padding: 10px 20px; background: rgba(255,71,87,0.15); border: 1px solid rgba(255,71,87,0.3); border-radius: 100px; color: #ff6b6b; cursor: pointer; }
.key-cancel-btn { padding: 10px 20px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; color: #fff; cursor: pointer; }

.printer-input-stage { text-align: center; padding: 10px 0; }
.printer-icon-big { font-size: 44px; margin-bottom: 8px; }
.printer-hint { font-size: 15px; color: rgba(255,255,255,0.8); font-weight: 600; margin-bottom: 4px; }
.printer-sub-hint { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 18px; }
.printer-upload-area { display: flex; gap: 10px; justify-content: center; margin-bottom: 16px; }
.printer-camera-btn, .printer-upload-btn {
  display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px; border-radius: 100px;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none;
}
.printer-camera-btn { background: linear-gradient(135deg, #ff4757, #ff6b81); color: #fff; box-shadow: 0 4px 15px rgba(255,71,87,0.3); }
.printer-camera-btn:hover { transform: scale(1.03); }
.printer-upload-btn { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.12); }
.printer-upload-btn:hover { background: rgba(255,255,255,0.12); }
.printer-preview { position: relative; margin-bottom: 16px; border-radius: 14px; overflow: hidden; border: 2px solid rgba(255,71,87,0.3); }
.preview-img { width: 100%; max-height: 200px; object-fit: cover; }
.preview-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.5)); padding: 8px 14px; text-align: left; font-size: 12px; color: #2ed573; }
.recipe-form { margin-bottom: 16px; text-align: left; }
.recipe-field { margin-bottom: 10px; }
.recipe-field label { display: block; font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
.recipe-field input { width: 100%; padding: 10px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-size: 14px; outline: none; }
.recipe-field input:focus { border-color: rgba(255,71,87,0.4); }
.recipe-field input::placeholder { color: rgba(255,255,255,0.25); }
.recipe-tags-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.recipe-tag-pick { padding: 5px 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
.recipe-tag-pick:hover { background: rgba(255,71,87,0.15); }
.recipe-tag-pick.active { background: rgba(255,71,87,0.2); border-color: rgba(255,71,87,0.5); color: #ff8b8b; }
.printer-start-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #6c5ce7, #ff4757); border: none; border-radius: 14px; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 6px 20px rgba(108,92,231,0.3); transition: all 0.2s; }
.printer-start-btn:hover { transform: scale(1.02); }

.printer-generating-stage { text-align: center; padding: 30px 0; }
.generating-icon { font-size: 40px; margin-bottom: 12px; animation: genPulse 1s ease-in-out infinite; }
@keyframes genPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
.generating-text { font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 14px; }
.generating-progress { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; margin: 0 30px; }
.gen-progress-fill { height: 100%; background: linear-gradient(90deg, #6c5ce7, #ff4757, #ffd700); border-radius: 3px; transition: width 0.1s linear; }
.generating-percent { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 6px; }

.printer-preview-stage { text-align: center; }
.compare-section { margin-bottom: 16px; }
.compare-label { font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 12px; font-weight: 600; }
.compare-images { display: flex; align-items: center; justify-content: center; gap: 8px; }
.compare-item { position: relative; }
.compare-img, .compare-canvas { width: 130px; height: 98px; border-radius: 10px; border: 2px solid rgba(255,255,255,0.1); object-fit: cover; }
.compare-tag { position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); font-size: 10px; color: rgba(255,255,255,0.4); white-space: nowrap; }
.compare-tag.comic { color: #ffd700; }
.compare-arrow { font-size: 20px; color: rgba(255,255,255,0.3); margin: 0 2px; }
.regen-row { display: flex; gap: 8px; margin: 24px 0 12px; }
.regen-btn, .regen-style-btn { flex: 1; padding: 10px; border: 1px solid rgba(255,255,255,0.12); border-radius: 100px; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); font-size: 12px; cursor: pointer; transition: all 0.2s; }
.regen-btn:hover, .regen-style-btn:hover { background: rgba(255,255,255,0.1); }
.printer-print-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #ff4757, #ffd700); border: none; border-radius: 14px; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 6px 20px rgba(255,71,87,0.3); transition: all 0.2s; }
.printer-print-btn:hover { transform: scale(1.02); }

.printer-anim-stage { text-align: center; }
.printer-canvas-container { width: 100%; height: 280px; border-radius: 14px; overflow: hidden; background: #1a1530; margin-bottom: 16px; }
.printer-status { padding: 0 20px; }
.printer-status-text { font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 8px; font-weight: 600; }
.printer-progress-bar { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
.printer-progress-fill { height: 100%; background: linear-gradient(90deg, #6c5ce7, #ff4757, #ffd700); border-radius: 3px; transition: width 0.1s linear; }
.printer-percent { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px; }

.printer-done-stage { text-align: center; }
.done-title { font-size: 16px; font-weight: 700; color: #2ed573; margin-bottom: 12px; }
.done-card-wrapper { display: flex; justify-content: center; margin-bottom: 16px; }
.recipe-card-canvas { width: 280px; height: auto; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
.done-actions { display: flex; gap: 8px; }
.done-download-btn { flex: 1; padding: 12px; background: linear-gradient(135deg, #ff4757, #ff6b81); border: none; border-radius: 12px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; }
.done-redo-btn { flex: 1; padding: 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; color: #fff; font-size: 14px; cursor: pointer; }
</style>
