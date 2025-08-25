"use client";
import Link from "next/link";

const Footer = () => {
  const getYear = () => {
    return new Date().getFullYear();
  };

  const nav = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "Terms", href: "/terms" },
  ];
  return (
    <footer className="h-[90px] pb-[100px] lg:pb-0 lg:h-[127px] flex items-center flex-col lg:flex-row justify-center lg:justify-between px-[30px] max-w-[1200px] m-auto">
      <div className="text-white text-[15px] font-bold">
        © retsu {getYear()}.
      </div>
      <div className="pt-[50px] lg:pt-0 flex flex-wrap justify-center items-center gap-[20px] lg:gap-[30px] text-[13px]">
        {nav.map((item, index) => (
          <Link href={item.href} key={index} className="grow">
            {item.name}
          </Link>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
