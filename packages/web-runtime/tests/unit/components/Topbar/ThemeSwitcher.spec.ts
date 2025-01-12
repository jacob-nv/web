import { WebThemeType, useThemeStore } from '@ownclouders/web-pkg'
import { mock } from 'jest-mock-extended'
import ThemeSwitcher from 'web-runtime/src/components/ThemeSwitcher.vue'
import defaultTheme from 'web-runtime/themes/owncloud/theme.json'
import { defaultPlugins, defaultStubs, mount } from 'web-test-helpers'

const defaultOwnCloudTheme = {
  defaults: {
    ...defaultTheme.clients.web.defaults,
    common: defaultTheme.common
  },
  themes: defaultTheme.clients.web.themes
}

describe('ThemeSwitcher component', () => {
  describe('restores', () => {
    it('light theme if light theme is saved in localstorage', async () => {
      const { wrapper } = getWrapper({ hasOnlyOneTheme: false })
      const themeStore = useThemeStore()
      window.localStorage.setItem('oc_currentThemeName', 'Light Theme')
      themeStore.initializeThemes(defaultOwnCloudTheme)
      await wrapper.vm.$nextTick()
      expect(wrapper.html()).toMatchSnapshot()
    })
    it('dark theme if dark theme is saved in localstorage', async () => {
      const { wrapper } = getWrapper()
      const themeStore = useThemeStore()
      window.localStorage.setItem('oc_currentThemeName', 'Dark Theme')
      themeStore.initializeThemes(defaultOwnCloudTheme)
      await wrapper.vm.$nextTick()
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})

function getWrapper({ hasOnlyOneTheme = false } = {}) {
  const availableThemes = hasOnlyOneTheme
    ? [defaultTheme.clients.web.themes[0]]
    : defaultTheme.clients.web.themes

  return {
    wrapper: mount(ThemeSwitcher, {
      global: {
        plugins: [
          ...defaultPlugins({
            piniaOptions: {
              stubActions: false,
              themeState: {
                availableThemes,
                currentTheme: mock<WebThemeType>({
                  ...defaultOwnCloudTheme.defaults,
                  ...defaultOwnCloudTheme.themes[0]
                })
              }
            }
          })
        ],
        stubs: { ...defaultStubs, 'oc-icon': true }
      }
    })
  }
}
