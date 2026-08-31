<template>
  <div class="feature-panel fortune-panel">
    <div class="panel-header">
      <span class="panel-title"><TomoIcon name="crystal" /> TOMO 玄学运势</span>
      <button class="panel-close" @click="$emit('close')"><TomoIcon name="close" /></button>
    </div>
    <div class="panel-body">

      <!-- 阶段1: 介绍 -->
      <div class="fortune-intro" v-if="stage === 'intro'">
        <div class="fortune-orbit-decor" aria-hidden="true"><span>☾</span><i>✦</i><b>✿</b></div>
        <div class="fortune-tomo-icon"><TomoIcon name="crystal" /></div>
        <p class="fortune-hint">塔罗 × 周易 × 梅花易数 × 紫微</p>
        <p class="fortune-sub-hint">基于日期+专属口令，每日一卦，人人不同</p>

        <!-- 用户口令输入 -->
        <div class="fortune-token-section" v-if="!userToken">
          <p class="fortune-token-hint">输入你的专属口令（昵称/名字）</p>
          <p class="fortune-token-sub">口令+日期决定今日卦象，同一天结果固定</p>
          <div class="fortune-token-input-row">
            <input v-model="tokenInput" type="text" placeholder="你的名字或昵称..." maxlength="10" class="fortune-token-input" @keyup.enter="saveToken" />
            <button class="fortune-token-btn" @click="saveToken" :disabled="!tokenInput.trim()">确定</button>
          </div>
        </div>

        <div class="fortune-user-info" v-else>
          <span class="fortune-moon-note">今日专属 · {{ userToken }}</span>
          <span class="fortune-user-name"><TomoIcon name="crystal" /> {{ userToken }} 的今日卦象</span>
          <button class="fortune-change-token" @click="userToken = ''; tokenInput = ''">修改</button>
        </div>

        <button class="fortune-shake-btn" @click="startShuffle" :disabled="!userToken">
          🃏 开始抽牌
        </button>
        <div class="fortune-prev-result" v-if="hasPrevResult && prevResult">
          <div class="prev-label">上次抽到</div>
          <div class="prev-card-name">{{ prevResult.tarot.name }}</div>
          <div class="prev-tier" :class="prevResult.tier">{{ prevResult.tierLabel }}</div>
        </div>
      </div>

      <!-- 阶段2: 洗牌动画 -->
      <div class="fortune-shuffling" v-if="stage === 'shuffling'">
        <div class="shuffle-cards">
          <div class="shuffle-card" v-for="i in 5" :key="i" :style="{ animationDelay: i * 0.1 + 's' }">
            <canvas :ref="el => shuffleCanvas[i-1] = el as HTMLCanvasElement" width="60" height="90"></canvas>
          </div>
        </div>
        <div class="shuffle-text">洗牌中...</div>
      </div>

      <!-- 阶段3: 展扇选牌 -->
      <div class="fortune-spread" v-if="stage === 'spread'">
        <p class="spread-hint"><TomoIcon name="sparkle" /> 凭直觉选一张牌</p>
        <div class="spread-cards">
          <div
            v-for="(card, i) in spreadCards"
            :key="i"
            class="spread-card"
            :class="{ hovered: hoveredCard === i, selected: selectedCardIndex === i }"
            :style="{
              transform: `translateX(${(i - 3) * 50}px) translateY(${Math.abs(i - 3) * 8}px) rotate(${(i - 3) * 8}deg)`,
              zIndex: hoveredCard === i ? 100 : i
            }"
            @mouseenter="hoveredCard = i"
            @mouseleave="hoveredCard = -1"
            @click="selectCard(i)"
          >
            <canvas :ref="el => spreadCanvas[i] = el as HTMLCanvasElement" width="80" height="120"></canvas>
          </div>
        </div>
        <div class="spread-bottom-hint" v-if="selectedCardIndex === -1">
          点击你最有感觉的那张牌
        </div>
      </div>

      <!-- 阶段4: 翻牌动画 -->
      <div class="fortune-flipping" v-if="stage === 'flipping'">
        <div class="flip-card" :class="{ flipped: flipDone }">
          <div class="flip-card-inner">
            <div class="flip-card-back">
              <canvas ref="flipBackCanvas" width="120" height="180"></canvas>
            </div>
            <div class="flip-card-front">
              <canvas ref="flipFrontCanvas" width="120" height="180"></canvas>
            </div>
          </div>
        </div>
        <div class="flip-text" v-if="!flipDone">翻牌中...</div>
        <div class="flip-text" v-if="flipDone">{{ flipCardName }}</div>
      </div>

      <!-- 阶段5: 起卦中 -->
      <div class="fortune-divining" v-if="stage === 'divining'">
        <div class="divine-icons">
          <span class="divine-icon">☰</span>
          <span class="divine-icon"><TomoIcon name="flower" /></span>
          <span class="divine-icon"><TomoIcon name="star" /></span>
        </div>
        <div class="divine-text">{{ divineStep }}</div>
        <div class="fortune-dots">
          <span></span><span></span><span></span>
        </div>
      </div>

      <!-- 阶段6: 结果 -->
      <div class="fortune-result" v-if="stage === 'result' && currentFortune">

        <!-- 塔罗牌 -->
        <div class="result-section tarot-section">
          <div class="section-tag tarot-tag">🃏 塔罗牌 {{ currentFortune.tarot.isReversed ? '· 逆位' : '· 正位' }}</div>
          <div class="tarot-card-display" :class="{ reversed: currentFortune.tarot.isReversed }">
            <canvas ref="resultCardCanvas" width="160" height="240"></canvas>
          </div>
          <div class="tarot-card-desc">{{ currentFortune.tarot.desc }}</div>
        </div>

        <!-- 周易八卦 -->
        <div class="result-section">
          <div class="section-tag gua-tag">☰ 周易八卦</div>
          <div class="gua-display">
            <div class="gua-symbol">{{ currentFortune.gua.symbol }}</div>
            <div class="gua-info">
              <div class="gua-name">{{ currentFortune.gua.name }}</div>
              <div class="gua-trigram">{{ currentFortune.gua.upperTrigram }} 上 · {{ currentFortune.gua.lowerTrigram }} 下</div>
            </div>
          </div>
          <div class="gua-judgment">
            <div class="gua-label">卦辞</div>
            <div class="gua-text">{{ currentFortune.gua.judgment }}</div>
          </div>
          <div class="gua-judgment">
            <div class="gua-label">象曰</div>
            <div class="gua-text">{{ currentFortune.gua.image }}</div>
          </div>
          <div class="gua-interpretation">
            <span class="interp-icon"><TomoIcon name="idea" /></span>
            <span>{{ currentFortune.gua.interpretation }}</span>
          </div>
        </div>

        <!-- 梅花易数 -->
        <div class="result-section">
          <div class="section-tag mei-tag"><TomoIcon name="flower" /> 梅花易数</div>
          <div class="mei-nums">
            <div class="mei-num-item">
              <div class="mei-num-label">上卦</div>
              <div class="mei-num-val">{{ currentFortune.mei.upperNum }}</div>
              <div class="mei-num-tri">{{ currentFortune.mei.upperTrigram }}</div>
            </div>
            <div class="mei-num-op"><TomoIcon name="close" /></div>
            <div class="mei-num-item">
              <div class="mei-num-label">下卦</div>
              <div class="mei-num-val">{{ currentFortune.mei.lowerNum }}</div>
              <div class="mei-num-tri">{{ currentFortune.mei.lowerTrigram }}</div>
            </div>
            <div class="mei-num-op"><TomoIcon name="arrow-right" /></div>
            <div class="mei-num-item">
              <div class="mei-num-label">体用</div>
              <div class="mei-num-val mei-relation" :class="currentFortune.mei.relationType">
                {{ currentFortune.mei.relation }}
              </div>
            </div>
          </div>
          <div class="mei-desc">{{ currentFortune.mei.desc }}</div>
        </div>

        <!-- 紫微斗数 -->
        <div class="result-section">
          <div class="section-tag zi-tag"><TomoIcon name="star" /> 紫微斗数</div>
          <div class="zi-main-star">
            <div class="zi-star-name">{{ currentFortune.ziwei.mainStar }}</div>
            <div class="zi-star-palace">{{ currentFortune.ziwei.palace }}</div>
          </div>
          <div class="zi-stars-row">
            <span class="zi-aux-star" v-for="star in currentFortune.ziwei.auxStars" :key="star">{{ star }}</span>
          </div>
          <div class="zi-desc">{{ currentFortune.ziwei.desc }}</div>
          <div class="zi-four-hua">
            <span class="hua-item" v-for="hua in currentFortune.ziwei.fourHua" :key="hua.name" :class="hua.type">
              {{ hua.name }}<sub>{{ hua.label }}</sub>
            </span>
          </div>
        </div>

        <!-- 综合运势 -->
        <div class="result-section summary-section">
          <div class="section-tag summary-tag">✦ 综合运势</div>
          <div class="summary-tier" :class="currentFortune.tier">{{ currentFortune.tierLabel }}</div>
          <div class="summary-poem">{{ currentFortune.poem }}</div>
          <div class="summary-detail">
            <div class="fortune-row">
              <span class="fortune-label yi">宜</span>
              <span class="fortune-value good">{{ currentFortune.yi }}</span>
            </div>
            <div class="fortune-row">
              <span class="fortune-label ji">忌</span>
              <span class="fortune-value bad">{{ currentFortune.ji }}</span>
            </div>
          </div>
          <div class="fortune-luck-section">
            <div class="fortune-luck-item" v-for="luck in currentFortune.luck" :key="luck.name">
              <span class="luck-name">{{ luck.name }}</span>
              <span class="luck-stars">{{ luck.stars }}</span>
            </div>
          </div>
        </div>

        <!-- TOMO 寄语 -->
        <div class="fortune-tomo-msg">
          <span class="msg-emoji">{{ currentFortune.tomoEmoji }}</span>
          <span>{{ currentFortune.tomoMsg }}</span>
        </div>

        <!-- 连续签到 -->
        <div class="fortune-streak">
          <div class="streak-flames"><TomoIcon name="fire" /> ×{{ streakDays }}</div>
          <div class="streak-label">连续签到</div>
          <div class="streak-reward" v-if="streakDays >= 3 && streakDays < 7"><TomoIcon name="lock-open" /> 已解锁「领结」配件</div>
          <div class="streak-reward" v-if="streakDays >= 7 && streakDays < 14"><TomoIcon name="lock-open" /> 已解锁「皇冠」配件</div>
          <div class="streak-reward" v-if="streakDays >= 14"><TomoIcon name="lock-open" /> 已解锁「耳机」配件 · 满级！</div>
          <div class="streak-next" v-if="streakDays < 14">再签 {{ nextRewardDays - streakDays }} 天解锁新配件</div>
        </div>

        <div class="fortune-comeback"><TomoIcon name="crystal" /> 明日重卦 · 还剩 {{ hoursUntilTomorrow }} 小时 · TOMO 等你 </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { drawTarotCard, drawCardBack, TarotCardData } from '../three/tarotCards'

