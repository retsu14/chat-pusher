"use client";
import Image from "next/image";
import Login from "./Login";

const Banner = () => {
  return (
    <div className="flex flex-col items-center lg:flex-row my-[90px] ">
      <div className="w-full max-w-[540px] flex flex-col items-center lg:items-baseline justify-center">
        <div className="text-blue-500 text-[40px]  md:text-[50px] text-center lg:text-start lg:text-[80px] font-bold leading-12 lg:leading-[90px]">
          A place for meaningful conversations
        </div>
        <p className="text-center lg:text-start my-[18px] text-gray-400 text-[18px]">
          Messenger helps you connect with your Facebook friends and family,
          build your community, and deepen your interests.
        </p>

        <Login />
      </div>
      <div className="flex justify-center mt-[90px] lg:mt-0">
        <Image
          src={"/vector.png"}
          width={568}
          height={824}
          alt="Banner Image"
          className="w-[568px] h-[824px] object-contain"
        />
      </div>
    </div>
  );
};

export default Banner;
