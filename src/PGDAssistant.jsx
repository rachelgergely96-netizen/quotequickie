import React, { useState, useRef, useEffect } from 'react';

// PGD Contact & Priority Data
const CONTACTS_DATA = {
  contacts: [
    { name: "Spoiler Alert", category: "LIQUIDATION PLATFORMS", email: "sales@spoileralert.com", phone: "(617) 917-4123" },
    { name: "DirectLiquidation", category: "LIQUIDATION PLATFORMS", email: "", phone: "" },
    { name: "Lewisco Holdings", category: "DIVERTERS & LIQUIDATORS", email: "", phone: "(917) 210-9395", notes: "LARGEST player, 3,000+ mfr relationships" },
    { name: "WorldFoods", category: "DIVERTERS & LIQUIDATORS", email: "jeff@worldfoodsinc.com", phone: "(651) 426-4211", contact_person: "Jeff Matthies" },
    { name: "Marvell Foods", category: "DIVERTERS & LIQUIDATORS", email: "marilyn@marvellfoods.com", phone: "(561) 213-2289", contact_person: "Marilyn Raybin" },
    { name: "Wham Foods", category: "DIVERTERS & LIQUIDATORS", email: "", phone: "(954) 920-7857", notes: "LOCAL to Florida" },
    { name: "Harold Levinson Associates (HLA)", category: "C-STORE DISTRIBUTORS", email: "", phone: "(800) 325-2512", notes: "5th largest c-store distributor, 600,000 sq ft facility, Covers NY, NJ, CT, MA" },
    { name: "McLane Company", category: "C-STORE DISTRIBUTORS", email: "", phone: "", notes: "#1 national distributor, 90,000 locations" },
    { name: "Core-Mark/PFG", category: "C-STORE DISTRIBUTORS", email: "", phone: "", notes: "#2 national distributor" },
    { name: "Grocery Outlet", category: "GROCERY CHAINS", email: "dcurtis@cfgo.com", phone: "", contact_person: "Diana Curtis" },
    { name: "Petrik Salvage Market", category: "FLORIDA SALVAGE STORES", email: "", phone: "(941) 747-3194", location: "Bradenton" },
    { name: "Miami Depot", category: "FLORIDA SALVAGE STORES", email: "", phone: "(786) 337-8334", location: "Hialeah" },
    { name: "Gully's Surplus Grocery", category: "FLORIDA SALVAGE STORES", email: "", phone: "(813) 645-4801", location: "Ruskin" },
    { name: "Tin Can Pams", category: "FLORIDA SALVAGE STORES", email: "", phone: "(352) 567-3719", location: "Dade City" }
  ],
  priorities: [
    { week: "1", action: "Join Spoiler Alert Buyer Network", category: "Liquidation Platforms" },
    { week: "1", action: "Call Lewisco Holdings, WorldFoods", category: "Diverters" },
    { week: "2", action: "Contact Grocery Outlet buyers", category: "Grocery Chains" },
    { week: "2", action: "Apply to Harold Levinson Associates", category: "C-Store Distributors" },
    { week: "3", action: "Register on RangeMe for Wakefern", category: "Grocery Chains" },
    { week: "3", action: "Build Florida salvage store relationships", category: "Salvage Stores" },
    { week: "4+", action: "Attempt direct manufacturer contacts", category: "Major Manufacturers" }
  ]
};

// Build system prompt for the AI
const buildSystemPrompt = () => {
  let prompt = `You are a helpful AI assistant for PGD (Prestige Global Distributors). You help with CPG liquidation sourcing contacts, priorities, and quoting strategy.

## SOURCING CONTACTS
`;
  CONTACTS_DATA.contacts.forEach(c => {
    const email = c.email ? `, Email: ${c.email}` : '';
    const phone = c.phone ? `, Phone: ${c.phone}` : '';
    const person = c.contact_person ? ` (Contact: ${c.contact_person})` : '';
    const notes = c.notes ? ` - ${c.notes}` : '';
    prompt += `- ${c.name}${person} [${c.category}]${email}${phone}${notes}\n`;
  });

  prompt += `\n## PRIORITY ACTIONS (Weekly Plan)\n`;
  CONTACTS_DATA.priorities.forEach((p, i) => {
    prompt += `${i + 1}. Week ${p.week}: ${p.action} (${p.category})\n`;
  });

  prompt += `
## YOUR CAPABILITIES
You can help with:
1. Finding contact information (emails, phone numbers)
2. Recommending who to contact and when
3. Explaining sourcing categories (liquidation platforms, diverters, distributors, etc.)
4. Providing talking points for calls
5. CPG liquidation pricing and strategy advice
6. Quote preparation tips

Be concise, professional, and reference specific contacts when relevant.`;

  return prompt;
};

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL = 'llama3.2';

export default function PGDAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'system', content: "Hi! I'm your PGD sourcing assistant. Ask me about contacts, priorities, or strategy!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  // Check Ollama connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/tags', {
          signal: AbortSignal.timeout(3000)
        });
        setIsConnected(response.ok);
      } catch {
        setIsConnected(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
    setConversationHistory(newHistory);
    setIsLoading(true);

    try {
      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...newHistory
          ],
          stream: false
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantMessage = data.message.content;

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Cannot connect to Ollama. Make sure it\'s running (ollama serve)'
      }]);
    }

    setIsLoading(false);
  };

  const quickActions = [
    { label: "Who first?", question: "Who should I contact first this week?" },
    { label: "Contacts w/ email", question: "Show me contacts that have email addresses" },
    { label: "Diverters", question: "Tell me about the diverter contacts" },
    { label: "HLA info", question: "What do you know about Harold Levinson Associates?" }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center z-50"
        title="PGD Sourcing Assistant"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-semibold">PGD Sourcing Assistant</h3>
          <div className="flex items-center gap-2 text-xs opacity-90">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
            {isConnected ? 'Ollama Connected' : 'Ollama Offline'}
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white text-2xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'ml-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                : msg.role === 'error'
                ? 'mx-auto bg-red-100 text-red-700 text-center'
                : msg.role === 'system'
                ? 'mx-auto bg-amber-100 text-amber-800 text-center'
                : 'bg-white text-slate-700 shadow-sm border border-slate-100'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-1 p-3 bg-white rounded-xl w-fit shadow-sm">
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-2 border-t border-slate-200 bg-white">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(action.question);
                setTimeout(() => sendMessage(), 100);
              }}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-full whitespace-nowrap transition-colors disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about contacts, priorities..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 disabled:bg-slate-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
