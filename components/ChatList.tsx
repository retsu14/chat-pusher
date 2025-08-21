"use client";
import { useState } from "react";
import EditIcon from "./icons/EditIcon";
import ClearIcon from "./icons/ClearIcon";
import SearchIcon from "./icons/SearchIcon";
import Image from "next/image";

const ChatList = () => {
  const [query, setQuery] = useState("");

  const profiles = [
    {
      id: 1,
      profilePicture: "/profile.png",
      name: "Rod Tajanlangit",
      lastMessage: "HAHAHA",
    },
    {
      id: 2,

      profilePicture: "/profile.png",
      name: "Elieser Tajanlangit",
      lastMessage: "You: hehehe",
    },
    {
      id: 3,
      profilePicture: "/profile.png",
      name: "Mark Jamandre",
      lastMessage: "sge okay",
    },
  ];
  return (
    <div className="bg-[#1f1f1f] shadow-md rounded-xl h-[calc(100vh-40px)] w-full max-w-[420px] px-[16px] py-[10px]">
      <div className="flex items-center justify-between">
        <h3 className="text-[24px] font-[750]">Chats</h3>
        <div className="bg-[#3b3c3d] p-[8px] rounded-full">
          <EditIcon />
        </div>
      </div>
      <div className="mt-[20px] relative w-full">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </span>
        <input
          type="search"
          placeholder="Search Messenger"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full bg-[#3b3c3d] pl-10 pr-10 py-2 focus:outline-none text-white placeholder:text-[15px]"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-0 flex items-center mr-3 rounded-full "
          >
            <ClearIcon />
          </button>
        )}
      </div>

      {/* list component of the messenger accounts */}
      <div className="mt-[20px] mx-[-9px]">
        {profiles.map((profile, index) => (
          <div
            key={index}
            className={`flex items-center space-x-3 py-2 px-[10px] ${
              index === 0 ? "bg-[#3b3c3d] px-[-10px] rounded-lg" : ""
            }`}
          >
            <Image
              src={profile.profilePicture}
              width={50}
              height={50}
              alt={profile.name}
              className="w-[50px] h-[50px] rounded-full object-cover"
            />
            <div>
              <h4 className="text-white font-semibold text-[15px]">
                {profile.name}
              </h4>
              <p className="text-gray-400 text-[13px]">{profile.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
