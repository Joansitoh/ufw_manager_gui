import {
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure
} from '@chakra-ui/react'
import { useState } from 'react'
import { BiTrash } from 'react-icons/bi'
import { useStorage } from '../../handlers/StorageHandler'
import FirewallRemoveDialog from './FirewallRemoveDialog'

const buildRule = ({ action, port, protocol, from, to, rule = undefined, remove = false }) => {
  // Return the ufw rule
  const extra = remove ? 'delete ' : ''

  // Reformat the rule
  if (protocol === 'any') protocol = ''
  if (from === '0.0.0.0/0') from = ''
  if (to === '0.0.0.0/0') to = ''

  let ufwCommand = `sudo ufw ${extra}${action}`

  if (port) {
    if (protocol) {
      if (from && to) {
        ufwCommand += ` from ${from} to ${to} port ${port} proto ${protocol}`
      } else if (from) {
        ufwCommand += ` from ${from} to any port ${port} proto ${protocol}`
      } else if (to) {
        ufwCommand += ` from any to ${to} port ${port} proto ${protocol}`
      } else {
        ufwCommand += ` ${port}/${protocol}`
      }
    } else {
      if (from && to) {
        ufwCommand += ` from ${from} to ${to} port ${port}`
      } else if (from) {
        ufwCommand += ` from ${from} to any port ${port}`
      } else if (to) {
        ufwCommand += ` from any to ${to} port ${port}`
      } else {
        ufwCommand += ` ${port}`
      }
    }
  } else {
    if (from && to) {
      ufwCommand += ` from ${from} to ${to}`
    } else if (from) {
      ufwCommand += ` from ${from}`
    } else if (to) {
      ufwCommand += ` to ${to}`
    }
  }

  return ufwCommand
}

const FirewallTable = () => {
  const rules = useStorage((state) => state.rules)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedRule, setSelectedRule] = useState(null)

  return (
    <>
      {selectedRule && (
        <FirewallRemoveDialog
          isOpen={isOpen}
          onClose={() => {
            onClose()
            setSelectedRule(null)
          }}
          rule={selectedRule}
        />
      )}
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Action</Th>
              <Th>From</Th>
              <Th>To</Th>
              <Th isNumeric>Port</Th>
              <Th>Protocol</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {rules.map((rule, index) => (
              <Tr key={index}>
                <Td>{rule.action}</Td>
                <Td>{rule.from}</Td>
                <Td>{rule.to}</Td>
                <Td isNumeric>{rule.port}</Td>
                <Td>{rule.protocol}</Td>
                <Td>
                  <IconButton
                    icon={<BiTrash />}
                    onClick={() => {
                      setSelectedRule(rule)
                      onOpen()
                    }}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  )
}

export default FirewallTable
export { buildRule }
