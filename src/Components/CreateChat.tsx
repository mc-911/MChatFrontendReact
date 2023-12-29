import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Friend } from "./FriendsPage";
import { AddChatSection } from "./AddChat";
import useUserInfo from "./useIsAuth";
import defaultProfilePic from "../assets/default_image.jpg";

function MemberDropdownItem(props: { userId: string, username: string, addMemberFunc: (userId: string, username: string) => void, removeMemberFunc: (userId: string) => void, selectedMembers: { userId: string, username: string }[] }) {
    const [added, setAdded] = useState(false);
    useEffect(() => {
        setAdded(props.selectedMembers.find((member) => member.userId === props.userId) !== undefined)
    }, [props.selectedMembers])
    return <div className="justify-between flex flex-row h-8 items-center rounded-md pr-1" key={props.userId}>
        <div className="flex flex-row gap-2 pl-1 items-center h-full">
            <img
                src={`${process.env.REACT_APP_API_URL}/api/user/${props.userId}/profilePicture`}
                alt="Uh Oh"
                className="w-8 h-8 object-cover rounded-full"
                onError={(event) => {
                    // @ts-ignore
                    event.target.src = defaultProfilePic;
                }} />
            <div className="friendsSectionItemName">{props.username}</div>
        </div>
        <div className="flex flex-col justify-center items-center cursor-pointer" onClick={() => {
            setAdded(!added)
            added ? props.removeMemberFunc(props.userId) : props.addMemberFunc(props.userId, props.username)
        }}>
            {(() => {
                if (added) {
                    return <FontAwesomeIcon
                        size="xl"
                        icon={icon({ name: "check" })}
                        className="text-green-900" />;
                }
                else {
                    return <FontAwesomeIcon
                        size="xl"
                        icon={icon({ name: "plus" })}
                        className="text-gray-500" />;
                }
            })()}
        </div>
    </div>;
}

