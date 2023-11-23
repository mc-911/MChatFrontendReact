import React, { useState, useEffect } from "react";

import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  HubConnectionBuilder,
  LogLevel,
  HubConnection,
} from "@microsoft/signalr";
import { PrivateOutletContext } from "./protectedRoute";
interface FriendsSectionItemProps {
  name: string;
  profilePic: string;
  chat_id: string;
  active: boolean;
}
const testMessage =
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?";
const testImage =
  "https://www.rollingstone.com/wp-content/uploads/2018/06/bladerunner-2-trailer-watch-8bd914b0-744f-43fe-9904-2564e9d7e15c.jpg";
function FriendsSectionItem({ name, profilePic, chat_id, active }: FriendsSectionItemProps) {
  return (
    <div className={`flex flex-row  gap-4 items-center p-1 m-1 rounded-md hover:bg-slate-50/50 active:text-gray-50 ${active ? 'dark:bg-slate-50/50 dark:text-gray-50' : 'dark:bg-background'} `}>

      <img src={profilePic} alt="Uh Oh" className="w-10 rounded-full" />
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
    <div className="message">
      <img src={senderIcon} className="senderIcon" />
      <div className="chatHeaderAndContent">
        <div className="senderNameTimeSentSection">
          <div className="senderName">{senderName}</div>
          <div className="timeTime">{new Date().toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" })}</div>
        </div>
        <div className="content">{content}</div>
      </div>
    </div>
  );
}
function Home() {
  const [chatName, setChatName] = useState("");
  const [connection, setConnection] = useState<HubConnection>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]); // [id, name, profilePic
  const { jwt, setJwt } = useOutletContext<PrivateOutletContext>();
  const [chat, setChat] = useState("b7c75abe-426d-476d-ac8f-ed7a1506d923")

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
  React.useEffect(() => {
    if (jwt != '') {
      getMessages(chat).then(() => {
        joinChat();
      });
      getFriends(jwtDecode<any>(jwt).userId);
    }
  }, [jwt]);

  const getFriends = async (user_id: string) => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/api/users/${user_id}/friends`)
      .then((response) => {
        const friends: Friend[] = response.data.friends;
        setFriends(friends);
        console.log(friends)
      })
      .catch((error) => { });
  }
  const sendMessage = (message: string) => {
    if (connection) {
      const timestamp = Date.now()
      axios.post(`${process.env.REACT_APP_API_URL}/api/storeMessage`, { chatId: chat, timestamp: timestamp, content: message }).then(() => {
        connection.invoke("SendMessage", message, timestamp.toString());
      }
      );
    }
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

  const getFriendsList = (friends: Friend[]) => {
    return friends.map((friend) => {
      return (<FriendsSectionItem active={true} name={friend.username} profilePic={`http://localhost:3000/api/users/${friend.user_id}/profilePicture`} chat_id={friend.chat_id} />)
    })
  }
  return (
    <div id='bodyDiv' className='flex-row flex h-screen bg-[#EBF7FF] dark:bg-[#000C14]  dark:text-gray-200'>
      <div className="friendsSection bg-background w-72">
        <div onClick={() => receiveMessage("Test Message", "2023-11-21 20:54:31.434+13", "Test Id", "Test Name")} style={{ textAlign: "center" }}>Direct Messages</div>
        <>
          {getFriendsList(friends)}
        </>
      </div>
      <div className="flex flex-col flex-grow">
        <ChatHeader name="Literally him" profilePic={testImage} />
        <div className="grow bg-secondary ">
          <>
            {placeMessages(messages)}
          </>
        </div>
        <MessageInputComponent placeholder={`Message ${chatName}`} sendMessageFunc={sendMessage} />
      </div>
    </div>
  );
}

export default Home;
