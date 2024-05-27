import { Button } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { BiChart, BiSupport, BiTable } from 'react-icons/bi'
import { BsGithub } from 'react-icons/bs'
import { useStorage } from '../handlers/StorageHandler'

import logo from '../assets/logo.png'

const Link = ({ title, icon, path }) => {
  const currentPage = useStorage((state) => state.page)

  return (
    <motion.div
      onClick={() => useStorage.getState().setPage(path)}
      className={
        'flex gap-2 items-center rounded-lg px-3 py-2 cursor-pointer transition-all hover:bg-zinc-700 ' +
        (currentPage == path ? 'bg-zinc-700 pl-4' : 'bg-zinc-900')
      }
    >
      {icon}
      <h2 className="text-white text-md">{title}</h2>
    </motion.div>
  )
}

const Sidebar = () => {
  return (
    <div className="h-full w-[250px] border-r bg-zinc-800 flex flex-col">
      {/* HEADER */}
      <div className="h-24 px-4 py-5 gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2">
          <img src={logo} alt="Logo" className="w-10 h-10" />
          <div className="flex flex-col">
            <h1 className="text-white text-md font-bold">UFW Manager</h1>
            <p className="text-gray-300 text-xs">GUI</p>
          </div>
        </div>
      </div>
      <div className="p-4 text-md flex flex-col h-full justify-between gap-2">
        <div className="flex flex-col gap-2">
          <Link title="Firewall Rules" icon={<BiTable />} path="rules" />
          <Link title="Firewall Logs" icon={<BiChart />} path="logs" />
          <Link title="Support" icon={<BiSupport />} path="status" />
        </div>
        <div className="p-5 flex flex-col border border-zinc-600 rounded-lg">
          <div className="flex flex-col mb-14">
            <h1 className="font-bold text-xl">Support us</h1>
            <p className="text-sm text-gray-400">
              If you found bugs or want to request features, please let us know on our GitHub page.
            </p>
          </div>
          <Button
            colorScheme="green"
            size="sm"
            leftIcon={<BsGithub />}
            onClick={() =>
              window.electron.ipcRenderer.send('open-url', 'https://github.com/Joansitoh/')
            }
          >
            GitHub
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