const emit = defineEmits<{
  close: []
  setEmotion: [id: string]
}>()

// ── 种子随机数生成器（Mulberry32）──
// 基于日期+用户口令生成种子，同一天同一人结果固定
function createSeededRandom(seed: number) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function getStringHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}

function getDailySeed(userToken: string): number {
  const today = new Date()
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  return getStringHash(dateStr + '|' + userToken)
}

// 用户口令
const userToken = ref(localStorage.getItem('tomo-fortune-token') || '')
const tokenInput = ref('')

function saveToken() {
  const t = tokenInput.value.trim()
  if (!t) return
  userToken.value = t
  localStorage.setItem('tomo-fortune-token', t)
  // 口令变了，检查是否已有今日结果
  loadFortune()
}

// ── 类型 ──
interface Fortune {
  tier: 'great' | 'good' | 'mid' | 'bad'
  tierLabel: string
  tarot: TarotCardData
  gua: any
  mei: any
  ziwei: any
  poem: string
  yi: string
  ji: string
  luck: { name: string; stars: string }[]
  tomoEmoji: string
  tomoMsg: string
  emotion: string
}

// ── 塔罗牌数据 ──
const tarotDeck: Omit<TarotCardData, 'isReversed'>[] = [
  { number: '0', name: '愚者', nameEn: 'The Fool', keyword: '新的开始 · 无畏', desc: '今日适合迈出全新的一步，带着初生牛犊不怕虎的勇气。不必想太多，冲就完了。但也要注意别太冒失——脚下可是悬崖。' },
  { number: 'I', name: '魔术师', nameEn: 'The Magician', keyword: '创造 · 掌控', desc: '今日你拥有将想法变为现实的能力。资源就在手边，关键看你如何调度。主动权在你，别浪费了这波能量。' },
  { number: 'II', name: '女祭司', nameEn: 'The High Priestess', keyword: '直觉 · 神秘', desc: '今日适合倾听内心的声音。表面看到的不一定是真相，相信你的第六感。有些事不用急着做决定，让答案自己浮现。' },
  { number: 'III', name: '皇后', nameEn: 'The Empress', keyword: '丰盛 · 孕育', desc: '今日创造力旺盛，适合产出和表达。你播下的种子正在发芽，给它时间成长。生活方面会有小确幸降临。' },
  { number: 'IV', name: '皇帝', nameEn: 'The Emperor', keyword: '权威 · 秩序', desc: '今日需要建立规则和秩序。拿出你的主导力，设定边界，明确目标。不是所有事都要亲力亲为，学会分派和掌控。' },
  { number: 'V', name: '教皇', nameEn: 'The Hierophant', keyword: '传统 · 引导', desc: '今日适合寻求前辈或导师的建议。遵循已有规则比另辟蹊径更稳妥。不是所有创新都是好的，站在巨人肩膀上更省力。' },
  { number: 'VI', name: '恋人', nameEn: 'The Lovers', keyword: '选择 · 和谐', desc: '今日面临重要选择——不一定是感情，可能是人生方向。听从心的声音，但也要用脑思考。选择即负责。' },
  { number: 'VII', name: '战车', nameEn: 'The Chariot', keyword: '胜利 · 前进', desc: '今日是冲刺的好日子。方向已定，踩下油门不要犹豫。左右两股力量看似矛盾，但你若能驾驭便一往无前。' },
  { number: 'VIII', name: '力量', nameEn: 'Strength', keyword: '勇气 · 柔韧', desc: '今日需要的不是蛮力，而是以柔克刚的智慧。内心的猛兽需要安抚而非压制。耐心和温柔是你最大的武器。' },
  { number: 'IX', name: '隐士', nameEn: 'The Hermit', keyword: '独处 · 内省', desc: '今日适合独处和反思。提着灯走进内心洞穴，你会在寂静中找到答案。社交只会消耗你，给自己一段安静的时光。' },
  { number: 'X', name: '命运之轮', nameEn: 'Wheel of Fortune', keyword: '转机 · 循环', desc: '今日运势迎来转折点。潮水正在转向，乘风而起还是随波逐流，取决于你能否抓住这个窗口。变化即是机遇。' },
  { number: 'XI', name: '正义', nameEn: 'Justice', keyword: '公平 · 因果', desc: '今日种什么因得什么果。之前的努力会有回报，之前的欠债也要还。做正确的事，即使它很难。公正待人也公正待己。' },
  { number: 'XII', name: '倒吊人', nameEn: 'The Hanged Man', keyword: '暂停 · 视角', desc: '今日需要换一个角度看问题。倒立过来，世界完全不同。暂时的停滞不是坏事，它在逼你跳出固有思维。' },
  { number: 'XIII', name: '死神', nameEn: 'Death', keyword: '终结 · 重生', desc: '今日某件事将画上句号。别害怕结束——旧的不去新的不来。死神不杀人，杀的是不再适合的模式和关系。放手吧。' },
  { number: 'XIV', name: '节制', nameEn: 'Temperance', keyword: '平衡 · 融合', desc: '今日适合寻找平衡点。工作与生活、理性与感性、快与慢——找到那个刚刚好的中间值。不急不躁，水到渠成。' },
  { number: 'XV', name: '恶魔', nameEn: 'The Devil', keyword: '束缚 · 执念', desc: '今日需警惕陷入执念。那些你以为离不开的东西，可能正是锁链。看清捆绑你的绳索，其实扣子一直在你手里。' },
  { number: 'XVI', name: '高塔', nameEn: 'The Tower', keyword: '突变 · 破坏', desc: '今日可能迎来突如其来的变故。高塔倒塌虽猛烈，但崩塌的本来就不该存在。拥抱变化，废墟之上才能建新楼。' },
  { number: 'XVII', name: '星星', nameEn: 'The Star', keyword: '希望 · 灵感', desc: '今日充满希望与灵感。暴风雨过后星光格外明亮。相信自己，相信未来，宇宙正在为你指路。保持信心就对了。' },
  { number: 'XVIII', name: '月亮', nameEn: 'The Moon', keyword: '迷惘 · 潜意识', desc: '今日情绪可能起伏不定，看什么都不太清晰。月光下影子会骗人——别被恐惧和想象吓住。等天亮了再说。' },
  { number: 'XIX', name: '太阳', nameEn: 'The Sun', keyword: '成功 · 喜悦', desc: '今日运势如日中天！光明正大、坦坦荡荡。该绽放就绽放，该庆祝就庆祝。今天你就是主角，舞台都是你的。' },
  { number: 'XX', name: '审判', nameEn: 'Judgement', keyword: '觉醒 · 召唤', desc: '今日迎来一次内在的觉醒。过去的经历在此刻汇聚成智慧，你比想象中成长了更多。听从内心的召唤，做出选择。' },
  { number: 'XXI', name: '世界', nameEn: 'The World', keyword: '圆满 · 完成', desc: '今日一个重要阶段即将圆满收官。你已经走完了这一圈，收获满满。庆祝成果，然后准备开启下一个循环。' },
]

