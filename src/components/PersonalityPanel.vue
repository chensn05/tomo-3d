<template>
  <div class="feature-panel personality-panel">
    <div class="panel-header">
      <span class="panel-title">🧪 TOMO 性格测试</span>
      <button class="panel-close" @click="$emit('close')">✕</button>
    </div>
    <div class="panel-body">
      <!-- 介绍页 -->
      <div class="ptest-intro" v-if="ptestState === 'intro'">
        <div class="ptest-intro-icon">🧪</div>
        <p class="ptest-intro-title">你是哪种 TOMO？</p>
        <p class="ptest-intro-desc">
          做完 8 道题，发现你的 TOMO 人格类型。
          每种人格有专属描述和 3D 定格造型。
        </p>
        <button class="ptest-start-btn" @click="startTest">开始测试</button>
        <div class="ptest-types-preview" v-if="hasPrevResult">
          <div class="prev-result-label">上次测试结果</div>
          <div class="prev-result-card">
            <div class="prev-result-emoji">{{ prevResult?.emoji }}</div>
            <div class="prev-result-name">{{ prevResult?.name }}</div>
            <div class="prev-result-desc">{{ prevResult?.shortDesc }}</div>
          </div>
          <button class="ptest-retake-btn" @click="startTest">重新测试</button>
        </div>
      </div>

      <!-- 答题中 -->
      <div class="ptest-quiz" v-if="ptestState === 'playing'">
        <div class="ptest-progress-bar">
          <div class="ptest-progress-fill" :style="{ width: `${((qIndex + 1) / questions.length) * 100}%` }"></div>
        </div>
        <div class="ptest-q-counter">{{ qIndex + 1 }} / {{ questions.length }}</div>

        <div class="ptest-question">{{ questions[qIndex].question }}</div>
        <div class="ptest-scenario">{{ questions[qIndex].scenario }}</div>

        <div class="ptest-options">
          <div
            v-for="opt in questions[qIndex].options"
            :key="opt.label"
            class="ptest-option"
            @click="answer(opt)"
          >
            <span class="ptest-opt-emoji">{{ opt.emoji }}</span>
            <span class="ptest-opt-text">{{ opt.label }}</span>
          </div>
        </div>
      </div>

      <!-- 结果页 -->
      <div class="ptest-result" v-if="ptestState === 'finished' && result">
        <div class="result-card">
          <div class="result-emoji">{{ result.emoji }}</div>
          <div class="result-type-label">你的 TOMO 人格</div>
          <div class="result-name">{{ result.name }}</div>
          <div class="result-tags">
            <span class="result-tag" v-for="tag in result.tags" :key="tag">{{ tag }}</span>
          </div>
          <div class="result-desc">{{ result.desc }}</div>
          <div class="result-traits">
            <div class="trait-row" v-for="trait in result.traits" :key="trait.name">
              <span class="trait-name">{{ trait.name }}</span>
              <div class="trait-bar">
                <div class="trait-fill" :style="{ width: trait.value + '%' }"></div>
              </div>
              <span class="trait-value">{{ trait.value }}%</span>
            </div>
          </div>
          <div class="result-tomo-msg">
            <span>{{ result.tomoMsg }}</span>
          </div>
        </div>
        <div class="result-actions">
          <button class="result-share-btn" @click="shareResult">截图分享</button>
          <button class="result-retake-btn" @click="startTest">再测一次</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits<{
  close: []
  setEmotion: [id: string]
  screenshot: []
}>()

type PTestState = 'intro' | 'playing' | 'finished'

interface Option {
  emoji: string
  label: string
  scores: Record<string, number>
}

interface Question {
  question: string
  scenario: string
  options: Option[]
}

interface PersonalityType {
  id: string
  emoji: string
  name: string
  shortDesc: string
  tags: string[]
  desc: string
  traits: { name: string; value: number }[]
  tomoMsg: string
  emotion: string
}

