<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTombola } from '../../services/TombolaService'

const { t } = useI18n()
const tombola = useTombola()
const draft = ref('')

const numbers = computed(() =>
  [...tombola.settings.state.numbers].sort((a, b) => a - b)
)
const disabled = computed(() => new Set(tombola.settings.state.disabledNumbers))
const activeCount = computed(() => numbers.value.filter((n) => !disabled.value.has(n)).length)

function isDisabled(value: number): boolean {
  return disabled.value.has(value)
}

function add(): void {
  const value = Number.parseInt(draft.value, 10)
  if (!Number.isFinite(value)) return
  tombola.settings.update((state) => {
    state.numbers.push(value)
  })
  draft.value = ''
}

function remove(value: number): void {
  tombola.settings.update((state) => {
    const index = state.numbers.indexOf(value)
    if (index >= 0) state.numbers.splice(index, 1)
    state.disabledNumbers = state.disabledNumbers.filter((n) => n !== value)
  })
}

function toggle(value: number): void {
  tombola.settings.update((state) => {
    if (state.disabledNumbers.includes(value)) {
      state.disabledNumbers = state.disabledNumbers.filter((n) => n !== value)
    } else {
      state.disabledNumbers.push(value)
    }
  })
}

function setAll(enabled: boolean): void {
  tombola.settings.update((state) => {
    state.disabledNumbers = enabled ? [] : [...new Set(state.numbers)]
  })
}

function setQuantity(value: number): void {
  tombola.settings.update((state) => {
    state.random.quantity = Math.max(1, Number(value) || 1)
  })
}

/** Replaces the whole number list with a fresh set of random numbers. */
function generate(): void {
  const generated = tombola.generateRandomNumbers()
  tombola.settings.update((state) => {
    state.numbers = generated
    state.disabledNumbers = []
  })
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <h3 class="text-lg font-semibold">{{ t('config.numbers.title') }}</h3>
      <p class="text-sm text-muted">{{ t('config.numbers.hint') }}</p>
    </div>

    <div class="flex gap-2">
      <UInput
        v-model="draft"
        type="number"
        :placeholder="t('config.numbers.placeholder')"
        class="w-40"
        @keyup.enter="add"
      />
      <UButton icon="i-lucide-plus" @click="add">{{ t('config.numbers.add') }}</UButton>
    </div>

    <div class="flex flex-wrap items-center gap-3 rounded-lg border border-default p-3 text-sm">
      <span>{{ t('config.numbers.active') }}: <strong>{{ activeCount }}</strong> / {{ numbers.length }}</span>
      <UButton size="xs" color="neutral" variant="soft" @click="setAll(true)">
        {{ t('config.numbers.enableAll') }}
      </UButton>
      <span class="text-xs text-muted">{{ t('config.numbers.toggleHint') }}</span>
    </div>

    <div class="flex flex-wrap gap-2">
      <div
        v-for="number in numbers"
        :key="number"
        class="tt-num-chip inline-flex items-center overflow-hidden rounded-md border transition"
        :class="
          isDisabled(number)
            ? 'border-default opacity-50'
            : 'border-primary/60 bg-primary/10'
        "
      >
        <button
          type="button"
          class="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium"
          :class="{ 'line-through': isDisabled(number) }"
          :title="isDisabled(number) ? t('config.numbers.enabled') : t('config.numbers.disabled')"
          @click="toggle(number)"
        >
          <UIcon :name="isDisabled(number) ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-3.5" />
          {{ number }}
        </button>
        <button
          type="button"
          class="border-l border-default px-1.5 py-1.5 text-muted hover:text-error"
          :title="t('common.remove')"
          @click="remove(number)"
        >
          <UIcon name="i-lucide-x" class="size-3.5" />
        </button>
      </div>
    </div>

    <USeparator />

    <div class="space-y-3">
      <div>
        <h4 class="font-semibold">{{ t('random.title') }}</h4>
        <p class="text-sm text-muted">{{ t('random.hint') }}</p>
      </div>

      <div class="flex flex-wrap items-end gap-3">
        <UFormField :label="t('random.quantity')" class="w-40">
          <UInputNumber
            :model-value="tombola.settings.state.random.quantity"
            :min="1"
            class="w-full"
            @update:model-value="setQuantity"
          />
        </UFormField>
        <UButton icon="i-lucide-dice-5" variant="soft" @click="generate">
          {{ t('common.generate') }}
        </UButton>
      </div>
    </div>
  </div>
</template>
