import { Capabilities } from '@ownclouders/web-client/src/ocs'
import { defineStore } from 'pinia'
import { computed, ref, unref } from 'vue'
import merge from 'lodash-es/merge'
import { SharePermissionBit } from '@ownclouders/web-client/src/helpers'

const defaultValues = {
  core: {
    'support-sse': false,
    'support-url-signing': false
  },
  dav: {},
  files: {
    app_providers: [],
    favorites: false,
    permanent_deletion: true,
    tags: false,
    privateLinks: false,
    tus_support: {
      extension: '',
      http_method_override: false,
      max_chunk_size: 0
    }
  },
  files_sharing: {
    allow_custom: true,
    api_enabled: true,
    can_rename: true,
    deny_access: false,
    public: {
      alias: false,
      can_contribute: true,
      can_edit: false,
      default_permissions: SharePermissionBit.Read,
      enabled: true,
      password: {
        enforced_for: { read_only: false, upload_only: false, read_write: false }
      }
    },
    resharing: true,
    resharing_default: true
  },
  graph: {
    'personal-data-export': false,
    users: {
      change_password_self_disabled: true,
      create_disabled: false,
      delete_disabled: false,
      read_only_attributes: []
    }
  },
  notifications: {
    'ocs-endpoints': []
  },
  password_policy: {},
  search: {
    property: {
      mediatype: {},
      mtime: {}
    }
  },
  spaces: {
    enabled: false,
    max_quota: 0,
    projects: false,
    share_jail: false
  }
} satisfies Partial<Capabilities['capabilities']>

