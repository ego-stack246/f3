import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { safeGenerateContent, FITBOT_SYSTEM_INSTRUCTION } from '../lib/gemini';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
};

const INITIAL_MESSAGES: Message[] = [
  { id: '1', sender: 'bot', text: 'Hi there! I\'m FitBot 🤖💪 — your AI diet planner & personal trainer. Ask me anything about workouts, meal plans, or wellness!' }
];

const SUGGESTIONS = [
  "Create a meal plan for weight loss 🥗",
  "Suggest a home workout routine 🏋️",
  "How many calories in a banana? 🍌",
  "Best exercises for beginners?"
];

// Maintain conversation history for context-aware responses
type ChatMessage = { role: 'user' | 'model'; parts: { text: string }[] };

export default function FitBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<ChatMessage[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Add user message to history
    chatHistoryRef.current.push({ role: 'user', parts: [{ text }] });

    try {
      const response = await safeGenerateContent({
        model: 'gemini-2.5-flash',
        contents: chatHistoryRef.current,
        config: {
          systemInstruction: FITBOT_SYSTEM_INSTRUCTION,
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      const botText = response.text ?? "Sorry, I couldn't generate a response. Please try again!";

      // Add model response to history
      chatHistoryRef.current.push({ role: 'model', parts: [{ text: botText }] });

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botText
      }]);
    } catch (error) {
      console.error('Gemini API error:', error);
      const errorMsg = error instanceof Error && error.message.includes('API_KEY')
        ? '🔑 API key not configured. Add your Gemini API key to the .env file (VITE_GEMINI_API_KEY).'
        : '⚠️ Something went wrong. Please check your connection and try again.';

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: errorMsg
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-300 z-50",
          "bg-sage-600 hover:bg-sage-700 text-white hover:scale-105",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[370px] h-[520px] glass-card flex flex-col overflow-hidden z-50 shadow-2xl border-white/60"
          >
            {/* Header */}
            <div className="bg-sage-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <div>
                  <span className="font-semibold">FitBot</span>
                  <span className="text-[10px] ml-2 bg-white/20 px-1.5 py-0.5 rounded-full">Gemini 2.5 Flash</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-cream-50/50 flex flex-col gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-2 max-w-[85%]", msg.sender === 'user' ? "self-end flex-row-reverse" : "self-start")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", msg.sender === 'user' ? "bg-sage-200" : "bg-sage-100")}>
                    {msg.sender === 'user' ? <User className="w-4 h-4 text-sage-800" /> : <Bot className="w-4 h-4 text-sage-800" />}
                  </div>
                  <div className={cn("p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap", msg.sender === 'user' ? "bg-sage-600 text-white rounded-tr-none" : "bg-white text-earth-800 rounded-tl-none")}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 self-start max-w-[85%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-sage-100">
                    <Bot className="w-4 h-4 text-sage-800" />
                  </div>
                  <div className="p-3 rounded-2xl text-sm shadow-sm bg-white text-earth-800 rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-sage-500" />
                    <span className="text-earth-800/50">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length < 3 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {SUGGESTIONS.map((sug, i) => (
                  <button key={i} onClick={() => handleSend(sug)} className="text-xs bg-cream-200 hover:bg-cream-300 text-earth-800 py-1.5 px-3 rounded-full transition-colors">
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 bg-white border-t border-cream-200">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about diet, workouts, wellness..."
                  className="flex-1 bg-cream-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-300"
                  disabled={isLoading}
                />
                <button type="submit" disabled={!input.trim() || isLoading} className="p-2 bg-sage-500 text-white rounded-full hover:bg-sage-600 disabled:opacity-50 disabled:hover:bg-sage-500 transition-colors">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
