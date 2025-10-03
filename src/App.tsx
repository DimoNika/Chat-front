import { useState } from 'react'
import HomePage from "./Components/HomePage"
import Login from "./Components/Login"
import SignUp from "./Components/SignUp"
import Chat from "./Components/Chat"
import ChatInterface from "./Components/ChatСopy"
import { apiFetch } from "./api"


function App() {
  const [page, setPage] = useState<"home" | "signup" | "login" | "chat">("home");

  async function auth() {
    // If user authenticated move him to the chats
    
    console.log("AUTH func executed")

    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await apiFetch("/api/auth", requestOptions);
      const data = await response.json();
      console.log(data)

      if (!response.ok) {

      } else {
        setPage("chat")
      }

    } catch (err: any) {
      console.error(err);
    };
  }

  auth()

  return (
    <div className='h-full'>
      {/* <button onClick={() => apiFetch("/api/auth")} className='btn'>auth</button> */}
      {page === "home" && <HomePage setPage={setPage} />}
      {page === "signup" && <SignUp setPage={setPage} auth={auth}/>}
      {page === "login" && <Login setPage={setPage} auth={auth}/>}
      {page === "chat" && <ChatInterface/>}
    </div>
  )
}

export default App
