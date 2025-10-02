import { useState } from 'react'
import HomePage from "./Components/HomePage"
import Login from "./Components/Login"
import SignUp from "./Components/SignUp"


function App() {
  const [page, setPage] = useState<"home" | "signup" | "login">("home");

  return (
    <div className='h-full'>
      {page === "home" && <HomePage setPage={setPage} />}
      {page === "signup" && <SignUp setPage={setPage} />}
      {page === "login" && <Login setPage={setPage} />}
    </div>
  )
}

export default App
