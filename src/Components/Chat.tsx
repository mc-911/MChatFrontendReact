import React, { useState, useEffect, useRef, MutableRefObject } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import axios from "axios";
import { HubConnectionState } from "@microsoft/signalr";
import {
  HubConnectionBuilder,
  LogLevel,
  HubConnection,
} from "@microsoft/signalr";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
import useUserInfo from "./useIsAuth";
import { HomeOutletContext } from "./home";
import { MessageInputComponent } from "./MessageInputComponent";
import { MessageComponent } from "./MessageComponent";
import defaultProfilePic from "../assets/default_image.jpg";
import infoIcon from "../assets/info icon.svg"
import searchIcon from "../assets/magnifying-glass-button.svg"
import doorIcon from "../assets/door-open-button.svg"
import disabledDoorIcon from "../assets/disabled door icon.svg"
import triangle from "../assets/tooltip-triangle.svg"
import SearchIcon from "../assets/bx-search-alt-2.svg"
import { PendingRequest } from "./FriendsPage";

type Message = {
  senderName: string;
  senderId: string;
  timeSent: Date;
  content: string;
};
type ChatMember = {
  username: string,
  role: string,
  user_id: string
}
type ChatInfo = {
  chatId: string;
  name: string;
  imageUrl: string;
  role: string
  inviteCode?: string
  type?: string
};

