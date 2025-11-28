import React from "react";
import { FaRobot } from "react-icons/fa";
import { Outlet } from "react-router-dom";
import IndexHeader from "../header/IndexHeader";
import LargeSidebar from "../sidebar/LargeSidebar";
import IndexChatbotPage from "../../views/chat/IndexChatbotPage";
import { useDispatch, useSelector } from "react-redux";
import { actionCloseChat, actionOpenChat } from "../../states/chat/chatSlice";

export default function DashboardLayout() {
  // USE-DISPATCH =================================
  const dispatch = useDispatch();

  // GLOBAL-STATE: is chat modal open ===================
  const isChatModalOpen = useSelector(
    (states) => states.chatbot.isChatModalOpen
  );
  // CLOSE CHAT MODAL =============================
  const handleCloseChat = () => {
    dispatch(actionCloseChat());
  };
  // OPEN CHAT MODAL =============================
  const handleOpenChat = () => {
    dispatch(actionOpenChat());
  };

  return (
    <React.Fragment>
      <div class="flex min-h-screen bg-slate-800">
        <div>
          <LargeSidebar />
        </div>
        <div className="flex-1 transition-all duration-300 ease-in-out lg:ml-48 flex flex-col">
          <IndexHeader />
          <div className="bg-slate-800 p-7 text-slate-300">
            <Outlet />
          </div>

          {/* OPEN CHATBOT BUTTON */}
          <div className="z-30">
            <button
              onClick={handleOpenChat}
              className="fixed right-3 bottom-7 hover:bg-blue-700 bg-blue-600 text-white p-3 rounded-2xl"
            >
              <FaRobot />
            </button>
          </div>
          {/* END_OPEN CHATBOT BUTTON */}
        </div>
      </div>

      {/* CHATBOT COMPONENT */}
      <React.Fragment>
        {isChatModalOpen ? <IndexChatbotPage close={handleCloseChat} /> : null}
      </React.Fragment>
      {/* END_CHATBOT COMPONENT */}
    </React.Fragment>
  );
}
