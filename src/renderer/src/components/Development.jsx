import logo from '../assets/development.png'

const Development = () => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <img src={logo} alt="In Development" />
      <div className="flex flex-col -ml-10">
        <h1 className="text-4xl font-bold text-white">In Development</h1>
        <p className="text-lg text-gray-700">This feature is currently in development.</p>
      </div>
    </div>
  )
}

export default Development
