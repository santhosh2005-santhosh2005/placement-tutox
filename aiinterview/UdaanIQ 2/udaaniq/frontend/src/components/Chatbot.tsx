"use client";
import { useEffect, useRef, useState } from "react";
import { analyzeInterviewChat, ChatAnalysisRequestMessage, ChatAnalysisResponse } from "@/services/api";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatAnalysisRequestMessage[]>([]);
  const [analysis, setAnalysis] = useState<ChatAnalysisResponse | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, analysis, open]);

  async function send() {
    if (!input.trim()) return;
    const next = [...messages, { role: 'user', content: input } as ChatAnalysisRequestMessage];
    setMessages(next);
    setInput("");
    try {
      const res = await analyzeInterviewChat(next);
      setAnalysis(res);
      if (res.nextQuestion) {
        setMessages(m => [...m, { role: 'assistant', content: `Next question: ${res.nextQuestion}` }]);
      }
    } catch {}
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {open && (
          <div className="w-80 h-96 bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-800">AI Interview Coach</div>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-800 text-sm">Close</button>
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {messages.map((m, i) => (
                <div key={i} className={`text-sm ${m.role === 'user' ? 'text-slate-800' : 'text-blue-700'}`}>{m.content}</div>
              ))}
              {analysis && (
                <div className="text-xs text-slate-700 space-y-1">
                  <div className="text-slate-500">Score: {analysis.score}/10</div>
                  <ul className="list-disc pl-4">
                    {analysis.feedback.map((f, i) => (<li key={i}>{f}</li>))}
                  </ul>
                  <div><span className="text-slate-500">Tip:</span> {analysis.tip}</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-slate-200 flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask for analysis or help..." className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={send} className="bg-blue-600 hover:bg-blue-500 text-white rounded-md px-3 text-sm">Send</button>
            </div>
          </div>
        )}
        <button onClick={() => setOpen(v => !v)} className="rounded-full bg-blue-600 hover:bg-blue-500 text-white w-14 h-14 shadow-xl border border-blue-400/30">
          💬
        </button>
      </div>
    </>
  );
}


