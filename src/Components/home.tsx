import React, { useState, useEffect } from "react";

import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import defaultProfilePic from "../assets/default_image.jpg";
import { HubConnectionState } from "@microsoft/signalr";
import {
  HubConnectionBuilder,
  LogLevel,
  HubConnection,
} from "@microsoft/signalr";
import { PrivateOutletContext } from "./protectedRoute";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
enum Page {
  friends,
  chat
}

type Chat = {
  chatId: string;
  name: string;
}
interface FriendsSectionItemProps {
  name: string;
  profilePic: string;
  chatId: string;
  active: boolean;
  setChat: React.Dispatch<React.SetStateAction<Chat>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<Page>>;
}
const testMessage =
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?";
const testImage =
  "https://www.rollingstone.com/wp-content/uploads/2018/06/bladerunner-2-trailer-watch-8bd914b0-744f-43fe-9904-2564e9d7e15c.jpg";
function FriendsSectionItem({ name, profilePic, chatId, active, setChat, setCurrentPage }: FriendsSectionItemProps) {
  return (
    <div onClick={() => { setChat({ name, chatId }); setCurrentPage(Page.chat) }} className={`flex flex-row  gap-4 items-center h-12 p-1 pl-3 m-1 rounded-md hover:bg-slate-50/50 active:text-gray-50 ${active ? 'dark:bg-slate-50/50 dark:text-gray-50' : 'dark:bg-background'} `}>

      <img src={profilePic} alt="Uh Oh" className="w-8 rounded-full" onError={event => {
        // @ts-ignore
        event.target.src = defaultProfilePic
      }} />
      <div className="friendsSectionItemName">{name}</div>
    </div>
  );
}
interface ChatHeaderProps {
  name: string;
  profilePic: string;
}
function ChatHeader({ name, profilePic }: ChatHeaderProps) {
  return (
    <div className="flex flex-row flex-nowrap p-3 items-center gap-2">
      <img src={profilePic} className="h-10 w-10 rounded-full" />
      <div>{name}</div>
    </div>
  );
}

interface MessageInputComponent {
  placeholder: string;
  sendMessageFunc: (message: string) => void;
}

