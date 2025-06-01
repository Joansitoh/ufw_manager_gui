import {
  Button,
  useToast
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { FaArrowRight } from 'react-icons/fa'
import { useStorage } from '../handlers/StorageHandler'

import logo from '../assets/logo.png'

const Login = () => {
  const toast = useToast()
  const [starting, setStarting] = useState(false)
  const [isTallScreen, setIsTallScreen] = useState(false)

  useEffect(() => {
    const checkScreenHeight = () => {
      setIsTallScreen(window.innerHeight > 620)
    }

    checkScreenHeight()
    window.addEventListener('resize', checkScreenHeight)

    return () => {
      window.removeEventListener('resize', checkScreenHeight)
    }
  }, [])

  const handleStart = () => {
    setStarting(true)

    // Set logged state to true to enter the application
    useStorage.getState().setLogged(true)

    toast({
      title: 'Welcome',
      description: 'Welcome to UFW Manager GUI',
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  return (
    <div className={`h-screen w-full items-center flex justify-center p-5 bg-zinc-${isTallScreen ? '800' : '900'}`}>
      <div className="flex flex-col items-center justify-center rounded-lg bg-zinc-900 p-10 shadow-xl max-w-3xl">
        {/* LOGO HEADER */}
        <div className="flex flex-col justify-center items-center gap-4 mb-8">
          <img src={logo} alt="Logo" className="w-40 h-40" />
          <h1 className="text-white text-4xl text-center font-bold">UFW MANAGER GUI</h1>
        </div>

        <div className="text-center mb-10">
          <p className="text-gray-300 text-xl mb-4">
            Welcome to UFW Manager GUI
          </p>
          <p className="text-gray-400 mb-6">
            A simple and intuitive interface to manage your firewall rules.
            <br />
            Click the button below to start managing your firewall.
          </p>

          <Button
            size="lg"
            colorScheme="blue"
            rightIcon={<FaArrowRight />}
            isLoading={starting}
            onClick={handleStart}
            className="px-8"
          >
            Start
          </Button>
        </div>

        <div className="text-gray-500 text-sm mt-4">
          <p>Version 1.0.0 • Created by Joansitoh</p>
        </div>
      </div>
    </div>
  )
}

export default Login
