import React, { MutableRefObject } from "react";
import defaultProfilePic from "../assets/default_image.jpg";

interface MessageProps {
  senderName: string;
  senderId: string;
  timeSent: Date;
  content: string;
  lastMessageRef: MutableRefObject<HTMLDivElement>;
}
export function MessageComponent({
  senderName,
  senderId,
  timeSent,
  content,
  lastMessageRef,
}: MessageProps) {
  const time = () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (
      today.getFullYear() === timeSent.getFullYear() &&
      today.getMonth() === timeSent.getMonth() &&
      today.getDate() === timeSent.getDate()
    ) {
      return (
        "Today at " +
        timeSent.toLocaleTimeString("en-nz", {
          hour: "numeric",
          minute: "2-digit",
        })
      );
    } else if (
      today.getFullYear() === timeSent.getFullYear() &&
      yesterday.getMonth() === timeSent.getMonth() &&
      yesterday.getDate() === timeSent.getDate()
    ) {
      return (
        "Yesterday at " +
        timeSent.toLocaleTimeString("en-nz", {
          hour: "numeric",
          minute: "2-digit",
        })
      );
    } else {
      return (
        timeSent.toLocaleDateString("en-nz") +
        " " +
        timeSent.toLocaleTimeString("en-nz", {
          hour: "numeric",
          minute: "2-digit",
        })
      );
    }
  };

  return (
    <div
      className="flex flex-row gap-3 m-3 active:border-0"
      tabIndex={0}
      ref={lastMessageRef}
      key={timeSent.getTime()}
    >
      <img
        key={Date.now()}
        src={`${process.env.REACT_APP_API_URL}/api/users/${senderId}/profilePicture`}
        className="h-10 w-10 rounded-full object-cover"
        alt="Sender Profile"
        onError={(event) => {
          // @ts-ignore
          event.target.src = defaultProfilePic;
        }}
      />
      <div className="flex flex-col">
        <div className="flex flow-row gap-3 items-end">
          <div className="font-semibold">{senderName}</div>
          <div className="text-sm text-gray-400">{time()}</div>
        </div>
        <div className="grow max-w-full">{content}</div>
      </div>
    </div>
  );
}
