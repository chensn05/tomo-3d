import * as THREE from 'three'
import { Emotion } from './emotions'

export type CustomAccessory = 'glasses' | 'sunglasses' | 'hat' | 'bowtie' | 'mustache' | 'headphones' | 'crown'

/**
 * TOMO 3D 番茄角色
 * - 低多边形球体身体
 * - 锥形叶蒂
 * - Canvas 纹理面部表情系统
 * - 自定义配件系统
 */
export class TomoCharacter {
  group = new THREE.Group()

  private body!: THREE.Mesh
  private bodyMaterial!: THREE.MeshStandardMaterial
  private faceCanvas!: HTMLCanvasElement
  private faceCtx!: CanvasRenderingContext2D
  private faceTexture!: THREE.CanvasTexture
  private facePlane!: THREE.Mesh

  private leaves: THREE.Mesh[] = []
  private blushLeft!: THREE.Mesh
  private blushRight!: THREE.Mesh
  private accessoryGroup = new THREE.Group()   // 情绪自带配件
  private customAccessoryGroup = new THREE.Group() // 用户自定义配件

  private currentEmotion: Emotion | null = null
  private breathPhase = 0
  private emotionTransition = 0

  // 自定义配件状态
  private activeCustomAccessories = new Set<CustomAccessory>()

  async init() {
    this.createFaceCanvas()
    this.createBody()
    this.createLeaves()
    this.createBlush()
    this.createFacePlane()
    this.group.add(this.accessoryGroup)
    this.group.add(this.customAccessoryGroup)
  }

  private createFaceCanvas() {
    this.faceCanvas = document.createElement('canvas')
    this.faceCanvas.width = 512
    this.faceCanvas.height = 512
    this.faceCtx = this.faceCanvas.getContext('2d')!
    this.faceTexture = new THREE.CanvasTexture(this.faceCanvas)
    this.faceTexture.colorSpace = THREE.SRGBColorSpace
  }

