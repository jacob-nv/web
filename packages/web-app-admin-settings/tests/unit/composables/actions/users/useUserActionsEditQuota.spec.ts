import { useUserActionsEditQuota } from '../../../../../src/composables/actions/users/useUserActionsEditQuota'
import { defaultComponentMocks, getComposableWrapper, writable } from 'web-test-helpers'
import { unref } from 'vue'
import { useCapabilityStore, useModals } from '@ownclouders/web-pkg'

describe('useUserActionsEditQuota', () => {
  describe('isEnabled property', () => {
    it('should be false when not resource given', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [] })).toBe(false)
        }
      })
    })
    it('should be true when the current user has the "set-space-quota"-permission', () => {
      const userMock = {
        id: '1',
        drive: {
          name: 'some-drive',
          quota: {}
        }
      }
      getWrapper({
        canEditSpaceQuota: true,
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [userMock] })).toBe(true)
        }
      })
    })
    it('should be false when the current user does not have the "set-space-quota"-permission', () => {
      const userMock = {
        id: '1',
        drive: {
          name: 'some-drive',
          quota: {}
        }
      }
      getWrapper({
        canEditSpaceQuota: false,
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [userMock] })).toBe(false)
        }
      })
    })
    it('should false if included in capability readOnlyUserAttributes list', () => {
      getWrapper({
        setup: ({ actions }) => {
          const userMock = {
            id: '1',
            drive: {
              name: 'some-drive',
              quota: {}
            }
          }

          const capabilityStore = useCapabilityStore()
          writable(capabilityStore).graphUsersReadOnlyAttributes = ['drive.quota']

          expect(unref(actions)[0].isEnabled({ resources: [userMock] })).toEqual(false)
        }
      })
    })
  })
  describe('handler', () => {
    it('should create a modal', () => {
      getWrapper({
        setup: async ({ actions }) => {
          const { dispatchModal } = useModals()
          await unref(actions)[0].handler({ resources: [] })
          expect(dispatchModal).toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  canEditSpaceQuota = false,
  setup
}: {
  canEditSpaceQuota?: boolean
  setup: (instance: ReturnType<typeof useUserActionsEditQuota>) => void
}) {
  const mocks = defaultComponentMocks()

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useUserActionsEditQuota()
        setup(instance)
      },
      {
        mocks,
        pluginOptions: {
          abilities: canEditSpaceQuota ? [{ action: 'set-quota-all', subject: 'Drive' }] : []
        }
      }
    )
  }
}
