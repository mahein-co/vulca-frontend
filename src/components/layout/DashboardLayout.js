import React, { useEffect } from "react";
import { FaRobot } from "react-icons/fa";
import { Outlet, useNavigate } from "react-router-dom";
import IndexHeader from "../header/IndexHeader";
import LargeSidebar from "../sidebar/LargeSidebar";
import IndexChatbotPage from "../../views/chat/IndexChatbotPage";
import { useProjectId } from "../../hooks/useProjectId";
import { useDispatch, useSelector } from "react-redux";
import { actionCloseChat, actionOpenChat } from "../../states/chat/chatSlice";

export default function DashboardLayout() {
  const navigate = useNavigate();

  const projectId = useProjectId();
  useEffect(() => {
    if (!projectId) {
      navigate("/projects");
    }
  }, [navigate, projectId]);

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

        </div>
      </div>
    </React.Fragment>
  );
}
