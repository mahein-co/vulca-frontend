import React from "react";
import { Link } from "react-router-dom";
import { SIDEBAR_NAVIGATIONS } from "../../constants/globalConstants";
import { useDispatch, useSelector } from "react-redux";
import { actionSetActivePageTitle } from "../../states/navigations/navigationsSlice";

export default function LargeSidebar() {
  const dispatch = useDispatch();
  const activePageTitle = useSelector(
    (state) => state.navigations.activePageTitle
  );

  // Set active page title
  const handleChangeActivePageTitle = (title) => {
    dispatch(actionSetActivePageTitle(title));
  };

  return (
    <React.Fragment>
      <aside className="hidden lg:block w-48 bg-slate-900 shadow-md">
        <div className="flex flex-col items-center max-h-screen h-full overflow-hidden text-slate-300 rounded">
          <Link className="flex items-center w-full px-3 mt-3" to="/">
            <svg
              className="w-8 h-8 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
            </svg>
            <span className="ml-2 text-sm font-bold">The App</span>
          </Link>
          <div className="w-full px-2">
            <div className="flex flex-col items-center w-full mt-3 border-t border-slate-800">
              {SIDEBAR_NAVIGATIONS.map((navItem, index) => {
                return (
                  <Link
                    key={index}
                    onClick={() => handleChangeActivePageTitle(navItem?.title)}
                    className={`${
                      activePageTitle === navItem?.title && "bg-slate-800"
                    } flex items-center w-full h-12 px-3 mt-2 rounded-xl hover:bg-slate-800`}
                    to={navItem?.path}
                  >
                    <img
                      src={navItem?.icon}
                      alt={navItem?.title}
                      className="h-7 w-7"
                    />
                    <span className="ml-2 text-sm font-medium">
                      {navItem?.title}
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="flex flex-col items-center w-full mt-2 border-t border-slate-800">
              <Link
                className="flex items-center w-full h-12 px-3 mt-2 rounded-2xl hover:bg-slate-800"
                to="#"
              >
                <svg
                  className="w-6 h-6 stroke-current"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="ml-2 text-sm font-medium">Products</span>
              </Link>
              <Link
                className="flex items-center w-full h-12 px-3 mt-2 rounded-2xl hover:bg-slate-800"
                to="#"
              >
                <svg
                  className="w-6 h-6 stroke-current"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                <span className="ml-2 text-sm font-medium">Settings</span>
              </Link>
              <Link
                className="relative flex items-center w-full h-12 px-3 mt-2 rounded-2xl hover:bg-slate-800"
                to="#"
              >
                <svg
                  className="w-6 h-6 stroke-current"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <span className="ml-2 text-sm font-medium">Messages</span>
                <span className="absolute top-0 left-0 w-2 h-2 mt-2 ml-2 bg-indigo-500 rounded-full"></span>
              </Link>
            </div>
          </div>

          <Link
            className="flex items-center justify-center w-full h-16 mt-auto bg-slate-950 hover:bg-slate-800"
            to="#"
          >
            <svg
              className="w-6 h-6 stroke-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="ml-2 text-sm font-medium">Account</span>
          </Link>
        </div>
      </aside>
    </React.Fragment>
  );
}
