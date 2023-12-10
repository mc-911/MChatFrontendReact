import React, { useState, useRef, useReducer } from "react";

import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { PrivateOutletContext } from "./protectedRoute";
import useUserInfo from "./useIsAuth";
import { Friend } from "./FriendsPage";
import FriendsPage from "./FriendsPage";
import { Settings } from "./Settings";
import { ChatContent } from "./ChatContent";
import { SideBar } from "./SideBar";
export enum Page {
  friends,
  chat,
}

export type ChatInfo = {
  chatId: string;
  name: string;
  imageUrl: string;
};

function Home() {
  const [friends, setFriends] = useState<Friend[]>([]); // [id, name, profilePic
  const [chat, setChat] = useState<ChatInfo>({
    name: "",
    chatId: "",
    imageUrl: "",
  });
  const [sidebarActive, setSidebarActive] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>(Page.friends);
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
      .catch((error) => {});
  };

  React.useEffect(() => {
    if (jwt !== "") {
      getFriends();
    }
  }, [jwt]); // eslint-disable-line react-hooks/exhaustive-deps

  const getCurrentPage = () => {
    switch (currentPage) {
      case Page.friends:
        return (
          <FriendsPage
            setCurrentPage={setCurrentPage}
            setChat={setChat}
            friends={friends}
            refreshFriendsFunc={getFriends}
            setSidebarActive={setSidebarActive}
          />
        );
      case Page.chat:
        return <ChatContent chat={chat} setSidebarActive={setSidebarActive} />;
    }
  };
  console.log(userInfo);
  return (
    <div
      id="bodyDiv"
      className="flex-row flex h-screen w-screen bg-[#EBF7FF] dark:bg-[#000C14]  dark:text-gray-200"
    >
      <SideBar
        chat={chat}
        setChat={setChat}
        sidebarActive={sidebarActive}
        setSidebarActive={setSidebarActive}
        dialogRef={dialogRef}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        friends={friends}
      />
      <div className="flex flex-col flex-grow w-screen h-screen absolute md:static ">
        {getCurrentPage()}
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
