import { Client } from '@electerm/ssh2'
import { ipcMain, dialog, shell, app } from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// Store for multiple connections
let connections = new Map();
let conn; // Keep for backward compatibility

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

  // Handler for additional SSH connections
  ipcMain.on('connect-additional-ssh', (event, sshConfig) => {
    const newConn = new Client();
    const id = sshConfig.id;

    console.log(`Attempting to connect to ${sshConfig.host} with ID ${id}`);

    newConn
      .on('ready', () => {
        console.log(`Connection established for ID ${id}`);
        connections.set(id, newConn);
        event.sender.send(`ssh-ready-${id}`);
      })
      .on('error', (err) => {
        console.error(`Connection error for ID ${id}:`, err);
        event.sender.send(`ssh-error-${id}`, err.message);
      })
      .connect({
        host: sshConfig.host,
        port: sshConfig.host.includes(':') ? parseInt(sshConfig.host.split(':')[1]) : 22,
        username: sshConfig.username,
        password: sshConfig.sshKey ? undefined : sshConfig.password,
        privateKey: sshConfig.sshKey ? readFileSync(sshConfig.sshKeyPath, 'utf8') : undefined,
        passphrase: sshConfig.sshKey ? sshConfig.password : undefined,
        readyTimeout: 30000, // Increase timeout to 30 seconds
        keepaliveInterval: 10000 // Send keepalive every 10 seconds
      });
  });

  // Disconnect a specific host
  ipcMain.on('disconnect-host', (event, hostId) => {
    if (connections.has(hostId)) {
      connections.get(hostId).end();
      connections.delete(hostId);
    }
  });

  ipcMain.on('disconnect-ssh', (event) => {
    if (conn) {
      conn.end()
      conn = undefined
    }
    
    // Close all connections
    for (const connection of connections.values()) {
      connection.end();
    }
    connections.clear();
  })

  ipcMain.on('execute-ssh', (event, { command, uuid, hostId }) => {
    // If hostId is provided, use that specific connection
    const connection = hostId && connections.has(hostId) ? connections.get(hostId) : conn;
    
    if (connection) {
      connection.exec(command, (err, stream) => {
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
  
  // Close all connections
  for (const connection of connections.values()) {
    connection.end();
  }
  connections.clear();
}

export { registerIpcHandlers, closeConnection }