function MessageInputComponent({ placeholder, sendMessageFunc }: MessageInputComponent) {
  const [message, setMessage] = useState('');
  const onChangeMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }
  return (
    <div className="w-full flex flex-row items-center justify-center bg-secondary">
      <input className="flex-grow mx-6 mb-4 h-11 pl-4 rounded-md dark:bg-gray-800" type="text" placeholder={placeholder} value={message} onChange={onChangeMessage} onKeyDown={(event) => {
        if (event.key == "Enter") {
          sendMessageFunc(message)
        }
      }} />
    </div>
  );
}
interface MessageProps {
  senderName: string;
  senderIcon: string;
  timeSent: Date;
  content: string;
}
type Message = {
  senderName: string;
  senderIcon: string;
  timeSent: Date;
  content: string;
};
type Friend = {
  user_id: string;
  username: string;
  chat_id: string;
};
function Message({ senderName, senderIcon, timeSent, content }: MessageProps) {
  return (
    <div className="flex flex-row gap-3 m-3">
      <img src={senderIcon} className="h-10 w-10 rounded-full" onError={event => {
        // @ts-ignore
        event.target.src = defaultProfilePic
      }} />
      <div className="flex flex-col">
        <div className="flex flow-row gap-3 items-end">
          <div className="font-semibold">{senderName}</div>
          <div className="text-sm text-gray-400">{new Date().toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" })}</div>
        </div>
        <div className="grow">{content}</div>
      </div>
    </div>
  );
}
function FriendsPage({ friends, setChat, setCurrentPage }: { friends: Friend[], setChat: React.Dispatch<React.SetStateAction<Chat>>, setCurrentPage: React.Dispatch<React.SetStateAction<Page>> }) {
  const insertFriends = () => {
    return friends.map((friend) => {
      return (<div className="flex flex-row border-t-2 border-gray-400">
        <div className="flex flex-row gap-3 items-center m-3">
          <img src={`http://localhost:3000/api/users/${friend.user_id}/profilePicture`} alt="Uh Oh" className="w-8 rounded-full" onError={event => {
            // @ts-ignore
            event.target.src = defaultProfilePic
          }} />
          <div>{friend.username}</div> </div>
        <div className="flex flex-row grow items-center justify-end gap-5 pr-5">
          <FontAwesomeIcon onClick={() => { setChat({ name: friend.username, chatId: friend.chat_id }); setCurrentPage(Page.chat) }} size='xl' icon={icon({ name: 'message' })} className="text-gray-400 hover:text-gray-200 active:text-gray-50" />
          <FontAwesomeIcon size='xl' icon={icon({ name: 'xmark-circle' })} className="text-gray-400 pb-1 hover:text-red-500 active:text-red-700" />
        </div>
      </div>)
    })
  }
  return (
    <>
      <div className="flex flex-row flex-nowrap py-5 pl-5 items-center gap-3 ">
        <FontAwesomeIcon size='xl' icon={icon({ name: 'user-group' })} className="  self-center" />
        <div>Friends</div>
      </div>
      <div className="grow bg-secondary flex">
        <div className="rounded-md w-full m-1 bg-background">
          {insertFriends()}
        </div>
      </div>
    </>
  )
}
function ChatContent({ chat }: { chat: Chat }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connection, setConnection] = useState<HubConnection>();
  const { jwt, setJwt } = useOutletContext<PrivateOutletContext>();
  const sendMessage = (message: string) => {
    if (connection) {
      const timestamp = Date.now()
      axios.post(`${process.env.REACT_APP_API_URL}/api/storeMessage`, { chatId: chat.chatId, timestamp: timestamp, content: message }).then(() => {
        if (connection.state === HubConnectionState.Connected)
          connection.invoke("SendMessage", message, timestamp.toString());
      }
      );
    }
  }
  React.useEffect(() => {
    if (jwt != '') {
      getMessages(chat.chatId).then(() => {
        joinChat();
      });
    }
  }, [])
  const joinChat = async () => {
    console.log(`jwt: ${jwt}`);
    let connection = new HubConnectionBuilder()
      .withUrl(`${process.env.REACT_APP_WEBSOCKETS_URL}/chat`, { accessTokenFactory() { return jwt; } })
      .configureLogging(LogLevel.Information)
      .build();
    connection.on("ReceiveMessage", receiveMessage);
    await connection
      .start()
      .then(() => {
        connection.invoke("JoinChat", { Username: "Test User", ChatId: chat, UserId: jwtDecode<any>(jwt).userId });
      })
      .catch((error) => {
        console.log(error);
      });
    setConnection(connection);
  };
  const receiveMessage = (content: string, time: string, userId: string, username: string) => {
    console.log({ content, time, userId, username });
    console.log(messages)
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        senderName: username,
        senderIcon: testImage,
        timeSent: new Date(Date.parse(time)),
        content: content
      }
    ]);
  }
  const placeMessages = (messages: Message[]) => {
    console.log(messages)
    return messages.map((message) => {
      return (<Message
        senderName={message.senderName}
        senderIcon={testImage}
        timeSent={message.timeSent}
        content={message.content}
      />
      )
    });
  }
  const getMessages = async (chatId: string) => {
    await axios
      .post(`${process.env.REACT_APP_API_URL}/api/getMessages`, {
        chatId: chatId,
      })
      .then((response) => {
        const newMessages = response.data.messages.map((message: any) => {
          return {
            senderName: message.username,
            senderIcon: testImage,
            timeSent: new Date(Date.parse(message.timestamp)),
            content: message.content,
          };
        });
        console.log(newMessages)
        setMessages(newMessages);
      }
      )
      .catch((error) => { });
  };
  return (
    <>
      <ChatHeader name={chat.name} profilePic={testImage} />
      <div className="grow bg-secondary overflow-auto scroll">
        <>
          {messages ? placeMessages(messages) : <div>Start up a conversation</div>}
        </>
      </div>
      <MessageInputComponent placeholder={`Message ${chat.name}`} sendMessageFunc={sendMessage} />
    </>
  )
}
function Home() {
  const [friends, setFriends] = useState<Friend[]>([]); // [id, name, profilePic
  const [chat, setChat] = useState<Chat>({ name: "", chatId: "" });
  const [convoSearchQuery, setConvoSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState<Page>(Page.friends)
  const { jwt, setJwt } = useOutletContext<PrivateOutletContext>();
  React.useEffect(() => {
    if (jwt != '') {
      getFriends(jwtDecode<any>(jwt).userId);
    }
  }, [jwt]);

  const getFriends = async (user_id: string) => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/api/users/${user_id}/friends`)
      .then((response) => {
        const friends: Friend[] = response.data.friends;
        setFriends(friends);
        console.log(friends, "hello")
      })
      .catch((error) => { });
  }


  const getFriendsList = () => {
    return friends.map((friend) => {
      return (<FriendsSectionItem key={friend.user_id} setCurrentPage={setCurrentPage} setChat={setChat} active={chat.chatId == friend.chat_id && currentPage == Page.chat} name={friend.username} profilePic={`http://localhost:3000/api/users/${friend.user_id}/profilePicture`} chatId={friend.chat_id} />)
    })
  }

  const getCurrentPage = () => {
    switch (currentPage) {
      case Page.friends:
        return (<FriendsPage setCurrentPage={setCurrentPage} setChat={setChat} friends={friends} />)
      case Page.chat:
        return (
          <ChatContent chat={chat} />
        )
    }
  }
  return (
    <div id='bodyDiv' className='flex-row flex h-screen bg-[#EBF7FF] dark:bg-[#000C14]  dark:text-gray-200'>
      <div className="bg-background w-72 flex flex-col min-w-[18rem]">
        <input className="rounded-md dark:bg-gray-800 m-2 mb-4 h-8 pl-3" type="text" placeholder="Search for a conversation" onChange={(e) => setConvoSearchQuery(e.target.value)} />
        <div className="grow overflow-auto">
          <div onClick={() => setCurrentPage(Page.friends)} className={`flex flex-row  gap-4 items-center p-1 pl-3 mb-4 m-1 h-12 rounded-md hover:bg-slate-50/50 active:text-gray-50 ${currentPage == Page.friends ? 'dark:bg-slate-50/50 dark:text-gray-50' : 'dark:bg-background'}`}>
            <FontAwesomeIcon size='xl' icon={icon({ name: 'user-group' })} className="  self-center" />
            <div>Friends</div>
          </div>
          <div style={{ textAlign: "center" }}>Direct Messages</div>
          <>
            {getFriendsList()}
          </>
        </div>
        <div className="flex flew-row gap-3 p-3 bg-slate-900">
          <div className="flex flex-row gap-3">
            <img className="h-10 rounded-full" src={jwt ? `${process.env.REACT_APP_API_URL}/api/users/${jwtDecode<any>(jwt).userId}/profilePicture` : ''} onError={event => {
              // @ts-ignore
              event.target.src = defaultProfilePic
            }}  ></img>
            <div>{jwt ? jwtDecode<any>(jwt).username : "You"}</div>
          </div>
          <div className="grow flex justify-end">
            <FontAwesomeIcon size='xl' icon={icon({ name: 'cog' })} className="text-gray-400 pr-3 self-center" />
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-grow">
        {getCurrentPage()}
      </div>
    </div>
  );
}

export default Home;
