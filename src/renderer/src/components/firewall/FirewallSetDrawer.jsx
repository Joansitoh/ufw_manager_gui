import {
  Button,
  Code,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Switch,
  useToast
} from '@chakra-ui/react'
import { useState } from 'react'
import { buildRule } from './FirewallTable'
import Firewall from '../../handlers/FirewallHandler'
import { useStorage } from '../../handlers/StorageHandler'

const FirewallSetDrawer = ({ isOpen, onClose }) => {
  const toast = useToast()

  // DRAWER
  const [simpleMode, setSimpleMode] = useState(true)
  const [action, setAction] = useState('allow')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [port, setPort] = useState(0)
  const [protocol, setProtocol] = useState('tcp')
  const [rule, setRule] = useState('')

  const handleAddRule = () => {
    if (simpleMode && !from && !to && !port) {
      toast({
        title: 'Error',
        description: 'Please fill all the fields',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }

    const command = buildRule({
      action: action,
      from: from,
      to: to,
      port: port,
      protocol: protocol
    })

    onClose()

    const addRulePromise = () => {
      const tempRule = { temp: true }
      useStorage.getState().addRule(tempRule)

      return new Promise((resolve, reject) => {
        Firewall.execute(command).then((result) => {
          useStorage.getState().deleteRule(tempRule)

          if (result?.data.includes('Skipping')) {
            reject('Rule already exists')
          } else {
            useStorage.getState().addRule({
              action: action,
              from: from || '0.0.0.0/0',
              to: to || '0.0.0.0/0',
              port: port,
              protocol: protocol
            })

            resolve('Rule added successfully')
          }
        })
      })
    }

    toast.promise(addRulePromise(), {
      loading: {
        title: 'Loading',
        description: 'Adding rule to firewall...'
      },
      success: {
        title: 'Success',
        description: 'Rule added successfully'
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
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={() => {
        onClose()
        setSimpleMode(true)
        setAction('allow')
        setFrom('')
        setTo('')
        setPort(0)
        setProtocol('tcp')
        setRule('')
      }}
    >
      <DrawerOverlay />
      <DrawerContent color="white">
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" mb={2}>
          Add new rule
        </DrawerHeader>

        <DrawerBody>
          <div className="flex items-center mb-4">
            <Switch onChange={() => setSimpleMode(!simpleMode)} isChecked={simpleMode} />
            <h1 className="ml-2">Simple mode</h1>
          </div>
          {simpleMode ? (
            <div className="flex flex-col gap-2">
              <FormControl>
                <FormLabel>Action</FormLabel>
                <Select defaultValue="allow" onChange={(e) => setAction(e.target.value)}>
                  <option value="allow">Allow</option>
                  <option value="deny">Deny</option>
                </Select>
                <FormHelperText>Allow or deny the connection</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>From</FormLabel>
                <Input placeholder="From" onChange={(e) => setFrom(e.target.value)} />
                <FormHelperText>IP address or network interface</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>To</FormLabel>
                <Input placeholder="To" onChange={(e) => setTo(e.target.value)} />
                <FormHelperText>IP address or network interface</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Port</FormLabel>
                <Input placeholder="Port" type="number" onChange={(e) => setPort(e.target.value)} />
                <FormHelperText>Port number</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Protocol</FormLabel>
                <Select defaultValue="tcp" onChange={(e) => setProtocol(e.target.value)}>
                  <option value="tcp">TCP</option>
                  <option value="udp">UDP</option>
                </Select>
                <FormHelperText>TCP or UDP</FormHelperText>
              </FormControl>

              <Divider />
              <div className="flex flex-col gap-1">
                <h1>Rule:</h1>
                <Code rounded={'md'} px={2} py={1} variant={'solid'}>
                  {buildRule({
                    action: action,
                    from: from,
                    to: to,
                    port: port,
                    protocol: protocol
                  })}
                </Code>
              </div>
            </div>
          ) : (
            /* Advanced mode has method to write rule by text with command "ufw" */
            <div className="flex flex-col gap-2">
              <FormControl>
                <FormLabel>Rule</FormLabel>
                <Input placeholder="Rule" onChange={(e) => setRule(e.target.value)} />
                <FormHelperText>Write the rule in UFW format</FormHelperText>
              </FormControl>

              <Divider />
              <div className="flex flex-col gap-1">
                <h1>Rule:</h1>
                <Code rounded={'md'} px={2} py={1} variant={'solid'}>
                  {buildRule({
                    rule: rule
                  })}
                </Code>
              </div>
            </div>
          )}
        </DrawerBody>

        <DrawerFooter>
          <Button colorScheme="blue" onClick={handleAddRule}>
            Add
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default FirewallSetDrawer
