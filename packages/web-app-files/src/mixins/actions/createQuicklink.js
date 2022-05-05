import quickActions, { canShare } from '../../quickActions'
import { ShareStatus, createQuicklink } from '../../helpers/share'
import { isLocationSharesActive } from '../../router'

export default {
  computed: {
    $_createQuicklink_items() {
      return [
        {
          name: 'create-quicklink',
          icon: quickActions.quicklink.icon,
          iconFillType: quickActions.quicklink.iconFillType,
          label: () => this.$gettext('Copy quicklink'),
          handler: this.$_createQuicklink_trigger,
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }
            if (isLocationSharesActive(this.$router, 'files-shares-with-me')) {
              if (resources[0].status !== ShareStatus.accepted) {
                return false
              }
              // FIXME: also check via capabilities if resharing is enabled + resharing is allowed on the share
            }
            return canShare(resources[0], this.$store)
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-create-quicklink-trigger'
        }
      ]
    }
  },
  methods: {
    async $_createQuicklink_trigger({ resources }) {
      const store = this.$store
      await createQuicklink({
        resource: resources[0],
        storageId: this.$route.params.storageId,
        store
      })

      await store.dispatch('Files/sidebar/openWithPanel', 'sharing-item')
    }
  }
}