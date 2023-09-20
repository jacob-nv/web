import { buildShareSpaceResource, Resource, SpaceResource } from 'web-client/src/helpers'
import { basename } from 'path'
import { configurationManager } from 'web-pkg'
import { createLocationSpaces } from 'web-pkg/src/router'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { RouteLocationNamedRaw } from 'vue-router'
import { AncestorMetaDataValue } from 'web-pkg/src/types'

export const getSharedAncestorRoute = ({
  resource,
  sharedAncestor,
  matchingSpace
}: {
  resource: Resource
  sharedAncestor: AncestorMetaDataValue
  matchingSpace: SpaceResource
}): RouteLocationNamedRaw => {
  if (resource.shareId) {
    if (resource.path === '') {
      return {}
    }
    const space = buildShareSpaceResource({
      shareId: resource.shareId,
      shareName: matchingSpace?.name || basename(resource.shareRoot),
      serverUrl: configurationManager.serverUrl
    })
    return createLocationSpaces(
      'files-spaces-generic',
      createFileRouteOptions(space, {
        path: sharedAncestor.path,
        fileId: sharedAncestor.id
      })
    )
  }
  if (!matchingSpace) {
    return {}
  }
  return createLocationSpaces(
    'files-spaces-generic',
    createFileRouteOptions(matchingSpace, {
      path: sharedAncestor.path,
      fileId: sharedAncestor.id
    })
  )
}