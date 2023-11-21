import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
}
const testMessage =
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?";
const testImage =
  "https://www.rollingstone.com/wp-content/uploads/2018/06/bladerunner-2-trailer-watch-8bd914b0-744f-43fe-9904-2564e9d7e15c.jpg";
function FriendsSectionItem({ name, profilePic }: FriendsSectionItemProps) {
  return (
    <div className="friendsSectionItem">
      <img src={profilePic} alt="Uh Oh" />
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
    <div className="chatHeader">
      <img src={profilePic} />
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
    <div className="MessageInputComponent">
      <input type="text" placeholder={placeholder} value={message} onChange={onChangeMessage} onKeyDown={(event) => {
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
    }
  }, [jwt]);

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
  return (
    <div className="homeScaffold">
      <div className="friendsSection">
        <div onClick={() => receiveMessage("Test Message", "2023-11-21 20:54:31.434+13", "Test Id", "Test Name")} style={{ textAlign: "center" }}>Chats</div>
        <FriendsSectionItem name="Literally Him" profilePic={testImage} />
      </div>
      <div className="chatSection">
        <ChatHeader name="Literally him" profilePic={testImage} />
        <div className="chatContent">
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
