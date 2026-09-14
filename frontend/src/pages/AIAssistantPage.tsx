import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, Sparkles, User as UserIcon, AlertCircle, Tag } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { aiApi, ApiError } from '../api/client';
import type { AskResponse } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
  error?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTopicLabel(topic: string): string {
  return topic
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-3 max-w-[80%]">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center flex-shrink-0">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="bg-slate-800 border border-slate-700/60 rounded-2xl rounded-tl-sm px-4 py-3">
      <div className="flex gap-1.5 items-center h-4">
        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  </div>
);

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex items-start gap-3 justify-end">
        <div className="max-w-[78%] bg-violet-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md shadow-violet-900/30">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-4 h-4 text-slate-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 max-w-[85%]">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-900/40">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="space-y-2 flex-1">
        <div
          className={`rounded-2xl rounded-tl-sm px-4 py-3 border shadow-sm ${
            message.error
              ? 'bg-red-950/40 border-red-800/50 text-red-300'
              : 'bg-slate-800 border-slate-700/60 text-slate-200'
          }`}
        >
          {message.error && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Error</span>
            </div>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        </div>

        {/* Source chips */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Sources:
            </span>
            {message.sources.map((src) => (
              <span
                key={src}
                className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-950/60 border border-violet-800/50 text-violet-300"
              >
                {formatTopicLabel(src)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Suggestion chips
// ---------------------------------------------------------------------------

const SUGGESTIONS = [
  'What is the time complexity of Merge Sort?',
  'Explain the 0/1 Knapsack DP table.',
  'How does Branch & Bound differ from Backtracking?',
  'What makes SAT NP-Complete?',
  'When should I use Kruskal\'s vs Prim\'s MST?',
  'Explain Big-O notation with examples.',
];

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

let messageCounter = 0;
function nextId(): number {
  return ++messageCounter;
}

export const AIAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Redirect to login if not authenticated.
  useEffect(() => {
    if (!isAuthenticated && !token) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, token, navigate]);

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    const question = text.trim();
    if (!question || isLoading) return;

    setInput('');

    // Add user message immediately.
    const userMsg: Message = { id: nextId(), role: 'user', text: question };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response: AskResponse = await aiApi.ask({ question });

      const assistantMsg: Message = {
        id: nextId(),
        role: 'assistant',
        text: response.answer,
        sources: response.sources,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      let errorText = 'Something went wrong. Please try again.';
      if (err instanceof ApiError) {
        if (err.status === 503) {
          errorText =
            'The AI assistant is not configured on this server. ' +
            'Please ask the administrator to set the OPENAI_API_KEY.';
        } else if (err.status === 401) {
          errorText = 'Your session has expired. Please log in again.';
          navigate('/login');
        } else {
          errorText = err.message;
        }
      }
      const errorMsg: Message = {
        id: nextId(),
        role: 'assistant',
        text: errorText,
        error: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      // Re-focus the input.
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 9rem)' }}>
      {/* Header */}
      <div className="flex-none pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              AI Assistant
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-950/60 border border-violet-800/50 text-violet-300">
                Beta
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Ask anything about algorithms, complexity, or the DAA curriculum.
            </p>
          </div>
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-8 py-12">
            {/* Welcome hero */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center mx-auto shadow-xl shadow-violet-900/50">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100">How can I help you?</h2>
              <p className="text-slate-400 text-sm max-w-md">
                I'm trained on the AlgoLens Pro curriculum. Ask me about time complexity,
                algorithm design, or how any visualized algorithm works.
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="w-full max-w-2xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3 text-center">
                Try asking…
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestion(s)}
                    className="text-left text-sm px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-violet-950/40 hover:border-violet-700/60 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-none border-t border-slate-800 pt-4">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              id="ai-assistant-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about algorithms, complexity, or design patterns…"
              rows={1}
              disabled={isLoading}
              className="w-full resize-none rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 px-4 py-3 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ maxHeight: '160px', overflowY: 'auto' }}
              onInput={(e) => {
                const ta = e.currentTarget;
                ta.style.height = 'auto';
                ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
              }}
            />
            <div className="absolute right-2 bottom-2 text-xs text-slate-600 select-none">
              ↵
            </div>
          </div>

          <button
            type="submit"
            id="ai-assistant-send"
            disabled={!input.trim() || isLoading}
            className="flex-none w-11 h-11 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white flex items-center justify-center transition-all duration-150 shadow-md shadow-violet-900/40 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-xs text-slate-600 mt-2 text-center">
          Powered by GPT-4o mini · Shift+Enter for new line · Answers grounded in curriculum context
        </p>
      </div>
    </div>
  );
};

export default AIAssistantPage;
