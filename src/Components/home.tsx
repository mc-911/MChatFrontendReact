import React, { useState, useRef, useReducer, useEffect } from "react";

import defaultProfilePic from "../assets/default_image.jpg";
import { Outlet, useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { PrivateOutletContext } from "./protectedRoute";
import useUserInfo from "./useIsAuth";
import { Friend } from "./FriendsPage";
import { Settings } from "./Settings";
import { SideBar } from "./SideBar";
import DoorOpen from "../assets/door-slighty-open.svg"
import DoorClosed from "../assets/door-closed.svg"
import OutlineHammer from "../assets/hammer solid dark.svg"
import OutlineWrench from "../assets/wrench solid dark.svg"
import SolidHammer from "../assets/hammer white.svg"
import SolidWrench from "../assets/wrench white.svg"
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";
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
enum AddChatSection {
  OptionSelect,
  CreateChat,
  JoinChat
}
function MemberDropdownItem(props: { userId: string, username: string, addMemberFunc: (userId: string, username: string) => void, removeMemberFunc: (userId: string) => void, selectedMembers: { userId: string, username: string }[] }) {
  const [added, setAdded] = useState(false);
  useEffect(() => {
    setAdded(props.selectedMembers.find((member) => member.userId === props.userId) !== undefined)
  }, [props.selectedMembers])
  return <div className="justify-between flex flex-row h-8 items-center rounded-md pr-1" key={props.userId}>
    <div className="flex flex-row gap-2 pl-1 items-center h-full">
      <img
        src={`${process.env.REACT_APP_API_URL}/api/user/${props.userId}/profilePicture`}
        alt="Uh Oh"
        className="w-8 h-8 object-cover rounded-full"
        onError={(event) => {
          // @ts-ignore
          event.target.src = defaultProfilePic;
        }} />
      <div className="friendsSectionItemName">{props.username}</div>
    </div>
    <div className="flex flex-col justify-center items-center cursor-pointer" onClick={() => {
      setAdded(!added)
      added ? props.removeMemberFunc(props.userId) : props.addMemberFunc(props.userId, props.username)
    }}>
      {(() => {
        if (added) {
          return <FontAwesomeIcon
            size="xl"
            icon={icon({ name: "check" })}
            className="text-green-900" />;
        }
        else {
          return <FontAwesomeIcon
            size="xl"
            icon={icon({ name: "plus" })}
            className="text-gray-500" />;
        }
      })()}
    </div>
  </div>;
}

function SelectedMember(props: { userId: string; username: string; removeMemberFunc: (userId: string) => void }) {
  return <div className="justify-between flex flex-row h-8 items-center rounded-md pl-1 pr-2 min-w-0" key={props.userId}>
    <div className="flex flex-row gap-2 pl-1 items-center h-full">
      <img
        src={`${process.env.REACT_APP_API_URL}/api/user/${props.userId}/profilePicture`}
        alt="Uh Oh"
        className="w-8 h-8 object-cover rounded-full"
        onError={(event) => {
          // @ts-ignore
          event.target.src = defaultProfilePic;
        }} />
      <div className="friendsSectionItemName">{props.username}</div>
    </div>
    <div className="flex flex-col justify-center items-center cursor-pointer" onClick={() => {
      props.removeMemberFunc(props.userId);
    }}>
      <FontAwesomeIcon
        size="xl"
        icon={icon({ name: "xmark" })}
        className="text-red-700" />
    </div>
  </div>;

}
function CreateChat(props: {
  setAddChatSection: React.Dispatch<React.SetStateAction<AddChatSection>>, dialogRef: React.RefObject<HTMLDialogElement>, setChats: React.Dispatch<React.SetStateAction<{
    name: string;
    id: string;
  }[]>>
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatName, setChatName] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { userInfo } = useUserInfo()
  const [selectedChatMembers, setSelectedChatMembers] = useState<{ userId: string, username: string }[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const resultsRef = useRef<HTMLDivElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate();

  const addSelectedChatMember = (userId: string, username: string) => {
    setSelectedChatMembers((prevSelectedChatMembers) => [...prevSelectedChatMembers, { userId, username }])
  }
  const removeSelectedChatMember = (userId: string) => {
    setSelectedChatMembers(selectedChatMembers.filter((member) => member.userId !== userId))
    console.log(userId)
    console.log(selectedChatMembers)
  }

  function handleMouseClick(event: MouseEvent) {
    if (showResults && inputContainerRef.current && !inputContainerRef.current?.contains(event.target as Node)) {
      setShowResults(false);
    }
  }
  document.addEventListener('mousedown', handleMouseClick);
  useEffect(() => {
    getFriends()
  }, [])
  function Friends() {
    return friends.filter((friend) => friend.username.toLowerCase().includes(searchQuery.toLowerCase())).map((friend) => {
      return <MemberDropdownItem selectedMembers={selectedChatMembers} userId={friend.user_id} username={friend.username} addMemberFunc={addSelectedChatMember} removeMemberFunc={removeSelectedChatMember} />
    })
  }

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
  const createChat = async () => {
    axios.post(`${process.env.REACT_APP_API_URL}/api/chat`, { userId: userInfo.userId, name: chatName, memberIds: selectedChatMembers.map((member) => member.userId) }).then((res) => {
      props.setChats((prevChats) => [...prevChats, { id: res.data.chatId, name: res.data.name }])
      props.setAddChatSection(AddChatSection.OptionSelect)
      props.dialogRef.current?.close()
    }).catch((error) => console.log(error))
  }
  const SelectedMembers = () => {
    return selectedChatMembers.map((member) => {
      return <SelectedMember username={member.username} userId={member.userId} removeMemberFunc={removeSelectedChatMember} />
    })
  }
  return <div className="flex flex-col h-full gap-6">
    <div className="flex flex-col gap-2">

      <div>Chat Name</div>
      <input type="text"
        className="rounded-md dark:bg-gray-800 w-full h-11 md:h-8 pl-3 "
        value={chatName}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setChatName(event.target.value)
        }
      />
    </div>
    <div className="flex flex-col gap-2">
      <div>Members</div>
      <div className="flex flex-col gap-7">

        <div className="relative group focus-within:visible gap grow" onFocus={() => setShowResults(true)} ref={inputContainerRef}>
          <input type="text"
            className="rounded-md dark:bg-gray-800 w-full h-11 md:h-8 pl-3 focus:border-0 outline-none focus:rounded-b-none"
            placeholder="Add Members"
            value={searchQuery}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(event.target.value)
            }
          />
          <FontAwesomeIcon
            size="xl"
            icon={icon({ name: "chevron-up" })}
            className={`absolute md:inset-y-1 right-3 md:right-2 inset-y-2 text-gray-400 cursor-pointer  h-7 md:h-6 ${showResults ? "" : "hidden"}`}
            onClick={() => setShowResults(false)}
          />
          <FontAwesomeIcon
            size="xl"
            icon={icon({ name: "chevron-down" })}
            className={`absolute md:inset-y-1 right-3 md:right-2 inset-y-2 text-gray-400 cursor-pointer  h-7 md:h-6 ${!showResults ? "" : "hidden"}`}
            onClick={() => setShowResults(true)}
          />
          <div ref={resultsRef} className={`absolute w-full flex flex-col gap-2 bg-gray-800 p-1 ${showResults ? '' : 'hidden'} group-focus:text-lg overflow-y-auto max-h-56`} >
            {Friends()}
          </div>
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-2 overflow-y-auto shrink grow">
      {SelectedMembers()}
    </div>
    <div className="flex flex-row justify-between ">
      <div className="bg-gray-800  h-9 w-14 text-center flex flex-row items-center justify-center rounded-md cursor-pointer" onClick={() => props.setAddChatSection(AddChatSection.OptionSelect)}><div>Back</div></div>
      <div className="bg-gray-800  h-9 w-14 text-center flex flex-row items-center justify-center rounded-md cursor-pointer" onClick={() => createChat()}><div>Create</div></div>
    </div>
  </div>;
}

