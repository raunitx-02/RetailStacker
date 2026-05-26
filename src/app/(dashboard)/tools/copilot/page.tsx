"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Sparkles, Send, Bot, User, TrendingUp } from "lucide-react";

type Platform = "amazon" | "flipkart" | "meesho" | "shopify";

const PLATFORMS: { id: Platform; name: string; logo: string; color: string }[] = [
  { id: "amazon", name: "Amazon", logo: "/amazon-logo.png", color: "#FF9900" },
  { id: "flipkart", name: "Flipkart", logo: "/flipkart-logo.svg", color: "#047BD5" },
  { id: "meesho", name: "Meesho", logo: "/meesho-logo.png", color: "#9B30FF" },
  { id: "shopify", name: "Shopify", logo: "/shopify-logo.png", color: "#5E8E3E" },
];

const QUICK_PROMPTS: Record<Platform, string[]> = {
  amazon: [
    "Meri sales kyu gir rahi hai?",
    "Find hijacker on my listing",
    "How to rank on page 1?",
    "Optimize PPC for my ASIN",
    "Analyze my BSR trend",
  ],
  flipkart: [
    "How to win Flipkart Assured badge?",
    "Why is my Flipkart listing not ranking?",
    "Flipkart pricing strategy tips",
    "How to improve my seller rating?",
  ],
  meesho: [
    "How to reduce Meesho returns?",
    "Best categories to sell on Meesho?",
    "Meesho penalty avoidance tips",
    "How to increase Meesho orders?",
  ],
  shopify: [
    "How to improve my Shopify conversion rate?",
    "Best Shopify apps for Indian sellers?",
    "How to set up Shopify abandoned cart recovery?",
    "Shopify SEO optimization checklist",
    "How to run a successful Shopify discount campaign?",
  ],
};

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

// Very basic markdown parser for the AI response
const formatMarkdown = (text: string) => {
  let html = text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Headers
    .replace(/### (.*?)\n/g, "<h3 style='margin-top: 16px; margin-bottom: 8px; font-size: 16px; color: var(--text-primary); font-weight: 700'>$1</h3>")
    // Bullet points
    .replace(/\* (.*?)\n/g, "<li style='margin-bottom: 6px; margin-left: 20px;'>$1</li>")
    // Line breaks
    .replace(/\n/g, "<br />");
  
  return html;
};

export default function CopilotPage() {
  const [platform, setPlatform] = useState<Platform>("amazon");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello! I am your Neon 10 AI Seller Copilot. I can advise you across **Amazon, Flipkart, Meesho, and Shopify**. Ask me anything like **'Meri sales kyu gir rahi hai?'**, **'How do I fix my Shopify conversion rate?'**, or **'How to win Flipkart Assured badge?'**"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/amazon/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, platform }),
      });
      const data = await res.json();
      
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", content: data.reply || "Sorry, I could not process that request." };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: "Failed to connect to AI core. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = QUICK_PROMPTS[platform];
  const activePlatform = PLATFORMS.find(p => p.id === platform)!;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 100px)", maxWidth: 900, margin: "0 auto" }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles color="var(--purple)" size={28} /> AI Seller Copilot
          </h1>
          <p className="page-subtitle">Your personal growth advisor for Amazon, Flipkart, Meesho & Shopify — all in one AI.</p>
        </div>
      </div>

      {/* Platform switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", flexShrink: 0 }}>
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 14px", borderRadius: 50, cursor: "pointer",
              background: platform === p.id ? `${p.color}18` : "var(--bg-secondary)",
              border: `1.5px solid ${platform === p.id ? p.color : "var(--border)"}`,
              transition: "all 0.15s", whiteSpace: "nowrap" as const,
            }}
          >
            <Image src={p.logo} alt={p.name} width={16} height={16} style={{ objectFit: "contain" }} unoptimized />
            <span style={{ fontSize: 12, fontWeight: 700, color: platform === p.id ? p.color : "var(--text-muted)" }}>{p.name}</span>
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Chat Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: "flex", gap: 16, marginBottom: 24, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "ai" && (
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--purple-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Bot size={20} color="var(--purple)" />
                </div>
              )}
              
              <div style={{
                maxWidth: "75%",
                padding: "16px 20px",
                borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                background: msg.role === "user" ? "var(--accent)" : "var(--bg-secondary)",
                color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                fontSize: 15,
                lineHeight: 1.6,
                boxShadow: msg.role === "user" ? "0 4px 20px var(--accent-glow)" : "none",
                border: msg.role === "ai" ? "1px solid var(--border)" : "none"
              }}>
                <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
              </div>

              {msg.role === "user" && (
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <User size={20} color="var(--accent)" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--purple-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bot size={20} color="var(--purple)" />
              </div>
              <div style={{ padding: "16px 20px", borderRadius: "20px 20px 20px 4px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
                <div className="spinner" style={{ width: 14, height: 14 }} />
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Analyzing seller metrics...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div style={{ padding: "0 24px 16px", display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none" }}>
          {quickPrompts.map(prompt => (
            <button
              key={prompt}
              className="btn-ghost"
              onClick={() => handleSend(prompt)}
              disabled={loading}
              style={{ padding: "8px 16px", borderRadius: 50, fontSize: 13, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6, background: "var(--bg-primary)", border: "1px solid var(--border)" }}
            >
              <TrendingUp size={14} color="var(--accent)" /> {prompt}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div style={{ padding: "0 24px 24px" }}>
          <div style={{ display: "flex", gap: 12, background: "var(--bg-primary)", padding: "8px", borderRadius: 16, border: "1px solid var(--border)" }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Ask Copilot about your sales, keywords, or competitors..."
              style={{ flex: 1, background: "transparent", border: "none", color: "var(--text-primary)", fontSize: 15, padding: "0 16px", outline: "none" }}
              disabled={loading}
            />
            <button
              className="btn-accent"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
