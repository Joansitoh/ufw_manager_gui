import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Skeleton,
  Tooltip,
  useDisclosure,
  useToast
} from '@chakra-ui/react'
import React, { useCallback, useEffect, useState } from 'react'
import { BiShield } from 'react-icons/bi'
import { FaArrowLeft, FaDownload, FaPlus, FaServer, FaTrash } from 'react-icons/fa'
import { FiSettings } from 'react-icons/fi'
import Development from '../components/Development'
import Sidebar from '../components/Sidebar'
import FirewallSetDrawer from '../components/firewall/FirewallSetDrawer'
import FirewallTable from '../components/firewall/FirewallTable'
import Firewall from '../handlers/FirewallHandler'
import { useStorage } from '../handlers/StorageHandler'

const UFWStatusBadge = ({ firstLoad, installed, enabled }) => {
  if (!firstLoad) {
    return <Skeleton height="20px" width="60px" rounded="md" />
  }

  if (!installed) {
    return <Badge colorScheme="red">Not Installed</Badge>
  }

  return <Badge colorScheme={enabled ? 'green' : 'yellow'}>{enabled ? 'Active' : 'Disabled'}</Badge>
}

const UFWActionButton = ({
  firstLoad,
  installed,
  enabled,
  handleDisable,
  handleEnable,
  handleInstall,
  installing,
  enabling,
  disabling
}) => {
  const [showPopover, setShowPopover] = useState(true);

  useEffect(() => {
    // Check if the user has seen the popup before
    const hasSeenPopup = localStorage.getItem('hasSeenUFWInstallPopup');
    if (hasSeenPopup === 'true') {
      setShowPopover(false);
    }
  }, []);

  const handleInstallClick = () => {
    // Mark that the user has seen the popup
    localStorage.setItem('hasSeenUFWInstallPopup', 'true');
    setShowPopover(false);
    handleInstall();
  };

  if (!firstLoad) {
    return <Skeleton height="40px" width="40px" rounded="md" />
  }

  if (!installed) {
    return (
      <Tooltip label="Install UFW">
        {showPopover ? (
          <Popover placement="bottom" closeOnBlur={false} defaultIsOpen colorScheme="gray">
            <PopoverTrigger>
              <IconButton
                isLoading={installing}
                icon={<FaDownload />}
                colorScheme="green"
                onClick={handleInstallClick}
              >
                Install
              </IconButton>
            </PopoverTrigger>
            <PopoverContent color="white" bg="blue.800" borderColor="blue.800">
              <PopoverHeader pt={4} fontWeight="bold" border="0">
                Install your firewall
              </PopoverHeader>
              <PopoverArrow bg="blue.800" />
              <PopoverCloseButton onClick={() => {
                localStorage.setItem('hasSeenUFWInstallPopup', 'true');
                setShowPopover(false);
              }} />
              <PopoverBody>
                We noticed that you don't have UFW installed. Click the button below to install it.
                You can also enable it after installing it.
              </PopoverBody>
            </PopoverContent>
          </Popover>
        ) : (
          <IconButton
            isLoading={installing}
            icon={<FaDownload />}
            colorScheme="green"
            onClick={handleInstall}
          >
            Install
          </IconButton>
        )}
      </Tooltip>
    )
  }

  if (enabled) {
    return (
      <Tooltip label="Disable UFW">
        <IconButton
          isLoading={disabling}
          icon={<BiShield />}
          colorScheme="red"
          onClick={handleDisable}
        >
          Disable
        </IconButton>
      </Tooltip>
    )
  }

  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef()

  return (
    <>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Enable firewall?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to enable the firewall? This will block all incoming connections
            except for the ones you allow.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              No
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              onClick={() => {
                handleEnable()
                onClose()
              }}
            >
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Tooltip label="Enable UFW">
        <IconButton isLoading={enabling} icon={<BiShield />} colorScheme="green" onClick={onOpen}>
          Enable
        </IconButton>
      </Tooltip>
    </>
  )
}

