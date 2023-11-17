import { Outlet, Navigate } from "react-router-dom";
import axios from "axios";
import useIsAuth from "./useIsAuth";
import { useEffect, useState } from "react";
const PrivateRoutes = () => {
  const { isAuth, setIsAuth } = useIsAuth();
  const [jwt, setJwt] = useState("");
  useEffect(() => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/authCheck`)
      .then((response) => {
        setIsAuth(response.status === 200);
        setJwt(response.data.jwt);
        console.log("Authenticated");
      })
      .catch((error) => {
        console.log("Not Authenticated");
        setIsAuth(false);
      });
  }, [isAuth]);
  return isAuth ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoutes;
