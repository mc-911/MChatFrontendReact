import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
import { HomeOutletContext } from "./home";
import { Link, Outlet, useLocation, useOutletContext } from "react-router-dom";


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

export interface FriendsPageOutletContext {
  refreshFriendsFunc: () => Promise<void>;
  friends: Friend[];
  jwt: string
}
function FriendsPage() {
  const { friends, refreshFriendsFunc, setSidebarActive, jwt } = useOutletContext<HomeOutletContext>();
  const location = useLocation();
  return (
    <div className="flex flex-col h-full">

      <div className="flex flex-row flex-nowrap gap-3 items-center py-3 px-4">
        <div className="flex flex-row items-center">
          <FontAwesomeIcon
            onClick={() => setSidebarActive(true)}
            size="2xl"
            icon={icon({ name: "arrow-left" })}
            className="text-gray-400 hover:text-gray-100 md:hidden active:text-gray-50   mr-2"
          />
          <div className="flex flex-row flex-nowrap  p-2  items-center gap-3 ">
            <FontAwesomeIcon size="xl" icon={icon({ name: "user-group" })} />
            <div>Friends</div>
          </div>
        </div>
        <div className="flex flex-row items-center grow justify-between">
          <div className="flex flex-row gap-3">
            <Link to="/home/friends/all"
              className={`hover:bg-slate-50/50 active:text-gray-50 px-3 p-0.5 rounded-md select-none ${location.pathname === "/home/friends/all"
                ? "bg-slate-50/50 text-gray-50"
                : ""
                }`}
            >
              All
            </Link>
            <Link to="/home/friends/pending"
              className={`hover:bg-slate-50/50 active:text-gray-50 px-3 p-0.5 select-none rounded-md ${location.pathname === "/home/friends/pending"
                ? "bg-slate-50/50 text-gray-50"
                : ""
                }`}
            >
              Pending
            </Link>
          </div>
          <Link to="/home/friends/pending" className="bg-slate-300 text-gray-950 font-semibold p-3 rounded-md text-xs">Add Friend</Link>
        </div>
      </div>
      <div className="grow rounded-md bg-secondary flex">
        <Outlet context={{ friends, refreshFriendsFunc, jwt } satisfies FriendsPageOutletContext} />
      </div>
    </div>
  );
}

export default FriendsPage;
