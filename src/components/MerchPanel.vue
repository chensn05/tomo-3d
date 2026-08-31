<template>
  <div class="feature-panel merch-panel">
    <div class="panel-header">
      <span class="panel-title"><TomoIcon name="palette" /> TOMO 插画馆</span>
      <button class="panel-close" @click="$emit('close')"><TomoIcon name="close" /></button>
    </div>
    <div class="panel-body">

      <!-- Hero 展示 -->
      <div class="merch-hero">
        <img :src="heroArt.image" class="hero-img" />
        <div class="hero-label">*TOMO time.</div>
      </div>

      <!-- 主题筛选 -->
      <div class="art-filters">
        <button v-for="filter in filters" :key="filter.id" :class="{ active: activeFilter === filter.id }" @click="activeFilter = filter.id">{{ filter.label }}</button>
      </div>

      <!-- 插画网格 -->
      <div class="merch-art-grid">
        <div class="art-card" v-for="art in filteredArts" :key="art.id" @click="openArt(art)">
          <img :src="art.image" class="art-img" />
          <div class="art-info">
            <div class="art-name">{{ art.name }}</div>
            <div class="art-style">{{ art.style }}</div>
          </div>
          <div class="art-download" @click.stop="downloadArt(art)"><TomoIcon name="arrow-down" /></div>
        </div>
      </div>

      <!-- 详情弹窗 -->
      <div class="art-detail-modal" v-if="selectedArt" @click.self="selectedArt = null">
        <div class="art-detail-content">
          <div class="detail-header">
            <div>
              <div class="detail-name">{{ selectedArt.name }}</div>
              <div class="detail-style">{{ selectedArt.style }}</div>
            </div>
            <button @click="selectedArt = null"><TomoIcon name="close" /></button>
          </div>
          <img :src="selectedArt.image" class="detail-art-img" />
          <div class="detail-desc">{{ selectedArt.desc }}</div>
          <div class="detail-tags">
            <span class="detail-tag" v-for="tag in selectedArt.tags" :key="tag">{{ tag }}</span>
          </div>
          <button class="detail-save-btn" @click="downloadArt(selectedArt)">保存插画 ↓</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{ close: []; setEmotion: [id: string] }>()

interface ArtWork {
  id: string
  name: string
  style: string
  desc: string
  tags: string[]
  image: string
  category?: string
}

const heroArt: ArtWork = {
  id: 'hero', name: '惊喜时刻', style: '复古蜡笔插画风',
  desc: 'TOMO 双手捧脸，被闪光和星星包围，惊喜又雀跃的高光时刻。',
  tags: ['惊喜', '闪亮', '治愈'], image: 'art/tomo_hero.jpg',
}

