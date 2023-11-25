import { Outlet, Navigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import useUserInfo from "./useIsAuth";
import { useEffect, useState } from "react";
export interface PrivateOutletContext {
  jwt: string,
  setJwt: (value: React.SetStateAction<string>) => void
}
const PrivateRoutes = () => {
  const { userInfo, setUserInfo } = useUserInfo();
  const [jwt, setJwt] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add this line

  useEffect(() => {
    const checkAuthState = async () => {
      setIsLoading(true); // Add this line
      return await axios
        .post(`${process.env.REACT_APP_API_URL}/api/authCheck`)
        .then((response) => {
          setIsAuth(response.status === 200);
          console.log(response.status)
          setJwt(response.data.jwt as string);
          console.log("Authenticated");
        })
        .catch((error) => {
          console.log("Not Authenticated");
          setIsAuth(false);
        })
        .finally(() => {
          setIsLoading(false); // Add this line
        });
    }
    const fetchData = async () => {
      await checkAuthState()
    }
    fetchData()
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  } else {
    return isAuth ? <Outlet context={{ jwt, setJwt } satisfies PrivateOutletContext} /> : <Navigate to="/" />;
  }
};

export default PrivateRoutes;
