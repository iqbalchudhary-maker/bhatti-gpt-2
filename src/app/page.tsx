"use client";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { handleChatAction, getChatHistory } from "./actions/chat";

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const res = await getChatHistory("test-session-1");
      if (res.success && res.data) {
        setMessages(res.data.map((m: any) => ({ role: m.role, content: m.content })));
      }
    };
    loadHistory();
  }, []);

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const testChat = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setLoading(true);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const result = await handleChatAction("test-session-1", input);
    if (result.success) {
      setMessages((prev) => [...prev, { role: "model", content: result.data || "" }]);
    }
    setLoading(false);
  };

  const handleAdminClick = () => {
    const pass = prompt("Enter Admin Password:");
    const correctPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    if (pass && correctPass && pass === correctPass) {
      window.location.href = "/admin";
    } else if (pass) {
      alert("Invalid Password");
    }
  };

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white overflow-hidden">
      {/* Sidebar - Responsive: hidden on mobile, flex on desktop */}
      <aside className={`${isSidebarOpen ? 'flex' : 'hidden'} md:flex w-64 bg-[#0f0f0f] p-6 flex-col border-r border-white/5 absolute md:relative z-20 h-full`}>
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">
                Bhatti-GPT
            </h1>
            <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>
        
        <div className="space-y-4 text-sm">
          <a href="https://wa.me/923010637955" target="_blank" className="block text-emerald-400 hover:text-emerald-300 transition">Contact on WhatsApp</a>
          <a href="https://vercel.com/ghulam-abbas-bhattis-projects" target="_blank" className="block text-gray-300 hover:text-white transition">Vercel Projects</a>
          <a href="https://www.linkedin.com/in/ghulam-abbas-bhatti-5928943b0/" target="_blank" className="block text-gray-300 hover:text-white transition">LinkedIn Profile</a>
        </div>

        <button 
          onClick={handleAdminClick}
          className="text-xs text-gray-600 hover:text-gray-400 mt-auto pt-6 transition block w-full text-left border-t border-white/5"
        >
          Admin Login
        </button>
      </aside>

      <main className="flex-1 flex flex-col h-screen bg-white overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-[#0f0f0f] text-white flex items-center shadow-lg">
            <button onClick={() => setIsSidebarOpen(true)} className="mr-4 text-xl">☰</button>
            <h2 className="text-lg font-semibold">Bhatti-GPT</h2>
        </div>

        {/* Desktop Header */}
        <div className="p-10 pb-0 hidden md:block">
          <h2 className="text-2xl font-semibold text-gray-800">Chat with AI</h2>
        </div>

        {/* Message Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-10 pt-4">
          <div className="flex flex-col space-y-4 max-w-2xl mx-auto w-full">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-xl ${msg.role === 'user' ? 'bg-blue-100 ml-auto w-fit text-blue-900' : 'bg-gray-100 w-fit text-gray-800'}`}
              >
                <strong className="block text-[10px] uppercase opacity-50 mb-1">
                  {msg.role === 'user' ? 'You' : 'AI Assistant'}
                </strong>
                <p className="text-sm">{msg.content}</p>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-10 pt-0 bg-white border-t border-gray-100">
          <div className="flex gap-2 w-full max-w-2xl mx-auto mt-4">
            <input 
              className="flex-1 p-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && testChat()}
              placeholder="Ask anything..."
            />
            <button onClick={testChat} className="bg-blue-600 px-6 py-2 rounded-lg text-white hover:bg-blue-700 transition" disabled={loading}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}