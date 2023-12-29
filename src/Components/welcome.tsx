import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import useUserInfo, { userInfo } from "./useIsAuth";

import MChatLogo from "../assets/MChatLogo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
function Welcome() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchParams] = useSearchParams();
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const { setUserInfo } = useUserInfo();
  const navigate = useNavigate();


  console.log(process.env.REACT_APP_API_URL)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login();
  };

  const verifyToken = (token: string) => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/user/verify`, {
        token: token,
      })
      .then(() => {
        setConfirmationMessage(
          "Email Verified. You can now log in using your credentials"
        );
      })
      .catch(() => {
        setErrorMessage(
          "Email verification unsucessful. Your token may be expired!"
        );
      });
  };

  useEffect(() => {
    if (searchParams.get("token") !== null) {
      verifyToken(searchParams.get("token")!);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/user/login`, {
        email: email.trimEnd(),
        password: password.trimEnd(),
      })
      .then((response) => {
        if (response.status === 200) {
          setUserInfo(response.data as userInfo);
          navigate("/home");
        }
      })
      .catch((error) => {
        switch (error.response.status) {
          case 401:
            setErrorMessage("Please verify your account");
            break;
          case 400:
            setErrorMessage("Your Email or Password is incorrect");
            break;
          case 404:
            setErrorMessage("Your Email or Password is incorrect");
            break;
          default:
            setErrorMessage("Something went wrong");
        }
      });
  };
  return (
    <div
      id="bodyDiv"
      className="flex-col flex  items-center gap-5 h-screen bg-[#EBF7FF] dark:bg-[#000C14]  dark:text-gray-200"
    >
      <div className="p-4 flex flex-col gap-2">
        <img src={MChatLogo} className="h-24" alt="MChat Logo" />
        <h2 className="font-medium italic">Keep in touch...</h2>
      </div>
      <form
        className="w-full max-w-md flex-col flex gap-3 rounded p-3  dark:bg-gray-800"
        onSubmit={handleSubmit}
      >
        <div className="relative">
          <FontAwesomeIcon
            size="lg"
            icon={icon({ name: "envelope" })}
            className="text-gray-400 absolute inset-y-5 left-3"
          />
          <input
            type="text"
            className="form-input w-full"
            placeholder="Email"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(event.target.value)
            }
          ></input>
        </div>
        <div className="relative">
          <FontAwesomeIcon
            size="lg"
            icon={icon({ name: "lock" })}
            className="text-gray-400 absolute inset-y-5 left-3"
          />
          <input
            type="password"
            className="form-input w-full"
            placeholder="Password"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(event.target.value)
            }
          ></input>
        </div>
        {errorMessage && <div className="error">{errorMessage}</div>}
        <a href="register.html" className="text-[#1a91e0] invisible ">
          Forgot your password?
        </a>
        <button className="btn">Login</button>
        {confirmationMessage && <div>{confirmationMessage}</div>}
        <div>
          New to MChat?{" "}
          <Link className="dark:text-blue-500" to={"/registration"}>
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Welcome;
