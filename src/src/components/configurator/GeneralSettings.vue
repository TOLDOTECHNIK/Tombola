<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTombola } from '../../services/TombolaService'

const { t } = useI18n()
const tombola = useTombola()

const customMusicName = computed(() => tombola.settings.state.customMusicName)

function setTitle(value: string | number): void {
  tombola.settings.update((draft) => {
    draft.title = String(value ?? '')
  })
}

function setPrizeLabel(value: string | number): void {
  tombola.settings.update((draft) => {
    draft.prizeLabel = String(value ?? '')
  })
}

function setMusic(value: unknown): void {
  tombola.settings.update((draft) => {
    draft.backgroundMusic = Boolean(value)
  })
}

function setUnique(value: unknown): void {
  tombola.settings.update((draft) => {
    draft.uniqueNumbers = Boolean(value)
  })
}

function setReverse(value: unknown): void {
  tombola.settings.update((draft) => {
    draft.reversePrizeOrder = Boolean(value)
  })
}

async function chooseMusic(): Promise<void> {
  await tombola.chooseMusic()
}

async function clearCustomMusic(): Promise<void> {
  await tombola.clearCustomMusic()
}
</script>

<template>
  <div class="space-y-5">
    <h3 class="text-lg font-semibold">{{ t('config.general.title') }}</h3>

    <h4 class="font-semibold">{{ t('config.text.title') }}</h4>

    <UFormField :label="t('config.text.tombolaTitle')">
      <UInput
        :model-value="tombola.settings.state.title"
        class="w-full"
        @update:model-value="setTitle"
      />
    </UFormField>

    <UFormField :label="t('config.text.prizeLabel')">
      <UInput
        :model-value="tombola.settings.state.prizeLabel"
        class="w-full"
        @update:model-value="setPrizeLabel"
      />
    </UFormField>

    <USeparator />

    <h4 class="font-semibold">{{ t('config.general.options') }}</h4>

    <div class="flex items-center justify-between gap-4">
      <span>{{ t('config.general.music') }}</span>
      <USwitch :model-value="tombola.settings.state.backgroundMusic" @update:model-value="setMusic" />
    </div>

    <div class="flex flex-wrap items-center gap-2 ps-1">
      <UButton icon="i-lucide-upload" size="sm" variant="soft" @click="chooseMusic">
        {{ t('config.general.chooseMusic') }}
      </UButton>
      <span class="max-w-[16rem] truncate text-xs text-muted">
        {{ customMusicName || t('config.general.defaultMusic') }}
      </span>
      <UButton
        v-if="customMusicName"
        icon="i-lucide-x"
        size="sm"
        color="neutral"
        variant="ghost"
        @click="clearCustomMusic"
      >
        {{ t('config.general.resetMusic') }}
      </UButton>
    </div>

    <div class="flex items-center justify-between gap-4">
      <span>{{ t('config.general.unique') }}</span>
      <USwitch :model-value="tombola.settings.state.uniqueNumbers" @update:model-value="setUnique" />
    </div>

    <div class="flex items-center justify-between gap-4">
      <span>{{ t('config.general.reverse') }}</span>
      <USwitch
        :model-value="tombola.settings.state.reversePrizeOrder"
        @update:model-value="setReverse"
      />
    </div>
  </div>
</template>
