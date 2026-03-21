"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { Hash, Search, Bell, Info } from "lucide-react";
import Sidebar from "./Sidebar";
import MessageInput from "./MessageInput";
import { useAuth } from "@/hooks/useAuth";
import Login from "./Login";
import { Message, UserProfile } from "@/types/message";
import { GraphAnalysisResponse } from "@/types/graph";
import { parseMessageWithMentions, MessagePart, MentionPart } from "@/lib/utils/mentions";
import ProblemTag from "./ui/ProblemTag";
import GraphPanel from "./graph/GraphPanel";

import { useBrushUp } from "@/hooks/useBrushUp";
import BrushUpPanel from "./brushup/BrushUpPanel";
import BrushUpDetailModal from "./brushup/BrushUpDetailModal";
import { BrushUpSuggestion } from "@/types/brushup";

// 以下はグラフ表示機能のインポート
import QuestionAnalysisPanel from "./graph/QuestionAnalysisPanel";

interface ChatProps {
  channelId: string;
}

const CHANNELS = [
  { id: "project-alpha", name: "project-alpha" },
  { id: "development", name: "development" },
  { id: "ai-lead", name: "佐藤 (AIリード)" },
];

export default function Chat({ channelId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();

  // Graph panel state
  const [graphPanelOpen, setGraphPanelOpen] = useState(false);
  const [graphData, setGraphData] = useState<GraphAnalysisResponse | null>(null);
  const [loadingGraph, setLoadingGraph] = useState(false);

  // Message input state
  const [newMessage, setNewMessage] = useState("");

  // BrushUp panel state
  const { analysis, isAnalyzing, error, analyzeDraft, analyzeDetailedReview, reset } = useBrushUp();
  const [showBrushUp, setShowBrushUp] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleAnalyze = () => {
    if (!newMessage.trim()) return;
    setShowBrushUp(true);
    analyzeDraft(newMessage);
  };

  const handleCloseBrushUp = () => {
    setShowBrushUp(false);
    reset();
  };

  const handleSuggestionClick = (suggestion: BrushUpSuggestion) => {
    setNewMessage((prev) => prev + `\n【${suggestion.category}】`);
  };

  const handleAfterSend = () => {
    setShowBrushUp(false);
    reset();
  };

  const handleOpenDetailModal = async () => {
    const succeeded = await analyzeDetailedReview(newMessage);
    if (succeeded) {
      setShowDetailModal(true);
    }
  };

  //以下はグラフ表示用
  // Question analysis panel state
  const [analysisPanelOpen, setAnalysisPanelOpen] = useState(false);
  const [analysisMention, setAnalysisMention] = useState('');
  const [analysisMessages, setAnalysisMessages] = useState<Message[]>([]);
  const [analysisDraft, setAnalysisDraft] = useState('');

  // Get current channel name
  const currentChannelName = CHANNELS.find(c => c.id === channelId)?.name || channelId;

  // Listen to messages
  useEffect(() => {
    const q = query(
      collection(db, "channels", channelId, "messages"),
      orderBy("timestamp", "asc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [channelId]);

  // Sync user profiles for visible messages
  useEffect(() => {
    const uniqueSenderIds = Array.from(new Set(messages.map((m) => m.senderId)));
    
    // Create listeners for each unique sender's profile
    const unsubscribes = uniqueSenderIds.map((uid) => {
      if (userProfiles[uid]) return null; // Already have a listener or data (simplification)
      
      return onSnapshot(doc(db, "users", uid), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setUserProfiles((prev) => ({
            ...prev,
            [uid]: {
              displayName: data.displayName || "Anonymous",
              photoURL: data.photoURL || "",
              status: data.status,
            },
          }));
        }
      });
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub && unsub());
    };
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle problem analysis
  const handleAnalyzeProblem = async (problemId: string) => {
    setLoadingGraph(true);

    try {
      // Filter messages containing #problemX
      const problemMessages = messages.filter(msg =>
        msg.text.toLowerCase().includes(`#${problemId.toLowerCase()}`)
      );

      if (problemMessages.length === 0) {
        alert('このチャンネルには該当する問題メッセージがありません');
        return;
      }

      // Call API
      const response = await fetch('/api/analyze-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_id: problemId,
          messages: problemMessages.map(msg => ({
            id: msg.id,
            text: msg.text,
            timestamp: msg.timestamp?.toDate().toISOString() || new Date().toISOString(),
            user: msg.senderName,
            mentions: [problemId],
            channel: channelId
          }))
        })
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data: GraphAnalysisResponse = await response.json();
      setGraphData(data);
      setGraphPanelOpen(true);
    } catch (error) {
      console.error('Failed to analyze problem:', error);
      alert('問題分析に失敗しました');
    } finally {
      setLoadingGraph(false);
    }
  };

  // Handle "質問を分析" button from MessageInput
  const handleAnalyzeQuestion = (draftMessage: string) => {
    const match = draftMessage.match(/#(\w+)/i);
    if (!match) {
      alert('メッセージに #○○ の指定がありません');
      return;
    }
    const mention = match[1].toLowerCase();
    const filtered = messages.filter(m =>
      m.text.toLowerCase().includes(`#${mention}`)
    );
    setAnalysisMention(mention);
    setAnalysisMessages(filtered);
    setAnalysisDraft(draftMessage);
    setAnalysisPanelOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0b1426] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0b1426] text-gray-300 font-sans overflow-hidden">
      <Sidebar channelId={channelId} channels={CHANNELS} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-[#0b1426]">
          <div className="flex items-center gap-2">
            <Hash size={18} className="text-gray-400" />
            <h1 className="font-bold text-white">{currentChannelName}</h1>
            <span className="text-xs text-gray-500 ml-2">12 members</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                type="text"
                placeholder="会話を検索..."
                className="bg-[#1e2f4d] text-sm rounded-md py-1.5 pl-9 pr-4 w-64 outline-none border border-transparent focus:border-blue-500"
              />
            </div>
            <Bell size={18} className="text-gray-400 cursor-pointer" />
            <Info size={18} className="text-gray-400 cursor-pointer" />
          </div>
        </header>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => {
            const isMe = user && msg.senderId === user.uid;
            const profile = userProfiles[msg.senderId];
            const displayName = profile?.displayName || msg.senderName;
            const avatarUrl = profile?.photoURL || msg.senderAvatar;

            return (
              <div key={msg.id} className={`flex gap-4 ${isMe ? "flex-row-reverse" : ""}`}>
                <div className="w-9 h-9 rounded-md bg-gray-600 flex-shrink-0 flex items-center justify-center text-white text-xs overflow-hidden border border-gray-700 relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    displayName.charAt(0)
                  )}
                  <div
                    className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-black/20 ${
                      profile?.status === "online" ? "bg-green-500" : "bg-gray-500"
                    }`}
                  />
                </div>
                <div className={`flex flex-col ${isMe ? "items-end" : ""}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{displayName}</span>
                    <span className="text-[10px] text-gray-500">
                      {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "Pending..."}
                    </span>
                  </div>
                  <div
                    className={`px-4 py-2.5 rounded-lg max-w-md text-sm ${
                      isMe
                        ? "bg-[#2563eb] text-white rounded-tr-none"
                        : "bg-[#1e2f4d] text-gray-200 rounded-tl-none"
                    }`}
                  >
                    {parseMessageWithMentions(msg.text).map((part: MessagePart, idx: number) =>
                      typeof part === 'string' ? (
                        <span key={idx}>{part}</span>
                      ) : (
                        <ProblemTag
                          key={idx}
                          problemId={part.problemId}
                          onClick={handleAnalyzeProblem}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        {/* ブラッシュアップ提案パネル */}
        <div className="px-6">
          {showBrushUp && (
            <BrushUpPanel
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              error={error}
              onClose={handleCloseBrushUp}
              onSuggestionClick={handleSuggestionClick}
              onDetailClick={handleOpenDetailModal}
            />
          )}
        </div>

        <MessageInput
          channelId={channelId}
          value={newMessage}
          onChange={setNewMessage}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          onAfterSend={handleAfterSend}
          onAnalyzeQuestion={handleAnalyzeQuestion}
        />

      </div>

      {/* BrushUp Detail Modal */}
      {showDetailModal && analysis && (
        <BrushUpDetailModal
          analysis={analysis}
          draftText={newMessage}
          onClose={() => setShowDetailModal(false)}
          onSuggestionClick={(suggestion) => {
            handleSuggestionClick(suggestion);
            setShowDetailModal(false);
          }}
        />
      )}

      {/* Graph Panel */}
      {graphData && (
        <GraphPanel
          isOpen={graphPanelOpen}
          onClose={() => setGraphPanelOpen(false)}
          graphData={graphData}
          channelId={channelId}
        />
      )}

      {/* Question Analysis Panel */}
      <QuestionAnalysisPanel
        isOpen={analysisPanelOpen}
        onClose={() => setAnalysisPanelOpen(false)}
        messages={analysisMessages}
        mention={analysisMention}
        draftMessage={analysisDraft}
      />

      {/* Loading overlay */}
      {loadingGraph && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1e2f4d] p-6 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-white mt-4">問題を分析中...</p>
          </div>
        </div>
      )}
    </div>
  );
}
