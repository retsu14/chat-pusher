const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#171717] text-white">
      <main className="grow text-white w-full max-w-[1200px] lg:m-auto px-[30px]">
        {children}
      </main>
    </div>
  );
};

export default layout;
