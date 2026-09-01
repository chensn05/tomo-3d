<template>
  <div class="pomo-fullscreen" :class="pomoState">
    <!-- 完成庆祝动画 -->
    <div class="pomo-celebrate" v-if="celebrateVisible" aria-hidden="true">
      <span v-for="i in 14" :key="i" class="celebrate-petal" :style="{ '--i': i }">✿</span>
      <div class="celebrate-stamp"><TomoIcon name="tomato" /><br/>第 {{ todayCount }} 个
      </div>
    </div>

    <!-- 背景层 -->
    <div class="pomo-bg"></div>
    <div class="pomo-bg-gradient"></div>

    <!-- 手绘早餐桌面装饰 -->
    <div class="doodle-scene" aria-hidden="true">
      <div class="doodle-tomato tomato-a"><i></i></div>
      <div class="doodle-tomato tomato-b"><i></i></div>
      <div class="doodle-plate"></div>
      <div class="doodle-fork"></div>
      <div class="doodle-spoon"></div>
      <div class="doodle-star star-a">✦</div>
      <div class="doodle-star star-b">✦</div>
      <div class="doodle-spark spark-a">· · ·</div>
      <div class="doodle-spark spark-b">· ·</div>
    </div>

    <!-- 顶部栏 -->
    <div class="pomo-topbar">
      <div class="pomo-brand"><TomoIcon name="tomato" /> TOMO</div>
      <button class="pomo-exit" @click="$emit('close')"><TomoIcon name="close" /></button>
    </div>

    <!-- TOMO 表情区 -->
    <div class="pomo-tomo-area">
      <div class="pomo-tomo-emoji"><TomoIcon :name="tomoEmoji" /></div>
      <div class="pomo-tomo-msg">{{ tomoMessage }}</div>
    </div>

    <!-- 中央计时器 -->
    <div class="pomo-center">
      <div class="pomo-ring-wrapper">
        <svg class="pomo-ring" :width="ringSize" :height="ringSize" :viewBox="`0 0 ${ringSize} ${ringSize}`">
          <circle class="pomo-ring-bg" :cx="ringSize/2" :cy="ringSize/2" :r="ringR" />
          <circle
            class="pomo-ring-progress"
            :cx="ringSize/2" :cy="ringSize/2" :r="ringR"
            :stroke-dasharray="ringCircumference"
            :stroke-dashoffset="ringOffset"
          />
        </svg>
        <div class="pomo-display">
          <div class="pomo-time"><span>{{ displayTime }}</span></div>
          <div class="pomo-state-label">{{ stateLabel }}</div>
        </div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="pomo-controls">
      <button class="pomo-btn primary" @click="toggleTimer" v-if="pomoState !== 'running'">
        {{ pomoState === 'paused' ? '继续' : pomoState === 'idle' ? '开始专注' : '开始休息' }}
      </button>
      <button class="pomo-btn warn" @click="pauseTimer" v-if="pomoState === 'running'">暂停</button>
      <button class="pomo-btn ghost" @click="resetTimer" v-if="pomoState !== 'idle'">重置</button>
    </div>

    <!-- 时长设置（idle时显示） -->
    <div class="pomo-settings" v-if="pomoState === 'idle'">
      <div class="pomo-setting-row">
        <span>专注时长</span>
        <div class="pomo-duration-picker">
          <button @click="adjustTime('work', -5)">−</button>
          <span>{{ workMinutes }} 分钟</span>
          <button @click="adjustTime('work', 5)">+</button>
        </div>
      </div>
      <div class="pomo-setting-row">
        <span>休息时长</span>
        <div class="pomo-duration-picker">
          <button @click="adjustTime('rest', -1)">−</button>
          <span>{{ restMinutes }} 分钟</span>
          <button @click="adjustTime('rest', 1)">+</button>
        </div>
      </div>
    </div>

    <!-- 白噪音开关 -->
    <div class="pomo-sound-panel">
      <div class="sound-tabs">
        <div
          v-for="s in sounds"
          :key="s.id"
          class="sound-tab"
          :class="{ active: currentSound === s.id }"
          @click="selectSound(s.id)"
        >
          <span class="sound-icon"><TomoIcon :name="s.icon" /></span>
          <span class="sound-name">{{ s.name }}</span>
        </div>
      </div>
      <div class="volume-row" v-if="currentSound !== 'none'">
        <span class="vol-label"><TomoIcon name="sound-on" /></span>
        <input type="range" min="0" max="100" v-model.number="volume" class="vol-slider" @input="applyVolume" />
        <span class="vol-value">{{ volume }}</span>
      </div>
    </div>

    <!-- 今日战绩 -->
    <div class="pomo-stats-bar">
      <div class="pomo-stat-item">
        <div class="pomo-stat-num">{{ todayCount }}</div>
        <div class="pomo-stat-label">今日番茄</div>
      </div>
      <div class="pomo-stat-divider"></div>
      <div class="pomo-stat-item">
        <div class="pomo-stat-num">{{ totalFocusMinutes }}</div>
        <div class="pomo-stat-label">专注分钟</div>
      </div>
      <div class="pomo-stat-divider"></div>
      <div class="pomo-stat-item">
        <div class="pomo-stat-num">{{ bestStreak }}</div>
        <div class="pomo-stat-label">连续天数</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  close: []
  setEmotion: [emotionId: string]
}>()

