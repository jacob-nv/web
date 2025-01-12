import { SideBarEventTopics, eventBus, useFileActionsShowDetails } from '../../../../../src'
import { defaultComponentMocks, getComposableWrapper } from 'web-test-helpers'
import { unref } from 'vue'
import { Resource } from '@ownclouders/web-client'

describe('showDetails', () => {
  describe('handler', () => {
    it('should trigger the open sidebar event', () => {
      const mocks = defaultComponentMocks()
      getComposableWrapper(
        () => {
          const { actions } = useFileActionsShowDetails()

          const busStub = jest.spyOn(eventBus, 'publish')
          const resources = [{ id: '1', path: '/folder' }] as Resource[]
          unref(actions)[0].handler({ space: null, resources })
          expect(busStub).toHaveBeenCalledWith(SideBarEventTopics.open)
        },
        { mocks, provide: mocks }
      )
    })
  })
})
