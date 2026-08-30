import * as THREE from 'three'
import { DraggableItem } from './DraggableItem'

/**
 * 3D 周边模型 - 真正立体造型的周边（非平面贴图）
 * 冰箱贴 / 亚克力钥匙扣 / 徽章别针 / 迷你手办
 */

// ── 通用：绘制番茄脸部纹理 ──
function createTomatoFaceTexture(size = 256, opts: { eyes?: 'normal' | 'happy'; blush?: boolean } = {}): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2, cy = size / 2 + size * 0.05
  const r = size * 0.42

  // 番茄身体
  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r)
  grad.addColorStop(0, '#ff7878')
  grad.addColorStop(1, '#ee4444')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // 叶子
  ctx.fillStyle = '#2ed573'
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2
    const lx = cx + Math.cos(a) * r * 0.2
    const ly = cy - r + r * 0.1 + Math.sin(a) * r * 0.15
    ctx.beginPath()
    ctx.moveTo(lx, ly - r * 0.32)
    ctx.lineTo(lx - r * 0.13, ly + r * 0.04)
    ctx.lineTo(lx + r * 0.13, ly + r * 0.04)
    ctx.closePath()
    ctx.fill()
  }

  // 表情
  ctx.fillStyle = '#2a1810'
  const eyeY = cy - r * 0.05
  const eyeOff = r * 0.28
  if (opts.eyes === 'happy') {
    ctx.strokeStyle = '#2a1810'
    ctx.lineWidth = r * 0.08
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(cx - eyeOff, eyeY + r * 0.05, r * 0.1, Math.PI * 1.2, Math.PI * 1.8)
    ctx.arc(cx + eyeOff, eyeY + r * 0.05, r * 0.1, Math.PI * 1.2, Math.PI * 1.8)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.arc(cx - eyeOff, eyeY, r * 0.09, 0, Math.PI * 2)
    ctx.arc(cx + eyeOff, eyeY, r * 0.09, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(cx - eyeOff + r * 0.03, eyeY - r * 0.03, r * 0.03, 0, Math.PI * 2)
    ctx.arc(cx + eyeOff + r * 0.03, eyeY - r * 0.03, r * 0.03, 0, Math.PI * 2)
    ctx.fill()
  }
  if (opts.blush) {
    ctx.fillStyle = 'rgba(255,155,179,0.5)'
    ctx.beginPath()
    ctx.arc(cx - r * 0.38, cy + r * 0.1, r * 0.09, 0, Math.PI * 2)
    ctx.arc(cx + r * 0.38, cy + r * 0.1, r * 0.09, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.strokeStyle = '#2a1810'
  ctx.lineWidth = r * 0.06
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(cx, cy + r * 0.2, r * 0.18, Math.PI * 0.15, Math.PI * 0.85)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ── 1. 3D 冰箱贴：厚实圆角番茄形状磁铁 ──
export function createMagnet3D(x: number, z: number): DraggableItem {
  const group = new THREE.Group()
  const faceTex = createTomatoFaceTexture(256, { eyes: 'happy', blush: true })

  // 主体：压扁的圆柱（厚磁铁质感）
  const bodyGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.045, 24)
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xee4444, roughness: 0.35, metalness: 0.1 })
  const body = new THREE.Mesh(bodyGeo, bodyMat)
  body.castShadow = true
  group.add(body)

  // 正面贴图
  const faceGeo = new THREE.CircleGeometry(0.135, 24)
  const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.4 })
  const face = new THREE.Mesh(faceGeo, faceMat)
  face.rotation.x = -Math.PI / 2
  face.position.y = 0.0226
  group.add(face)

  // 背面磁铁灰色
  const backMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.6, metalness: 0.4 })
  const back = new THREE.Mesh(faceGeo.clone(), backMat)
  back.rotation.x = Math.PI / 2
  back.position.y = -0.0226
  group.add(back)

  // 顶部叶子造型缺口装饰（小绿点）
  const leafDot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), new THREE.MeshStandardMaterial({ color: 0x2ed573, roughness: 0.5 }))
  leafDot.position.set(0, 0.03, 0.11)
  group.add(leafDot)

  const item = new DraggableItem(group, x, 0.045, z)
  item.boundsX = [-1.7, 1.7]
  item.boundsZ = [-1.0, 1.3]
  return item
}

