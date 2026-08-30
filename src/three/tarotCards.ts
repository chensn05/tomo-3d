import * as THREE from 'three'

export interface TarotCardData {
  number: string
  name: string
  nameEn: string
  keyword: string
  desc: string
  isReversed: boolean
}

/**
 * 用 Canvas 绘制塔罗牌牌面
 * 每张牌有独特的符号图案
 */
export function drawTarotCard(canvas: HTMLCanvasElement, card: TarotCardData): void {
  const ctx = canvas.getContext('2d')!
  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)

  // 牌面背景 - 提亮
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h)
  bgGrad.addColorStop(0, '#2a1a4e')
  bgGrad.addColorStop(0.5, '#1e2d5e')
  bgGrad.addColorStop(1, '#1a3a70')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, w, h)

  // 边框
  ctx.strokeStyle = '#b8a9fe'
  ctx.lineWidth = 2
  ctx.strokeRect(6, 6, w - 12, h - 12)

  // 内边框装饰
  ctx.strokeStyle = 'rgba(184,169,254,0.4)'
  ctx.lineWidth = 1
  ctx.strokeRect(12, 12, w - 24, h - 24)

  // 四角装饰
  drawCorner(ctx, 12, 12, 1, 1)
  drawCorner(ctx, w - 12, 12, -1, 1)
  drawCorner(ctx, 12, h - 12, 1, -1)
  drawCorner(ctx, w - 12, h - 12, -1, -1)

  // 牌号
  ctx.fillStyle = '#c8b8fe'
  ctx.font = 'bold 14px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(card.number, w / 2, 30)

  // 主图案
  drawCardSymbol(ctx, card.number, w / 2, h / 2, Math.min(w, h) * 0.3)

  // 牌名
  ctx.fillStyle = '#f0eaff'
  ctx.font = 'bold 18px "PingFang SC", serif'
  ctx.textAlign = 'center'
  ctx.fillText(card.name, w / 2, h - 42)

  // 英文名
  ctx.fillStyle = 'rgba(200,190,255,0.6)'
  ctx.font = '10px Georgia, serif'
  ctx.fillText(card.nameEn, w / 2, h - 26)

  // 关键词
  ctx.fillStyle = 'rgba(184,169,254,0.8)'
  ctx.font = '10px "PingFang SC"'
  ctx.fillText(card.keyword, w / 2, h - 14)

  // 逆位标记
  if (card.isReversed) {
    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.rotate(Math.PI)
    ctx.translate(-w / 2, -h / 2)
    // 重绘一遍内容（旋转）
    ctx.restore()
    // 在牌角画逆位标记
    ctx.fillStyle = '#ff6b6b'
    ctx.font = 'bold 10px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('逆', 18, 24)
  }
}

function drawCorner(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number) {
  ctx.strokeStyle = '#a29bfe'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x, y + dy * 8)
  ctx.lineTo(x, y)
  ctx.lineTo(x + dx * 8, y)
  ctx.stroke()
  // 小星
  ctx.fillStyle = 'rgba(162,155,254,0.4)'
  ctx.beginPath()
  ctx.arc(x + dx * 4, y + dy * 4, 1.5, 0, Math.PI * 2)
  ctx.fill()
}

