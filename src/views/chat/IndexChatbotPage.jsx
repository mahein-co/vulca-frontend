import { FaRobot } from "react-icons/fa";
import React, { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import PropType from "prop-types";

IndexChatbotPage.propTypes = {
  close: PropType.func,
};

export default function IndexChatbotPage({ close }) {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef(null);

  // useEffect(() => {
  //   addMessage("Je suis votre assistant", "Possez votre question", false);
  // }, []);

  const parseMarkdown = (text) => {
    const raw = marked.parse(text);
    return DOMPurify.sanitize(raw);
  };

  const addMessage = (role, content, showCopy = true) => {
    const html = parseMarkdown(content);

    const msg = {
      id: Date.now() + Math.random(),
      role,
      content: html,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      showCopy,
    };

    setMessages((prev) => [...prev, msg]);

    setTimeout(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    }, 50);
  };

  const copyMessage = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.innerText;

    navigator.clipboard.writeText(text).catch(() => {
      alert("Failed to copy.");
    });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    addMessage("user", currentMessage);
    setCurrentMessage("");
    setIsLoading(true);

    // Simuler une réponse d’IA
    setTimeout(() => {
      addMessage(
        "assistant",
        `Here is a generated response about: **${currentMessage}** 🤖<br><br>This is placeholder content.`
      );
      setIsLoading(false);
    }, 1500);
  };

  return (
    <React.Fragment>
      <div
        class="fixed inset-0 z-50 grid place-content-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
      >
        <div className="bg-gradient-to-br from-blue-800 via-slate-800 to-rose-900 min-h-screen p-4">
          <div className="max-w-3xl mx-auto backdrop-blur-lg bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-rose-500 to-slate-900 opacity-90"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>

              <div className="relative p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 text-white rounded-2xl backdrop-blur-sm">
                    <FaRobot />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white">Assistant</h3>
                    <p className="text-white/80 text-sm">
                      Posez votre question
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center space-x-2">
                  <button
                    onClick={close}
                    className="px-3 py-1 bg-white/20 rounded-xl backdrop-blur-sm"
                  >
                    <span className="text-white/90 text-xs font-medium">
                      Fermer
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesRef}
              className="h-96 overflow-y-auto p-6 space-y-4 custom-scrollbar"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
              }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="max-w-xs lg:max-w-md xl:max-w-lg relative group">
                    <div
                      className={`px-6 py-4 rounded-3xl ${
                        m.role === "user"
                          ? "chat-bubble-user text-white"
                          : "chat-bubble-assistant text-gray-800"
                      }`}
                      dangerouslySetInnerHTML={{ __html: m.content }}
                    />

                    <div className="text-xs mt-2 opacity-70">{m.timestamp}</div>

                    {m.role === "assistant" && m.showCopy && (
                      <button
                        onClick={() => copyMessage(m.content)}
                        className="absolute -top-2 -right-2 p-2 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 
                               rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                      >
                        📋
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="chat-bubble-assistant px-6 py-4 rounded-3xl flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce animation-delay-400"></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      Dionysus is thinking...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/10 backdrop-blur-sm bg-white/5">
              <form onSubmit={sendMessage} className="flex space-x-4">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  disabled={isLoading}
                  placeholder="Ask me anything about alcohol, cocktails, brands..."
                  className="flex-1 px-6 py-4 bg-white/90 border border-white/20 rounded-2xl text-gray-800 focus:ring-2 focus:ring-pink-500"
                />

                <button
                  type="submit"
                  disabled={isLoading || !currentMessage.trim()}
                  className="send-button px-6 py-4 text-white rounded-2xl shadow-lg disabled:opacity-50"
                >
                  {isLoading ? "..." : "➤"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
