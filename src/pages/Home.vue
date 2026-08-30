<template>
  <div class="home-container">
    <img class="home-title-art" src="/brand/tomo-title.svg" alt="TOMO" />
    <div class="home-subtitle">一颗有情绪的番茄</div>
    <button class="home-enter-btn" @click="enterStory">进入 TOMO 的世界 →</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function enterStory() {
  router.push('/story')
}
</script>

<style scoped>
.home-container {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  pointer-events: auto;
}
.home-title-art {
  width: min(360px, 72vw);
  height: auto;
  filter: drop-shadow(2px 4px 0 rgba(120, 78, 48, 0.12));
  animation: titleIn 1s cubic-bezier(0.4, 0, 0.2, 1) both;
  text-align: center;
}
@keyframes titleIn {
  from { opacity: 0; transform: translateY(30px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.home-subtitle {
  font-size: clamp(14px, 3vw, 18px);
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8px;
  letter-spacing: 4px;
  animation: fadeIn 1.5s ease 0.3s both;
  text-align: center;
}
.home-enter-btn {
  margin-top: 40px;
  padding: 14px 40px;
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  border: none;
  border-radius: 100px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeIn 1.5s ease 0.6s both;
  box-shadow: 0 8px 30px rgba(255, 71, 87, 0.4);
}
.home-enter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(255, 71, 87, 0.6);
}
.home-enter-btn:active {
  transform: translateY(0);
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
