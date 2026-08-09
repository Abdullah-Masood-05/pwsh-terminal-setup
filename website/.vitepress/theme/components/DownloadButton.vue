<script setup>
import { onMounted, ref } from 'vue'

defineProps({
  label: { type: String, default: 'Download installer' },
})

const repo = 'Abdullah-Masood-05/pwsh-terminal-setup'
const releasesPage = `https://github.com/${repo}/releases`

// Points at the releases page until the latest .exe asset resolves, then
// switches to a direct download link so the button never blocks on the API.
const downloadUrl = ref(releasesPage)
const downloadIsDirect = ref(false)

onMounted(async () => {
  try {
    const resp = await fetch(`https://api.github.com/repos/${repo}/releases/latest`)
    if (!resp.ok) throw new Error(String(resp.status))
    const release = await resp.json()
    const asset = (release.assets ?? []).find((a) => /\.exe$/i.test(a.name))
    if (asset) {
      downloadUrl.value = asset.browser_download_url
      downloadIsDirect.value = true
    }
  } catch {
    // Rate-limited or offline: keep the releases-page fallback.
  }
})
</script>

<template>
  <a
    class="btn btn--primary"
    :href="downloadUrl"
    :download="downloadIsDirect ? '' : null"
    target="_blank"
    rel="noopener"
  >{{ label }} <span class="ext" aria-hidden="true">↗</span></a>
</template>
