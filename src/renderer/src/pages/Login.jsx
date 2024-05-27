import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Switch,
  useToast
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { BsFolder } from 'react-icons/bs'
import { useStorage } from '../handlers/StorageHandler'

import logo from '../assets/logo.png'

const Login = () => {
  const toast = useToast()

  const [host, setHost] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [sshKeyPath, setSSHKeyPath] = useState('')
  const [useSSHKey, setUseSSHKey] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)

  const selectFile = () => {
    window.electron.ipcRenderer.send('open-file-dialog')
  }

  useEffect(() => {
    window.electron.ipcRenderer.on('selected-file', (event, path) => {
      setSSHKeyPath(path)
    })

    window.electron.ipcRenderer.send('load-credentials')
    window.electron.ipcRenderer.once('loaded-credentials', (event, credentials) => {
      if (credentials.host) {
        setHost(credentials.host)
        setRememberMe(true)
      }
      if (credentials.username) {
        setUsername(credentials.username)
      }
      if (credentials.sshKeyPath) {
        setSSHKeyPath(credentials.sshKeyPath)
      }
      if (credentials.sshKey) {
        setUseSSHKey(credentials.sshKey)
      }
    })

    // Limpiar al desmontar
    return () => {
      window.electron.ipcRenderer.removeAllListeners('selected-file')
      window.electron.ipcRenderer.removeAllListeners('loaded-credentials')
    }
  }, [])

  const handleLogin = async () => {
    setLoggingIn(true)

    if (rememberMe) {
      // Guardar en el almacenamiento
      window.electron.ipcRenderer.send('save-credentials', {
        host: host,
        username: username,
        sshKey: useSSHKey,
        sshKeyPath: sshKeyPath
      })
    }

    try {
      const sshConfig = {
        host: host,
        username: username,
        password: password,
        sshKey: useSSHKey,
        sshKeyPath: sshKeyPath
      }

      window.electron.ipcRenderer.send('connect-ssh', sshConfig)

      window.electron.ipcRenderer.once('ssh-ready', (event, data) => {
        setLoggingIn(false)
        toast({
          title: 'Success',
          description: `Connected to ${host}.`,
          status: 'success',
          duration: 4000,
          isClosable: true
        })

        useStorage.getState().setLogged(true)
      })

      window.electron.ipcRenderer.once('ssh-error', (event, error) => {
        setLoggingIn(false)
        toast({
          title: 'Error',
          description: error,
          status: 'error',
          duration: 4000,
          isClosable: true
        })
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 4000,
        isClosable: true
      })
      setLoggingIn(false)
    }
  }

  useEffect(() => {
    // Limpiar al desmontar
    return () => {
      window.electron.ipcRenderer.removeAllListeners('ssh-ready')
      window.electron.ipcRenderer.removeAllListeners('ssh-error')
    }
  }, [])

  return (
    <div className="h-screen w-full items-center flex justify-center p-5">
      <div className="flex items-center justify-between rounded-lg">
        {/* LOGO HEADER */}
        <div className="flex flex-col justify-center items-center gap-2 px-10">
          <img src={logo} alt="Logo" className="w-2/3 m-auto" />
          <h1 className="text-white text-3xl text-center font-bold">UFW MANAGER GUI</h1>
        </div>
        <div className="flex flex-col justify-center px-10 py-24 w-2/3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleLogin()
            }}
          >
            <FormControl mb={4} isRequired>
              <FormLabel fontSize="sm">Host</FormLabel>
              <Input
                type="text"
                fontSize="sm"
                variant="filled"
                placeholder="Host (e.g. localhost:22)"
                disabled={loggingIn}
                onChange={(e) => setHost(e.target.value)}
                value={host}
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel fontSize="sm">Username</FormLabel>
              <Input
                type="text"
                fontSize="sm"
                variant="filled"
                placeholder="Username"
                disabled={loggingIn}
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
            </FormControl>
            <FormControl mb={4} className="flex gap-2">
              <Switch onChange={(e) => setUseSSHKey(e.target.checked)} isChecked={useSSHKey} />
              <FormLabel fontSize="sm">Use SSH Key</FormLabel>
            </FormControl>
            <FormControl mb={4} isDisabled={!useSSHKey} isRequired={useSSHKey}>
              <FormLabel fontSize="sm">SSH Key Path</FormLabel>
              <div className="flex gap-2">
                <Input
                  type="text"
                  fontSize="sm"
                  variant="filled"
                  placeholder="Key path"
                  isDisabled={loggingIn || !useSSHKey}
                  onChange={(e) => setSSHKeyPath(e.target.value)}
                  value={sshKeyPath}
                />
                <IconButton
                  icon={<BsFolder />}
                  isDisabled={loggingIn || !useSSHKey}
                  onClick={selectFile}
                />
              </div>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel fontSize="sm">
                <span>{useSSHKey ? 'Key Passphrase' : 'Password'}</span>
              </FormLabel>
              <Input
                type="password"
                fontSize="sm"
                variant="filled"
                placeholder="Password"
                disabled={loggingIn}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </FormControl>
            <div className="flex gap-2 items-center">
              <Button colorScheme="blue" isLoading={loggingIn} type="submit">
                Login
              </Button>
              <div className="flex flex-col">
                <Checkbox
                  rounded="lg"
                  onChange={(e) => setRememberMe(e.target.checked)}
                  isChecked={rememberMe}
                >
                  Remember me
                </Checkbox>
                <p className="text-sm text-gray-400">
                  This option saves the host, username and ssh key path.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
