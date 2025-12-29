import { useEffect, useRef, useState } from "react";
import "./ChatWidget.css";

console.log("ChatWidget chargé");

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello 👋 Je suis Assista. Comment puis-je t’aider ?" }
  ]);
  const [input, setInput] = useState("");
  const messagesRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");

    // réponse simulée
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "🤖 Je traite ta demande…" },
      ]);
    }, 800);
  };

  return (
    <>
      {open && (
        <div className="assista-window">
          <div className="assista-header">
            <div className="assista-title">
              🤖 <strong>Assista</strong>
            </div>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="assista-messages" ref={messagesRef}>
            {messages.map((m, i) => (
              <div key={i} className={`assista-bubble ${m.from}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="assista-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Assista…"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>➤</button>
          </div>
        </div>
      )}

      <button className="assista-button" onClick={() => setOpen(!open)}>
        💬
      </button>
    </>
  );
}
