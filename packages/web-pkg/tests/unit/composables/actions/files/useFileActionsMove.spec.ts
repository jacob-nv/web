import { mock, mockDeep } from 'jest-mock-extended'
import { unref } from 'vue'
import { useFileActionsMove } from '../../../../../src/composables/actions'
import { Resource, SpaceResource } from '@ownclouders/web-client/src'
import { RouteLocation, defaultComponentMocks, getComposableWrapper } from 'web-test-helpers/src'

describe('move', () => {
  describe('computed property "actions"', () => {
    describe('move isEnabled property of returned element', () => {
      it.each([
        {
          resources: [{ isReceivedShare: () => true, canBeDeleted: () => true }] as Resource[],
          expectedStatus: true
        },
        {
          resources: [
            { isReceivedShare: () => true, canBeDeleted: () => true, locked: true }
          ] as Resource[],
          expectedStatus: false
        }
      ])('should be set correctly', (inputData) => {
        getWrapper({
          setup: () => {
            const { actions } = useFileActionsMove()

            const resources = inputData.resources
            expect(unref(actions)[0].isEnabled({ space: null, resources })).toBe(
              inputData.expectedStatus
            )
          }
        })
      })
    })
  })
})
function getWrapper({
  setup
}: {
  setup: (instance: ReturnType<typeof useFileActionsMove>) => void
}) {
  const routeName = 'files-spaces-generic'
  const mocks = {
    ...defaultComponentMocks({ currentRoute: mock<RouteLocation>({ name: routeName }) }),
    space: mockDeep<SpaceResource>({
      webDavPath: 'irrelevant'
    })
  }

  return {
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsMove()
        setup(instance)
      },
      {
        mocks,
        provide: mocks,
        pluginOptions: { piniaOptions: { resourcesStore: { currentFolder: mocks.space } } }
      }
    )
  }
}
