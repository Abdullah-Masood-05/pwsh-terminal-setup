<script setup>
// TerminalDemo.vue — the site's signature element (design B4): a fake Windows
// Terminal window (profile tab + min/max/close) with an accessible tablist
// (Default / After setup) and one slotted panel per tab. Full ARIA tab
// pattern: role="tablist"/"tab"/"tabpanel", roving tabindex, Arrow/Home/End
// keyboard navigation — ported from the old vanilla-JS demo tablist.
import { ref, computed } from 'vue'

const props = defineProps({
  file: { type: String, default: 'PowerShell 7' },
  label: { type: String, default: 'Terminal demo' },
  tabs: { type: Array, required: true }, // [{ id, label }]
  selected: { type: String, default: null },
  caption: { type: String, default: '' },
})

const uid = Math.random().toString(36).slice(2, 9)
const selectedId = ref(props.selected || props.tabs[props.tabs.length - 1].id)
const tabRefs = ref([])

function select(id) {
  selectedId.value = id
}

function onKeydown(e) {
  const ids = props.tabs.map((t) => t.id)
  const idx = ids.indexOf(selectedId.value)
  let next = -1
  if (e.key === 'ArrowRight') next = (idx + 1) % ids.length
  else if (e.key === 'ArrowLeft') next = (idx - 1 + ids.length) % ids.length
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = ids.length - 1
  else return
  e.preventDefault()
  selectedId.value = ids[next]
  const el = tabRefs.value[next]
  if (el) el.focus()
}
</script>

<template>
  <figure class="demo">
    <div class="demo__window">
      <div class="demo__bar">
        <span class="demo__wintab">
          <span class="demo__winicon" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4l3 3.5L3 11" /><path d="M8 11h5" /></svg>
          </span>
          <span class="demo__file">{{ file }}</span>
        </span>
        <span class="demo__winbtns" aria-hidden="true">
          <i class="demo__win demo__win--min"></i><i class="demo__win demo__win--max"></i><i class="demo__win demo__win--close"></i>
        </span>
      </div>
      <div class="demo__tabs" role="tablist" :aria-label="label" @keydown="onKeydown">
        <button
          v-for="(t, i) in tabs"
          :key="t.id"
          :ref="(el) => (tabRefs[i] = el)"
          class="demo__tab"
          role="tab"
          :id="`demo-${uid}__tab--${t.id}`"
          :aria-selected="selectedId === t.id ? 'true' : 'false'"
          :aria-controls="`demo-${uid}__panel--${t.id}`"
          :tabindex="selectedId === t.id ? 0 : -1"
          @click="select(t.id)"
        >{{ t.label }}</button>
      </div>
      <div class="demo__screen">
        <div
          v-for="t in tabs"
          :key="t.id"
          class="demo__panel"
          role="tabpanel"
          :id="`demo-${uid}__panel--${t.id}`"
          :aria-labelledby="`demo-${uid}__tab--${t.id}`"
          :data-panel="t.id"
          tabindex="0"
          v-show="selectedId === t.id"
        >
          <slot :name="t.id" />
        </div>
      </div>
    </div>
    <p v-if="caption" class="demo__caption">{{ caption }}</p>
  </figure>
</template>
