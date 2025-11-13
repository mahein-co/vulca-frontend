import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <React.Fragment>
      <div>
        <Outlet />
      </div>
    </React.Fragment>
  );
}
