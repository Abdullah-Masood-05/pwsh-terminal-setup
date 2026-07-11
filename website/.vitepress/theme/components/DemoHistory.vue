<script setup>
import TerminalDemo from './TerminalDemo.vue'

defineProps({
  caption: {
    type: String,
    default: 'Reverse history search that finds matching commands as you type.',
  },
})

const tabs = [
  { id: 'before', label: 'Default' },
  { id: 'after', label: 'After setup' },
]
</script>

<template>
  <TerminalDemo label="History search" :tabs="tabs" :caption="caption">
    <template #before>
      <div class="demo__row"><span class="tok-comment"># up-arrow recalls the last command, one at a time</span></div>
      <div class="demo__row"><span class="tok-sym">&#10095;</span> <span class="tok-cmd">git</span> <span class="tok-plain">push origin main</span> <span class="demo__cursor" aria-hidden="true"></span></div>
    </template>
    <template #after>
      <div class="demo__row"><span class="tok-sym">&#10095;</span> <span class="tok-cmd">git</span> <span class="demo__cursor" aria-hidden="true"></span></div>
      <div class="demo__hist">
        <div class="demo__row">&nbsp;&nbsp;<span class="tok-cmd">git</span><span class="tok-plain"> push origin main</span></div>
        <div class="demo__row">&nbsp;&nbsp;<span class="tok-cmd">git</span><span class="tok-plain"> pull --rebase</span></div>
        <div class="demo__row">&nbsp;&nbsp;<span class="tok-cmd">git</span><span class="tok-plain"> status</span></div>
      </div>
    </template>
  </TerminalDemo>
</template>
