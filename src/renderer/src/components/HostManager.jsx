import {
  Badge,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Select,
  Switch,
  Tooltip,
  useDisclosure,
  useToast
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { BsFolder, BsPlus } from 'react-icons/bs'
import { FaSave, FaServer, FaTrash } from 'react-icons/fa'
import { useStorage } from '../handlers/StorageHandler'

const HostItem = ({ host, isActive, onSelect, onDelete }) => {
  return (
    <div
      className={`flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer hover:bg-zinc-700 ${isActive ? 'bg-zinc-700' : 'bg-zinc-800'}`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <FaServer className="text-gray-400" />
        <div>
          <p className="text-white text-sm font-medium">{host.username}@{host.host}</p>
          <Badge colorScheme={host.status === 'connected' ? 'green' : 'yellow'} size="sm">
            {host.status === 'connected' ? 'Connected' : 'Connecting...'}
          </Badge>
        </div>
      </div>
      <IconButton
        icon={<FaTrash />}
        colorScheme="red"
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(host.id);
        }}
      />
    </div>
  );
};

const HostManager = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const hosts = useStorage((state) => state.hosts);
  const activeHost = useStorage((state) => state.activeHost);

  const [host, setHost] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sshKeyPath, setSSHKeyPath] = useState('');
  const [useSSHKey, setUseSSHKey] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [savedHosts, setSavedHosts] = useState([]);
  const [selectedSavedHost, setSelectedSavedHost] = useState('');

  const selectFile = () => {
    window.electron.ipcRenderer.send('open-file-dialog');
  };

  // Load saved hosts from localStorage on component mount
  useEffect(() => {
    try {
      const savedHostsData = localStorage.getItem('savedHosts');
      if (savedHostsData) {
        const parsedHosts = JSON.parse(savedHostsData);
        setSavedHosts(parsedHosts);
      }
    } catch (error) {
      console.error('Error loading saved hosts:', error);
    }
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.on('selected-file', (event, path) => {
      setSSHKeyPath(path);
    });

    // Cleanup on unmount
    return () => {
      window.electron.ipcRenderer.removeAllListeners('selected-file');
    };
  }, []);

  // Handle selecting a saved host from the dropdown
  const handleSelectSavedHost = (e) => {
    const hostId = e.target.value;
    setSelectedSavedHost(hostId);

    if (hostId) {
      const selectedHost = savedHosts.find(h => h.id === hostId);
      if (selectedHost) {
        setHost(selectedHost.host);
        setUsername(selectedHost.username);
        setPassword(selectedHost.password || '');
        setUseSSHKey(selectedHost.sshKey || false);
        setSSHKeyPath(selectedHost.sshKeyPath || '');
      }
    } else {
      // Clear form if "Select a saved host" is chosen
      resetForm();
    }
  };

  // Reset form fields
  const resetForm = () => {
    setHost('');
    setUsername('');
    setPassword('');
    setUseSSHKey(false);
    setSSHKeyPath('');
    setSelectedSavedHost('');
  };

  // Save current host configuration
  const saveHostConfig = () => {
    if (!host || !username) {
      toast({
        title: 'Missing information',
        description: 'Please provide at least host and username to save configuration.',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      const hostConfig = {
        id: Date.now().toString(),
        host: host.trim(),
        username: username.trim(),
        password: '',
        sshKey: useSSHKey,
        sshKeyPath: sshKeyPath
      };

      const updatedSavedHosts = [...savedHosts, hostConfig];
      setSavedHosts(updatedSavedHosts);
      localStorage.setItem('savedHosts', JSON.stringify(updatedSavedHosts));

      toast({
        title: 'Host saved',
        description: `Configuration for ${username}@${host} has been saved.`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error saving host:', error);
      toast({
        title: 'Error',
        description: 'Failed to save host configuration.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Delete a saved host configuration
  const deleteSavedHost = (hostId) => {
    try {
      const updatedSavedHosts = savedHosts.filter(h => h.id !== hostId);
      setSavedHosts(updatedSavedHosts);
      localStorage.setItem('savedHosts', JSON.stringify(updatedSavedHosts));

      if (selectedSavedHost === hostId) {
        setSelectedSavedHost('');
        resetForm();
      }

      toast({
        title: 'Host removed',
        description: 'The saved host configuration has been removed.',
        status: 'info',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error deleting saved host:', error);
    }
  };

  const handleAddHost = async () => {
    setConnecting(true);

    try {
      const sshConfig = {
        host: host.trim(), // Trim for removing whitespace
        username: username.trim(),
        password: password,
        sshKey: useSSHKey,
        sshKeyPath: sshKeyPath,
        status: 'connecting'
      };

      const tempId = Date.now().toString();
      let connectionTimedOut = false;

      // Add event listeners before sending the connection request
      const readyListener = () => {
        if (connectionTimedOut) return; // Ignore if connection already timed out
        
        console.log(`Received ssh-ready-${tempId} event`);
        setConnecting(false);

        // Add the host to the list with connected status
        useStorage.getState().addHost({ ...sshConfig, id: tempId, status: 'connected' });

        toast({
          title: 'Success',
          description: `Connected to ${host}.`,
          status: 'success',
          duration: 4000,
          isClosable: true
        });

        onClose();

        // Clean up listener
        window.electron.ipcRenderer.removeAllListeners(`ssh-ready-${tempId}`);
        window.electron.ipcRenderer.removeAllListeners(`ssh-error-${tempId}`);
      };

      const errorListener = (event, error) => {
        if (connectionTimedOut) return; // Ignore if connection already timed out
        
        console.log(`Received ssh-error-${tempId} event:`, error);
        setConnecting(false);

        toast({
          title: 'Connection error',
          description: error || 'Failed to connect to the host.',
          status: 'error',
          duration: 4000,
          isClosable: true
        });

        // Clean up listener
        window.electron.ipcRenderer.removeAllListeners(`ssh-ready-${tempId}`);
        window.electron.ipcRenderer.removeAllListeners(`ssh-error-${tempId}`);
      };

      // Register event listeners
      window.electron.ipcRenderer.on(`ssh-ready-${tempId}`, readyListener);
      window.electron.ipcRenderer.on(`ssh-error-${tempId}`, errorListener);

      // Send connection request with the ID
      console.log(`Sending connect-additional-ssh for ID ${tempId}`);
      window.electron.ipcRenderer.send('connect-additional-ssh', { ...sshConfig, id: tempId });

      // Set a timeout to handle cases where neither ready nor error events are received
      setTimeout(() => {
        const hosts = useStorage.getState().hosts;
        const hostExists = hosts.some(h => h.id === tempId);
        
        if (!hostExists) {
          console.log(`Connection timeout for ID ${tempId}`);
          connectionTimedOut = true;
          errorListener(null, 'Connection timed out. Please check your credentials and try again.');
        }
      }, 35000); // 35 seconds timeout (slightly longer than the readyTimeout in main process)

    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 4000,
        isClosable: true
      });
      setConnecting(false);
    }
  };

  const handleSelectHost = (hostId) => {
    useStorage.getState().setActiveHost(hostId);
  };

  const handleDeleteHost = (hostId) => {
    // Disconnect from the host
    window.electron.ipcRenderer.send('disconnect-host', hostId);

    // Remove from state
    useStorage.getState().removeHost(hostId);

    toast({
      title: 'Host removed',
      description: 'The host has been disconnected and removed.',
      status: 'info',
      duration: 3000,
      isClosable: true
    });
  };

  return (
    <>
      <Button
        leftIcon={<BsPlus />}
        colorScheme="blue"
        onClick={onOpen}
        size="sm"
      >
        Add host
      </Button>

      <Drawer isOpen={isOpen} placement="right" onClose={() => !connecting && onClose()}>
        <DrawerOverlay />
        <DrawerContent bg="gray.800" color="white">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Add new host</DrawerHeader>

          <DrawerBody>
            {/* Saved Hosts Selector */}
            {savedHosts.length > 0 && (
              <FormControl mb={4}>
                <FormLabel fontSize="sm">Load saved host</FormLabel>
                <Select
                  variant="filled"
                  placeholder="Select a saved host"
                  value={selectedSavedHost}
                  onChange={handleSelectSavedHost}
                  disabled={connecting}
                >
                  {savedHosts.map(savedHost => (
                    <option key={savedHost.id} value={savedHost.id}>
                      {savedHost.username}@{savedHost.host}
                    </option>
                  ))}
                </Select>
                {selectedSavedHost && (
                  <Flex justifyContent="flex-end" mt={1}>
                    <Button
                      size="xs"
                      colorScheme="red"
                      leftIcon={<FaTrash />}
                      onClick={() => deleteSavedHost(selectedSavedHost)}
                      disabled={connecting}
                    >
                      Delete
                    </Button>
                  </Flex>
                )}
              </FormControl>
            )}

            <FormControl mb={4} isRequired>
              <FormLabel fontSize="sm">Host</FormLabel>
              <Input
                type="text"
                fontSize="sm"
                variant="filled"
                placeholder="Host (e.g. localhost:22)"
                disabled={connecting}
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
                disabled={connecting}
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
                  isDisabled={connecting || !useSSHKey}
                  onChange={(e) => setSSHKeyPath(e.target.value)}
                  value={sshKeyPath}
                />
                <IconButton
                  icon={<BsFolder />}
                  isDisabled={connecting || !useSSHKey}
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
                disabled={connecting}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </FormControl>
            <FormControl mb={4}>
              <Tooltip label="Save current host configuration for future use">
                <Button
                  leftIcon={<FaSave />}
                  size="sm"
                  colorScheme="teal"
                  onClick={saveHostConfig}
                  isDisabled={connecting || !host || !username}
                  width="full"
                >
                  Save host configuration
                </Button>
              </Tooltip>
            </FormControl>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onClose} isDisabled={connecting}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              isLoading={connecting}
              onClick={handleAddHost}
              isDisabled={!host || !username || (useSSHKey && !sshKeyPath)}
            >
              Connect
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {hosts.length > 0 ? (
          hosts.map((host) => (
            <HostItem
              key={host.id}
              host={host}
              isActive={activeHost === host.id}
              onSelect={() => handleSelectHost(host.id)}
              onDelete={handleDeleteHost}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 p-2">
            <p>No hosts added yet.</p>
            <p className="text-sm">Click "Add Host" to connect to a server.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default HostManager;
