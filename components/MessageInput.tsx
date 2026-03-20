"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Send, Smile, Plus, AtSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MessageInputProps {
  channelId: string;
}

export default function MessageInput({ channelId }: MessageInputProps) {
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !user) return;

    await addDoc(collection(db, "channels", channelId, "messages"), {
      text: newMessage,
      senderId: user.uid,
      senderName: user.displayName || "Anonymous",
      senderAvatar: user.photoURL || "",
      timestamp: serverTimestamp(),
    });

    setNewMessage("");
  };

  return (
    <div className="p-6">
      <form
        onSubmit={handleSendMessage}
        className="bg-[#1e2f4d] border border-gray-700 rounded-lg overflow-hidden flex flex-col"
      >
        <div className="flex-1 p-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!user}
            placeholder={user ? `${channelId} にメッセージを送信...` : "ログインしてチャットに参加..."}
            className={`w-full bg-transparent outline-none resize-none text-sm text-gray-200 min-h-[60px] ${!user ? "cursor-not-allowed opacity-50" : ""}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && user && !e.nativeEvent.isComposing ) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
        </div>
        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-800">
          <div className="flex items-center gap-3 text-gray-400">
            <Plus size={18} className="cursor-pointer hover:text-white" />
            <Smile size={18} className="cursor-pointer hover:text-white" />
            <AtSign size={18} className="cursor-pointer hover:text-white" />
            <div className="h-4 w-[1px] bg-gray-700 mx-1"></div>
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} /> 質問を分析
            </button>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || !user}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-md transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
