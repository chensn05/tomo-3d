import * as THREE from 'three'
import { TomoCharacter } from './TomoCharacter'
import { ParticleSystem } from './particles'
import { FoodBuddy } from './FoodBuddy'
import { DraggableItem } from './DraggableItem'
import { createMerchCard, MerchCardData } from './MerchCard'
import { createMagnet3D, createAcrylicKeychain3D, createEnamelPin3D, createMiniFigure3D } from './Merch3D'
import { emotions, Emotion } from './emotions'

export type SceneTheme = 'kitchen' | 'garden' | 'sunset'

interface ThemeConfig {
  bgColor: number
  fogColor: number
  fogNear: number
  fogFar: number
  groundColor: number
  ambientColor: number
  ambientIntensity: number
  dirLightColor: number
  dirLightIntensity: number
  fillColor: number
  fillIntensity: number
  rimColor: number
  rimIntensity: number
  ringColor: number
  haloColor: number
  wallColor: number
  stars?: boolean
}

// 小泉理惠风格配色 - 暖沙色/奶油色/复古暖色调
const themes: Record<SceneTheme, ThemeConfig> = {
  kitchen: {
    bgColor: 0xf5ead0,       // 暖沙色背景
    fogColor: 0xf5ead0,
    fogNear: 10, fogFar: 30,
    groundColor: 0xe8d5b8,    // 米色地面
    ambientColor: 0xffe8c8,
    ambientIntensity: 0.6,
    dirLightColor: 0xfff5e0,
    dirLightIntensity: 0.8,
    fillColor: 0xffd6a8,
    fillIntensity: 0.5,
    rimColor: 0xc8a878,
    rimIntensity: 0.3,
    ringColor: 0xd4a878,
    haloColor: 0xd4a878,
    wallColor: 0xf0e0c0,       // 暖白墙面
  },
  garden: {
    bgColor: 0xe4f0d7,
    fogColor: 0xe4f0d7,
    fogNear: 10, fogFar: 30,
    groundColor: 0xb9d8bd,
    ambientColor: 0xf5f1c8,
    ambientIntensity: 0.6,
    dirLightColor: 0xfff8dc,
    dirLightIntensity: 0.82,
    fillColor: 0xa9d6b0,
    fillIntensity: 0.48,
    rimColor: 0x86b99a,
    rimIntensity: 0.3,
    ringColor: 0x8bbd9b,
    haloColor: 0x9bcf9b,
    wallColor: 0xd6e8c8,
  },
  sunset: {
    bgColor: 0xf0d0a8,
    fogColor: 0xf0d0a8,
    fogNear: 10, fogFar: 30,
    groundColor: 0xe0b888,
    ambientColor: 0xffd8a0,
    ambientIntensity: 0.65,
    dirLightColor: 0xffe8c0,
    dirLightIntensity: 0.9,
    fillColor: 0xffb878,
    fillIntensity: 0.6,
    rimColor: 0xd89858,
    rimIntensity: 0.35,
    ringColor: 0xd89858,
    haloColor: 0xe8a868,
    wallColor: 0xe8c898,
  },
}

export class TomoScene {
  private container: HTMLElement
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private tomo!: TomoCharacter
  private particles!: ParticleSystem
  private foodBuddies: FoodBuddy[] = []
  private clock = new THREE.Clock()
  private animationId = 0

  private isDragging = false
  private prevMouseX = 0
  private prevMouseY = 0
  private targetRotationY = 0
  private targetRotationX = 0
  private currentRotationY = 0
  private currentRotationX = 0

  // 场景元素
  private groundMesh!: THREE.Mesh
  private wallMesh!: THREE.Mesh
  private tableMesh!: THREE.Mesh
  private chairLeft!: THREE.Group
  private chairRight!: THREE.Group
  private vaseMesh!: THREE.Mesh
  private flowers: THREE.Mesh[] = []
  private bottleMesh!: THREE.Mesh
  private glassMesh!: THREE.Mesh
  private groundRings: THREE.Mesh[] = []
  private ambientLight!: THREE.AmbientLight
  private dirLight!: THREE.DirectionalLight
  private fillLight!: THREE.PointLight
  private rimLight!: THREE.PointLight

