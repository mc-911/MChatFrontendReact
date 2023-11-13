import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
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
}

function MessageInputComponent({ placeholder }: MessageInputComponent) {
  return (
    <div className="MessageInputComponent">
      <input type="text" placeholder={placeholder} />
    </div>
  );
}
interface MessageProps {
  senderName: string;
  senderIcon: string;
  timeSent: string;
  content: string;
}
type Message = {
  senderName: string;
  senderIcon: string;
  timeSent: string;
  content: string;
};
function Message({ senderName, senderIcon, timeSent, content }: MessageProps) {
  return (
    <div className="message">
      <img src={senderIcon} className="senderIcon" />
      <div className="chatHeaderAndContent">
        <div className="senderNameTimeSentSection">
          <div className="senderName">{senderName}</div>
          <div className="timeTime">{timeSent}</div>
        </div>
        <div className="content">{content}</div>
      </div>
    </div>
  );
}
function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [chatName, setChatName] = useState("Literally him");
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login();
  };

  const login = () => {
    console.log(`${process.env.REACT_APP_API_URL}/api/login`);
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/login`, {
        email: email,
        password: password,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        setErrorMessage("Your Email or Password is incorrect");
      });
  };
  return (
    <div className="homeScaffold">
      <div className="friendsSection">
        <div style={{ textAlign: "center" }}>Chats</div>
        <FriendsSectionItem name="Literally Him" profilePic={testImage} />
      </div>
      <div className="chatSection">
        <ChatHeader name="Literally him" profilePic={testImage} />
        <div className="chatContent">
          <Message
            senderName={"Literally me"}
            senderIcon={testImage}
            timeSent="13/11/2023 9:36 PM"
            content={testMessage}
          />
          <Message
            senderName={"Literally me"}
            senderIcon={testImage}
            timeSent="13/11/2023 9:36 PM"
            content={testMessage}
          />
          <Message
            senderName={"Literally me"}
            senderIcon={testImage}
            timeSent="13/11/2023 9:36 PM"
            content={testMessage}
          />
          <Message
            senderName={"Literally me"}
            senderIcon={testImage}
            timeSent="13/11/2023 9:36 PM"
            content={testMessage}
          />
          <Message
            senderName={"Literally me"}
            senderIcon={testImage}
            timeSent="13/11/2023 9:36 PM"
            content={testMessage}
          />
          <Message
            senderName={"Literally me"}
            senderIcon={testImage}
            timeSent="13/11/2023 9:36 PM"
            content={testMessage}
          />
        </div>
        <MessageInputComponent placeholder={`Message ${chatName}`} />
      </div>
    </div>
  );
}

export default Home;
