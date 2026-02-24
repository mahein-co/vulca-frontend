import React, { useEffect, useRef, useState } from "react";
import { FaRobot, FaPaperPlane, FaPlus, FaHistory, FaTimes, FaBars, FaExpandAlt, FaCompressAlt, FaTrash, FaEdit, FaCheck, FaFileAlt, FaFileExcel } from "react-icons/fa";
import { marked } from "marked";
import DOMPurify from "dompurify";
import PropTypes from "prop-types";
import {
  useGetHistoriesQuery,
  useCreateHistoryMutation,
  useSendMessageMutation,
  useGetMessagesQuery,
  useRenameHistoryMutation,
  useDeleteHistoryMutation
} from "../../states/chat/chatbotApiSlice";
import { useProjectId } from "../../hooks/useProjectId";
import Swal from "sweetalert2";
import { useTheme } from "../../states/context/ThemeContext";
import { useSelector, useDispatch } from 'react-redux';  // MODIFIÉ
import { selectFilteredData, setActiveFilter } from '../../states/dashboard/dashboardFilterSlice';  // MODIFIÉ

export default function IndexChatbotPage({ close }) {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const themeContext = useTheme();
  const theme = themeContext?.theme || 'dark';
  const isDarkMode = theme === 'dark';

  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const messagesRef = useRef(null);

  const projectId = useProjectId();
  const dispatch = useDispatch(); // NOUVEAU
  const filteredData = useSelector(selectFilteredData);  // NOUVEAU: Récupérer les données filtrées

  const { data: histories, isLoading: loadingHistories } = useGetHistoriesQuery(projectId);
  const [createHistory] = useCreateHistoryMutation();
  const [sendMessage, { isLoading: sendingMessage }] = useSendMessageMutation();
  const [renameHistory] = useRenameHistoryMutation();
  const [deleteHistory] = useDeleteHistoryMutation();

  const { data: dbMessages, isLoading: loadingMessages } = useGetMessagesQuery(
    { historyId: selectedHistoryId, projectId },
    { skip: !selectedHistoryId }
  );

  const parseMarkdown = (text) => {
    if (!text) return "";
    try {
      const raw = marked ? marked.parse(String(text)) : String(text);
      return DOMPurify && DOMPurify.sanitize ? DOMPurify.sanitize(raw) : raw;
    } catch (e) {
      return String(text);
    }
  };

  useEffect(() => {
    /*const rawMessages = dbMessages?.results || dbMessages;*/
    const rawMessages = dbMessages?.history?.chat_messages || dbMessages?.chat_messages || [];
    console.log("Chatbot rawMessages:", rawMessages);
    console.log("📨 Full dbMessages:", dbMessages);

    if (rawMessages && Array.isArray(rawMessages)) {
      const flat = [];
      rawMessages.forEach(m => {
        // Handle both standard formats and possible variations
        const userInput = m.user_input || m.message || m.content || "";
        const aiResponse = m.ai_response || m.response || m.answer || "";

        if (userInput) {
          flat.push({ role: "user", content: userInput });
        }
        if (aiResponse) {
          flat.push({
            role: "assistant",
            content: parseMarkdown(aiResponse),
            calculation: m.calculation
          });
        }
      });
      console.log("Chatbot flat messages:", flat);
      setMessages(flat);
    } else {
      console.log("⚠️ No messages array found");
      setMessages([]);
    }
  }, [dbMessages]);

  useEffect(() => {
    const rawHistories = histories?.histories || histories;
    console.log("Chatbot rawHistories:", rawHistories);
    if (rawHistories && Array.isArray(rawHistories) && rawHistories.length > 0 && !selectedHistoryId) {
      // Trier par ID décroissant pour avoir le plus récent en premier
      const sorted = [...rawHistories].sort((a, b) => b.id - a.id);
      console.log("Chatbot selectedHistoryId setting to:", sorted[0].id);
      setSelectedHistoryId(sorted[0].id);
    }
  }, [histories, selectedHistoryId]);

  useEffect(() => {
    if (messagesRef.current) {
      const scroll = () => {
        messagesRef.current.scrollTo({
          top: messagesRef.current.scrollHeight,
          behavior: "smooth"
        });
      };
      scroll();
      const timer = setTimeout(scroll, 300); // Back-up for late renders
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleNewChat = async () => {
    try {
      /*const result = await createHistory({ title: "Nouvelle discussion" }).unwrap();*/
      const result = await createHistory({
        data: { title: "Nouvelle discussion" },
        project_id: projectId
      }).unwrap();

      const historyId = result?.history?.id || result?.id;
      console.log("New history created with ID:", historyId);

      /*setSelectedHistoryId(result.id);*/
      setSelectedHistoryId(historyId);
      setMessages([]);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (err) {
      console.error("Failed to create history", err);

      Swal.fire({
        title: 'Erreur',
        text: err?.data?.message || "Impossible de créer une nouvelle discussion",
        icon: 'error',
        background: isDarkMode ? '#1e293b' : '#fff',
        color: isDarkMode ? '#fff' : '#1e293b'
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    const userText = currentMessage;
    setCurrentMessage("");
    // Optimistic update for UI
    setMessages(prev => [...prev, { role: "user", content: userText }]);

    try {
      let historyId = selectedHistoryId;

      // If no history selected, create one first
      if (!historyId) {
        const result = await createHistory({
          data: { title: "Nouvelle discussion" },
          project_id: projectId
        }).unwrap();
        historyId = result?.history?.id || result?.id;
        setSelectedHistoryId(historyId);
        // Refresh histories list if needed, but the mutation should handle invalidation
      }

      console.log("📤 Envoi message au chatbot...");
      console.log("📊 Données filtrées incluses:", filteredData ? "OUI" : "NON");
      if (filteredData) console.log("🔍 Détail données filtrées:", filteredData);

      const response = await sendMessage({
        data: {
          user_input: userText,
          message_history: historyId,
          project_id: projectId,
          filtered_data: filteredData  // NOUVEAU: Envoyer les données filtrées
        },
        project_id: projectId
      }).unwrap();

      // ✅ APPLICATION DU FILTRE SUGGÉRÉ (SI PRÉSENT)
      if (response?.suggested_filter) {
        console.log("🎯 Filtre suggéré détecté:", response.suggested_filter);
        const { type, value, label } = response.suggest_filter || response.suggested_filter;

        // On importe dispatch et setActiveFilter (nécessite l'ajout en haut du fichier)
        // dispatch(setActiveFilter({ filterType: type, filterValue: value, filterLabel: label, page: "dashboard" }));

        // NOTE: dispatch est déjà disponible via un hook que je vais ajouter plus haut
        dispatch(setActiveFilter({
          filterType: type,
          filterValue: value,
          filterLabel: label,
          page: "dashboard"
        }));

        Swal.fire({
          title: 'Filtre appliqué',
          text: `Le tableau de bord a été filtré sur : ${label}`,
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          background: isDarkMode ? '#1e293b' : '#fff',
          color: isDarkMode ? '#fff' : '#1e293b'
        });
      }
    } catch (err) {
      console.error("Failed to send", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Une erreur est survenue lors de l'envoi."
      }]);
    }
  };

  const handleRename = async (id, oldTitle) => {
    setEditingHistoryId(id);
    setEditingTitle(oldTitle);
  };

  const submitRename = async (id) => {
    if (!editingTitle.trim()) return;
    try {
      await renameHistory({ historyId: id, title: editingTitle, project_id: projectId }).unwrap();
      setEditingHistoryId(null);
    } catch (err) {
      console.error("Rename failed", err);
      Swal.fire({
        title: 'Erreur',
        text: "Impossible de modifier le titre.",
        icon: 'error',
        background: isDarkMode ? '#1e293b' : '#fff',
        color: isDarkMode ? '#fff' : '#1e293b'
      });
    }
  };

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: 'Supprimer ?',
      text: "Cette discussion sera définitivement supprimée.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      background: isDarkMode ? '#1e293b' : '#fff',
      color: isDarkMode ? '#fff' : '#1e293b'
    });

    if (result.isConfirmed) {
      try {
        await deleteHistory({ historyId: id, project_id: projectId }).unwrap();
        if (selectedHistoryId === id) {
          setSelectedHistoryId(null);
          setMessages([]);
        }
        Swal.fire({
          title: 'Supprimé !',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: isDarkMode ? '#1e293b' : '#fff',
          color: isDarkMode ? '#fff' : '#1e293b'
        });
      } catch (err) {
        console.error("Failed to delete", err);
        Swal.fire({
          title: 'Erreur',
          text: "Impossible de supprimer cette discussion.",
          icon: 'error',
          background: isDarkMode ? '#1e293b' : '#fff',
          color: isDarkMode ? '#fff' : '#1e293b'
        });
      }
    }
  };

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  // Effect to handle window resize for responsiveness
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // EXPLICIT STYLING - Robust for all devices
  const containerStyle = isFullScreen
    ? "fixed inset-0 z-[10015] flex flex-col md:flex-row shadow-2xl overflow-hidden"
    : isMobile
      ? "fixed inset-0 z-[10015] flex flex-col overflow-hidden shadow-2xl h-[100vh]"
      : "fixed bottom-20 right-6 z-[10015] w-[420px] max-w-[calc(100vw-3rem)] h-[80vh] max-h-[800px] flex flex-col rounded-2xl border overflow-hidden shadow-2xl transition-all duration-300";

  const bgColor = isDarkMode ? "#0f172a" : "#ffffff";
  const textColor = isDarkMode ? "#f8fafc" : "#1e293b";
  const borderColor = isDarkMode ? "#334155" : "#e2e8f0";
  const headerBg = isDarkMode ? "#1e293b" : "#f8fafc";
  const sidebarBg = isDarkMode ? "#020617" : "#f1f5f9";

  return (
    <div
      className={containerStyle}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderColor
      }}
    >
      {/* BACKDROP */}
      {isSidebarOpen && (!isFullScreen || isMobile) && (
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[70] transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${isFullScreen && !isMobile ? (isSidebarOpen ? "relative md:w-72 border-r" : "absolute -translate-x-full") : "absolute inset-y-0 left-0 w-[280px] z-[75]"}
        h-full bg-inherit flex flex-col transition-all duration-300 ease-in-out border-r overflow-hidden shrink-0 shadow-2xl
        ${(isSidebarOpen || (isFullScreen && !isMobile)) ? "p-4 md:p-6" : "p-0"}
      `} style={{ backgroundColor: sidebarBg, borderColor }}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FaHistory className="text-indigo-500" /> <span style={{ color: textColor }}>Historique</span>
          </h2>
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-red-500">
            <FaTimes />
          </button>
        </div>

        <button
          onClick={handleNewChat}
          className="flex items-center justify-center gap-2 w-full py-2.5 mb-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-md font-medium text-sm shrink-0"
        >
          <FaPlus size={10} /> Nouveau Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
          {loadingHistories ? (
            <div className="opacity-40 text-sm animate-pulse text-center">Chargement...</div>
          ) : Array.isArray(histories?.histories || histories) && (histories?.histories || histories).length > 0 ? (
            (histories?.histories || histories).map(h => (
              <div
                key={h.id}
                onClick={() => {
                  setSelectedHistoryId(h.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  group flex items-center gap-2 w-full p-2.5 rounded-xl text-xs transition-all cursor-pointer
                  ${selectedHistoryId === h.id
                    ? (isDarkMode ? "bg-indigo-600/20 text-indigo-400 font-bold" : "bg-indigo-100 text-indigo-700 font-bold")
                    : "text-gray-500 hover:text-indigo-500 hover:bg-black/5"}
                `}
              >
                {editingHistoryId === h.id ? (
                  <div className="flex flex-1 items-center gap-1" onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      className="bg-transparent border-b border-indigo-500 outline-none flex-1 py-0.5 w-0"
                      style={{ color: textColor }}
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitRename(h.id)}
                    />
                    <button onClick={() => submitRename(h.id)} className="p-1 text-emerald-500"><FaCheck size={10} /></button>
                  </div>
                ) : (
                  <span className="flex-1 truncate">{h.title}</span>
                )}
                {!editingHistoryId && (
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleRename(h.id, h.title)} className="p-1 hover:text-indigo-400"><FaEdit size={11} /></button>
                    <button onClick={(e) => handleDeleteHistory(h.id, e)} className="p-1 hover:text-red-500"><FaTrash size={11} /></button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-[10px] opacity-20 text-center py-4">Aucune discussion</div>
          )}
        </div>
      </aside>

      {/* SIDEBAR OVERLAY FOR MOBILE/STANDARD */}
      {isSidebarOpen && (!isFullScreen || isMobile) && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden z-10 w-full">
        {/* HEADER */}
        <header className="px-5 py-4 border-b shrink-0 flex items-center justify-between z-[80]" style={{ backgroundColor: headerBg, borderColor }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-black/5"
              title={isSidebarOpen ? "Masquer l'historique" : "Afficher l'historique"}
            >
              <FaBars size={18} />
            </button>
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shrink-0 scale-90 md:scale-100">
              <FaRobot size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-bold truncate leading-tight" style={{ color: textColor }}>Assistant</h3>
              <p className="text-[8px] md:text-[10px] text-emerald-500 font-bold tracking-widest uppercase opacity-90">REKAPY Smart Service</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-black/5"
              title={isFullScreen ? "Réduire" : "Agrandir"}
            >
              {isFullScreen ? <FaCompressAlt size={16} /> : <FaExpandAlt size={16} />}
            </button>
            <button
              onClick={close}
              className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-50"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </header>

        {/* MESSAGES */}
        <div
          ref={messagesRef}
          className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 custom-scrollbar"
          style={{ backgroundColor: isDarkMode ? "rgba(15, 23, 42, 0.5)" : "rgba(248, 250, 252, 0.5)" }}
        >
          {loadingMessages ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex gap-1.5 opacity-40">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
              <FaRobot size={60} className="mb-4" />
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: textColor }}>Prêt à vous aider</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`
                  max-w-[92%] md:max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed
                  ${m.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/10"
                    : (isDarkMode ? "bg-slate-800 text-gray-100 border border-gray-700/50" : "bg-white text-slate-700 border border-gray-200 shadow-sm")}
                `}>
                  <div
                    className="prose prose-sm break-words max-w-none prose-p:my-1 dark:prose-invert overflow-x-auto custom-scrollbar-h pb-2"
                    style={{ color: 'inherit' }}
                    dangerouslySetInnerHTML={{ __html: m.content || "" }}
                  />

                  {m.calculation && (
                    <div className="mt-3">
                      {typeof m.calculation === 'string' && (m.calculation.endsWith('.xlsx') || m.calculation.endsWith('.pdf') || m.calculation.endsWith('.xls')) ? (
                        <div
                          className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md ${isDarkMode ? "bg-slate-700/50 border-gray-600" : "bg-gray-100 border-gray-200"
                            }`}
                          onClick={() => {
                            if (typeof m.calculation === 'string' && m.calculation.length > 5) {
                              window.open(m.calculation, '_blank');
                            }
                          }}
                        >
                          <div className={`p-3 rounded-lg flex-shrink-0 ${isDarkMode ? "bg-slate-800" : "bg-slate-700"} text-white shadow-inner`}>
                            {m.calculation.endsWith('.xlsx') || m.calculation.endsWith('.xls') ? <FaFileExcel size={24} className="text-emerald-400" /> : <FaFileAlt size={24} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: textColor }}>
                              {m.calculation.split('/').pop() || "Document à télécharger"}
                            </p>
                            <p className="text-[10px] opacity-60 uppercase tracking-tighter">Prêt à télécharger</p>
                          </div>
                        </div>
                      ) : (
                        /* Only show the result box if it is NOT a large array (lists are already rendered in Markdown by AI) */
                        (!Array.isArray(m.calculation) || m.calculation.length <= 1) && (
                          <div className={`p-3 rounded-xl ${isDarkMode ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-100"}`}>
                            <p className="text-[8px] uppercase font-bold tracking-widest opacity-60 mb-1">Résultat</p>
                            <p className="text-lg font-mono font-black italic tracking-tighter leading-none" style={{ color: textColor }}>
                              {typeof m.calculation === 'object' ? JSON.stringify(m.calculation) : String(m.calculation)}
                              {typeof m.calculation === 'number' && <span className="text-[10px] ml-1 not-italic font-sans opacity-70">AR</span>}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {sendingMessage && (
            <div className="flex justify-start">
              <div className={`p-4 rounded-2xl rounded-tl-none border ${isDarkMode ? "bg-gray-800 border-gray-700/50" : "bg-white border-gray-200"}`}>
                <div className="flex space-x-1.5 opacity-50">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INPUT */}
        <footer className="p-5 border-t shrink-0" style={{ backgroundColor: headerBg, borderColor }}>
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                /* disabled={sendingMessage || !selectedHistoryId} */
                /* disabled={sendingMessage} */
                disabled={sendingMessage}
                placeholder={"Posez votre question..."}
                className={`w-full px-5 py-3 rounded-xl text-sm outline-none transition-all border
                  ${isDarkMode
                    ? "bg-slate-900 border-gray-700/50 text-white placeholder-gray-500 focus:border-indigo-500"
                    : "bg-gray-100 border-transparent text-slate-900 placeholder-gray-400 focus:bg-white focus:border-indigo-300 shadow-inner"}
                `}
              />
            </div>
            <button
              type="submit"
              disabled={sendingMessage || !currentMessage.trim()}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-20 flex-shrink-0"
            >
              <FaPaperPlane size={14} />
            </button>
          </form>
        </footer>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(79, 70, 229, 0.4); border-radius: 10px; }
        
        .prose-sm p { margin: 0.25rem 0; line-height: 1.6; }
        .prose-sm strong { color: #818cf8; font-weight: 600; }
        .dark .prose-sm strong { color: #818cf8; }
      `}} />
    </div>
  );
}

IndexChatbotPage.propTypes = {
  close: PropTypes.func,
};

