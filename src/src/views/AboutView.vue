<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppInfo } from '../env'

const emit = defineEmits<{ back: [] }>()
const { t } = useI18n()
const info = ref<AppInfo | null>(null)

onMounted(async () => {
  info.value = await window.tombola.getAppInfo()
})
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('about.title') }}</h1>
      <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="emit('back')" />
    </div>

    <UCard>
      <div class="space-y-3">
        <p class="text-sm text-muted">{{ t('about.description') }}</p>
        <USeparator />
        <dl class="grid grid-cols-[140px_1fr] gap-2 text-sm">
          <dt class="text-muted">{{ t('about.version') }}</dt>
          <dd>{{ info?.version ?? '–' }}</dd>
          <dt class="text-muted">{{ t('about.platform') }}</dt>
          <dd>{{ info?.platform ?? '–' }}</dd>
          <dt class="text-muted">{{ t('about.storage') }}</dt>
          <dd class="break-all">{{ info?.userDataPath ?? '–' }}</dd>
        </dl>
      </div>
    </UCard>
  </div>
</template>
