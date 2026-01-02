
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChatMessage, ProgramData } from '../types';
import { askAgent } from '../services/geminiService';
import { marked } from 'marked';

interface AgentPanelProps {
  data: ProgramData;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;
    const userMsg = textToSend.trim();
    if (!textOverride) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    const response = await askAgent(userMsg, data);
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
  };

  const MarkdownContent = ({ text, role }: { text: string, role: 'user' | 'model' }) => {
    const html = useMemo(() => {
      try {
        return marked.parse(text);
      } catch (e) { return text; }
    }, [text]);
    if (role === 'user') return <div className="whitespace-pre-wrap">{text}</div>;
    return (
      <div 
        className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-strong:text-slate-900"
        dangerouslySetInnerHTML={{ __html: html as string }}
      />
    );
  };

  return (
    <aside 
      className={`fixed top-0 right-0 h-full bg-white border-l border-slate-200 shadow-2xl z-[60] transition-all duration-300 flex flex-col ${
        isExpanded ? 'w-[400px]' : 'w-12'
      }`}
    >
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-1/2 -left-6 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ring-4 ring-white z-10 hover:opacity-90 -translate-y-1/2"
        style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-on-primary)', transform: `translateY(-50%) rotate(${isExpanded ? '180deg' : '0deg'})` }}
        title={isExpanded ? "Collapse Sidebar" : "Ask Program AI"}
      >
        <i className={`fas ${isExpanded ? 'fa-chevron-right' : 'fa-robot'} text-sm`}></i>
      </button>

      <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-on-primary)' }}>
              <i className="fas fa-microchip text-sm"></i>
            </div>
            <h3 className="text-sm font-bold text-slate-800">Program Assistant</h3>
          </div>
          <button onClick={() => setIsExpanded(false)} className="text-slate-400 hover:text-slate-600 p-2"><i className="fas fa-times"></i></button>
        </div>

        <div className="p-5 border-b border-slate-100 bg-white">
          <div className="relative">
            <textarea 
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask a question about the program..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none font-medium"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute bottom-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:bg-slate-200 shadow-md"
              style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-on-primary)' }}
            >
              <i className="fas fa-arrow-up text-xs"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/30 scroll-smooth" ref={scrollRef}>
          {messages.length === 0 && !isTyping && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60 px-8 text-center py-20">
              <i className="fas fa-comment-dots text-3xl mb-4" style={{ color: 'var(--theme-primary)', opacity: 0.3 }}></i>
              <p className="text-xs font-medium leading-relaxed">Ask a question above to get insights about projects, resources, or deliverables.</p>
            </div>
          )}
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-center gap-2 mb-1.5 px-1 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {m.role === 'user' ? 'Program Manager' : 'AI Agent'}
                </span>
              </div>
              <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                m.role === 'user' 
                ? 'bg-slate-800 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
              }`}
              style={m.role === 'user' ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-on-primary)' } : {}}>
                <MarkdownContent text={m.text} role={m.role} />
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 px-1 tracking-tighter">AI Agent</span>
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--theme-primary)' }}></div>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse delay-100" style={{ backgroundColor: 'var(--theme-primary)' }}></div>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse delay-200" style={{ backgroundColor: 'var(--theme-primary)' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