  public onTomoClick: (() => void) | null = null
  public onMerchClick: ((item: { id: string; type: string; name: string }) => void) | null = null

  private halo!: THREE.Mesh
  private starsField: THREE.Points | null = null
  private currentTheme: SceneTheme = 'kitchen'
  private raycaster = new THREE.Raycaster()
  private mouseVec = new THREE.Vector2()

  // TOMO 位置控制
  private targetPosX = 0
  private targetPosZ = 0
  private currentPosX = 0
  private currentPosZ = 0
  private isDraggingTomo = false
  private dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.35)
  private dragOffset = new THREE.Vector3()

  // 摇晃/弹跳动画
  private wobblePhase = 0
  private wobbleAmount = 0
  private bouncePhase = 0
  private bounceAmount = 0

  private targetZoom = 5.5
  private currentZoom = 5.5

  // 周边可拖拽展示物 - 卡片+3D模型
  private draggables: DraggableItem[] = []
  private draggingItem: DraggableItem | null = null

  constructor(container: HTMLElement) {
    this.container = container
  }

  async init() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xf5ead0)
    this.scene.fog = new THREE.Fog(0xf5ead0, 10, 30)

    this.camera = new THREE.PerspectiveCamera(
      40,
      this.container.clientWidth / this.container.clientHeight,
      0.1, 100
    )
    this.camera.position.set(0, 2.2, 5.5)
    this.camera.lookAt(0, 0.3, 0)

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0
    this.container.appendChild(this.renderer.domElement)

    this.setupLights()
    this.setupRoom()
    this.setupHalo()
    this.createStarsField()

    this.tomo = new TomoCharacter()
    await this.tomo.init()
    this.tomo.group.position.y = 0.35
    this.scene.add(this.tomo.group)

    // 食物小伙伴 - 只留鸡蛋
    const buddyConfigs = [
      { name: '蛋蛋', emoji: '🥚', type: 'egg' as const },
    ]
    const buddyPositions = [[0.45, 0.0, 0.5]]
    buddyConfigs.forEach((cfg, i) => {
      const buddy = new FoodBuddy(cfg)
      buddy.init()
      buddy.group.position.set(buddyPositions[i][0], buddyPositions[i][1], buddyPositions[i][2])
      buddy.group.rotation.y = -0.3
      this.scene.add(buddy.group)
      this.foodBuddies.push(buddy)
    })

    this.particles = new ParticleSystem()
    this.scene.add(this.particles.group)

    // 周边展示物（卡片+3D模型）- 可自由拖拽
    this.setupMerchDisplay()

    this.setEmotion('idle')
    this.setupEvents()
    this.animate()
    window.addEventListener('resize', this.onResize)
  }

  private setupLights() {
    // 柔和环境光 - 暖色调
    this.ambientLight = new THREE.AmbientLight(0xffe8c8, 0.6)
    this.scene.add(this.ambientLight)

    // 主光 - 柔和暖白，模拟自然窗光
    this.dirLight = new THREE.DirectionalLight(0xfff5e0, 0.8)
    this.dirLight.position.set(2, 6, 4)
    this.dirLight.castShadow = true
    this.dirLight.shadow.mapSize.width = 1024
    this.dirLight.shadow.mapSize.height = 1024
    this.dirLight.shadow.camera.near = 0.5
    this.dirLight.shadow.camera.far = 20
    this.dirLight.shadow.camera.left = -5
    this.dirLight.shadow.camera.right = 5
    this.dirLight.shadow.camera.top = 5
    this.dirLight.shadow.camera.bottom = -5
    this.dirLight.shadow.bias = -0.0005
    this.dirLight.shadow.radius = 4  // 柔和阴影
    this.scene.add(this.dirLight)

    // 补光 - 暖色
    this.fillLight = new THREE.PointLight(0xffd6a8, 0.5, 10)
    this.fillLight.position.set(-3, 2, 2)
    this.scene.add(this.fillLight)

    // 轮廓光 - 复古暖棕
    this.rimLight = new THREE.PointLight(0xc8a878, 0.3, 10)
    this.rimLight.position.set(2, 1, -3)
    this.scene.add(this.rimLight)
  }

  private setupRoom() {
    // ── 墙面（背景）──
    const wallGeo = new THREE.PlaneGeometry(12, 6)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf0e0c0,
      roughness: 0.9,
      metalness: 0,
      flatShading: false,
    })
    this.wallMesh = new THREE.Mesh(wallGeo, wallMat)
    this.wallMesh.position.set(0, 2, -2.5)
    this.wallMesh.receiveShadow = true
    this.scene.add(this.wallMesh)

    // 墙角线
    const cornerGeo = new THREE.BoxGeometry(0.02, 6, 0.02)
    const cornerMat = new THREE.MeshBasicMaterial({ color: 0xd4c0a0 })
    const corner = new THREE.Mesh(cornerGeo, cornerMat)
    corner.position.set(0, 2, -2.49)
    this.scene.add(corner)

    // ── 地面 ──
    const groundGeo = new THREE.CircleGeometry(5, 64)
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xe8d5b8,
      roughness: 0.85,
      metalness: 0,
    })
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat)
    this.groundMesh.rotation.x = -Math.PI / 2
    this.groundMesh.position.y = -0.2
    this.groundMesh.receiveShadow = true
    this.scene.add(this.groundMesh)

    // ── 桌子（方形，斜角朝向观众）──
    const tableTopGeo = new THREE.BoxGeometry(2.0, 0.08, 2.0)
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0xc8a878,
      roughness: 0.7,
      metalness: 0.05,
      flatShading: true,
    })
    this.tableMesh = new THREE.Mesh(tableTopGeo, woodMat)
    this.tableMesh.position.set(0, -0.05, 0.3)
    this.tableMesh.rotation.y = Math.PI / 4  // 斜角
    this.tableMesh.castShadow = true
    this.tableMesh.receiveShadow = true
    this.scene.add(this.tableMesh)

    // 桌腿
    const legGeo = new THREE.BoxGeometry(0.08, 0.5, 0.08)
    const legPositions = [[-0.65, -0.3, 0.95], [0.65, -0.3, 0.95], [-0.65, -0.3, -0.35], [0.65, -0.3, -0.35]]
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, woodMat)
      leg.position.set(x, y, z)
      leg.rotation.y = Math.PI / 4
      leg.castShadow = true
      this.scene.add(leg)
    })

    // 桌布（垂坠感）
    const clothGeo = new THREE.BoxGeometry(1.8, 0.02, 1.8)
    const clothMat = new THREE.MeshStandardMaterial({
      color: 0xf5ede0,
      roughness: 0.9,
      metalness: 0,
    })
    const cloth = new THREE.Mesh(clothGeo, clothMat)
    cloth.position.set(0, -0.005, 0.3)
    cloth.rotation.y = Math.PI / 4
    cloth.receiveShadow = true
    this.scene.add(cloth)

    // ── 椅子（两把，红色木质栅栏靠背）──
    this.chairLeft = this.createChair(0xc87060)  // 砖红色
    this.chairLeft.position.set(-0.8, -0.1, 1.2)
    this.chairLeft.rotation.y = -0.3
    this.scene.add(this.chairLeft)

    this.chairRight = this.createChair(0xc87060)
    this.chairRight.position.set(0.8, -0.1, 1.2)
    this.chairRight.rotation.y = 0.3
    this.scene.add(this.chairRight)

    // ── 花瓶 + 花 ──
    const vaseGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.25, 12)
    const vaseMat = new THREE.MeshStandardMaterial({
      color: 0xf5f0e8,
      roughness: 0.3,
      metalness: 0.1,
    })
    this.vaseMesh = new THREE.Mesh(vaseGeo, vaseMat)
    this.vaseMesh.position.set(-0.3, 0.18, 0.3)
    this.vaseMesh.castShadow = true
    this.scene.add(this.vaseMesh)

    // 花 - 橙色雏菊
    const flowerColors = [0xe87830, 0xe88840, 0xd86820]
    for (let i = 0; i < 3; i++) {
      const petalGeo = new THREE.SphereGeometry(0.04, 8, 6)
      const petalMat = new THREE.MeshStandardMaterial({
        color: flowerColors[i],
        roughness: 0.6,
        flatShading: true,
      })
      const flower = new THREE.Mesh(petalGeo, petalMat)
      flower.position.set(-0.3 + (i - 1) * 0.06, 0.38 + i * 0.03, 0.3 + (i - 1) * 0.03)
      flower.castShadow = true
      this.flowers.push(flower)
      this.scene.add(flower)

      // 花茎
      const stemGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.15, 4)
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x4a6a3a, roughness: 0.8 })
      const stem = new THREE.Mesh(stemGeo, stemMat)
      stem.position.set(-0.3 + (i - 1) * 0.06, 0.3, 0.3 + (i - 1) * 0.03)
      this.scene.add(stem)
    }

    // ── 玻璃瓶（墨绿色细颈瓶）──
    const bottleBodyGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.2, 12)
    const bottleNeckGeo = new THREE.CylinderGeometry(0.025, 0.04, 0.1, 8)
    const bottleMat = new THREE.MeshStandardMaterial({
      color: 0x3a5a4a,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85,
    })
    this.bottleMesh = new THREE.Mesh(bottleBodyGeo, bottleMat)
    this.bottleMesh.position.set(0.25, 0.18, 0.35)
    this.bottleMesh.castShadow = true
    this.scene.add(this.bottleMesh)
    const bottleNeck = new THREE.Mesh(bottleNeckGeo, bottleMat)
    bottleNeck.position.set(0.25, 0.32, 0.35)
    this.scene.add(bottleNeck)

    // ── 水杯（复古蓝色）──
    const glassGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.12, 12)
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x6080a8,
      roughness: 0.15,
      metalness: 0.2,
      transparent: true,
      opacity: 0.8,
    })
    this.glassMesh = new THREE.Mesh(glassGeo, glassMat)
    this.glassMesh.position.set(0.1, 0.12, 0.15)
    this.glassMesh.castShadow = true
    this.scene.add(this.glassMesh)

    // ── 装饰圆环（地面）──
    for (let i = 0; i < 2; i++) {
      const ringGeo = new THREE.RingGeometry(1.8 + i * 1.0, 1.85 + i * 1.0, 64)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xd4a878,
        transparent: true,
        opacity: 0.1 - i * 0.03,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = -Math.PI / 2
      ring.position.y = -0.19
      this.scene.add(ring)
      this.groundRings.push(ring)
    }
  }

  private createChair(color: number): THREE.Group {
    const group = new THREE.Group()
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, flatShading: true })

    // 座面
    const seatGeo = new THREE.BoxGeometry(0.4, 0.04, 0.4)
    const seat = new THREE.Mesh(seatGeo, mat)
    seat.position.y = 0.0
    seat.castShadow = true
    group.add(seat)

    // 靠背 - 栅栏式
    for (let i = 0; i < 3; i++) {
      const slatGeo = new THREE.BoxGeometry(0.03, 0.35, 0.03)
      const slat = new THREE.Mesh(slatGeo, mat)
      slat.position.set(-0.12 + i * 0.12, 0.2, -0.18)
      slat.castShadow = true
      group.add(slat)
    }
    // 靠背横档
    const railGeo = new THREE.BoxGeometry(0.36, 0.03, 0.03)
    const rail = new THREE.Mesh(railGeo, mat)
    rail.position.set(0, 0.35, -0.18)
    rail.castShadow = true
    group.add(rail)

    // 腿
    const legGeo = new THREE.BoxGeometry(0.04, 0.5, 0.04)
    ;[[-0.16, -0.25, -0.16], [0.16, -0.25, -0.16], [-0.16, -0.25, 0.16], [0.16, -0.25, 0.16]].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, mat)
      leg.position.set(x, y, z)
      leg.castShadow = true
      group.add(leg)
    })

    return group
  }

  // ── 周边展示物（可拖拽）──
  private async setupMerchDisplay() {
    // 1. 插画卡片 - 使用 public/art 里的 AI 插画，散落在桌面四周
    const cardData: MerchCardData[] = [
      { id: 'hero', imageUrl: 'art/tomo_hero.jpg', name: '惊喜时刻' },
      { id: 'sleep', imageUrl: 'art/tomo_sleep.jpg', name: '安睡番茄' },
      { id: 'chill', imageUrl: 'art/tomo_chill.jpg', name: '摸鱼中' },
      { id: 'eating', imageUrl: 'art/tomo_eating.jpg', name: '干饭人' },
      { id: 'hug', imageUrl: 'art/tomo_hug.jpg', name: '抱抱番茄' },
      { id: 'cool', imageUrl: 'art/tomo_cool.jpg', name: '能酷番茄' },
    ]
    const cardPositions: [number, number][] = [
      [-1.5, -0.7], [1.5, -0.7], [-1.5, 0.9],
      [1.5, 0.9], [-1.6, 0.1], [1.6, 0.1],
    ]
    for (let i = 0; i < cardData.length; i++) {
      try {
        const card = await createMerchCard(cardData[i], cardPositions[i][0], cardPositions[i][1])
        ;(card as any).merchInfo = { id: cardData[i].id, type: 'art', name: cardData[i].name, imageUrl: cardData[i].imageUrl }
        this.scene.add(card.group)
        this.draggables.push(card)
      } catch (e) {
        console.warn('merch card load failed', e)
      }
    }

    // 2. 3D 周边模型 - 真实立体造型，散落在桌面周围
    const magnet = createMagnet3D(-1.1, -0.85)
    ;(magnet as any).merchInfo = { id: 'magnet', type: 'magnet', name: '冰箱贴' }
    this.scene.add(magnet.group)
    this.draggables.push(magnet)

    const keychain = createAcrylicKeychain3D(1.2, -0.9)
    ;(keychain as any).merchInfo = { id: 'keychain', type: 'keychain', name: '亚克力钥匙扣' }
    this.scene.add(keychain.group)
    this.draggables.push(keychain)

    const pin = createEnamelPin3D(-1.3, 1.0)
    ;(pin as any).merchInfo = { id: 'pin', type: 'pin', name: '珐琅徽章' }
    this.scene.add(pin.group)
    this.draggables.push(pin)

    const figure1 = createMiniFigure3D(1.35, 0.95, 'wave')
    ;(figure1 as any).merchInfo = { id: 'figure_wave', type: 'figure_wave', name: '迷你手办·打招呼' }
    this.scene.add(figure1.group)
    this.draggables.push(figure1)

    const figure2 = createMiniFigure3D(-1.55, -0.15, 'sit')
    ;(figure2 as any).merchInfo = { id: 'figure_sit', type: 'figure_sit', name: '迷你手办·坐姿' }
    this.scene.add(figure2.group)
    this.draggables.push(figure2)

    const figure3 = createMiniFigure3D(1.55, -0.15, 'jump')
    ;(figure3 as any).merchInfo = { id: 'figure_jump', type: 'figure_jump', name: '迷你手办·跳跃' }
    this.scene.add(figure3.group)
    this.draggables.push(figure3)
  }
  private setupHalo() {
    const haloGeo = new THREE.RingGeometry(0.6, 0.9, 32)
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xd4a878,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    })
    this.halo = new THREE.Mesh(haloGeo, haloMat)
    this.halo.rotation.x = -Math.PI / 2
    this.halo.position.y = -0.15
    this.scene.add(this.halo)
  }

  private createStarsField() {
    const starCount = 300
    const positions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40
      positions[i * 3 + 1] = Math.random() * 15 + 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0.6, sizeAttenuation: true })
    this.starsField = new THREE.Points(geo, mat)
    this.starsField.visible = false
    this.scene.add(this.starsField)
  }

  setTheme(theme: SceneTheme) {
    const cfg = themes[theme]
    this.currentTheme = theme

    this.scene.background = new THREE.Color(cfg.bgColor)
    this.scene.fog = new THREE.Fog(cfg.fogColor, cfg.fogNear, cfg.fogFar)

    ;(this.groundMesh.material as THREE.MeshStandardMaterial).color.setHex(cfg.groundColor)
    ;(this.wallMesh.material as THREE.MeshStandardMaterial).color.setHex(cfg.wallColor)

    this.ambientLight.color.setHex(cfg.ambientColor)
    this.ambientLight.intensity = cfg.ambientIntensity
    this.dirLight.color.setHex(cfg.dirLightColor)
    this.dirLight.intensity = cfg.dirLightIntensity
    this.fillLight.color.setHex(cfg.fillColor)
    this.fillLight.intensity = cfg.fillIntensity
    this.rimLight.color.setHex(cfg.rimColor)
    this.rimLight.intensity = cfg.rimIntensity

    this.groundRings.forEach(ring => {
      ;(ring.material as THREE.MeshBasicMaterial).color.setHex(cfg.ringColor)
    })
    ;(this.halo.material as THREE.MeshBasicMaterial).color.setHex(cfg.haloColor)

    if (this.starsField) this.starsField.visible = !!cfg.stars
  }

  private setupEvents() {
    const canvas = this.renderer.domElement

    const getHitDraggable = (): { isTomo: boolean; item?: DraggableItem } | null => {
      // 优先检测 TOMO
      const tomoHits = this.raycaster.intersectObject(this.tomo.group, true)
      if (tomoHits.length > 0) return { isTomo: true }
      // 再检测其他可拖拽物（卡片/3D周边）
      for (const item of this.draggables) {
        const hits = this.raycaster.intersectObject(item.group, true)
        if (hits.length > 0) return { isTomo: false, item }
      }
      return null
    }

    // ── 按下：判断是点 TOMO / 周边（拖拽移动）还是点空白（旋转场景）──
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect()
      this.mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      this.mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      this.raycaster.setFromCamera(this.mouseVec, this.camera)

      const hit = getHitDraggable()
      if (hit?.isTomo) {
        this.isDraggingTomo = true
        const hitPoint = new THREE.Vector3()
        this.raycaster.ray.intersectPlane(this.dragPlane, hitPoint)
        this.dragOffset.copy(this.tomo.group.position).sub(hitPoint)
      } else if (hit?.item) {
        this.draggingItem = hit.item
        const hitPoint = new THREE.Vector3()
        this.raycaster.ray.intersectPlane(this.dragPlane, hitPoint)
        this.dragOffset.set(hit.item.group.position.x - hitPoint.x, 0, hit.item.group.position.z - hitPoint.z)
      } else {
        this.isDragging = true
        this.prevMouseX = e.clientX
        this.prevMouseY = e.clientY
      }
    })

    canvas.addEventListener('mousemove', (e) => {
      if (this.isDraggingTomo) {
        const rect = canvas.getBoundingClientRect()
        this.mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        this.mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        this.raycaster.setFromCamera(this.mouseVec, this.camera)

        const hitPoint = new THREE.Vector3()
        if (this.raycaster.ray.intersectPlane(this.dragPlane, hitPoint)) {
          this.targetPosX = Math.max(-1.2, Math.min(1.2, hitPoint.x + this.dragOffset.x))
          this.targetPosZ = Math.max(-0.8, Math.min(1.0, hitPoint.z + this.dragOffset.z))
        }
      } else if (this.draggingItem) {
        const rect = canvas.getBoundingClientRect()
        this.mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        this.mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        this.raycaster.setFromCamera(this.mouseVec, this.camera)
        const hitPoint = new THREE.Vector3()
        if (this.raycaster.ray.intersectPlane(this.dragPlane, hitPoint)) {
          this.draggingItem.startDragTo(hitPoint.x + this.dragOffset.x, hitPoint.z + this.dragOffset.z)
        }
      } else if (this.isDragging) {
        const dx = e.clientX - this.prevMouseX
        const dy = e.clientY - this.prevMouseY
        this.targetRotationY += dx * 0.01
        this.targetRotationX += dy * 0.01
        this.targetRotationX = Math.max(-0.3, Math.min(0.3, this.targetRotationX))
        this.prevMouseX = e.clientX
        this.prevMouseY = e.clientY
      }
    })

    canvas.addEventListener('mouseup', () => {
      this.isDragging = false
      if (this.isDraggingTomo) {
        this.isDraggingTomo = false
        this.bounceAmount = 1
      }
      if (this.draggingItem) {
        this.draggingItem.releaseDrag()
        this.draggingItem = null
      }
    })
    canvas.addEventListener('mouseleave', () => {
      this.isDragging = false
      this.isDraggingTomo = false
      if (this.draggingItem) {
        this.draggingItem.releaseDrag()
        this.draggingItem = null
      }
    })

    // ── 触摸支持 ──
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0]
        const rect = canvas.getBoundingClientRect()
        this.mouseVec.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1
        this.mouseVec.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1
        this.raycaster.setFromCamera(this.mouseVec, this.camera)

        const hit = getHitDraggable()
        if (hit?.isTomo) {
          this.isDraggingTomo = true
          const hitPoint = new THREE.Vector3()
          this.raycaster.ray.intersectPlane(this.dragPlane, hitPoint)
          this.dragOffset.copy(this.tomo.group.position).sub(hitPoint)
        } else if (hit?.item) {
          this.draggingItem = hit.item
          const hitPoint = new THREE.Vector3()
          this.raycaster.ray.intersectPlane(this.dragPlane, hitPoint)
          this.dragOffset.set(hit.item.group.position.x - hitPoint.x, 0, hit.item.group.position.z - hitPoint.z)
        } else {
          this.isDragging = true
          this.prevMouseX = touch.clientX
          this.prevMouseY = touch.clientY
        }
      }
    }, { passive: true })

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]

      if (this.isDraggingTomo) {
        const rect = canvas.getBoundingClientRect()
        this.mouseVec.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1
        this.mouseVec.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1
        this.raycaster.setFromCamera(this.mouseVec, this.camera)
        const hitPoint = new THREE.Vector3()
        if (this.raycaster.ray.intersectPlane(this.dragPlane, hitPoint)) {
          this.targetPosX = Math.max(-1.2, Math.min(1.2, hitPoint.x + this.dragOffset.x))
          this.targetPosZ = Math.max(-0.8, Math.min(1.0, hitPoint.z + this.dragOffset.z))
        }
      } else if (this.draggingItem) {
        const rect = canvas.getBoundingClientRect()
        this.mouseVec.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1
        this.mouseVec.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1
        this.raycaster.setFromCamera(this.mouseVec, this.camera)
        const hitPoint = new THREE.Vector3()
        if (this.raycaster.ray.intersectPlane(this.dragPlane, hitPoint)) {
          this.draggingItem.startDragTo(hitPoint.x + this.dragOffset.x, hitPoint.z + this.dragOffset.z)
        }
      } else if (this.isDragging) {
        const dx = touch.clientX - this.prevMouseX
        const dy = touch.clientY - this.prevMouseY
        this.targetRotationY += dx * 0.01
        this.targetRotationX += dy * 0.01
        this.targetRotationX = Math.max(-0.3, Math.min(0.3, this.targetRotationX))
        this.prevMouseX = touch.clientX
        this.prevMouseY = touch.clientY
      }
    }, { passive: true })

    canvas.addEventListener('touchend', () => {
      this.isDragging = false
      if (this.isDraggingTomo) {
        this.isDraggingTomo = false
        this.bounceAmount = 1
      }
      if (this.draggingItem) {
        this.draggingItem.releaseDrag()
        this.draggingItem = null
      }
    }, { passive: true })

    // ── 点击（短按，不是拖拽）──
    let downTime = 0
    let downX = 0, downY = 0
    canvas.addEventListener('mousedown', (e) => { downTime = Date.now(); downX = e.clientX; downY = e.clientY })
    canvas.addEventListener('click', (e) => {
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY)
      if (dist > 5 || Date.now() - downTime > 300) return

      const rect = canvas.getBoundingClientRect()
      this.mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      this.mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      this.raycaster.setFromCamera(this.mouseVec, this.camera)
      const hit = getHitDraggable()
      if (hit?.isTomo) {
        this.onTomoClick?.()
        this.wobbleAmount = 1
      } else if (hit?.item) {
        hit.item.triggerWobble()
        // 通知外部弹特写窗
        const merchInfo = (hit.item as any).merchInfo as { id: string; type: string; name: string } | undefined
        if (merchInfo) this.onMerchClick?.(merchInfo)
      }
    })

    // ── 双击重置 TOMO 位置 ──
    canvas.addEventListener('dblclick', () => {
      this.targetPosX = 0
      this.targetPosZ = 0
      this.targetRotationY = 0
      this.targetRotationX = 0
      this.bounceAmount = 1
    })
  }

  setEmotion(emotionId: string) {
    const emo = emotions.find(e => e.id === emotionId)
    if (!emo) return
    this.tomo.setEmotion(emo)
    this.particles.setEmotion(emo)
  }

  setCustomAccessory(accessory: string | null) { this.tomo.setCustomAccessory(accessory) }
  getCustomAccessories(): string[] { return this.tomo.getCustomAccessories() }
  toggleCustomAccessory(accessory: string): boolean { return this.tomo.toggleCustomAccessory(accessory) }
  setBodyColor(color: number) { this.tomo.setBodyColor(color) }
  resetRotation() { this.targetRotationY = 0; this.targetRotationX = 0 }
  setZoom(zoom: number) { this.targetZoom = Math.max(3, Math.min(12, zoom)) }

  screenshot(): string {
    this.renderer.render(this.scene, this.camera)
    return this.renderer.domElement.toDataURL('image/png')
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate)
    const delta = this.clock.getDelta()
    const elapsed = this.clock.getElapsedTime()

    // 旋转平滑
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.08
    this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.08
    // 没拖拽时缓慢自转
    if (!this.isDragging && !this.isDraggingTomo) {
      this.targetRotationY += 0.001
    }
    this.tomo.group.rotation.y = this.currentRotationY
    this.tomo.group.rotation.x = this.currentRotationX

    // 位置平滑 - TOMO 在桌面上滑动
    this.currentPosX += (this.targetPosX - this.currentPosX) * 0.15
    this.currentPosZ += (this.targetPosZ - this.currentPosZ) * 0.15
    this.tomo.group.position.x = this.currentPosX
    this.tomo.group.position.z = this.currentPosZ

    // 摇晃动画（点击触发）
    if (this.wobbleAmount > 0) {
      this.wobblePhase += delta * 15
      this.wobbleAmount -= delta * 3
      if (this.wobbleAmount < 0) this.wobbleAmount = 0
      const wobble = Math.sin(this.wobblePhase) * this.wobbleAmount * 0.15
      this.tomo.group.rotation.z = wobble
    } else {
      this.tomo.group.rotation.z *= 0.9
    }

    // 弹跳动画（放下时触发）
    if (this.bounceAmount > 0) {
      this.bouncePhase += delta * 10
      this.bounceAmount -= delta * 2.5
      if (this.bounceAmount < 0) this.bounceAmount = 0
      const bounce = Math.abs(Math.sin(this.bouncePhase)) * this.bounceAmount * 0.2
      this.tomo.group.position.y = 0.35 + bounce
    } else {
      this.tomo.group.position.y += (0.35 - this.tomo.group.position.y) * 0.1
    }

    // 缩放平滑
    this.currentZoom += (this.targetZoom - this.currentZoom) * 0.1
    this.camera.position.z = this.currentZoom

    this.tomo.update(delta, elapsed)
    this.particles.update(delta, elapsed)
    this.foodBuddies.forEach(b => b.update(delta, elapsed))
    this.draggables.forEach(d => d.update(delta))

    this.halo.rotation.z = elapsed * 0.2
    this.halo.scale.setScalar(1 + Math.sin(elapsed * 1.5) * 0.03)
    // 光环跟随 TOMO
    this.halo.position.x = this.currentPosX
    this.halo.position.z = this.currentPosZ

    if (this.starsField && this.starsField.visible) {
      this.starsField.rotation.y = elapsed * 0.02
    }

    this.renderer.render(this.scene, this.camera)
  }

  private onResize = () => {
    if (!this.container) return
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  dispose() {
    cancelAnimationFrame(this.animationId)
    window.removeEventListener('resize', this.onResize)
    this.tomo?.dispose()
    this.particles?.dispose()
    this.foodBuddies.forEach(b => b.dispose())
    this.draggables.forEach(d => d.dispose())
    this.renderer?.dispose()
    if (this.renderer?.domElement?.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
  }
}
