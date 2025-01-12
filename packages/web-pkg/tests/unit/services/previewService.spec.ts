import { ClientService, PreviewService } from '../../../src/services'
import { mock, mockDeep } from 'jest-mock-extended'
import { createTestingPinia } from 'web-test-helpers'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { AxiosResponse } from 'axios'
import {
  useAuthStore,
  useUserStore,
  useCapabilityStore,
  useConfigStore
} from '../../../src/composables/piniaStores'
import { User } from '@ownclouders/web-client/src/generated'

describe('PreviewService', () => {
  describe('method "isMimetypeSupported"', () => {
    it('should return true if mimeType is supported', () => {
      const supportedMimeTypes = ['image/png']
      const { previewService } = getWrapper({ supportedMimeTypes })
      expect(previewService.isMimetypeSupported(supportedMimeTypes[0])).toBe(true)
    })
    it('should return true if no specific supported mimeTypes given', () => {
      const { previewService } = getWrapper()
      expect(previewService.isMimetypeSupported('image/png')).toBe(true)
    })
    it('should return false if mimeType is not supported', () => {
      const supportedMimeTypes = ['image/png']
      const { previewService } = getWrapper({ supportedMimeTypes })
      expect(previewService.isMimetypeSupported('image/jpeg')).toBe(false)
    })
  })
  describe('method "getSupportedMimeTypes"', () => {
    it('reads the supported mime types from the capabilities', () => {
      const supportedMimeTypes = ['image/png']
      const { previewService } = getWrapper({ supportedMimeTypes })
      expect(previewService.getSupportedMimeTypes()).toEqual(supportedMimeTypes)
    })
    it('filters the supported mime types from the capabilities', () => {
      const supportedMimeTypes = ['image/png', 'text/plain']
      const { previewService } = getWrapper({ supportedMimeTypes })
      expect(previewService.getSupportedMimeTypes('image')).toEqual([supportedMimeTypes[0]])
    })
  })
  describe('method "loadPreview"', () => {
    it('does not load preview if no version specified', async () => {
      const supportedMimeTypes = ['image/png']
      const { previewService } = getWrapper({ supportedMimeTypes })
      const preview = await previewService.loadPreview({
        space: mock<SpaceResource>(),
        resource: mock<Resource>()
      })
      expect(preview).toBeUndefined()
    })
    it('does not load preview if mimeType not supported', async () => {
      const supportedMimeTypes = ['image/png']
      const { previewService } = getWrapper({ supportedMimeTypes, version: '1' })
      const preview = await previewService.loadPreview({
        space: mock<SpaceResource>(),
        resource: mock<Resource>({ mimeType: 'text/plain' })
      })
      expect(preview).toBeUndefined()
    })
    it('does not load preview for folders', async () => {
      const supportedMimeTypes = ['image/png']
      const { previewService } = getWrapper({ supportedMimeTypes, version: '1' })
      const preview = await previewService.loadPreview({
        space: mock<SpaceResource>(),
        resource: mock<Resource>({ mimeType: supportedMimeTypes[0], type: 'folder' })
      })
      expect(preview).toBeUndefined()
    })
    describe('private files', () => {
      it('loads preview', async () => {
        const objectUrl = 'objectUrl'
        const supportedMimeTypes = ['image/png']
        const { previewService } = getWrapper({
          supportedMimeTypes,
          version: '1'
        })
        window.URL.createObjectURL = jest.fn().mockImplementation(() => objectUrl)
        const preview = await previewService.loadPreview({
          space: mock<SpaceResource>(),
          resource: mock<Resource>({ mimeType: supportedMimeTypes[0], webDavPath: '/', etag: '' })
        })
        expect(preview).toEqual(objectUrl)
      })
      it('loads preview using cache', async () => {
        const objectUrl = 'objectUrl'
        const supportedMimeTypes = ['image/png']
        const { previewService, clientService } = getWrapper({
          supportedMimeTypes,
          version: '1'
        })
        const resourceMock = mock<Resource>({
          id: '1',
          mimeType: supportedMimeTypes[0],
          webDavPath: '/',
          etag: ''
        })
        window.URL.createObjectURL = jest.fn().mockImplementation(() => objectUrl)
        const preview = await previewService.loadPreview(
          { space: mock<SpaceResource>(), resource: resourceMock },
          true
        )
        expect(preview).toEqual(objectUrl)
        expect(clientService.httpAuthenticated.get).toHaveBeenCalledTimes(1)
        const cachedPreview = await previewService.loadPreview(
          { space: mock<SpaceResource>(), resource: resourceMock },
          true
        )
        expect(preview).toEqual(cachedPreview)
        expect(clientService.httpAuthenticated.get).toHaveBeenCalledTimes(1)
      })
    })
    describe('public files', () => {
      it('loads preview', async () => {
        const downloadURL = 'downloadURL'
        const supportedMimeTypes = ['image/png']
        const { previewService } = getWrapper({
          supportedMimeTypes,
          version: '1'
        })
        const preview = await previewService.loadPreview({
          space: mock<SpaceResource>({ driveType: 'public' }),
          resource: mock<Resource>({ mimeType: supportedMimeTypes[0], downloadURL, etag: '' })
        })
        expect(preview).toEqual(`${downloadURL}?scalingup=0&preview=1&a=1`)
      })
    })
  })
})

const getWrapper = ({
  supportedMimeTypes = [],
  version = undefined,
  accessToken = 'token'
} = {}) => {
  const clientService = mockDeep<ClientService>()
  clientService.httpAuthenticated.get.mockResolvedValue({ data: {}, status: 200 } as AxiosResponse)
  clientService.httpUnAuthenticated.head.mockResolvedValue({
    data: {},
    status: 200
  } as AxiosResponse)

  createTestingPinia({ initialState: { user: { user: mock<User>() }, auth: { accessToken } } })
  const userStore = useUserStore()
  const authStore = useAuthStore()
  const capabilityStore = useCapabilityStore()
  const configStore = useConfigStore()

  capabilityStore.capabilities.files = { thumbnail: { supportedMimeTypes, version } }

  return {
    previewService: new PreviewService({
      configStore,
      clientService,
      userStore,
      authStore,
      capabilityStore
    }),
    clientService
  }
}
