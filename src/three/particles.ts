import * as THREE from 'three'
import { Emotion } from './emotions'

interface Particle {
  mesh: THREE.Mesh | THREE.Sprite
  velocity: THREE.Vector3
  life: number
  maxLife: number
  scale0: number
}

/**
 * 粒子系统 - 根据情绪生成不同粒子效果
 * - hearts: 飘心
 * - tears: 泪滴
 * - sparkles: 闪光
 * - fire: 怒火
 * - sweat: 汗珠
 */
export class ParticleSystem {
  group = new THREE.Group()
  private particles: Particle[] = []
  private currentType: string = 'none'
  private currentColor: number = 0xffffff
  private spawnTimer = 0

  // 复用纹理
  private heartTexture!: THREE.CanvasTexture
  private sparkleTexture!: THREE.CanvasTexture
  private tearTexture!: THREE.CanvasTexture

  constructor() {
    this.createTextures()
  }

  private createTextures() {
    // 爱心纹理
    const heartCanvas = document.createElement('canvas')
    heartCanvas.width = 64
    heartCanvas.height = 64
    const hctx = heartCanvas.getContext('2d')!
    hctx.fillStyle = '#ff9bb3'
    hctx.font = '48px Arial'
    hctx.textAlign = 'center'
    hctx.textBaseline = 'middle'
    hctx.fillText('♥', 32, 32)
    this.heartTexture = new THREE.CanvasTexture(heartCanvas)
    this.heartTexture.colorSpace = THREE.SRGBColorSpace

    // 闪光纹理 (星形)
    const sparkleCanvas = document.createElement('canvas')
    sparkleCanvas.width = 64
    sparkleCanvas.height = 64
    const sctx = sparkleCanvas.getContext('2d')!
    sctx.fillStyle = '#ffd700'
    sctx.beginPath()
    const cx = 32, cy = 32
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const r = i % 2 === 0 ? 28 : 10
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      if (i === 0) sctx.moveTo(x, y)
      else sctx.lineTo(x, y)
    }
    sctx.closePath()
    sctx.fill()
    this.sparkleTexture = new THREE.CanvasTexture(sparkleCanvas)
    this.sparkleTexture.colorSpace = THREE.SRGBColorSpace

