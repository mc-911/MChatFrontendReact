import React, { useState } from "react";
import DoorOpen from "../assets/door-slighty-open.svg";
import DoorClosed from "../assets/door-closed.svg";
import OutlineHammer from "../assets/hammer solid dark.svg";
import OutlineWrench from "../assets/wrench solid dark.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";
import { CreateChat } from "./CreateChat";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export enum AddChatSection {
    OptionSelect,
    CreateChat,
    JoinChat
}

function JoinChat(props: {
    setAddChatSection: React.Dispatch<React.SetStateAction<AddChatSection>>, setShowModal: React.Dispatch<React.SetStateAction<Boolean>>, setChats: React.Dispatch<React.SetStateAction<{
        name: string;
        id: string;
    }[]>>
}) {
    const [inviteCode, setInviteCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('')
    const navigate = useNavigate()
    const sendJoinChatRequest = () => {
        axios.post(`${process.env.REACT_APP_API_URL}/api/chat/join`, { inviteCode: inviteCode }).then((response) => {
            props.setChats((prevChats) => [...prevChats, response.data])
            props.setShowModal(false)
            props.setAddChatSection(AddChatSection.OptionSelect)
            navigate(`/home/chat/${response.data.id}`)
        }).catch((error) => {
            console.log(error)
            if (error.response?.data.error) {
                setErrorMessage(error.response.data.error)
            }
        })
    }
    return <div className="h-full w-full flex flex-col justify-between">
        <div className="flex flex-col gap-2">
            <div className="flex flex-col  gap-3 text-gray-100">
                <div>Invite Code</div>
                <div>
                    <div className=" h-12 sm:h-8 relative ">
                        <input
                            className="rounded-md dark:bg-gray-800 w-full h-11 md:h-8 pl-3 text-"
                            type="text"
                            placeholder="Enter Invite Code"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                        />
                        <FontAwesomeIcon
                            size="xl"
                            icon={icon({ name: "xmark" })}
                            className={`absolute md:inset-y-1 right-3 md:right-2 inset-y-2 text-slate-400 cursor-pointer  h-7 md:h-6 ${inviteCode.length ? "" : "hidden"}`}
                            onClick={() => setInviteCode("")}
                        />
                    </div>
                </div>
            </div>
            {errorMessage && <div className="text-sm text-gray-300">{errorMessage}</div>}
        </div>

        <div className="flex flex-row justify-between ">
            <div className="bg-gray-800  h-9 w-14 text-center flex flex-row items-center justify-center rounded-md cursor-pointer" onClick={() => props.setAddChatSection(AddChatSection.OptionSelect)}><div>Back</div></div>
            <div className="bg-gray-800  h-9 w-14 text-center flex flex-row items-center justify-center rounded-md cursor-pointer" onClick={() => sendJoinChatRequest()}><div>Join</div></div>
        </div>
    </div>
}
export function AddChat({ showModal, setShowModal, setChats }: {
    showModal: Boolean, setShowModal: React.Dispatch<React.SetStateAction<Boolean>>, setChats: React.Dispatch<React.SetStateAction<{
        name: string;
        id: string;
    }[]>>;
}) {
    const [chatSection, setChatSection] = useState<AddChatSection>(AddChatSection.OptionSelect);
    console.log({ showModal })

    const AddChatSelection = () => {
        return <div className="flex flex-col md:flex-row w-full h-full gap-8">
            <div className="flex md:hidden flex-row w-full">
                <FontAwesomeIcon
                    onClick={() => setShowModal(false)}
                    size="2xl"
                    icon={icon({ name: "arrow-left" })}
                    className="text-gray-400 hover:text-gray-100 md:hidden active:text-gray-50  cursor-pointer"
                />
            </div>
            <div className="gap-2 grow flex flex-col md:flex-row w-full ">
                <div className="border-white bg-gray-800 grow relative group flex flex-col  cursor-pointer basis-1/2" onClick={(e) => {
                    setChatSection(AddChatSection.CreateChat)
                }}>
                    <div className="text-center text-lg my-2 ">Create</div>
                    <div className="text-center text-sm text-gray-400">Make your own group chat</div>
                    <div className="relative grow">
                        <img alt="wrench" src={OutlineWrench} className="h-3/5 absolute right-0 left-0 top-0 bottom-0 m-auto -rotate-45 group-hover:-rotate-[35deg]" />
                        <img alt="hammer" src={OutlineHammer} className="h-[50%] absolute right-0 left-0 m-auto top-0 bottom-0 rotate-45 group-hover:rotate-[35deg]" />
                    </div>
                </div>
                <div className="border-white group bg-gray-800 grow relative hover:visible  flex flex-col cursor-pointer basis-1/2" onClick={(e) => {
                    setChatSection(AddChatSection.JoinChat)
                }}>
                    <div className="text-center text-lg my-2">Join</div>
                    <div className="text-center text-sm text-gray-400">Join an existing group chat</div>
                    <div className="relative grow">
                        <img alt="close door" src={DoorClosed} className="absolute h-3/6 left-0 right-0 top-0 bottom-0 m-auto group-hover:invisible" />
                        <img alt="open door" src={DoorOpen} className="absolute h-[60%] left-0 right-0 top-1/4 mx-auto invisible group-hover:visible" />
                    </div>
                </div>
            </div>
        </div>;
    };
    const AddChatContent = () => {
        switch (chatSection) {
            case (AddChatSection.OptionSelect):
                return <AddChatSelection />;
            case (AddChatSection.CreateChat):
                return <CreateChat setAddChatSection={setChatSection} setChats={setChats} setShowModal={setShowModal} />;
            case (AddChatSection.JoinChat):
                return <JoinChat setAddChatSection={setChatSection} setChats={setChats} setShowModal={setShowModal} />;
            default:
                return AddChatSelection();
        }
    };
    return (<>
        <div className={`absolute bg-black h-screen w-screen top-0 bottom-0 right-0 left-0 m-auto z-20 bg-opacity-50 ${showModal ? '' : 'hidden'} flex flex-row justify-center items-center`} onClick={() => { setShowModal(false); setChatSection(AddChatSection.OptionSelect) }}>
        </div>
        <div className={`absolute h-full w-full md:h-3/4 md:w-1/2 md:max-w-[50rem] md:max-h-[50rem] md:min-w-[40rem] p-8 top-0 bottom-0 right-0 left-0 m-auto z-30 dark:bg-gray-900 dark:text-gray-200 ${showModal ? '' : 'hidden'}`} >
            <AddChatContent />
        </div>
    </>);
}
