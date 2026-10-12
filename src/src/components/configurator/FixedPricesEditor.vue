<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { createId } from '../../core/id'
import { useTombola } from '../../services/TombolaService'

const { t } = useI18n()
const tombola = useTombola()

function add(): void {
  tombola.settings.update((draft) => {
    draft.fixedPrizes.push({ id: createId('fixed'), position: draft.fixedPrizes.length + 1, number: 0 })
  })
}

function remove(index: number): void {
  tombola.settings.update((draft) => {
    draft.fixedPrizes.splice(index, 1)
  })
}

function setPosition(index: number, value: number): void {
  tombola.settings.update((draft) => {
    const item = draft.fixedPrizes[index]
    if (item) item.position = Number(value) || 0
  })
}

function setNumber(index: number, value: number): void {
  tombola.settings.update((draft) => {
    const item = draft.fixedPrizes[index]
    if (item) item.number = Number(value) || 0
  })
}
</script>

<template>
  <div class="space-y-3">
    <div>
      <h4 class="font-semibold">{{ t('config.prizes.fixedTitle') }}</h4>
      <p class="text-sm text-muted">{{ t('config.prizes.fixedHint') }}</p>
    </div>

    <div
      v-for="(fixed, index) in tombola.settings.state.fixedPrizes"
      :key="fixed.id"
      class="flex items-end gap-2"
    >
      <UFormField :label="t('config.prizes.position')" class="w-28">
        <UInputNumber
          :model-value="fixed.position"
          :min="1"
          class="w-full"
          @update:model-value="(value: number) => setPosition(index, value)"
        />
      </UFormField>
      <UFormField :label="t('config.prizes.number')" class="w-32">
        <UInputNumber
          :model-value="fixed.number"
          class="w-full"
          @update:model-value="(value: number) => setNumber(index, value)"
        />
      </UFormField>
      <UButton
        icon="i-lucide-trash-2"
        color="error"
        variant="ghost"
        class="mb-0.5"
        @click="remove(index)"
      />
    </div>

    <UButton icon="i-lucide-plus" size="sm" variant="soft" @click="add">
      {{ t('config.prizes.addFixed') }}
    </UButton>
  </div>
</template>
