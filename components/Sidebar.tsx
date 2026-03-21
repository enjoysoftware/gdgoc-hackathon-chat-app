"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Hash, Settings, LogOut, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Channel {
  id: string;
  name: string;
}

interface SidebarProps {
  channelId: string;
  channels: Channel[];
  onAddChannel?: (name: string) => void;
}

type UserStatus = "online" | "offline";

export default function Sidebar({ channelId, channels, onAddChannel }: SidebarProps) {
  const router = useRouter();
  const { user, profile, logout, loginWithGoogle, updateStatus } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  const status = profile?.status || "online";

  const handleStatusChange = async (newStatus: UserStatus) => {
    setIsMenuOpen(false);
    try {
      await updateStatus(newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <button
            onClick={() => setShowAddChannel(true)}
            className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer mb-2 font-bold transition-colors"
          >
            + チャンネルを追加
          </button>
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

      {/* Add Channel Modal */}
      {showAddChannel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1e2f4d] border border-gray-700 rounded-lg p-6 w-80 shadow-xl">
            <h3 className="text-white font-bold text-sm mb-4">チャンネルを追加</h3>
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="チャンネル名を入力"
              className="w-full bg-[#0b1426] text-white text-sm rounded-md py-2 px-3 outline-none border border-gray-600 focus:border-blue-500 mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && newChannelName.trim()) {
                  onAddChannel?.(newChannelName.trim());
                  setNewChannelName("");
                  setShowAddChannel(false);
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setNewChannelName("");
                  setShowAddChannel(false);
                }}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  if (newChannelName.trim()) {
                    onAddChannel?.(newChannelName.trim());
                    setNewChannelName("");
                    setShowAddChannel(false);
                  }
                }}
                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                チャンネルを追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Status or Login Button */}
      <div className="p-4 bg-[#0e172a] border-t border-gray-800 flex flex-col gap-3">
        {user ? (
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-gray-700 relative">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-blue-800 font-bold">
                    {user.displayName?.charAt(0) || "U"}
                  </span>
                )}
                <div
                  className={`absolute bottom-1 right-1 w-2 h-2 rounded-full border border-black/20 ${
                    status === "online" ? "bg-green-500" : "bg-gray-500"
                  }`}
                />
              </div>
              <div>
                <p className="text-xs font-bold text-white truncate w-24">
                  {user.displayName}
                </p>
                <p className={`text-[10px] flex items-center gap-1 ${status === "online" ? "text-green-500" : "text-gray-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status === "online" ? "bg-green-500" : "bg-gray-500"}`}></span>
                  {status === "online" ? "オンライン" : "オフライン"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative" ref={menuRef}>
                <Settings
                  size={14}
                  className="text-gray-500 cursor-pointer hover:text-white"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                />
                
                {isMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#1e2f4d] border border-gray-700 rounded-md shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-700">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">ステータス設定</p>
                    </div>
                    <button
                      onClick={() => handleStatusChange("online")}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-200 hover:bg-blue-600 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span>オンライン</span>
                      </div>
                      {status === "online" && <Check size={12} />}
                    </button>
                    <button
                      onClick={() => handleStatusChange("offline")}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-200 hover:bg-blue-600 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                        <span>オフライン</span>
                      </div>
                      {status === "offline" && <Check size={12} />}
                    </button>
                  </div>
                )}
              </div>
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
