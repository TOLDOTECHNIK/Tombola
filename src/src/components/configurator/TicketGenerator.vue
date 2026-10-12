<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { TICKET_TEMPLATES, getTemplate } from '../../lose/templates'
import { TicketService } from '../../services/TicketService'
import { useTombola } from '../../services/TombolaService'

const { t } = useI18n()
const tombola = useTombola()
const service = new TicketService()

const templateId = ref(TICKET_TEMPLATES[0]?.id ?? 'classic')
const showIndex = ref(true)
const label = ref(t('lose.label'))
const title = ref(tombola.settings.state.title)
const busy = ref(false)
const status = ref('')

const template = computed(() => getTemplate(templateId.value))

const configuredNumbers = computed(() =>
  [...new Set(tombola.settings.state.numbers)].sort((a, b) => a - b)
)

const numbers = computed(() => configuredNumbers.value)

const layout = computed(() => service.layout(template.value, numbers.value.length))

function sampleSvg(id: string): string {
  const tmpl = getTemplate(id)
  return tmpl.render({
    number: 123,
    title: title.value || t('app.name'),
    label: label.value,
    index: 1,
    total: 1,
    showIndex: showIndex.value
  })
}

const previewSvg = computed(() =>
  template.value.render({
    number: numbers.value[0] ?? 0,
    title: title.value || t('app.name'),
    label: label.value,
    index: 1,
    total: numbers.value.length,
    showIndex: showIndex.value
  })
)

async function exportPdf(): Promise<void> {
  if (!numbers.value.length) return
  busy.value = true
  status.value = ''
  try {
    const bytes = await service.buildPdf({
      numbers: numbers.value,
      title: title.value || t('app.name'),
      label: label.value,
      template: template.value,
      showIndex: showIndex.value
    })
    const path = await window.tombola.savePdf('tombola-lose.pdf', bytes)
    status.value = path ? `${t('lose.exported')}: ${path}` : ''
  } catch (error) {
    status.value = `${t('lose.error')}: ${String(error)}`
  } finally {
    busy.value = false
  }
}

function exportCsv(): void {
  if (!numbers.value.length) return
  const header = `${t('lose.label')}\n`
  const rows = numbers.value.join('\n')
  const csv = new TextEncoder().encode(`${header}${rows}\n`)
  window.tombola.saveFile('tombola-lose.csv', csv, [
    { name: 'CSV', extensions: ['csv'] }
  ]).then((path) => {
    status.value = path ? `${t('lose.exported')}: ${path}` : ''
  })
}
</script>

<template>
  <div class="space-y-5">
    <div>
      <h3 class="text-lg font-semibold">{{ t('lose.title') }}</h3>
      <p class="text-sm text-muted">{{ t('lose.hint') }}</p>
    </div>

    <div>
      <p class="mb-2 text-sm font-medium">{{ t('lose.template') }}</p>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <button
          v-for="item in TICKET_TEMPLATES"
          :key="item.id"
          type="button"
          class="overflow-hidden rounded-xl border-2 p-1 text-left transition focus:outline-none"
          :class="
            templateId === item.id ? 'border-primary ring-2 ring-primary/40' : 'border-default hover:border-primary/50'
          "
          @click="templateId = item.id"
        >
          <div class="ticket-mini" v-html="sampleSvg(item.id)" />
          <span class="mt-1 block text-center text-[11px] font-medium">{{ t(item.nameKey) }}</span>
        </button>
      </div>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <UFormField :label="t('lose.label')">
        <UInput v-model="label" class="w-full" />
      </UFormField>
      <UFormField :label="t('config.text.tombolaTitle')">
        <UInput v-model="title" class="w-full" />
      </UFormField>
    </div>

    <div class="flex items-center justify-between gap-4 rounded-lg border border-default p-3">
      <div>
        <p class="text-sm font-medium">{{ t('lose.showIndex') }}</p>
        <p class="text-xs text-muted">{{ t('lose.showIndexHint') }}</p>
      </div>
      <USwitch v-model="showIndex" />
    </div>

    <div class="flex flex-wrap items-center gap-4 rounded-lg border border-default p-3 text-sm">
      <span>{{ t('lose.count') }}: <strong>{{ numbers.length }}</strong></span>
      <span>{{ t('lose.pages') }}: <strong>{{ layout.pages }}</strong></span>
      <span class="text-muted">{{ layout.columns }} × {{ layout.rows }} / A4</span>
    </div>

    <div class="space-y-2">
      <p class="text-sm font-medium">{{ t('lose.preview') }}</p>
      <div class="ticket-preview max-w-sm" v-html="previewSvg" />
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <UButton icon="i-lucide-file-down" :loading="busy" :disabled="!numbers.length" @click="exportPdf">
        {{ t('lose.export') }}
      </UButton>
      <UButton icon="i-lucide-file-spreadsheet" color="neutral" variant="ghost" :disabled="!numbers.length" @click="exportCsv">
        {{ t('lose.exportCsv') }}
      </UButton>
      <span v-if="status" class="text-xs text-muted">{{ status }}</span>
    </div>
  </div>
</template>
