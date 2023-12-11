import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
import { ChatInfo, HomeOutletContext } from "./home";
import { useState } from "react";
import { AllFriends } from "./AllFriends";
import { PendingRequests } from "./PendingRequests";
import { useOutletContext } from "react-router-dom";

enum FriendsPageSection {
  AllFriends,
  PendingRequests,
}

export type Friend = {
  user_id: string;
  username: string;
  chat_id: string;
};

export type PendingRequest = {
  friend_request_id: string;
  user_id: string;
  username: string;
  requested: string;
};

function FriendsPage() {
  const { friends, refreshFriendsFunc, setSidebarActive } = useOutletContext<HomeOutletContext>();
  const [friendsPageSection, setFriendsPageSection] =
    useState<FriendsPageSection>(FriendsPageSection.AllFriends);
  const getCurrentSection = () => {
    switch (friendsPageSection) {
      case FriendsPageSection.AllFriends:
        return (
          <AllFriends
            friends={friends}
            refreshFriendsFunc={refreshFriendsFunc}
          />
        );
      case FriendsPageSection.PendingRequests:
        return <PendingRequests refreshFriendsFunc={refreshFriendsFunc} />;
    }
  };
  return (
    <>
      <div className="flex flex-row flex-nowrap gap-3 items-center py-3 px-4">
        <div className="flex flex-row items-center">
          <FontAwesomeIcon
            onClick={() => setSidebarActive(true)}
            size="2xl"
            icon={icon({ name: "arrow-left" })}
            className="text-gray-400 hover:text-gray-100 md:hidden active:text-gray-50   mr-2"
          />
          <div className="flex flex-row flex-nowrap  p-2  items-center gap-3 border-r-2 border-r-gray-400">
            <FontAwesomeIcon size="xl" icon={icon({ name: "user-group" })} />
            <div>Friends</div>
          </div>
        </div>
        <div className="flex flex-row items-center grow justify-between">
          <div className="flex flex-row gap-3">
            <div
              onClick={() =>
                setFriendsPageSection(FriendsPageSection.AllFriends)
              }
              className={`hover:bg-slate-50/50 active:text-gray-50 px-3 p-0.5 rounded-md select-none ${friendsPageSection === FriendsPageSection.AllFriends
                ? "bg-slate-50/50 text-gray-50"
                : ""
                }`}
            >
              All
            </div>
            <div
              onClick={() =>
                setFriendsPageSection(FriendsPageSection.PendingRequests)
              }
              className={`hover:bg-slate-50/50 active:text-gray-50 px-3 p-0.5 select-none rounded-md ${friendsPageSection === FriendsPageSection.PendingRequests
                ? "bg-slate-50/50 text-gray-50"
                : ""
                }`}
            >
              Pending
            </div>
          </div>
          <button
            className="bg-slate-300 text-gray-950 font-semibold p-3 rounded-md text-xs"
            onClick={() =>
              setFriendsPageSection(FriendsPageSection.PendingRequests)
            }
          >
            Add Friend
          </button>
        </div>
      </div>
      <div className="grow rounded-md bg-secondary flex">
        {getCurrentSection()}
      </div>
    </>
  );
}

export default FriendsPage;
