<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TombolaStage from './TombolaStage.vue'
import { ODOMETER_DURATION } from '../core/constants'
import { useTombola } from '../services/TombolaService'

const { t } = useI18n()
const tombola = useTombola()

const previewNumber = computed(() => tombola.lastNumber.value || 999)
</script>

<template>
  <UCard class="h-full">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-semibold">{{ t('preview.title') }}</span>
        <!-- <UBadge color="neutral" variant="subtle">
          {{ tombola.unique ? `${tombola.remaining.value}` : '∞' }}
        </UBadge> -->
      </div>
    </template>

    <div class="aspect-video w-full overflow-hidden rounded-lg border border-default">
      <TombolaStage
        :stage-style="tombola.stageStyle"
        :title="tombola.settings.state.title"
        :prize-heading="tombola.prizeHeading"
        :prize-name="tombola.prize.value?.name ?? t('common.none')"
        :number="previewNumber"
        :duration="ODOMETER_DURATION"
        :digits="3"
        preview
      />
    </div>

    <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
      <UButton icon="i-lucide-chevron-left" color="neutral" variant="soft" @click="tombola.prev()" />
      <UButton icon="i-lucide-dices" :disabled="tombola.spinning.value" @click="tombola.spin()">
        {{ t('run.spin') }}
      </UButton>
      <UButton icon="i-lucide-chevron-right" color="neutral" variant="soft" @click="tombola.next()" />
      <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="ghost" @click="tombola.reset()" />
    </div>
  </UCard>
</template>