    // 泪滴纹理
    const tearCanvas = document.createElement('canvas')
    tearCanvas.width = 32
    tearCanvas.height = 32
    const tctx = tearCanvas.getContext('2d')!
    tctx.fillStyle = '#64b5f6'
    tctx.beginPath()
    tctx.moveTo(16, 4)
    tctx.bezierCurveTo(4, 18, 8, 28, 16, 28)
    tctx.bezierCurveTo(24, 28, 28, 18, 16, 4)
    tctx.fill()
    this.tearTexture = new THREE.CanvasTexture(tearCanvas)
    this.tearTexture.colorSpace = THREE.SRGBColorSpace
  }

  setEmotion(emotion: Emotion) {
    this.currentType = emotion.particleType || 'none'
    this.currentColor = emotion.particleColor || 0xffffff
  }

  update(delta: number, elapsed: number) {
    // 生成新粒子
    if (this.currentType !== 'none') {
      this.spawnTimer += delta
      const spawnRate = this.getSpawnRate(this.currentType)
      if (this.spawnTimer >= spawnRate) {
        this.spawnTimer = 0
        this.spawnParticle()
      }
    }

    // 更现粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.life += delta

      if (p.life >= p.maxLife) {
        this.group.remove(p.mesh)
        p.mesh.geometry?.dispose()
        ;(p.mesh.material as THREE.Material)?.dispose()
        this.particles.splice(i, 1)
        continue
      }

      // 更新位置
      p.mesh.position.add(p.velocity.clone().multiplyScalar(delta))

      // 根据类型更新行为
      const t = p.life / p.maxLife
      switch (this.currentType) {
        case 'hearts':
          p.mesh.position.y += delta * 0.5
          p.velocity.x = Math.sin(elapsed * 3 + p.life * 5) * 0.3
          p.mesh.scale.setScalar(p.scale0 * (1 - t * 0.5))
          break
        case 'tears':
          p.velocity.y -= delta * 2 // 加速下落
          p.mesh.scale.setScalar(p.scale0 * (1 - t * 0.3))
          if (p.mesh.position.y < -0.8) {
            p.life = p.maxLife
          }
          break
        case 'sparkles':
          p.mesh.position.y += delta * 0.3
          const blink = Math.sin(elapsed * 10 + p.life * 8)
          p.mesh.scale.setScalar(p.scale0 * Math.max(0.1, blink))
          p.velocity.x *= 0.95
          p.velocity.z *= 0.95
          break
        case 'fire':
          p.mesh.position.y += delta * 1.5
          p.velocity.x = (Math.random() - 0.5) * 0.5
          p.mesh.scale.setScalar(p.scale0 * (1 - t))
          break
        case 'sweat':
          p.velocity.y -= delta * 1.5
          p.mesh.scale.setScalar(p.scale0 * (1 - t * 0.5))
          if (p.mesh.position.y < -0.5) {
            p.life = p.maxLife
          }
          break
      }

      // 淡出
      if (p.mesh.material instanceof THREE.SpriteMaterial) {
        p.mesh.material.opacity = 1 - t
      } else if (p.mesh.material instanceof THREE.MeshBasicMaterial) {
        p.mesh.material.opacity = 1 - t
      }
    }
  }

  private getSpawnRate(type: string): number {
    switch (type) {
      case 'hearts': return 0.15
      case 'tears': return 0.12
      case 'sparkles': return 0.1
      case 'fire': return 0.08
      case 'sweat': return 0.3
      default: return 1
    }
  }

  private spawnParticle() {
    const type = this.currentType
    let mesh: THREE.Mesh | THREE.Sprite
    let velocity = new THREE.Vector3()
    let maxLife = 2
    let scale0 = 0.15

    switch (type) {
      case 'hearts': {
        const mat = new THREE.SpriteMaterial({
          map: this.heartTexture,
          transparent: true,
          opacity: 1,
        })
        mesh = new THREE.Sprite(mat)
        mesh.position.set(
          (Math.random() - 0.5) * 0.6,
          0.3 + Math.random() * 0.3,
          0.5
        )
        velocity.set(
          (Math.random() - 0.5) * 0.5,
          0.8 + Math.random() * 0.4,
          (Math.random() - 0.5) * 0.3
        )
        maxLife = 2.5
        scale0 = 0.12 + Math.random() * 0.08
        break
      }
      case 'tears': {
        const mat = new THREE.SpriteMaterial({
          map: this.tearTexture,
          transparent: true,
          opacity: 1,
        })
        mesh = new THREE.Sprite(mat)
        const side = Math.random() > 0.5 ? 1 : -1
        mesh.position.set(side * 0.2, 0.1, 0.75)
        velocity.set(side * 0.3, 0.2, 0)
        maxLife = 3
        scale0 = 0.1 + Math.random() * 0.05
        break
      }
      case 'sparkles': {
        const mat = new THREE.SpriteMaterial({
          map: this.sparkleTexture,
          transparent: true,
          opacity: 1,
        })
        mesh = new THREE.Sprite(mat)
        mesh.position.set(
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 0.8 + 0.2,
          0.4
        )
        velocity.set(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        )
        maxLife = 1.5
        scale0 = 0.1 + Math.random() * 0.1
        break
      }
      case 'fire': {
        const geo = new THREE.ConeGeometry(0.06, 0.2, 4)
        const colors = [0xff4500, 0xff6347, 0xff8c00, 0xffd700]
        const color = colors[Math.floor(Math.random() * colors.length)]
        const mat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.8,
        })
        mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(
          (Math.random() - 0.5) * 0.5,
          0.7,
          0.3
        )
        velocity.set(
          (Math.random() - 0.5) * 0.3,
          1.5 + Math.random() * 0.5,
          (Math.random() - 0.5) * 0.2
        )
        maxLife = 0.8
        scale0 = 0.8 + Math.random() * 0.4
        break
      }
      case 'sweat': {
        const geo = new THREE.SphereGeometry(0.04, 6, 6)
        const mat = new THREE.MeshBasicMaterial({
          color: 0x90caf9,
          transparent: true,
          opacity: 0.8,
        })
        mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(
          0.3 + Math.random() * 0.2,
          0.3,
          0.7
        )
        velocity.set(0.1, 0.1, 0)
        maxLife = 2
        scale0 = 1
        break
      }
      default:
        return
    }

    mesh.scale.setScalar(scale0)
    this.group.add(mesh)
    this.particles.push({ mesh, velocity, life: 0, maxLife, scale0 })
  }

  dispose() {
    this.particles.forEach(p => {
      this.group.remove(p.mesh)
      p.mesh.geometry?.dispose()
      ;(p.mesh.material as THREE.Material)?.dispose()
    })
    this.particles = []
    this.heartTexture.dispose()
    this.sparkleTexture.dispose()
    this.tearTexture.dispose()
  }
}
