<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/button/BaseButton.vue'
import ConfirmActionModal from '@/components/feedback/ConfirmActionModal.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { describeError } from '@/services/describe-error'
import type { PlatformUserDetails } from '@/services/users-service'
import { useActionFeedbackStore } from '@/stores/action-feedback-store'
import { useUserDetailsStore } from '@/stores/user-details-store'
import {
  ActivateUserIcon,
  DeactivateUserIcon,
  MakeAdminIcon,
  RedirectLinkIcon,
  RemoveAdminIcon,
  type AppIcon,
} from '@/theme/app-icons'
import type { ColorVariant } from '@/theme/color-variants'
import AdminDetailsSection from '@/components/admin/AdminDetailsSection.vue'
import AdminDetailsActionRow from '@/components/admin/AdminDetailsActionRow.vue'

export type UserManagementAction = 'activate' | 'deactivate' | 'make-admin' | 'remove-admin'

interface UserManagementActionsProps {
  viewedUser: PlatformUserDetails
  isCurrentUser?: boolean
}

interface UserManagementActionCopy {
  confirmTitle: (userName: string) => string
  confirmDescription: string
  confirmLabel: string
  successTitle: (userName: string) => string
  successMessage: string
  errorTitle: string
}

const props = withDefaults(defineProps<UserManagementActionsProps>(), {
  isCurrentUser: false,
})

const router = useRouter()
const userDetailsStore = useUserDetailsStore()
const actionFeedbackStore = useActionFeedbackStore()

const copyByAction: Record<UserManagementAction, UserManagementActionCopy> = {
  deactivate: {
    confirmTitle: (userName) => `Deactivate ${userName}?`,
    confirmDescription:
      'They will lose access to the platform right away. Nothing is deleted, and you can activate them again later.',
    confirmLabel: 'Deactivate',
    successTitle: (userName) => `${userName} was deactivated`,
    successMessage: 'They can no longer use the platform.',
    errorTitle: 'Could not deactivate this user',
  },
  activate: {
    confirmTitle: (userName) => `Activate ${userName}?`,
    confirmDescription: 'They will get their access back right away.',
    confirmLabel: 'Activate',
    successTitle: (userName) => `${userName} is active again`,
    successMessage: 'They can use the platform again.',
    errorTitle: 'Could not activate this user',
  },
  'make-admin': {
    confirmTitle: (userName) => `Make ${userName} an admin?`,
    confirmDescription: 'They will be able to approve, deny, activate and deactivate other users.',
    confirmLabel: 'Make admin',
    successTitle: (userName) => `${userName} is now an admin`,
    successMessage: 'They can manage users from the admin area.',
    errorTitle: 'Could not make this user an admin',
  },
  'remove-admin': {
    confirmTitle: (userName) => `Remove admin from ${userName}?`,
    confirmDescription: 'They will keep their access but will no longer be able to manage users.',
    confirmLabel: 'Remove admin',
    successTitle: (userName) => `${userName} is no longer an admin`,
    successMessage: 'They are a regular member now.',
    errorTitle: 'Could not remove the admin role',
  },
}

const iconByAction: Record<UserManagementAction, AppIcon> = {
  deactivate: DeactivateUserIcon,
  activate: ActivateUserIcon,
  'make-admin': MakeAdminIcon,
  'remove-admin': RemoveAdminIcon,
}

const variantByAction: Record<UserManagementAction, ColorVariant> = {
  deactivate: 'danger',
  activate: 'success',
  'make-admin': 'primary',
  'remove-admin': 'warning',
}

const isConfirmModalOpen = ref(false)
const requestedAction = ref<UserManagementAction>('deactivate')
const isSubmittingAction = ref(false)

