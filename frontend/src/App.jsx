import React, { useMemo } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Welcome from "./pages/Welcome";
import LoginEmail from "./pages/LoginEmail";
import IntentPage from "./pages/IntentPage";
import BasicProfilePage from "./pages/BasicProfilePage";
import SizeBodyPage from "./pages/SizeBodyPage";
import Scanner from "./pages/Scanner";
import GuidedFiltersPage from "./pages/GuidedFiltersPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import ServiceTypePage from "./pages/ServiceTypePage";
import QualityLocationPage from "./pages/QualityLocationPage";
import ExpertsPage from "./pages/ExpertsPage";
import DeliveryPage from "./pages/DeliveryPage";
import FitCardPage from "./pages/FitCardPage";
import TrackingPage from "./pages/TrackingPage";
import FeedbackPage from "./pages/FeedbackPage";
import { useFlowStore } from "./store/useFlowStore";

function emailToDisplayName(email) {
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!cleanEmail.includes("@")) {
    return "User";
  }

  return cleanEmail
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getUserInitial({ name, email, loginMode }) {
  if (loginMode === "guest") {
    return "G";
  }

  const source = String(name || email || "U").trim();

  return source.charAt(0).toUpperCase();
}

function AccountBadge() {
  const location = useLocation();
  const nav = useNavigate();

  const { authUser, loginMode } = useFlowStore();

  const hiddenPaths = new Set(["/", "/welcome", "/login/email", "/login/mobile"]);

  if (hiddenPaths.has(location.pathname)) {
    return null;
  }

  if (!authUser && loginMode !== "guest") {
    return null;
  }

  const isGuest = loginMode === "guest" || authUser?.provider === "guest";

  const email = authUser?.email || "";

  const name = isGuest
    ? "Guest User"
    : authUser?.name &&
      authUser.name !== email &&
      authUser.name.toLowerCase() !== "guest user"
    ? authUser.name
    : emailToDisplayName(email);

  const subtitle = isGuest
    ? "Guest mode"
    : email || authUser?.provider || "Signed in";

  const initial = getUserInitial({
    name,
    email,
    loginMode: isGuest ? "guest" : loginMode,
  });

  return (
    <button
      type="button"
      onClick={() => nav("/login/email")}
      style={styles.accountBadge}
      title={isGuest ? "Guest user" : email || name}
    >
      {authUser?.picture && !isGuest ? (
        <img src={authUser.picture} alt={name} style={styles.avatarImage} />
      ) : (
        <span style={styles.avatarText}>{initial}</span>
      )}

      <span style={styles.accountTextWrap}>
        <span style={styles.accountName}>{name}</span>
        <span style={styles.accountEmail}>{subtitle}</span>
      </span>
    </button>
  );
}

export default function App() {
  const routes = useMemo(
    () => (
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login/email" element={<LoginEmail />} />
        <Route path="/login/mobile" element={<Navigate to="/welcome" replace />} />

        <Route path="/intent" element={<IntentPage />} />
        <Route path="/basic-profile" element={<BasicProfilePage />} />
        <Route path="/size-body" element={<SizeBodyPage />} />
        <Route path="/camera-scan" element={<Scanner />} />
        <Route path="/guided-filters" element={<GuidedFiltersPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/service-type" element={<ServiceTypePage />} />
        <Route path="/quality-location" element={<QualityLocationPage />} />
        <Route path="/experts" element={<ExpertsPage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/fit-card" element={<FitCardPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />

        <Route path="/store" element={<Navigate to="/guided-filters" replace />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    ),
    []
  );

  return (
    <>
      <AccountBadge />
      {routes}
    </>
  );
}

const styles = {
  accountBadge: {
    position: "fixed",
    top: "18px",
    right: "18px",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    maxWidth: "260px",
    border: "1px solid rgba(255,255,255,0.28)",
    borderRadius: "999px",
    padding: "8px 12px 8px 8px",
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.88), rgba(30,27,75,0.82))",
    color: "#ffffff",
    boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
    backdropFilter: "blur(18px)",
    cursor: "pointer",
  },

  avatarImage: {
    width: "38px",
    height: "38px",
    borderRadius: "999px",
    objectFit: "cover",
    border: "1px solid rgba(255,255,255,0.42)",
  },

  avatarText: {
    width: "38px",
    height: "38px",
    borderRadius: "999px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, #facc15 0%, #22d3ee 54%, #7c3aed 100%)",
    color: "#111827",
    fontSize: "16px",
    fontWeight: 1000,
    border: "1px solid rgba(255,255,255,0.42)",
  },

  accountTextWrap: {
    minWidth: 0,
    display: "grid",
    textAlign: "left",
  },

  accountName: {
    maxWidth: "178px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "13px",
    fontWeight: 950,
    lineHeight: 1.15,
  },

  accountEmail: {
    maxWidth: "178px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "11px",
    color: "#cbd5e1",
    lineHeight: 1.15,
  },
};
