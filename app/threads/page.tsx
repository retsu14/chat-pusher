const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#171717] text-center px-4">
      <h1 className="text-[clamp(2rem,4vw+1rem,5rem)] font-bold text-white leading-tight">
        Welcome to <span className="text-blue-500">Messenger Clone</span>
      </h1>

      <p className="mt-4 text-[clamp(1rem,2vw+0.5rem,1.5rem)] text-gray-300 max-w-xl">
        A place for meaningful conversations, built by Elieser N. Tajanlangit in
        with Next.js, Tailwind CSS, Express, Neon, PostgreSQL, and PusherJS. 🚀
      </p>
    </div>
  );
};

export default Page;