function MemberElipsisMenu({ chatId, userId, friendRequestBtnDisabled, removeMemberBtnDisabled, memberDialogRef, toggleButtonRef, setChatMembers, setChats, setRequests }: { chatId: string, userId: string, friendRequestBtnDisabled: boolean, removeMemberBtnDisabled: boolean, memberDialogRef: React.RefObject<HTMLDialogElement>, toggleButtonRef: React.RefObject<HTMLDivElement>, setChatMembers: React.Dispatch<React.SetStateAction<ChatMember[]>>, setChats: React.Dispatch<React.SetStateAction<{ name: string; id: string; }[]>>, setRequests: React.Dispatch<React.SetStateAction<PendingRequest[]>> }) {
  document.addEventListener("mouseup", (event) => {
    if (memberDialogRef.current && memberDialogRef.current.open && !memberDialogRef.current.contains(event.target as Node) && !toggleButtonRef.current?.contains(event.target as Node)) {
      memberDialogRef.current.close()
      console.log("One")
    }
  })
  const { userInfo } = useUserInfo()
  const navigate = useNavigate()
  const sendFriendRequest = () => {
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/api/user/${userInfo.userId}/friend_request`,
        { requesteeId: userId }
      )
      .then((response) => {
        setRequests((prevRequests) => [...prevRequests, response.data])
      }
      )
      .catch((error) => {
        console.log(error);
      });
  };

  const removeFromChat = () => {
    axios.delete(`${process.env.REACT_APP_API_URL}/api/chat/${chatId}/member/${userId}`).then((res) => {
      setChatMembers((prevChatMembers) => {
        prevChatMembers.splice(prevChatMembers.findIndex((member) => member.user_id === userId), 1)
        return [...prevChatMembers]
      })
      if (userInfo.userId === userId) {
        setChats((prevChats) => {
          prevChats.splice(prevChats.findIndex((chat) => chat.id === chatId), 1)
          return [...prevChats]
        })
        navigate("/home/friends/all")

      }
    }).catch((error) => console.log(error))
  }

  return <dialog className="absolute z-10 w-11/12 top-16 right-36 bg-secondary rounded-md" ref={memberDialogRef}>
    <div className="flex flex-col h-full w-full p-3  rounded-md ">
      <div className={`select-none flex flex-row gap-2 items-center w-full p-2 ${friendRequestBtnDisabled ? 'text-gray-600' : 'text-gray-300 hover:bg-white hover:bg-opacity-20 cursor-pointer'} rounded-md `} onClick={() => friendRequestBtnDisabled ? {} : sendFriendRequest()}>
        <FontAwesomeIcon
          icon={icon({ name: "user-plus" })}
          className="basis-1/12"
        />
        <div>Send Friend Request</div>
      </div>
      <div className={`select-none flex flex-row gap-2 items-center w-full p-2 ${removeMemberBtnDisabled ? 'text-gray-600' : 'text-gray-300 hover:bg-white hover:bg-opacity-20 cursor-pointer'} rounded-md `} onClick={() => removeMemberBtnDisabled ? {} : removeFromChat()}>
        <FontAwesomeIcon
          icon={icon({ name: "user-xmark" })}
          className="basis-1/12"
        />
        <div>Remove Member</div>
      </div>
    </div>

  </dialog>
}
function MemberModal({ username, userId, dialogRef, friendRequestBtnDisabled, removeMemberBtnDisabled, chatId, setChatMembers, setChats, setRequests }: { username: string, chatId: string, userId: string, dialogRef: React.RefObject<HTMLDialogElement>, friendRequestBtnDisabled: boolean, removeMemberBtnDisabled: boolean, setChatMembers: React.Dispatch<React.SetStateAction<ChatMember[]>>, setChats: React.Dispatch<React.SetStateAction<{ name: string; id: string; }[]>>, setRequests: React.Dispatch<React.SetStateAction<PendingRequest[]>> }) {
  const { userInfo } = useUserInfo()
  const navigate = useNavigate()
  const sendFriendRequest = () => {
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/api/user/${userInfo.userId}/friend_request`,
        { requesteeId: userId }
      )
      .then((response) => {
        console.log("Request sent");
      }
      )
      .catch((error) => {
        console.log(error);
      });
  };

  const removeFromChat = () => {
    axios.delete(`${process.env.REACT_APP_API_URL}/api/chat/${chatId}/member/${userId}`).then((res) => {
      setChatMembers((prevChatMembers) => {
        prevChatMembers.splice(prevChatMembers.findIndex((member) => member.user_id === userId), 1)
        return [...prevChatMembers]
      })
      if (userInfo.userId === userId) {
        setChats((prevChats) => {
          prevChats.splice(prevChats.findIndex((chat) => chat.id === chatId), 1)
          return [...prevChats]
        })
        navigate("/home/friends/all")
      }
    }).catch((error) => console.log(error))
  }

  return <dialog className="absolute h-screen w-screen bg-secondary z-10 left-0 right-0 top-0 bottom-0 m-auto text-gray-50 " ref={dialogRef}>
    <div className="flex flex-col h-full w-full items-center gap-8 py-3 px-4">
      <div className="w-full">              <FontAwesomeIcon
        onClick={() => dialogRef.current?.close()}
        size="2xl"
        icon={icon({ name: "arrow-left" })}
        className="text-gray-400 hover:text-gray-100 active:text-gray-50 cursor-pointer"
      /></div>
      <div className="flex flex-col gap-3 items-center">
        <img
          src={`${process.env.REACT_APP_API_URL}/api/user/${userId}/profilePicture`}
          alt="Uh Oh"
          className="w-40 h-40 rounded-full object-cover"
          onError={(event) => {
            // @ts-ignore
            event.target.src = defaultProfilePic;
          }} />
        <div className="text-xl">{username}</div>
      </div>
      <div className="flex flex-col gap-3 mt-1 w-full sm:w-72 grow ">
        <div className={`rounded-md bg-primary/50 ${friendRequestBtnDisabled ? 'opacity-50' : 'cursor-pointer'} select-none flex flex-row justify-center items-center h-12 p-2 w-full `} onClick={() => friendRequestBtnDisabled ? {} : sendFriendRequest()}>Send Friend Request</div>
        <div className={`rounded-md bg-red-900  ${removeMemberBtnDisabled ? 'opacity-50' : 'cursor-pointer'} select-none flex flex-row justify-center items-center h-12 p-2 w-full `} onClick={() => removeMemberBtnDisabled ? {} : removeFromChat()}>{userInfo.userId === userId ? "Leave Chat" : "Remove"}</div>
      </div>
    </div>
  </dialog>
}
export function Chat() {
  const { setSidebarActive, jwt, friends, setChats } = useOutletContext<HomeOutletContext>();
  const [messages, setMessages] = useState<Message[]>([]);
  const lastMessageRef = useRef() as MutableRefObject<HTMLDivElement>;
  const [chatInfo, setChatInfo] = useState<ChatInfo>({ chatId: "", name: "", imageUrl: "", role: "" });
  const [chatMembers, setChatMembers] = useState<ChatMember[]>([])
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [role, setRole] = useState('');
  const [showChatMembers, setShowChatMembers] = useState(false)
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const navigate = useNavigate()
  const getPendingRequests = () => {
    return axios
      .get(
        `${process.env.REACT_APP_API_URL}/api/user/${userInfo.userId}/friend_request`
      )
      .then((response) => {
        setRequests(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const getStoredConnection = () => {
    const oldConnectionString = sessionStorage.getItem(`chat-${chatInfo?.chatId}-connection`)
    if (oldConnectionString) {
      const oldConnection = JSON.parse(oldConnectionString) as HubConnection;
      return oldConnection;
    } else {
      return null
    }
  }
  const { userInfo } = useUserInfo();
  const [connection, setConnection] = useState<HubConnection | null>(getStoredConnection());
  const { id } = useParams();

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView();
    }
  }, [messages.length]);

  useEffect(() => {
    if (id) {
      getPendingRequests().then(() => getChatInfo());
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps


  React.useEffect(() => {
    if (jwt !== "" && chatInfo) {
      getMessages(chatInfo.chatId).then(() => {
        if (!connection) {
          joinChat();
        }
      });
    }
  }, [chatInfo]); // eslint-disable-line react-hooks/exhaustive-deps
  const getChatInfo = async () => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/chat/${id}/info`).then((response) => {
      console.log(response.data)
      setChatInfo(response.data);
      if (response.data.members) {
        setChatMembers(response.data.members)
      } else {
        setChatMembers([])
      }
      setRole(response.data.members.find((member: { user_id: string, role: string }) => member.user_id === userInfo.userId)?.role)
    }).catch((error) => {
      console.log(error)
    })
  }

  const sendMessage = (message: string) => {
    if (connection) {
      const timestamp = Date.now();
      axios
        .post(`${process.env.REACT_APP_API_URL}/api/chat/${chatInfo?.chatId}/storeMessage`, {
          timestamp: timestamp,
          content: message,
        })
        .then(() => {
          if (connection.state === HubConnectionState.Connected) {
            console.log("Real time sending");
            connection.invoke("SendMessage", message, timestamp.toString());
          }
          receiveMessage(message, timestamp.toString(), userInfo.userId, userInfo.username);
        });
    }
  };
  const joinChat = async () => {
    console.log(`Joining chat`);
    let connection = new HubConnectionBuilder()
      .withUrl(`${process.env.REACT_APP_WEBSOCKETS_URL}/chat`, {
        accessTokenFactory() {
          return jwt;
        },
      })
      .configureLogging(LogLevel.Information)
      .build();
    connection.on("ReceiveMessage", receiveMessage);
    await connection
      .start()
      .then(() => {
        connection
          .invoke("JoinChat", {
            Username: userInfo.username,
            ChatId: chatInfo?.chatId,
            UserId: userInfo.userId,
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
    sessionStorage.setItem(`chat-${chatInfo?.chatId}-connection`, JSON.stringify(connection))
    setConnection(connection);
  };
  const receiveMessage = (
    content: string,
    time: string,
    userId: string,
    username: string
  ) => {
    console.log("Message Received")
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        senderName: username,
        senderId: userId,
        timeSent: new Date(parseInt(time)),
        content: content,
      },
    ]);
  };
  const placeMessages = (messages: Message[]) => {
    return messages.map((message) => {
      return (
        <MessageComponent
          senderName={message.senderName}
          senderId={message.senderId}
          timeSent={message.timeSent}
          content={message.content}
          lastMessageRef={lastMessageRef}
        />
      );
    });
  };
  const getMessages = async (chatId: string) => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/api/chat/${chatId}/getMessages`)
      .then((response) => {
        const newMessages = response.data.messages.map((message: any) => {
          return {
            senderName: message.username,
            senderId: message.owner,
            timeSent: new Date(Date.parse(message.timestamp)),
            content: message.content,
          };
        });
        setMessages(newMessages);
      })
      .catch((error) => { });
  };
  const removeFromChat = (userId: string) => {
    axios.delete(`${process.env.REACT_APP_API_URL}/api/chat/${chatInfo?.chatId}/member/${userId}`).then((res) => {
      if (userId === userInfo.userId) {
        navigate("/home/friends/all")
        setChats((prevChats) => {
          prevChats.splice(prevChats.findIndex((chat) => chat.id === chatInfo.chatId), 1)
          return [...prevChats]
        })
      }
    }).catch((error) => console.log(error))
  }
  const getMembers = () => {
    const screenWidth = window.screen.width;
    return chatMembers.map((member) => {
      const memberDialogRef = React.createRef<HTMLDialogElement>()
      const buttonDialogRef = React.createRef<HTMLDivElement>()
      const toggleDialog = () => {
        console.log("Two")
        if (memberDialogRef.current?.open) {
          memberDialogRef.current?.close()
        } else {
          memberDialogRef.current?.show()
        }
      }
      console.log(requests)
      const memberIsUser = member.user_id === userInfo.userId;
      const memberIsFriend = friends.findIndex((friend) => friend.user_id === member.user_id) !== -1;
      const requestSentToMember = requests.findIndex((request) => request.user_id === member.user_id) !== -1;
      const disableFriendRequestBtn = (memberIsUser || memberIsFriend || requestSentToMember);
      const disableRemoveBtn = (role === 'OWNER' && userInfo.userId === member.user_id) || (userInfo.userId !== member.user_id && role !== 'OWNER')
      return <><div className="flex flex-row justify-between p-2 pr-0 items-center cursor-pointer sm:cursor-default hover:bg-white hover:bg-opacity-25 md:hover:bg-transparent md:bg-opacity-100 rounded-md  relative" onClick={screenWidth < 768 ? toggleDialog : () => { }}>
        <div className="flex flex-row gap-3 items-center">
          <img
            src={`${process.env.REACT_APP_API_URL}/api/user/${member.user_id}/profilePicture`}
            alt="Uh Oh"
            className="w-8 h-8 object-cover rounded-full"
            onError={(event) => {
              // @ts-ignore
              event.target.src = defaultProfilePic;
            }} />
          <div className="flex flex-col">
            <div>{member.username}</div>
            <div className="text-sm text-gray-400">{member.role.toUpperCase().charAt(0) + member.role.toLowerCase().slice(1)}</div>
          </div>
        </div>
        <div ref={buttonDialogRef} className="rounded-full flex-row justify-center items-center w-9 h-9 hidden sm:flex hover:bg-white hover:bg-opacity-25 cursor-pointer" id={`member-ellipsis=-${member.user_id}`} onClick={screenWidth >= 768 ? toggleDialog : () => { }}>
          <FontAwesomeIcon icon={icon({ name: "ellipsis" })} />
        </div>
        {screenWidth >= 768 ? <MemberElipsisMenu setRequests={setRequests} setChats={setChats} setChatMembers={setChatMembers} chatId={chatInfo.chatId} userId={member.user_id} toggleButtonRef={buttonDialogRef} removeMemberBtnDisabled={disableRemoveBtn} friendRequestBtnDisabled={disableFriendRequestBtn} memberDialogRef={memberDialogRef} /> : ''}
      </div>
        {screenWidth < 768 ? <MemberModal setRequests={setRequests} setChats={setChats} chatId={chatInfo.chatId} userId={member.user_id} username={member.username} dialogRef={memberDialogRef} removeMemberBtnDisabled={disableRemoveBtn} friendRequestBtnDisabled={disableFriendRequestBtn} setChatMembers={setChatMembers} /> : ''}</>
    })

  }
  if (chatInfo) {
    return (
      <div className="flex flex-row h-full w-full">
        <div className={`flex flex-col h-full  grow  basis-full md:basis-3/4 ${showChatSidebar ? 'hidden sm:flex' : ''}`}>
          <div className="flex flex-row items-center justify-between p-3">
            <div className="flex flex-row items-center ">
              <FontAwesomeIcon
                onClick={() => setSidebarActive(true)}
                size="2xl"
                icon={icon({ name: "arrow-left" })}
                className="text-gray-400 hover:text-gray-100 md:hidden active:text-gray-50 ml-4 mr-2 cursor-pointer"
              />
              <div className="flex flex-row flex-nowrap items-center gap-2">
                <img
                  src={`${process.env.REACT_APP_API_URL}${chatInfo.imageUrl}`}
                  className="h-10 w-10 rounded-full object-cover"
                  alt="Chat Logo"
                  onError={(event) => {
                    // @ts-ignore
                    event.target.src = defaultProfilePic;
                  }}
                />
                <div>{chatInfo.name}</div>
              </div>
            </div>
            <div className="flex flex-row gap-3 items-center">

              <div className=" relative ">
                <img alt="magnifying glass" src={SearchIcon} className="absolute h-5 sm:h-5 left-2 inset-y-3 md:inset-y-2"></img>
                <input
                  className={`rounded-md dark:bg-gray-800 ${messageSearchQuery.length ? "w-64" : "w-28"}  focus:w-64 h-11 md:h-8 pl-8 `}
                  type="text"
                  placeholder="Search"
                  value={messageSearchQuery}
                  onChange={(e) => setMessageSearchQuery(e.target.value)}

                />
                <FontAwesomeIcon
                  size="xl"
                  icon={icon({ name: "xmark" })}
                  className={`absolute md:inset-y-1 right-3 md:right-2 inset-y-2 text-slate-400 cursor-pointer  h-7 md:h-6 ${messageSearchQuery.length ? "" : "hidden"}`}
                  onClick={() => setMessageSearchQuery("")}
                />
              </div>
              <img alt="infomation" src={infoIcon} className="h-10 cursor-pointer" onClick={() => setShowChatSidebar(!showChatSidebar)} /></div>
          </div>
          <div className="grow bg-secondary overflow-auto scroll px-3">
            <>
              {messages ? (
                placeMessages(messages)
              ) : (
                <div>Start up a conversation</div>
              )}
            </>
          </div>
          <MessageInputComponent
            placeholder={`Message ${chatInfo.name}`}
            sendMessageFunc={sendMessage}
          />
        </div>
        <div className={`bg-background basis-full md:basis-1/4 ${showChatSidebar ? '' : 'hidden'} flex flex-col h-full`} >
          <div className="w-full py-3 cursor-pointer sm:hidden">              <FontAwesomeIcon
            onClick={() => setShowChatSidebar(false)}
            size="2xl"
            icon={icon({ name: "arrow-left" })}
            className="text-gray-400 hover:text-gray-100 md:hidden active:text-gray-50 ml-4 mr-2"
          /></div>
          <div className="flex flex-col w-full items-center basis-1/3 p-10 gap-3">
            <img
              src={`${process.env.REACT_APP_API_URL}${chatInfo.imageUrl}`}
              className="h-28 w-28 rounded-full object-cover"
              alt="Chat Logo"
              onError={(event) => {
                // @ts-ignore
                event.target.src = defaultProfilePic;
              }}
            />
            <div>{chatInfo.name}</div>
            {chatInfo.inviteCode ?
              <div className="flex flex-col items-center gap-2 text-sm">
                <div>Invite Code</div>
                <div className="text-gray-400 text-xs">{chatInfo.inviteCode}</div>
              </div>
              :
              ''}
            <div className="flex flex-row gap-8 w-full justify-center my-3 select-none">
              <div className="flex flex-col items-center  gap-1 cursor-pointer"><img alt="magnifying glass" src={searchIcon} className="h-11" />
                <div>Search</div>
              </div>
              {chatInfo.type === "GROUP" && <div className={`flex flex-col items-center relative group`} >
                <div className={`flex flex-col items-center gap-1 ${role === 'OWNER' ? '' : 'cursor-pointer'}`} onClick={() => role === 'OWNER' ? {} : removeFromChat(userInfo.userId)} >
                  <img alt="open door" src={role === 'OWNER' ? disabledDoorIcon : doorIcon} className="h-11" />
                  <div className={`${role === 'OWNER' ? 'text-[#919397]' : ''}`}>Leave</div>
                </div>
                <div className={`absolute invisible ${role === 'OWNER' ? 'group-hover:visible' : ''} block top-20 `}><img alt="popup triangle" src={triangle} className="h-2 img w-24 left-0 right-0 m-auto bg-black text-black" /><div className="h-12 w-48 text-center m-0 bg-black rounded-md ">Owners may not leave their chats</div></div>
              </div>}
            </div>

          </div>
          <div className="basis-2/3 flex flex-col px-5">
            <div className={`flex flex-row justify-between items-center cursor-pointer hover:bg-white hover:bg-opacity-25 p-2 rounded-md ${chatMembers.length > 0 ? '' : 'hidden'}`} onClick={() => setShowChatMembers(!showChatMembers)}>
              <div>Chat Members</div>
              <FontAwesomeIcon icon={icon({ name: "chevron-up" })} className={`${showChatMembers ? '' : 'rotate-180'}`} />
            </div>
            <div className={`grow flex flex-col ${showChatMembers ? '' : 'hidden'} sm-`}>{getMembers()}</div>
          </div>
        </div>
      </div>
    );
  } else {
    return (<>
      <div>Loading..</div>
    </>);
  }
}
