<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import LoadErrorRetry from '@/components/feedback/LoadErrorRetry.vue'
import BaseSpinner from '@/components/icon/BaseSpinner.vue'
import StaggeredListTransition from '@/components/layout/StaggeredListTransition.vue'
import BaseSegmentedControl, {
  type SegmentedControlOption,
} from '@/components/segmented-control/BaseSegmentedControl.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { readDesktopBridge } from '@/media/desktop-bridge'
import type {
  DesktopCaptureSource,
  DesktopCaptureSourceKind,
} from '@/media/desktop-bridge-contract'
import { describeError } from '@/services/describe-error'
import { RefreshIcon, ShareableScreenIcon, ShareableWindowIcon } from '@/theme/app-icons'
import DesktopSourceOption from './DesktopSourceOption.vue'

const SOURCE_KIND_TABS: SegmentedControlOption<DesktopCaptureSourceKind>[] = [
  { value: 'screen', label: 'Screens', icon: ShareableScreenIcon },
  { value: 'window', label: 'Windows', icon: ShareableWindowIcon },
]

const emptyListMessageByKind: Record<DesktopCaptureSourceKind, string> = {
  screen: 'No screens to share right now.',
  window: 'No open windows to share right now.',
}

const selectedSource = defineModel<DesktopCaptureSource | undefined>('selectedSource', {
  default: undefined,
})

const selectedKind = ref<DesktopCaptureSourceKind>('screen')
const captureSources = ref<DesktopCaptureSource[]>([])
const isLoading = ref(false)
const loadErrorMessage = ref<string>()

const visibleSources = computed(() =>
  captureSources.value.filter((captureSource) => captureSource.kind === selectedKind.value),
)

async function loadCaptureSources() {
  const desktopBridge = readDesktopBridge()
  if (!desktopBridge) {
    return
  }
  isLoading.value = true
  loadErrorMessage.value = undefined
  try {
    captureSources.value = await desktopBridge.listCaptureSources()
    const isSelectionStillListed = captureSources.value.some(
      (captureSource) => captureSource.id === selectedSource.value?.id,
    )
    if (!isSelectionStillListed) {
      selectedSource.value = undefined
    }
  } catch (loadError) {
    loadErrorMessage.value = describeError(loadError, 'Could not list your screens and windows')
  } finally {
    isLoading.value = false
  }
}

function handleSourceSelected(sourceId: string) {
  selectedSource.value = captureSources.value.find((captureSource) => captureSource.id === sourceId)
}

function handleRefreshButtonClick() {
  void loadCaptureSources()
}

onMounted(loadCaptureSources)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2">
      <BaseSegmentedControl
        v-model="selectedKind"
        :options="SOURCE_KIND_TABS"
        kind="tabs"
        accessible-label="What to share"
        class="flex-1"
      />
      <BaseIconButton
        :icon="RefreshIcon"
        accessible-label="Refresh screens and windows"
        variant="neutral"
        appearance="ghost"
        :is-loading="isLoading"
        @click="handleRefreshButtonClick"
      />
    </div>
    <LoadErrorRetry
      v-if="loadErrorMessage"
      :error-message="loadErrorMessage"
      @retry-requested="handleRefreshButtonClick"
    />
    <div v-else-if="isLoading && captureSources.length === 0" class="grid h-48 place-items-center">
      <BaseSpinner size="lg" accessible-label="Looking for screens and windows" />
    </div>
    <BaseText
      v-else-if="visibleSources.length === 0"
      size="sm"
      tone="subtle"
      class="py-12 text-center"
    >
      {{ emptyListMessageByKind[selectedKind] }}
    </BaseText>
    <StaggeredListTransition
      v-else
      :key="selectedKind"
      tag="ul"
      class="scrollbar-thin-on-hover scrollbar-gutter-stable grid max-h-72 grid-cols-2 gap-2 overflow-x-hidden overflow-y-auto sm:grid-cols-3"
    >
      <li
        v-for="(captureSource, listPosition) in visibleSources"
        :key="captureSource.id"
        :data-stagger-index="listPosition"
        class="min-w-0"
      >
        <DesktopSourceOption
          :source="captureSource"
          :is-selected="captureSource.id === selectedSource?.id"
          @selected="handleSourceSelected(captureSource.id)"
        />
      </li>
    </StaggeredListTransition>
  </div>
</template>
