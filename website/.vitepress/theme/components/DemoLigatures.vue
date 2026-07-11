<script setup>
import TerminalDemo from './TerminalDemo.vue'

defineProps({ caption: { type: String, default: '' } })

const tabs = [
  { id: 'before', label: 'Default' },
  { id: 'after', label: 'After setup' },
]
</script>

<template>
  <TerminalDemo label="Ligatures and icons" :tabs="tabs" :caption="caption">
    <template #before>
      <div class="demo__row"><span class="tok-comment"># operators not joined, icons are boxes</span></div>
      <div class="demo__row"><span class="tok-plain">if (a ==&gt; b -&gt; c != d &gt;= e &lt;= f) {</span></div>
      <div class="demo__row">&nbsp;&nbsp;<span class="demo__tofu" aria-hidden="true"></span> <span class="tok-branch">main</span>&nbsp;&nbsp;<span class="demo__tofu" aria-hidden="true"></span> <span class="tok-path">src</span></div>
      <div class="demo__row"><span class="tok-plain">}</span> <span class="demo__cursor" aria-hidden="true"></span></div>
    </template>
    <template #after>
      <div class="demo__row"><span class="tok-comment"># operators joined, icons render</span></div>
      <div class="demo__row"><span class="tok-plain">if (a ==&gt; b -&gt; c != d &gt;= e &lt;= f) {</span></div>
      <div class="demo__row">&nbsp;&nbsp;<svg class="branch-ico" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="4.5" cy="3.5" r="1.5" /><circle cx="4.5" cy="12.5" r="1.5" /><circle cx="11.5" cy="4.5" r="1.5" /><path d="M4.5 5v6" /><path d="M11.5 6c0 3.2-3 3.2-5 4.2" /></svg> <span class="tok-branch">main</span>&nbsp;&nbsp;<svg class="branch-ico" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 4.5a1 1 0 0 1 1-1H6l1.5 1.5h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z" /></svg> <span class="tok-path">src</span></div>
      <div class="demo__row"><span class="tok-plain">}</span> <span class="demo__cursor" aria-hidden="true"></span></div>
    </template>
  </TerminalDemo>
</template>
