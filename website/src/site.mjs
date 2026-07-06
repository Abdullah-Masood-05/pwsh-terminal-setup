// site.mjs — the page manifest. Each module default-exports a page descriptor
// { route, section, title, description, body }.
import home from './pages/home.mjs'
import overview from './pages/docs/overview.mjs'
import requirements from './pages/docs/requirements.mjs'
import installInstaller from './pages/docs/install-installer.mjs'
import manualSetup from './pages/docs/manual-setup.mjs'
import installerOptions from './pages/docs/installer-options.mjs'
import commands from './pages/docs/commands.mjs'
import customization from './pages/docs/customization.mjs'
import troubleshooting from './pages/docs/troubleshooting.mjs'
import faq from './pages/docs/faq.mjs'

export const pages = [
  home,
  overview,
  requirements,
  installInstaller,
  manualSetup,
  installerOptions,
  commands,
  customization,
  troubleshooting,
  faq,
]
