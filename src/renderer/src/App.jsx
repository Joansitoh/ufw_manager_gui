import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStorage } from './handlers/StorageHandler'
import Login from './pages/Login'
import Home from './pages/Home'

function App() {
  const storageLogged = useStorage((state) => state.logged)
  const [logged, setLogged] = useState(false)

  useEffect(() => {
    if (storageLogged !== null) {
      setLogged(storageLogged)
    } else {
      setLogged(false)
    }
  }, [storageLogged])

  return logged ? (
    <motion.div
      key="app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Home />
    </motion.div>
  ) : (
    <motion.div
      key="login"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Login />
    </motion.div>
  )
}

export default App