// ── 八卦 ──
const trigrams = [
  { name: '乾', symbol: '☰', nature: '天', num: 1 },
  { name: '兑', symbol: '☱', nature: '泽', num: 2 },
  { name: '离', symbol: '☲', nature: '火', num: 3 },
  { name: '震', symbol: '☳', nature: '雷', num: 4 },
  { name: '巽', symbol: '☴', nature: '风', num: 5 },
  { name: '坎', symbol: '☵', nature: '水', num: 6 },
  { name: '艮', symbol: '☶', nature: '山', num: 7 },
  { name: '坤', symbol: '☷', nature: '地', num: 8 },
]

const guaData: { upper: number, lower: number, name: string, judgment: string, image: string, interp: string, tier: Fortune['tier'] }[] = [
  { upper: 0, lower: 0, name: '乾为天', judgment: '元亨利贞', image: '天行健，君子以自强不息', interp: '刚健中正，万事亨通。今日势如破竹，主动出击必有收获。', tier: 'great' },
  { upper: 7, lower: 7, name: '坤为地', judgment: '元亨，利牝马之贞', image: '地势坤，君子以厚德载物', interp: '柔顺包容，宜守不宜攻。今天以退为进，厚积薄发。', tier: 'good' },
  { upper: 2, lower: 3, name: '火雷噬嗑', judgment: '亨，利用狱', image: '雷电噬嗑，先王以明罚敕法', interp: '咬合障碍，需决断果敢。今日有阻力但可突破，宜解决积压问题。', tier: 'mid' },
  { upper: 4, lower: 5, name: '雷水解', judgment: '利西南，无所往，其来复吉', image: '雷雨作解，君子以赦过宥罪', interp: '解难释困，险阻消散。今日困局将破，宜放下包袱轻装前行。', tier: 'good' },
  { upper: 3, lower: 4, name: '雷风恒', judgment: '亨，无咎，利贞', image: '雷风恒，君子以立不易方', interp: '恒久不变，持之以恒。今日宜坚持既定方向，不朝三暮四。', tier: 'good' },
  { upper: 7, lower: 0, name: '地天泰', judgment: '小往大来，吉亨', image: '天地交泰，后以财成天地之道', interp: '天地交融，上下通泰。今日万事顺遂，贵人运旺，大吉之象。', tier: 'great' },
  { upper: 0, lower: 7, name: '天地否', judgment: '否之匪人，不利君子贞', image: '天地不交，否；君子以俭德辟难', interp: '闭塞不通，上下不交。今日宜低调藏拙，不宜大事决策。', tier: 'bad' },
  { upper: 2, lower: 0, name: '火天大有', judgment: '元亨', image: '火在天上，大有；君子以遏恶扬善', interp: '盛大丰有，如日中天。今日运势极旺，宜把握机会大展宏图。', tier: 'great' },
  { upper: 4, lower: 2, name: '雷火丰', judgment: '亨，王假之，勿忧，宜日中', image: '雷电皆至，丰；君子以折狱致刑', interp: '丰盛大极，盛极必衰。今日运势达峰，但需居安思危。', tier: 'great' },
  { upper: 5, lower: 2, name: '风火家人', judgment: '利女贞', image: '风自火出，家人；君子以言有物而行有恒', interp: '家和万事兴，内外有序。今日宜处理人际关系，维系感情。', tier: 'good' },
  { upper: 1, lower: 5, name: '天风姤', judgment: '女壮，勿用取女', image: '天下有风，姤；后以施命诰四方', interp: '不期而遇，阴长阳消。今日有意外邂逅但需警惕小人。', tier: 'mid' },
  { upper: 5, lower: 6, name: '风水涣', judgment: '亨，王假有庙', image: '风行水上，涣', interp: '涣散流通，化解阻滞。今日宜放下执念，顺其自然。', tier: 'mid' },
  { upper: 6, lower: 6, name: '坎为水', judgment: '习坎，有孚，维心亨', image: '水洊至，习坎；君子以常德行习教事', interp: '重险重叠，险中有险。今日诸事不顺，但诚信可渡难关。', tier: 'bad' },
  { upper: 2, lower: 2, name: '离为火', judgment: '利贞，亨，畜牝牛吉', image: '明两作，离；大人以继明照于四方', interp: '光明丽日，文采焕发。今日宜表现自我，才华得到认可。', tier: 'great' },
  { upper: 6, lower: 6, name: '坎为水', judgment: '习坎，有孚', image: '水洊至，习坎', interp: '重险重叠。今日需谨慎，但诚信可渡难关。', tier: 'bad' },
  { upper: 7, lower: 5, name: '地风升', judgment: '元亨，用见大人', image: '地中生木，升', interp: '步步高升，柔顺上进。今日宜从小处着手，积少成多。', tier: 'good' },
  { upper: 5, lower: 7, name: '风地观', judgment: '盥而不荐，有孚颙若', image: '风行地上，观', interp: '观察审视，慎重抉择。今日宜多看少动，三思而后行。', tier: 'mid' },
  { upper: 3, lower: 7, name: '山雷颐', judgment: '贞吉，观颐', image: '山下有雷，颐', interp: '颐养正道，自食其力。今日宜节制欲望，管好嘴和脾气。', tier: 'good' },
  { upper: 7, lower: 3, name: '地雷复', judgment: '亨，出入无疾', image: '雷在地中，复', interp: '一阳来复，否极泰来。今日转运之象，低谷将过曙光在前。', tier: 'good' },
  { upper: 6, lower: 0, name: '水天需', judgment: '有孚，光亨，贞吉', image: '云上于天，需', interp: '等待时机，蓄势待发。今日不宜急躁，耐心等候最佳时机。', tier: 'mid' },
]