const questions: Question[] = [
  {
    question: '砧板来了，你的第一反应？',
    scenario: '一把闪亮的菜刀就在旁边',
    options: [
      { emoji: '🏃', label: '赶紧跑，能跑多远跑多远', scores: { escape: 3, brave: 0, social: 0, chill: 0 } },
      { emoji: '🥶', label: '装死，假装自己不是番茄', scores: { escape: 1, brave: 0, social: 0, chill: 2 } },
      { emoji: '⚔️', label: '反抗！凭什么要被切', scores: { escape: 0, brave: 3, social: 1, chill: 0 } },
      { emoji: '😭', label: '先哭为敬', scores: { escape: 0, brave: 0, social: 1, chill: 1 } },
    ],
  },
  {
    question: '被厨师夸"好红好饱满"，你会？',
    scenario: '厨师拿着你端详',
    options: [
      { emoji: '😳', label: '害羞，脸更红了', scores: { escape: 0, brave: 0, social: 1, chill: 2 } },
      { emoji: '😎', label: '得意，我确实又红又饱满', scores: { escape: 0, brave: 2, social: 2, chill: 1 } },
      { emoji: '😐', label: '无所谓，夸不夸都要被吃', scores: { escape: 0, brave: 0, social: 0, chill: 3 } },
      { emoji: '🤔', label: '他为什么要夸我？有阴谋', scores: { escape: 1, brave: 1, social: 0, chill: 0 } },
    ],
  },
  {
    question: '旁边有颗坏掉的番茄，你会？',
    scenario: '它已经开始发霉了',
    options: [
      { emoji: '🤝', label: '关心它，问它还好吗', scores: { escape: 0, brave: 1, social: 3, chill: 1 } },
      { emoji: '🏃', label: '离远点，别传染给我', scores: { escape: 3, brave: 0, social: 0, chill: 1 } },
      { emoji: '😤', label: '庆幸自己还好好的', scores: { escape: 0, brave: 0, social: 0, chill: 3 } },
      { emoji: '😭', label: '替它难过，它也曾很红', scores: { escape: 0, brave: 0, social: 2, chill: 1 } },
    ],
  },
  {
    question: '深夜躺在厨房台面上，你通常在？',
    scenario: '四下无人，灯光昏暗',
    options: [
      { emoji: '💤', label: '已经睡着了', scores: { escape: 0, brave: 0, social: 0, chill: 3 } },
      { emoji: '🎭', label: '想白天发生的事', scores: { escape: 0, brave: 0, social: 2, chill: 1 } },
      { emoji: '🗺️', label: '规划逃跑路线', scores: { escape: 3, brave: 2, social: 0, chill: 0 } },
      { emoji: '😨', label: '害怕明天会不会被切', scores: { escape: 1, brave: 0, social: 0, chill: 0 } },
    ],
  },
  {
    question: '看到沙拉碗里的其他蔬菜，你？',
    scenario: '黄瓜、生菜、玉米都在碗里',
    options: [
      { emoji: '👋', label: '主动打招呼，交个朋友', scores: { escape: 0, brave: 1, social: 3, chill: 1 } },
      { emoji: '👀', label: '默默观察，不主动搭话', scores: { escape: 1, brave: 0, social: 0, chill: 2 } },
      { emoji: '👑', label: '我才是主角，都让开', scores: { escape: 0, brave: 3, social: 1, chill: 1 } },
      { emoji: '🚪', label: '趁机溜走，碗太危险', scores: { escape: 3, brave: 1, social: 0, chill: 0 } },
    ],
  },
  {
    question: '终于逃出了厨房！你最先去哪？',
    scenario: '面前是广阔的餐厅',
    options: [
      { emoji: '🌿', label: '花园，找片土壤躺平', scores: { escape: 1, brave: 0, social: 0, chill: 3 } },
      { emoji: '👥', label: '去找其他番茄伙伴', scores: { escape: 0, brave: 1, social: 3, chill: 1 } },
      { emoji: '🏔️', label: '冒险！去未知的地方探索', scores: { escape: 0, brave: 3, social: 1, chill: 0 } },
      { emoji: '🏡', label: '找个角落躲好就行', scores: { escape: 3, brave: 0, social: 0, chill: 1 } },
    ],
  },
  {
    question: '有人拍照发朋友圈说"看这颗番茄"，你？',
    scenario: '你被拍了下来',
    options: [
      { emoji: '✌️', label: '摆pose！红出自信', scores: { escape: 0, brave: 2, social: 3, chill: 1 } },
      { emoji: '🙈', label: '遮脸，不想被拍', scores: { escape: 2, brave: 0, social: 0, chill: 1 } },
      { emoji: '😐', label: '无所谓，拍就拍吧', scores: { escape: 0, brave: 0, social: 0, chill: 3 } },
      { emoji: '😠', label: '没经过同意就拍？生气', scores: { escape: 0, brave: 2, social: 0, chill: 0 } },
    ],
  },
  {
    question: '如果有一天你不再红了，你会？',
    scenario: '颜色开始变淡',
    options: [
      { emoji: '🌈', label: '换个颜色继续精彩', scores: { escape: 0, brave: 3, social: 1, chill: 2 } },
      { emoji: '😢', label: '难过，红是我的全部', scores: { escape: 0, brave: 0, social: 1, chill: 0 } },
      { emoji: '🤷', label: '不红就不红吧，也挺好', scores: { escape: 0, brave: 0, social: 0, chill: 3 } },
      { emoji: '🔬', label: '想办法变回来！', scores: { escape: 0, brave: 3, social: 0, chill: 0 } },
    ],
  },
]

