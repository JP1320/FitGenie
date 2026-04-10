import React from "react";
import { Link } from "react-router-dom";

export default function TopNav() {
  return (
    <header className="topnav">
      <Link to="/" className="brand">FitGenie Premium</Link>
      <nav>
        <Link to="/intent">Start</Link>
      </nav>
    </header>
  );
}
