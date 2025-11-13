import React from "react";

export default function IndexHeader() {
  const activePageTitle = "Dashboard";
  return (
    <React.Fragment>
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">{activePageTitle}</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 hidden py-2 border rounded-lg"
          />
          <div className="w-7 h-7  rounded-full bg-dark flex items-center justify-center text-white text-xs">
            SR
          </div>
        </div>
      </header>
    </React.Fragment>
  );
}
