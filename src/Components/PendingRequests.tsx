import axios from "axios";
import useUserInfo from "./useIsAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
import { useEffect, useState } from "react";

import { useOutletContext } from "react-router-dom";
import { FriendsPageOutletContext, PendingRequest } from "./FriendsPage";
import defaultProfilePic from "../assets/default_image.jpg";
export function PendingRequests() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const { userInfo } = useUserInfo();

  const { refreshFriendsFunc, jwt, socket } = useOutletContext<FriendsPageOutletContext>();

  const getPendingRequests = () => {
    axios
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
  useEffect(() => {
    getPendingRequests();
    connect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const connect = async () => {
    socket.emit("join request", jwt)
    if (!socket.hasListeners("receive friend request")) {
      socket.on("receive friend request", receiveFriendRequest);
    }
    if (!socket.hasListeners("friend request accepted")) {
      socket.on("friend request accepted", (friend_request_id: string) => {
        refreshFriendsFunc();
        setRequests(
          requests.filter(
            (request) => request.friend_request_id !== friend_request_id
          )
        );
      });
    }
    if (!socket.hasListeners("friend request denied")) {
      socket.on("friend request denied", (friend_request_id: string) => {
        setRequests(
          requests.filter(
            (request) => request.friend_request_id !== friend_request_id
          )
        );
      });
    }
  };
  const receiveFriendRequest = (
    friend_request_id: string,
    requested: string,
    user_id: string,
    username: string
  ) => {
    setRequests((prevRequests) => [
      ...prevRequests,
      {
        friend_request_id: friend_request_id,
        requested: requested,
        user_id: user_id,
        username: username,
      },
    ]);
  };
  const acceptRequest = (friend_request_id: string, requester_id: string) => {
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/api/user/${userInfo.userId}/accept_request`,
        { request_id: friend_request_id }
      )
      .then((response) => {
        console.log("Request accepted refresh");
        getPendingRequests();
        refreshFriendsFunc();
        socket.emit(
          "notify friend request accepted",
          requester_id,
          friend_request_id
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const denyRequest = (friend_request_id: string, requester_id: string) => {
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/api/user/${userInfo.userId}/deny_request`,
        { request_id: friend_request_id }
      )
      .then((response) => {
        console.log("Deny accepted refresh");
        socket.emit(
          "notify friend request denied",
          requester_id,
          friend_request_id
        );
        getPendingRequests();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const sendFriendRequest = (friend_email: string) => {
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/api/user/${userInfo.userId}/friend_request`,
        { friend_email }
      )
      .then((response) => {
        console.log("Request sent");
        setResponseMessage(`Sent request to ${response.data.username}`);
        getPendingRequests();
        setFriendEmail("");
        socket.emit(
          "send friend request",
          response.data.friend_request_id,
          response.data.user_id,
          jwt
        );
      })
      .catch((error) => {
        switch (error.response.status) {
          case 400:
            setResponseMessage("Invalid Format");
            break;
          case 404:
            setResponseMessage("No user found with that email address");
            break;
          case 403:
            setResponseMessage(error.response.data.error);
            break;
          default:
            setResponseMessage("Unknown error occurred");
            break;
        }
        console.log(error);
      });
  };
  const insertRequests = () => {
    return requests.map((request) => {
      return (
        <div className="flex flex-row ">
          <div className="flex flex-row gap-3 items-center m-3">
            <img
              src={`${process.env.REACT_APP_API_URL}/api/user/${request.user_id}/profilePicture`}
              alt="Uh Oh"
              className="w-8 rounded-full"
              onError={(event) => {
                // @ts-ignore
                event.target.src = defaultProfilePic;
              }}
            />
            <div>{request.username}</div>
          </div>
          <div className="flex flex-row grow items-center justify-end gap-5 pr-5">
            {request.requested === "false" ? (
              <FontAwesomeIcon
                onClick={() =>
                  acceptRequest(request.friend_request_id, request.user_id)
                }
                size="xl"
                icon={icon({ name: "check-circle" })}
                className="text-gray-400 hover:text-green-300 active:text-gray-50"
              />
            ) : (
              ""
            )}
            <FontAwesomeIcon
              onClick={() =>
                denyRequest(request.friend_request_id, request.user_id)
              }
              size="xl"
              icon={icon({ name: "xmark-circle" })}
              className="text-gray-400  hover:text-red-500 active:text-red-700"
            />
          </div>
        </div>
      );
    });
  };
  return (
    <>
      <div className="rounded-sm w-full m-1 bg-background flex flex-col gap-2">
        <div className="mx-3 relative">
          <input
            type="text"
            className="rounded-md dark:bg-gray-800 h-14 pl-3 mt-4 w-full min-w-min pr-3 max-sm:text-xs"
            placeholder="You can add friends with their email address"
            onChange={(e) => setFriendEmail(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                if (friendEmail.length > 0) {
                  sendFriendRequest(friendEmail);
                } else {
                  setResponseMessage("Please supply an email address");
                }
              }
            }}
          />
          <div className="mt-4">{responseMessage}</div>
          <button
            className="bg-secondary py-3 px-6 absolute right-2 top-5 rounded-md"
            onClick={() => {
              if (friendEmail.length > 0) {
                sendFriendRequest(friendEmail);
              } else {
                setResponseMessage("Please supply an email address");
              }
            }}
          >
            Send
          </button>
        </div>
        <div className="p-3">Pending Requests - {requests.length}</div>
        {insertRequests()}
      </div>
    </>
  );
}
