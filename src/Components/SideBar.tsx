import React, { useState } from "react";
import defaultProfilePic from "../assets/default_image.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
import useUserInfo from "./useIsAuth";
import { Friend } from "./FriendsPage";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PlusButton from "../assets/PlusButtonDark.svg"
import SearchIcon from "../assets/bx-search-alt-2.svg"

interface SidebarChatItemProps {
  name: string;
  imageUrl: string;
  chatId: string;
  active: boolean;
  setSidebarActive: React.Dispatch<React.SetStateAction<boolean>>;
}

function SidebarChatItem({
  name,
  imageUrl,
  chatId,
  active,
  setSidebarActive,
}: SidebarChatItemProps) {
  return (
    <Link
      to={`/home/chat/${chatId}`}

      state={{ chat: { name, chatId, imageUrl } }}
      onClick={() => {
        setSidebarActive(false);
      }}
      className={`flex flex-row  gap-4 items-center h-12 p-1 pl-3 m-1 rounded-md select-none hover:bg-slate-50/50 active:text-gray-50 ${active
        ? "md:dark:bg-slate-50/50 md:dark:text-gray-50"
        : "md:dark:bg-background"
        } `}
    >
      <img
        src={imageUrl}
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
  addChatRef: React.RefObject<HTMLDialogElement>;
  chats: { name: string, id: string }[]
}
export function SideBar(props: SideBarProps) {
  const { userInfo } = useUserInfo();
  const [convoSearchQuery, setConvoSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const getFriendsList = () => {
    return props.friends.filter((friend) => friend.username.toLowerCase().includes(convoSearchQuery.toLowerCase())).map((friend) => {
      return (
        <SidebarChatItem
          key={friend.user_id}
          active={
            location.pathname === `/home/chat/${friend.chat_id}`
          }
          name={friend.username}
          imageUrl={`${process.env.REACT_APP_API_URL}/api/user/${friend.user_id}/profilePicture`}
          chatId={friend.chat_id}
          setSidebarActive={props.setSidebarActive}
        />
      );
    });
  };
  const getChatsList = () => {
    return props.chats.filter((chat) => chat.name.toLowerCase().includes(convoSearchQuery.toLowerCase())).map((chat) => {
      return (
        <SidebarChatItem
          key={chat.id}
          active={
            location.pathname === `/home/chat/${chat.id}`
          }
          name={chat.name}
          imageUrl={`${process.env.REACT_APP_API_URL}/api/chat/${chat.id}/profilePicture`}
          chatId={chat.id}
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
      <div className="flex flex-row justify-between items-center p-3">
        <div className="text-4xl md:text-2xl font-semibold">Chats</div>
        <img src={PlusButton} className="h-12 md:h-8 cursor-pointer" onClick={() =>
          props.addChatRef.current?.open
            ? props.addChatRef.current?.close()
            : props.addChatRef.current?.show()}></img>
      </div>
      <div className="m-2 mb-4 h-12 md:h-8 relative ">
        <img src={SearchIcon} className="absolute h-5 md:h-5 left-2 inset-y-3 md:inset-y-2"></img>
        <input
          className="rounded-md dark:bg-gray-800 w-full h-11 md:h-8 pl-8 text-"
          type="text"
          placeholder="Search for a conversation"
          value={convoSearchQuery}
          onChange={(e) => setConvoSearchQuery(e.target.value)}
        />
        <FontAwesomeIcon
          size="xl"
          icon={icon({ name: "circle-xmark" })}
          className={`absolute md:inset-y-1 right-3 md:right-2 inset-y-2 text-gray-50 cursor-pointer  h-7 md:h-6 ${convoSearchQuery.length ? "" : "hidden"}`}
          onClick={() => setConvoSearchQuery("")}
        />
      </div>
      <div className="grow overflow-auto">
        <Link to={"/home/friends/all"}
          onClick={() => {
            props.setSidebarActive(false);
            navigate("/home/friends", {})
          }}
          className={`flex flex-row select-none gap-4 items-center p-1 pl-3 mb-4 m-1 h-12 rounded-md hover:bg-slate-50/50 active:text-gray-50 ${new RegExp("(/home/friends/)+").test(location.pathname)
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
        <>{getFriendsList()}</>
        <>{getChatsList()}</>
      </div>
      <div className="flex flew-row gap-3 p-3 bg-slate-900 ">
        <div className="flex flex-row gap-3">
          <img
            key={Date.now()}
            className="h-10 w-10 rounded-full object-cover "
            alt="Profile"
            src={`${process.env.REACT_APP_API_URL}/api/user/${userInfo ? userInfo.userId : ""
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
            className="text-gray-400 pr-3 self-center hover:text-gray-200 active:text-gray-50 cursor-pointer"
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
