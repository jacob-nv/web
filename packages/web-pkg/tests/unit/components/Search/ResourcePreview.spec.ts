import { mock } from 'jest-mock-extended'
import { ResourcePreview } from '../../../../src/components'
import { SpaceResource } from '@ownclouders/web-client/src'
import { useGetMatchingSpace } from '../../../../src/composables/spaces/useGetMatchingSpace'
import {
  defaultComponentMocks,
  defaultPlugins,
  shallowMount,
  useGetMatchingSpaceMock
} from 'web-test-helpers'
import { useFileActions } from '../../../../src/composables/actions'
import { CapabilityStore } from '../../../../src/composables/piniaStores'

jest.mock('../../../../src/composables/spaces/useGetMatchingSpace', () => ({
  useGetMatchingSpace: jest.fn()
}))

jest.mock('../../../../src/composables/actions', () => ({
  useFileActions: jest.fn()
}))

const selectors = {
  resourceListItemStub: 'resource-list-item-stub'
}

describe('Preview component', () => {
  const driveAliasAndItem = '1'
  jest.mocked(useGetMatchingSpace).mockImplementation(() => useGetMatchingSpaceMock())
  it('should render preview component', () => {
    const { wrapper } = getWrapper({
      space: mock<SpaceResource>({
        id: '1',
        driveType: 'project',
        name: 'New space',
        getDriveAliasAndItem: () => driveAliasAndItem
      })
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('should render resource component without file extension when areFileExtensionsShown is set to false', () => {
    const { wrapper } = getWrapper({
      areFileExtensionsShown: false,
      space: mock<SpaceResource>({
        id: '1',
        driveType: 'project',
        name: 'New space',
        getDriveAliasAndItem: () => driveAliasAndItem
      })
    })
    expect(
      wrapper.findComponent<any>(selectors.resourceListItemStub).attributes().isextensiondisplayed
    ).toBe('false')
  })
})

function getWrapper({
  space = null,
  searchResult = {
    id: '1',
    data: {
      storageId: '1',
      name: 'lorem.txt',
      path: '/',
      shareRoot: ''
    }
  },
  areFileExtensionsShown = true
}: {
  space?: SpaceResource
  searchResult?: any
  areFileExtensionsShown?: boolean
} = {}) {
  jest.mocked(useGetMatchingSpace).mockImplementation(() =>
    useGetMatchingSpaceMock({
      isResourceAccessible() {
        return true
      },
      getMatchingSpace() {
        return space
      }
    })
  )
  jest.mocked(useFileActions).mockReturnValue(mock<ReturnType<typeof useFileActions>>())

  const mocks = defaultComponentMocks()
  const capabilities = {
    spaces: { share_jail: true, projects: true }
  } satisfies Partial<CapabilityStore['capabilities']>

  return {
    wrapper: shallowMount(ResourcePreview, {
      props: {
        searchResult
      },
      global: {
        provide: mocks,
        renderStubDefaultSlot: true,
        mocks,
        plugins: [
          ...defaultPlugins({
            piniaOptions: {
              capabilityState: { capabilities },
              configState: { options: { disablePreviews: true } },
              resourcesStore: { areFileExtensionsShown }
            }
          })
        ]
      }
    })
  }
}
