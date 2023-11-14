import { copyQuicklink } from './helpers/share'
import { eventBus } from './services/eventBus'
import { SideBarEventTopics } from './composables/sideBar/eventTopics'
import { Resource } from '@ownclouders/web-client'
import { Language } from 'vue3-gettext'
import { ClientService, PasswordPolicyService } from './services'
import { Ability } from '@ownclouders/web-client/src/helpers/resource/types'
import { Store } from 'vuex'
import { ApplicationQuickActions } from './apps'

export function canShare(item: Resource, store: Store<any>, ability: Ability) {
  const { capabilities } = store.state.user
  if (!capabilities.files_sharing || !capabilities.files_sharing.api_enabled) {
    return false
  }
  if (item.isReceivedShare() && !capabilities.files_sharing.resharing) {
    return false
  }
  return item.canShare({ ability })
}

export function showQuickLinkPasswordModal({ $gettext, store, passwordPolicyService }, onConfirm) {
  const modal = {
    variation: 'passive',
    title: $gettext('Set password'),
    cancelText: $gettext('Cancel'),
    confirmText: $gettext('Set'),
    hasInput: true,
    inputDescription: $gettext('Passwords for links are required.'),
    inputPasswordPolicy: passwordPolicyService.getPolicy(),
    inputGeneratePasswordMethod: () => passwordPolicyService.generatePassword(),
    inputLabel: $gettext('Password'),
    inputType: 'password',
    onInput: () => store.dispatch('setModalInputErrorMessage', ''),
    onPasswordChallengeCompleted: () => store.dispatch('setModalConfirmButtonDisabled', false),
    onPasswordChallengeFailed: () => store.dispatch('setModalConfirmButtonDisabled', true),
    onCancel: () => store.dispatch('hideModal'),
    onConfirm: async (password) => {
      onConfirm(password)
    }
  }

  return store.dispatch('createModal', modal)
}

interface QuickLinkContext {
  ability: Ability
  clientService: ClientService
  item: Resource
  language: Language
  store: Store<any>
  passwordPolicyService: PasswordPolicyService
}

export default {
  collaborators: {
    id: 'collaborators',
    label: ($gettext) => $gettext('Add people'),
    icon: 'user-add',
    iconFillType: undefined,
    handler: () => eventBus.publish(SideBarEventTopics.openWithPanel, 'sharing#peopleShares'),
    displayed: canShare
  },
  quicklink: {
    id: 'quicklink',
    label: ($gettext) => $gettext('Copy link'),
    icon: 'link',
    iconFillType: undefined,
    handler: async ({
      ability,
      clientService,
      item,
      language,
      store,
      passwordPolicyService
    }: QuickLinkContext) => {
      await copyQuicklink({
        ability,
        passwordPolicyService,
        clientService,
        language,
        resource: item,
        store
      })
    },
    displayed: canShare
  }
} satisfies ApplicationQuickActions
