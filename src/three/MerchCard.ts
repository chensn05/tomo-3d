import * as THREE from 'three'
import { DraggableItem } from './DraggableItem'

export interface MerchCardData {
  id: string
  imageUrl: string
  name: string
}

/**
 * 周边插画卡片 - 桌面上散落的可拖拽小卡片
 * 用 AI 插画贴图 + 白色卡纸边框，像一张张小卡片摆在桌上
 */
export function createMerchCard(data: MerchCardData, x: number, z: number): Promise<DraggableItem> {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader()
    loader.load(
      data.imageUrl,
      (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace

      const group = new THREE.Group()

      // 白色卡纸底板（略大于图片，模拟白边）
      const cardW = 0.32
      const cardH = 0.32
      const borderGeo = new THREE.BoxGeometry(cardW, 0.01, cardH)
      const borderMat = new THREE.MeshStandardMaterial({ color: 0xfffaf0, roughness: 0.8 })
      const border = new THREE.Mesh(borderGeo, borderMat)
      border.castShadow = true
      border.receiveShadow = true
      group.add(border)

      // 插画贴图（略小，居中）
      const imgSize = cardW * 0.86
      const imgGeo = new THREE.PlaneGeometry(imgSize, imgSize)
      const imgMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.6,
        transparent: true,
      })
      const imgPlane = new THREE.Mesh(imgGeo, imgMat)
      imgPlane.rotation.x = -Math.PI / 2
      imgPlane.position.y = 0.006
      group.add(imgPlane)

      // 随机初始旋转，像散落的卡片
      group.rotation.y = (Math.random() - 0.5) * 0.6

      const item = new DraggableItem(group, x, 0.02, z)
      item.boundsX = [-1.7, 1.7]
      item.boundsZ = [-1.0, 1.3]
      resolve(item)
      },
      undefined,
      (err) => {
        console.warn('[MerchCard] failed to load', data.imageUrl, err)
        reject(err)
      }
    )
  })
}
