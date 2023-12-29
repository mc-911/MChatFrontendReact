import React, { useState, useRef, useReducer, useEffect } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import axios from "axios";
import { PrivateOutletContext } from "./protectedRoute";
import useUserInfo from "./useIsAuth";
import { Friend } from "./FriendsPage";
import { Settings } from "./Settings";
import { SideBar } from "./SideBar";
export interface HomeOutletContext {
  friends: Friend[];
  refreshFriendsFunc: () => Promise<void>;
  setSidebarActive: React.Dispatch<React.SetStateAction<boolean>>;
  jwt: string;
  setChats: React.Dispatch<React.SetStateAction<{
    name: string;
    id: string;
  }[]>>
}
function Home() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [chats, setChats] = useState<{ name: string, id: string }[]>([]);
  const [sidebarActive, setSidebarActive] = useState(true);
  const { jwt } = useOutletContext<PrivateOutletContext>();
  const { userInfo, setUserInfo } = useUserInfo();
  //Forcibly re-renders to show new profile image when it is updated
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const addChatRef = useRef<HTMLDialogElement>(null);

  const getFriends = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_API_URL}/api/user/${userInfo.userId}/friends`
      )
      .then((response) => {
        const friends: Friend[] = response.data.friends;
        setFriends(friends);
        console.log(friends, "hello");
      })
      .catch((error) => { });
  };


  const getGroupChats = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_API_URL}/api/user/${userInfo.userId}/groupChats`
      )
      .then((response) => {
        console.log("chats: ", response.data.chats)
        setChats(response.data.chats);
      })
      .catch((error) => { });
  };

  React.useEffect(() => {
    if (jwt !== "") {
      getFriends();
      getGroupChats();
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
        addChatRef={addChatRef}
        friends={friends}
        chats={chats}
        setChats={setChats}
      />
      <div className="grow w-screen h-screen ">
        <Outlet context={{ friends, refreshFriendsFunc: getFriends, setSidebarActive, jwt, setChats } satisfies HomeOutletContext} />
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