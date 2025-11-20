import React from "react";
import { useSelector } from "react-redux";

export default function IndexHeader() {
  const activePageTitle = useSelector(
    (state) => state.navigations.activePageTitle
  );
  return (
    <React.Fragment>
      <header className="sticky -top-1 lg:top-0 w-full bg-slate-900 shadow-sm p-4 flex justify-between items-center z-50">
        <h1 className="text-xl font-bold text-primary">{activePageTitle}</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 hidden py-2 border rounded-lg"
          />
          <div className="w-7 h-7  rounded-full bg-slate-300 flex items-center justify-center text-dark text-xs">
            SR
          </div>
        </div>
      </header>
    </React.Fragment>
  );
}