  private createBody() {
    const geo = new THREE.SphereGeometry(0.8, 12, 10)
    const positions = geo.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i)
      positions.setY(i, y * 0.85)
    }
    geo.computeVertexNormals()

    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xee4444,
      roughness: 0.45,
      metalness: 0.05,
      flatShading: true,
    })

    this.body = new THREE.Mesh(geo, this.bodyMaterial)
    this.body.castShadow = true
    this.body.receiveShadow = true
    this.group.add(this.body)
  }

  private createLeaves() {
    const leafCount = 5
    for (let i = 0; i < leafCount; i++) {
      const angle = (i / leafCount) * Math.PI * 2
      const leafGeo = new THREE.ConeGeometry(0.12, 0.35, 4)
      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x2ed573,
        roughness: 0.6,
        flatShading: true,
      })
      const leaf = new THREE.Mesh(leafGeo, leafMat)
      leaf.position.set(
        Math.cos(angle) * 0.18,
        0.75,
        Math.sin(angle) * 0.18
      )
      leaf.rotation.z = -0.3
      leaf.rotation.y = angle
      leaf.castShadow = true
      this.leaves.push(leaf)
      this.group.add(leaf)
    }

    const stemGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.12, 6)
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x1ea85b,
      roughness: 0.7,
      flatShading: true,
    })
    const stem = new THREE.Mesh(stemGeo, stemMat)
    stem.position.y = 0.72
    stem.castShadow = true
    this.group.add(stem)
  }

  private createBlush() {
    const blushGeo = new THREE.CircleGeometry(0.1, 16)
    const blushMat = new THREE.MeshBasicMaterial({
      color: 0xff9bb3,
      transparent: true,
      opacity: 0,
    })
    this.blushLeft = new THREE.Mesh(blushGeo, blushMat)
    this.blushLeft.position.set(-0.28, 0.05, 0.72)
    this.blushLeft.visible = false
    this.group.add(this.blushLeft)

    const blushMat2 = new THREE.MeshBasicMaterial({
      color: 0xff9bb3,
      transparent: true,
      opacity: 0,
    })
    this.blushRight = new THREE.Mesh(blushGeo.clone(), blushMat2)
    this.blushRight.position.set(0.28, 0.05, 0.72)
    this.blushRight.visible = false
    this.group.add(this.blushRight)
  }

  private createFacePlane() {
    const geo = new THREE.PlaneGeometry(0.9, 0.9)
    const mat = new THREE.MeshBasicMaterial({
      map: this.faceTexture,
      transparent: true,
    })
    this.facePlane = new THREE.Mesh(geo, mat)
    this.facePlane.position.set(0, 0.05, 0.78)
    this.group.add(this.facePlane)
  }

  setEmotion(emotion: Emotion) {
    this.currentEmotion = emotion
    this.emotionTransition = 1

    this.bodyMaterial.color.setHex(emotion.color)

    this.leaves.forEach(leaf => {
      ;(leaf.material as THREE.MeshStandardMaterial).color.setHex(emotion.leafColor)
    })

    if (emotion.blush) {
      this.blushLeft.visible = true
      this.blushRight.visible = true
      ;(this.blushLeft.material as THREE.MeshBasicMaterial).opacity = 0.6
      ;(this.blushRight.material as THREE.MeshBasicMaterial).opacity = 0.6
    } else {
      ;(this.blushLeft.material as THREE.MeshBasicMaterial).opacity = 0
      ;(this.blushRight.material as THREE.MeshBasicMaterial).opacity = 0
      setTimeout(() => {
        this.blushLeft.visible = false
        this.blushRight.visible = false
      }, 300)
    }

    this.drawFace(emotion)
    this.updateAccessory(emotion)
  }

  private drawFace(emotion: Emotion) {
    const ctx = this.faceCtx
    const w = this.faceCanvas.width
    const h = this.faceCanvas.height

    ctx.clearRect(0, 0, w, h)

    const cx = w / 2
    const cy = h / 2

    const eyeOffsetX = 80
    const eyeY = cy - 40
    const eyeRadius = 24

    this.drawEyes(ctx, emotion, cx, eyeY, eyeOffsetX, eyeRadius)
    this.drawMouth(ctx, emotion, cx, cy + 70)

    this.faceTexture.needsUpdate = true
  }

  private drawEyes(
    ctx: CanvasRenderingContext2D,
    emotion: Emotion,
    cx: number,
    eyeY: number,
    offsetX: number,
    radius: number
  ) {
    ctx.fillStyle = '#1a1a1a'
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 6
    ctx.lineCap = 'round'

    const leftX = cx - offsetX
    const rightX = cx + offsetX

    switch (emotion.eyeStyle) {
      case 'normal':
        ctx.beginPath()
        ctx.arc(leftX, eyeY, radius * 0.5, 0, Math.PI * 2)
        ctx.arc(rightX, eyeY, radius * 0.5, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'happy':
        ctx.lineWidth = 8
        ctx.beginPath()
        ctx.arc(leftX, eyeY + 10, radius * 0.6, Math.PI * 1.2, Math.PI * 1.8)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(rightX, eyeY + 10, radius * 0.6, Math.PI * 1.2, Math.PI * 1.8)
        ctx.stroke()
        break
      case 'angry':
        ctx.lineWidth = 7
        ctx.beginPath()
        ctx.moveTo(leftX - 20, eyeY - 25)
        ctx.lineTo(leftX + 18, eyeY - 12)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(rightX + 20, eyeY - 25)
        ctx.lineTo(rightX - 18, eyeY - 12)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(leftX, eyeY + 5, radius * 0.35, 0, Math.PI * 2)
        ctx.arc(rightX, eyeY + 5, radius * 0.35, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'sleepy':
        ctx.beginPath()
        ctx.arc(leftX, eyeY, radius * 0.5, 0, Math.PI * 2)
        ctx.arc(rightX, eyeY, radius * 0.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.moveTo(leftX - 15, eyeY - 12)
        ctx.lineTo(leftX + 15, eyeY - 8)
        ctx.moveTo(rightX - 15, eyeY - 8)
        ctx.lineTo(rightX + 15, eyeY - 12)
        ctx.stroke()
        break
      case 'wide':
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(leftX, eyeY, radius * 0.7, 0, Math.PI * 2)
        ctx.arc(rightX, eyeY, radius * 0.7, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#1a1a1a'
        ctx.beginPath()
        ctx.arc(leftX, eyeY, radius * 0.3, 0, Math.PI * 2)
        ctx.arc(rightX, eyeY, radius * 0.3, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'x':
        ctx.lineWidth = 7
        const drawX = (x: number, y: number) => {
          ctx.beginPath()
          ctx.moveTo(x - 12, y - 12)
          ctx.lineTo(x + 12, y + 12)
          ctx.moveTo(x + 12, y - 12)
          ctx.lineTo(x - 12, y + 12)
          ctx.stroke()
        }
        drawX(leftX, eyeY)
        drawX(rightX, eyeY)
        break
      case 'wink':
        ctx.beginPath()
        ctx.arc(leftX, eyeY, radius * 0.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.lineWidth = 7
        ctx.beginPath()
        ctx.arc(rightX, eyeY + 10, radius * 0.55, Math.PI * 1.15, Math.PI * 1.85)
        ctx.stroke()
        break
    }
  }

  private drawMouth(
    ctx: CanvasRenderingContext2D,
    emotion: Emotion,
    cx: number,
    mouthY: number
  ) {
    ctx.strokeStyle = '#1a1a1a'
    ctx.fillStyle = '#1a1a1a'
    ctx.lineWidth = 6
    ctx.lineCap = 'round'

    switch (emotion.mouthStyle) {
      case 'smile':
        ctx.beginPath()
        ctx.arc(cx, mouthY - 15, 30, Math.PI * 0.15, Math.PI * 0.85)
        ctx.stroke()
        break
      case 'frown':
        ctx.beginPath()
        ctx.arc(cx, mouthY + 25, 30, Math.PI * 1.15, Math.PI * 1.85)
        ctx.stroke()
        break
      case 'open':
        ctx.beginPath()
        ctx.ellipse(cx, mouthY, 18, 22, 0, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'flat':
        ctx.beginPath()
        ctx.moveTo(cx - 25, mouthY)
        ctx.lineTo(cx + 25, mouthY)
        ctx.stroke()
        break
      case 'shock':
        ctx.beginPath()
        ctx.ellipse(cx, mouthY, 15, 28, 0, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'cry':
        ctx.fillStyle = '#333'
        ctx.beginPath()
        ctx.ellipse(cx, mouthY, 25, 30, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#ff6b6b'
        ctx.beginPath()
        ctx.ellipse(cx, mouthY + 10, 15, 18, 0, 0, Math.PI * 2)
        ctx.fill()
        break
    }
  }

  // ── 情绪自带配件 ──
  private updateAccessory(emotion: Emotion) {
    this.clearGroup(this.accessoryGroup)
    if (!emotion.accessory) return

    switch (emotion.accessory) {
      case 'question':
        this.createTextAccessory('?', 0x64b5f6, 0, 0.6, 0.5)
        break
      case 'glasses':
        this.createEmotionGlasses()
        break
      case 'bandage':
        this.createBandage()
        break
    }
  }

  private clearGroup(group: THREE.Group) {
    while (group.children.length > 0) {
      const child = group.children[0]
      group.remove(child)
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        ;(child.material as THREE.Material).dispose()
      } else if (child instanceof THREE.Sprite) {
        ;(child.material as THREE.SpriteMaterial).dispose()
      }
    }
  }

  private createTextAccessory(text: string, color: number, x: number, y: number, z: number) {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0')
    ctx.font = 'bold 100px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 64, 64)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true })
    const sprite = new THREE.Sprite(mat)
    sprite.position.set(x, y, z)
    sprite.scale.set(0.4, 0.4, 0.4)
    this.accessoryGroup.add(sprite)
  }

  private createEmotionGlasses() {
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xffa500,
      roughness: 0.3,
      metalness: 0.5,
      flatShading: true,
    })
    const lensGeo = new THREE.TorusGeometry(0.13, 0.025, 4, 12)
    const leftLens = new THREE.Mesh(lensGeo, frameMat)
    leftLens.position.set(-0.22, 0.2, 0.82)
    this.accessoryGroup.add(leftLens)
    const rightLens = new THREE.Mesh(lensGeo.clone(), frameMat)
    rightLens.position.set(0.22, 0.2, 0.82)
    this.accessoryGroup.add(rightLens)
    const bridgeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.12, 4)
    const bridge = new THREE.Mesh(bridgeGeo, frameMat)
    bridge.rotation.z = Math.PI / 2
    bridge.position.set(0, 0.2, 0.82)
    this.accessoryGroup.add(bridge)
  }

  private createBandage() {
    const bandageGeo = new THREE.BoxGeometry(0.7, 0.08, 0.3)
    const bandageMat = new THREE.MeshStandardMaterial({
      color: 0xffcccc,
      roughness: 0.8,
      flatShading: true,
    })
    const bandage = new THREE.Mesh(bandageGeo, bandageMat)
    bandage.position.set(0, 0.68, 0.15)
    bandage.rotation.x = -0.2
    bandage.castShadow = true
    this.accessoryGroup.add(bandage)
  }

  // ── 自定义配件系统 ──

  getCustomAccessories(): string[] {
    return Array.from(this.activeCustomAccessories)
  }

  setCustomAccessory(accessory: string | null) {
    this.clearGroup(this.customAccessoryGroup)
    this.activeCustomAccessories.clear()
    if (accessory) {
      this.activeCustomAccessories.add(accessory as CustomAccessory)
      this.buildCustomAccessory(accessory as CustomAccessory)
    }
  }

  toggleCustomAccessory(accessory: string): boolean {
    const acc = accessory as CustomAccessory
    if (this.activeCustomAccessories.has(acc)) {
      this.activeCustomAccessories.delete(acc)
    } else {
      this.activeCustomAccessories.add(acc)
    }
    this.rebuildCustomAccessories()
    return this.activeCustomAccessories.has(acc)
  }

  private rebuildCustomAccessories() {
    this.clearGroup(this.customAccessoryGroup)
    this.activeCustomAccessories.forEach(acc => {
      this.buildCustomAccessory(acc)
    })
  }

  private buildCustomAccessory(acc: CustomAccessory) {
    switch (acc) {
      case 'glasses': this.buildGlasses(); break
      case 'sunglasses': this.buildSunglasses(); break
      case 'hat': this.buildHat(); break
      case 'bowtie': this.buildBowtie(); break
      case 'mustache': this.buildMustache(); break
      case 'headphones': this.buildHeadphones(); break
      case 'crown': this.buildCrown(); break
    }
  }

  private buildGlasses() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.6, flatShading: true })
    const lensGeo = new THREE.TorusGeometry(0.14, 0.022, 4, 12)
    const l = new THREE.Mesh(lensGeo, mat); l.position.set(-0.22, 0.18, 0.82); this.customAccessoryGroup.add(l)
    const r = new THREE.Mesh(lensGeo.clone(), mat); r.position.set(0.22, 0.18, 0.82); this.customAccessoryGroup.add(r)
    const bridgeGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.14, 4)
    const b = new THREE.Mesh(bridgeGeo, mat); b.rotation.z = Math.PI / 2; b.position.set(0, 0.18, 0.82); this.customAccessoryGroup.add(b)
  }

  private buildSunglasses() {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.7, flatShading: true })
    const lensGeo = new THREE.TorusGeometry(0.15, 0.025, 4, 12)
    const l = new THREE.Mesh(lensGeo, frameMat); l.position.set(-0.22, 0.18, 0.82); this.customAccessoryGroup.add(l)
    const r = new THREE.Mesh(lensGeo.clone(), frameMat); r.position.set(0.22, 0.18, 0.82); this.customAccessoryGroup.add(r)
    // 暗色镜片
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x220044, transparent: true, opacity: 0.6, roughness: 0.1, metalness: 0.8 })
    const glassGeo = new THREE.CircleGeometry(0.13, 12)
    const lg = new THREE.Mesh(glassGeo, glassMat); lg.position.set(-0.22, 0.18, 0.81); this.customAccessoryGroup.add(lg)
    const rg = new THREE.Mesh(glassGeo.clone(), glassMat); rg.position.set(0.22, 0.18, 0.81); this.customAccessoryGroup.add(rg)
    const bridgeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.14, 4)
    const b = new THREE.Mesh(bridgeGeo, frameMat); b.rotation.z = Math.PI / 2; b.position.set(0, 0.18, 0.82); this.customAccessoryGroup.add(b)
  }

  private buildHat() {
    // 小礼帽
    const brimMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.7, flatShading: true })
    const brimGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.04, 12)
    const brim = new THREE.Mesh(brimGeo, brimMat); brim.position.set(0, 0.85, 0); brim.castShadow = true; this.customAccessoryGroup.add(brim)
    const crownGeo = new THREE.CylinderGeometry(0.25, 0.28, 0.3, 12)
    const crown = new THREE.Mesh(crownGeo, brimMat); crown.position.set(0, 1.0, 0); crown.castShadow = true; this.customAccessoryGroup.add(crown)
    // 帽带
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.5, flatShading: true })
    const bandGeo = new THREE.CylinderGeometry(0.265, 0.265, 0.06, 12)
    const band = new THREE.Mesh(bandGeo, bandMat); band.position.set(0, 0.9, 0); this.customAccessoryGroup.add(band)
  }

  private buildBowtie() {
    const mat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.4, flatShading: true })
    // 左蝶翼
    const leftGeo = new THREE.ConeGeometry(0.12, 0.18, 4)
    const left = new THREE.Mesh(leftGeo, mat)
    left.position.set(-0.12, -0.45, 0.78)
    left.rotation.z = Math.PI / 2
    left.rotation.x = Math.PI
    this.customAccessoryGroup.add(left)
    // 右蝶翼
    const right = new THREE.Mesh(leftGeo.clone(), mat)
    right.position.set(0.12, -0.45, 0.78)
    right.rotation.z = -Math.PI / 2
    right.rotation.x = Math.PI
    this.customAccessoryGroup.add(right)
    // 中心结
    const knotGeo = new THREE.BoxGeometry(0.06, 0.08, 0.06)
    const knot = new THREE.Mesh(knotGeo, mat); knot.position.set(0, -0.45, 0.8); this.customAccessoryGroup.add(knot)
  }

  private buildMustache() {
    // 用Canvas画胡子贴在脸上
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#3a2010'
    ctx.beginPath()
    ctx.moveTo(128, 20)
    ctx.bezierCurveTo(80, 10, 30, 30, 20, 60)
    ctx.bezierCurveTo(30, 80, 60, 70, 90, 55)
    ctx.bezierCurveTo(110, 50, 120, 40, 128, 50)
    ctx.bezierCurveTo(136, 40, 146, 50, 166, 55)
    ctx.bezierCurveTo(196, 70, 226, 80, 236, 60)
    ctx.bezierCurveTo(226, 30, 176, 10, 128, 20)
    ctx.fill()
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true })
    const geo = new THREE.PlaneGeometry(0.5, 0.25)
    const m = new THREE.Mesh(geo, mat)
    m.position.set(0, -0.15, 0.79)
    this.customAccessoryGroup.add(m)
  }

  private buildHeadphones() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.4, metalness: 0.3, flatShading: true })
    // 头梁 - 半圆弧
    const arcGeo = new THREE.TorusGeometry(0.55, 0.03, 4, 16, Math.PI)
    const arc = new THREE.Mesh(arcGeo, mat)
    arc.position.set(0, 0.3, 0)
    arc.rotation.y = Math.PI / 2
    arc.castShadow = true
    this.customAccessoryGroup.add(arc)
    // 左耳罩
    const cupGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.08, 12)
    const leftCup = new THREE.Mesh(cupGeo, mat)
    leftCup.position.set(-0.55, 0.1, 0)
    leftCup.rotation.z = Math.PI / 2
    leftCup.castShadow = true
    this.customAccessoryGroup.add(leftCup)
    // 右耳罩
    const rightCup = new THREE.Mesh(cupGeo.clone(), mat)
    rightCup.position.set(0.55, 0.1, 0)
    rightCup.rotation.z = Math.PI / 2
    rightCup.castShadow = true
    this.customAccessoryGroup.add(rightCup)
  }

  private buildCrown() {
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8, flatShading: true })
    // 基座
    const baseGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 12)
    const base = new THREE.Mesh(baseGeo, goldMat); base.position.set(0, 0.82, 0); base.castShadow = true; this.customAccessoryGroup.add(base)
    // 尖刺
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2
      const spikeGeo = new THREE.ConeGeometry(0.06, 0.2, 4)
      const spike = new THREE.Mesh(spikeGeo, goldMat)
      spike.position.set(Math.cos(angle) * 0.3, 0.97, Math.sin(angle) * 0.3)
      spike.castShadow = true
      this.customAccessoryGroup.add(spike)
      // 宝石
      const gemColors = [0xff4757, 0x2ed573, 0x4488ff, 0xffa502, 0xa55eea]
      const gemMat = new THREE.MeshStandardMaterial({ color: gemColors[i], roughness: 0.1, metalness: 0.3, flatShading: true })
      const gemGeo = new THREE.OctahedronGeometry(0.04)
      const gem = new THREE.Mesh(gemGeo, gemMat)
      gem.position.set(Math.cos(angle) * 0.3, 1.07, Math.sin(angle) * 0.3)
      this.customAccessoryGroup.add(gem)
    }
  }

  setBodyColor(color: number) {
    this.bodyMaterial.color.setHex(color)
  }

  update(delta: number, elapsed: number) {
    this.breathPhase += delta * 1.5
    const breathScale = 1 + Math.sin(this.breathPhase) * 0.02
    this.body.scale.set(breathScale, breathScale * 0.98, breathScale)

    this.leaves.forEach((leaf, i) => {
      leaf.rotation.x = Math.sin(elapsed * 2 + i) * 0.08
      leaf.rotation.z = -0.3 + Math.sin(elapsed * 1.5 + i * 0.5) * 0.05
    })

    if (this.emotionTransition > 0) {
      this.emotionTransition -= delta * 3
      const t = Math.max(0, this.emotionTransition)
      const squash = 1 + Math.sin(t * Math.PI) * 0.15
      this.body.scale.y *= squash * 0.9
      this.body.scale.x *= 1 / squash
      this.body.scale.z *= 1 / squash
    }

    if (this.blushLeft.visible) {
      const pulse = 0.4 + Math.sin(elapsed * 4) * 0.2
      ;(this.blushLeft.material as THREE.MeshBasicMaterial).opacity = pulse
      ;(this.blushRight.material as THREE.MeshBasicMaterial).opacity = pulse
    }

    this.facePlane.position.set(0, 0.05, 0.78)
  }

  dispose() {
    this.body.geometry.dispose()
    this.bodyMaterial.dispose()
    this.faceTexture.dispose()
    this.facePlane.geometry.dispose()
    ;(this.facePlane.material as THREE.Material).dispose()
    this.leaves.forEach(leaf => {
      leaf.geometry.dispose()
      ;(leaf.material as THREE.Material).dispose()
    })
    this.blushLeft.geometry.dispose()
    ;(this.blushLeft.material as THREE.Material).dispose()
    this.blushRight.geometry.dispose()
    ;(this.blushRight.material as THREE.Material).dispose()
    this.clearGroup(this.accessoryGroup)
    this.clearGroup(this.customAccessoryGroup)
  }
}
