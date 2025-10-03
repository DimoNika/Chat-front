import { useState } from 'react'

interface LoginPageProps {
  setPage: (page: "home" | "signup" | "login" | "chat") => void;

}

function Login({setPage}: LoginPageProps) {
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    };

    try {
      const response = await fetch("/api/login", requestOptions);

      const data = await response.json();
      console.log(data)

      if (!response.ok) {
        
        setErrorMsg(data.detail)
        throw new Error(`Ошибка: ${response.status}`);
      } else {
        setErrorMsg("")
        
      }

      localStorage.setItem("access_token", data.access_token);

    } catch (err: any) {
      // setError(err.message);
      console.error(err);
    } finally {
      // setLoading(false);
    }
  };

  return (
    <div className='bg-white h-full flex items-center justify-center'>
      {/* form holder */}
      <form className='border-1 rounded-xl w-85 mx-auto my-auto px-5'>

        {/* Login label */}
        <p className='text-2xl m-3'>Login</p>
        <p className='text-red-600 text-xs my-1'>{errorMsg}</p>

        {/* Start of Username input */}
        <label className="input input-accent w-full my-3">
          <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </g>
          </svg>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
            required
            placeholder="Username"
            minLength={4}
            maxLength={20}
            className=''
          />
        </label>

        {/* End of Username input*/}

        {/* Start of Password input */}
        <label className="input input-accent my-3">
          <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5"fill="none" stroke="currentColor"
            >
              <path
                d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
              ></path>
              <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
            </g>
          </svg>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            
          />
        </label>
        {/* End of Password input */}

        {/* "dont have accout?" label */}
        <p className='text-sm'>Don't have an account? <a onClick={() => setPage("signup")} className='text-blue-700 underline hover:cursor-pointer'>Sign up</a></p>

        <div className='mb-5 mt-3'>
          <button onClick={() => setPage("home")} type="button" className="btn btn-outline btn-error">Back</button>
          <button onClick={handleLogin} type="button" className="btn btn-accent float-end">Login</button>
        </div>
      </form>
    </div>
  )
}

export default Login