// ── 2. 3D 亚克力钥匙扣：双层透明亚克力 + 金属圆环 ──
export function createAcrylicKeychain3D(x: number, z: number): DraggableItem {
  const group = new THREE.Group()
  const faceTex = createTomatoFaceTexture(256, { eyes: 'normal', blush: true })

  // 主亚克力层
  const plateGeo = new THREE.BoxGeometry(0.22, 0.008, 0.22)
  const plateMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.05, metalness: 0,
    transmission: 0.85, thickness: 0.5, transparent: true, opacity: 0.95,
  })
  const plate = new THREE.Mesh(plateGeo, plateMat)
  plate.castShadow = true
  group.add(plate)

  // 番茄图案（浮在亚克力表面）
  const imgGeo = new THREE.CircleGeometry(0.09, 20)
  const imgMat = new THREE.MeshStandardMaterial({ map: faceTex, transparent: true, roughness: 0.3 })
  const img = new THREE.Mesh(imgGeo, imgMat)
  img.rotation.x = -Math.PI / 2
  img.position.y = 0.006
  group.add(img)

  // 顶部金属圆环孔
  const ringGeo = new THREE.TorusGeometry(0.015, 0.004, 8, 16)
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c8, roughness: 0.2, metalness: 0.8 })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.position.set(0, 0.005, -0.11)
  ring.rotation.x = Math.PI / 2
  group.add(ring)

  // 小链条
  for (let i = 0; i < 3; i++) {
    const linkGeo = new THREE.TorusGeometry(0.008, 0.002, 6, 10)
    const link = new THREE.Mesh(linkGeo, ringMat)
    link.position.set(0, 0.01 + i * 0.012, -0.135 - i * 0.008)
    link.rotation.x = i % 2 === 0 ? 0 : Math.PI / 2
    group.add(link)
  }

  const item = new DraggableItem(group, x, 0.01, z)
  item.boundsX = [-1.7, 1.7]
  item.boundsZ = [-1.0, 1.3]
  return item
}

// ── 3. 3D 徽章别针：珐琅质感圆形徽章 + 别针 ──
export function createEnamelPin3D(x: number, z: number): DraggableItem {
  const group = new THREE.Group()
  const faceTex = createTomatoFaceTexture(256, { eyes: 'happy', blush: false })

  // 金色外圈
  const rimGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.015, 32)
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.25, metalness: 0.75 })
  const rim = new THREE.Mesh(rimGeo, rimMat)
  rim.castShadow = true
  group.add(rim)

  // 珐琅内圈（略凹陷+光泽）
  const innerGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.012, 32)
  const innerMat = new THREE.MeshStandardMaterial({ color: 0xfff8e0, roughness: 0.15, metalness: 0.1 })
  const inner = new THREE.Mesh(innerGeo, innerMat)
  inner.position.y = 0.002
  group.add(inner)

  // 番茄图案
  const faceGeo = new THREE.CircleGeometry(0.075, 20)
  const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.2 })
  const face = new THREE.Mesh(faceGeo, faceMat)
  face.rotation.x = -Math.PI / 2
  face.position.y = 0.009
  group.add(face)

  // 背后别针（简化为一根细杆+夹子）
  const pinBarGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.14, 6)
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c8, roughness: 0.3, metalness: 0.7 })
  const pinBar = new THREE.Mesh(pinBarGeo, pinMat)
  pinBar.rotation.z = Math.PI / 2
  pinBar.position.set(0, -0.008, 0.02)
  group.add(pinBar)

  const item = new DraggableItem(group, x, 0.015, z)
  item.boundsX = [-1.7, 1.7]
  item.boundsZ = [-1.0, 1.3]
  return item
}