type PomoState = 'idle' | 'running' | 'paused' | 'resting'

const pomoState = ref<PomoState>('idle')
const workMinutes = ref(25)
const restMinutes = ref(5)
const remainingSeconds = ref(25 * 60)
const totalSeconds = ref(25 * 60)
let timerId: number | null = null

const todayCount = ref(0)
const totalFocusMinutes = ref(0)
const bestStreak = ref(0)

// 白噪音
const sounds = [
  { id: 'none', icon: 'sound-off', name: '静音' },
  { id: 'rain', icon: 'rain', name: '雨声' },
  { id: 'kitchen', icon: 'pan', name: '厨房' },
  { id: 'forest', icon: 'forest', name: '森林' },
  { id: 'cafe', icon: 'coffee', name: '咖啡馆' },
  { id: 'wave', icon: 'wave', name: '海浪' },
]
const currentSound = ref<string>('none')
const volume = ref<number>(50)
let audioCtx: AudioContext | null = null
let audioSource: any = null
let gainNode: GainNode | null = null
let noiseNode: AudioBufferSourceNode | null = null

function selectSound(id: string) {
  currentSound.value = id
  stopSound()
  if (id !== 'none') playSound(id)
}

function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  if (!gainNode) {
    gainNode = audioCtx.createGain()
    gainNode.gain.value = volume.value / 100 * 0.3
    gainNode.connect(audioCtx.destination)
  }
}

function playSound(type: string) {
  ensureAudio()
  if (!audioCtx || !gainNode) return

  // 合成白噪音（不依赖外部音频文件）
  const bufferSize = 2 * audioCtx.sampleRate
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const output = buffer.getChannelData(0)

  if (type === 'rain') {
    // 白噪音类似雨声
    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      output[i] = (lastOut + 0.02 * white) / 1.02
      lastOut = output[i]
      output[i] *= 3.5
    }
  } else if (type === 'wave') {
    // 派浪 - 慢波动
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioCtx.sampleRate
      const slow = Math.sin(t * 0.5) * 0.3 + 0.7
      output[i] = (Math.random() * 2 - 1) * slow * 0.5
    }
  } else if (type === 'forest') {
    // 森林 - 高频噪音+偶尔鸟鸣
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.3
    }
  } else if (type === 'kitchen') {
    // 厨房 - 不规则噪音
    for (let i = 0; i < bufferSize; i++) {
      const pulse = Math.sin(i * 0.0001) > 0.9 ? 2 : 1
      output[i] = (Math.random() * 2 - 1) * 0.4 * pulse
    }
  } else if (type === 'cafe') {
    // 咖啡馆 - 低频嗡嗡
    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      output[i] = (lastOut + 0.005 * white) / 1.005
      lastOut = output[i]
      output[i] *= 4
    }
  }

  noiseNode = audioCtx.createBufferSource()
  noiseNode.buffer = buffer
  noiseNode.loop = true

  // 添加滤波啦区分不同声音风格
  const filter = audioCtx.createBiquadFilter()
  if (type === 'rain') { filter.type = 'lowpass'; filter.frequency.value = 3000 }
  else if (type === 'wave') { filter.type = 'lowpass'; filter.frequency.value = 800 }
  else if (type === 'forest') { filter.type = 'bandpass'; filter.frequency.value = 2500; filter.Q.value = 0.5 }
  else if (type === 'kitchen') { filter.type = 'lowpass'; filter.frequency.value = 2000 }
  else if (type === 'cafe') { filter.type = 'lowpass'; filter.frequency.value = 500 }

  noiseNode.connect(filter)
  filter.connect(gainNode)
  noiseNode.start()
}