function drawCardSymbol(ctx: CanvasRenderingContext2D, number: string, cx: number, cy: number, r: number) {
  ctx.save()
  ctx.translate(cx, cy)

  const drawStar = (size: number, color: string) => {
    ctx.fillStyle = color
    ctx.beginPath()
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 - Math.PI / 2
      const rad = i % 2 === 0 ? size : size * 0.4
      const x = Math.cos(angle) * rad
      const y = Math.sin(angle) * rad
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fill()
  }

  const drawCircle = (rad: number, color: string, fill = false) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(0, 0, rad, 0, Math.PI * 2)
    if (fill) { ctx.fillStyle = color; ctx.fill() }
    ctx.stroke()
  }

  const drawSun = (size: number) => {
    // 中心圆
    drawCircle(size * 0.3, '#ffd700', true)
    // 光线
    ctx.strokeStyle = '#ffd700'
    ctx.lineWidth = 2
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * size * 0.35, Math.sin(a) * size * 0.35)
      ctx.lineTo(Math.cos(a) * size * 0.6, Math.sin(a) * size * 0.6)
      ctx.stroke()
    }
  }

  const drawMoon = (size: number) => {
    ctx.fillStyle = '#c8d6e5'
    ctx.beginPath()
    ctx.arc(0, 0, size * 0.4, Math.PI * 0.25, Math.PI * 1.75)
    ctx.arc(size * 0.12, 0, size * 0.35, Math.PI * 1.75, Math.PI * 0.25, true)
    ctx.closePath()
    ctx.fill()
  }

  switch (number) {
    case '0': // 愚者 - 崖边小人
      ctx.fillStyle = '#74b9ff'
      // 山崖
      ctx.beginPath()
      ctx.moveTo(-r * 0.5, r * 0.3)
      ctx.lineTo(-r * 0.2, -r * 0.2)
      ctx.lineTo(r * 0.1, r * 0.3)
      ctx.closePath()
      ctx.fill()
      // 小人
      ctx.fillStyle = '#fdcb6e'
      ctx.beginPath()
      ctx.arc(0, -r * 0.3, r * 0.08, 0, Math.PI * 2) // 头
      ctx.fill()
      ctx.fillRect(-r * 0.04, -r * 0.22, r * 0.08, r * 0.2) // 身体
      // 太阳
      drawCircle(r * 0.5, '#ffd700')
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.arc(r * 0.5, -r * 0.4, r * 0.08, 0, Math.PI * 2)
      ctx.fill()
      break

    case 'I': // 魔术师 - 无限符号+四元素
      ctx.strokeStyle = '#a29bfe'
      ctx.lineWidth = 3
      // 无限符号
      ctx.beginPath()
      ctx.ellipse(-r * 0.2, -r * 0.2, r * 0.15, r * 0.08, 0, 0, Math.PI * 2)
      ctx.ellipse(r * 0.2, -r * 0.2, r * 0.15, r * 0.08, 0, 0, Math.PI * 2)
      ctx.stroke()
      // 四元素符号
      ctx.fillStyle = '#e17055'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('⚔', 0, r * 0.2)  // 宝剑
      ctx.fillText('🜁', -r * 0.3, r * 0.2) // 风
      ctx.fillText('🜃', r * 0.3, r * 0.2) // 水
      // 桌面线
      ctx.strokeStyle = '#636e72'
      ctx.beginPath()
      ctx.moveTo(-r * 0.5, r * 0.05)
      ctx.lineTo(r * 0.5, r * 0.05)
      ctx.stroke()
      break

    case 'II': // 女祭司 - 柱子+月亮
      // 两根柱子
      ctx.fillStyle = '#2d3436'
      ctx.fillRect(-r * 0.45, -r * 0.3, r * 0.1, r * 0.6)
      ctx.fillStyle = '#dfe6e9'
      ctx.fillRect(r * 0.35, -r * 0.3, r * 0.1, r * 0.6)
      // 中间月亮
      drawMoon(r * 0.25)
      // 面纱
      ctx.strokeStyle = 'rgba(162,155,254,0.3)'
      ctx.lineWidth = 1
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.moveTo(-r * 0.3 + i * r * 0.15, -r * 0.25)
        ctx.lineTo(-r * 0.3 + i * r * 0.15, r * 0.25)
        ctx.stroke()
      }
      break

    case 'III': // 皇后 - 王冠+麦穗
      // 王冠
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.moveTo(-r * 0.2, -r * 0.3)
      ctx.lineTo(-r * 0.15, -r * 0.45)
      ctx.lineTo(-r * 0.05, -r * 0.35)
      ctx.lineTo(r * 0.05, -r * 0.45)
      ctx.lineTo(r * 0.15, -r * 0.35)
      ctx.lineTo(r * 0.2, -r * 0.3)
      ctx.closePath()
      ctx.fill()
      // 心形
      ctx.fillStyle = '#e84393'
      drawHeart(ctx, 0, 0, r * 0.2)
      // 麦穗
      ctx.strokeStyle = '#f39c12'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(-r * 0.35, r * 0.15)
      ctx.lineTo(-r * 0.35, r * 0.4)
      ctx.moveTo(r * 0.35, r * 0.15)
      ctx.lineTo(r * 0.35, r * 0.4)
      ctx.stroke()
      break

    case 'IV': // 皇帝 - 王座+十字球
      // 王座
      ctx.fillStyle = '#6c5ce7'
      ctx.fillRect(-r * 0.3, -r * 0.1, r * 0.6, r * 0.4)
      ctx.fillStyle = '#a29bfe'
      ctx.fillRect(-r * 0.35, -r * 0.35, r * 0.7, r * 0.1)
      // 十字球
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.arc(0, -r * 0.2, r * 0.08, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#ffd700'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, -r * 0.28)
      ctx.lineTo(0, -r * 0.12)
      ctx.moveTo(-r * 0.08, -r * 0.2)
      ctx.lineTo(r * 0.08, -r * 0.2)
      ctx.stroke()
      // 羊角
      ctx.strokeStyle = '#dfe6e9'
      ctx.beginPath()
      ctx.moveTo(-r * 0.35, -r * 0.3)
      ctx.arc(-r * 0.4, -r * 0.3, r * 0.06, 0, Math.PI, true)
      ctx.moveTo(r * 0.35, -r * 0.3)
      ctx.arc(r * 0.4, -r * 0.3, r * 0.06, 0, Math.PI, true)
      ctx.stroke()
      break

    case 'V': // 教皇 - 三重冠+钥匙
      // 三重冠
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.moveTo(-r * 0.15, -r * 0.35)
      ctx.lineTo(r * 0.15, -r * 0.35)
      ctx.lineTo(r * 0.1, -r * 0.25)
      ctx.lineTo(-r * 0.1, -r * 0.25)
      ctx.closePath()
      ctx.fill()
      ctx.fillRect(-r * 0.12, -r * 0.45, r * 0.24, r * 0.12)
      // 权杖
      ctx.strokeStyle = '#ffd700'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(0, -r * 0.2)
      ctx.lineTo(0, r * 0.3)
      ctx.stroke()
      // 横杆
      ctx.beginPath()
      ctx.moveTo(-r * 0.15, 0)
      ctx.lineTo(r * 0.15, 0)
      ctx.stroke()
      break

    case 'VI': // 恋人 - 双心+天使
      // 天使翅膀
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.beginPath()
      ctx.ellipse(-r * 0.2, -r * 0.3, r * 0.15, r * 0.08, -0.3, 0, Math.PI * 2)
      ctx.ellipse(r * 0.2, -r * 0.3, r * 0.15, r * 0.08, 0.3, 0, Math.PI * 2)
      ctx.fill()
      // 太阳
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.arc(0, -r * 0.3, r * 0.06, 0, Math.PI * 2)
      ctx.fill()
      // 双心
      ctx.fillStyle = '#e84393'
      drawHeart(ctx, -r * 0.15, r * 0.1, r * 0.12)
      drawHeart(ctx, r * 0.15, r * 0.1, r * 0.12)
      break

    case 'VII': // 战车 - 车轮+星
      // 战车主体
      ctx.fillStyle = '#6c5ce7'
      ctx.fillRect(-r * 0.3, -r * 0.1, r * 0.6, r * 0.25)
      // 顶篷
      ctx.fillStyle = '#a29bfe'
      ctx.beginPath()
      ctx.moveTo(-r * 0.2, -r * 0.1)
      ctx.lineTo(0, -r * 0.3)
      ctx.lineTo(r * 0.2, -r * 0.1)
      ctx.closePath()
      ctx.fill()
      // 车轮
      ctx.strokeStyle = '#ffd700'
      ctx.lineWidth = 2
      for (const wx of [-r * 0.22, r * 0.22]) {
        ctx.beginPath()
        ctx.arc(wx, r * 0.25, r * 0.1, 0, Math.PI * 2)
        ctx.stroke()
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI
          ctx.beginPath()
          ctx.moveTo(wx, r * 0.25)
          ctx.lineTo(wx + Math.cos(a) * r * 0.1, r * 0.25 + Math.sin(a) * r * 0.1)
          ctx.stroke()
        }
      }
      break

    case 'VIII': // 力量 - 无限符号+狮子
      // 无限符号
      ctx.strokeStyle = '#e17055'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.ellipse(-r * 0.15, -r * 0.2, r * 0.1, r * 0.06, 0, 0, Math.PI * 2)
      ctx.ellipse(r * 0.15, -r * 0.2, r * 0.1, r * 0.06, 0, 0, Math.PI * 2)
      ctx.stroke()
      // 狮子头
      ctx.fillStyle = '#f39c12'
      ctx.beginPath()
      ctx.arc(0, r * 0.15, r * 0.2, 0, Math.PI * 2)
      ctx.fill()
      // 鬃毛
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * r * 0.2, r * 0.15 + Math.sin(a) * r * 0.2)
        ctx.lineTo(Math.cos(a) * r * 0.3, r * 0.15 + Math.sin(a) * r * 0.3)
        ctx.stroke()
      }
      break

    case 'IX': // 隐士 - 提灯
      // 人形
      ctx.fillStyle = '#636e72'
      ctx.beginPath()
      ctx.arc(0, -r * 0.3, r * 0.06, 0, Math.PI * 2) // 头
      ctx.fill()
      ctx.fillRect(-r * 0.05, -r * 0.24, r * 0.1, r * 0.3) // 袍
      // 灯
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.arc(r * 0.15, r * 0.05, r * 0.08, 0, Math.PI * 2)
      ctx.fill()
      // 光芒
      ctx.strokeStyle = 'rgba(255,215,0,0.3)'
      ctx.lineWidth = 1
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(r * 0.15 + Math.cos(a) * r * 0.1, r * 0.05 + Math.sin(a) * r * 0.1)
        ctx.lineTo(r * 0.15 + Math.cos(a) * r * 0.2, r * 0.05 + Math.sin(a) * r * 0.2)
        ctx.stroke()
      }
      break

    case 'X': // 命运之轮
      // 大轮
      ctx.strokeStyle = '#ffd700'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2)
      ctx.stroke()
      // 内轮
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2)
      ctx.stroke()
      // 辐条
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4)
        ctx.stroke()
      }
      // 中心
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.05, 0, Math.PI * 2)
      ctx.fill()
      break

    case 'XI': // 正义 - 天平+剑
      // 天平横杆
      ctx.strokeStyle = '#dfe6e9'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-r * 0.3, -r * 0.1)
      ctx.lineTo(r * 0.3, -r * 0.1)
      ctx.stroke()
      // 中柱
      ctx.beginPath()
      ctx.moveTo(0, -r * 0.1)
      ctx.lineTo(0, r * 0.3)
      ctx.stroke()
      // 天平盘
      ctx.fillStyle = 'rgba(223,230,233,0.3)'
      ctx.beginPath()
      ctx.arc(-r * 0.2, r * 0.05, r * 0.08, 0, Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(r * 0.2, r * 0.05, r * 0.08, 0, Math.PI)
      ctx.fill()
      // 剑
      ctx.strokeStyle = '#74b9ff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, r * 0.3)
      ctx.lineTo(0, r * 0.45)
      ctx.stroke()
      break

    case 'XII': // 倒吊人 - 倒T
      // 横杆
      ctx.strokeStyle = '#636e72'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(-r * 0.3, -r * 0.3)
      ctx.lineTo(r * 0.3, -r * 0.3)
      ctx.stroke()
      // 竖杆
      ctx.beginPath()
      ctx.moveTo(0, -r * 0.3)
      ctx.lineTo(0, r * 0.2)
      ctx.stroke()
      // 倒挂人
      ctx.fillStyle = '#fdcb6e'
      ctx.beginPath()
      ctx.arc(0, r * 0.1, r * 0.05, 0, Math.PI * 2) // 头(朝下)
      ctx.fill()
      ctx.strokeStyle = '#fdcb6e'
      ctx.lineWidth = 2
      ctx.beginPath()
      // 手臂
      ctx.moveTo(0, r * 0.05)
      ctx.lineTo(-r * 0.15, -r * 0.1)
      ctx.moveTo(0, r * 0.05)
      ctx.lineTo(r * 0.15, -r * 0.1)
      ctx.stroke()
      // 光环
      ctx.strokeStyle = 'rgba(255,215,0,0.4)'
      ctx.beginPath()
      ctx.arc(0, r * 0.1, r * 0.08, 0, Math.PI * 2)
      ctx.stroke()
      break

    case 'XIII': // 死神 - 骷髅+镰刀
      // 镰刀
      ctx.strokeStyle = '#dfe6e9'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(-r * 0.2, r * 0.3)
      ctx.lineTo(r * 0.2, r * 0.3)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, r * 0.15, r * 0.25, 0, Math.PI, true)
      ctx.stroke()
      // 骷髅
      ctx.fillStyle = '#dfe6e9'
      ctx.beginPath()
      ctx.arc(0, -r * 0.1, r * 0.12, 0, Math.PI * 2)
      ctx.fill()
      // 眼窝
      ctx.fillStyle = '#1a0a0a'
      ctx.beginPath()
      ctx.arc(-r * 0.05, -r * 0.12, r * 0.03, 0, Math.PI * 2)
      ctx.arc(r * 0.05, -r * 0.12, r * 0.03, 0, Math.PI * 2)
      ctx.fill()
      // 黑旗
      ctx.fillStyle = '#2d3436'
      ctx.fillRect(-r * 0.08, -r * 0.35, r * 0.16, r * 0.1)
      break

    case 'XIV': // 节制 - 天使+双杯
      // 天使翅膀
      ctx.fillStyle = 'rgba(162,155,254,0.2)'
      ctx.beginPath()
      ctx.ellipse(-r * 0.2, 0, r * 0.1, r * 0.25, -0.2, 0, Math.PI * 2)
      ctx.ellipse(r * 0.2, 0, r * 0.1, r * 0.25, 0.2, 0, Math.PI * 2)
      ctx.fill()
      // 双杯+水流
      ctx.fillStyle = '#74b9ff'
      ctx.beginPath()
      ctx.arc(-r * 0.15, r * 0.1, r * 0.05, 0, Math.PI * 2)
      ctx.arc(r * 0.15, r * 0.1, r * 0.05, 0, Math.PI * 2)
      ctx.fill()
      // 水流
      ctx.strokeStyle = '#74b9ff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-r * 0.15, r * 0.15)
      ctx.quadraticCurveTo(0, r * 0.25, r * 0.15, r * 0.15)
      ctx.stroke()
      // 太阳
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.arc(0, -r * 0.3, r * 0.08, 0, Math.PI * 2)
      ctx.fill()
      break

    case 'XV': // 恶魔 - 倒五芒星+锁链
      // 倒五芒星
      ctx.strokeStyle = '#e84393'
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + Math.PI / 2 + Math.PI // 倒置
        const x = Math.cos(a) * r * 0.35
        const y = Math.sin(a) * r * 0.35
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
        const nextA = ((i + 2) / 5) * Math.PI * 2 + Math.PI / 2 + Math.PI
        ctx.lineTo(Math.cos(nextA) * r * 0.35, Math.sin(nextA) * r * 0.35)
      }
      ctx.closePath()
      ctx.stroke()
      // 锁链
      ctx.strokeStyle = '#636e72'
      ctx.lineWidth = 1.5
      for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        ctx.arc(-r * 0.15 + i * r * 0.1, r * 0.3, r * 0.04, 0, Math.PI * 2)
        ctx.stroke()
      }
      break

    case 'XVI': // 高塔 - 塔楼+闪电
      // 塔楼
      ctx.fillStyle = '#636e72'
      ctx.fillRect(-r * 0.15, -r * 0.1, r * 0.3, r * 0.4)
      // 顶部
      ctx.fillStyle = '#a29bfe'
      ctx.beginPath()
      ctx.moveTo(-r * 0.18, -r * 0.1)
      ctx.lineTo(0, -r * 0.25)
      ctx.lineTo(r * 0.18, -r * 0.1)
      ctx.closePath()
      ctx.fill()
      // 闪电
      ctx.strokeStyle = '#ffd700'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(r * 0.1, -r * 0.4)
      ctx.lineTo(-r * 0.05, -r * 0.15)
      ctx.lineTo(r * 0.02, -r * 0.1)
      ctx.lineTo(-r * 0.1, r * 0.1)
      ctx.stroke()
      // 窗户
      ctx.fillStyle = '#ffd700'
      ctx.fillRect(-r * 0.04, 0, r * 0.08, r * 0.06)
      break

    case 'XVII': // 星星 - 大星+小星
      // 大星
      drawStar(r * 0.15, '#ffd700')
      // 七个小星
      const smallPositions = [
        [-0.25, -0.2], [0.25, -0.2], [-0.3, 0.05], [0.3, 0.05],
        [-0.15, 0.2], [0.15, 0.2], [0, 0.3]
      ]
      smallPositions.forEach(([px, py]) => {
        drawStar(r * 0.05, '#a29bfe')
        ctx.translate(0, 0) // positions handled manually
      })
      // 水波
      ctx.strokeStyle = '#74b9ff'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      for (let x = -r * 0.3; x <= r * 0.3; x += r * 0.05) {
        ctx.lineTo(x, r * 0.35 + Math.sin(x * 0.05) * 3)
      }
      ctx.stroke()
      break

    case 'XVIII': // 月亮 - 月+双塔
      // 月亮
      ctx.fillStyle = '#dfe6e9'
      ctx.beginPath()
      ctx.arc(0, -r * 0.2, r * 0.2, 0.3, Math.PI * 2 - 0.3)
      ctx.lineTo(0, -r * 0.2)
      ctx.closePath()
      ctx.fill()
      // 月面
      ctx.fillStyle = '#a29bfe'
      ctx.beginPath()
      ctx.arc(0, -r * 0.2, r * 0.12, 0.3, Math.PI * 2 - 0.3)
      ctx.lineTo(0, -r * 0.2)
      ctx.closePath()
      ctx.fill()
      // 双塔
      ctx.fillStyle = '#2d3436'
      ctx.fillRect(-r * 0.35, r * 0.05, r * 0.08, r * 0.25)
      ctx.fillRect(r * 0.27, r * 0.05, r * 0.08, r * 0.25)
      // 水波
      ctx.strokeStyle = '#74b9ff'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(-r * 0.3, r * 0.35)
      ctx.quadraticCurveTo(-r * 0.15, r * 0.3, 0, r * 0.35)
      ctx.quadraticCurveTo(r * 0.15, r * 0.4, r * 0.3, r * 0.35)
      ctx.stroke()
      break

    case 'XIX': // 太阳
      drawSun(r * 0.35)
      // 笑脸
      ctx.fillStyle = '#1a0a0a'
      ctx.beginPath()
      ctx.arc(-r * 0.06, -r * 0.05, r * 0.02, 0, Math.PI * 2)
      ctx.arc(r * 0.06, -r * 0.05, r * 0.02, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#1a0a0a'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.06, 0.2, Math.PI - 0.2)
      ctx.stroke()
      break

    case 'XX': // 审判 - 天使号角
      // 天使翅膀
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.beginPath()
      ctx.ellipse(-r * 0.2, -r * 0.1, r * 0.12, r * 0.2, -0.2, 0, Math.PI * 2)
      ctx.ellipse(r * 0.2, -r * 0.1, r * 0.12, r * 0.2, 0.2, 0, Math.PI * 2)
      ctx.fill()
      // 号角
      ctx.strokeStyle = '#ffd700'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(-r * 0.1, r * 0.05)
      ctx.lineTo(r * 0.25, r * 0.25)
      ctx.stroke()
      // 号角口
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.ellipse(r * 0.25, r * 0.25, r * 0.06, r * 0.1, 0.5, 0, Math.PI * 2)
      ctx.fill()
      // 光芒
      ctx.strokeStyle = 'rgba(255,215,0,0.3)'
      ctx.lineWidth = 1
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI - Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * r * 0.1, -r * 0.3 + Math.sin(a) * r * 0.1)
        ctx.lineTo(Math.cos(a) * r * 0.3, -r * 0.3 + Math.sin(a) * r * 0.3)
        ctx.stroke()
      }
      break

    case 'XXI': // 世界 - 花环+四元素
      // 花环
      ctx.strokeStyle = '#2ed573'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.ellipse(0, 0, r * 0.35, r * 0.35, 0, 0, Math.PI * 2)
      ctx.stroke()
      // 内圈
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.ellipse(0, 0, r * 0.28, r * 0.28, 0, 0, Math.PI * 2)
      ctx.stroke()
      // 中心人物
      ctx.fillStyle = '#fdcb6e'
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.06, 0, Math.PI * 2)
      ctx.fill()
      // 四角元素
      ctx.fillStyle = '#a29bfe'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('♂', 0, -r * 0.42) // 狮子
      ctx.fillText('♀', 0, r * 0.48) // 牛
      ctx.fillText('☆', -r * 0.45, 0) // 人
      ctx.fillText('🦅', r * 0.45, 0) // 鹰
      break

    default:
      drawStar(r * 0.2, '#a29bfe')
  }

  ctx.restore()
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.beginPath()
  ctx.moveTo(0, size * 0.3)
  ctx.bezierCurveTo(-size, -size * 0.5, -size * 0.5, -size, 0, -size * 0.3)
  ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.5, 0, size * 0.3)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/**
 * 生成牌背图案（用于未翻开的牌）
 */
