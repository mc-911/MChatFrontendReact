import axios from "axios";
import useUserInfo from "./useIsAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FriendsPageOutletContext } from "./FriendsPage";
import defaultProfilePic from "../assets/default_image.jpg";
import { Link, useOutletContext } from "react-router-dom";

export function AllFriends() {
  const { userInfo } = useUserInfo();
  const { friends, refreshFriendsFunc } = useOutletContext<FriendsPageOutletContext>();

  const getFriends = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_API_URL}/api/user/${userInfo.userId}/friends`
      )
      .then((response) => {
        refreshFriendsFunc();
      })
      .catch((error) => { });
  };

  const removeFriend = (friend_id: string) => {
    axios
      .delete(
        `${process.env.REACT_APP_API_URL}/api/user/${userInfo.userId}/friends/${friend_id}`
      )
      .then(() => {
        console.log("Friend removed");
        getFriends();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const insertFriends = () => {
    return friends.map((friend) => {
      return (
        <div className="flex flex-row  " key={friend.username}>
          <div className="flex flex-row gap-3 items-center m-3">
            <img
              src={`${process.env.REACT_APP_API_URL}/api/user/${friend.user_id}/profilePicture`}
              alt="Uh Oh"
              className="w-8 h-8 object-cover rounded-full"
              onError={(event) => {
                // @ts-ignore
                event.target.src = defaultProfilePic;
              }}
            />
            <div>{friend.username}</div>{" "}
          </div>
          <div className="flex flex-row grow items-center justify-end gap-5 pr-5">
            <Link to={`/home/chat/${friend.chat_id}`}>
              <FontAwesomeIcon
                size="xl"
                icon={icon({ name: "message" })}
                className="text-gray-400 hover:text-gray-200 active:text-gray-50"
              />
            </Link>
            <FontAwesomeIcon
              onClick={() => removeFriend(friend.user_id)}
              size="xl"
              icon={icon({ name: "xmark-circle" })}
              className="text-gray-400 pb-1 hover:text-red-500 active:text-red-700"
            />
          </div>
        </div>
      );
    });
  };
  return (
    <>
      <div className="rounded-sm w-full m-1 bg-background">
        <div className="p-3">All friends - {friends.length}</div>
        {insertFriends()}
      </div>
    </>
  );
}