// ── 紫微 ──
const ziweiStars = [
  { name: '紫微星', palace: '命宫', desc: '帝王之星入命，今日领导力爆棚，适合做决策和拍板。众人仰望你，但也容易孤独。', emotion: 'cool', tier: 'great' as const },
  { name: '天府星', palace: '财帛宫', desc: '府库丰盈，今日财运亨通。理财投资有好运气，但也别太贪。稳守已有比开拓新局更明智。', emotion: 'flattered', tier: 'good' as const },
  { name: '太阳星', palace: '官禄宫', desc: '太阳照官禄，今日事业运极旺。光芒四射，所有人都能看到你的努力和才华。', emotion: 'cool', tier: 'great' as const },
  { name: '太阴星', palace: '福德宫', desc: '太阴入福德，今日内心平和而敏感。适合创作、冥想、整理情绪。直觉力大增。', emotion: 'shy', tier: 'good' as const },
  { name: '贪狼星', palace: '迁移宫', desc: '贪狼主欲望与桃花，今日外出有好运。社交场合可能遇到有意思的人，但也别太贪心。', emotion: 'flattered', tier: 'mid' as const },
  { name: '巨门星', palace: '交友宫', desc: '巨门主口舌是非，今日说话需谨慎。言多必失，沉默是金。', emotion: 'angry', tier: 'mid' as const },
  { name: '天机星', palace: '兄弟宫', desc: '天机入兄弟，今日适合动脑不动手。策划、分析、研究的好日子。', emotion: 'confused', tier: 'good' as const },
  { name: '天梁星', palace: '父母宫', desc: '天梁主荫庇，今日有贵人相助。长辈或上级可能给你指点或资源。', emotion: 'idle', tier: 'good' as const },
  { name: '七杀星', palace: '疾厄宫', desc: '七杀入疾厄，今日需注意身体和情绪。压力可能突然来袭，别硬撑。', emotion: 'sick', tier: 'bad' as const },
  { name: '破军星', palace: '夫妻宫', desc: '破军主破坏与重建，今日人际关系有波动。破而后立，不必遗憾。', emotion: 'crying', tier: 'mid' as const },
  { name: '武曲星', palace: '财帛宫', desc: '武曲主财，今日财运刚健有力。适合处理跟钱相关的事务。实干出真金。', emotion: 'cool', tier: 'good' as const },
  { name: '廉贞星', palace: '官禄宫', desc: '廉贞入官禄，今日工作中容易遇到束缚和规则。别硬碰硬，学会在框架内跳舞。', emotion: 'angry', tier: 'mid' as const },
]

const fourHuaPool = [
  { name: '化禄', type: 'lu' as const, label: '财', desc: '进财之喜' },
  { name: '化权', type: 'quan' as const, label: '权', desc: '掌权之威' },
  { name: '化科', type: 'ke' as const, label: '名', desc: '得名之誉' },
  { name: '化忌', type: 'ji' as const, label: '忌', desc: '受阻之困' },
]

const meiRelations = [
  { relationType: 'sheng' as const, relation: '体生用', desc: '体卦生用卦，今日付出多于回报。你在为他人做嫁衣，但也积累了人脉和因果。不急于收获，来日方长。' },
  { relationType: 'ke' as const, relation: '用克体', desc: '用卦克制体卦，今日外部压力较大。有阻力但不是死局——克中有磨，磨中有炼。扛过去就是成长。' },
  { relationType: 'bi-he' as const, relation: '体用比和', desc: '体用比和，内外和谐。今日心想事成，内驱力与外部环境同频共振。难得的顺遂之日。' },
  { relationType: 'sheng' as const, relation: '用生体', desc: '用卦生体卦，今日贵人运旺。外力助你一臂之力，资源和人脉主动向你靠拢。' },
  { relationType: 'ke' as const, relation: '体克用', desc: '体卦克制用卦，今日你掌握主动权。外部困难被你拿下，以实力破局。' },
]

