import QuotaModal from '../../../../src/components/Spaces/QuotaModal.vue'
import {
  defaultComponentMocks,
  defaultPlugins,
  defaultStubs,
  mount,
  mockAxiosResolve
} from 'web-test-helpers'
import { useMessages, useSpacesStore } from '../../../../src/composables/piniaStores'

describe('QuotaModal', () => {
  describe('method "editQuota"', () => {
    it('should show message on success', async () => {
      const { wrapper, mocks } = getWrapper()
      mocks.$clientService.graphAuthenticated.drives.updateDrive.mockImplementation(() =>
        mockAxiosResolve({
          id: '1fe58d8b-aa69-4c22-baf7-97dd57479f22',
          name: 'any',
          quota: {
            remaining: 9999999836,
            state: 'normal',
            total: 10000000000,
            used: 164
          }
        })
      )
      await wrapper.vm.onConfirm()

      const spacesStore = useSpacesStore()
      expect(spacesStore.updateSpaceField).toHaveBeenCalledTimes(1)
      const { showMessage } = useMessages()
      expect(showMessage).toHaveBeenCalledTimes(1)
    })

    it('should show message on server error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper, mocks } = getWrapper()
      mocks.$clientService.graphAuthenticated.drives.updateDrive.mockRejectedValue(new Error())
      await wrapper.vm.onConfirm()

      const spacesStore = useSpacesStore()
      expect(spacesStore.updateSpaceField).toHaveBeenCalledTimes(0)
      const { showErrorMessage } = useMessages()
      expect(showErrorMessage).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper() {
  const mocks = defaultComponentMocks()
  return {
    mocks,
    wrapper: mount(QuotaModal, {
      props: {
        spaces: [
          {
            id: '1fe58d8b-aa69-4c22-baf7-97dd57479f22',
            spaceQuota: {
              remaining: 9999999836,
              state: 'normal',
              total: 10000000000,
              used: 164
            }
          }
        ]
      },
      global: {
        stubs: { ...defaultStubs },
        mocks,
        provide: mocks,
        plugins: [...defaultPlugins()]
      }
    })
  }
}
