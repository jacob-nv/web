import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { UserAction, useModals, useCapabilityStore } from '@ownclouders/web-pkg'
import LoginModal from '../../../components/Users/LoginModal.vue'

export const useUserActionsEditLogin = () => {
  const { dispatchModal } = useModals()
  const capabilityStore = useCapabilityStore()
  const { $gettext, $ngettext } = useGettext()

  const handler = ({ resources }) => {
    dispatchModal({
      title: $ngettext(
        'Edit login for "%{user}"',
        'Edit login for %{userCount} users',
        resources.length,
        {
          user: resources[0].displayName,
          userCount: resources.length.toString()
        }
      ),
      customComponent: LoginModal,
      customComponentAttrs: () => ({
        users: resources
      })
    })
  }

  const actions = computed((): UserAction[] => [
    {
      name: 'edit-login',
      icon: 'login-circle',
      componentType: 'button',
      class: 'oc-users-actions-edit-login-trigger',
      label: () => $gettext('Edit login'),
      isEnabled: ({ resources }) => {
        if (capabilityStore.graphUsersReadOnlyAttributes.includes('user.accountEnabled')) {
          return false
        }

        return resources.length > 0
      },
      handler
    }
  ])

  return {
    actions
  }
}
