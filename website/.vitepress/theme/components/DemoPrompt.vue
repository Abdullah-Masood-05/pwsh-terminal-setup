<script setup>
import TerminalDemo from './TerminalDemo.vue'

defineProps({ caption: { type: String, default: '' } })

const tabs = [
  { id: 'before', label: 'Default' },
  { id: 'after', label: 'After setup' },
]
</script>

<template>
  <TerminalDemo label="Prompt comparison" :tabs="tabs" :caption="caption">
    <template #before>
      <div class="demo__row"><span class="tok-param">Windows PowerShell</span></div>
      <div class="demo__row"><span class="tok-param">PS C:\Users\you\Desktop\project&gt;</span> <span class="demo__cursor" aria-hidden="true"></span></div>
    </template>
    <template #after>
      <div class="demo__row"><span class="tok-path">~\Desktop\project</span>&nbsp;&nbsp;<svg class="branch-ico" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="4.5" cy="3.5" r="1.5" /><circle cx="4.5" cy="12.5" r="1.5" /><circle cx="11.5" cy="4.5" r="1.5" /><path d="M4.5 5v6" /><path d="M11.5 6c0 3.2-3 3.2-5 4.2" /></svg> <span class="tok-branch">main</span></div>
      <div class="demo__row"><span class="tok-sym">&#10095;</span> <span class="tok-cmd">git</span> <span class="tok-plain">status</span> <span class="demo__cursor" aria-hidden="true"></span></div>
    </template>
  </TerminalDemo>
</template>
