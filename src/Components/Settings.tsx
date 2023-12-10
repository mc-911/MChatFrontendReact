import React, { useState, useRef, MutableRefObject } from "react";
import axios from "axios";
import defaultProfilePic from "../assets/default_image.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
import useUserInfo from "./useIsAuth";

export function Settings({
  dialogRef,
  imgRefreshFunc,
  setUserInfo,
}: {
  dialogRef: React.RefObject<HTMLDialogElement>;
  imgRefreshFunc: React.DispatchWithoutAction;
  setUserInfo: (newUserInfo: typeof userInfo) => void;
}) {
  const [profilePic, setProfilePic] = useState<File>();
  const { userInfo } = useUserInfo();
  const [username, setUsername] = useState(userInfo.username);
  const [errorMessage] = useState("");
  const fileInputRef = useRef() as MutableRefObject<HTMLInputElement>;
  const updateDetails = async () => {
    if (profilePic) {
      const formData = new FormData();
      formData.append("profilePicture", profilePic);
      axios
        .put(
          `${process.env.REACT_APP_API_URL}/api/users/${userInfo.userId}/profilePicture`,
          formData
        )
        .catch((error) => {
          console.log(error);
        })
        .then((response) => {
          console.log("Refreshing image");
          imgRefreshFunc();
        });
    }
    if (username !== userInfo.username) {
      axios
        .put(
          `${process.env.REACT_APP_API_URL}/api/users/${userInfo.userId}/username`,
          { new_username: username }
        )
        .then((response) => {
          setUserInfo({
            userId: userInfo.userId,
            username: response.data.new_username,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  return (
    <dialog
      ref={dialogRef}
      className="absolute h-[25rem] w-5/6 sm:w-[30rem]   rounded-md m-auto top-1/2 bottom-1/2 dark:bg-gray-800 dark:text-gray-200 z-10"
    >
      <div className=" p-5 flex flex-col gap-3">
        <div className="flex-row flex justify-between ">
          <div className="">Settings</div>
          <FontAwesomeIcon
            size="xl"
            icon={icon({ name: "xmark" })}
            className="  self-center"
            onClick={() => dialogRef.current?.close()}
          />
        </div>
        <div className="w-full  flex-row flex justify-center">
          <img
            onClick={() => fileInputRef.current.click()}
            alt="Profile Selector"
            src={
              profilePic
                ? URL.createObjectURL(profilePic)
                : `${process.env.REACT_APP_API_URL}/api/users/${
                    userInfo ? userInfo.userId : ""
                  }/profilePicture`
            }
            onError={(event) => {
              // @ts-ignore
              event.target.src = defaultProfilePic;
            }}
            className="h-44 w-44 rounded-full object-cover"
          />
          <input
            className="hidden"
            type="file"
            ref={fileInputRef}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setProfilePic(event.target.files![0])
            }
          ></input>
        </div>
        <div className="flex flex-col justify-end grow gap-3 pb-4">
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
              value={username}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setUsername(event.target.value)
              }
            ></input>
          </div>
          {errorMessage && <div className="error">{errorMessage}</div>}
          <button className="btn" onClick={updateDetails}>
            Update
          </button>
        </div>
      </div>
    </dialog>
  );
}
