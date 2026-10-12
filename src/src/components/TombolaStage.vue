<script setup lang="ts">
import OdometerNumber from './OdometerNumber.vue'

withDefaults(
  defineProps<{
    stageStyle: Record<string, string>
    title: string
    prizeHeading: string
    prizeName: string
    number: number
    duration: number
    digits?: number
    preview?: boolean
    pulse?: boolean
  }>(),
  { preview: false, pulse: true }
)
</script>

<template>
  <div class="tt-stage" :class="{ 'tt-stage--preview': preview }" :style="stageStyle">
    <div class="tt-title">{{ title }}</div>

    <div class="tt-center">
      <OdometerNumber :value="number" :duration="duration" :digits="digits" />

      <div class="tt-prize-label">{{ prizeHeading }}</div>

      <div :key="prizeName" class="tt-prize-enter">
        <div class="tt-prize-name" :class="{ 'tt-prize-name--pulse': pulse }">
          {{ prizeName }}
        </div>
      </div>
    </div>

    <slot name="footer" />
  </div>
</template>