export function drawCardBack(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')!
  const w = canvas.width
  const h = canvas.height

  // 背景
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, '#1a0a2e')
  grad.addColorStop(1, '#0f3460')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // 边框
  ctx.strokeStyle = '#6c5ce7'
  ctx.lineWidth = 2
  ctx.strokeRect(6, 6, w - 12, h - 12)

  // 中心图案 - 交叉线条+星
  const cx = w / 2
  const cy = h / 2
  const r = Math.min(w, h) * 0.2

  // 菱形
  ctx.strokeStyle = 'rgba(162,155,254,0.4)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx, cy - r)
  ctx.lineTo(cx + r, cy)
  ctx.lineTo(cx, cy + r)
  ctx.lineTo(cx - r, cy)
  ctx.closePath()
  ctx.stroke()

  // 中心星
  ctx.fillStyle = 'rgba(162,155,254,0.3)'
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2
    const rad = i % 2 === 0 ? r * 0.4 : r * 0.15
    const x = cx + Math.cos(angle) * rad
    const y = cy + Math.sin(angle) * rad
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()

  // 四角小菱形
  const corners = [[w * 0.2, h * 0.2], [w * 0.8, h * 0.2], [w * 0.2, h * 0.8], [w * 0.8, h * 0.8]]
  corners.forEach(([x, y]) => {
    ctx.strokeStyle = 'rgba(162,155,254,0.2)'
    ctx.beginPath()
    ctx.moveTo(x, y - 6)
    ctx.lineTo(x + 6, y)
    ctx.lineTo(x, y + 6)
    ctx.lineTo(x - 6, y)
    ctx.closePath()
    ctx.stroke()
  })
}
