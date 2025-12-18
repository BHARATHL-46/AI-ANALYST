
import React, { useState, useRef, useEffect } from 'react';
import { SettingsSidebar } from './components/SettingsSidebar';
import { FormattedMessage } from './components/FormattedMessage';
import { AIModel, Message, SessionConfig } from './types';
import { performAnalysis } from './services/aiService';

const App: React.FC = () => {
  const [config, setConfig] = useState<SessionConfig>({
    systemPrompt: `student`,
    temperature: 1.0,
    maxOutputTokens: 10000,
    model: AIModel.GEMINI
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 150);
    return () => clearTimeout(timeoutId);
  }, [messages, isProcessing]);

  const getModelDisplayName = (model: AIModel) => {
    return model === AIModel.CHATGPT ? 'ChatGPT' : 'Gemini';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsProcessing(true);
    setError(null);

    try {
      const currentModelLabel = getModelDisplayName(config.model);
      const response = await performAnalysis({
        provider: config.model === AIModel.GEMINI ? 'gemini' : 'openai',
        question: question,
        systemPrompt: config.systemPrompt,
        temperature: config.temperature,
        maxTokens: config.maxOutputTokens,
        history: messages
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        modelName: currentModelLabel
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  const downloadHistory = () => {
    if (messages.length === 0) return;
    const headers = ['Timestamp', 'Role', 'Content', 'Model'];
    const rows = messages.map(m => [
      new Date(m.timestamp).toISOString(),
      m.role,
      `"${m.content.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      m.modelName || (m.role === 'user' ? 'User' : 'System')
    ]);
    const content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const fileName = `analysis_history_${Date.now()}.csv`;
    const blob = new Blob([content], { type: `text/csv;charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-white text-[#0d0d0d] overflow-hidden relative font-sans">
      <div className={`
        fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto lg:flex
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <div className="relative w-[300px] lg:w-72 h-full bg-[#fdfdfd] shadow-2xl lg:shadow-none border-r border-[#f0f0f0]">
          <SettingsSidebar 
            config={config} 
            setConfig={setConfig} 
            onDownloadHistory={downloadHistory}
            isProcessing={isProcessing}
            onClear={() => {
              handleClear();
              setIsSidebarOpen(false);
            }}
          />
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-6 right-6 p-2 lg:hidden text-[#9ca3af] hover:text-black transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <main className="flex-1 flex flex-col relative bg-white h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-5 border-b border-[#f0f0f0] bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-[#0d0d0d] active:scale-95 transition-transform"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-extrabold text-sm tracking-tight uppercase">AI Analyst</span>
          </div>
          <div className="w-8" />
        </header>

        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto pt-6 px-4 lg:px-8 custom-scrollbar relative"
        >
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && !isProcessing && (
              <div className="h-[70vh] flex flex-col items-center justify-center text-center animate-slide-up">
                <div className="w-20 h-20 mb-8 bg-black rounded-[2.5rem] flex items-center justify-center text-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] transform hover:rotate-6 transition-transform cursor-pointer">
                  🧩
                </div>
                <h2 className="text-4xl lg:text-5xl font-black mb-4 text-[#1d1d1f] tracking-tighter">AI Analyst</h2>
                <p className="text-[#86868b] max-w-md mb-12 text-lg font-medium leading-relaxed px-4 opacity-80">
                  Advanced computational intelligence for solving logic puzzles, patterns, and complex sequence analysis.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  <button 
                    onClick={() => setQuestion("A - 1, B - 2, ... AA - 27, XFD - ?")}
                    className="p-6 text-left bg-white border border-[#f0f0f0] rounded-[2rem] text-[15px] text-[#4d4d4d] hover:border-black hover:shadow-xl transition-all group active:scale-[0.98]"
                  >
                    <div className="font-bold text-[#0d0d0d] mb-1 group-hover:text-black flex items-center gap-2">
                      <span className="text-blue-500 font-black">L</span> Letter Mapping
                    </div>
                    "Analyze A-Z numbering patterns"
                  </button>
                  <button 
                    onClick={() => setQuestion("Give me a simple Python logic for the pattern.")}
                    className="p-6 text-left bg-white border border-[#f0f0f0] rounded-[2rem] text-[15px] text-[#4d4d4d] hover:border-black hover:shadow-xl transition-all group active:scale-[0.98]"
                  >
                    <div className="font-bold text-[#0d0d0d] mb-1 group-hover:text-black flex items-center gap-2">
                      <span className="text-emerald-500 font-black">C</span> Code Logic
                    </div>
                    "Algorithm for pattern discovery"
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-10 mb-52">
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex animate-fade-in ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col w-full ${m.role === 'user' ? 'max-w-[85%] lg:max-w-[75%] items-end' : 'max-w-full items-start'}`}>
                    <div 
                      className={`px-5 py-4 lg:px-6 lg:py-5 rounded-[1.8rem] lg:rounded-[2.2rem] text-[15px] lg:text-[16px] leading-[1.65] w-full border ${
                        m.role === 'user' 
                          ? 'bg-[#0d0d0d] text-white border-black shadow-lg shadow-black/5' 
                          : 'bg-[#fcfcfc] text-[#0d0d0d] border-[#f0f0f0] shadow-sm'
                      }`}
                    >
                      {m.role === 'assistant' && (
                        <div className="flex items-center gap-3 mb-5 border-b border-[#f0f0f0] pb-4">
                           <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-xl ${m.modelName?.includes('Gemini') ? 'bg-[#4285f4]' : 'bg-[#10a37f]'} flex items-center justify-center text-[11px] lg:text-[12px] text-white font-black shadow-md`}>
                             {m.modelName?.includes('Gemini') ? 'G' : 'C'}
                           </div>
                           <div className="flex flex-col">
                             <span className="text-sm font-black text-[#1d1d1f] leading-tight tracking-tight">
                               {m.modelName} Analyst
                             </span>
                             <span className="text-[10px] text-[#9ca3af] font-extrabold tracking-[0.05em] uppercase">Computational Intelligence</span>
                           </div>
                        </div>
                      )}
                      <FormattedMessage content={m.content} />
                    </div>
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="flex justify-start animate-fade-in">
                   <div className="flex items-center gap-4 px-6 py-4 bg-[#fcfcfc] rounded-[2rem] border border-[#f0f0f0] shadow-sm">
                      <div className={`w-8 h-8 rounded-xl ${config.model === AIModel.GEMINI ? 'bg-[#4285f4]' : 'bg-[#10a37f]'} flex items-center justify-center text-[12px] text-white font-black shadow-lg animate-pulse`}>
                        {config.model === AIModel.GEMINI ? 'G' : 'C'}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#8e8e93] italic tracking-tight">Processing...</span>
                        <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 bg-[#d1d5db] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1.5 h-1.5 bg-[#d1d5db] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1.5 h-1.5 bg-[#d1d5db] rounded-full animate-bounce"></div>
                        </div>
                      </div>
                   </div>
                </div>
              )}

              {error && (
                <div className="mx-auto max-w-lg bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-[1.5rem] text-sm font-bold text-center shadow-lg animate-slide-up">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} className="h-40 lg:h-56" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 lg:px-8 pt-6 pb-8 lg:pb-10 bg-gradient-to-t from-white via-white/95 to-transparent z-40">
          <div className="max-w-3xl mx-auto relative group">
            <form 
              onSubmit={handleSubmit} 
              className="relative flex items-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] rounded-[2.2rem] lg:rounded-[2.8rem] border border-[#e5e5e5] focus-within:border-black focus-within:ring-4 focus-within:ring-black/5 transition-all bg-white p-1.5"
            >
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`Ask ${getModelDisplayName(config.model)} analyst...`}
                className="w-full bg-transparent border-none py-4 lg:py-5 pl-7 lg:pl-8 pr-16 text-[15px] lg:text-[17px] text-[#0d0d0d] placeholder-[#9ca3af] font-medium focus:ring-0 outline-none"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={isProcessing || !question.trim()}
                className="absolute right-2 p-3.5 lg:p-4 rounded-[1.8rem] lg:rounded-[2rem] bg-black text-white disabled:bg-[#f4f4f4] disabled:text-[#d1d5db] transition-all transform active:scale-90 shadow-xl flex items-center justify-center hover:bg-[#222]"
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </button>
            </form>
            <div className="mt-5 flex justify-center items-center gap-4 text-[10px] text-[#8e8e93] font-black uppercase tracking-[0.25em] opacity-50">
               <span>AI ANALYST PRO</span>
               <div className="w-1.5 h-1.5 rounded-full bg-[#8e8e93]" />
               <span>{getModelDisplayName(config.model)} POWERED</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
