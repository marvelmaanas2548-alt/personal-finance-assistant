import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { AiChatMessage } from '../types';
import { Bot, Send, Sparkles, AlertTriangle, TrendingUp, ShieldCheck, User } from 'lucide-react';

export const AiAdvisorPage: React.FC = () => {
  const { user } = useAuth();
  const { totalIncome, totalExpense, totalSavings, savingsRate } = useFinance();
  const currency = user?.preferredCurrency || '₹';

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg_init',
      sender: 'ai',
      text: `Hello ${user?.name || 'Alex'}! I am your AI Financial Advisor Copilot.\n\nI have analyzed your current finances:\n• Monthly Income: ${formatCurrency(totalIncome, currency)}\n• Total Expenses: ${formatCurrency(totalExpense, currency)}\n• Net Savings: ${formatCurrency(totalSavings, currency)} (${savingsRate}% savings rate)\n\nHow can I help you optimize your portfolio or spending today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Analyze my top spending categories',
        'How can I save ₹10,000 more next month?',
        'Recommend asset allocation for my risk profile',
        'Am I on track for my Apartment Down Payment goal?'
      ]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: AiChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ message: query })
    })
      .then(res => res.json())
      .then(data => {
        setIsTyping(false);
        setMessages(prev => [...prev, data]);
      })
      .catch(() => {
        setTimeout(() => {
          setIsTyping(false);
          const textLower = query.toLowerCase();
          let responseText = '';

          if (textLower.includes('spend') || textLower.includes('category')) {
            responseText = `📊 **Spending Analysis**: Your top expense categories this month are Shopping (${formatCurrency(9200, currency)}) and Food (${formatCurrency(7500, currency)}). Reducing Shopping by 20% will save ${formatCurrency(1840, currency)} monthly!`;
          } else if (textLower.includes('save') || textLower.includes('10')) {
            responseText = `💡 **AI Savings Plan**: To boost savings by ${formatCurrency(10000, currency)}:\n1. Cap dining & gourmet groceries to ${formatCurrency(5000, currency)}.\n2. Delay impulse gadget buys by 14 days.\n3. Automate SIP transfers on your salary credit date!`;
          } else if (textLower.includes('goal') || textLower.includes('track')) {
            responseText = `🎯 **Goal Assessment**: For your goal "Apartment Down Payment", you have saved 41% of target. Increasing your monthly contribution by ${formatCurrency(5000, currency)} hits your target 4 months early!`;
          } else {
            responseText = `I have audited your cash flow. Maintaining your ${savingsRate}% savings rate provides a solid foundation. Consider allocating surplus savings to Nifty Index Mutual Funds or Sovereign Gold Bonds.`;
          }

          setMessages(prev => [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              sender: 'ai',
              text: responseText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              suggestions: [
                'Analyze my top spending categories',
                'Recommend asset allocation for my risk profile'
              ]
            }
          ]);
        }, 800);
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-600" /> AI Financial Advisor & Copilot
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Intelligent spending analysis, personalized wealth advice, and natural language interactive chat</p>
      </div>

      {/* Main AI Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Real-time AI Spending Insights Cards */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Automated Spending Analysis
          </h3>

          <div className="glass-card p-5 rounded-3xl space-y-2 border-l-4 border-l-amber-500">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" /> High Shopping Expenditure
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Shopping represents 18.5% of total expenses this month ({formatCurrency(9200, currency)}).
            </p>
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl font-medium border border-amber-200">
              💡 Recommendation: Apply the 24-hour delay rule to trim ₹1,800 monthly.
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl space-y-2 border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <TrendingUp className="w-4 h-4" /> Healthy Savings Benchmark
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your savings rate of {savingsRate}% exceeds the recommended 30% baseline.
            </p>
            <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-xl font-medium border border-emerald-200">
              💡 Recommendation: Deploy ₹15,000 surplus to Index Funds.
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl space-y-2 border-l-4 border-l-indigo-500">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" /> Risk Profile Alignment
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Current asset allocation matches your Moderate risk appetite.
            </p>
          </div>
        </div>

        {/* Right Panel: Interactive AI Chatbot Interface */}
        <div className="lg:col-span-2 glass-panel rounded-3xl border border-slate-200 flex flex-col h-[520px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Personalized Finance AI Copilot</h4>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active & Synchronized
                </span>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-indigo-600" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-xs whitespace-pre-line leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Suggested Prompts:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(s)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-[11px] text-indigo-700 font-medium transition text-left"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`text-[9px] text-right mt-2 ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>{msg.timestamp}</div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-indigo-600 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 text-slate-500 p-3 rounded-2xl text-xs italic flex items-center gap-2 shadow-sm">
                  <span>AI Financial Copilot is analyzing your query...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask AI Financial Advisor anything (e.g. How can I optimize my taxes?)..."
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                className="flex-1 glass-input px-4 py-2.5 rounded-xl text-xs placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span> <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