const isAdmin = computed(() => props.viewedUser.role === 'admin')
const isPendingApproval = computed(() => props.viewedUser.approvalStatus === 'pending')
const canBecomeAdmin = computed(
  () => props.viewedUser.approvalStatus === 'approved' && props.viewedUser.isActive,
)
const roleAction = computed<UserManagementAction>(() =>
  isAdmin.value ? 'remove-admin' : 'make-admin',
)
const activationAction = computed<UserManagementAction>(() =>
  props.viewedUser.isActive ? 'deactivate' : 'activate',
)
const roleActionDescription = computed(() => {
  if (isAdmin.value) {
    return 'They can approve, deny, activate and deactivate other users.'
  }
  if (canBecomeAdmin.value) {
    return 'Let them manage users from the admin area.'
  }
  return 'Only approved and active users can become admins.'
})
const activationActionDescription = computed(() =>
  props.viewedUser.isActive
    ? 'Turn off their access without deleting anything.'
    : 'Give them their access back.',
)
const requestedActionCopy = computed(() => copyByAction[requestedAction.value])

function openConfirmModal(action: UserManagementAction) {
  requestedAction.value = action
  isConfirmModalOpen.value = true
}

async function performRequestedAction(action: UserManagementAction) {
  if (action === 'activate' || action === 'deactivate') {
    await userDetailsStore.changeViewedUserActivation(action === 'activate')
    return
  }
  await userDetailsStore.changeViewedUserRole(action === 'make-admin' ? 'admin' : 'member')
}

async function handleActionConfirmed() {
  const action = requestedAction.value
  const actionCopy = copyByAction[action]
  const viewedUserName = props.viewedUser.displayName
  isSubmittingAction.value = true
  try {
    await performRequestedAction(action)
    isConfirmModalOpen.value = false
    actionFeedbackStore.showSuccessFeedback(
      actionCopy.successTitle(viewedUserName),
      actionCopy.successMessage,
    )
  } catch (actionError) {
    actionFeedbackStore.showErrorFeedback(
      actionCopy.errorTitle,
      describeError(actionError, 'Something went wrong. Please try again.'),
    )
  } finally {
    isSubmittingAction.value = false
  }
}

function handleApprovalsButtonClick() {
  router.push({ name: 'admin-approvals' })
}
</script>

<template>
  <AdminDetailsSection title="Actions">
    <BaseText v-if="isCurrentUser" size="sm" tone="muted">
      You can't change your own account. Ask another admin if you need a change.
    </BaseText>
    <AdminDetailsActionRow
      v-else-if="isPendingApproval"
      title="Waiting for approval"
      description="Approve or deny this user before managing their account."
    >
      <BaseButton
        variant="primary"
        appearance="outlined"
        :leading-icon="RedirectLinkIcon"
        class="w-full sm:w-auto"
        @click="handleApprovalsButtonClick"
      >
        Go to approvals
      </BaseButton>
    </AdminDetailsActionRow>
    <div v-else class="flex flex-col gap-4">
      <AdminDetailsActionRow title="Admin role" :description="roleActionDescription">
        <BaseButton
          variant="neutral"
          appearance="outlined"
          :leading-icon="iconByAction[roleAction]"
          :is-disabled="!isAdmin && !canBecomeAdmin"
          class="w-full sm:w-auto"
          @click="openConfirmModal(roleAction)"
        >
          {{ copyByAction[roleAction].confirmLabel }}
        </BaseButton>
      </AdminDetailsActionRow>
      <AdminDetailsActionRow title="Account access" :description="activationActionDescription">
        <BaseButton
          :variant="variantByAction[activationAction]"
          :leading-icon="iconByAction[activationAction]"
          class="w-full sm:w-auto"
          @click="openConfirmModal(activationAction)"
        >
          {{ copyByAction[activationAction].confirmLabel }}
        </BaseButton>
      </AdminDetailsActionRow>
    </div>
  </AdminDetailsSection>

  <ConfirmActionModal
    v-model:open="isConfirmModalOpen"
    :title="requestedActionCopy.confirmTitle(viewedUser.displayName)"
    :description="requestedActionCopy.confirmDescription"
    :confirm-label="requestedActionCopy.confirmLabel"
    :icon="iconByAction[requestedAction]"
    :variant="variantByAction[requestedAction]"
    :is-submitting="isSubmittingAction"
    @confirmed="handleActionConfirmed"
  />
</template>
