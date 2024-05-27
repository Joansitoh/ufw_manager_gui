import { Client } from '@electerm/ssh2'
import { ipcMain, dialog, shell, app } from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

let conn

const registerIpcHandlers = () => {
  ipcMain.on('connect-ssh', (event, sshConfig) => {
    conn = new Client()
    conn
      .on('ready', () => {
        event.sender.send('ssh-ready')
      })
      .on('error', (err) => {
        console.error(err)
        event.sender.send('ssh-error', err.message)
      })
      .connect({
        host: sshConfig.host,
        username: sshConfig.username,
        password: sshConfig.sshKey ? undefined : sshConfig.password,
        privateKey: sshConfig.sshKey ? readFileSync(sshConfig.sshKeyPath, 'utf8') : undefined,
        passphrase: sshConfig.sshKey ? sshConfig.password : undefined
      })
  })

  ipcMain.on('disconnect-ssh', (event) => {
    if (conn) {
      conn.end()
      conn = undefined
    }
  })

  ipcMain.on('execute-ssh', (event, { command, uuid }) => {
    if (conn) {
      conn.exec(command, (err, stream) => {
        if (err) {
          event.sender.send(uuid, { error: err.message })
          return
        }

        let output = ''
        stream
          .on('close', (code, signal) => {
            event.sender.send(uuid, { code, signal, data: output })
          })
          .on('data', (data) => {
            output += data.toString()
          })
          .stderr.on('data', (data) => {
            output += data.toString()
          })
      })
    } else {
      event.sender.send(uuid, {
        error: 'No SSH connection available'
      })
    }
  })

  ipcMain.on('open-file-dialog', (event) => {
    dialog
      .showOpenDialog({
        properties: ['openFile']
      })
      .then((result) => {
        if (!result.canceled) {
          event.sender.send('selected-file', result.filePaths[0])
        }
      })
      .catch((err) => {})
  })

  ipcMain.on('open-url', (event, url) => {
    shell.openExternal(url)
  })

  ipcMain.on('save-credentials', (event, credentials) => {
    const { host, username, sshKey, sshKeyPath } = credentials
    const data = {
      host,
      username,
      sshKey,
      sshKeyPath
    }

    const storagePath = app.getPath('userData')
    const storageFile = join(storagePath, 'credentials.json')
    writeFileSync(storageFile, JSON.stringify(data))
  })

  ipcMain.on('load-credentials', (event) => {
    const storagePath = app.getPath('userData')
    const storageFile = join(storagePath, 'credentials.json')
    let data = {}
    try {
      data = JSON.parse(readFileSync(storageFile, 'utf8'))
    } catch (err) {}

    event.sender.send('loaded-credentials', data)
  })
}

const closeConnection = () => {
  if (conn) {
    conn.end()
  }
}

export { registerIpcHandlers, closeConnection }
