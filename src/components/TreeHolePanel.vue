<template>
  <div class="feature-panel treehole-panel">
    <div class="panel-header">
      <span class="panel-title">🌳 TOMO 情绪树洞</span>
      <button class="panel-close" @click="$emit('close')">✕</button>
    </div>
    <div class="panel-body">
      <!-- 倾诉输入 -->
      <div class="treehole-input-section" v-if="!buried">
        <div class="treehole-tomo-listening">
          <div class="listening-tomato" :class="{ listening: isListening }">
            🍅
          </div>
          <div class="listening-text" v-if="!isListening && !userInput">
            TOMO 在这里听你说
          </div>
          <div class="listening-text" v-if="isListening">
            TOMO 正在倾听...
          </div>
          <div class="listening-text" v-if="!isListening && userInput">
            TOMO 的反应：{{ reactionEmoji }}
          </div>
        </div>

        <textarea
          v-model="userInput"
          class="treehole-textarea"
          placeholder="今天发生了什么？开心的事、烦心的事，都说给 TOMO 听吧..."
          maxlength="300"
          @focus="startListening"
          @blur="stopListening"
          @input="analyzeText"
        ></textarea>

        <div class="treehole-char-count">{{ userInput.length }} / 300</div>

        <div class="treehole-mood-tags">
          <div class="mood-tag-label">今天的心情：</div>
          <div class="mood-tags">
            <div
              v-for="mood in moods"
              :key="mood.id"
              class="mood-tag"
              :class="{ active: selectedMood === mood.id }"
              @click="selectMood(mood.id)"
            >
              {{ mood.emoji }} {{ mood.label }}
            </div>
          </div>
        </div>

        <button class="treehole-bury-btn" @click="buryMessage" :disabled="!userInput.trim()">
          🌱 埋进土里，让烦恼开出花
        </button>
      </div>

      <!-- 埋土动画 -->
      <div class="treehole-burying" v-if="buried">
        <div class="bury-animation">
          <div class="bury-tomato">🍅</div>
          <div class="bury-soil"></div>
          <div class="bury-flower" v-if="flowerBloomed">🌸</div>
        </div>
        <div class="bury-text">
          {{ buryStage === 0 ? 'TOMO 正在帮你埋...' : '看，开出一朵小花！' }}
        </div>
        <button class="treehole-continue-btn" @click="resetTreeHole" v-if="flowerBloomed">
          再写一条
        </button>
      </div>

      <!-- 情绪日历 -->
      <div class="treehole-calendar-section" v-if="!buried && calendarEntries.length > 0">
        <div class="section-label">情绪日历</div>
        <div class="treehole-calendar">
          <div
            v-for="entry in calendarEntries"
            :key="entry.date"
            class="calendar-day"
            :class="{ today: entry.isToday }"
          >
            <div class="cal-emoji">{{ entry.emoji }}</div>
            <div class="cal-date">{{ entry.dateLabel }}</div>
          </div>
        </div>
        <div class="treehole-stats">
          <span>共记录 {{ calendarEntries.length }} 天</span>
          <span v-if="topMood">最常：{{ topMood }}</span>
        </div>
      </div>

      <!-- TOMO 回应 -->
      <div class="treehole-reply" v-if="tomoReply">
        <span class="reply-emoji">{{ reactionEmoji }}</span>
        <span class="reply-text">{{ tomoReply }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits<{
  close: []
  setEmotion: [id: string]
}>()

const userInput = ref('')
const isListening = ref(false)
const selectedMood = ref('')
const buried = ref(false)
const buryStage = ref(0)
const flowerBloomed = ref(false)
const tomoReply = ref('')
const reactionEmoji = ref('🍅')
const calendarEntries = ref<{date: string, dateLabel: string, emoji: string, mood: string, isToday: boolean}[]>([])

const moods = [
  { id: 'happy', emoji: '😊', label: '开心', tomoEmotion: 'flattered', reply: '听到你开心，TOMO 也跟着红了起来！' },
  { id: 'sad', emoji: '😢', label: '难过', tomoEmotion: 'sad', reply: 'TOMO 陪你难过，哭出来会好一些。' },
  { id: 'angry', emoji: '😠', label: '生气', tomoEmotion: 'angry', reply: '太气了！TOMO 也替你气！' },
  { id: 'tired', emoji: '🤒', label: '累了', tomoEmotion: 'sick', reply: '累了就歇歇，TOMO 帮你顶着。' },
  { id: 'confused', emoji: '🤔', label: '迷茫', tomoEmotion: 'confused', reply: 'TOMO 也不知道答案，但会陪你找。' },
  { id: 'calm', emoji: '🍅', label: '平静', tomoEmotion: 'idle', reply: '平静的一天也是好日子。' },
]

// 关键词 -> 情绪
const keywordMap: { keywords: string[], mood: string }[] = [
  { keywords: ['开心', '高兴', '快乐', '好消息', '成功了', '棒', '赞'], mood: 'happy' },
  { keywords: ['难过', '伤心', '哭', '委屈', '失落', '想哭'], mood: 'sad' },
  { keywords: ['生气', '气死', '烦死', '愤怒', '无语', '操'], mood: 'angry' },
  { keywords: ['累', '困', '疲惫', '撑不住', '崩溃', '心力交瘁'], mood: 'tired' },
  { keywords: ['迷茫', '不知道', '怎么办', '纠结', '选择'], mood: 'confused' },
]

function startListening() {
  isListening.value = true
  emit('setEmotion', 'bored')
}

function stopListening() {
  isListening.value = false
}

function analyzeText() {
  const text = userInput.value.toLowerCase()
  for (const km of keywordMap) {
    if (km.keywords.some(k => text.includes(k))) {
      const mood = moods.find(m => m.id === km.mood)
      if (mood) {
        reactionEmoji.value = mood.emoji
        tomoReply.value = mood.reply
        emit('setEmotion', mood.tomoEmotion)
        selectedMood.value = mood.id
        return
      }
    }
  }
  // 默认
  reactionEmoji.value = '🍅'
  tomoReply.value = ''
}

function selectMood(id: string) {
  selectedMood.value = id
  const mood = moods.find(m => m.id === id)
  if (mood) {
    reactionEmoji.value = mood.emoji
    tomoReply.value = mood.reply
    emit('setEmotion', mood.tomoEmotion)
  }
}

function buryMessage() {
  if (!userInput.value.trim()) return
  buried.value = true
  buryStage.value = 0
  emit('setEmotion', 'crying')

  // 保存到日历
  const today = new Date()
  const dateStr = today.toDateString()
  const mood = selectedMood.value || 'calm'
  const moodData = moods.find(m => m.id === mood) || moods[5]

  const data = JSON.parse(localStorage.getItem('tomo-treehole') || '{}')
  const entries = data.entries || []
  // 替换今天的记录
  const existingIdx = entries.findIndex((e: any) => e.date === dateStr)
  const entry = { date: dateStr, mood, emoji: moodData.emoji }
  if (existingIdx >= 0) {
    entries[existingIdx] = entry
  } else {
    entries.push(entry)
  }
  // 只保留最近 30 天
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const filtered = entries.filter((e: any) => new Date(e.date) > cutoff)
  localStorage.setItem('tomo-treehole', JSON.stringify({ entries: filtered }))

  setTimeout(() => {
    buryStage.value = 1
    emit('setEmotion', 'flattered')
  }, 1500)

  setTimeout(() => {
    flowerBloomed.value = true
    emit('setEmotion', 'cool')
  }, 2500)

  loadCalendar()
}

function resetTreeHole() {
  userInput.value = ''
  selectedMood.value = ''
  buried.value = false
  buryStage.value = 0
  flowerBloomed.value = false
  tomoReply.value = ''
  reactionEmoji.value = '🍅'
  emit('setEmotion', 'idle')
}

function loadCalendar() {
  const data = JSON.parse(localStorage.getItem('tomo-treehole') || '{}')
  const entries = data.entries || []
  const today = new Date()
  const todayStr = today.toDateString()

  // 取最近 14 天
  const days: {date: string, dateLabel: string, emoji: string, mood: string, isToday: boolean}[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = d.toDateString()
    const entry = entries.find((e: any) => e.date === ds)
    days.push({
      date: ds,
      dateLabel: `${d.getMonth() + 1}/${d.getDate()}`,
      emoji: entry ? entry.emoji : '·',
      mood: entry ? entry.mood : '',
      isToday: ds === todayStr,
    })
  }
  calendarEntries.value = days
}

const topMood = computed(() => {
  const moodCount: Record<string, number> = {}
  const data = JSON.parse(localStorage.getItem('tomo-treehole') || '{}')
  const entries = data.entries || []
  entries.forEach((e: any) => {
    moodCount[e.mood] = (moodCount[e.mood] || 0) + 1
  })
  const top = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]
  if (!top) return null
  const mood = moods.find(m => m.id === top[0])
  return mood ? `${mood.emoji} ${mood.label}` : null
})

