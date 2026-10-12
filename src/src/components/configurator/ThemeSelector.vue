<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTombola } from '../../services/TombolaService'

const { t } = useI18n()
const tombola = useTombola()

function select(id: string): void {
  tombola.settings.update((draft) => {
    draft.themeId = id
  })
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <h3 class="text-lg font-semibold">{{ t('config.theme.title') }}</h3>
      <p class="text-sm text-muted">{{ t('config.theme.hint') }}</p>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <button
        v-for="theme in tombola.registry.all"
        :key="theme.id"
        type="button"
        class="group overflow-hidden rounded-xl border-2 text-left transition focus:outline-none"
        :class="
          tombola.settings.state.themeId === theme.id
            ? 'border-primary ring-2 ring-primary/40'
            : 'border-default hover:border-primary/50'
        "
        @click="select(theme.id)"
      >
        <div
          class="tt-theme-swatch flex items-end justify-center"
          :style="{ backgroundImage: `url(${theme.background})` }"
        >
          <span
            class="mb-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white shadow"
            :style="{ backgroundColor: theme.palette.odometerFrom }"
          >
            {{ t(theme.nameKey) }}
          </span>
        </div>
      </button>
    </div>
  </div>
</template>
