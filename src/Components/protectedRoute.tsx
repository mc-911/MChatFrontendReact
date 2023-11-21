import { Outlet, Navigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import useIsAuth from "./useIsAuth";
import { useEffect, useState } from "react";
export interface PrivateOutletContext {
  jwt: string,
  setJwt: (value: React.SetStateAction<string>) => void
}
const PrivateRoutes = () => {
  const { isAuth, setIsAuth } = useIsAuth();
  const [jwt, setJwt] = useState("");
  useEffect(() => {
    const checkAuthState = async () => {
      return await axios
        .post(`${process.env.REACT_APP_API_URL}/api/authCheck`)
        .then((response) => {
          setIsAuth(response.status === 200);
          setJwt(response.data.jwt as string);
          console.log("Authenticated");
        })
        .catch((error) => {
          console.log("Not Authenticated");
          setIsAuth(false);
        });
    }
    const fetchData = async () => {
      await checkAuthState()
    }
    fetchData()
  }, []);
  return isAuth ? <Outlet context={{ jwt, setJwt } satisfies PrivateOutletContext} /> : <Navigate to="/" />;
};

export default PrivateRoutes;
