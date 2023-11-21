import React, { MutableRefObject, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

interface RegistrationFormProps {
  errorMessage: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setProfilePic: React.Dispatch<React.SetStateAction<File | undefined>>;
  profilePic: File | undefined
}
function RegistrationForm({ errorMessage, setEmail, setPassword, setConfirmPassword, handleSubmit, profilePic, setProfilePic }: RegistrationFormProps) {
  const fileInputRef = useRef() as MutableRefObject<HTMLInputElement>;
  return (
    <>
      <form className="box form" onSubmit={handleSubmit}>
        <div className='imgUploadSection'>
          <img onClick={() => fileInputRef.current.click()} src={profilePic ? URL.createObjectURL(profilePic) : require("../assets/default_image.jpg")} className="profileImgMed"></img>
          <input type="file" ref={fileInputRef} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setProfilePic(event.target.files![0])}></input>
        </div>
        <input type="text" placeholder="Email" onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}></input>
        <input type="password" placeholder="Password" onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}></input>
        <input type="password" placeholder="Confirm Password" onChange={(event: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(event.target.value)}></input>
        {errorMessage && <div className="error">{errorMessage}</div>}
        <button>Sign up</button>
      </form>
      <div className="box">
        Already have an account? <Link to={'/'} >Sign in</Link>
      </div>
    </>
  )
}
interface VerificationMessageProps {
  email: string;
}
function VerificationMessage({ email }: VerificationMessageProps) {
  return (
    <>
      <div className="box" style={{ flexDirection: 'column' }}>
        <h3>Email Verification Required</h3>
        <p>Verification email has been sent to: <br /><b>{email}</b></p>
        <p>Please verify your email address to complete registration.</p>
      </div>
    </>
  )

}
function Registration() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [registered, setRegistered] = useState(false);
  const [profilePic, setProfilePic] = useState<File>();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.trim().length == 0) {
      setErrorMessage("Password cannot be empty")
    } else if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match")
    } else {
      register();
    }
  }
  const register = () => {
    axios.post(`${process.env.REACT_APP_API_URL}/api/register`, {
      email: email,
      password: password
    }).then((response) => {
      response.status === 201 ? setRegistered(true) : setRegistered(false);
      console.log(response);
    }).catch((error) => {
      setErrorMessage("Email already exists")
    });
  }

  return (
    <div id='bodyDiv'>
      <h1>MChat</h1>
      <h2>Make connections...</h2>
      {registered ? <VerificationMessage email={email} /> : <RegistrationForm errorMessage={errorMessage} setEmail={setEmail} setPassword={setPassword} setConfirmPassword={setConfirmPassword} handleSubmit={handleSubmit} setProfilePic={setProfilePic} profilePic={profilePic} />}
    </div>
  );
}


export default Registration;