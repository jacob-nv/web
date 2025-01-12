import {
  FileActionOptions,
  useClientService,
  useConfigStore,
  useMessages,
  useWindowOpen
} from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { computed } from 'vue'
import { Extension } from '@ownclouders/web-pkg'
import { OCM_PROVIDER_ID } from '@ownclouders/web-client/src/helpers'

export const extensions = () => {
  const { showErrorMessage } = useMessages()
  const clientService = useClientService()
  const configStore = useConfigStore()
  const { $gettext } = useGettext()
  const { openUrl } = useWindowOpen()

  const handler = async ({ resources }: FileActionOptions) => {
    const resource = resources[0]

    try {
      const params = new URLSearchParams()
      params.append('file', resource.id.toString())

      const { data } = await clientService.httpAuthenticated.post(
        '/sciencemesh/open-in-app',
        params
      )
      if (data.app_url) {
        openUrl(data.app_url)
      } else {
        showErrorMessage({
          title: $gettext('An error occurred'),
          desc: $gettext("Couldn't open remotely")
        })
      }
    } catch (error) {
      console.log(error)
      showErrorMessage({
        title: $gettext('An error occurred'),
        desc: $gettext("Couldn't open remotely"),
        errors: [error]
      })
    }
  }

  return computed(
    () =>
      [
        {
          id: 'com.github.owncloud.web.open-file-remote',
          type: 'action',
          scopes: ['resource', 'resource.context-menu'],
          action: {
            name: 'open-file-remote',
            icon: 'remote-control',
            handler,
            label: () => $gettext('Open remotely'),
            isEnabled: ({ resources }: FileActionOptions) => {
              return (
                configStore.options.ocm.openRemotely &&
                resources[0]?.storageId?.startsWith(OCM_PROVIDER_ID)
              )
            },
            componentType: 'button',
            class: 'oc-files-actions-open-file-remote'
          }
        }
      ] satisfies Extension[]
  )
}