onMounted(() => { loadCalendar() })
</script>

<style scoped>
.treehole-input-section { }
.treehole-tomo-listening { text-align: center; margin-bottom: 16px; }
.listening-tomato {
  font-size: 36px; display: inline-block;
  transition: transform 0.3s;
}
.listening-tomato.listening {
  animation: listenPulse 1.5s ease-in-out infinite;
}
@keyframes listenPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
.listening-text { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 4px; }

.treehole-textarea {
  width: 100%; min-height: 100px; padding: 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px; color: #fff;
  font-size: 14px; line-height: 1.6;
  resize: none; outline: none;
  font-family: inherit;
}
.treehole-textarea:focus { border-color: rgba(255,71,87,0.3); }
.treehole-textarea::placeholder { color: rgba(255,255,255,0.25); }

.treehole-char-count {
  text-align: right; font-size: 11px;
  color: rgba(255,255,255,0.3); margin-top: 4px;
}

.treehole-mood-tags { margin: 12px 0; }
.mood-tag-label { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 6px; }
.mood-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.mood-tag {
  padding: 6px 12px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 100px; font-size: 12px;
  cursor: pointer; transition: all 0.2s;
}
.mood-tag:hover { background: rgba(255,255,255,0.1); }
.mood-tag.active {
  background: rgba(255,71,87,0.2);
  border-color: rgba(255,71,87,0.5);
}

