<template>
  <div class="feature-panel garden-panel">
    <div class="panel-header">
      <span class="panel-title">🌱 TOMO 番茄园</span>
      <button class="panel-close" @click="$emit('close')">✕</button>
    </div>
    <div class="panel-body">

      <!-- 主视觉：当前阶段插画 -->
      <div class="garden-stage">
        <img :src="currentStageArt" class="garden-art" />
        <div class="garden-glow"></div>
      </div>

      <!-- 阶段名称 + 进度 -->
      <div class="garden-status">
        <div class="garden-stage-name">{{ currentStage.name }}</div>
        <div class="garden-stage-desc">{{ currentStage.desc }}</div>
        <div class="garden-progress-bar" v-if="currentStageIdx < stages.length - 1">
          <div class="garden-progress-fill" :style="{ width: progressToNext + '%' }"></div>
        </div>
        <div class="garden-progress-label" v-if="currentStageIdx < stages.length - 1">
          距离「{{ stages[currentStageIdx + 1].name }}」还需 {{ waterNeeded }} 次浇水
        </div>
        <div class="garden-progress-label" v-else>
          🎉 你的番茄已经完美成熟啦！
        </div>
      </div>

      <!-- 数据栏 -->
      <div class="garden-stats">
        <div class="garden-stat">
          <div class="garden-stat-num">{{ totalWater }}</div>
          <div class="garden-stat-label">累计浇水</div>
        </div>
        <div class="garden-stat">
          <div class="garden-stat-num">{{ dayStreak }}</div>
          <div class="garden-stat-label">连续照料</div>
        </div>
        <div class="garden-stat">
          <div class="garden-stat-num">{{ pomodoroCount }}</div>
          <div class="garden-stat-label">番茄钟</div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="garden-actions">
        <button class="garden-water-btn" @click="water" :disabled="!canWater">
          <span class="water-icon">💧</span>
          <span v-if="canWater">浇水（今日 {{ waterQuota - dailyWaterCount }} 次剩余）</span>
          <span v-else>今日已浇满 · 明天再来 🌙</span>
        </button>
        <div class="garden-tip" v-if="pomodoroCount > 0">
          ✦ 今日完成 {{ pomodoroCount }} 次专注，浇水配额 +{{ pomodoroCount * 2 }}
        </div>
        <div class="garden-tip" v-else>
          💡 每完成一次番茄钟专注，可额外浇 2 次水
        </div>
      </div>

      <!-- 成就列表 -->
      <div class="garden-milestones">
        <div class="milestones-title">🏆 阶段成就</div>
        <div class="milestones-list">
          <div
            v-for="(s, i) in stages"
            :key="s.id"
            class="milestone-item"
            :class="{ unlocked: i <= currentStageIdx, current: i === currentStageIdx }"
          >
            <span class="milestone-emoji">{{ s.emoji }}</span>
            <span class="milestone-name">{{ s.name }}</span>
            <span class="milestone-check" v-if="i <= currentStageIdx">✓</span>
          </div>
        </div>
      </div>

      <!-- 重置按钮 -->
      <button class="garden-reset" @click="showResetConfirm = true" v-if="currentStageIdx >= stages.length - 1">
        🌱 重新种一颗
      </button>

      <!-- 重置确认 -->
      <div class="reset-confirm-overlay" v-if="showResetConfirm" @click.self="showResetConfirm = false">
        <div class="reset-confirm-box">
          <p>要开始新的种植吗？<br/>当前成长会被记入历史。</p>
          <div class="reset-actions">
            <button class="reset-yes" @click="resetGarden">好的</button>
            <button class="reset-no" @click="showResetConfirm = false">再等等</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const emit = defineEmits<{ close: []; setEmotion: [id: string] }>()

const stages = [
  { id: 'seed', name: '种子期', emoji: '🌰', desc: '种子静静躺在土里，等待发芽。', waterToNext: 3, art: 'art/grow_seed.jpg', emotion: 'idle' },
  { id: 'sprout', name: '发芽期', emoji: '🌱', desc: '嫩绿的芽刚探出头，充满生命力。', waterToNext: 5, art: 'art/grow_sprout.jpg', emotion: 'shy' },
  { id: 'young', name: '开花期', emoji: '🌼', desc: '枝头开出小黄花，孕育着果实。', waterToNext: 7, art: 'art/grow_young.jpg', emotion: 'flattered' },
  { id: 'ripe', name: '成熟期', emoji: '🍅', desc: '红彤彤的番茄挂满枝头，可以采摘啦！', waterToNext: 0, art: 'art/grow_ripe.jpg', emotion: 'cool' },
]

