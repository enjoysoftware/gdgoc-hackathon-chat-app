"use client";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Send, Smile, Plus, AtSign, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
interface MessageInputProps {
  channelId: string;

  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onAfterSend?: () => void;
  onAnalyzeQuestion?: (draftMessage: string) => void;
}

export default function MessageInput({
  channelId,
  value,
  onChange,
  onAnalyze,
  isAnalyzing,
  onAfterSend,
  onAnalyzeQuestion
}: MessageInputProps) {


  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() === "" || !user) return;

    await addDoc(collection(db, "channels", channelId, "messages"), {
      text: value,
      senderId: user.uid,
      senderName: user.displayName || "Anonymous",
      senderAvatar: user.photoURL || "",
      timestamp: serverTimestamp(),
    });

    onChange("");
    onAfterSend?.();
  };

  return (
    <div className="px-6 pb-6">
      <form
        onSubmit={handleSendMessage}
        className="bg-[#1e2f4d] border border-gray-700 rounded-lg overflow-hidden flex flex-col"
      >
        <div className="flex-1 p-3">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
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
//グラフ表示機能の呼び出し,どちらを使うかは要相談
//コメントアウトする方で機能が変わります
//----------↓↓文章分析の実装-----------
              onClick={onAnalyze}
              disabled={!user || !value.trim() || isAnalyzing}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-colors"

//----------↓グラフ表示の実装-----------
              // onClick={() => onAnalyzeQuestion?.(value)}
              // disabled={!value.trim()}
              // className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-colors"
//-----------------
            >
              <Sparkles size={14} /> 質問を分析
            </button>
          </div>
          <button
            type="submit"
            disabled={!value.trim() || !user}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-md transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
