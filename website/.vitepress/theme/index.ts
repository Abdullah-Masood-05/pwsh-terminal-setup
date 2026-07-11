import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import TerminalDemo from './components/TerminalDemo.vue'
import DemoPrompt from './components/DemoPrompt.vue'
import DemoLigatures from './components/DemoLigatures.vue'
import DemoHistory from './components/DemoHistory.vue'
import Home from './components/Home.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: DefaultTheme.Layout,
  enhanceApp({ app }) {
    app.component('TerminalDemo', TerminalDemo)
    app.component('DemoPrompt', DemoPrompt)
    app.component('DemoLigatures', DemoLigatures)
    app.component('DemoHistory', DemoHistory)
    app.component('Home', Home)
  },
} satisfies Theme
