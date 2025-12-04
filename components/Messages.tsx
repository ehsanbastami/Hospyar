import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, User, Bot, MoreVertical, Phone, Video, Plus, Search, X } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Contact {
  id: string;
  name: string;
  role: string;
  isAi: boolean;
}

const ALL_CONTACTS: Contact[] = [
  { id: 'ai', name: 'دستیار هوشمند', role: 'هوش مصنوعی', isAi: true },
  { id: 'c1', name: 'دکتر حسینی', role: 'متخصص قلب', isAi: false },
  { id: 'c2', name: 'خانم رضایی', role: 'سرپرستار ICU', isAi: false },
  { id: 'c3', name: 'دکتر کمالی', role: 'رزیدنت داخلی', isAi: false },
  { id: 'c4', name: 'پشتیبانی فنی', role: 'IT', isAi: false },
];

const Messages: React.FC = () => {
  const [activeContactId, setActiveContactId] = useState<string>('ai');
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({
    'ai': [{ id: '1', sender: 'AI Assistant', text: 'سلام! چطور می‌توانم امروز کمکتان کنم؟', isMe: false, time: '14:45' }],
    'c1': [{ id: '2', sender: 'دکتر حسینی', text: 'سلام، مشاوره بیمار تخت ۴ انجام شد؟', isMe: false, time: '10:30' }],
    'c2': [],
    'c3': [],
    'c4': []
  });
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeContact = ALL_CONTACTS.find(c => c.id === activeContactId) || ALL_CONTACTS[0];
  const activeMessages = conversations[activeContactId] || [];

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hospyar_chats');
    if (saved) {
      try {
        setConversations(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chats", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('hospyar_chats', JSON.stringify(conversations));
  }, [conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [activeMessages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Me',
      text: input,
      isMe: true,
      time: new Date().toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})
    };

    // Update conversation state
    setConversations(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), userMsg]
    }));
    
    setInput('');

    // AI Response Logic
    if (activeContact.isAi) {
        setIsTyping(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are a helpful medical assistant bot in a dashboard chat. 
                User says: "${userMsg.text}". 
                Reply in Persian, short and professional.`
            });

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'AI Assistant',
                text: response.text || 'متوجه نشدم.',
                isMe: false,
                time: new Date().toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})
            };

            setConversations(prev => ({
                ...prev,
                [activeContactId]: [...(prev[activeContactId] || []), botMsg]
            }));
        } catch (e) {
            console.error(e);
        } finally {
            setIsTyping(false);
        }
    } else {
        // Mock response for human users could be added here
    }
  };

  const startNewChat = (contactId: string) => {
      setActiveContactId(contactId);
      setShowNewChatModal(false);
      // Ensure conversation entry exists
      if (!conversations[contactId]) {
          setConversations(prev => ({ ...prev, [contactId]: [] }));
      }
  };

  // Filter contacts for modal
  const filteredContacts = ALL_CONTACTS.filter(c => 
      c.name.includes(searchTerm) || c.role.includes(searchTerm)
  );

  return (
    <div className="flex h-[calc(100vh-140px)] bg-dark-800 rounded-3xl border border-dark-700 overflow-hidden relative">
      
      {/* Sidebar List */}
      <div className="w-80 border-l border-dark-700 hidden md:flex flex-col">
        <div className="p-4 border-b border-dark-700 flex gap-2">
            <div className="relative flex-1">
                 <input 
                    type="text" 
                    placeholder="جستجو..." 
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl px-8 py-2 text-sm text-white focus:outline-none" 
                 />
                 <Search className="absolute right-2 top-2.5 text-gray-500" size={16} />
            </div>
            <button 
                onClick={() => setShowNewChatModal(true)}
                className="bg-primary hover:bg-primary/90 text-white p-2 rounded-xl transition-colors"
            >
                <Plus size={20} />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto">
            {ALL_CONTACTS.map((contact) => {
                const msgs = conversations[contact.id] || [];
                const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].text : '...';
                const isActive = activeContactId === contact.id;

                return (
                    <div 
                        key={contact.id} 
                        onClick={() => setActiveContactId(contact.id)}
                        className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-dark-700 transition-colors ${isActive ? 'bg-dark-700/50 border-r-4 border-primary' : 'border-r-4 border-transparent'}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-primary' : 'border-dark-600'} bg-dark-600`}>
                            {contact.isAi ? <Bot size={24} className="text-primary"/> : <User size={24} className="text-gray-400"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className={`font-bold text-sm truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>{contact.name}</h4>
                                {msgs.length > 0 && <span className="text-[10px] text-gray-500">{msgs[msgs.length-1].time}</span>}
                            </div>
                            <p className="text-gray-500 text-xs truncate">{lastMsg}</p>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-20 border-b border-dark-700 flex items-center justify-between px-6 bg-dark-900/30">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center border border-dark-600">
                    {activeContact.isAi ? <Bot size={24} className="text-primary"/> : <User size={24} className="text-gray-400"/>}
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">{activeContact.name}</h3>
                    <div className="flex items-center gap-2">
                         <span className={`w-2 h-2 rounded-full ${activeContact.isAi ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
                         <span className="text-xs text-gray-400">{activeContact.role}</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-4 text-gray-400">
                <button className="p-2 hover:bg-dark-700 rounded-full transition-colors"><Phone size={20} /></button>
                <button className="p-2 hover:bg-dark-700 rounded-full transition-colors"><Video size={20} /></button>
                <button className="p-2 hover:bg-dark-700 rounded-full transition-colors"><MoreVertical size={20} /></button>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${
                        msg.isMe 
                            ? 'bg-primary text-white rounded-br-none' 
                            : 'bg-dark-700 text-gray-200 rounded-bl-none'
                    }`}>
                        <p className="text-sm leading-7">{msg.text}</p>
                        <span className={`text-[10px] block mt-2 opacity-70 ${msg.isMe ? 'text-left' : 'text-right'}`}>{msg.time}</span>
                    </div>
                </div>
            ))}
            {activeMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4 opacity-50">
                    <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center">
                        <User size={40} />
                    </div>
                    <p>هنوز پیامی ارسال نشده است. گفتگو را آغاز کنید!</p>
                </div>
            )}
            {isTyping && activeContact.isAi && (
                <div className="flex justify-end">
                    <div className="bg-dark-700 p-4 rounded-2xl rounded-bl-none">
                        <div className="flex gap-1.5">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-dark-700 flex gap-4 bg-dark-900/50">
            <input 
                type="text" 
                placeholder="پیام خود را بنویسید..." 
                className="flex-1 bg-dark-800 border border-dark-600 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-primary placeholder-gray-500 transition-colors"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-xl transition-all shadow-lg shadow-primary/20"
            >
                <Send size={24} />
            </button>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-dark-800 w-full max-w-md rounded-3xl border border-dark-700 shadow-2xl flex flex-col max-h-[80%]">
                <div className="p-5 border-b border-dark-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">شروع گفتگوی جدید</h3>
                    <button onClick={() => setShowNewChatModal(false)} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-4 border-b border-dark-700">
                     <div className="relative">
                        <input 
                            type="text" 
                            placeholder="جستجوی نام یا تخصص..." 
                            className="w-full bg-dark-900 border border-dark-600 rounded-xl px-10 py-3 text-white focus:outline-none focus:border-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute right-3 top-3.5 text-gray-500" size={20} />
                     </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {filteredContacts.map(contact => (
                        <div 
                            key={contact.id}
                            onClick={() => startNewChat(contact.id)}
                            className="flex items-center gap-4 p-3 hover:bg-dark-700 rounded-xl cursor-pointer transition-colors"
                        >
                             <div className="w-12 h-12 rounded-full bg-dark-600 flex items-center justify-center text-gray-300 border border-dark-500">
                                {contact.isAi ? <Bot size={24}/> : <User size={24}/>}
                             </div>
                             <div>
                                <h4 className="text-white font-bold">{contact.name}</h4>
                                <p className="text-sm text-gray-400">{contact.role}</p>
                             </div>
                        </div>
                    ))}
                    {filteredContacts.length === 0 && (
                        <p className="text-center text-gray-500 py-8">کاربری یافت نشد.</p>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Messages;