const arts = ref<ArtWork[]>([
  { id: 'sleep', name: '安睡番茄', style: '复古蜡笔插画风', desc: 'TOMO 蜷缩着安静睡着，头顶飘着 Zzz。', tags: ['睡觉', '夜晚', '宁静'], image: 'art/tomo_sleep.jpg' },
  { id: 'chill', name: '摸鱼中', style: '复古蜡笔插画风', desc: 'TOMO 戴着耳机躺平，享受放空时间。', tags: ['摸鱼', '耳机', '躺平'], image: 'art/tomo_chill.jpg' },
  { id: 'eating', name: '干饭人', style: '复古蜡笔插画风', desc: 'TOMO 举着筷子和碗，准备开吃。', tags: ['吃饭', '干饭', '兴奋'], image: 'art/tomo_eating.jpg' },
  { id: 'hug', name: '抱抱番茄', style: '复古蜡笔插画风', desc: 'TOMO 张开双臂，给你一个番茄拥抱。', tags: ['拥抱', '爱心', '治愈'], image: 'art/tomo_hug.jpg' },
  { id: 'sunset', name: '看日落的番茄', style: '复古蜡笔插画风', desc: 'TOMO 安静看着海上日落。', tags: ['日落', '独处', '意境'], image: 'art/tomo_sunset.jpg' },
  { id: 'cool', name: '耍酷番茄', style: '复古蜡笔插画风', desc: '戴圆框眼镜的自信 TOMO。', tags: ['耍酷', '自信', '眼镜'], image: 'art/tomo_cool.jpg' },
  { id: 'cry', name: '大哭番茄', style: '复古蜡笔插画风', desc: '泪如雨下，情绪拉满。', tags: ['大哭', '崩溃', '夸张'], image: 'art/tomo_cry.jpg' },
  { id: 'tomato_toast', name: '番茄吐司', style: '手帐水彩食物插画', desc: '烤面包、番茄片和绿色香草。', tags: ['面包', '早餐', '吐司'], image: 'art/singles/tomato_toast.jpg' },
  { id: 'tomato_bun', name: '番茄面包', style: '轻彩铅食物插画', desc: '番茄造型软面包，切面有番茄酱和奶油馅。', tags: ['面包', '软乎', '烘焙'], image: 'art/singles/tomato_bun.jpg' },
  { id: 'tomato_jam', name: '番茄果酱吐司', style: '生活感早餐手绘', desc: '小玻璃罐番茄果酱和抹好果酱的吐司。', tags: ['果酱', '早餐', '手作'], image: 'art/singles/tomato_jam.jpg' },
  { id: 'tomato_pudding', name: '番茄布丁', style: '轻水彩甜品插画', desc: '奶油顶番茄布丁，酸甜柔软。', tags: ['甜品', '布丁', '下午茶'], image: 'art/singles/tomato_pudding.jpg' },
  { id: 'tomato_jelly', name: '番茄果冻', style: '透明感甜品手绘', desc: '透明红色果冻杯，藏着番茄果肉和薄荷叶。', tags: ['甜品', '果冻', '清爽'], image: 'art/singles/tomato_jelly.jpg' },
  { id: 'tomato_icecream', name: '番茄冰淇淋', style: '软色彩甜品插画', desc: '番茄红冰淇淋球和小脆片。', tags: ['甜品', '冰淇淋', '夏日'], image: 'art/singles/tomato_icecream.jpg' },
  { id: 'tomato_soda', name: '番茄苏打', style: '清透饮品手绘', desc: '红色气泡、冰块、绿叶和吸管。', tags: ['饮品', '苏打', '冰块'], image: 'art/singles/tomato_soda.jpg' },
  { id: 'tomato_tea', name: '番茄茶', style: '日常茶饮插画', desc: '淡红色番茄茶，TOMO 抱杯取暖。', tags: ['饮品', '热茶', '日常'], image: 'art/singles/tomato_tea.jpg' },
  { id: 'tomato_smoothie', name: '番茄奶昔', style: '柔和饮品手绘', desc: '粉红红色奶昔、奶油顶和绿色叶片。', tags: ['饮品', '奶昔', '可爱'], image: 'art/singles/tomato_smoothie.jpg' },
  { id: 'tomo_sticker_wave', name: '挥手贴纸', style: '软边数字贴纸风', desc: 'TOMO 挥手打招呼，适合聊天分享。', tags: ['贴纸', '挥手', '聊天'], image: 'art/singles/tomo_sticker_wave.jpg' },
  { id: 'tomo_sticker_sleep', name: '云朵睡觉贴纸', style: '软边数字贴纸风', desc: 'TOMO 躺在云朵枕头上睡着了。', tags: ['贴纸', '睡觉', '云朵'], image: 'art/singles/tomo_sticker_sleep.jpg' },
  { id: 'tomo_sticker_bread', name: '抱面包贴纸', style: '软边数字贴纸风', desc: 'TOMO 脸贴着面包，一脸满足。', tags: ['贴纸', '面包', '满足'], image: 'art/singles/tomo_sticker_bread.jpg' },
  { id: 'tomo_sticker_rain', name: '纸伞听雨贴纸', style: '软边数字贴纸风', desc: 'TOMO 撑着小纸伞，在雨里很安心。', tags: ['贴纸', '雨', '纸伞'], image: 'art/singles/tomo_sticker_rain.jpg' },
  { id: 'tomo_sticker_egg', name: '和蛋蛋背靠背', style: '软边数字贴纸风', desc: 'TOMO 和害羞的蛋蛋背靠背坐着。', tags: ['贴纸', '朋友', '蛋蛋'], image: 'art/singles/tomo_sticker_egg.jpg' },
])

