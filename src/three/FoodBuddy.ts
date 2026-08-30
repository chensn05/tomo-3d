import * as THREE from 'three'

export interface FoodCharConfig {
  name: string
  emoji: string
  type: 'milk' | 'bread' | 'egg' | 'butter'
}

/**
 * 食物小伙伴 - 和 TOMO 一起住在桌面上的小角色
 * 每个都有自己的造型和小动作
 */
export class FoodBuddy {
  group = new THREE.Group()
  name: string
  type: string

  private body!: THREE.Mesh
  private bodyMaterial!: THREE.MeshStandardMaterial
  private faceCanvas!: HTMLCanvasElement
  private faceCtx!: CanvasRenderingContext2D
  private faceTexture!: THREE.CanvasTexture
  private facePlane!: THREE.Mesh
  private cap!: THREE.Mesh | null = null
  private breathPhase = Math.random() * Math.PI * 2

  constructor(config: FoodCharConfig) {
    this.name = config.name
    this.type = config.type
  }

  init() {
    this.createFaceCanvas()
    switch (this.type) {
      case 'milk': this.createMilkBottle(); break
      case 'bread': this.createBread(); break
      case 'egg': this.createEgg(); break
      case 'butter': this.createButter(); break
    }
    this.createFacePlane()
    this.drawFace()
  }

  private createFaceCanvas() {
    this.faceCanvas = document.createElement('canvas')
    this.faceCanvas.width = 256
    this.faceCanvas.height = 256
    this.faceCtx = this.faceCanvas.getContext('2d')!
    this.faceTexture = new THREE.CanvasTexture(this.faceCanvas)
    this.faceTexture.colorSpace = THREE.SRGBColorSpace
  }

