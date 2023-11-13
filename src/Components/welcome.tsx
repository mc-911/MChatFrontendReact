import React, {useState, useEffect} from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import useIsAuth from './useIsAuth';
function Welcome() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [confirmationMessage, setConfirmationMessage] = useState('')
    const {isAuth, setIsAuth} = useIsAuth();
    const emailVerificationToken = searchParams.get("token");
    const navigate = useNavigate();
    


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        login();
    }
    
    useEffect(() => {
      if (emailVerificationToken !== null) {
        verifyToken(emailVerificationToken)
      }
    }, [])

    const verifyToken = (token : string) => {
        axios.post(`${process.env.REACT_APP_API_URL}/api/verify`, {
            token: token,
        }).then((response) => {
            setConfirmationMessage('Email Verified. You can now log in using your credentials')
        }).catch((error) => {
          setErrorMessage("Email verification unsucessful. Your token may be expired!")
        });
    }
    const login = () => {
        axios.post(`${process.env.REACT_APP_API_URL}/api/login`, {
            email: email,
            password: password
        }).then((response) => {
          if (response.status == 200) {
            setIsAuth(true) 
            navigate("/home")
          }
        }).catch((error) => {
          setErrorMessage("Your Email or Password is incorrect")
        });
    }
const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
  setEmail(e.target.value);
}
const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
  setPassword(e.target.value);
}
    return  (
    <div id='bodyDiv'>

    <h1>MChat</h1>
    <h2>Make connections...</h2>
    <form className="box form" onSubmit={handleSubmit}>

        <input type="text" placeholder="Email" onChange={onChangeEmail}></input>
        <input type="password" placeholder="Password" onChange={onChangePassword}></input>
        {errorMessage && <div className="error">{errorMessage}</div>}
        <button>Login</button>
        {confirmationMessage && <div>{confirmationMessage}</div>}
        <a href="register.html">Forgot Password?</a>
    </form>
    <div className="box">
      New to MChat? <Link to={'/registration'}>Create an account</Link>
    </div>
    </div>
    );
}


export default Welcome;