const totalWater = ref(0)
const dailyWaterCount = ref(0)
const lastWaterDate = ref('')
const currentStageIdx = ref(0)
const dayStreak = ref(0)
const pomodoroCount = ref(0)
const showResetConfirm = ref(false)

const currentStage = computed(() => stages[currentStageIdx.value])
const currentStageArt = computed(() => currentStage.value.art)
const canWater = computed(() => dailyWaterCount.value < waterQuota.value && currentStageIdx.value < stages.length - 1)

// 浇水配额：基础 3 次 + 每完成一次番茄钟专注额外 2 次
const waterQuota = computed(() => 3 + Math.max(0, pomodoroCount.value) * 2)

// 累计浇水量距离下一阶段的进度
const waterInCurrentStage = computed(() => {
  const total = totalWater.value
  let consumed = 0
  for (let i = 0; i < currentStageIdx.value; i++) {
    consumed += stages[i].waterToNext
  }
  return total - consumed
})
const waterNeeded = computed(() => {
  return Math.max(0, currentStage.value.waterToNext - waterInCurrentStage.value)
})
const progressToNext = computed(() => {
  if (currentStage.value.waterToNext === 0) return 100
  return Math.min(100, (waterInCurrentStage.value / currentStage.value.waterToNext) * 100)
})

function today() { return new Date().toDateString() }

function load() {
  const data = JSON.parse(localStorage.getItem('tomo-garden') || '{}')
  totalWater.value = data.totalWater || 0
  currentStageIdx.value = data.currentStageIdx || 0
  dayStreak.value = data.dayStreak || 0
  pomodoroCount.value = data.pomodoroCount || 0
  lastWaterDate.value = data.lastWaterDate || ''

  // 判断今天是否已浇过水
  if (lastWaterDate.value === today()) {
    dailyWaterCount.value = data.dailyWaterCount || 0
  } else {
    dailyWaterCount.value = 0
    // 连续天数判断
    if (lastWaterDate.value) {
      const last = new Date(lastWaterDate.value)
      const now = new Date()
      const diff = Math.floor((now.getTime() - last.getTime()) / 86400000)
      if (diff === 1) {
        // 昨天有浇 → 连续天数保持
      } else if (diff > 1) {
        dayStreak.value = 0
      }
    }
  }

  // 同步番茄钟数据（如果今天已用过番茄钟，加分水）
  const pomoData = JSON.parse(localStorage.getItem('tomo-pomodoro') || '{}')
  if (pomoData.date === today()) {
    pomodoroCount.value = pomoData.todayCount || 0
  }
}

function save() {
  localStorage.setItem('tomo-garden', JSON.stringify({
    totalWater: totalWater.value,
    currentStageIdx: currentStageIdx.value,
    dayStreak: dayStreak.value,
    pomodoroCount: pomodoroCount.value,
    lastWaterDate: lastWaterDate.value,
    dailyWaterCount: dailyWaterCount.value,
  }))
}

function water() {
  if (!canWater.value) return

  totalWater.value++
  dailyWaterCount.value++

  // 更新日期
  if (lastWaterDate.value !== today()) {
    dayStreak.value++
  }
  lastWaterDate.value = today()

  // 检查是否升级
  if (waterInCurrentStage.value >= currentStage.value.waterToNext && currentStageIdx.value < stages.length - 1) {
    currentStageIdx.value++
    emit('setEmotion', stages[currentStageIdx.value].emotion)
    triggerGrowAnimation()
  } else {
    emit('setEmotion', 'flattered')
  }

  save()
}

function resetGarden() {
  currentStageIdx.value = 0
  totalWater.value = 0
  dailyWaterCount.value = 0
  showResetConfirm.value = false
  save()
  emit('setEmotion', 'idle')
}

function triggerGrowAnimation() {
  // TODO: 后续可加动画
}

onMounted(() => { load() })
watch(currentStageIdx, () => { emit('setEmotion', currentStage.value.emotion) })
</script>

