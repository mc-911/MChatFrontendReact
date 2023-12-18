import React, { useState, useRef, useReducer } from "react";

import { Outlet, useOutletContext } from "react-router-dom";
import axios from "axios";
import { PrivateOutletContext } from "./protectedRoute";
import useUserInfo from "./useIsAuth";
import { Friend } from "./FriendsPage";
import { Settings } from "./Settings";
import { SideBar } from "./SideBar";
import DoorOpen from "../assets/door-slighty-open.svg"
import DoorClosed from "../assets/door-closed.svg"
import LightBulbOn from "../assets/light-bulb-on.svg"
import LightBulbOff from "../assets/light-bulb.svg"
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
        addChatRef={addChatRef}
        friends={friends}
      />
      <div className="flex flex-col flex-grow w-screen h-screen absolute md:static ">
        <Outlet context={{ friends, refreshFriendsFunc: getFriends, setSidebarActive, jwt } satisfies HomeOutletContext} />
        <Settings
          dialogRef={dialogRef}
          imgRefreshFunc={forceUpdate}
          setUserInfo={setUserInfo}
        />
        <dialog
          ref={addChatRef}
          className="absolute h-[25rem] p-8 w-5/6 sm:w-[30rem]   rounded-md m-auto top-1/2 bottom-1/2 dark:bg-gray-900 dark:text-gray-200 z-10"
        >
          <div className="gap-2 flex flex-row w-full h-full">
            <div className="border-white bg-gray-800 grow relative group">
              <div className="text-center text-lg my-2 ">Create</div>
              <img src={LightBulbOff} className="" />
              <img src={LightBulbOn} />
            </div>
            <div className="border-white group bg-gray-800 grow relative hover:visible">
              <div className="text-center text-lg my-2">Join</div>
              <img src={DoorClosed} className="absolute h-36 left-0 right-0 top-0 bottom-0 m-auto group-hover:invisible" />
              <img src={DoorOpen} className="absolute h-[11.8rem] left-0 right-0 top-24 mx-auto invisible group-hover:visible" />
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
}

export default Home;
