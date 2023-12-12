import React, { useState, useEffect, useRef, MutableRefObject } from "react";
import { useOutletContext, useParams } from "react-router-dom";
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
import { ChatInfo, HomeOutletContext } from "./home";
import { MessageInputComponent } from "./MessageInputComponent";
import { MessageComponent } from "./MessageComponent";
import defaultProfilePic from "../assets/default_image.jpg";

type Message = {
  senderName: string;
  senderId: string;
  timeSent: Date;
  content: string;
};
export function Chat() {
  const { setSidebarActive, jwt } = useOutletContext<HomeOutletContext>();
  const [messages, setMessages] = useState<Message[]>([]);
  const lastMessageRef = useRef() as MutableRefObject<HTMLDivElement>;
  const [connection, setConnection] = useState<HubConnection>();
  const { userInfo } = useUserInfo();
  const { id } = useParams();
  const [chatInfo, setChatInfo] = useState<ChatInfo>();

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.focus();
    }
  }, [messages.length]);

  useEffect(() => {
    if (id) {
      getChatInfo()
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps


  React.useEffect(() => {
    if (jwt !== "" && chatInfo) {
      getMessages(chatInfo.chatId).then(() => {
        joinChat();
      });
    }
  }, [chatInfo]); // eslint-disable-line react-hooks/exhaustive-deps
  const getChatInfo = async () => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/chats/${id}/info`).then((response) => {
      console.log(response.data)
      setChatInfo(response.data);
    }).catch((error) => {
      console.log(error)
    })
  }

  const sendMessage = (message: string) => {
    if (connection) {
      const timestamp = Date.now();
      axios
        .post(`${process.env.REACT_APP_API_URL}/api/storeMessage`, {
          chatId: chatInfo?.chatId,
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
      .post(`${process.env.REACT_APP_API_URL}/api/getMessages`, {
        chatId: chatId,
      })
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
  if (chatInfo) {
    return (
      <>
        {" "}
        <div className="flex flex-row items-center">
          <FontAwesomeIcon
            onClick={() => setSidebarActive(true)}
            size="2xl"
            icon={icon({ name: "arrow-left" })}
            className="text-gray-400 hover:text-gray-100 md:hidden active:text-gray-50 ml-4 mr-2"
          />
          <div className="flex flex-row flex-nowrap p-3 items-center gap-2">
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
      </>
    );
  } else {
    return (<>
      <div>Loading..</div>
    </>);
  }
}
