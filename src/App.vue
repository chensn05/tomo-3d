<template>
  <div class="app-container">
    <!-- 3D Canvas -->
    <div ref="canvasContainer" class="canvas-container"></div>

    <!-- 梦核天气装饰层：云朵与雨滴 -->
    <div class="dream-weather" aria-label="TOMO 云朵与雨滴语录入口">
      <button class="dream-cloud cloud-left" aria-label="云朵 TOMO 语录" @click="dropQuote(21)"><i></i><b></b><em></em></button>
      <button class="dream-cloud cloud-right" aria-label="云朵 TOMO 语录" @click="dropQuote(22)"><i></i><b></b><em></em></button>
      <div class="dream-flower flower-left">✿</div>
      <div class="dream-flower flower-right">✾</div>
      <div class="dream-ribbon">⌁</div>
      <button
        v-for="i in 12"
        :key="i"
        class="dream-raindrop"
        :style="{ '--i': i }"
        :aria-label="`TOMO 语录 ${i}`"
        @click="dropQuote(i)"
      ></button>
    </div>

    <!-- 点击雨滴后掉落的 TOMO 语录 -->
    <Transition name="quote-drop">
      <div v-if="activeQuote" class="tomo-quote-card" role="status">
        <span class="quote-cloud-mark">☁</span>
        <span class="quote-text">{{ activeQuote }}</span>
        <button class="quote-close" aria-label="关闭语录" @click="activeQuote = ''">×</button>
        <button class="quote-save" aria-label="收进口袋" @click="saveCurrentQuote">收进口袋 ♡</button>
      </div>
    </Transition>

    <!-- TOMO 口袋 -->
    <button class="pocket-fab" v-if="showUI && savedQuotes.length > 0" @click="pocketVisible = true" aria-label="TOMO 口袋">
      🎒<span class="pocket-count">{{ savedQuotes.length }}</span>
    </button>
    <Transition name="quote-drop">
      <div v-if="pocketVisible" class="pocket-overlay" @click.self="pocketVisible = false">
        <div class="pocket-card">
          <div class="pocket-title">🎒 TOMO 的口袋</div>
          <div class="pocket-sub">被你收起来的那些话</div>
          <div class="pocket-list">
            <div v-for="q in savedQuotes" :key="q" class="pocket-item">
              <span>“{{ q }}”</span>
              <button class="pocket-remove" @click="removeSavedQuote(q)" aria-label="移除">×</button>
            </div>
          </div>
          <button class="pocket-close" @click="pocketVisible = false">合上口袋</button>
        </div>
      </div>
    </Transition>

    <!-- 新手引导 -->
    <div class="onboarding-overlay" v-if="showOnboarding" @click.self="skipOnboarding">
      <div class="onboarding-card">
        <div class="onboarding-icon">{{ onboardingSteps[onboardingStep].icon }}</div>
        <div class="onboarding-title">{{ onboardingSteps[onboardingStep].title }}</div>
        <div class="onboarding-body">{{ onboardingSteps[onboardingStep].body }}</div>
        <div class="onboarding-dots">
          <span v-for="(s, i) in onboardingSteps" :key="i" :class="{ active: i === onboardingStep }"></span>
        </div>
        <div class="onboarding-actions">
          <button class="onboarding-skip" @click="skipOnboarding">跳过</button>
          <button class="onboarding-next" @click="nextOnboardingStep">
            {{ onboardingStep === onboardingSteps.length - 1 ? '开始玩吧 ✦' : '下一步' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 加载界面 -->
    <div class="loading-screen" :class="{ hidden: loaded }">
      <div class="loading-tomato"></div>
      <div class="loading-text">{{ loadingText }}</div>
    </div>

    <!-- 品牌logo -->
    <div class="brand-logo" v-if="showUI">
      <img class="brand-title-art" src="/brand/tomo-title.svg" alt="TOMO" />
      <div class="tagline">TOMATO · STORIES</div>
    </div>

    <!-- 情绪标签 -->
    <div class="emotion-badge" v-if="showUI && currentEmotion">
      <span class="emoji">{{ currentEmotion.emoji }}</span>
      <span>{{ currentEmotion.label }}</span>
    </div>

    <!-- 故事文本 -->
    <div class="story-overlay" v-if="showUI && currentChapter && activePanel === 'story'" :class="{ hidden: storyHidden }">
      <div class="story-text" :class="{ visible: storyVisible }">
        <span class="story-stamp">TOMO<br/>POST</span>
        <span class="story-flower-mark">✿</span>
        <div class="chapter">第 {{ currentChapter.index + 1 }} 章 · {{ currentChapter.title }}</div>
        <div class="body">{{ currentChapter.body }}</div>
      </div>
    </div>

    <!-- 底部情绪选择器 (story模式) -->
    <div class="emotion-picker" v-if="showUI && activePanel === 'story'">
      <div
        v-for="emo in emotions"
        :key="emo.id"
        class="emotion-chip"
        :class="{ active: currentEmotionId === emo.id }"
        @click="setEmotion(emo.id)"
      >
        {{ emo.emoji }}
      </div>
    </div>

    <!-- 故事导航 -->
    <div class="nav-controls" v-if="showUI && activePanel === 'story'">
      <button class="nav-btn" @click="prevChapter" :disabled="chapterIndex === 0">‹</button>
      <button class="nav-btn" @click="nextChapter" :disabled="chapterIndex >= chapters.length - 1">›</button>
    </div>

    <!-- 滚动提示 -->
    <div class="scroll-hint" v-if="showUI && activePanel === 'story' && chapterIndex < chapters.length - 1 && !storyHidden">← → 翻页 · 拖拽TOMO移动 · 双击重置</div>

    <!-- 显示故事按钮 (隐藏时出现) -->
    <div class="show-story-btn" v-if="showUI && activePanel === 'story' && storyHidden" @click="toggleStory">
      📖 显示故事
    </div>

    <!-- ====== 功能面板 ====== -->

    <!-- DIY 配件工坊 -->
    <div class="feature-panel" v-if="showUI && activePanel === 'workshop'">
      <div class="panel-header">
        <span class="panel-title">🎭 DIY 配件工坊</span>
        <button class="panel-close" @click="closePanel">✕</button>
      </div>
      <div class="panel-body">
        <div class="workshop-section">
          <div class="section-label">配件</div>
          <div class="accessory-grid">
            <div
              v-for="acc in accessoryOptions"
              :key="acc.id"
              class="accessory-item"
              :class="{ active: activeAccessories.includes(acc.id) }"
              @click="toggleAccessory(acc.id)"
            >
              <span class="acc-emoji">{{ acc.emoji }}</span>
              <span class="acc-name">{{ acc.name }}</span>
            </div>
          </div>
        </div>
        <div class="workshop-section">
          <div class="section-label">番茄颜色</div>
          <div class="color-grid">
            <div
              v-for="c in colorOptions"
              :key="c.value"
              class="color-swatch"
              :class="{ active: currentColor === c.value }"
              :style="{ background: c.hex }"
              @click="setColor(c.value)"
            ></div>
          </div>
        </div>
        <button class="workshop-reset" @click="resetWorkshop">重置</button>
      </div>
    </div>

    <!-- 场景切换 -->
    <div class="feature-panel" v-if="showUI && activePanel === 'scenes'">
      <div class="panel-header">
        <span class="panel-title">🏞️ 场景切换</span>
        <button class="panel-close" @click="closePanel">✕</button>
      </div>
      <div class="panel-body">
        <div class="scene-grid">
          <div
            v-for="s in sceneOptions"
            :key="s.id"
            class="scene-item"
            :class="{ active: currentScene === s.id }"
            @click="setScene(s.id)"
          >
            <div class="scene-preview" :style="{ background: s.gradient }">
              <span class="scene-emoji">{{ s.emoji }}</span>
            </div>
            <span class="scene-name">{{ s.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 情绪猜猜乐 -->
    <!-- TOMO 图鉴 -->
    <div class="feature-panel codex-panel" v-if="showUI && activePanel === 'codex'">
      <div class="panel-header">
        <span class="panel-title">📖 TOMO 图鉴</span>
        <button class="panel-close" @click="closePanel">✕</button>
      </div>
      <div class="panel-body">
        <div class="codex-grid">
          <div
            v-for="emo in emotions"
            :key="emo.id"
            class="codex-card"
            :class="{ active: currentEmotionId === emo.id }"
            @click="setEmotion(emo.id)"
          >
            <div class="codex-emoji">{{ emo.emoji }}</div>
            <div class="codex-label">{{ emo.label }}</div>
            <div class="codex-desc">{{ getCodexDesc(emo.id) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 新功能面板 ====== -->

    <!-- 🍅 番茄钟 -->
    <!-- 🍅 番茄钟（全屏覆盖） -->
    <PomodoroPanel
      v-if="showUI && activePanel === 'pomodoro'"
      @close="closePanel"
      @set-emotion="setEmotion"
    />

    <!-- 🔮 每日运势 -->
    <FortunePanel
      v-if="showUI && activePanel === 'fortune'"
      @close="closePanel"
      @set-emotion="setEmotion"
    />

    <!-- 🌳 情绪树洞 -->
    <TreeHolePanel
      v-if="showUI && activePanel === 'treehole'"
      @close="closePanel"
      @set-emotion="setEmotion"
    />

    <!-- 🧪 性格测试 -->
    <PersonalityPanel
      v-if="showUI && activePanel === 'personality'"
      ref="personalityPanelRef"
      @close="closePanel"
      @set-emotion="setEmotion"
      @screenshot="handlePersonalityScreenshot"
    />

    <!-- 🌱 番茄园（养成） -->
    <GardenPanel
      v-if="showUI && activePanel === 'garden'"
      @close="closePanel"
      @set-emotion="setEmotion"
    />

    <!-- 🎨 心情鸡尾酒 -->
    <MoodMixerPanel
      v-if="showUI && activePanel === 'mixer'"
      @close="closePanel"
      @set-emotion="setEmotion"
    />

    <!-- 🎁 周边商店 -->
    <MerchPanel
      v-if="showUI && activePanel === 'merch'"
      @close="closePanel"
      @set-emotion="setEmotion"
    />

    <!-- 周边特写弹窗 -->
    <MerchDetailView
      :visible="merchDetailVisible"
      :item="merchDetailItem"
      @close="merchDetailVisible = false"
    />

    <!-- 拍照弹窗 -->
    <div class="photo-modal" v-if="showPhotoModal" @click.self="showPhotoModal = false">
      <div class="photo-modal-content">
        <div class="photo-modal-header">
          <span>📸 TOMO 拍照</span>
          <button @click="showPhotoModal = false">✕</button>
        </div>
        <img :src="photoDataUrl" class="photo-preview" v-if="photoDataUrl" />
        <div class="photo-watermark">TOMO · TOMATO STORIES</div>
        <a :href="photoDataUrl" download="tomo-photo.png" class="photo-download-btn">
          下载图片 ↓
        </a>
      </div>
    </div>

    <!-- ====== 底部功能栏 ====== -->
    <div class="feature-dock" v-if="showUI">
      <button class="dock-btn" :class="{ active: activePanel === 'story' }" @click="openPanel('story')">
        <span class="dock-icon">📖</span>
        <span class="dock-label">故事</span>
      </button>
      <button class="dock-btn" :class="{ active: activePanel === 'workshop' }" @click="openPanel('workshop')">
        <span class="dock-icon">🎭</span>
        <span class="dock-label">DIY</span>
      </button>
      <button class="dock-btn" :class="{ active: activePanel === 'scenes' }" @click="openPanel('scenes')">
        <span class="dock-icon">🏞️</span>
        <span class="dock-label">场景</span>
      </button>
      <button class="dock-btn" :class="{ active: activePanel === 'codex' }" @click="openPanel('codex')">
        <span class="dock-icon">📚</span>
        <span class="dock-label">图鉴</span>
      </button>
      <div class="dock-divider"></div>
      <button class="dock-btn" :class="{ active: activePanel === 'pomodoro' }" @click="openPanel('pomodoro')">
        <span class="dock-icon">⏱️</span>
        <span class="dock-label">番茄钟</span>
      </button>
      <button class="dock-btn" :class="{ active: activePanel === 'fortune' }" @click="openPanel('fortune')">
        <span class="dock-icon">🔮</span>
        <span class="dock-label">运势</span>
      </button>
      <button class="dock-btn" :class="{ active: activePanel === 'treehole' }" @click="openPanel('treehole')">
        <span class="dock-icon">🌳</span>
        <span class="dock-label">树洞</span>
      </button>
      <button class="dock-btn" :class="{ active: activePanel === 'personality' }" @click="openPanel('personality')">
        <span class="dock-icon">🧪</span>
        <span class="dock-label">性格</span>
      </button>
      <button class="dock-btn" :class="{ active: activePanel === 'garden' }" @click="openPanel('garden')">
        <span class="dock-icon">🌱</span>
        <span class="dock-label">番茄园</span>
      </button>
      <button class="dock-btn" :class="{ active: activePanel === 'mixer' }" @click="openPanel('mixer')">
        <span class="dock-icon">🎨</span>
        <span class="dock-label">鸡尾酒</span>
      </button>
      <button class="dock-btn" :class="{ active: activePanel === 'merch' }" @click="openPanel('merch')">
        <span class="dock-icon">🎁</span>
        <span class="dock-label">周边</span>
      </button>
    </div>

    <!-- 路由出口 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { TomoScene, SceneTheme } from './three/TomoScene'
import { emotions, chapters } from './three/emotions'
import PomodoroPanel from './components/PomodoroPanel.vue'
import FortunePanel from './components/FortunePanel.vue'
import TreeHolePanel from './components/TreeHolePanel.vue'
import PersonalityPanel from './components/PersonalityPanel.vue'
import GardenPanel from './components/GardenPanel.vue'
import MoodMixerPanel from './components/MoodMixerPanel.vue'
import MerchPanel from './components/MerchPanel.vue'
import MerchDetailView, { MerchDisplay } from './components/MerchDetailView.vue'
import { CustomAccessory } from './three/TomoCharacter'

const router = useRouter()
const canvasContainer = ref<HTMLElement>()
const loaded = ref(false)
const showUI = ref(false)
const currentEmotionId = ref('idle')
const chapterIndex = ref(0)
const storyVisible = ref(false)
const storyHidden = ref(false) // 用户点击空白处隐藏故事文本
const activeQuote = ref('')
let quoteTimer: number | null = null

const tomoQuotes = [
  '你不是效率机器，今天慢一点，也完全可以。',
  '先把眼前这一小步走完，不用一次解决整个人生。',
  '被忽略的情绪也算数，TOMO 有在听。',
  '你已经很努力了，不需要再用崩溃证明自己。',
  '今天不想社交，就把自己藏进一朵云里吧。',
  '别人走得快，不代表你走得慢就是错。',
  '可以暂时没有答案，迷路也是故事的一部分。',
  '工作只是生活的一页，不是你全部的名字。',
  '先吃饭，先喝水，先让身体回到你这边。',
  '你不必一直懂事，偶尔被照顾也很好。',
  '没有产出的下午，也可以有它自己的价值。',
  '今天的你不需要闪闪发光，平安落地就很好。',
  '把“我应该”放一放，听听“我想要”吧。',
  '如果很累，就把目标缩小到下一口呼吸。',
  'TOMO 说：你值得被温柔对待，尤其是被自己。',
]

function dropQuote(index: number) {
  const offset = Math.abs(index * 7 + new Date().getDate()) % tomoQuotes.length
  activeQuote.value = tomoQuotes[offset]
  if (quoteTimer) window.clearTimeout(quoteTimer)
  quoteTimer = window.setTimeout(() => { activeQuote.value = '' }, 6500)
}

// TOMO 口袋：收藏语录
const savedQuotes = ref<string[]>(JSON.parse(localStorage.getItem('tomo-pocket') || '[]'))
const pocketVisible = ref(false)
function saveCurrentQuote() {
  const q = activeQuote.value
  if (!q || savedQuotes.value.includes(q)) return
  savedQuotes.value.unshift(q)
  if (savedQuotes.value.length > 30) savedQuotes.value.pop()
  localStorage.setItem('tomo-pocket', JSON.stringify(savedQuotes.value))
  activeQuote.value = ''
}
function removeSavedQuote(q: string) {
  savedQuotes.value = savedQuotes.value.filter(s => s !== q)
  localStorage.setItem('tomo-pocket', JSON.stringify(savedQuotes.value))
}

// 功能面板
const activePanel = ref('story')

// DIY 工坊
const activeAccessories = ref<string[]>([])
const currentColor = ref(0xee4444)

// 场景
const currentScene = ref<SceneTheme>('kitchen')

// 拍照
const showPhotoModal = ref(false)
const photoDataUrl = ref('')

// 周边特写弹窗
const merchDetailVisible = ref(false)
const merchDetailItem = ref<MerchDisplay | null>(null)

// 新手引导
const showOnboarding = ref(false)
const onboardingStep = ref(0)
const onboardingSteps = [
  { icon: '🤗', title: '欢迎来到 TOMO 的世界', body: '这是一颗有情绪的小番茄，住在梦幻的房间里。' },
  { icon: '✋', title: '拖动 TOMO 到处玩', body: '按住 TOMO 可以把它拖到桌子任意位置，点它会切换心情，双击屏幕可以归位。' },
  { icon: '💧', title: '戳一戳雨滴和云朵', body: '下雨时会掉落 TOMO 想对你说的话，点击云朵也有惊喜。喜欢的句子可以收进口袋。' },
  { icon: '🎁', title: '桌子上的小物件都能拖', body: '插画卡、冰箱贴、钥匙扣都是你的桌面摆件，随便布置。点击可以看大图。' },
  { icon: '⏱️', title: '番茄钟会照顾番茄园', body: '专注完成的次数越多，番茄园可以浇的水就越多，慢慢养成一颗属于你的番茄。' },
]
function nextOnboardingStep() {
  if (onboardingStep.value < onboardingSteps.length - 1) {
    onboardingStep.value++
  } else {
    showOnboarding.value = false
    localStorage.setItem('tomo-onboarded', '1')
  }
}
function skipOnboarding() {
  showOnboarding.value = false
  localStorage.setItem('tomo-onboarded', '1')
}

function showMerchDetail(item: MerchDisplay) {
  merchDetailItem.value = item
  merchDetailVisible.value = true
}

// 组件 refs
const personalityPanelRef = ref<InstanceType<typeof PersonalityPanel>>()

// 猜猜乐

let tomoScene: TomoScene | null = null

// 加载文案轮播
const loadingText = ref('TOMO 正在醒来...')
const loadingPhrases = ['TOMO 正在醒来...', '正在摆桌子...', '正在给小苗浇水...', '正在数雨滴...']
let loadingIdx = 0
const loadingTimer = window.setInterval(() => {
  loadingIdx = (loadingIdx + 1) % loadingPhrases.length
  loadingText.value = loadingPhrases[loadingIdx]
  if (loaded.value) window.clearInterval(loadingTimer)
}, 1400)

const currentEmotion = computed(() => emotions.find(e => e.id === currentEmotionId.value))
const currentChapter = computed(() => {
  const ch = chapters[chapterIndex.value]
  return ch ? { ...ch, index: chapterIndex.value } : null
})

// 配件选项
const accessoryOptions = [
  { id: 'glasses', emoji: '👓', name: '眼镜' },
  { id: 'sunglasses', emoji: '🕶️', name: '墨镜' },
  { id: 'hat', emoji: '🎩', name: '礼帽' },
  { id: 'bowtie', emoji: '🎀', name: '领结' },
  { id: 'mustache', emoji: '👨', name: '胡子' },
  { id: 'headphones', emoji: '🎧', name: '耳机' },
  { id: 'crown', emoji: '👑', name: '皇冠' },
]

// 颜色选项
const colorOptions = [
  { value: 0xee4444, hex: '#ee4444' },
  { value: 0xff6b6b, hex: '#ff6b6b' },
  { value: 0xff9933, hex: '#ff9933' },
  { value: 0xffd700, hex: '#ffd700' },
  { value: 0x2ed573, hex: '#2ed573' },
  { value: 0x4488ff, hex: '#4488ff' },
  { value: 0xa55eea, hex: '#a55eea' },
  { value: 0xff66aa, hex: '#ff66aa' },
  { value: 0xffffff, hex: '#ffffff' },
]

// 场景选项
const sceneOptions = [
  { id: 'kitchen' as SceneTheme, emoji: '🏠', name: '暖室', gradient: 'linear-gradient(135deg, #f5ead0, #e8d5b8)' },
  { id: 'garden' as SceneTheme, emoji: '🌿', name: '森系清晨', gradient: 'linear-gradient(135deg, #e4f0d7, #b9d8bd)' },
  { id: 'sunset' as SceneTheme, emoji: '🌅', name: '黄昏', gradient: 'linear-gradient(135deg, #f0d0a8, #e0b888)' },
]

// 图鉴描述
const codexDescs: Record<string, string> = {
  idle: 'TOMO 的日常状态，平静地待在厨房角落。',
  shy: '被夸奖或注视时会害羞，脸颊泛起粉红。',
  angry: '被放上砧板时会很生气，怒视一切。',
  bored: '等了太久没人理，开始感到无聊。',
  confused: '面对选择时一脸茫然，不知道该往哪走。',
  flattered: '被厨师夸"好红好饱满"时的得意表情。',
  crying: '从灶台滚落的瞬间，泪流成河。',
  sad: '躲在角落里想着渺小的番茄人生。',
  sick: '地板太凉感冒了，额头上搭着冷敷巾。',
  cool: '觉醒后戴上墨镜，"我不做食材，我做自己"。',
}

function getCodexDesc(id: string): string {
  return codexDescs[id] || ''
}

function setEmotion(id: string) {
  currentEmotionId.value = id
  tomoScene?.setEmotion(id)
}

function openPanel(panel: string) {
  activePanel.value = panel
}

function closePanel() {
  activePanel.value = 'story'
}

function prevChapter() {
  if (chapterIndex.value > 0) {
    chapterIndex.value--
    triggerChapter()
  }
}

function nextChapter() {
  if (chapterIndex.value < chapters.length - 1) {
    chapterIndex.value++
    triggerChapter()
  }
}

function triggerChapter() {
  storyVisible.value = false
  storyHidden.value = false
  const ch = chapters[chapterIndex.value]
  if (ch) {
    tomoScene?.setEmotion(ch.emotion)
    currentEmotionId.value = ch.emotion
    setTimeout(() => { storyVisible.value = true }, 300)
  }
}

function toggleStory() {
  storyHidden.value = !storyHidden.value
  if (!storyHidden.value) {
    storyVisible.value = false
    setTimeout(() => { storyVisible.value = true }, 50)
  }
}

// DIY 工坊
function toggleAccessory(id: string) {
  const isOn = tomoScene?.toggleCustomAccessory(id) ?? false
  if (isOn) {
    activeAccessories.value = [...activeAccessories.value, id]
  } else {
    activeAccessories.value = activeAccessories.value.filter(a => a !== id)
  }
}

function setColor(color: number) {
  currentColor.value = color
  tomoScene?.setBodyColor(color)
}

function resetWorkshop() {
  activeAccessories.value.forEach(a => tomoScene?.toggleCustomAccessory(a))
  activeAccessories.value = []
  setColor(0xee4444)
}

// 场景切换
function setScene(scene: SceneTheme) {
  currentScene.value = scene
  tomoScene?.setTheme(scene)
}

// 拍照
function takePhoto() {
  const dataUrl = tomoScene?.screenshot()
  if (dataUrl) {
    photoDataUrl.value = dataUrl
    showPhotoModal.value = true
  }
}

// 性格测试截图
function handlePersonalityScreenshot() {
  const dataUrl = tomoScene?.screenshot()
  if (dataUrl) {
    photoDataUrl.value = dataUrl
    showPhotoModal.value = true
  }
}

// 滚轮/触摸切换章节（仅story面板）
function onWheel(e: WheelEvent) {
  if (activePanel.value !== 'story') return
  if (e.deltaY > 30) nextChapter()
  else if (e.deltaY < -30) prevChapter()
}

let touchStartY = 0
function onTouchStart(e: TouchEvent) {
  touchStartY = e.touches[0].clientY
}
function onTouchEnd(e: TouchEvent) {
  if (activePanel.value !== 'story') return
  const diff = touchStartY - e.changedTouches[0].clientY
  if (diff > 50) nextChapter()
  else if (diff < -50) prevChapter()
}

function onKeydown(e: KeyboardEvent) {
  if (activePanel.value !== 'story') return
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextChapter()
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevChapter()
}

function enterStory() {
  showUI.value = true
  router.push('/story')
  triggerChapter()
  // 首次进入显示新手引导
  if (!localStorage.getItem('tomo-onboarded')) {
    setTimeout(() => { showOnboarding.value = true }, 800)
  }
}

// 路由变化时进入/退出故事模式
watch(() => router.currentRoute.value.path, (path) => {
  if (path === '/story' && !showUI.value) {
    enterStory()
  }
})

onMounted(async () => {
  if (!canvasContainer.value) return

  tomoScene = new TomoScene(canvasContainer.value)
  await tomoScene.init()

  tomoScene.onTomoClick = () => {
    if (activePanel.value === 'story') {
      if (storyHidden.value) {
        toggleStory()
        return
      }
      const randomEmotions = ['shy', 'angry', 'confused', 'cool', 'flattered']
      const next = randomEmotions[Math.floor(Math.random() * randomEmotions.length)]
      setEmotion(next)
    }
  }

  // 点击周边展示物 → 弹出特写窗
  tomoScene.onMerchClick = (info) => {
    const item: MerchDisplay = {
      ...info,
      style: '复古蜡笔插画风',
      desc: '',
      tags: [],
      imageUrl: (info as any).imageUrl,
    }
    // 补充描述信息
    const descs: Record<string, { desc: string; tags: string[] }> = {
      hero: { desc: 'TOMO 双手捧脸，被闪光和星星包围，惊喜又雀跃的高光时刻。', tags: ['惊喜', '闪亮', '治愈'] },
      sleep: { desc: 'TOMO 蜷缩着安静睡着，头顶飘着 Zzz，夜晚的宁静时刻。', tags: ['睡觉', '夜晚', '宁静'] },
      chill: { desc: 'TOMO 戴着耳机躺平，闭眼享受属于自己的放空时间。', tags: ['摸鱼', '耳机', '躺平'] },
      eating: { desc: 'TOMO 举着筷子和碗，眼睛发光，准备开吃的兴奋模样。', tags: ['吃饭', '干饭', '兴奋'] },
      hug: { desc: 'TOMO 张开双臂，周围飘着爱心，“给你一个大大的番茄拥抱”。', tags: ['拥抱', '爱心', '治愈'] },
      cool: { desc: 'TOMO 戴着圆框眼镜双手抱胸，“我不做食材，我做自己”的自信模样。', tags: ['要酷', '自信', '眼镜'] },
      magnet: { desc: 'TOMO 冰箱贴，厚实的磁铁质感 + 正面番茄表情。贴在冰箱上，每天打开都有好心情。', tags: ['冰箱贴', '磁铁', '日常'] },
      keychain: { desc: 'TOMO 亚克力钥匙扣，双层透明亚克力 + 金属圆环。随身携带的番茄小伙伴。', tags: ['钥匙扣', '亚克力', '随身'] },
      pin: { desc: 'TOMO 珐琅徽章别针，金色外圈 + 珐琅内圈。别在包包、帽子上点亮穿搭。', tags: ['徽章', '珐琅', '金色'] },
      figure_wave: { desc: 'TOMO 迷你手办·打招呼姿势。展示底座 + 招手造型，桌面的治愈摆件。', tags: ['手办', '展示', '摆件'] },
      figure_sit: { desc: 'TOMO 迷你手办·坐姿。安静坐着的样子，适合放在显示器旁边。', tags: ['手办', '坐姿', '桌面'] },
      figure_jump: { desc: 'TOMO 迷你手办·跳跃姿势。双手高举的开心瞬间，能量满满。', tags: ['手办', '跳跃', '能量'] },
    }
    const extra = descs[info.id] || { desc: '', tags: [] }
    item.desc = extra.desc
    item.tags = extra.tags
    showMerchDetail(item)
  }

  // 点击3D场景空白区域隐藏故事文本
  // 用 flag 区分：点番茄 vs 点空白
  let clickedTomo = false
  const origOnTomoClick = tomoScene.onTomoClick
  tomoScene.onTomoClick = () => {
    clickedTomo = true
    origOnTomoClick?.()
  }
  canvasContainer.value?.addEventListener('click', () => {
    if (!clickedTomo && activePanel.value === 'story' && !storyHidden.value) {
      storyHidden.value = true
      storyVisible.value = false
    }
    clickedTomo = false
  })

  loaded.value = true

  if (router.currentRoute.value.path === '/story') {
    enterStory()
  } else {
    showUI.value = false
    tomoScene.setEmotion('idle')
  }

  window.addEventListener('wheel', onWheel, { passive: true })
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchend', onTouchEnd, { passive: true })
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  tomoScene?.dispose()
  window.removeEventListener('wheel', onWheel)
  window.removeEventListener('touchstart', onTouchStart)
  window.removeEventListener('touchend', onTouchEnd)
  window.removeEventListener('keydown', onKeydown)
  if (quoteTimer) window.clearTimeout(quoteTimer)
})

defineExpose({ enterStory })
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.canvas-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
