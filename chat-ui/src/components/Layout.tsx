import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function Layout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-abyss-950">
      <Sidebar />
      <Outlet />
    </div>
  );
}
