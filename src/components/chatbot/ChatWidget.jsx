import { useEffect, useRef, useState } from "react";
import "./ChatWidget.css";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "bot",
      text: "Hello 👋 Je suis Assista. Comment puis-je t’aider ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // 1️⃣ Message utilisateur
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "user", text },
    ]);

    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8001/api/rag/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          session_id: "frontend-session",
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur API chatbot");
      }

      const data = await response.json();

      const answer =
        typeof data.answer === "string"
          ? data.answer.trim()
          : "❌ Réponse invalide du serveur.";

      // 2️⃣ Message bot (réponse complète)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          text: answer,
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          from: "bot",
          text: "❌ Une erreur est survenue. Réessaie plus tard.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="assista-window">
          <div className="assista-header">
            <div className="assista-title">
              <strong>Assista</strong>
            </div>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="assista-messages" ref={messagesRef}>
            {messages.map((m) => (
              <div key={m.id} className={`assista-bubble ${m.from}`}>
                {m.text}
              </div>
            ))}

            {isLoading && (
              <div className="assista-bubble bot assista-loading">
                Assista réfléchit<span className="dots"></span>
              </div>
            )}
          </div>

          <div className="assista-input">
            {/*<input
              value={input}
              disabled={isLoading}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Assista…"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />*/}

            <textarea
              value={input}
              disabled={isLoading}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Assista…"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button onClick={sendMessage} disabled={isLoading}>
              {isLoading ? "…" : "➤"}
            </button>
          </div>
        </div>
      )}

      <button className="assista-button" onClick={() => setOpen(!open)}>
        💬
      </button>
    </>
  );
}