<style scoped>
.garden-panel .panel-body { padding-bottom: 24px; }

.garden-stage {
  position: relative;
  display: flex; justify-content: center;
  margin-bottom: 14px;
}
.garden-art {
  width: 200px; height: 200px;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(60,30,10,0.3);
  object-fit: cover;
  z-index: 2;
}
.garden-glow {
  position: absolute;
  width: 240px; height: 240px;
  top: -20px; left: 50%; transform: translateX(-50%);
  background: radial-gradient(circle, rgba(255,220,150,0.3), transparent 70%);
  pointer-events: none;
}

.garden-status { text-align: center; margin-bottom: 16px; }
.garden-stage-name {
  font-size: 18px; font-weight: 800; color: #fff;
  margin-bottom: 4px;
}
.garden-stage-desc {
  font-size: 12px; color: rgba(255,255,255,0.55); line-height: 1.7;
  margin-bottom: 10px;
}
.garden-progress-bar {
  height: 6px; background: rgba(255,255,255,0.08);
  border-radius: 3px; overflow: hidden;
  margin: 0 12px 4px;
}
.garden-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2ed573, #ffd700);
  border-radius: 3px;
  transition: width 0.6s ease;
}
.garden-progress-label {
  font-size: 11px; color: rgba(255,255,255,0.4);
}

.garden-stats {
  display: flex; justify-content: space-around;
  padding: 12px 0; margin-bottom: 14px;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
}
.garden-stat { text-align: center; }
.garden-stat-num {
  font-size: 20px; font-weight: 800; color: #2ed573;
}
.garden-stat-label { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 2px; }

.garden-actions { margin-bottom: 16px; }
.garden-water-btn {
  width: 100%; padding: 14px;
  background: linear-gradient(135deg, #4a90e2, #74b9ff);
  border: none; border-radius: 14px; color: #fff;
  font-size: 14px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 6px 20px rgba(74,144,226,0.3);
  transition: all 0.2s;
}
.garden-water-btn:hover:not(:disabled) { transform: scale(1.02); }
.garden-water-btn:disabled {
  background: rgba(255,255,255,0.06);
  cursor: not-allowed;
  box-shadow: none; color: rgba(255,255,255,0.4);
}
.water-icon { font-size: 20px; }
.garden-tip {
  font-size: 11px; color: rgba(255,255,255,0.4);
  text-align: center; margin-top: 8px;
}

.garden-milestones { margin-bottom: 12px; }
.milestones-title { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 8px; }
.milestones-list { display: flex; gap: 6px; justify-content: space-between; }
.milestone-item {
  flex: 1; padding: 8px 4px;
  background: rgba(255,255,255,0.04);
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.06);
  text-align: center;
  transition: all 0.2s;
  opacity: 0.4;
}
.milestone-item.unlocked { opacity: 1; background: rgba(46,213,115,0.1); border-color: rgba(46,213,115,0.3); }
.milestone-item.current {
  background: rgba(255,71,87,0.15);
  border-color: rgba(255,71,87,0.4);
  transform: scale(1.05);
}
.milestone-emoji { font-size: 20px; display: block; }
.milestone-name { font-size: 10px; color: rgba(255,255,255,0.7); margin-top: 2px; display: block; }
.milestone-check { font-size: 10px; color: #2ed573; margin-top: 2px; display: block; }

.garden-reset {
  width: 100%; padding: 10px;
  background: rgba(255,71,87,0.15);
  border: 1px solid rgba(255,71,87,0.3);
  border-radius: 12px; color: #ff8b8b;
  font-size: 13px; cursor: pointer;
}

.reset-confirm-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
  z-index: 300;
  display: flex; align-items: center; justify-content: center;
}
.reset-confirm-box {
  background: rgba(30,20,15,0.95); border-radius: 16px;
  padding: 20px; width: 280px; text-align: center;
  border: 1px solid rgba(255,255,255,0.1);
}
.reset-confirm-box p { font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.7; margin-bottom: 16px; }
.reset-actions { display: flex; gap: 8px; }
.reset-yes, .reset-no {
  flex: 1; padding: 10px; border: none; border-radius: 10px;
  font-size: 13px; font-weight: 600; cursor: pointer;
}
.reset-yes { background: linear-gradient(135deg, #ff4757, #ff6b6b); color: #fff; }
.reset-no { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); }
</style>