const fortuneExtras = [
  { tier: 'great' as const, tierLabel: '大吉', poem: '紫气东来运势旺，番茄红透满庭芳。万事顺遂无阻碍，宜将剩勇追穷忙。', yi: '主动出击 · 拍板决策 · 请客吃饭 · 表达心意', ji: '犹豫不决 · 贪心不足 · 说"随便"', luck: [{ name: '事业', stars: '★★★★★' }, { name: '财运', stars: '★★★★★' }, { name: '社交', stars: '★★★★☆' }], tomoEmoji: 'face-cool', tomoMsg: 'TOMO 说：今天你就是全场最红的番茄，冲！' },
  { tier: 'great' as const, tierLabel: '大吉', poem: '一阳来复万象新，红运当头照此身。把握良机莫迟疑，今日不搏待何辰。', yi: '提需求 · 约人 · 冲动消费 · 摸鱼', ji: '加班 · 背锅 · 拖延', luck: [{ name: '事业', stars: '★★★★★' }, { name: '财运', stars: '★★★★☆' }, { name: '社交', stars: '★★★★★' }], tomoEmoji: 'face-shy', tomoMsg: 'TOMO 说：被好运夸了都不好意思了，但确实是你应得的！' },
  { tier: 'good' as const, tierLabel: '吉', poem: '小番茄圆又红，今日运势不算凶。稳稳当当过一天，下班可以去兜风。', yi: '按部就班 · 喝水 · 伸懒腰 · 整理桌面', ji: '逞强 · 熬夜 · 吃外卖', luck: [{ name: '事业', stars: '★★★★☆' }, { name: '财运', stars: '★★★☆☆' }, { name: '社交', stars: '★★★★☆' }], tomoEmoji: 'tomato', tomoMsg: 'TOMO 说：平平淡淡才是真，今天也是饱满的一天。' },
  { tier: 'good' as const, tierLabel: '吉', poem: '贵人星动福气来，番茄蒂绿果正开。遇到困难别硬扛，有人帮你渡难关。', yi: '求助同事 · 分享零食 · 请客', ji: '逞强 · 独狼 · 冷战', luck: [{ name: '事业', stars: '★★★★☆' }, { name: '财运', stars: '★★★★☆' }, { name: '社交', stars: '★★★★★' }], tomoEmoji: 'face-happy', tomoMsg: 'TOMO 说：今天适合社交，害羞也没关系，迈出去就好~' },
  { tier: 'mid' as const, tierLabel: '平', poem: '番茄躺在砧板旁，今日状态略迷茫。不急不躁慢慢来，过了今天就是光。', yi: '摸鱼 · 看文档 · 喝咖啡 · 放空', ji: '做大决定 · 签约 · 跳槽', luck: [{ name: '事业', stars: '★★★☆☆' }, { name: '财运', stars: '★★★☆☆' }, { name: '社交', stars: '★★☆☆☆' }], tomoEmoji: 'face-think', tomoMsg: 'TOMO 说：迷茫也没事，先吃个番茄慢慢想。' },
  { tier: 'mid' as const, tierLabel: '平', poem: '叶绿果红日正高，今日不急也不躁。虽无大喜也无忧，稳扎稳打慢慢熬。', yi: '做计划 · 学新东西 · 散步', ji: '内耗 · 对比 · 自我否定', luck: [{ name: '事业', stars: '★★★☆☆' }, { name: '财运', stars: '★★★☆☆' }, { name: '社交', stars: '★★★☆☆' }], tomoEmoji: 'tomato', tomoMsg: 'TOMO 说：不红不绿的日子，也在生长。' },
  { tier: 'bad' as const, tierLabel: '凶', poem: '番茄从台滚落地，今日诸事不太利。低调行事少开口，明早起来转运势。', yi: '低调 · 独处 · 戴耳机 · 请假', ji: '开会 · 做汇报 · 请客', luck: [{ name: '事业', stars: '★★☆☆☆' }, { name: '财运', stars: '★★☆☆☆' }, { name: '社交', stars: '★☆☆☆☆' }], tomoEmoji: 'face-sad', tomoMsg: 'TOMO 说：今天我也难过，但明天一定会好的。' },
  { tier: 'bad' as const, tierLabel: '大凶', poem: '砧板刀光闪寒芒，今日大凶莫逞强。宜静不宜宜藏拙，熬过今日是曙光。', yi: '装病 · 关通知 · 装死 · 摸鱼到底', ji: '背锅 · 主动加班 · 跟人争论', luck: [{ name: '事业', stars: '★☆☆☆☆' }, { name: '财运', stars: '★★☆☆☆' }, { name: '社交', stars: '★☆☆☆☆' }], tomoEmoji: 'face-cry', tomoMsg: 'TOMO 说：今天我俩一起哭，但绝不认输！明天见！' },
]

// ── 状态 ──
type Stage = 'intro' | 'shuffling' | 'spread' | 'flipping' | 'divining' | 'result'
const stage = ref<Stage>('intro')
const spreadCards = ref<TarotCardData[]>([])
const selectedCardIndex = ref(-1)
const hoveredCard = ref(-1)
const flipDone = ref(false)
const flipCardName = ref('')
const divineStep = ref('')
const currentFortune = ref<Fortune | null>(null)
const streakDays = ref(0)
const hasPrevResult = ref(false)
const prevResult = ref<Fortune | null>(null)

// Canvas refs
const shuffleCanvas = ref<(HTMLCanvasElement | null)[]>([])
const spreadCanvas = ref<(HTMLCanvasElement | null)[]>([])
const flipBackCanvas = ref<HTMLCanvasElement>()
const flipFrontCanvas = ref<HTMLCanvasElement>()
const resultCardCanvas = ref<HTMLCanvasElement>()

const hoursUntilTomorrow = computed(() => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return Math.max(1, Math.ceil((tomorrow.getTime() - now.getTime()) / 3600000))
})

const nextRewardDays = computed(() => {
  if (streakDays.value < 3) return 3
  if (streakDays.value < 7) return 7
  return 14
})

function getTodayStr() { return new Date().toDateString() }

