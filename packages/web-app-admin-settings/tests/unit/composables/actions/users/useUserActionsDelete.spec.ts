import { useUserActionsDelete } from '../../../../../src/composables/actions/users/useUserActionsDelete'
import { mock } from 'jest-mock-extended'
import { unref } from 'vue'
import { User } from '@ownclouders/web-client/src/generated'
import { eventBus, useCapabilityStore } from '@ownclouders/web-pkg'
import { defaultComponentMocks, getComposableWrapper, writable } from 'web-test-helpers'

describe('useUserActionsDelete', () => {
  describe('method "isEnabled"', () => {
    it.each([
      { resources: [], disabledViaCapability: false, isEnabled: false },
      { resources: [mock<User>()], disabledViaCapability: false, isEnabled: true },
      { resources: [mock<User>(), mock<User>()], disabledViaCapability: false, isEnabled: true },
      { resources: [mock<User>(), mock<User>()], disabledViaCapability: true, isEnabled: false }
    ])(
      'should only return true if 1 or more users are selected and not disabled via capability',
      ({ resources, disabledViaCapability, isEnabled }) => {
        getWrapper({
          setup: ({ actions }) => {
            const capabilityStore = useCapabilityStore()
            writable(capabilityStore).graphUsersDeleteDisabled = !!disabledViaCapability
            expect(unref(actions)[0].isEnabled({ resources })).toEqual(isEnabled)
          }
        })
      }
    )
  })
  describe('method "deleteUsers"', () => {
    it('should successfully delete all given users and reload the users list', () => {
      const eventSpy = jest.spyOn(eventBus, 'publish')
      getWrapper({
        setup: async ({ deleteUsers }, { clientService }) => {
          const user = mock<User>({ id: '1' })
          await deleteUsers([user])
          expect(clientService.graphAuthenticated.users.deleteUser).toHaveBeenCalledWith(user.id)
          expect(eventSpy).toHaveBeenCalledWith('app.admin-settings.list.load')
        }
      })
    })
    it('should handle errors', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const eventSpy = jest.spyOn(eventBus, 'publish')
      getWrapper({
        setup: async ({ deleteUsers }, { clientService }) => {
          clientService.graphAuthenticated.users.deleteUser.mockRejectedValue({})
          const user = mock<User>({ id: '1' })
          await deleteUsers([user])
          expect(clientService.graphAuthenticated.users.deleteUser).toHaveBeenCalledWith(user.id)
          expect(eventSpy).toHaveBeenCalledWith('app.admin-settings.list.load')
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useUserActionsDelete>,
    {
      clientService
    }: {
      clientService: ReturnType<typeof defaultComponentMocks>['$clientService']
    }
  ) => void
}) {
  const mocks = defaultComponentMocks()
  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useUserActionsDelete()
        setup(instance, { clientService: mocks.$clientService })
      },
      { mocks, provide: mocks }
    )
  }
}
