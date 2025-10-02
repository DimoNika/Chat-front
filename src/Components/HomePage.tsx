import { useState } from 'react'


interface HomePageProps {
  setPage: (page: "home" | "signup" | "login") => void;
}

function HomePage({ setPage }: HomePageProps) {
  return (
    
    <div className=' h-full flex items-center justify-center'>
      
        
        <div>

          <p className='text-4xl mb-1'>This is very cool chat</p>
          <p className='text-xl w-fit mx-auto mb-2'>You should:</p>
          
          <button onClick={() => setPage("signup")} className="btn btn-info  btn-outline">Sign Up</button>
          <button onClick={() => setPage("login")} className="btn btn-primary btn-outline float-end">Login</button>
          
          
        </div>

    </div>
  )
}

export default HomePage