function loadFortune() {
  // 清理旧版无 token 后缀的脏数据
  const legacy = localStorage.getItem('tomo-fortune')
  if (legacy && !localStorage.getItem('tomo-fortune-token')) {
    try {
      const legacyData = JSON.parse(legacy)
      // 旧数据迁移：如果还没新格式数据，把旧结果挂到当前口令下
      if (legacyData.fortune && !localStorage.getItem(`tomo-fortune-${userToken.value}`)) {
        localStorage.setItem(`tomo-fortune-${userToken.value || '旧用户'}`, legacy)
      }
    } catch (_) { /* 忽略坏数据 */ }
    localStorage.removeItem('tomo-fortune')
  }
  if (!userToken.value) return
  const today = getTodayStr()
  // 结果 key 包含口令，换口令就重新算
  const resultKey = `tomo-fortune-${userToken.value}`
  const data = JSON.parse(localStorage.getItem(resultKey) || '{}')

  if (data.date === today && data.fortune) {
    currentFortune.value = data.fortune
    stage.value = 'result'
    streakDays.value = data.streakDays || 0
    hasPrevResult.value = false
    nextTick(() => {
      if (resultCardCanvas.value && data.fortune.tarot) {
        drawTarotCard(resultCardCanvas.value, data.fortune.tarot)
      }
    })
  } else {
    const lastDate = data.lastDate
    if (lastDate) {
      const last = new Date(lastDate)
      const now = new Date()
      const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
      streakDays.value = diff === 1 ? (data.streakDays || 0) : 0
    }
    if (data.fortune) {
      hasPrevResult.value = true
      prevResult.value = data.fortune
    }
  }
}

// ── 洗牌 ──
function startShuffle() {
  stage.value = 'shuffling'
  emit('setEmotion', 'confused')

  nextTick(() => {
    // 绘制洗牌动画的牌背
    shuffleCanvas.value.forEach(c => {
      if (c) drawCardBack(c)
    })
  })

  setTimeout(() => {
    prepareSpread()
  }, 1500)
}

// ── 展扇 ──
function prepareSpread() {
  // 用种子随机决定7张牌（日期+口令）
  const seed = getDailySeed(userToken.value)
  const rng = createSeededRandom(seed)

  // 从22张牌中选7张（用种子打乱）
  const indices = Array.from({ length: tarotDeck.length }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  const selected = indices.slice(0, 7).map(idx => ({
    ...tarotDeck[idx],
    isReversed: rng() < 0.3
  }))
  spreadCards.value = selected
  selectedCardIndex.value = -1
  hoveredCard.value = -1
  stage.value = 'spread'

  nextTick(() => {
    spreadCanvas.value.forEach((c) => {
      if (c) drawCardBack(c)
    })
  })
}

// ── 选牌 ──
function selectCard(index: number) {
  if (selectedCardIndex.value !== -1) return
  selectedCardIndex.value = index

  const selectedCard = spreadCards.value[index]

  // 进入翻牌阶段
  stage.value = 'flipping'
  flipDone.value = false

  nextTick(() => {
    if (flipBackCanvas.value) drawCardBack(flipBackCanvas.value)
    // 延迟翻牌
    setTimeout(() => {
      if (flipFrontCanvas.value) {
        drawTarotCard(flipFrontCanvas.value, selectedCard)
      }
      flipDone.value = true
      flipCardName.value = `${selectedCard.name} ${selectedCard.isReversed ? '逆位' : '正位'}`

      // 1秒后进入起卦
      setTimeout(() => {
        startDivining(selectedCard)
      }, 1500)
    }, 500)
  })
}

// ── 起卦 ──
function startDivining(selectedTarot: TarotCardData) {
  stage.value = 'divining'
  const steps = ['正在起卦...', '正在排紫微盘...', '正在推演梅花...', '正在综合解读...']
  let i = 0
  divineStep.value = steps[0]
  const interval = setInterval(() => {
    i++
    if (i < steps.length) {
      divineStep.value = steps[i]
    }
  }, 500)

  setTimeout(() => {
    clearInterval(interval)
    const fortune = generateFortune(selectedTarot)
    currentFortune.value = fortune
    stage.value = 'result'

    // 保存 - 按口令分存储
    const today = getTodayStr()
    const resultKey = `tomo-fortune-${userToken.value}`
    const prevData = JSON.parse(localStorage.getItem(resultKey) || '{}')
    const prevStreak = prevData.streakDays || 0
    const lastDate = prevData.lastDate
    let newStreak = 1
    if (lastDate) {
      const last = new Date(lastDate)
      const now = new Date()
      const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
      newStreak = diff === 1 ? prevStreak + 1 : 1
    }
    streakDays.value = newStreak
    localStorage.setItem(resultKey, JSON.stringify({
      date: today,
      lastDate: today,
      fortune,
      streakDays: newStreak,
    }))

    emit('setEmotion', fortune.emotion)

    // 绘制结果塔罗牌
    nextTick(() => {
      if (resultCardCanvas.value) {
        drawTarotCard(resultCardCanvas.value, selectedTarot)
      }
    })
  }, 2200)
}

function generateFortune(selectedTarot: TarotCardData): Fortune {
  // 种子随机 - 日期+口令+选中牌的编号
  const cardSeed = selectedTarot.number
  const seed = getDailySeed(userToken.value) + getStringHash(cardSeed)
  const rng = createSeededRandom(seed)

  // 周易
  const guaBase = guaData[Math.floor(rng() * guaData.length)]
  const upperTri = trigrams[guaBase.upper]
  const lowerTri = trigrams[guaBase.lower]
  const gua = {
    symbol: upperTri.symbol + lowerTri.symbol,
    name: guaBase.name,
    upperTrigram: `${upperTri.name}(${upperTri.nature})`,
    lowerTrigram: `${lowerTri.name}(${lowerTri.nature})`,
    judgment: guaBase.judgment,
    image: guaBase.image,
    interpretation: guaBase.interp,
  }

  // 梅花
  const meiRel = meiRelations[Math.floor(rng() * meiRelations.length)]
  const mei = {
    upperNum: upperTri.num,
    lowerNum: lowerTri.num,
    upperTrigram: upperTri.name,
    lowerTrigram: lowerTri.name,
    relation: meiRel.relation,
    relationType: meiRel.relationType,
    desc: meiRel.desc,
  }

  // 紫微
  const ziweiBase = ziweiStars[Math.floor(rng() * ziweiStars.length)]
  const huaIndices = Array.from({ length: fourHuaPool.length }, (_, i) => i)
  for (let i = huaIndices.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); ;[huaIndices[i], huaIndices[j]] = [huaIndices[j], huaIndices[i]] }
  const auxStarsPool = ['左辅', '右弼', '文昌', '文曲', '天魁', '天钺', '禄存', '天马']
  const auxShuffled = [...auxStarsPool]
  for (let i = auxShuffled.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); ;[auxShuffled[i], auxShuffled[j]] = [auxShuffled[j], auxShuffled[i]] }
  const huaCount = 2 + Math.floor(rng() * 2)
  const ziwei = {
    mainStar: ziweiBase.name,
    palace: ziweiBase.palace,
    auxStars: auxShuffled.slice(0, 3),
    fourHua: huaIndices.slice(0, huaCount).map(i => ({ ...fourHuaPool[i], label: fourHuaPool[i].desc })),
    desc: ziweiBase.desc,
  }

  // 综合运势
  let tier = guaBase.tier
  if (selectedTarot.isReversed && tier === 'great') tier = 'good'
  if (selectedTarot.isReversed && tier === 'good') tier = 'mid'
  if (!selectedTarot.isReversed && tier === 'bad' && rng() < 0.4) tier = 'mid'

  const extras = fortuneExtras.filter(e => e.tier === tier)
  const extra = extras[Math.floor(rng() * extras.length)]

  return {
    tier,
    tierLabel: extra.tierLabel,
    tarot: selectedTarot,
    gua,
    mei,
    ziwei,
    poem: extra.poem,
    yi: extra.yi,
    ji: extra.ji,
    luck: extra.luck,
    tomoEmoji: extra.tomoEmoji,
    tomoMsg: extra.tomoMsg,
    emotion: ziweiBase.emotion,
  }
}

