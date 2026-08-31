export interface Emotion {
  id: string
  emoji: string
  label: string
  color: number      // 番茄身体颜色
  leafColor: number  // 叶子颜色
  eyeStyle: 'normal' | 'happy' | 'angry' | 'sleepy' | 'wide' | 'x' | 'wink'
  mouthStyle: 'smile' | 'frown' | 'open' | 'flat' | 'shock' | 'cry'
  blush: boolean
  accessory?: 'question' | 'glasses' | 'bandage' | 'tears' | 'sparkle' | 'hearts' | 'sweat'
  particleColor?: number
  particleType?: 'hearts' | 'tears' | 'sparkles' | 'sweat' | 'fire' | 'none'
}

export const emotions: Emotion[] = [
  {
    id: 'idle',
    emoji: 'tomato',
    label: '平静',
    color: 0xee4444,
    leafColor: 0x2ed573,
    eyeStyle: 'normal',
    mouthStyle: 'smile',
    blush: false,
    particleType: 'none',
  },
  {
    id: 'shy',
    emoji: 'face-happy',
    label: '害羞',
    color: 0xff5555,
    leafColor: 0x2ed573,
    eyeStyle: 'happy',
    mouthStyle: 'smile',
    blush: true,
    accessory: 'hearts',
    particleColor: 0xff9bb3,
    particleType: 'hearts',
  },
  {
    id: 'angry',
    emoji: 'face-angry',
    label: '生气',
    color: 0xdd2222,
    leafColor: 0x2ed573,
    eyeStyle: 'angry',
    mouthStyle: 'frown',
    blush: false,
    accessory: 'fire',
    particleColor: 0xff6347,
    particleType: 'fire',
  },
  {
    id: 'bored',
    emoji: 'face-smug',
    label: '无聊',
    color: 0xcc3838,
    leafColor: 0x2db567,
    eyeStyle: 'sleepy',
    mouthStyle: 'flat',
    blush: false,
    particleType: 'none',
  },
  {
    id: 'confused',
    emoji: 'face-think',
    label: '困惑',
    color: 0xee4444,
    leafColor: 0x2ed573,
    eyeStyle: 'wide',
    mouthStyle: 'shock',
    blush: false,
    accessory: 'question',
    particleType: 'none',
  },
  {
    id: 'flattered',
    emoji: 'face-shy',
    label: '被夸了',
    color: 0xff5566,
    leafColor: 0x2ed573,
    eyeStyle: 'happy',
    mouthStyle: 'smile',
    blush: true,
    accessory: 'sparkle',
    particleColor: 0xffd700,
    particleType: 'sparkles',
  },
  {
    id: 'crying',
    emoji: 'face-cry',
    label: '大哭',
    color: 0xdd3333,
    leafColor: 0x2ed573,
    eyeStyle: 'x',
    mouthStyle: 'cry',
    blush: false,
    accessory: 'tears',
    particleColor: 0x64b5f6,
    particleType: 'tears',
  },
  {
    id: 'sad',
    emoji: 'face-sad',
    label: '难过',
    color: 0xcc3838,
    leafColor: 0x2db567,
    eyeStyle: 'sleepy',
    mouthStyle: 'frown',
    blush: false,
    accessory: 'tears',
    particleColor: 0x64b5f6,
    particleType: 'tears',
  },
  {
    id: 'sick',
    emoji: 'face-sick',
    label: '生病了',
    color: 0xcc4040,
    leafColor: 0x2db567,
    eyeStyle: 'sleepy',
    mouthStyle: 'flat',
    blush: false,
    accessory: 'bandage',
    particleColor: 0x90caf9,
    particleType: 'sweat',
  },
  {
    id: 'cool',
    emoji: 'face-cool',
    label: '耍酷',
    color: 0xee4444,
    leafColor: 0x2ed573,
    eyeStyle: 'wink',
    mouthStyle: 'smile',
    blush: false,
    accessory: 'glasses',
    particleType: 'none',
  },
]

export interface StoryChapter {
  title: string
  body: string
  emotion: string
}

export const chapters: StoryChapter[] = [
  {
    title: '厨房的早晨',
    body: 'TOMO 醒来，发现自己又躺在砧板旁边。"今天一定要逃出去！"它暗暗发誓。',
    emotion: 'idle',
  },
  {
    title: '不速之客',
    body: '一只大手伸了过来，TOMO 吓得整颗番茄都红了。"别碰我！我还没熟透！"',
    emotion: 'shy',
  },
  {
    title: '砧板上的怒火',
    body: '被放上了砧板，TOMO 怒视着那把闪亮的菜刀。"你以为我会乖乖就范吗？"',
    emotion: 'angry',
  },
  {
    title: '迷茫的十字路口',
    body: '左边是炒锅，右边是沙拉碗。TOMO 站在灶台上，不知道该往哪跑。',
    emotion: 'confused',
  },
  {
    title: '被夸奖了',
    body: '"哇，这颗番茄好红好饱满！"厨师赞叹道。TOMO 不好意思地红了脸。',
    emotion: 'flattered',
  },
  {
    title: '失足坠落',
    body: '砧板一滑，TOMO 滚下了台面。"啊啊啊啊——"泪水喷涌而出。',
    emotion: 'crying',
  },
  {
    title: '角落里的悲伤',
    body: 'TOMO 躲在冰箱脚下的阴影里，想着自己渺小的番茄人生。',
    emotion: 'sad',
  },
  {
    title: '感冒了',
    body: '地板太凉，TOMO 打了个喷嚏，额头上搭着一块冷敷巾。',
    emotion: 'sick',
  },
  {
    title: '涅槃重生',
    body: 'TOMO 戴上一副橙黄色大框眼镜，站了起来。"从今天起，我不做食材，我做自己。"',
    emotion: 'cool',
  },
  {
    title: 'TOMO 的世界',
    body: '这颗有情绪的番茄，终于找到了自己的路。它的故事，才刚刚开始。',
    emotion: 'idle',
  },
]
