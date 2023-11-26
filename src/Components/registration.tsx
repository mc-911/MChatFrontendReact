import React, { MutableRefObject, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import MChatLogo from "../assets/MChatLogo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";

interface RegistrationFormProps {
  errorMessage: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
}
function RegistrationForm({
  errorMessage,
  setEmail,
  setPassword,
  setConfirmPassword,
  handleSubmit,
  setUsername,
}: RegistrationFormProps) {
  return (
    <>
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
            icon={icon({ name: "user" })}
            className="text-gray-400 absolute inset-y-5 left-3"
          />
          <input
            type="text"
            className="form-input w-full"
            placeholder="Username"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setUsername(event.target.value)
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
        <div className="relative">
          <FontAwesomeIcon
            size="lg"
            icon={icon({ name: "lock" })}
            className="text-gray-400 absolute inset-y-5 left-3"
          />
          <input
            type="password"
            className="form-input w-full"
            placeholder="Confirm Password"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(event.target.value)
            }
          ></input>
        </div>
        {errorMessage && <div className="error">{errorMessage}</div>}
        <button className="btn">Sign up</button>
        <div>
          Already have an account?{" "}
          <Link className="dark:text-blue-500" to={"/"}>
            Sign in
          </Link>
        </div>
      </form>
      <div className="box"></div>
    </>
  );
}
interface VerificationMessageProps {
  email: string;
}
function VerificationMessage({ email }: VerificationMessageProps) {
  return (
    <>
      <div className="rounded-md bg-gray-800 p-3 flex flex-col max-w-md gap-4">
        <div>
          <div className="text-lg font-semibold">Please verify your Email</div>
          <div className="text-sm text-gray-300 italic ">One last step..</div>
        </div>
        <div className="grow flex flex-col justify-between">
          <div>
            We've sent an email sent to{" "}
            <span className="font-semibold">{email}</span>
          </div>
          <div className="flex flex-col gap-2">
            <div>
              Just click on the link in the email to activate your account, and
              start chatting!
            </div>
            <div className="text-sm text-gray-300 italic ">
              No email found? Check your spam folder
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
function Registration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [registered, setRegistered] = useState(false);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.trim().length == 0) {
      setErrorMessage("Password cannot be empty");
    } else if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
    } else {
      register();
    }
  };
  const register = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/register`, {
        email: email,
        password: password,
        username: username,
      })
      .then((response) => {
        response.status === 201 ? setRegistered(true) : setRegistered(false);
        console.log(response);
      })
      .catch((error) => {
        setErrorMessage("Email already exists");
      });
  };

  return (
    <div
      id="bodyDiv"
      className="flex-col flex bg-primary items-center gap-5 h-screen bg-[#EBF7FF] dark:bg-[#000C14]  dark:text-gray-200"
    >
      <div className="p-4 flex flex-col gap-2">
        <img src={MChatLogo} className="h-24" alt="MChat Logo" />
        <h2 className="font-medium italic">Keep in touch...</h2>
      </div>
      {registered ? (
        <VerificationMessage email={email} />
      ) : (
        <RegistrationForm
          errorMessage={errorMessage}
          setEmail={setEmail}
          setPassword={setPassword}
          setConfirmPassword={setConfirmPassword}
          handleSubmit={handleSubmit}
          setUsername={setUsername}
        />
      )}
    </div>
  );
}

export default Registration;