onMounted(() => { loadFortune() })
</script>

<style scoped>
.fortune-panel .panel-body { padding-bottom: 24px; }

/* 介绍 */
.fortune-intro { text-align: center; padding: 16px 0; }
.fortune-tomo-icon { font-size: 44px; margin-bottom: 10px; }
.fortune-hint { font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 4px; font-weight: 600; }
.fortune-sub-hint { font-size: 11px; color: rgba(255,255,255,0.35); margin-bottom: 14px; }

.fortune-token-section { margin-bottom: 18px; }
.fortune-token-hint { font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 4px; }
.fortune-token-sub { font-size: 10px; color: rgba(255,255,255,0.3); margin-bottom: 10px; }
.fortune-token-input-row { display: flex; gap: 6px; justify-content: center; }
.fortune-token-input {
  padding: 8px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 100px; color: #fff; font-size: 14px; outline: none; width: 160px;
}
.fortune-token-input:focus { border-color: rgba(165,94,234,0.4); }
.fortune-token-input::placeholder { color: rgba(255,255,255,0.25); }
.fortune-token-btn {
  padding: 8px 16px; background: linear-gradient(135deg, #6c5ce7, #a55eea); border: none;
  border-radius: 100px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;
}
.fortune-token-btn:disabled { opacity: 0.4; }

.fortune-user-info { margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; }
.fortune-user-name { font-size: 13px; color: rgba(255,255,255,0.7); }
.fortune-change-token { font-size: 11px; color: rgba(255,255,255,0.3); background: none; border: none; cursor: pointer; text-decoration: underline; }
.fortune-shake-btn {
  padding: 12px 36px;
  background: linear-gradient(135deg, #6c5ce7, #a55eea, #ff6b81);
  border: none; border-radius: 100px; color: #fff;
  font-size: 15px; font-weight: 600; cursor: pointer;
  box-shadow: 0 6px 20px rgba(108,92,231,0.4);
  transition: all 0.2s;
}
.fortune-shake-btn:hover:not(:disabled) { transform: scale(1.03); }

.fortune-prev-result { margin-top: 20px; padding: 10px; background: rgba(255,255,255,0.04); border-radius: 12px; }
.prev-label { font-size: 11px; color: rgba(255,255,255,0.3); }
.prev-card-name { font-size: 14px; font-weight: 600; margin: 4px 0; }
.prev-tier { font-size: 12px; font-weight: 600; display: inline-block; padding: 2px 10px; border-radius: 100px; }
.prev-tier.great { color: #ffd700; }
.prev-tier.good { color: #2ed573; }
.prev-tier.mid { color: rgba(255,255,255,0.5); }
.prev-tier.bad { color: #999; }

/* 洗牌 */
.fortune-shuffling { text-align: center; padding: 30px 0; }
.shuffle-cards {
  display: flex; justify-content: center; gap: -10px;
  position: relative; height: 100px;
}
.shuffle-card {
  position: absolute;
  animation: shuffleMove 0.6s ease-in-out infinite alternate;
}
.shuffle-card:nth-child(1) { left: 30%; animation-delay: 0s; }
.shuffle-card:nth-child(2) { left: 38%; animation-delay: 0.1s; }
.shuffle-card:nth-child(3) { left: 46%; animation-delay: 0.2s; }
.shuffle-card:nth-child(4) { left: 54%; animation-delay: 0.3s; }
.shuffle-card:nth-child(5) { left: 62%; animation-delay: 0.4s; }
@keyframes shuffleMove {
  from { transform: translateY(0) rotate(-3deg); }
  to { transform: translateY(-15px) rotate(3deg); }
}
.shuffle-card canvas { border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
.shuffle-text { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 16px; }

/* 展扇选牌 */
.fortune-spread { text-align: center; padding: 20px 0; }
.spread-hint { font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 20px; font-weight: 600; }
.spread-cards {
  display: flex; justify-content: center; align-items: flex-end;
  height: 160px; position: relative; padding: 20px 0;
}
.spread-card {
  position: absolute; bottom: 0;
  cursor: pointer; transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  transform-origin: bottom center;
}
.spread-card canvas { border-radius: 8px; box-shadow: 0 6px 15px rgba(0,0,0,0.4); }
.spread-card.hovered { filter: brightness(1.3); }
.spread-card.hovered canvas { box-shadow: 0 10px 30px rgba(162,155,254,0.5); }
.spread-card.selected { opacity: 0.3; }
.spread-bottom-hint { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 16px; }

/* 翻牌 */
.fortune-flipping { text-align: center; padding: 30px 0; }
.flip-card {
  width: 120px; height: 180px; margin: 0 auto;
  perspective: 600px;
}
.flip-card-inner {
  width: 100%; height: 100%; position: relative;
  transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
  transform-style: preserve-3d;
}
.flip-card.flipped .flip-card-inner { transform: rotateY(180deg); }
.flip-card-back, .flip-card-front {
  position: absolute; width: 100%; height: 100%;
  backface-visibility: hidden; -webkit-backface-visibility: hidden;
}
.flip-card-front { transform: rotateY(180deg); }
.flip-card canvas { border-radius: 10px; box-shadow: 0 8px 25px rgba(0,0,0,0.4); }
.flip-text { font-size: 16px; color: #a29bfe; font-weight: 600; margin-top: 20px; }

/* 起卦 */
.fortune-divining { text-align: center; padding: 30px 0; }
.divine-icons { display: flex; justify-content: center; gap: 16px; margin-bottom: 16px; }
.divine-icon { font-size: 28px; animation: divinePulse 1s ease-in-out infinite; }
.divine-icon:nth-child(1) { animation-delay: 0s; }
.divine-icon:nth-child(2) { animation-delay: 0.2s; }
.divine-icon:nth-child(3) { animation-delay: 0.4s; }
@keyframes divinePulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
.divine-text { font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 10px; }
.fortune-dots { margin-top: 10px; }
.fortune-dots span {
  display: inline-block; width: 6px; height: 6px;
  border-radius: 50%; background: #a55eea; margin: 0 3px;
  animation: dotPulse 1s infinite;
}
.fortune-dots span:nth-child(2) { animation-delay: 0.2s; }
.fortune-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

/* 结果 */
.fortune-result { text-align: center; }
.result-section {
  margin-bottom: 16px; padding: 14px;
  background: rgba(255,255,255,0.03);
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.05);
}
.section-tag {
  display: inline-block; padding: 3px 12px;
  border-radius: 100px; font-size: 11px; font-weight: 600;
  margin-bottom: 10px;
}
.tarot-tag { background: rgba(108,92,231,0.2); color: #a29bfe; border: 1px solid rgba(108,92,231,0.3); }
.gua-tag { background: rgba(255,165,2,0.15); color: #ffa502; border: 1px solid rgba(255,165,2,0.3); }
.mei-tag { background: rgba(255,71,87,0.15); color: #ff6b6b; border: 1px solid rgba(255,71,87,0.3); }
.zi-tag { background: rgba(46,213,115,0.15); color: #2ed573; border: 1px solid rgba(46,213,115,0.3); }
.summary-tag { background: rgba(255,215,0,0.15); color: #ffd700; border: 1px solid rgba(255,215,0,0.3); }

.tarot-card-display {
  display: inline-block; margin-bottom: 10px;
  transition: transform 0.3s;
}
.tarot-card-display.reversed { transform: rotate(180deg); }
.tarot-card-display canvas { border-radius: 10px; box-shadow: 0 6px 20px rgba(108,92,231,0.3); }
.tarot-card-desc { font-size: 12px; line-height: 1.7; color: rgba(255,255,255,0.65); text-align: left; }

.gua-display { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 10px; }
.gua-symbol { font-size: 36px; color: #ffa502; letter-spacing: 2px; }
.gua-name { font-size: 15px; font-weight: 700; }
.gua-trigram { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }
.gua-judgment { margin: 8px 0; text-align: left; }
.gua-label { font-size: 10px; color: rgba(255,255,255,0.3); margin-bottom: 2px; }
.gua-text { font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.75); }
.gua-interpretation { display: flex; gap: 6px; align-items: flex-start; margin-top: 6px; padding: 8px 10px; background: rgba(255,165,2,0.08); border-radius: 10px; text-align: left; font-size: 12px; color: rgba(255,255,255,0.65); }

.mei-nums { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 8px; }
.mei-num-item { text-align: center; }
.mei-num-label { font-size: 9px; color: rgba(255,255,255,0.3); }
.mei-num-val { font-size: 18px; font-weight: 700; color: #ff6b6b; }
.mei-num-tri { font-size: 10px; color: rgba(255,255,255,0.4); }
.mei-num-op { font-size: 14px; color: rgba(255,255,255,0.3); }
.mei-relation.sheng { color: #2ed573; }
.mei-relation.ke { color: #ff6b6b; }
.mei-relation.bi-he { color: #ffd700; }
.mei-desc { font-size: 12px; line-height: 1.7; color: rgba(255,255,255,0.65); text-align: left; }

.zi-main-star { margin-bottom: 6px; }
.zi-star-name { font-size: 16px; font-weight: 700; color: #2ed573; }
.zi-star-palace { font-size: 11px; color: rgba(255,255,255,0.4); }
.zi-stars-row { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; margin: 6px 0; }
.zi-aux-star { padding: 2px 8px; background: rgba(46,213,115,0.1); border: 1px solid rgba(46,213,115,0.2); border-radius: 100px; font-size: 10px; color: #2ed573; }
.zi-desc { font-size: 12px; line-height: 1.7; color: rgba(255,255,255,0.65); text-align: left; margin: 6px 0; }
.zi-four-hua { display: flex; gap: 6px; justify-content: center; margin-top: 6px; }
.hua-item { padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
.hua-item.lu { background: rgba(255,215,0,0.15); color: #ffd700; }
.hua-item.quan { background: rgba(255,71,87,0.15); color: #ff6b6b; }
.hua-item.ke { background: rgba(46,213,115,0.15); color: #2ed573; }
.hua-item.ji { background: rgba(100,100,100,0.2); color: #999; }
.hua-item sub { font-size: 8px; opacity: 0.6; }

.summary-section { background: rgba(255,215,0,0.04) !important; border-color: rgba(255,215,0,0.1) !important; }
.summary-tier { display: inline-block; padding: 4px 18px; border-radius: 100px; font-size: 15px; font-weight: 800; margin-bottom: 8px; }
.summary-tier.great { background: linear-gradient(135deg, #ffd700, #ffa502); color: #1a0a0a; }
.summary-tier.good { background: rgba(46,213,115,0.2); color: #2ed573; border: 1px solid rgba(46,213,115,0.4); }
.summary-tier.mid { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); }
.summary-tier.bad { background: rgba(100,100,100,0.3); color: #999; }
.summary-poem { font-size: 13px; line-height: 2; color: rgba(255,255,255,0.85); padding: 10px 14px; margin: 8px 0; background: rgba(255,255,255,0.04); border-radius: 12px; font-style: italic; }
.summary-detail { margin: 8px 0; }
.fortune-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 12px; }
.fortune-label { width: 24px; font-weight: 700; text-align: center; border-radius: 6px; padding: 2px 0; }
.fortune-label.yi { background: rgba(46,213,115,0.15); color: #2ed573; }
.fortune-label.ji { background: rgba(255,71,87,0.15); color: #ff6b6b; }
.fortune-value { flex: 1; text-align: left; }
.fortune-value.good { color: #2ed573; }
.fortune-value.bad { color: #ff6b6b; }
.fortune-luck-section { display: flex; justify-content: space-around; margin: 8px 0; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); }
.fortune-luck-item { text-align: center; }
.luck-name { font-size: 10px; color: rgba(255,255,255,0.4); display: block; }
.luck-stars { font-size: 12px; color: #ffd700; }

.fortune-tomo-msg { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 14px; margin: 8px 0; background: rgba(255,71,87,0.08); border-radius: 12px; font-size: 12px; color: rgba(255,255,255,0.7); }

.fortune-streak { margin-top: 12px; padding: 10px; background: rgba(255,165,2,0.06); border-radius: 14px; text-align: center; }
.streak-flames { font-size: 16px; color: #ffa502; }
.streak-label { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 2px; }
.streak-reward { font-size: 11px; color: #2ed573; margin-top: 6px; }
.streak-next { font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 4px; }
.fortune-comeback { margin-top: 10px; font-size: 11px; color: rgba(255,255,255,0.3); text-align: center; }
</style>
