import axios from "axios";
import useUserInfo from "./useIsAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
import { useEffect, useState } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { useOutletContext } from "react-router-dom";
import { PrivateOutletContext } from "./protectedRoute";
import { PendingRequest } from "./FriendsPage";

export function PendingRequests({
  refreshFriendsFunc,
}: {
  refreshFriendsFunc: () => Promise<void>;
}) {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const { userInfo } = useUserInfo();
  const [friendRequestConnection, setFriendRequestConnection] =
    useState<HubConnection>();
  const { jwt } = useOutletContext<PrivateOutletContext>();

  const getPendingRequests = () => {
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/api/users/${userInfo.userId}/friend_request`
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
    console.log("Connecting");
    let connection = new HubConnectionBuilder()
      .withUrl(`${process.env.REACT_APP_WEBSOCKETS_URL}/notification`, {
        accessTokenFactory() {
          return jwt;
        },
      })
      .configureLogging(LogLevel.Information)
      .build();
    await connection
      .start()
      .then(() =>
        connection.invoke("GoOnline", {
          Username: userInfo.username,
          ChatId: "0",
          UserId: userInfo.userId,
        })
      )
      .catch((error) => {
        console.log(error);
      });
    connection.on("ReceiveFriendRequest", receiveFriendRequest);
    connection.on("BeNotifiedOfAcception", (friend_request_id: string) => {
      refreshFriendsFunc();
      setRequests(
        requests.filter(
          (request) => request.friend_request_id !== friend_request_id
        )
      );
    });
    connection.on("BeNotifiedOfDenial", (friend_request_id: string) => {
      setRequests(
        requests.filter(
          (request) => request.friend_request_id !== friend_request_id
        )
      );
    });
    setFriendRequestConnection(connection);
  };
  const receiveFriendRequest = (
    friend_request_id: string,
    requested: string,
    user_id: string,
    username: string
  ) => {
    console.log({ friend_request_id, user_id, username, requested });
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
        `${process.env.REACT_APP_API_URL}/api/users/${userInfo.userId}/accept_request`,
        { request_id: friend_request_id }
      )
      .then((response) => {
        console.log("Request accepted refresh");
        getPendingRequests();
        refreshFriendsFunc();
        if (friendRequestConnection?.state === HubConnectionState.Connected) {
          friendRequestConnection?.invoke(
            "NotifyRequestAccepted",
            requester_id,
            friend_request_id
          );
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const denyRequest = (friend_request_id: string, requester_id: string) => {
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/api/users/${userInfo.userId}/deny_request`,
        { request_id: friend_request_id }
      )
      .then((response) => {
        console.log("Deny accepted refresh");
        if (friendRequestConnection?.state === HubConnectionState.Connected) {
          friendRequestConnection.invoke(
            "NotifyRequestDenied",
            requester_id,
            friend_request_id
          );
        }
        getPendingRequests();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const sendFriendRequest = (friend_email: string) => {
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/api/users/${userInfo.userId}/friend_request`,
        { friend_email }
      )
      .then((response) => {
        console.log("Request sent");
        setResponseMessage(`Sent request to ${response.data.username}`);
        getPendingRequests();
        setFriendEmail("");
        if (friendRequestConnection?.state === HubConnectionState.Connected) {
          friendRequestConnection?.invoke(
            "SendFriendRequest",
            response.data.friend_request_id,
            response.data.friend_id
          );
        }
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
    console.log(requests);
    return requests.map((request) => {
      return (
        <div className="flex flex-row ">
          <div className="flex flex-row gap-3 items-center m-3">
            <img
              src={`${process.env.REACT_APP_API_URL}/api/users/${request.user_id}/profilePicture`}
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
