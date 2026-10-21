import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  FileText,
  ShieldCheck,
  CreditCard,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const QUICK_QUESTIONS = [
  'What scholarships am I eligible for?',
  'Income certificate issuing authority rules',
  'Bonafide certificate AISHE requirements',
  'How does DBT payout and UTR tracking work?',
  'Why was my application marked Defective?',
];

export default function AIAssistantWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `👋 **Welcome to EduStream AI!**\n\nI am your **Retrieval-Augmented Generation (RAG)** assistant, trained on official higher education directives, document scrutiny rubrics, and Direct Benefit Transfer (DBT) protocols.\n\nAsk me about **eligibility**, **income certificates**, **defective documents**, or click any quick topic below!`,
      citations: [
        { title: 'EduStream Knowledge Base 2026', sourceRef: 'State Scholarship Directorate', category: 'General' },
      ],
      recommendedSchemes: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Listen for custom trigger events from other pages (e.g. Knowledge Base page "Ask AI" buttons)
  useEffect(() => {
    const handleTrigger = (event) => {
      const prompt = event.detail?.query;
      setIsOpen(true);
      setIsMinimized(false);
      if (prompt) {
        handleSend(prompt);
      }
    };
    window.addEventListener('open-ai-advisor', handleTrigger);
    return () => window.removeEventListener('open-ai-advisor', handleTrigger);
  }, []);

  const handleSend = async (customQuery = null) => {
    const textToSend = customQuery || query;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customQuery) setQuery('');
    setLoading(true);

    try {
      const response = await api.post('/rag/ask', {
        query: textToSend.trim(),
      });

      const { answer, citations, recommendedSchemes, mode } = response.data;

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: answer,
        citations: citations || [],
        recommendedSchemes: recommendedSchemes || [],
        mode: mode || 'local-semantic-engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('RAG request failed:', err);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `⚠️ **Unable to retrieve an answer right now.**\n\n*Error details: ${
          err.response?.data?.message || err.message
        }*.\nPlease try asking again or browse the Knowledge Base directly.`,
        citations: [],
        recommendedSchemes: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: `Conversation cleared. How can I assist you with EduStream scholarships and policies today?`,
        citations: [],
        recommendedSchemes: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Basic markdown-like formatter for bullet points, bold text, and headers
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h4 key={index} className="font-bold text-slate-900 mt-2.5 mb-1 text-xs">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={index} className="font-bold text-slate-900 mt-3 mb-1 text-sm">
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={index}
            className="border-l-2 border-indigo-400 pl-2.5 py-1 my-1.5 bg-indigo-50/50 text-indigo-900 text-[11px] rounded-r"
          >
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletContent = line.trim().replace(/^[-*]\s+/, '');
        return (
          <li key={index} className="ml-3 list-disc text-slate-700 text-xs my-0.5 leading-relaxed">
            <span
              dangerouslySetInnerHTML={{
                __html: bulletContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
              }}
            />
          </li>
        );
      }
      // Numbered items
      if (/^\d+\.\s+/.test(line.trim())) {
        const itemContent = line.trim().replace(/^\d+\.\s+/, '');
        return (
          <div key={index} className="flex items-start gap-1.5 text-xs text-slate-700 my-1">
            <span className="font-semibold text-indigo-600">{line.trim().match(/^\d+\./)[0]}</span>
            <span
              dangerouslySetInnerHTML={{
                __html: itemContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
              }}
            />
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={index} className="h-1.5" />;
      }
      // Regular paragraph
      return (
        <p
          key={index}
          className="text-xs text-slate-700 leading-relaxed my-0.5"
          dangerouslySetInnerHTML={{
            __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
          }}
        />
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-800 text-white font-medium shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-200 group border border-indigo-400/30"
          aria-label="Open EduStream AI Advisor"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-indigo-900" />
          </div>
          <span className="text-sm font-semibold tracking-wide">Ask EduStream AI</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/20 uppercase tracking-wider">
            RAG
          </span>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white shadow-2xl border border-slate-200 transition-all duration-200 flex flex-col ${
            isMinimized
              ? 'bottom-6 right-6 w-80 h-14 rounded-2xl'
              : 'bottom-4 sm:bottom-6 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[460px] h-[600px] max-h-[85vh] rounded-2xl'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-t-2xl border-b border-indigo-900/40 select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/80 border border-indigo-400/40 flex items-center justify-center text-white">
                <Bot className="w-4 h-4 text-indigo-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold tracking-tight text-white">EduStream AI Advisor</h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    RAG Grounded
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">Policy citations & eligibility matching</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={handleClearHistory}
                title="Clear conversation"
                className="p-1.5 rounded-md hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 rounded-md hover:text-white hover:bg-white/10 transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close AI Assistant"
                className="p-1.5 rounded-md hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body (Hidden if minimized) */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 text-slate-800">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      {/* Text content */}
                      <div className={msg.sender === 'user' ? 'text-white text-xs leading-relaxed' : ''}>
                        {msg.sender === 'user' ? msg.text : renderFormattedText(msg.text)}
                      </div>

                      {/* Recommended Schemes Cards */}
                      {msg.recommendedSchemes && msg.recommendedSchemes.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                          <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Matching Scholarship Schemes:
                          </p>
                          <div className="grid gap-2">
                            {msg.recommendedSchemes.map((sch) => (
                              <div
                                key={sch.id}
                                className="bg-indigo-50/80 border border-indigo-100 rounded-lg p-2.5 text-xs hover:border-indigo-300 transition-colors"
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="font-semibold text-slate-900 truncate">{sch.title}</span>
                                  <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                                    ₹{sch.amount?.toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 mb-2">
                                  Code: <span className="font-mono font-medium text-slate-700">{sch.code}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setIsOpen(false);
                                    if (user?.role === 'student') {
                                      navigate(`/student/apply/${sch.id}`);
                                    } else {
                                      navigate('/scholarships');
                                    }
                                  }}
                                  className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-medium transition-colors"
                                >
                                  <span>Apply for Scheme</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Policy Citations Pills */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-400">Sources:</span>
                          {msg.citations.map((cite, idx) => (
                            <span
                              key={idx}
                              title={`${cite.title} - ${cite.sourceRef}`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] border border-slate-200 truncate max-w-[180px]"
                            >
                              <FileText className="w-2.5 h-2.5 text-indigo-500" />
                              <span className="truncate">{cite.title}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Engine Mode Pill */}
                      {msg.mode && (
                        <div className="mt-1.5 text-[9px] text-slate-400 text-right">
                          Engine:{' '}
                          <span className="font-medium text-slate-500">
                            {msg.mode === 'gemini-3.8-flash' ? 'Google Gemini 3.8 Flash' : 'Local Policy Vectorizer'}
                          </span>
                        </div>
                      )}
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex gap-2.5 items-center">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Retrieving policy directives...</span>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
                  <BookOpen className="w-3 h-3 text-indigo-500" />
                  Suggested:
                </span>
                {QUICK_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    disabled={loading}
                    className="flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition-colors whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 rounded-b-2xl"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about schemes, income rules, DBT, UTR..."
                  disabled={loading}
                  className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                  aria-label="Send query"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
