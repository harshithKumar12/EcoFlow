import React, { useState, useRef, useEffect } from "react";
import { AICoachMessage, EcoSuggestion, ActivityType, ActivityLog } from "../types";
import { Send, Sparkles, MessageSquare, Compass, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";

interface AICoachProps {
  onAddLogFromCoach: (type: ActivityType, details: any, notes: string) => void;
  userName: string;
  logs: ActivityLog[];
  completedChallengesCount: number;
}

export default function AICoach({ 
  onAddLogFromCoach, 
  userName, 
  logs, 
  completedChallengesCount 
}: AICoachProps) {
  const [messages, setMessages] = useState<AICoachMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [adoptedId, setAdoptedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages([
      {
        id: "coach_welcome",
        role: "model",
        text: `Greetings, ${userName}! 🌍 I am your intelligent Carbon Footprint Advisor. I analyze your driving habits, home energy, and food log histories to suggest actionable steps to scale down your footprint. Try asking me: 'How can I lower my electricity footprint?' or tell me about your typical commute!`,
        timestamp: new Date().toISOString(),
      }
    ]);
  }, [userName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || userInput;
    if (!textToSend.trim() || loading) return;

    // Add user message to state
    const userMsg: AICoachMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!customMessage) setUserInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: textToSend, 
          chatHistory: updatedMessages,
          logs,
          userName,
          completedChallengesCount
        }),
      });
      const data = await resp.json();

      if (data.reply) {
        setMessages((prev) => [...prev, data.reply]);
      } else {
        throw new Error("Invalid reply format");
      }
    } catch (err) {
      console.error("Gemini coach endpoint failure:", err);
      // Fallback message to user if server is resetting
      const genericReply: AICoachMessage = {
        id: `reply_error_${Date.now()}`,
        role: "model",
        text: `I am syncing your latest carbon tracks right now, ${userName}. Try starting with one of my quick questions below to run a direct recommendation matrix!`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, genericReply]);
    } finally {
      setLoading(false);
    }
  };

  const adoptAction = (sug: EcoSuggestion) => {
    setAdoptedId(sug.id);

    // Formulate proper details object for direct ledger logging
    let typeSelected = ActivityType.TRANSPORT;
    let details: any = {};
    const notesStr = `Adopted Coach Action: ${sug.title} - ${sug.description}`;

    if (sug.category === "energy") {
      typeSelected = ActivityType.ELECTRICITY;
      details = { electricity: { amount: 5, source: "green_tariff" } };
    } else if (sug.category === "food") {
      typeSelected = ActivityType.FOOD;
      details = { food: { meals: 1, dietType: "vegetarian" } };
    } else if (sug.category === "transport") {
      typeSelected = ActivityType.TRANSPORT;
      details = { transport: { distance: 10, mode: "bus" } };
    } else if (sug.category === "shopping") {
      typeSelected = ActivityType.SHOPPING;
      details = { shopping: { spent: 20, category: "second_hand" } };
    } else {
      typeSelected = ActivityType.WASTE;
      details = { waste: { weight: 2, recycled: true } };
    }

    onAddLogFromCoach(typeSelected, details, notesStr);

    setTimeout(() => {
      setAdoptedId(null);
    }, 3000);
  };

  const quickMissions = [
    "How can I lower my food footprint?",
    "Show me electric vehicle vs gas car emission statistics",
    "How do I reduce standby home energy leaks?",
  ];

  return (
    <div id="ai-coach-section" className="bg-gradient-to-b from-white to-slate-50/70 border border-slate-200/95 shadow-md rounded-2xl flex flex-col h-[580px] overflow-hidden">
      {/* Advisor Header */}
      <div className="bg-gradient-to-r from-slate-50 to-emerald-50/20 px-5 py-4 border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl relative shadow-sm">
            <Sparkles className="w-5 h-5" />
            <span className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-slate-50"></span>
          </span>
          <div>
            <h3 className="text-xs font-bold text-slate-800 tracking-wide">AI Sustainability Coach</h3>
            <p className="text-[10px] text-slate-500 font-medium">Powered securely by Gemini LLM Client</p>
          </div>
        </div>
        <div className="text-[10px] bg-slate-200/60 px-2.5 py-1 text-slate-650 rounded-lg flex items-center gap-1.5 font-bold">
          <Compass className="w-3.5 h-3.5" />
          <span>Active Context: Daily Stream</span>
        </div>
      </div>

      {/* Message Feed Canvas */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/10">
        {messages.map((m) => {
          const isModel = m.role === "model";
          return (
            <div key={m.id} className={`flex gap-3 max-w-[85%] ${isModel ? "self-start" : "ml-auto flex-row-reverse"}`}>
              {isModel && (
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xs shrink-0 mt-1 shadow-sm">
                  🤖
                </span>
              )}
              <div className="space-y-3">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  isModel
                    ? "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                    : "bg-gradient-to-tr from-emerald-605 to-teal-600 text-white font-medium rounded-tr-none"
                }`}>
                  {isModel ? (
                    <div className="markdown-body prose prose-sm max-w-none text-slate-800 break-words">
                      <Markdown>{m.text}</Markdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  )}
                </div>

                {/* Direct Action Suggestions Chips Inline */}
                {isModel && m.suggestions && m.suggestions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2 max-w-lg">
                    {m.suggestions.map((sug) => {
                      const isAdopted = adoptedId === sug.id;
                      return (
                        <div
                          key={sug.id}
                          className="bg-gradient-to-br from-white to-amber-50/15 border border-slate-200 shadow-sm p-3.5 rounded-xl flex flex-col justify-between hover:border-amber-300 transition duration-300"
                        >
                          <div>
                            <span className="text-[8.5px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 uppercase tracking-widest">
                              {sug.impact} Impact • {sug.co2SavedValue}kg saved
                            </span>
                            <h4 className="text-xs font-bold text-slate-800 mt-1.5">{sug.title}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                              {sug.description}
                            </p>
                          </div>

                          <button
                            id={`adopt-suggest-${sug.id}`}
                            onClick={() => adoptAction(sug)}
                            disabled={isAdopted}
                            className={`mt-3 py-1.5 px-3 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                              isAdopted
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
                                : "bg-slate-100 text-slate-705 hover:bg-slate-200"
                            }`}
                          >
                            {isAdopted ? <CheckCircle className="w-3 h-3" /> : null}
                            <span>{isAdopted ? "Saved Offset Registered!" : "Adopt This Action Today"}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex gap-3 max-w-[80%] self-start">
            <span className="w-8 h-8 rounded-lg bg-emerald-5 border border-emerald-100 flex items-center justify-center text-xs shrink-0 mt-1 animate-pulse shadow-sm">
              ⏳
            </span>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl text-xs text-slate-400 rounded-tl-none flex items-center gap-2 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              <span>Gemini is analyzing footprint factors...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Quick Question Queries bar */}
      <div className="bg-[#f8fafc] px-4 py-2.5 border-t border-slate-200/80 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0 flex gap-2">
        {quickMissions.map((mq, idx) => (
          <button
            id={`quick-coach-query-${idx}`}
            key={idx}
            onClick={() => handleSendMessage(mq)}
            className="bg-white hover:bg-slate-100 text-slate-650 hover:text-emerald-705 border border-slate-200/90 hover:border-emerald-250 hover:bg-emerald-50 text-[10px] px-3 py-1.5 rounded-full transition cursor-pointer shadow-sm shadow-slate-100"
          >
            {mq}
          </button>
        ))}
      </div>

      {/* Input panel bottom */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <MessageSquare className="absolute left-4 top-3 text-slate-400 w-4 h-4" />
          <input
            id="chat-message-text-input"
            type="text"
            placeholder="Ask your Coach about food, travel, or energy reduction..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-14 py-2.5 text-xs text-slate-800 placeholder-slate-405 focus:outline-none focus:border-slate-350 shadow-sm transition"
          />
          <button
            id="chat-message-send-btn"
            type="submit"
            disabled={!userInput.trim() || loading}
            className="absolute right-2 top-1.5 p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
