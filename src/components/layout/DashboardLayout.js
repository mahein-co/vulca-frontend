import React from "react";
import { Outlet } from "react-router-dom";
import IndexHeader from "../header/IndexHeader";
import LargeSidebar from "../sidebar/LargeSidebar";
import ShortSidebar from "../sidebar/ShortSidebar";

export default function DashboardLayout() {
  return (
    <React.Fragment>
      <div class="flex min-h-screen bg-white">
        <LargeSidebar />
        <ShortSidebar />
        <div className="flex-1 flex flex-col">
          <IndexHeader />
          <div className="bg-gray-100 max-h-screen h-full p-7">
            <Outlet />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