function SelectedMember(props: { userId: string; username: string; removeMemberFunc: (userId: string) => void }) {
    return <div className="justify-between flex flex-row h-8 items-center rounded-md pl-1 pr-2 min-w-0" key={props.userId}>
        <div className="flex flex-row gap-2 pl-1 items-center h-full">
            <img
                src={`${process.env.REACT_APP_API_URL}/api/user/${props.userId}/profilePicture`}
                alt="Uh Oh"
                className="w-8 h-8 object-cover rounded-full"
                onError={(event) => {
                    // @ts-ignore
                    event.target.src = defaultProfilePic;
                }} />
            <div className="friendsSectionItemName">{props.username}</div>
        </div>
        <div className="flex flex-col justify-center items-center cursor-pointer" onClick={() => {
            props.removeMemberFunc(props.userId);
        }}>
            <FontAwesomeIcon
                size="xl"
                icon={icon({ name: "xmark" })}
                className="text-red-700" />
        </div>
    </div>;

}
export function CreateChat(props: {
    setAddChatSection: React.Dispatch<React.SetStateAction<AddChatSection>>, setShowModal: React.Dispatch<React.SetStateAction<Boolean>>, setChats: React.Dispatch<React.SetStateAction<{
        name: string;
        id: string;
    }[]>>
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [chatName, setChatName] = useState("");
    const [showResults, setShowResults] = useState(false);
    const { userInfo } = useUserInfo()
    const [selectedChatMembers, setSelectedChatMembers] = useState<{ userId: string, username: string }[]>([])
    const [friends, setFriends] = useState<Friend[]>([])
    const resultsRef = useRef<HTMLDivElement>(null)
    const inputContainerRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate();

    const addSelectedChatMember = (userId: string, username: string) => {
        setSelectedChatMembers((prevSelectedChatMembers) => [...prevSelectedChatMembers, { userId, username }])
    }
    const removeSelectedChatMember = (userId: string) => {
        setSelectedChatMembers(selectedChatMembers.filter((member) => member.userId !== userId))
        console.log(userId)
        console.log(selectedChatMembers)
    }

    function handleMouseClick(event: MouseEvent) {
        if (showResults && inputContainerRef.current && !inputContainerRef.current?.contains(event.target as Node)) {
            setShowResults(false);
        }
    }
    document.addEventListener('mousedown', handleMouseClick);
    useEffect(() => {
        getFriends()
    }, [])
    function Friends() {
        return friends.filter((friend) => friend.username.toLowerCase().includes(searchQuery.toLowerCase())).map((friend) => {
            return <MemberDropdownItem selectedMembers={selectedChatMembers} userId={friend.user_id} username={friend.username} addMemberFunc={addSelectedChatMember} removeMemberFunc={removeSelectedChatMember} />
        })
    }

    const getFriends = async () => {
        await axios
            .get(
                `${process.env.REACT_APP_API_URL}/api/user/${userInfo.userId}/friends`
            )
            .then((response) => {
                const friends: Friend[] = response.data.friends;
                setFriends(friends);
                console.log(friends, "hello");
            })
            .catch((error) => { });
    };
    const createChat = async () => {
        axios.post(`${process.env.REACT_APP_API_URL}/api/chat`, { userId: userInfo.userId, name: chatName, memberIds: selectedChatMembers.map((member) => member.userId) }).then((res) => {
            props.setChats((prevChats) => [...prevChats, { id: res.data.chatId, name: res.data.name }])
            props.setAddChatSection(AddChatSection.OptionSelect)
            props.setShowModal(false);
        }).catch((error) => console.log(error))
    }
    const SelectedMembers = () => {
        return selectedChatMembers.map((member) => {
            return <SelectedMember username={member.username} userId={member.userId} removeMemberFunc={removeSelectedChatMember} />
        })
    }
    return <div className="flex flex-col h-full gap-6">
        <div className="flex flex-col gap-2">

            <div>Chat Name</div>
            <input type="text"
                className="rounded-md dark:bg-gray-800 w-full h-11 md:h-8 pl-3 "
                value={chatName}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setChatName(event.target.value)
                }
            />
        </div>
        <div className="flex flex-col gap-2">
            <div>Members</div>
            <div className="flex flex-col gap-7">

                <div className="relative group focus-within:visible gap grow" onFocus={() => setShowResults(true)} ref={inputContainerRef}>
                    <input type="text"
                        className="rounded-md dark:bg-gray-800 w-full h-11 md:h-8 pl-3 focus:border-0 outline-none focus:rounded-b-none"
                        placeholder="Add Members"
                        value={searchQuery}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            setSearchQuery(event.target.value)
                        }
                    />
                    <FontAwesomeIcon
                        size="xl"
                        icon={icon({ name: "chevron-up" })}
                        className={`absolute md:inset-y-1 right-3 md:right-2 inset-y-2 text-gray-400 cursor-pointer  h-7 md:h-6 ${showResults ? "" : "hidden"}`}
                        onClick={() => setShowResults(false)}
                    />
                    <FontAwesomeIcon
                        size="xl"
                        icon={icon({ name: "chevron-down" })}
                        className={`absolute md:inset-y-1 right-3 md:right-2 inset-y-2 text-gray-400 cursor-pointer  h-7 md:h-6 ${!showResults ? "" : "hidden"}`}
                        onClick={() => setShowResults(true)}
                    />
                    <div ref={resultsRef} className={`absolute w-full flex flex-col gap-2 bg-gray-800 p-1 ${showResults ? '' : 'hidden'} group-focus:text-lg overflow-y-auto max-h-56`} >
                        {Friends()}
                    </div>
                </div>
            </div>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto shrink grow">
            {SelectedMembers()}
        </div>
        <div className="flex flex-row justify-between ">
            <div className="bg-gray-800  h-9 w-14 text-center flex flex-row items-center justify-center rounded-md cursor-pointer" onClick={() => props.setAddChatSection(AddChatSection.OptionSelect)}><div>Back</div></div>
            <div className="bg-gray-800  h-9 w-14 text-center flex flex-row items-center justify-center rounded-md cursor-pointer" onClick={() => createChat()}><div>Create</div></div>
        </div>
    </div>;
}
