import { useRouteParam } from '../router'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import {
  MountPointSpaceResource,
  buildShareSpaceResource,
  extractStorageId,
  isMountPointSpaceResource,
  isPersonalSpaceResource,
  isProjectSpaceResource,
  ShareTypes,
  OCM_PROVIDER_ID
} from '@ownclouders/web-client/src/helpers'
import { computed, Ref, unref } from 'vue'
import { basename } from 'path'
import { useSpacesStore, useUserStore, useCapabilityStore, useConfigStore } from '../piniaStores'

type GetMatchingSpaceOptions = {
  space?: Ref<SpaceResource>
}

export const useGetMatchingSpace = (options?: GetMatchingSpaceOptions) => {
  const userStore = useUserStore()
  const spacesStore = useSpacesStore()
  const capabilityStore = useCapabilityStore()
  const configStore = useConfigStore()
  const spaces = computed(() => spacesStore.spaces)
  const driveAliasAndItem = useRouteParam('driveAliasAndItem')

  const getInternalSpace = (storageId: string): SpaceResource => {
    return (
      unref(options?.space) ||
      unref(spaces).find((space) => space.id === storageId) ||
      (!capabilityStore.spacesEnabled && unref(spaces).find((s) => isPersonalSpaceResource(s)))
    )
  }

  const getMatchingSpace = (resource: Resource): SpaceResource => {
    let storageId = resource.storageId

    if (
      unref(driveAliasAndItem)?.startsWith('public/') ||
      unref(driveAliasAndItem)?.startsWith('ocm/')
    ) {
      storageId = unref(driveAliasAndItem).split('/')[1]
    }

    const space = getInternalSpace(storageId)

    if (space) {
      return space
    }

    const driveAliasPrefix =
      resource?.share?.shareType === ShareTypes.remote.value ||
      resource?.id?.toString().startsWith(OCM_PROVIDER_ID)
        ? 'ocm-share'
        : 'share'

    let shareName: string
    if (resource.shareRoot) {
      shareName = basename(resource.shareRoot)
    } else if (
      unref(driveAliasAndItem)?.startsWith('share/') ||
      unref(driveAliasAndItem)?.startsWith('ocm-share/')
    ) {
      shareName = unref(driveAliasAndItem).split('/')[1]
    } else {
      shareName = resource.name
    }

    return buildShareSpaceResource({
      driveAliasPrefix,
      shareId: resource.shareId,
      shareName,
      serverUrl: configStore.serverUrl
    })
  }

  const getMatchingMountPoints = (space: SpaceResource): MountPointSpaceResource[] =>
    unref(spaces).filter(
      (s) => isMountPointSpaceResource(s) && extractStorageId(s.root.remoteItem.rootId) === space.id
    )

  const isPersonalSpaceRoot = (resource: Resource) => {
    return (
      resource?.storageId &&
      resource?.storageId === spacesStore.personalSpace?.storageId &&
      resource?.path === '/'
    )
  }

  const isResourceAccessible = ({ space, path }: { space: SpaceResource; path: string }) => {
    if (!configStore.options.routing.fullShareOwnerPaths) {
      return true
    }

    const projectSpace = unref(spaces).find((s) => isProjectSpaceResource(s) && s.id === space.id)
    const fullyAccessibleSpace =
      space.isOwner(userStore.user) || projectSpace?.isMember(userStore.user)

    return (
      fullyAccessibleSpace ||
      getMatchingMountPoints(space).some((m) => path.startsWith(m.root.remoteItem.path))
    )
  }

  return {
    getInternalSpace,
    getMatchingSpace,
    isPersonalSpaceRoot,
    isResourceAccessible
  }
}
