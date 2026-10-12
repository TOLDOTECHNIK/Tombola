<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PreviewPane from '../components/PreviewPane.vue'
import GeneralSettings from '../components/configurator/GeneralSettings.vue'
import NumbersEditor from '../components/configurator/NumbersEditor.vue'
import PrizesEditor from '../components/configurator/PrizesEditor.vue'
import ThemeSelector from '../components/configurator/ThemeSelector.vue'
import TicketGenerator from '../components/configurator/TicketGenerator.vue'

const { t } = useI18n()
const tab = ref('general')

const tabs = computed(() => [
  { label: t('config.tabs.general'), icon: 'i-lucide-settings-2', value: 'general', slot: 'general' },
  { label: t('config.tabs.theme'), icon: 'i-lucide-palette', value: 'theme', slot: 'theme' },
  { label: t('config.tabs.prizes'), icon: 'i-lucide-gift', value: 'prizes', slot: 'prizes' },
  { label: t('config.tabs.numbers'), icon: 'i-lucide-hash', value: 'numbers', slot: 'numbers' },
  { label: t('config.tabs.tickets'), icon: 'i-lucide-ticket', value: 'tickets', slot: 'tickets' }
])
</script>

<template>
  <div class="grid h-full min-h-0 gap-6 lg:grid-cols-[1fr_minmax(340px,42%)]">
    <div class="flex min-h-0 flex-col gap-4">
      <div>
        <h1 class="text-2xl font-bold">{{ t('config.title') }}</h1>
        <p class="text-sm text-muted">{{ t('config.subtitle') }}</p>
      </div>

      <UCard class="min-h-0 flex-1 overflow-auto">
        <UTabs v-model="tab" :items="tabs" variant="link" :ui="{ list: 'sticky top-0 z-10 bg-default/95 backdrop-blur' }">
          <template #general><GeneralSettings /></template>
          <template #theme><ThemeSelector /></template>
          <template #prizes><PrizesEditor /></template>
          <template #numbers><NumbersEditor /></template>
          <template #tickets><TicketGenerator /></template>
        </UTabs>
      </UCard>
    </div>

    <div class="min-h-0">
      <PreviewPane />
    </div>
  </div>
</template>