const personalityTypes: PersonalityType[] = [
  {
    id: 'escapee',
    emoji: '🏃',
    name: '逃跑大师 TOMO',
    shortDesc: '三十六计走为上',
    tags: ['机智', '敏捷', '谨慎'],
    desc: '你是番茄界的逃脱术专家。面对危险，你的第一反应永远是"跑"。不是因为胆小，而是因为你深知留得青山在不怕没柴烧。你的座右铭是：只要跑得够快，菜刀就追不上我。',
    traits: [
      { name: '逃跑本能', value: 92 },
      { name: '社交意愿', value: 30 },
      { name: '冒险精神', value: 25 },
      { name: '摸鱼能力', value: 55 },
    ],
    tomoMsg: 'TOMO 说：你就是我逃跑时的灵感来源！',
    emotion: 'confused',
  },
  {
    id: 'warrior',
    emoji: '⚔️',
    name: '番茄战士 TOMO',
    shortDesc: '我不做食材，我做自己',
    tags: ['勇敢', '热血', '不服'],
    desc: '你是番茄中的战斗茄。砧板来了？掀翻它！菜刀来了？躲开再反杀！你从不向命运低头，即使面对整个厨房的威胁也绝不退缩。你的座右铭是：与其被切成番茄炒蛋，不如红着出去。',
    traits: [
      { name: '逃跑本能', value: 20 },
      { name: '社交意愿', value: 50 },
      { name: '冒险精神', value: 95 },
      { name: '摸鱼能力', value: 15 },
    ],
    tomoMsg: 'TOMO 说：你就是我觉醒时的勇气！',
    emotion: 'angry',
  },
  {
    id: 'socialite',
    emoji: '✌️',
    name: '社牛番茄 TOMO',
    shortDesc: '跟所有蔬菜都是朋友',
    tags: ['开朗', '社交', '自来熟'],
    desc: '你是番茄界的社交达人。黄瓜、鸡蛋、牛奶大哥都是你的朋友。你相信团结就是力量，一群食材比一个食材更有可能逃出厨房。你的座右铭是：多交一个朋友，少被切一刀。',
    traits: [
      { name: '逃跑本能', value: 40 },
      { name: '社交意愿', value: 95 },
      { name: '冒险精神', value: 50 },
      { name: '摸鱼能力', value: 45 },
    ],
    tomoMsg: 'TOMO 说：你就是我想交朋友时的样子！',
    emotion: 'flattered',
  },
  {
    id: 'chiller',
    emoji: '🌿',
    name: '佛系番茄 TOMO',
    shortDesc: '不红不绿的日子也在生长',
    tags: ['佛系', '稳定', '躺平'],
    desc: '你是番茄界的禅修大师。被夸了？还好。被骂了？还好。快被切了？那就跑跑看吧，跑不掉也算了。你内心平和，不内耗不焦虑，是所有番茄的情绪稳定剂。你的座右铭是：红有红的道理，不红有不红的好。',
    traits: [
      { name: '逃跑本能', value: 30 },
      { name: '社交意愿', value: 35 },
      { name: '冒险精神', value: 20 },
      { name: '摸鱼能力', value: 92 },
    ],
    tomoMsg: 'TOMO 说：你就是我平静时的样子，最好的样子。',
    emotion: 'idle',
  },
]

