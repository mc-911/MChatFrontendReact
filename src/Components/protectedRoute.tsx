import { Outlet, Navigate } from 'react-router-dom'
import axios from 'axios'
import useIsAuth from './useIsAuth';
import {useEffect} from 'react'
const PrivateRoutes = () => {
  const { isAuth, setIsAuth}  = useIsAuth();
  useEffect(() => {
        axios.post(`${process.env.REACT_APP_API_URL}/api/authCheck`).then((response) => {
          setIsAuth(response.status === 200)
          console.log("Authenticated")
        }).catch((error) => {
            console.log("Not Authenticated")
          setIsAuth(false)
        });
  },[isAuth]);
    return(
        isAuth ? <Outlet/> : <Navigate to="/"/>
    )
}

export default PrivateRoutes