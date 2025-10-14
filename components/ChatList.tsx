"use client";

import { useState, useEffect } from "react";
import EditIcon from "./icons/EditIcon";
import ClearIcon from "./icons/ClearIcon";
import SearchIcon from "./icons/SearchIcon";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

const ChatList = () => {
  const pathname = usePathname();
  const activeId = pathname.split("/threads/")[1];
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${API}/api/message/conversations`, {
          withCredentials: true,
        });
        setConversations(res.data?.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/auth/search`, {
          params: { username: query },
          withCredentials: true,
        });
        setSearchResults(res.data || []);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API}/api/auth/logout`,
        {},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const normalizeToArray = (data: any) => {
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const displayedList = query.trim()
    ? normalizeToArray(searchResults.users)
    : normalizeToArray(conversations);

  console.log("displayedList", searchResults);

  return (
    <div className="bg-[#1f1f1f] shadow-md rounded-xl h-[calc(100vh-40px)] min-h-[800px] w-full flex flex-col max-w-[420px] px-[16px] py-[10px]">
      <div className="flex items-center justify-between">
        <h3 className="text-[24px] font-[750]">Chats</h3>
        <div className="bg-[#3b3c3d] p-[8px] rounded-full cursor-pointer">
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
            className="absolute inset-y-0 right-0 flex items-center mr-3 rounded-full"
          >
            <ClearIcon />
          </button>
        )}
      </div>

      <div className="mt-[20px] mx-[-9px] flex-1 overflow-y-auto custom-scroll">
        {loading ? (
          <p className="text-gray-400 text-center mt-4">Searching...</p>
        ) : displayedList.length === 0 ? (
          <p className="text-gray-400 text-center mt-4">
            {query ? "No users found" : "No conversations yet"}
          </p>
        ) : (
          displayedList?.map((profile, index) => (
            <Link
              href={`/threads/${profile.id}`}
              key={profile.id}
              className={`flex items-center space-x-3 py-2 px-[10px] hover:bg-[#3b3c3d] rounded-lg transition ${
                activeId === profile.id ? "bg-[#3b3c3d]" : ""
              }`}
            >
              <Image
                src={profile?.avatar ?? "/profile.png"}
                width={50}
                height={50}
                alt={profile.username}
                className="w-[50px] h-[50px] rounded-full object-cover"
              />
              <div className="flex flex-col justify-center">
                <h4 className="text-white font-semibold text-[15px]">
                  {profile.username}
                </h4>
                {profile.lastMessage && (
                  <p className="text-gray-400 text-[13px] line-clamp-1">
                    {profile.lastMessage}
                  </p>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      <button
        onClick={handleLogout}
        className="bg-blue-500 py-3 rounded-md cursor-pointer flex items-center justify-center font-bold gap-2 mt-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
          />
        </svg>
        Logout
      </button>
    </div>
  );
};

export default ChatList;
