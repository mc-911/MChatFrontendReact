import React, { useState } from "react";

export interface MessageInputComponentProps {
  placeholder: string;
  sendMessageFunc: (message: string) => void;
}

export function MessageInputComponent({
  placeholder,
  sendMessageFunc,
}: MessageInputComponentProps) {
  const [message, setMessage] = useState("");
  const onChangeMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };
  return (
    <div className="w-full flex flex-row items-center justify-center bg-secondary">
      <input
        className="flex-grow mx-6 mb-4 h-11 pl-4 rounded-md dark:bg-gray-800"
        type="text"
        placeholder={placeholder}
        value={message}
        onChange={onChangeMessage}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            sendMessageFunc(message);
          }
        }}
      />
    </div>
  );
}
