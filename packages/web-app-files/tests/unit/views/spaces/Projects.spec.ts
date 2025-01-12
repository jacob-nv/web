import Projects from '../../../../src/views/spaces/Projects.vue'
import { mock } from 'jest-mock-extended'
import { h, nextTick, ref } from 'vue'
import { queryItemAsString, useFileActionsDelete, useExtensionRegistry } from '@ownclouders/web-pkg'

import {
  defaultPlugins,
  mount,
  defaultComponentMocks,
  defaultStubs,
  RouteLocation
} from 'web-test-helpers'
import { useExtensionRegistryMock } from 'web-test-helpers/src/mocks/useExtensionRegistryMock'

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  displayPositionedDropdown: jest.fn(),
  queryItemAsString: jest.fn(),
  appDefaults: jest.fn(),
  useExtensionRegistry: jest.fn(),
  useRouteQueryPersisted: jest.fn().mockImplementation(() => ref('resource-table')),
  useFileActions: jest.fn(),
  useFileActionsDelete: jest.fn(() => mock<ReturnType<typeof useFileActionsDelete>>())
}))

const spacesResources = [
  {
    id: '1',
    name: 'Some space',
    driveType: 'project',
    description: 'desc',
    path: '',
    type: 'space',
    isFolder: true,
    getDriveAliasAndItem: () => '1'
  },
  {
    id: '2',
    name: 'Some other space',
    driveType: 'project',
    description: 'desc',
    path: '',
    type: 'space',
    isFolder: true,
    getDriveAliasAndItem: () => '2'
  }
]

describe('Projects view', () => {
  it('appBar always present', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.find('app-bar-stub').exists()).toBeTruthy()
  })
  it('sideBar always present', () => {
    const { wrapper } = getMountedWrapper()
    expect(wrapper.find('file-side-bar-stub').exists()).toBeTruthy()
  })
  describe('different files view states', () => {
    it('shows the loading spinner during loading', () => {
      const { wrapper } = getMountedWrapper()
      expect(wrapper.find('oc-spinner-stub').exists()).toBeTruthy()
    })
    it('shows the no-content-message after loading', async () => {
      const { wrapper } = getMountedWrapper()
      await wrapper.vm.loadResourcesTask.last
      expect(wrapper.find('oc-spinner-stub').exists()).toBeFalsy()
      expect(wrapper.find('.no-content-message').exists()).toBeTruthy()
    })
    it('lists all available project spaces', async () => {
      const spaces = spacesResources
      const { wrapper } = getMountedWrapper({ spaces })
      await wrapper.vm.loadResourcesTask.last
      // "space" is undefined for "space-context-actions", seems to be a bug because it's definitely not
      // {{ space }} -> undefined, {{ space.id }} -> "1"
      expect(wrapper.html()).toMatchSnapshot()
      expect(wrapper.find('.no-content-message').exists()).toBeFalsy()
      expect(wrapper.find('.spaces-list').exists()).toBeTruthy()
    })
    it('shows only filtered spaces if filter applied', async () => {
      const { wrapper } = getMountedWrapper({ spaces: spacesResources })
      wrapper.vm.filterTerm = 'Some other space'
      await nextTick()
      expect(wrapper.vm.items).toEqual([spacesResources[1]])
    })
  })
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should display the "Create Space"-button when permission given', () => {
    const { wrapper } = getMountedWrapper({
      abilities: [{ action: 'create-all', subject: 'Drive' }],
      stubAppBar: false
    })
    expect(wrapper.find('create-space-stub').exists()).toBeTruthy()
  })
})

function getMountedWrapper({ mocks = {}, spaces = [], abilities = [], stubAppBar = true } = {}) {
  jest.mocked(queryItemAsString).mockImplementationOnce(() => '1')
  jest.mocked(queryItemAsString).mockImplementationOnce(() => '100')

  const extensions = [
    {
      id: 'com.github.owncloud.web.files.folder-view.resource-table',
      type: 'folderView',
      scopes: ['resource', 'space', 'favorite'],
      folderView: {
        name: 'resource-table',
        label: 'Switch to default view',
        icon: {
          name: 'menu-line',
          fillType: 'none'
        },
        component: h('div', { class: 'resource-table' })
      }
    }
  ]

  jest.mocked(useExtensionRegistry).mockImplementation(() =>
    useExtensionRegistryMock({
      requestExtensions<ExtensionType>(type: string, scopes: string[]) {
        return extensions as ExtensionType[]
      }
    })
  )

  const defaultMocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ name: 'files-spaces-projects' })
    }),
    ...(mocks && mocks)
  }

  return {
    mocks: defaultMocks,
    wrapper: mount(Projects, {
      global: {
        plugins: [...defaultPlugins({ abilities, piniaOptions: { spacesState: { spaces } } })],
        mocks: defaultMocks,
        provide: defaultMocks,
        stubs: {
          ...defaultStubs,
          'space-context-actions': true,
          'app-bar': stubAppBar,
          CreateSpace: true
        }
      }
    })
  }
}
