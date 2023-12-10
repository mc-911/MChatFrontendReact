import React, { useState, useEffect, useRef, MutableRefObject } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { HubConnectionState } from "@microsoft/signalr";
import {
  HubConnectionBuilder,
  LogLevel,
  HubConnection,
} from "@microsoft/signalr";
import { PrivateOutletContext } from "./protectedRoute";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
import useUserInfo from "./useIsAuth";
import { ChatInfo } from "./home";
import { MessageInputComponent } from "./MessageInputComponent";
import { MessageComponent } from "./MessageComponent";
import defaultProfilePic from "../assets/default_image.jpg";

type Message = {
  senderName: string;
  senderId: string;
  timeSent: Date;
  content: string;
};
export function ChatContent({
  chat,
  setSidebarActive,
}: {
  chat: ChatInfo;
  setSidebarActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const lastMessageRef = useRef() as MutableRefObject<HTMLDivElement>;
  const [connection, setConnection] = useState<HubConnection>();
  const { userInfo } = useUserInfo();
  const { jwt } = useOutletContext<PrivateOutletContext>();
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.focus();
    }
  }, [messages.length]);
  const sendMessage = (message: string) => {
    if (connection) {
      const timestamp = Date.now();
      axios
        .post(`${process.env.REACT_APP_API_URL}/api/storeMessage`, {
          chatId: chat.chatId,
          timestamp: timestamp,
          content: message,
        })
        .then(() => {
          if (connection.state === HubConnectionState.Connected) {
            console.log("Real time sending");
            connection.invoke("SendMessage", message, timestamp.toString());
          }
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
            ChatId: chat.chatId,
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
    console.log({ content, time, userId, username });
    console.log(messages);
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
  React.useEffect(() => {
    if (jwt !== "") {
      getMessages(chat.chatId).then(() => {
        joinChat();
      });
    }
  }, [chat.chatId]); // eslint-disable-line react-hooks/exhaustive-deps
  const placeMessages = (messages: Message[]) => {
    console.log(messages);
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
        console.log(newMessages);
        setMessages(newMessages);
      })
      .catch((error) => {});
  };
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
            src={chat.imageUrl}
            className="h-10 w-10 rounded-full object-cover"
            alt="Chat Logo"
            onError={(event) => {
              // @ts-ignore
              event.target.src = defaultProfilePic;
            }}
          />
          <div>{chat.name}</div>
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
        placeholder={`Message ${chat.name}`}
        sendMessageFunc={sendMessage}
      />
    </>
  );
}
