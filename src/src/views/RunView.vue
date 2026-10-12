<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import TombolaStage from '../components/TombolaStage.vue'
import { ODOMETER_DURATION } from '../core/constants'
import { useTombola } from '../services/TombolaService'

const emit = defineEmits<{ back: [] }>()
const { t } = useI18n()
const tombola = useTombola()

const isFullscreen = ref(false)
const idle = ref(false)
const locked = ref(false)
const armed = ref(false)
let idleTimer: ReturnType<typeof setTimeout> | null = null
let removeFullscreenListener: (() => void) | null = null
let mounted = true

const statusText = computed(() => {
  if (tombola.finished) return t('run.finished')
  if (locked.value) return t('run.locked')
  return t('run.waiting')
})

const remainingText = computed(() => (tombola.unique ? String(tombola.remaining.value) : '∞'))

function spin(): void {
  if (locked.value) return
  // Never start a new roll while the odometer is still spinning.
  if (tombola.spinning.value) return
  tombola.spin()
}

function showControls(): void {
  idle.value = false
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(() => {
    idle.value = true
  }, 1600)
}

function hideControls(): void {
  if (idleTimer) {
    clearTimeout(idleTimer)
    idleTimer = null
  }
  idle.value = true
}

// After a roll finishes the bar stays hidden until the mouse moves again.
watch(
  () => tombola.spinning.value,
  (value, previous) => {
    if (previous && !value) hideControls()
  }
)

function onKeyDown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      emit('back')
      break
    case 'Shift':
      locked.value = true
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      spin()
      break
    case 'ArrowRight':
      event.preventDefault()
      tombola.next()
      break
    case 'ArrowLeft':
      event.preventDefault()
      tombola.prev()
      break
    case 'ArrowUp':
    case 'ArrowDown':
      event.preventDefault()
      break
    case 's':
    case 'S':
      tombola.toggleMusic()
      break
  }
}

function onKeyUp(event: KeyboardEvent): void {
  if (event.key === 'Shift') locked.value = false
}

function onFullscreen(value: boolean): void {
  isFullscreen.value = value
  if (value) {
    armed.value = true
  } else if (armed.value && mounted) {
    // Leaving full screen (e.g. via the OS Esc handling) returns to the editor.
    emit('back')
  }
}

onMounted(async () => {
  isFullscreen.value = await window.tombola.isFullscreen()
  if (isFullscreen.value) {
    armed.value = true
  } else {
    isFullscreen.value = await window.tombola.setFullscreen(true)
    if (isFullscreen.value) armed.value = true
  }
  removeFullscreenListener = window.tombola.onFullscreenChange(onFullscreen)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('mousemove', showControls)
  tombola.setLive(true)
  showControls()
})

onBeforeUnmount(() => {
  mounted = false
  tombola.setLive(false)
  if (idleTimer) clearTimeout(idleTimer)
  removeFullscreenListener?.()
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('mousemove', showControls)
  void window.tombola.setFullscreen(false)
})
</script>

<template>
  <div class="h-full w-full" :class="{ 'tt-hidden-cursor': idle }">
    <TombolaStage
      :stage-style="tombola.stageStyle"
      :title="tombola.settings.state.title"
      :prize-heading="tombola.prizeHeading"
      :prize-name="tombola.prize.value?.name ?? t('common.none')"
      :number="tombola.lastNumber.value || 999"
      :duration="ODOMETER_DURATION"
    >
      <template #footer>
        <div class="tt-footer-wrap" :class="{ 'tt-footer-wrap--hidden': idle }">
          <div class="tt-footer">
            <span class="tt-chip">{{ statusText }}</span>
            <span class="tt-chip">{{ t('run.remaining') }}: {{ remainingText }}</span>
            <UButton icon="i-lucide-chevron-left" color="neutral" variant="soft" @click="tombola.prev()" />
            <UButton icon="i-lucide-dices" size="lg" :disabled="tombola.spinning.value" @click="spin">
              {{ t('run.spin') }}
            </UButton>
            <UButton icon="i-lucide-chevron-right" color="neutral" variant="soft" @click="tombola.next()" />
            <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="ghost" @click="tombola.reset()" />
            <UButton icon="i-lucide-settings" color="neutral" variant="ghost" @click="emit('back')" />
          </div>
        </div>
      </template>
    </TombolaStage>
  </div>
</template>
