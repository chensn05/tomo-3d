import * as THREE from 'three'

/**
 * 通用可拖拽物体 - 封装位置动画（平滑移动/弹跳/摇晃）
 * TOMO、食物小伙伴、周边卡片、3D周边都可以用这套物理
 */
export class DraggableItem {
  group: THREE.Group
  baseY: number

  targetX: number
  targetZ: number
  currentX: number
  currentZ: number

  bounceAmount = 0
  bouncePhase = 0
  wobbleAmount = 0
  wobblePhase = 0

  boundsX: [number, number] = [-1.6, 1.6]
  boundsZ: [number, number] = [-1.0, 1.2]

  onClick?: () => void

  constructor(group: THREE.Group, x: number, y: number, z: number) {
    this.group = group
    this.baseY = y
    this.targetX = x
    this.targetZ = z
    this.currentX = x
    this.currentZ = z
    group.position.set(x, y, z)
  }

  startDragTo(x: number, z: number) {
    this.targetX = Math.max(this.boundsX[0], Math.min(this.boundsX[1], x))
    this.targetZ = Math.max(this.boundsZ[0], Math.min(this.boundsZ[1], z))
  }

  releaseDrag() {
    this.bounceAmount = 1
  }

  triggerWobble() {
    this.wobbleAmount = 1
  }

  update(delta: number) {
    this.currentX += (this.targetX - this.currentX) * 0.15
    this.currentZ += (this.targetZ - this.currentZ) * 0.15
    this.group.position.x = this.currentX
    this.group.position.z = this.currentZ

    // 摇晃
    if (this.wobbleAmount > 0) {
      this.wobblePhase += delta * 15
      this.wobbleAmount -= delta * 3
      if (this.wobbleAmount < 0) this.wobbleAmount = 0
      this.group.rotation.z = Math.sin(this.wobblePhase) * this.wobbleAmount * 0.15
    } else {
      this.group.rotation.z *= 0.9
    }

    // 弹跳
    if (this.bounceAmount > 0) {
      this.bouncePhase += delta * 10
      this.bounceAmount -= delta * 2.5
      if (this.bounceAmount < 0) this.bounceAmount = 0
      const bounce = Math.abs(Math.sin(this.bouncePhase)) * this.bounceAmount * 0.15
      this.group.position.y = this.baseY + bounce
    } else {
      this.group.position.y += (this.baseY - this.group.position.y) * 0.1
    }
  }

  dispose() {
    this.group.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose()
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach(m => {
          if ((m as any).map) (m as any).map.dispose()
          m.dispose()
        })
      }
    })
  }
}