function AddChat({ dialogRef, setChats }: {
  dialogRef: React.RefObject<HTMLDialogElement>, setChats: React.Dispatch<React.SetStateAction<{
    name: string;
    id: string;
  }[]>>
}) {
  const [chatSection, setChatSection] = useState<AddChatSection>(AddChatSection.OptionSelect);

  const AddChatSelection = () => {
    return <div className="gap-2 flex flex-col md:flex-row w-full h-full">
      <div className="border-white bg-gray-800 grow relative group flex flex-col  cursor-pointer" onClick={() => setChatSection(1)}>
        <div className="text-center text-lg my-2 ">Create</div>
        <div className="text-center text-sm text-gray-400">Make your own group chat</div>
        <div className="relative grow">
          <img src={OutlineWrench} className="h-3/5 absolute right-0 left-0 top-0 bottom-0 m-auto -rotate-45 group-hover:-rotate-[35deg]" />
          <img src={OutlineHammer} className="h-[50%] absolute right-0 left-0 m-auto top-0 bottom-0 rotate-45 group-hover:rotate-[35deg]" />
        </div>
      </div>
      <div className="border-white group bg-gray-800 grow relative hover:visible  flex flex-col">
        <div className="text-center text-lg my-2">Join</div>
        <div className="text-center text-sm text-gray-400">Join an existing group chat</div>
        <div className="relative grow">
          <img src={DoorClosed} className="absolute h-3/6 left-0 right-0 top-0 bottom-0 m-auto group-hover:invisible" />
          <img src={DoorOpen} className="absolute h-[60%] left-0 right-0 top-1/4 mx-auto invisible group-hover:visible" />
        </div>
      </div>
    </div>
  }
  const AddChatContent = () => {
    switch (chatSection) {
      case (AddChatSection.OptionSelect):
        return <AddChatSelection />
      case (AddChatSection.CreateChat):
        return <CreateChat setAddChatSection={setChatSection} setChats={setChats} dialogRef={dialogRef} />
      default:
        return AddChatSelection();
    }
  }
  return (<dialog
    ref={dialogRef}
    className="absolute h-5/6 w-3/4 md:h-3/4 md:w-[50rem] p-8 rounded-md m-auto top-0 bottom-0 right-0 left-0 dark:bg-gray-900 dark:text-gray-200 z-10"
  >
    <AddChatContent />
  </dialog>);
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
      />
      <div className="flex flex-col flex-grow w-screen h-screen absolute md:static ">
        <Outlet context={{ friends, refreshFriendsFunc: getFriends, setSidebarActive, jwt } satisfies HomeOutletContext} />
        <Settings
          dialogRef={dialogRef}
          imgRefreshFunc={forceUpdate}
          setUserInfo={setUserInfo}
        />
        <AddChat dialogRef={addChatRef} setChats={setChats} />
      </div>
    </div>
  );
}

export default Home;