const selectedArt = ref<ArtWork | null>(null)
const activeFilter = ref('all')
const filters = [
  { id: 'all', label: '全部' },
  { id: 'daily', label: '日常' },
  { id: 'food', label: '面包甜品饮品' },
  { id: 'sticker', label: '贴纸' },
]
const filteredArts = computed(() => {
  if (activeFilter.value === 'all') return arts.value
  return arts.value.filter(a => {
    if (['tomato_toast','tomato_bun','tomato_jam','tomato_pudding','tomato_jelly','tomato_icecream','tomato_soda','tomato_tea','tomato_smoothie'].includes(a.id)) return activeFilter.value === 'food'
    if (a.id.startsWith('tomo_sticker_')) return activeFilter.value === 'sticker'
    return activeFilter.value === 'daily'
  })
})

function openArt(art: ArtWork) {
  selectedArt.value = art
}

function downloadArt(art: ArtWork) {
  const link = document.createElement('a')
  link.download = `tomo-${art.id}-${Date.now()}.jpg`
  link.href = art.image
  link.target = '_blank'
  link.click()
}
</script>

<style scoped>
.merch-panel .panel-body { padding-bottom: 24px; }

.merch-hero {
  text-align: center; margin-bottom: 18px; position: relative;
}
.hero-img {
  width: 220px; height: 220px; object-fit: cover;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}
.hero-label {
  font-size: 16px; font-weight: 700; color: #ee4444;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  margin-top: 8px;
}

.merch-art-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
}
.art-card {
  position: relative; padding: 8px;
  background: rgba(255,234,208,0.04);
  border: 1px solid rgba(212,168,120,0.1);
  border-radius: 14px; cursor: pointer; transition: all 0.2s;
}
.art-card:hover {
  background: rgba(238,68,68,0.08);
  border-color: rgba(238,68,68,0.2);
  transform: translateY(-2px);
}
.art-img { width: 100%; border-radius: 10px; aspect-ratio: 1; object-fit: cover; display: block; }
.art-info { margin-top: 6px; }
.art-name { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7); }
.art-style { font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 1px; }
.art-download {
  position: absolute; top: 8px; right: 8px;
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(0,0,0,0.5); color: #fff;
  font-size: 12px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

.art-detail-modal {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px); z-index: 200;
  display: flex; align-items: center; justify-content: center;
}
.art-detail-content {
  background: rgba(30,20,15,0.95); border-radius: 20px;
  border: 1px solid rgba(212,168,120,0.2);
  padding: 20px; max-width: 90vw; width: 360px;
}
.detail-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 12px;
}
.detail-name { font-size: 16px; font-weight: 700; }
.detail-style { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }
.detail-header button {
  width: 28px; height: 28px; border-radius: 50%;
  border: none; background: rgba(255,255,255,0.1); color: #fff; cursor: pointer;
}
.detail-art-img { width: 100%; border-radius: 12px; margin-bottom: 12px; display: block; }
.detail-desc { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.7; margin-bottom: 12px; }
.detail-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 16px; }
.detail-tag {
  padding: 3px 10px; background: rgba(238,68,68,0.12);
  border: 1px solid rgba(238,68,68,0.2);
  border-radius: 100px; font-size: 10px; color: #ff8b8b;
}
.detail-save-btn {
  width: 100%; padding: 12px;
  background: linear-gradient(135deg, #ee4444, #ff6b6b);
  border: none; border-radius: 12px; color: #fff;
  font-size: 14px; font-weight: 600; cursor: pointer;
}
</style>
