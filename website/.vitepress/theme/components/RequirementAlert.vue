<script setup>
import { withBase } from 'vitepress'

defineProps({
  compact: { type: Boolean, default: false },
  noLink: { type: Boolean, default: false },
})
</script>

<template>
  <div class="req-alert" :class="{ 'req-alert--compact': compact }" role="alert">
    <svg class="req-alert__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2 1 21h22L12 2zm0 4.3L19.5 19h-15L12 6.3zM11 10v5h2v-5h-2zm0 6v2h2v-2h-2z"
      />
    </svg>
    <div class="req-alert__body">
      <p class="req-alert__title">Install PowerShell 7 first</p>
      <p class="req-alert__text">
        This setup needs <strong>PowerShell 7</strong> (<code>pwsh</code>). The
        <em>Windows PowerShell 5.1</em> that comes with Windows is <strong>not</strong> enough.
        Install the requirements before you run the installer.
      </p>
      <a v-if="!noLink" class="req-alert__link" :href="withBase('/docs/requirements')">See requirements and install steps →</a>
    </div>
  </div>
</template>
