<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { LOCALE_FLAGS, SUPPORTED_LOCALES } from './i18n'
import type { Locale } from './core/types'
import { setupMainMenu } from './services/desktop'
import { useTombola } from './services/TombolaService'
import AboutView from './views/AboutView.vue'
import ConfiguratorView from './views/ConfiguratorView.vue'
import RunView from './views/RunView.vue'

const { t, locale } = useI18n()
const tombola = useTombola()
const view = ref<'configurator' | 'run' | 'about'>('configurator')
const ready = ref(false)
const exporting = ref(false)
const exportedPath = ref('')

async function exportApp(): Promise<void> {
  exporting.value = true
  exportedPath.value = ''
  try {
    const path = await tombola.exportStandalone({
      remaining: t('run.remaining'),
      spin: t('run.spin'),
      prev: t('run.prev'),
      next: t('run.next'),
      reset: t('run.reset'),
      ready: t('run.waiting'),
      finished: t('run.finished'),
      music: t('config.general.music'),
      fullscreen: t('run.fullscreen')
    })
    if (path) exportedPath.value = path
  } catch (error) {
    exportedPath.value = String(error)
  } finally {
    exporting.value = false
  }
}

function applyLocale(value: Locale): void {
  locale.value = value
  document.documentElement.lang = value
  void setupMainMenu({ appName: t('app.name'), quit: t('app.quit') })
}

function onGlobalKey(event: KeyboardEvent): void {
  // Esc closes the info/about panel back to the configurator.
  if (event.key === 'Escape' && view.value === 'about') {
    view.value = 'configurator'
  }
}

onMounted(async () => {
  await tombola.init()
  applyLocale(tombola.settings.state.locale)
  ready.value = true
  window.addEventListener('keydown', onGlobalKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKey)
})

watch(
  () => tombola.settings.state.locale,
  (value) => applyLocale(value)
)
</script>

<template>
  <UApp>
    <div class="flex h-screen flex-col bg-default text-default">
      <header
        v-if="view !== 'run'"
        class="flex flex-wrap items-center justify-between gap-4 border-b border-default px-6 py-3"
      >
        <div class="flex items-center gap-3">
          <img src="/icon.png" alt="" class="size-7" />
          <div>
            <div class="font-bold leading-tight">{{ t('app.name') }}</div>
            <div class="text-xs text-muted">{{ t('app.tagline') }}</div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1">
            <UButton
              v-for="entry in SUPPORTED_LOCALES"
              :key="entry.value"
              size="sm"
              color="info"
              :variant="tombola.settings.state.locale === entry.value ? 'soft' : 'ghost'"
              @click="tombola.setLocale(entry.value)"
            >
  {{ LOCALE_FLAGS[entry.value] }} {{ entry.value.toUpperCase() }}
</UButton>
          </div>
          <UButton
            icon="i-lucide-share-2"
            color="neutral"
            variant="soft"
            :loading="exporting"
            @click="exportApp"
          >
            {{ t('nav.export') }}
          </UButton>
          <UButton icon="i-lucide-play" @click="view = 'run'">{{ t('nav.run') }}</UButton>
          <UButton
            icon="i-lucide-info"
            color="neutral"
            variant="ghost"
            @click="view = view === 'about' ? 'configurator' : 'about'"
          />
        </div>
      </header>

      <div
        v-if="exportedPath"
        class="flex items-center gap-2 border-b border-default bg-elevated px-6 py-1.5 text-xs text-muted"
      >
        <UIcon name="i-lucide-check" class="size-3.5 text-primary" />
        <span class="font-medium">{{ t('nav.exported') }}:</span>
        <span class="truncate" :title="exportedPath">{{ exportedPath }}</span>
        <button class="ms-auto hover:text-default" @click="exportedPath = ''">
          <UIcon name="i-lucide-x" class="size-3.5" />
        </button>
      </div>

      <main class="min-h-0 flex-1 overflow-hidden">
        <div v-if="!ready" class="flex h-full items-center justify-center">
          <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary" />
        </div>
        <template v-else>
          <div v-show="view === 'configurator'" class="h-full overflow-auto p-6">
            <ConfiguratorView />
          </div>
          <div v-if="view === 'run'" class="h-full">
            <RunView @back="view = 'configurator'" />
          </div>
          <div v-else-if="view === 'about'" class="h-full overflow-auto p-6">
            <AboutView @back="view = 'configurator'" />
          </div>
        </template>
      </main>
    </div>
  </UApp>
</template>
