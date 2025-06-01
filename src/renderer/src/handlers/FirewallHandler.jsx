import { v4 as uuidv4 } from 'uuid'
import { useStorage } from './StorageHandler'

class Firewall {
  static parse(firewallTable) {
    const rules = []
    const ruleRegex = /### tuple ### (\w+) (\w+) (\d+) ([0-9.:\/]+) (\w+) ([0-9.:\/]+) (\w+)/g
    let match
    while ((match = ruleRegex.exec(firewallTable)) !== null) {
      const rule = {
        action: match[1], // allow/deny
        protocol: match[2], // tcp/udp
        port: parseInt(match[3]),
        from: match[6],
        to: match[4],
        interface: match[7],
        completeRule: match[0]
      }
      rules.push(rule)
    }

    return rules
  }

  static execute(command, hostId = null) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4()
      const listener = (event, data) => {
        window.electron.ipcRenderer.removeListener(uuid, listener)
        if (data.code !== 0) reject(data)
        else resolve(data)
      }

      // If no hostId is provided, use the active host from storage
      const activeHostId = hostId || useStorage.getState().activeHost;

      window.electron.ipcRenderer.once(uuid, listener)
      window.electron.ipcRenderer.send('execute-ssh', { command, uuid, hostId: activeHostId })
    })
  }
}

export default Firewall