.treehole-bury-btn {
  width: 100%; padding: 12px;
  background: linear-gradient(135deg, #2ed573, #1ea85b);
  border: none; border-radius: 12px; color: #fff;
  font-size: 14px; font-weight: 600; cursor: pointer;
  margin-top: 8px; transition: all 0.2s;
}
.treehole-bury-btn:hover:not(:disabled) { transform: scale(1.02); }
.treehole-bury-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.treehole-burying { text-align: center; padding: 30px 0; }
.bury-animation {
  position: relative; height: 100px;
  display: flex; align-items: center; justify-content: center;
}
.bury-tomato {
  font-size: 40px;
  animation: buryDown 1.5s ease-in forwards;
}
@keyframes buryDown {
  0% { transform: translateY(0); opacity: 1; }
  80% { transform: translateY(30px); opacity: 0.3; }
  100% { transform: translateY(40px); opacity: 0; }
}
.bury-soil {
  position: absolute; bottom: 20px;
  width: 80px; height: 8px;
  background: #3a2010; border-radius: 50%;
}
.bury-flower {
  position: absolute; bottom: 25px;
  font-size: 32px;
  animation: bloom 0.6s ease-out forwards;
}
@keyframes bloom {
  from { transform: scale(0); }
  to { transform: scale(1); }
}
.bury-text { font-size: 14px; color: rgba(255,255,255,0.7); margin-top: 16px; }
.treehole-continue-btn {
  margin-top: 16px; padding: 10px 28px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 100px; color: #fff;
  font-size: 13px; cursor: pointer;
}

.treehole-calendar-section { margin-top: 20px; }
.section-label { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 8px; }
.treehole-calendar {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;
}
.calendar-day {
  aspect-ratio: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: rgba(255,255,255,0.04);
  border-radius: 8px; font-size: 14px;
}
.calendar-day.today {
  background: rgba(255,71,87,0.15);
  border: 1px solid rgba(255,71,87,0.3);
}
.cal-emoji { font-size: 14px; }
.cal-date { font-size: 8px; color: rgba(255,255,255,0.3); }

.treehole-stats {
  display: flex; justify-content: space-between;
  font-size: 11px; color: rgba(255,255,255,0.4);
  margin-top: 8px;
}

.treehole-reply {
  display: flex; align-items: center; gap: 6px;
  margin-top: 12px; padding: 10px 14px;
  background: rgba(255,71,87,0.08);
  border-radius: 12px; font-size: 12px;
  color: rgba(255,255,255,0.7);
}
.reply-emoji { font-size: 16px; }
</style>
