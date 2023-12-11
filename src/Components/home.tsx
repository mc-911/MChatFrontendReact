import React, { useState, useRef, useReducer } from "react";

import { Outlet, useOutletContext } from "react-router-dom";
import axios from "axios";
import { PrivateOutletContext } from "./protectedRoute";
import useUserInfo from "./useIsAuth";
import { Friend } from "./FriendsPage";
import { Settings } from "./Settings";
import { SideBar } from "./SideBar";

export type ChatInfo = {
  chatId: string;
  name: string;
  imageUrl: string;
};
export interface HomeOutletContext {
  friends: Friend[];
  refreshFriendsFunc: () => Promise<void>;
  setSidebarActive: React.Dispatch<React.SetStateAction<boolean>>;
  jwt: string;
}
function Home() {
  const [friends, setFriends] = useState<Friend[]>([]); // [id, name, profilePic
  const [sidebarActive, setSidebarActive] = useState(true);
  const { jwt } = useOutletContext<PrivateOutletContext>();
  const { userInfo, setUserInfo } = useUserInfo();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const getFriends = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_API_URL}/api/users/${userInfo.userId}/friends`
      )
      .then((response) => {
        const friends: Friend[] = response.data.friends;
        setFriends(friends);
        console.log(friends, "hello");
      })
      .catch((error) => { });
  };

  React.useEffect(() => {
    if (jwt !== "") {
      getFriends();
    }
  }, [jwt]); // eslint-disable-line react-hooks/exhaustive-deps

  console.log(userInfo);
  return (
    <div
      id="bodyDiv"
      className="flex-row flex h-screen w-screen bg-[#EBF7FF] dark:bg-[#000C14]  dark:text-gray-200"
    >
      <SideBar
        sidebarActive={sidebarActive}
        setSidebarActive={setSidebarActive}
        dialogRef={dialogRef}
        friends={friends}
      />
      <div className="flex flex-col flex-grow w-screen h-screen absolute md:static ">
        <Outlet context={{ friends, refreshFriendsFunc: getFriends, setSidebarActive, jwt } satisfies HomeOutletContext} />
        <Settings
          dialogRef={dialogRef}
          imgRefreshFunc={forceUpdate}
          setUserInfo={setUserInfo}
        />
      </div>
    </div>
  );
}

export default Home;
