"use client";

import { useAuth } from "@/hooks/useAuth";
import { LogIn } from "lucide-react";

export default function Login() {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b1426] text-white">
      <div className="w-96 p-8 bg-[#111d33] rounded-lg shadow-xl border border-gray-800 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-bold">E</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">エンジニア開発チーム</h1>
        <p className="text-gray-400 mb-8 text-sm">ログインしてチャットを開始してください</p>
        
        <button
          onClick={loginWithGoogle}
          className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold py-3 px-4 rounded-md flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Googleでログイン
        </button>
      </div>
    </div>
  );
}
