import { v4 as uuidv4 } from 'uuid'

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

  static execute(command) {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4()
      const listener = (event) => {
        window.electron.ipcRenderer.removeListener(uuid, listener)
        if (event.code !== 0) reject(event)
        else resolve(event)
      }

      window.electron.ipcRenderer.on(uuid, listener)
      window.electron.ipcRenderer.send('execute-ssh', { command, uuid })
    })
  }
}

export default Firewall