  // 🥛 牛奶瓶
  private createMilkBottle() {
    // 瓶身
    const bodyGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.35, 12)
    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f0,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9,
    })
    this.body = new THREE.Mesh(bodyGeo, this.bodyMaterial)
    this.body.castShadow = true
    this.group.add(this.body)

    // 瓶颈
    const neckGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.08, 8)
    const neck = new THREE.Mesh(neckGeo, this.bodyMaterial)
    neck.position.y = 0.22
    this.group.add(neck)

    // 瓶盖 - 蓝色
    const capMat = new THREE.MeshStandardMaterial({ color: 0x4a7ab0, roughness: 0.4, metalness: 0.3, flatShading: true })
    const capGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.05, 8)
    this.cap = new THREE.Mesh(capGeo, capMat)
    this.cap.position.y = 0.28
    this.cap.castShadow = true
    this.group.add(this.cap)

    // 牛奶液面（内部白色）
    const liquidGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.25, 12)
    const liquidMat = new THREE.MeshStandardMaterial({ color: 0xfffaf0, roughness: 0.3 })
    const liquid = new THREE.Mesh(liquidGeo, liquidMat)
    liquid.position.y = -0.02
    this.group.add(liquid)

    // 标签
    const labelGeo = new THREE.PlaneGeometry(0.16, 0.08)
    const labelMat = new THREE.MeshStandardMaterial({ color: 0x4a7ab0, roughness: 0.6, side: THREE.DoubleSide })
    const label = new THREE.Mesh(labelGeo, labelMat)
    label.position.set(0, 0.02, 0.1)
    this.group.add(label)
  }

  // 🍞 面包
  private createBread() {
    // 面包体 - 用压扁的球体
    const geo = new THREE.SphereGeometry(0.18, 10, 8)
    const positions = geo.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i)
      positions.setY(i, y * 0.6)  // 压扁
      const x = positions.getX(i)
      positions.setX(i, x * 1.3)  // 拉长
    }
    geo.computeVertexNormals()

    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4a060,
      roughness: 0.7,
      metalness: 0,
      flatShading: true,
    })
    this.body = new THREE.Mesh(geo, this.bodyMaterial)
    this.body.castShadow = true
    this.body.receiveShadow = true
    this.group.add(this.body)

    // 顶部裂口（面包烘烤裂纹）
    const slitMat = new THREE.MeshStandardMaterial({ color: 0xa87840, roughness: 0.8, flatShading: true })
    const slitGeo = new THREE.BoxGeometry(0.15, 0.02, 0.04)
    const slit = new THREE.Mesh(slitGeo, slitMat)
    slit.position.set(0, 0.08, 0)
    this.group.add(slit)
  }

  // 🥚 鸡蛋
  private createEgg() {
    // 鸡蛋体 - 不对称球体
    const geo = new THREE.SphereGeometry(0.12, 12, 10)
    const positions = geo.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i)
      // 底部圆，顶部尖
      if (y > 0) {
        positions.setX(i, positions.getX(i) * (1 - y * 0.5))
        positions.setZ(i, positions.getZ(i) * (1 - y * 0.5))
        positions.setY(i, y * 1.4)
      }
    }
    geo.computeVertexNormals()

    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0e8d0,
      roughness: 0.5,
      metalness: 0,
      flatShading: true,
    })
    this.body = new THREE.Mesh(geo, this.bodyMaterial)
    this.body.castShadow = true
    this.group.add(this.body)

    // 蛋壳碎片（坐在蛋上）
    const shellMat = new THREE.MeshStandardMaterial({ color: 0xf0e8d0, roughness: 0.5, flatShading: true })
    const shellGeo = new THREE.ConeGeometry(0.04, 0.06, 4)
    const shell = new THREE.Mesh(shellGeo, shellMat)
    shell.position.set(0.05, 0.15, 0)
    shell.rotation.z = 0.3
    this.group.add(shell)
  }

  // 🧈 黄油
  private createButter() {
    // 黄油块
    const geo = new THREE.BoxGeometry(0.2, 0.12, 0.15)
    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff5a0,
      roughness: 0.4,
      metalness: 0.05,
      flatShading: true,
    })
    this.body = new THREE.Mesh(geo, this.bodyMaterial)
    this.body.castShadow = true
    this.group.add(this.body)

    // 顶部切面（稍亮的黄色）
    const topGeo = new THREE.BoxGeometry(0.2, 0.02, 0.15)
    const topMat = new THREE.MeshStandardMaterial({ color: 0xfff8b0, roughness: 0.3, flatShading: true })
    const top = new THREE.Mesh(topGeo, topMat)
    top.position.y = 0.07
    this.group.add(top)
  }

  private createFacePlane() {
    const geo = new THREE.PlaneGeometry(0.2, 0.2)
    const mat = new THREE.MeshBasicMaterial({ map: this.faceTexture, transparent: true })
    this.facePlane = new THREE.Mesh(geo, mat)
    // 面部位置根据类型调整
    const faceY = this.type === 'milk' ? 0.05 : this.type === 'bread' ? 0.02 : this.type === 'egg' ? 0 : 0.02
    const faceZ = this.type === 'milk' ? 0.1 : this.type === 'bread' ? 0.18 : this.type === 'egg' ? 0.1 : 0.08
    this.facePlane.position.set(0, faceY, faceZ)
    this.group.add(this.facePlane)
  }

  private drawFace() {
    const ctx = this.faceCtx
    const w = this.faceCanvas.width
    const h = this.faceCanvas.height
    ctx.clearRect(0, 0, w, h)

    const cx = w / 2
    const cy = h / 2

    // 眼睛 - 圆点
    ctx.fillStyle = '#2a2010'
    ctx.beginPath()
    ctx.arc(cx - 28, cy - 10, 10, 0, Math.PI * 2)
    ctx.arc(cx + 28, cy - 10, 10, 0, Math.PI * 2)
    ctx.fill()

    // 眼睛高光
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(cx - 25, cy - 13, 3, 0, Math.PI * 2)
    ctx.arc(cx + 31, cy - 13, 3, 0, Math.PI * 2)
    ctx.fill()

    // 腮红
    ctx.fillStyle = 'rgba(255, 180, 180, 0.5)'
    ctx.beginPath()
    ctx.arc(cx - 40, cy + 15, 12, 0, Math.PI * 2)
    ctx.arc(cx + 40, cy + 15, 12, 0, Math.PI * 2)
    ctx.fill()

    // 微笑嘴巴
    ctx.strokeStyle = '#2a2010'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(cx, cy + 20, 16, Math.PI * 0.15, Math.PI * 0.85)
    ctx.stroke()

    this.faceTexture.needsUpdate = true
  }

  update(delta: number, elapsed: number) {
    // 呼吸
    this.breathPhase += delta * 1.2
    const breath = 1 + Math.sin(this.breathPhase) * 0.015
    this.body.scale.setScalar(breath)

    // 轻微摇摆
    this.group.rotation.z = Math.sin(elapsed * 0.8 + this.breathPhase) * 0.02

    // 瓶盖旋转（牛奶瓶）
    if (this.cap && this.type === 'milk') {
      this.cap.rotation.y = elapsed * 0.3
    }
  }

  dispose() {
    this.body.geometry.dispose()
    this.bodyMaterial.dispose()
    this.faceTexture.dispose()
    this.facePlane.geometry.dispose()
    ;(this.facePlane.material as THREE.Material).dispose()
  }
}
