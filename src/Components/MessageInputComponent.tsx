import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
export interface MessageInputComponentProps {
  placeholder: string;
  sendMessageFunc: (message: string) => void;
  connecting: boolean
}

export function MessageInputComponent({
  placeholder,
  sendMessageFunc, connecting
}: MessageInputComponentProps) {
  const [message, setMessage] = useState("");
  const onChangeMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };
  return (

    <div className="w-full flex flex-row items-center justify-center bg-secondary relative">
      {!connecting && <input
        className="flex-grow mx-6 mb-4 h-11 pl-4 rounded-md dark:bg-gray-800"
        type="text"
        placeholder={placeholder}
        value={message}
        onChange={onChangeMessage}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !connecting) {
            sendMessageFunc(message);
          }
        }}
      />}
      {connecting && <div className="flex-grow mx-6 mb-4 h-11 pl-4 text-gray-500/95 rounded-md dark:bg-gray-800 flex flex-row items-center gap-5 select-none">          <FontAwesomeIcon icon={icon({ name: "spinner" })} spin={true} /><div>Connecting</div></div>}
    </div>
  );
}
