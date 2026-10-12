<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Odometer from 'odometer'

const props = withDefaults(
  defineProps<{
    value: number
    duration?: number
    /** Limit the display to the N least-significant digits (omit = full value). */
    digits?: number
  }>(),
  { duration: 7000 }
)

const root = ref<HTMLDivElement | null>(null)
let odometer: Odometer | null = null
let initialized = false

/** odometer renders one element per value digit, so trim the value to `digits`. */
const displayValue = computed(() => {
  const digits = props.digits
  if (!digits || digits < 1) return props.value
  const mod = 10 ** Math.min(6, digits)
  return ((props.value % mod) + mod) % mod
})

function create(): void {
  if (!root.value || initialized) return
  root.value.innerHTML = ''
  odometer = new Odometer({
    el: root.value,
    value: displayValue.value,
    duration: props.duration
  })
  initialized = true
}

function recreate(): void {
  initialized = false
  odometer = null
  create()
}

onMounted(() => {
  // The odometer reads the digit widths from the DOM, so wait a frame.
  requestAnimationFrame(create)
})

watch(displayValue, (value) => {
  create()
  odometer?.update(value)
})

watch(() => props.duration, recreate)
watch(() => props.digits, recreate)

onBeforeUnmount(() => {
  odometer = null
})
</script>

<template>
  <div ref="root" class="tt-odometer" />
</template>
