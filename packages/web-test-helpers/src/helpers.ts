import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { defaultPlugins, DefaultPluginsOptions } from './defaultPlugins'
import { createRouter as _createRouter } from '../../web-runtime/src/router'
import { createMemoryHistory, RouterOptions } from 'vue-router'

export { mount, shallowMount } from '@vue/test-utils'

jest.spyOn(console, 'warn').mockImplementation(() => undefined)

export const getComposableWrapper = <T>(
  setup: any,
  {
    mocks = undefined,
    provide = undefined,
    template = undefined,
    pluginOptions = undefined
  }: {
    mocks?: Record<string, unknown>
    provide?: Record<string, unknown>
    template?: string
    pluginOptions?: DefaultPluginsOptions
  } = {}
) => {
  return mount(
    defineComponent({
      setup,
      template: template ? template : '<div></div>'
    }),
    {
      global: {
        plugins: [...defaultPlugins(pluginOptions)],
        ...(mocks && { mocks }),
        ...(provide && { provide })
      }
    }
  )
}

export type { RouteLocation } from 'vue-router'
export { RouterLinkStub } from '@vue/test-utils'
export const createRouter = (options?: Partial<RouterOptions>) =>
  _createRouter({
    history: createMemoryHistory(),
    routes: [],
    strict: false,
    ...options
  })

export const writable = <T>(value: Readonly<T>): T => {
  return value as T
}
