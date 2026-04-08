import React from "react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/recommendations", label: "Looks" },
  { to: "/tailors", label: "Experts" },
  { to: "/tracking", label: "Tracking" },
  { to: "/feedback", label: "Feedback" }
];

export default function BottomNavMobile() {
  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-md rounded-2xl border border-white/10 bg-[#121829]/90 backdrop-blur-xl p-2 md:hidden z-30">
      <ul className="grid grid-cols-4 gap-1">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `touch-target rounded-xl text-xs flex items-center justify-center py-2 ${
                  isActive ? "bg-white/15 text-white" : "text-[var(--muted)]"
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
