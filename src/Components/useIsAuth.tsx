import { useState } from "react";

export type userInfo = {
  username: string;
  userId: string;
};
export default function useUserInfo() {
  const getUserInfo = () => {
    const userInfoString = sessionStorage.getItem("userInfo");
    if (!userInfoString) {
      return { username: "", userId: "" };
    } else {
      return JSON.parse(userInfoString) as userInfo;
    }
  };

  const [userInfo, setUserInfo] = useState(getUserInfo());

  const saveUserInfo = (newUserInfo: userInfo) => {
    console.log(`Updating user info to ${newUserInfo}`);
    sessionStorage.setItem("userInfo", JSON.stringify(newUserInfo));
    setUserInfo(newUserInfo);
  };
  return {
    setUserInfo: saveUserInfo,
    userInfo: userInfo,
  };
}
