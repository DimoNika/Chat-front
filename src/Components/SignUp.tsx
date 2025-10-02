import { useState } from 'react'

interface SignUpPageProps {
  setPage: (page: "home" | "signup" | "login") => void;
}

function SignUp({ setPage }: SignUpPageProps) {
  

  return (
    <div className='bg-white h-full flex items-center justify-center'>
      {/* form holder */}
<form className="border-1 rounded-xl w-85 mx-auto my-auto px-5">

  {/* Sign Up label */}
  <p className="text-2xl m-3">Sign Up</p>

  {/* Username input */}
  <label className="input input-accent validator w-full">
    <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </g>
    </svg>
    <input
      type="text"
      required
      placeholder="Username"
      pattern="[A-Za-z][A-Za-z0-9\_]*"
      minLength={4}
      maxLength={20}
      title="Only letters, numbers or underscore"
    />
  </label>
  <p className="validator-hint">
    Must be 4 to 20 characters
    <br />containing only letters, numbers or underscore.
  </p>

  {/* Password input */}
  <label className="input input-accent validator my-3">
    <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
        <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
        <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
      </g>
    </svg>
    <input
      type="password"
      required
      placeholder="Password"
      minLength={8}
      maxLength={24}
      pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,24}"
      title="Must be 8-24 characters, including number, lowercase letter, uppercase letter"
    />
  </label>
  <p className="validator-hint hidden">
    Must be 8-24 characters, including
    <br />At least one number <br />At least one lowercase letter <br />At least one uppercase letter
  </p>

  {/* Confirm Password input */}
  <label className="input input-accent validator">
    <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
        <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
        <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
      </g>
    </svg>
    <input
      type="password"
      required
      placeholder="Confirm Password"
      minLength={8}
      maxLength={24}
      title="Repeat the same password"
    />
  </label>
  <p className="validator-hint">Passwords must match</p>

    {/* "dont have accout?" label */}
    <p className='text-sm'>Have an account already? <a onClick={() => setPage("login")} className='text-blue-700 underline hover:cursor-pointer'>Login</a></p>

  {/* Buttons */}
  <div className="mb-5 mt-3">
    <button onClick={() => setPage("home")} type="button" className="btn btn-outline btn-error">Back</button>
    <button type="button" className="btn btn-accent float-end">Sign Up</button>
  </div>

</form>

    </div>

  )
}

export default SignUp
