"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Hamburger from "./icons/Hamburger";
import CloseIcon from "./icons/CloseIcon";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const nav = [
    { name: "Features", href: "/features" },
    { name: "Privacy and Safety", href: "/privacy-and-safety" },
    { name: "Desktop App", href: "/desktop-app" },
    { name: "For Developers", href: "/for-developers" },
    { name: "Help Center", href: "/help-center" },
  ];
  return (
    <header className="h-[100px] flex items-center justify-between sticky  top-0 z-[50] bg-[#171717] px-[30px] w-full lg:max-w-[1200px] m-auto">
      <Image
        src={"/messenger.png"}
        width={40}
        height={40}
        alt="Messenger Logo"
        priority
      />
      <nav className="text-white text-[15px] font-bold">
        <div className="hidden lg:flex items-center gap-[30px] lg:gap-[50px]">
          {nav.map((item, index) => (
            <Link href={item.href} key={index}>
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      <button
        className="block lg:hidden text-white"
        onClick={() => setOpen(!open)}
        aria-label="Toggle Menu"
      >
        {open ? (
          <CloseIcon className="fill-white w-[40px] h-[23px] " />
        ) : (
          <Hamburger className="fill-white w-[40px] h-[23px]" />
        )}
      </button>

      {open && (
        <div className="absolute top-[100px] left-0 px-[30px] flex flex-col justify-between text-[30px]  w-full bg-[#171717] h-[calc(100vh-100px)]">
          {nav.map((item, index) => (
            <Link
              href={item.href}
              className={`border-b-[1px] py-[30px] border-b-white ${
                index === 0 ? "border-t-[1px]" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