// ── 4. 3D 迷你手办：不同姿势的立体 TOMO 摆件 + 展示底座 ──
export function createMiniFigure3D(x: number, z: number, pose: 'wave' | 'sit' | 'jump' = 'wave'): DraggableItem {
  const group = new THREE.Group()

  // 展示底座
  const baseGeo = new THREE.CylinderGeometry(0.13, 0.14, 0.025, 20)
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xf5ead0, roughness: 0.5 })
  const base = new THREE.Mesh(baseGeo, baseMat)
  base.castShadow = true
  base.receiveShadow = true
  group.add(base)

  // 底座文字环（用一个细金色圆环代替）
  const trimGeo = new THREE.TorusGeometry(0.135, 0.005, 6, 24)
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xc8884a, roughness: 0.4, metalness: 0.3 })
  const trim = new THREE.Mesh(trimGeo, trimMat)
  trim.rotation.x = Math.PI / 2
  trim.position.y = 0.013
  group.add(trim)

  // TOMO 身体 - 压扁球体
  const bodyGeo = new THREE.SphereGeometry(0.09, 14, 12)
  const positions = bodyGeo.attributes.position
  for (let i = 0; i < positions.count; i++) {
    positions.setY(i, positions.getY(i) * 0.9)
  }
  bodyGeo.computeVertexNormals()
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xee4444, roughness: 0.4, flatShading: true })
  const body = new THREE.Mesh(bodyGeo, bodyMat)
  body.position.y = 0.11
  body.castShadow = true
  group.add(body)

  // 叶子
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const leafGeo = new THREE.ConeGeometry(0.014, 0.04, 4)
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2ed573, roughness: 0.5, flatShading: true })
    const leaf = new THREE.Mesh(leafGeo, leafMat)
    leaf.position.set(Math.cos(a) * 0.02, 0.19, Math.sin(a) * 0.02)
    leaf.rotation.z = -0.3
    leaf.rotation.y = a
    group.add(leaf)
  }

  // 面部贴图
  const faceTex = createTomatoFaceTexture(256, { eyes: pose === 'jump' ? 'happy' : 'normal', blush: true })
  const faceGeo = new THREE.PlaneGeometry(0.09, 0.09)
  const faceMat = new THREE.MeshBasicMaterial({ map: faceTex, transparent: true })
  const face = new THREE.Mesh(faceGeo, faceMat)
  face.position.set(0, 0.11, 0.082)
  group.add(face)

  // 姿势差异化：手臂
  const armMat = new THREE.MeshStandardMaterial({ color: 0xee4444, roughness: 0.4, flatShading: true })
  const armGeo = new THREE.CapsuleGeometry(0.012, 0.05, 4, 6)
  if (pose === 'wave') {
    const arm = new THREE.Mesh(armGeo, armMat)
    arm.position.set(0.09, 0.15, 0)
    arm.rotation.z = -0.8
    group.add(arm)
    const arm2 = new THREE.Mesh(armGeo.clone(), armMat)
    arm2.position.set(-0.08, 0.08, 0)
    arm2.rotation.z = 0.3
    group.add(arm2)
  } else if (pose === 'jump') {
    const arm = new THREE.Mesh(armGeo, armMat)
    arm.position.set(0.07, 0.17, 0)
    arm.rotation.z = -1.2
    group.add(arm)
    const arm2 = new THREE.Mesh(armGeo.clone(), armMat)
    arm2.position.set(-0.07, 0.17, 0)
    arm2.rotation.z = 1.2
    group.add(arm2)
    body.position.y = 0.14  // 跳起来
  } else {
    // sit
    const arm = new THREE.Mesh(armGeo, armMat)
    arm.scale.set(1, 0.6, 1)
    arm.position.set(0.08, 0.06, 0)
    arm.rotation.z = -0.5
    group.add(arm)
  }

  const item = new DraggableItem(group, x, 0.0125, z)
  item.boundsX = [-1.7, 1.7]
  item.boundsZ = [-1.0, 1.3]
  return item
}