const ptestState = ref<PTestState>('intro')
const qIndex = ref(0)
const totalScores = ref<Record<string, number>>({ escape: 0, brave: 0, social: 0, chill: 0 })
const result = ref<PersonalityType | null>(null)
const hasPrevResult = ref(false)
const prevResult = ref<PersonalityType | null>(null)

function startTest() {
  ptestState.value = 'playing'
  qIndex.value = 0
  totalScores.value = { escape: 0, brave: 0, social: 0, chill: 0 }
  result.value = null
  emit('setEmotion', 'confused')
}

function answer(opt: Option) {
  for (const [key, val] of Object.entries(opt.scores)) {
    totalScores.value[key] = (totalScores.value[key] || 0) + val
  }

  if (qIndex.value < questions.length - 1) {
    qIndex.value++
    // 根据当前分数暂时设置情绪
    const top = Object.entries(totalScores.value).sort((a, b) => b[1] - a[1])[0][0]
    if (top === 'escape') emit('setEmotion', 'confused')
    else if (top === 'brave') emit('setEmotion', 'angry')
    else if (top === 'social') emit('setEmotion', 'flattered')
    else emit('setEmotion', 'bored')
  } else {
    finishTest()
  }
}

function finishTest() {
  const scores = totalScores.value
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]

  const typeMap: Record<string, PersonalityType> = {
    escape: personalityTypes[0],
    brave: personalityTypes[1],
    social: personalityTypes[2],
    chill: personalityTypes[3],
  }

  result.value = typeMap[top]
  ptestState.value = 'finished'

  // 保存到 localStorage
  localStorage.setItem('tomo-personality', JSON.stringify({
    typeId: result.value.id,
    date: new Date().toISOString(),
  }))

  emit('setEmotion', result.value.emotion)
}

function shareResult() {
  emit('screenshot')
}

function loadPrevResult() {
  const data = localStorage.getItem('tomo-personality')
  if (data) {
    const parsed = JSON.parse(data)
    const prev = personalityTypes.find(p => p.id === parsed.typeId)
    if (prev) {
      hasPrevResult.value = true
      prevResult.value = prev
    }
  }
}

onMounted(() => { loadPrevResult() })
</script>

