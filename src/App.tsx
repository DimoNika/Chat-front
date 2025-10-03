import { useState } from 'react'
import HomePage from "./Components/HomePage"
import Login from "./Components/Login"
import SignUp from "./Components/SignUp"
import Chat from "./Components/Chat"


function App() {
  const [page, setPage] = useState<"home" | "signup" | "login" | "chat">("home");

  function auth() {
    
  }

  return (
    <div className='h-full'>
      {page === "home" && <HomePage setPage={setPage} />}
      {page === "signup" && <SignUp setPage={setPage} />}
      {page === "login" && <Login setPage={setPage} />}
      {page === "chat" && <Chat/>}
    </div>
  )
}

export default App
