import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useToast
} from '@chakra-ui/react'
import Firewall from '../../handlers/FirewallHandler'
import { buildRule } from './FirewallTable'
import { useStorage } from '../../handlers/StorageHandler'

const FirewallRemoveDialog = ({ isOpen, onClose, rule }) => {
  const toast = useToast()

  const handleDeleteRule = () => {
    const command = buildRule({
      ...rule,
      remove: true
    })

    onClose()

    const delRulePromise = () => {
      rule.remove = true

      return new Promise((resolve, reject) => {
        Firewall.execute(command).then((result) => {
          rule.remove = false
          if (result?.data.includes('Skipping')) {
            reject('Rule does not exist')
          } else {
            useStorage.getState().deleteRule(rule)
            resolve('Rule deleted successfully')
          }
        })
      })
    }

    toast.promise(delRulePromise(), {
      loading: {
        title: 'Loading',
        description: 'Deleting rule from firewall...'
      },
      success: {
        title: 'Success',
        description: 'Rule deleted successfully'
      },
      error: (result) => {
        return {
          title: 'Error',
          description: result
        }
      }
    })
  }

  return (
    <AlertDialog motionPreset="slideInBottom" onClose={onClose} isOpen={isOpen} isCentered>
      <AlertDialogOverlay />

      <AlertDialogContent color="white">
        <AlertDialogHeader>Delete rule?</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          Are you sure you want to delete the following rule?
          <br />
          <br />
          <code>{rule ? buildRule({ ...rule }) : 'No rule selected'}</code>
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button
            colorScheme="red"
            ml={3}
            onClick={() => {
              handleDeleteRule(rule)
              onClose()
            }}
          >
            Yes
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default FirewallRemoveDialog