export const useCapabilityStore = defineStore('capabilities', () => {
  const isInitialized = ref(false)
  const capabilities = ref<Capabilities['capabilities']>(defaultValues)

  const setCapabilities = (data: Capabilities) => {
    capabilities.value = merge({ ...defaultValues }, data.capabilities)
    isInitialized.value = true
  }

  const supportUrlSigning = computed(() => unref(capabilities).core['support-url-signing'])
  const supportSSE = computed(() => unref(capabilities).core['support-sse'])
  const personalDataExport = computed(() => unref(capabilities).graph['personal-data-export'])
  const status = computed(() => unref(capabilities).core.status)

  const davReports = computed(() => unref(capabilities).dav.reports)
  const davTrashbin = computed(() => unref(capabilities).dav.trashbin)

  const spacesEnabled = computed(() => unref(capabilities).spaces.enabled)
  const spacesMaxQuota = computed(() => unref(capabilities).spaces.max_quota)
  const spacesProjects = computed(() => unref(capabilities).spaces.projects)
  const spacesShareJail = computed(() => unref(capabilities).spaces.share_jail)

  const graphUsersCreateDisabled = computed(() => unref(capabilities).graph.users.create_disabled)
  const graphUsersDeleteDisabled = computed(() => unref(capabilities).graph.users.delete_disabled)
  const graphUsersChangeSelfPasswordDisabled = computed(
    () => unref(capabilities).graph.users.change_password_self_disabled
  )
  const graphUsersReadOnlyAttributes = computed(
    () => unref(capabilities).graph.users.read_only_attributes
  )

  const filesAppProviders = computed(() => unref(capabilities).files.app_providers)
  const filesFavorites = computed(() => unref(capabilities).files.favorites)
  const filesThumbnail = computed(() => unref(capabilities).files.thumbnail)
  const filesArchivers = computed(() => unref(capabilities).files.archivers)
  const filesPrivateLinks = computed(() => unref(capabilities).files.privateLinks)
  const filesPermanentDeletion = computed(() => unref(capabilities).files.permanent_deletion)
  const filesTags = computed(() => unref(capabilities).files.tags)
  const filesUndelete = computed(() => unref(capabilities).files.undelete)

  const sharingApiEnabled = computed(() => unref(capabilities).files_sharing.api_enabled)
  const sharingDenyAccess = computed(() => unref(capabilities).files_sharing.deny_access)
  const sharingCanRename = computed(() => unref(capabilities).files_sharing.can_rename)
  const sharingAllowCustom = computed(() => unref(capabilities).files_sharing.allow_custom)
  const sharingPublicEnabled = computed(() => unref(capabilities).files_sharing.public?.enabled)
  const sharingPublicCanEdit = computed(() => unref(capabilities).files_sharing.public?.can_edit)
  const sharingPublicCanContribute = computed(
    () => unref(capabilities).files_sharing.public?.can_contribute
  )
  const sharingPublicAlias = computed(() => unref(capabilities).files_sharing.public?.alias)
  const sharingPublicDefaultPermissions = computed(
    () => unref(capabilities).files_sharing.public?.default_permissions
  )
  const sharingPublicPasswordEnforcedFor = computed(
    () => unref(capabilities).files_sharing.public?.password.enforced_for
  )
  const sharingPublicExpireDate = computed(
    () => unref(capabilities).files_sharing.public?.expire_date
  )
  const sharingResharing = computed(() => unref(capabilities).files_sharing.resharing)
  const sharingResharingDefault = computed(
    () => unref(capabilities).files_sharing.resharing_default
  )
  const sharingSearchMinLength = computed(() => unref(capabilities).files_sharing.search_min_length)
  const sharingUserExpireDate = computed(() => unref(capabilities).files_sharing.user?.expire_date)
  const sharingUserProfilePicture = computed(
    () => unref(capabilities).files_sharing.user?.profile_picture
  )
  const sharingGroupExpireDate = computed(
    () => unref(capabilities).files_sharing.group?.expire_date
  )

  const tusMaxChunkSize = computed(() => unref(capabilities).files.tus_support?.max_chunk_size)
  const tusExtension = computed(() => unref(capabilities).files.tus_support?.extension)
  const tusHttpMethodOverride = computed(
    () => unref(capabilities).files.tus_support?.http_method_override
  )

  const notificationsOcsEndpoints = computed(
    () => unref(capabilities).notifications['ocs-endpoints']
  )

  const passwordPolicy = computed(() => unref(capabilities).password_policy)

  const searchLastMofifiedDate = computed(() => unref(capabilities).search.property?.mtime)
  const searchMediaType = computed(() => unref(capabilities).search.property?.mediatype)
  const searchContent = computed(() => unref(capabilities).search.property?.content)

  return {
    isInitialized,
    capabilities,
    setCapabilities,

    // getters
    status,
    supportUrlSigning,
    supportSSE,
    personalDataExport,
    davReports,
    davTrashbin,
    spacesEnabled,
    spacesMaxQuota,
    spacesProjects,
    spacesShareJail,
    graphUsersCreateDisabled,
    graphUsersDeleteDisabled,
    graphUsersChangeSelfPasswordDisabled,
    graphUsersReadOnlyAttributes,
    filesAppProviders,
    filesFavorites,
    filesThumbnail,
    filesArchivers,
    filesPrivateLinks,
    filesPermanentDeletion,
    filesTags,
    filesUndelete,
    sharingResharing,
    sharingResharingDefault,
    sharingApiEnabled,
    sharingDenyAccess,
    sharingCanRename,
    sharingAllowCustom,
    sharingPublicEnabled,
    sharingPublicCanEdit,
    sharingPublicCanContribute,
    sharingPublicAlias,
    sharingPublicDefaultPermissions,
    sharingPublicPasswordEnforcedFor,
    sharingPublicExpireDate,
    sharingSearchMinLength,
    sharingUserExpireDate,
    sharingUserProfilePicture,
    sharingGroupExpireDate,
    tusMaxChunkSize,
    tusExtension,
    tusHttpMethodOverride,
    notificationsOcsEndpoints,
    passwordPolicy,
    searchLastMofifiedDate,
    searchMediaType,
    searchContent
  }
})

export type CapabilityStore = ReturnType<typeof useCapabilityStore>
