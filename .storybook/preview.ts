import type { Preview } from '@storybook/react-vite'
import '../src/index.css';
import { withThemeByClassName, withThemeByDataAttribute } from '@storybook/addon-themes';
import i18n from './i18next';
// MSW: initialize and provide global handlers + loader
import { initialize, mswLoader } from 'msw-storybook-addon'
import { handlers as mswHandlers } from './msw/handlers'

// Initialize MSW (uses public/mockServiceWorker.js by default per project config)
initialize()

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },
    i18n,
    // MSW global handlers (can be overridden per-story)
    msw: { handlers: mswHandlers },
  },
  initialGlobals: {
    locale: 'zh_CN',
    locales: {
      en: {icon: '🇺🇸', title: 'English', right: 'EN'},
      zh_CN: {icon: '🇨🇳', title: '简体中文', right: 'ZH'},
    },
  },
  // Provide the MSW addon loader globally
  loaders: [mswLoader],
};

export const decorators = [
  withThemeByClassName({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
  }),
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
    attributeName: 'data-mode',
  }),
];

export default preview;