function Home() {
  const toast = useToast()
  const currentPage = useStorage((state) => state.page)
  const activeHost = useStorage((state) => state.activeHost)
  const hosts = useStorage((state) => state.hosts)

  const [firstLoad, setFirstLoad] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [enabling, setEnabling] = useState(false)
  const [disabling, setDisabling] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const fetchUserRules = () => {
    if (!activeHost) return;

    Firewall.execute('sudo cat /etc/ufw/user.rules')
      .then((result) => {
        const ruleList = Firewall.parse(result.data) || []
        useStorage.getState().setRules(ruleList)
      })
      .catch((error) => { })
  }

  useEffect(() => {
    if (activeHost) {
      fetchUserRules()
      checkUFWStatus()
    }
  }, [activeHost])

  const Content = () => {
    switch (currentPage) {
      case 'rules':
        return FirewallTable()
      default:
        return Development()
    }
  }

  useEffect(() => {
    if (activeHost) {
      checkUFWStatus()
    }
  }, [activeHost])

  const checkUFWStatus = () => {
    if (!activeHost) return;

    Firewall.execute('sudo ufw status')
      .then((result) => {
        setInstalled(true)
        setEnabled(result.data.includes('Status: active'))
        if (!firstLoad) setFirstLoad(true)
      })
      .catch((error) => {
        if (!firstLoad) setFirstLoad(true)
        setInstalled(false)
      })
  }

  const handleInstall = () => {
    setInstalling(true)
    toast.promise(Firewall.execute('yes | sudo apt install ufw'), {
      success: (result) => {
        setInstalling(false)
        setInstalled(true)
        return {
          title: 'Success',
          description: 'UFW has been installed.'
        }
      },
      error: (error) => {
        setInstalling(false)
        return {
          title: 'Error',
          description: 'An error occurred while installing UFW.'
        }
      },
      loading: {
        title: 'Installing',
        description: 'Please wait while UFW is being installed.'
      }
    })
  }

  const handleEnable = () => {
    setEnabling(true)
    toast.promise(Firewall.execute('yes | sudo ufw enable'), {
      success: (result) => {
        setEnabling(false)
        setEnabled(true)
        return {
          title: 'Success',
          description: 'UFW has been enabled.'
        }
      },
      error: (error) => {
        setEnabling(false)
        return {
          title: 'Error',
          description: 'An error occurred while enabling UFW.'
        }
      },
      loading: {
        title: 'Enabling',
        description: 'Please wait while UFW is being enabled.'
      }
    })
  }

  const handleDisable = () => {
    setDisabling(true)
    toast.promise(Firewall.execute('yes | sudo ufw disable'), {
      success: (result) => {
        setDisabling(false)
        setEnabled(false)
        return {
          title: 'Success',
          description: 'UFW has been disabled.'
        }
      },
      error: (error) => {
        setDisabling(false)
        return {
          title: 'Error',
          description: 'An error occurred while disabling UFW.'
        }
      },
      loading: {
        title: 'Disabling',
        description: 'Please wait while UFW is being disabled.'
      }
    })
  }

  const handleDeleteAllRules = () => {
    toast.promise(Firewall.execute('yes | sudo ufw reset'), {
      success: (result) => {
        fetchUserRules()
        return {
          title: 'Success',
          description: 'All rules have been deleted.'
        }
      },
      error: (error) => {
        return {
          title: 'Error',
          description: 'An error occurred while deleting all rules.'
        }
      },
      loading: {
        title: 'Deleting',
        description: 'Please wait while all rules are being deleted.'
      }
    })
  }

  const handleLogout = () => {
    useStorage.getState().resetAll()
    toast.closeAll()
  }

  // Get the active host information
  const activeHostInfo = useCallback(() => {
    return activeHost ? hosts.find(h => h.id === activeHost) : null;
  }, [activeHost, hosts]);

  return (
    <div className="flex h-screen w-full bg-zinc-800">
      <FirewallSetDrawer isOpen={isOpen} onClose={onClose} />
      <Sidebar />
      <div className="flex flex-col flex-1">
        <div className="h-24 min-h-24 px-4 py-5 w-full border-b flex items-center justify-between">
          <div className="flex items-center gap-2 h-full">
            {activeHostInfo() ? (
              <>
                <Button as={Box} leftIcon={<FaServer />} className="flex items-center gap-1">
                  <p>UFW STATUS: </p>
                  <UFWStatusBadge firstLoad={firstLoad} installed={installed} enabled={enabled} />
                </Button>
                <UFWActionButton
                  firstLoad={firstLoad}
                  installed={installed}
                  enabled={enabled}
                  handleDisable={handleDisable}
                  handleEnable={handleEnable}
                  handleInstall={handleInstall}
                  installing={installing}
                  enabling={enabling}
                  disabling={disabling}
                />
              </>
            ) : (
              <div className="text-white">
                No active host. Please add a host from the sidebar.
              </div>
            )}
          </div>
          <div className="flex gap-2 h-full items-center">
            {activeHostInfo() && (
              <>
                <Button colorScheme="green" leftIcon={<FaPlus />} onClick={onOpen}>
                  Add Rule
                </Button>
                <Menu>
                  <MenuButton as={Button} colorScheme="gray" leftIcon={<FiSettings />}>
                    Options
                  </MenuButton>
                  <MenuList>
                    <MenuItem icon={<FaTrash />} onClick={handleDeleteAllRules}>
                      Delete all rules
                    </MenuItem>
                    <MenuItem icon={<FaArrowLeft />} onClick={handleLogout}>
                      Logout
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            )}
          </div>
        </div>
        <div className="px-4 py-5">
          <div className="bg-zinc-900 rounded-lg">
            {activeHostInfo() ? <Content /> : (
              <div className="p-10 text-center text-gray-400">
                <p className="text-xl mb-2">No active host</p>
                <p>Please add and select a host from the sidebar to manage firewall rules.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
