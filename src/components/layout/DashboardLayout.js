import React from "react";
import { Outlet } from "react-router-dom";
import IndexHeader from "../header/IndexHeader";
import LargeSidebar from "../sidebar/LargeSidebar";

export default function DashboardLayout() {
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