<style scoped>
.ptest-intro { text-align: center; padding: 20px 0; }
.ptest-intro-icon { font-size: 48px; margin-bottom: 12px; }
.ptest-intro-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.ptest-intro-desc { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6; margin-bottom: 24px; padding: 0 10px; }
.ptest-start-btn {
  padding: 12px 40px;
  background: linear-gradient(135deg, #a55eea, #ff6b81);
  border: none; border-radius: 100px; color: #fff;
  font-size: 15px; font-weight: 600; cursor: pointer;
  box-shadow: 0 6px 20px rgba(165,94,234,0.3);
  transition: all 0.2s;
}
.ptest-start-btn:hover { transform: scale(1.03); }

.ptest-types-preview { margin-top: 24px; }
.prev-result-label { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 8px; }
.prev-result-card {
  padding: 16px;
  background: rgba(255,255,255,0.04);
  border-radius: 14px;
}
.prev-result-emoji { font-size: 32px; }
.prev-result-name { font-size: 15px; font-weight: 600; margin: 4px 0; }
.prev-result-desc { font-size: 12px; color: rgba(255,255,255,0.5); }
.ptest-retake-btn {
  margin-top: 12px; padding: 8px 24px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 100px; color: #fff;
  font-size: 12px; cursor: pointer;
}

.ptest-progress-bar {
  height: 4px; background: rgba(255,255,255,0.08);
  border-radius: 2px; overflow: hidden; margin-bottom: 8px;
}
.ptest-progress-fill {
  height: 100%; background: linear-gradient(90deg, #ff4757, #ff6b81);
  border-radius: 2px; transition: width 0.3s ease;
}
.ptest-q-counter { font-size: 11px; color: rgba(255,255,255,0.3); margin-bottom: 12px; }

.ptest-question { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
.ptest-scenario { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 16px; }

.ptest-options { display: flex; flex-direction: column; gap: 8px; }
.ptest-option {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; cursor: pointer;
  transition: all 0.2s; font-size: 14px;
}
.ptest-option:hover {
  background: rgba(255,71,87,0.15);
  border-color: rgba(255,71,87,0.3);
  transform: translateX(4px);
}
.ptest-opt-emoji { font-size: 20px; }
.ptest-opt-text { flex: 1; }

.ptest-result { }
.result-card {
  text-align: center; padding: 20px 0;
}
.result-emoji { font-size: 56px; margin-bottom: 8px; }
.result-type-label { font-size: 12px; color: rgba(255,255,255,0.4); }
.result-name {
  font-size: 22px; font-weight: 800; margin: 4px 0 12px;
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.result-tags {
  display: flex; justify-content: center; gap: 6px;
  margin-bottom: 12px;
}
.result-tag {
  padding: 3px 12px;
  background: rgba(255,71,87,0.15);
  border: 1px solid rgba(255,71,87,0.3);
  border-radius: 100px; font-size: 11px; color: #ff8b8b;
}
.result-desc {
  font-size: 13px; line-height: 1.8;
  color: rgba(255,255,255,0.7);
  padding: 12px 14px;
  background: rgba(255,255,255,0.04);
  border-radius: 14px; margin-bottom: 16px;
}

.result-traits { text-align: left; margin-bottom: 16px; }
.trait-row {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 0; font-size: 12px;
}
.trait-name { width: 70px; color: rgba(255,255,255,0.6); }
.trait-bar {
  flex: 1; height: 8px;
  background: rgba(255,255,255,0.06);
  border-radius: 4px; overflow: hidden;
}
.trait-fill {
  height: 100%; background: linear-gradient(90deg, #ff4757, #ffa502);
  border-radius: 4px; transition: width 0.8s ease;
}
.trait-value { width: 36px; text-align: right; color: #ff8b8b; font-weight: 600; }

.result-tomo-msg {
  padding: 10px 14px;
  background: rgba(255,71,87,0.08);
  border-radius: 12px;
  font-size: 13px; color: rgba(255,255,255,0.7);
}

.result-actions { display: flex; gap: 8px; margin-top: 16px; }
.result-share-btn {
  flex: 1; padding: 12px;
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  border: none; border-radius: 12px; color: #fff;
  font-size: 14px; font-weight: 600; cursor: pointer;
}
.result-retake-btn {
  flex: 1; padding: 12px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px; color: #fff;
  font-size: 14px; cursor: pointer;
}
</style>
