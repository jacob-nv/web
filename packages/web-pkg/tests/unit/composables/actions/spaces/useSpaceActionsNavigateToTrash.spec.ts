import { useSpaceActionsNavigateToTrash } from '../../../../../src'
import { mock } from 'jest-mock-extended'
import { defaultComponentMocks, RouteLocation, getComposableWrapper } from 'web-test-helpers'
import { unref } from 'vue'
import { SpaceResource } from '@ownclouders/web-client/src'

describe('navigateToSpace', () => {
  describe('isEnabled property', () => {
    it('should be false when no resource given', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [] })).toBe(false)
        }
      })
    })
    it('should be false when the space is disabled', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(
            unref(actions)[0].isEnabled({
              resources: [
                mock<SpaceResource>({
                  disabled: true,
                  driveType: 'project'
                })
              ]
            })
          ).toBe(false)
        }
      })
    })
    it('should be false when the space is no project space', () => {
      getWrapper({
        setup: ({ actions }) => {
          expect(
            unref(actions)[0].isEnabled({
              resources: [
                mock<SpaceResource>({
                  disabled: false,
                  driveType: 'personal'
                })
              ]
            })
          ).toBe(false)
        }
      })
    })
  })
  describe('handler', () => {
    it('should redirect to respective trash', () => {
      const { mocks } = getWrapper({
        setup: async ({ actions }) => {
          await unref(actions)[0].handler({
            resources: [mock<SpaceResource>()]
          })
          expect(mocks.$router.push).toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (instance: ReturnType<typeof useSpaceActionsNavigateToTrash>) => void
}) {
  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: 'files-spaces-projects' })
  })
  return {
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const instance = useSpaceActionsNavigateToTrash()
        setup(instance)
      },
      {
        mocks,
        provide: mocks
      }
    )
  }
}