function stopSound() {
  if (noiseNode) {
    try { noiseNode.stop() } catch (_) {}
    noiseNode.disconnect()
    noiseNode = null
  }
}

function applyVolume() {
  if (gainNode) {
    gainNode.gain.value = volume.value / 100 * 0.3
  }
}

// TOMO 表情联动
const tomoEmoji = computed(() => {
  switch (pomoState.value) {
    case 'idle': return 'tomato'
    case 'running': return 'face-sick'
    case 'paused': return 'face-think'
    case 'resting': return 'face-happy'
  }
})
const tomoMessage = computed(() => {
  switch (pomoState.value) {
    case 'idle': return '准备好了吗？TOMO 陪你一起专注'
    case 'running': return '专注中... TOMO 在默默陪着你'
    case 'paused': return '休息一下也没关系~'
    case 'resting': return '专注完成！放松一下吧~'
  }
})

// Ring
const ringSize = 280
const ringR = 130
const ringCircumference = 2 * Math.PI * ringR
const ringOffset = computed(() => {
  const progress = 1 - remainingSeconds.value / totalSeconds.value
  return ringCircumference * (1 - progress)
})

const displayTime = computed(() => {
  const total = Math.floor(remainingSeconds.value)  // 取整，不要小数
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const stateLabel = computed(() => {
  switch (pomoState.value) {
    case 'idle': return '准备开始'
    case 'running': return '专注中'
    case 'paused': return '已暂停'
    case 'resting': return '休息中'
  }
})

function loadStats() {
  const today = new Date().toDateString()
  const data = JSON.parse(localStorage.getItem('tomo-pomodoro') || '{}')
  if (data.date === today) {
    todayCount.value = data.todayCount || 0
    totalFocusMinutes.value = data.totalFocusMinutes || 0
  } else {
    todayCount.value = 0
    totalFocusMinutes.value = 0
  }
  bestStreak.value = data.bestStreak || 0
  const lastDate = data.lastActiveDate
  if (lastDate) {
    const last = new Date(lastDate)
    const now = new Date()
    const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
    bestStreak.value = diff === 1 ? (data.currentStreak || 0) + 1 : 0
  }
}

function saveStats() {
  const today = new Date().toDateString()
  localStorage.setItem('tomo-pomodoro', JSON.stringify({
    date: today,
    todayCount: todayCount.value,
    totalFocusMinutes: totalFocusMinutes.value,
    bestStreak: bestStreak.value,
    currentStreak: bestStreak.value,
    lastActiveDate: new Date().toISOString(),
  }))
}

function toggleTimer() {
  if (pomoState.value === 'idle' || pomoState.value === 'paused') {
    pomoState.value = 'running'
    totalSeconds.value = workMinutes.value * 60
    if (remainingSeconds.value <= 0 || remainingSeconds.value > totalSeconds.value) {
      remainingSeconds.value = totalSeconds.value
    }
    emit('setEmotion', 'bored')
    startTick()
  } else if (pomoState.value === 'resting') {
    // 休息结束手动开始下一轮
    pomoState.value = 'idle'
    remainingSeconds.value = workMinutes.value * 60
    totalSeconds.value = workMinutes.value * 60
  }
}

function pauseTimer() {
  pomoState.value = 'paused'
  if (timerId) { cancelAnimationFrame(timerId); timerId = null }
  emit('setEmotion', 'confused')
}

function resetTimer() {
  pomoState.value = 'idle'
  remainingSeconds.value = workMinutes.value * 60
  totalSeconds.value = workMinutes.value * 60
  if (timerId) { cancelAnimationFrame(timerId); timerId = null }
  emit('setEmotion', 'idle')
}

function startRest() {
  pomoState.value = 'resting'
  totalSeconds.value = restMinutes.value * 60
  remainingSeconds.value = totalSeconds.value
  emit('setEmotion', 'flattered')
  startTick()
}

function finishRest() {
  pomoState.value = 'idle'
  remainingSeconds.value = workMinutes.value * 60
  totalSeconds.value = workMinutes.value * 60
  if (timerId) { cancelAnimationFrame(timerId); timerId = null }
  emit('setEmotion', 'cool')
}

let lastTickTime = 0
function startTick() {
  lastTickTime = performance.now()
  const tick = (now: number) => {
    if (pomoState.value !== 'running' && pomoState.value !== 'resting') return
    const delta = (now - lastTickTime) / 1000
    lastTickTime = now
    remainingSeconds.value -= delta

    // 专注过半变累
    if (pomoState.value === 'running') {
      const progress = 1 - remainingSeconds.value / totalSeconds.value
      if (progress > 0.7) {
        emit('setEmotion', 'sick')
      } else if (progress > 0.4) {
        emit('setEmotion', 'bored')
      }
    }

    if (remainingSeconds.value <= 0) {
      remainingSeconds.value = 0
      if (timerId) { cancelAnimationFrame(timerId); timerId = null }

      if (pomoState.value === 'running') {
        todayCount.value++
        totalFocusMinutes.value += workMinutes.value
        saveStats()
        showCompleteCelebration()
        startRest()
      } else if (pomoState.value === 'resting') {
        finishRest()
      }
      return
    }
    timerId = requestAnimationFrame(tick)
  }
  timerId = requestAnimationFrame(tick)
}

function adjustTime(type: 'work' | 'rest', delta: number) {
  if (type === 'work') {
    workMinutes.value = Math.max(5, Math.min(60, workMinutes.value + delta))
    if (pomoState.value === 'idle') {
      remainingSeconds.value = workMinutes.value * 60
      totalSeconds.value = workMinutes.value * 60
    }
  } else {
    restMinutes.value = Math.max(1, Math.min(20, restMinutes.value + delta))
  }
}

onMounted(() => { loadStats() })
onUnmounted(() => {
  if (timerId) cancelAnimationFrame(timerId)
  stopSound()
  if (audioCtx) audioCtx.close()
  saveStats()
})

// 完成庆祝：花瓣飘落 + 番茄印章
const celebrateVisible = ref(false)
function showCompleteCelebration() {
  celebrateVisible.value = true
  setTimeout(() => { celebrateVisible.value = false }, 3200)
}
</script>

<style scoped>
.pomo-fullscreen {
  position: fixed; inset: 0; z-index: 300;
  display: flex; flex-direction: column; align-items: center;
  overflow: hidden;
}

/* 背景层 - 根据状态变色 */
.pomo-bg {
  position: absolute; inset: 0;
  background: #fff8eb;
  transition: background 1.5s ease;
}
.pomo-fullscreen.idle .pomo-bg { background: #fff8eb; }
.pomo-fullscreen.running .pomo-bg { background: #fff0e5; }
.pomo-fullscreen.paused .pomo-bg { background: #f5f1e8; }
.pomo-fullscreen.resting .pomo-bg { background: #edf6e8; }

.pomo-bg-gradient {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 42%, rgba(255,205,128,0.28), transparent 44%), linear-gradient(180deg, rgba(255,255,255,0.5), transparent);
  transition: background 1.5s ease;
}
.pomo-fullscreen.resting .pomo-bg-gradient {
  background: radial-gradient(circle at 50% 42%, rgba(120,210,145,0.22), transparent 44%);
}

/* 手绘早餐装饰：不依赖图片的线稿与小图案 */
.doodle-scene { position:absolute; inset:0; z-index:1; pointer-events:none; overflow:hidden; color:#6faed0; }
.doodle-tomato { position:absolute; width:58px; height:50px; border:3px solid #ee5548; border-radius:48% 52% 50% 50%; background:#f26b56; opacity:.9; animation: doodleFloat 5s ease-in-out infinite; }
.doodle-tomato i { position:absolute; left:50%; top:-11px; width:20px; height:13px; transform:translateX(-50%) rotate(-4deg); border-top:4px solid #3f8f55; border-left:4px solid transparent; border-right:4px solid transparent; }
.doodle-tomato:before,.doodle-tomato:after { content:""; position:absolute; width:6px; height:6px; border-radius:50%; background:#fff1d5; top:20px; }
.doodle-tomato:before { left:17px; }.doodle-tomato:after { right:17px; }
.tomato-a { left:8%; top:24%; transform:rotate(-12deg); }.tomato-b { right:9%; bottom:23%; transform:scale(.72) rotate(14deg); animation-delay:-2s; }
.doodle-plate { position:absolute; left:5%; bottom:13%; width:145px; height:42px; border:3px solid #79b9d0; border-radius:50%; transform:rotate(-8deg); opacity:.7; }
.doodle-plate:after { content:""; position:absolute; inset:8px 14px; border:2px dashed #79b9d0; border-radius:50%; }
.doodle-fork,.doodle-spoon { position:absolute; width:4px; height:86px; border-radius:4px; background:#79b9d0; opacity:.75; transform:rotate(20deg); }
.doodle-fork { right:10%; top:18%; }.doodle-fork:before { content:""; position:absolute; top:-17px; left:-8px; width:18px; height:20px; border-left:3px solid #79b9d0; border-right:3px solid #79b9d0; border-radius:50%; }
.doodle-spoon { left:11%; top:16%; transform:rotate(-18deg); height:76px; }.doodle-spoon:before { content:""; position:absolute; top:-20px; left:-9px; width:20px; height:25px; border:3px solid #79b9d0; border-radius:50%; }
.doodle-star { position:absolute; color:#e85a4f; font-size:28px; animation: starTwinkle 2.8s ease-in-out infinite; }.star-a{left:18%;top:13%}.star-b{right:21%;bottom:16%;font-size:20px;animation-delay:-1.2s}.doodle-spark{position:absolute;color:#79b9d0;font-size:18px;letter-spacing:4px;animation:sparkDrift 3s ease-in-out infinite}.spark-a{left:23%;top:35%}.spark-b{right:23%;top:33%;animation-delay:-1.4s}
@keyframes doodleFloat { 0%,100%{translate:0 0} 50%{translate:0 -9px} }
@keyframes starTwinkle { 0%,100%{opacity:.4;rotate:-8deg;scale:.85} 50%{opacity:1;rotate:8deg;scale:1.1} }
@keyframes sparkDrift { 0%,100%{opacity:.25;translate:0 0} 50%{opacity:.9;translate:5px -5px} }
@media (prefers-reduced-motion:reduce){.doodle-tomato,.doodle-star,.doodle-spark{animation:none}}


/* 顶部栏 */
.pomo-topbar {
  position: relative; z-index: 2;
  width: 100%; display: flex; justify-content: space-between;
  align-items: center; padding: 16px 24px;
}
.pomo-brand {
  font-size: 18px; font-weight: 800; letter-spacing: -0.5px;
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.pomo-exit {
  width: 40px; height: 40px; border-radius: 50%;
  border: 2px solid rgba(83,63,49,0.28);
  background: rgba(255,250,240,0.82);
  color: #533f31; font-size: 22px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 10px rgba(120,90,60,0.12);
}
.pomo-exit:hover {
  background: #ee5548; border-color: #ee5548; color: #fff;
  transform: rotate(90deg) scale(1.05);
}

/* TOMO 表情区 */
.pomo-tomo-area {
  position: relative; z-index: 2; text-align: center;
  margin-top: 10px; margin-bottom: 10px;
}
.pomo-tomo-emoji {
  font-size: 48px;
  animation: tomoBounce 2s ease-in-out infinite;
}
@keyframes tomoBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.pomo-tomo-msg {
  font-size: 13px; color: rgba(82,61,45,0.68);
  margin-top: 6px;
}

/* 中央计时器 */
.pomo-center {
  position: relative; z-index: 2; flex: 1;
  display: flex; align-items: center; justify-content: center;
}
.pomo-ring-wrapper {
  position: relative; width: 280px; height: 280px;
}
.pomo-ring {
  width: 100%; height: 100%;
  transform: rotate(-90deg);
}
.pomo-ring-bg {
  fill: none; stroke: rgba(117,91,67,0.14); stroke-width: 8;
}
.pomo-ring-progress {
  fill: none; stroke: #ff4757; stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease, stroke 1s ease;
}
.pomo-fullscreen.resting .pomo-ring-progress { stroke: #2ed573; }
.pomo-fullscreen.paused .pomo-ring-progress { stroke: #ffa502; }

.pomo-display {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.pomo-time {
  font-size: 56px; font-weight: 500;
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px; color: #553f31;
  text-shadow: 1px 2px 0 rgba(255,255,255,.7);
}
.pomo-state-label {
  font-size: 13px; color: rgba(82,61,45,0.5);
  margin-top: 4px; letter-spacing: 2px;
}

/* 控制按钮 */
.pomo-controls {
  position: relative; z-index: 2;
  display: flex; gap: 12px; margin-bottom: 20px;
}
.pomo-btn {
  padding: 14px 36px; border: none; border-radius: 100px;
  font-size: 15px; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.pomo-btn.primary {
  background: linear-gradient(135deg, #ff4757, #ff6b81); color: #fff;
  box-shadow: 0 6px 20px rgba(255,71,87,0.3);
}
.pomo-btn.primary:hover { transform: scale(1.03); }
.pomo-btn.warn {
  background: rgba(255,165,2,0.15); color: #ffa502;
  border: 1px solid rgba(255,165,2,0.3);
}
.pomo-btn.ghost {
  background: rgba(255,255,255,0.55); color: rgba(82,61,45,0.65);
  border: 1px solid rgba(120,90,60,0.14);
}
.pomo-btn:hover { transform: scale(1.03); }

/* 时长设置 */
.pomo-settings {
  position: relative; z-index: 2;
  display: flex; gap: 40px; margin-bottom: 20px;
}
.pomo-setting-row {
  display: flex; align-items: center; gap: 12px;
  font-size: 13px; color: rgba(82,61,45,0.62);
}
.pomo-duration-picker { display: flex; align-items: center; gap: 12px; }
.pomo-duration-picker button {
  width: 32px; height: 32px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05); color: #fff;
  cursor: pointer; font-size: 18px;
}
.pomo-duration-picker button:hover { background: rgba(255,71,87,0.2); }
.pomo-duration-picker span { min-width: 60px; text-align: center; color: #553f31; font-weight: 600; }

/* 白噪音面板 */
.pomo-sound-panel {
  position: relative; z-index: 2;
  background: rgba(255,255,255,0.45);
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 12px;
  border: 1px solid rgba(120,90,60,0.12);
  box-shadow: 0 5px 18px rgba(120,90,60,0.08);
}
.sound-tabs {
  display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;
}
.sound-tab {
  display: flex; flex-direction: column; align-items: center;
  padding: 8px 12px; border-radius: 12px;
  background: transparent; cursor: pointer;
  transition: all 0.2s; min-width: 56px;
}
.sound-tab:hover { background: rgba(255,255,255,0.06); }
.sound-tab.active {
  background: rgba(255,110,90,0.16);
  border: 1px solid rgba(238,85,72,0.35);
}
.sound-icon { font-size: 22px; }
.sound-name { font-size: 10px; color: rgba(82,61,45,0.6); margin-top: 2px; }
.sound-tab.active .sound-name { color: #ff8b8b; }

.volume-row {
  display: flex; align-items: center; gap: 8px;
  margin-top: 8px; padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.vol-label { font-size: 14px; }
.vol-slider {
  flex: 1; height: 4px; appearance: none;
  background: rgba(255,255,255,0.1); border-radius: 2px; outline: none;
}
.vol-slider::-webkit-slider-thumb {
  appearance: none;
  width: 14px; height: 14px; border-radius: 50%;
  background: #ff6b6b; cursor: pointer;
}
.vol-value { font-size: 11px; color: rgba(255,255,255,0.4); min-width: 24px; text-align: right; }

/* 今日战绩 */
.pomo-stats-bar {
  position: relative; z-index: 2;
  display: flex; align-items: center; gap: 20px;
  padding: 14px 24px; margin-bottom: 20px;
  background: rgba(255,255,255,0.03);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.05);
}
.pomo-stat-item { text-align: center; }
.pomo-stat-num {
  font-size: 24px; font-weight: 800; color: #ff6b6b;
}
.pomo-stat-label {
  font-size: 10px; color: rgba(82,61,45,0.5); margin-top: 2px;
}
.pomo-stat-divider {
  width: 1px; height: 24px; background: rgba(255,255,255,0.08);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .pomo-ring-wrapper { width: 220px; height: 220px; }
  .pomo-time { font-size: 44px; }
  .pomo-settings { flex-direction: column; gap: 12px; }
  .pomo-controls { gap: 8px; }
  .pomo-btn { padding: 12px 24px; font-size: 14px; }
  .pomo-tomo-emoji { font-size: 36px; }
  .pomo-stats-bar { gap: 12px; padding: 10px 16px; }
  .pomo-stat-num { font-size: 18px; }
}
</style>
