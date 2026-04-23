import React from "react";
import { Link } from "react-router-dom";

export default function TopNav() {
  return (
    <header className="topnav">
      <Link to="/welcome" className="brand">FitGenie</Link>
      <span className="pill">Premium Flow</span>
    </header>
  );
}
