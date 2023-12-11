import React, { useState } from "react";
import defaultProfilePic from "../assets/default_image.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
import useUserInfo from "./useIsAuth";
import { Friend } from "./FriendsPage";
import { ChatInfo } from "./home";
import { Link, useNavigate } from "react-router-dom";

interface FriendsSectionItemProps {
  name: string;
  profilePic: string;
  chatId: string;
  active: boolean;
  setChat: React.Dispatch<React.SetStateAction<ChatInfo>>;
  setSidebarActive: React.Dispatch<React.SetStateAction<boolean>>;
}

function FriendsSectionItem({
  name,
  profilePic,
  chatId,
  active,
  setChat,
  setSidebarActive,
}: FriendsSectionItemProps) {
  return (
    <Link
      to={`/home/chat/${chatId}`}

      state={{ chat: { name, chatId, imageUrl: profilePic } }}
      onClick={() => {
        setSidebarActive(false);
      }}
      className={`flex flex-row  gap-4 items-center h-12 p-1 pl-3 m-1 rounded-md select-none hover:bg-slate-50/50 active:text-gray-50 ${active
        ? "md:dark:bg-slate-50/50 md:dark:text-gray-50"
        : "md:dark:bg-background"
        } `}
    >
      <img
        src={profilePic}
        alt="Uh Oh"
        className="w-8 h-8 object-cover rounded-full"
        onError={(event) => {
          // @ts-ignore
          event.target.src = defaultProfilePic;
        }}
      />
      <div className="friendsSectionItemName">{name}</div>
    </Link>
  );
}

interface SideBarProps {
  sidebarActive: boolean;
  setSidebarActive: React.Dispatch<React.SetStateAction<boolean>>;
  friends: Friend[];
  dialogRef: React.RefObject<HTMLDialogElement>;
  setChat: React.Dispatch<React.SetStateAction<ChatInfo>>;
  chat: ChatInfo;
}
export function SideBar(props: SideBarProps) {
  const { userInfo } = useUserInfo();
  const [, setConvoSearchQuery] = useState("");
  const navigate = useNavigate();
  const getFriendsList = () => {
    return props.friends.map((friend) => {
      return (
        <FriendsSectionItem
          key={friend.user_id}
          setChat={props.setChat}
          active={
            false
          }
          name={friend.username}
          profilePic={`${process.env.REACT_APP_API_URL}/api/users/${friend.user_id}/profilePicture`}
          chatId={friend.chat_id}
          setSidebarActive={props.setSidebarActive}
        />
      );
    });
  };
  return (
    <div
      className={`bg-background w-screen h-screen md:w-72 flex  ${props.sidebarActive ? "absolute" : "max-sm:hidden"
        } md:static flex-col min-w-[18rem] z-10`}
    >
      <input
        className="rounded-md dark:bg-gray-800 m-2 mb-4 h-12 md:h-8 pl-3"
        type="text"
        placeholder="Search for a conversation"
        onChange={(e) => setConvoSearchQuery(e.target.value)}
      />
      <div className="grow overflow-auto">
        <Link to={"/home/friends"}
          onClick={() => {
            props.setSidebarActive(false);
            navigate("/home/friends", {})
          }}
          className={`flex flex-row select-none gap-4 items-center p-1 pl-3 mb-4 m-1 h-12 rounded-md hover:bg-slate-50/50 active:text-gray-50 ${false
            ? "md:dark:bg-slate-50/50 md:dark:text-gray-50"
            : "md:dark:bg-background"
            }`}
        >
          <FontAwesomeIcon
            size="xl"
            icon={icon({ name: "user-group" })}
            className="  self-center"
          />
          <div>Friends</div>
        </Link>
        <div style={{ textAlign: "center" }}>Direct Messages</div>
        <>{getFriendsList()}</>
      </div>
      <div className="flex flew-row gap-3 p-3 bg-slate-900 ">
        <div className="flex flex-row gap-3">
          <img
            key={Date.now()}
            className="h-10 w-10 rounded-full object-cover"
            alt="Profile"
            src={`${process.env.REACT_APP_API_URL}/api/users/${userInfo ? userInfo.userId : ""
              }/profilePicture`}
            onError={(event) => {
              // @ts-ignore
              event.target.src = defaultProfilePic;
            }}
          ></img>
          <div>{userInfo ? userInfo.username : "You"}</div>
        </div>
        <div className="grow flex justify-end">
          <FontAwesomeIcon
            size="xl"
            icon={icon({ name: "cog" })}
            className="text-gray-400 pr-3 self-center hover:text-gray-200 active:text-gray-50"
            onClick={() =>
              props.dialogRef.current?.open
                ? props.dialogRef.current?.close()
                : props.dialogRef.current?.show()
            }
          />
        </div>
      </div>
    </div>
  );
}
