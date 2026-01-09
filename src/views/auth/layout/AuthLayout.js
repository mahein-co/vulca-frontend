import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <React.Fragment>
            <div className="relative p-6 bg-slate-50 z-1 sm:p-0">
                <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row sm:p-0">
                    <Outlet />
                </div>
            </div>
        </React.Fragment>
    );
}
