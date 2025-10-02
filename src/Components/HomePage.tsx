import { useState } from 'react'


interface HomePageProps {
  setPage: (page: "home" | "signup" | "login") => void;
}

function HomePage({ setPage }: HomePageProps) {

  const handleTestAuth = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
      },
    };

    try {
      const response = await fetch("/api/auth", requestOptions);

      if (!response.ok) {
        console.log(await response.json())
        throw new Error(`Ошибка: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      // localStorage.setItem("access_token", data.access_token);
      // setUsers(data);
    } catch (err: any) {
      // setError(err.message);
      console.error(err);
    } finally {
      // setLoading(false);
    }
  };
  return (
    
    <div className=' h-full flex items-center justify-center'>
      
        
        <div>

          <p className='text-4xl mb-1'>This is very cool chat</p>
          <p className='text-xl w-fit mx-auto mb-2'>You should:</p>
          <button onClick={handleTestAuth}> auth</button>
          
          <button onClick={() => setPage("signup")} className="btn btn-info  btn-outline">Sign Up</button>
          <button onClick={() => setPage("login")} className="btn btn-primary btn-outline float-end">Login</button>
          
          
        </div>

    </div>
  )
}

export default HomePage
