<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { createPrize } from '../../core/defaults'
import { useTombola } from '../../services/TombolaService'
import FixedPricesEditor from './FixedPricesEditor.vue'

const { t } = useI18n()
const tombola = useTombola()

function updateName(index: number, value: string): void {
  tombola.settings.update((draft) => {
    const prize = draft.prizes[index]
    if (prize) prize.name = value
  })
}

function addPrize(): void {
  tombola.settings.update((draft) => {
    draft.prizes.push(createPrize())
  })
}

function removePrize(index: number): void {
  tombola.settings.update((draft) => {
    draft.prizes.splice(index, 1)
  })
}

function move(index: number, direction: -1 | 1): void {
  const target = index + direction
  tombola.settings.update((draft) => {
    if (target < 0 || target >= draft.prizes.length) return
    const [item] = draft.prizes.splice(index, 1)
    if (item) draft.prizes.splice(target, 0, item)
  })
}

/** 1-based prize number as shown to the audience (empty rows are skipped). */
function prizeNumber(index: number): number {
  if ((tombola.settings.state.prizes[index]?.name ?? '').trim().length === 0) return 0
  let number = 0
  for (let i = 0; i <= index; i++) {
    if ((tombola.settings.state.prizes[i]?.name ?? '').trim().length > 0) number++
  }
  return number
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <h3 class="text-lg font-semibold">{{ t('config.prizes.title') }}</h3>
      <p class="text-sm text-muted">{{ t('config.prizes.hint') }}</p>
    </div>

    <div class="space-y-2">
      <div
        v-for="(prize, index) in tombola.settings.state.prizes"
        :key="prize.id"
        class="flex items-center gap-2"
      >
        <span class="w-8 shrink-0 text-right text-sm text-muted">{{ prizeNumber(index) || '–' }}.</span>
        <UInput
          :model-value="prize.name"
          :placeholder="t('config.prizes.name')"
          class="flex-1"
          @update:model-value="(value: string | number) => updateName(index, String(value ?? ''))"
        />
        <UButton
          icon="i-lucide-chevron-up"
          color="neutral"
          variant="ghost"
          size="sm"
          :disabled="index === 0"
          @click="move(index, -1)"
        />
        <UButton
          icon="i-lucide-chevron-down"
          color="neutral"
          variant="ghost"
          size="sm"
          :disabled="index === tombola.settings.state.prizes.length - 1"
          @click="move(index, 1)"
        />
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="sm"
          @click="removePrize(index)"
        />
      </div>
    </div>

    <UButton icon="i-lucide-plus" variant="soft" @click="addPrize">
      {{ t('config.prizes.addPrize') }}
    </UButton>

    <USeparator />

    <FixedPricesEditor />
  </div>
</template>
