import React, {useState, useEffect} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function useIsAuth() {
  const getIsAuth = () => {
  const isAuthString = sessionStorage.getItem('isAuth');
  return isAuthString === 'true';
  }

  const [isAuth, setIsAuth] = useState(getIsAuth())

  const saveIsAuth = (newIsAuth : boolean) => {
    console.log(`Setting isAuth to: ${newIsAuth}`)
    sessionStorage.setItem('isAuth', JSON.stringify(newIsAuth));
    setIsAuth(newIsAuth);
  }
  return {
    setIsAuth : saveIsAuth, isAuth: isAuth
  }
  } 