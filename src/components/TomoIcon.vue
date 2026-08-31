<template>
  <svg
    class="tomo-icon"
    :class="{ 'tomo-icon--flat': flat }"
    viewBox="0 0 32 32"
    :width="size"
    :height="size"
    aria-hidden="true"
    v-html="markup"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TOMO_ICONS } from '../icons/tomoIcons'

const props = withDefaults(defineProps<{
  name: string
  size?: number | string
  flat?: boolean
}>(), { size: '1em', flat: false })

const markup = computed(() => TOMO_ICONS[props.name] || TOMO_ICONS['sparkle'])
</script>

<style scoped>
.tomo-icon {
  display: inline-block;
  vertical-align: -0.14em;
  overflow: visible;
  flex-shrink: 0;
}
.tomo-icon--flat { vertical-align: middle; }
</style>
