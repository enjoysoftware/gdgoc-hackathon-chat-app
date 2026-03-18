"use client";

import { useRouter } from "next/navigation";
import { Hash, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Channel {
  id: string;
  name: string;
}

interface SidebarProps {
  channelId: string;
  channels: Channel[];
}

export default function Sidebar({ channelId, channels }: SidebarProps) {
  const router = useRouter();
  const { user, logout, loginWithGoogle } = useAuth();

  return (
    <div className="w-64 bg-[#111d33] border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">E</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">エンジニア開発チーム</h2>
            <p className="text-[10px] text-gray-500">Engineering Team</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-6">
          <h3 className="text-[10px] uppercase font-bold text-gray-500 mb-2">チャンネル</h3>
          <ul className="space-y-1">
            {channels.map((ch) => (
              <li
                key={ch.id}
                onClick={() => router.push(`/${ch.id}`)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                  channelId === ch.id
                    ? "bg-[#1e2f4d] text-blue-400 font-medium"
                    : "text-gray-400 hover:bg-gray-800"
                }`}
              >
                <Hash size={14} /> <span className="text-sm">{ch.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-4">
          <h3 className="text-[10px] uppercase font-bold text-gray-500 mb-2">ダイレクトメッセージ</h3>
          <ul className="space-y-1">
            <li className="flex items-center gap-2 px-2 py-1.5 rounded text-gray-400 hover:bg-gray-800 cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">佐藤 (AIリード)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* User Status or Login Button */}
      <div className="p-4 bg-[#0e172a] border-t border-gray-800 flex flex-col gap-3">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-gray-700">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-blue-800 font-bold">
                    {user.displayName?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-white truncate w-24">
                  {user.displayName}
                </p>
                <p className="text-[10px] text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  オンライン
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Settings size={14} className="text-gray-500 cursor-pointer hover:text-white" />
              <button onClick={logout} title="ログアウト">
                <LogOut size={14} className="text-gray-500 cursor-pointer hover:text-red-400 transition-colors" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 text-sm transition-colors"
          >
            Googleでログイン
          </button>
        )}
      </div>
    </div>
  );
}
