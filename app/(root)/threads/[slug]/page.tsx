import ChatComponent from "@/components/Chat";

const page = async ({ params }: { params: { slug: string } }) => {
  const { slug } = await params;
  return (
    <div>
      <ChatComponent />
    </div>
  );
};

export default page;
