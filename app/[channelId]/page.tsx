import Chat from "@/components/Chat";

interface PageProps {
  params: Promise<{
    channelId: string;
  }>;
}

export default async function ChannelPage({ params }: PageProps) {
  const { channelId } = await params;
  
  return (
    <main>
      <Chat channelId={channelId} />
    </main>
  );
}
