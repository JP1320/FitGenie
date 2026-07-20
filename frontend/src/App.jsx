import React, { useMemo, useState } from "react";
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

function getInitials(nameOrEmail) {
  const value = String(nameOrEmail || "").trim();

  if (!value) {
    return "G";
  }

  if (value.includes("@")) {
    return value.slice(0, 1).toUpperCase();
  }

  const parts = value.split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

function AccountBadge() {
  const location = useLocation();
  const navigate = useNavigate();

  const loginMode = useFlowStore((state) => state.loginMode);
  const authUser = useFlowStore((state) => state.authUser);
  const resetAuth = useFlowStore((state) => state.resetAuth);

  const [open, setOpen] = useState(false);

  const hiddenPaths = ["/", "/welcome", "/login/email", "/login/mobile"];

  const shouldHide = hiddenPaths.includes(location.pathname);

  const account = useMemo(() => {
    if (loginMode === "google" && authUser) {
      return {
        name: authUser.name || authUser.email || "Google User",
        email: authUser.email || "",
        provider: "Gmail",
        picture: authUser.picture || "",
        initials: getInitials(authUser.name || authUser.email),
        isGuest: false,
      };
    }

    return {
      name: "Guest User",
      email: "Exploring without sign-in",
      provider: "Guest",
      picture: "",
      initials: "✨",
      isGuest: true,
    };
  }, [loginMode, authUser]);

  if (shouldHide) {
    return null;
  }

  function handleSignOut() {
    resetAuth();
    setOpen(false);
    navigate("/welcome");
  }

  return (
    <div style={styles.accountRoot}>
      <button
        type="button"
        style={styles.accountButton}
        onClick={() => setOpen((value) => !value)}
        aria-label="Open account menu"
      >
        {account.picture ? (
          <img
            src={account.picture}
            alt={account.name}
            style={styles.accountAvatarImage}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span style={styles.accountAvatarText}>{account.initials}</span>
        )}

        <span style={styles.accountCopy}>
          <strong>{account.name}</strong>
          <small>{account.provider}</small>
        </span>

        <span style={styles.accountChevron}>{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div style={styles.accountMenu}>
          <div style={styles.menuHeader}>
            {account.picture ? (
              <img
                src={account.picture}
                alt={account.name}
                style={styles.menuAvatarImage}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span style={styles.menuAvatarText}>{account.initials}</span>
            )}

            <div>
              <strong style={styles.menuName}>{account.name}</strong>
              <p style={styles.menuEmail}>{account.email}</p>
            </div>
          </div>

          <div style={styles.menuDivider} />

          <div style={styles.menuRow}>
            <span>Account type</span>
            <strong>{account.provider}</strong>
          </div>

          {account.isGuest ? (
            <button
              type="button"
              style={styles.menuPrimaryButton}
              onClick={() => {
                setOpen(false);
                navigate("/login/email");
              }}
            >
              Sign in with Gmail
            </button>
          ) : (
            <button
              type="button"
              style={styles.menuSecondaryButton}
              onClick={handleSignOut}
            >
              Sign out
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function App() {
  return (
    <>
      <AccountBadge />

      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<Welcome />} />

        <Route path="/login/email" element={<LoginEmail />} />
        <Route
          path="/login/mobile"
          element={<Navigate to="/welcome" replace />}
        />

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

        <Route
          path="/store"
          element={<Navigate to="/guided-filters" replace />}
        />

        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </>
  );
}

const styles = {
  accountRoot: {
    position: "fixed",
    top: "18px",
    right: "18px",
    zIndex: 9999,
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },

  accountButton: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid rgba(255,255,255,0.22)",
    borderRadius: "999px",
    padding: "8px 10px 8px 8px",
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.88), rgba(30,41,59,0.82))",
    color: "#ffffff",
    boxShadow:
      "0 18px 45px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.12)",
    backdropFilter: "blur(18px)",
    cursor: "pointer",
  },

  accountAvatarImage: {
    width: "38px",
    height: "38px",
    borderRadius: "999px",
    objectFit: "cover",
    border: "1px solid rgba(255,255,255,0.36)",
  },

  accountAvatarText: {
    width: "38px",
    height: "38px",
    borderRadius: "999px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, #facc15 0%, #22d3ee 54%, #7c3aed 100%)",
    color: "#ffffff",
    fontWeight: 950,
    boxShadow: "0 10px 24px rgba(34,211,238,0.22)",
  },

  accountCopy: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    lineHeight: 1.1,
    maxWidth: "190px",
  },

  accountChevron: {
    fontSize: "10px",
    color: "#cbd5e1",
    paddingLeft: "2px",
  },

  accountMenu: {
    position: "absolute",
    top: "54px",
    right: 0,
    width: "310px",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "24px",
    padding: "16px",
    background:
      "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(30,41,59,0.94), rgba(30,27,75,0.92))",
    color: "#ffffff",
    boxShadow: "0 28px 80px rgba(0,0,0,0.42)",
    backdropFilter: "blur(22px)",
  },

  menuHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  menuAvatarImage: {
    width: "52px",
    height: "52px",
    borderRadius: "18px",
    objectFit: "cover",
    border: "1px solid rgba(255,255,255,0.28)",
  },

  menuAvatarText: {
    width: "52px",
    height: "52px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, #facc15 0%, #22d3ee 54%, #7c3aed 100%)",
    color: "#ffffff",
    fontWeight: 950,
    fontSize: "18px",
  },

  menuName: {
    display: "block",
    color: "#ffffff",
    fontSize: "15px",
    lineHeight: 1.2,
  },

  menuEmail: {
    margin: "5px 0 0",
    color: "#cbd5e1",
    fontSize: "12px",
    lineHeight: 1.35,
    wordBreak: "break-word",
  },

  menuDivider: {
    height: "1px",
    background: "rgba(255,255,255,0.14)",
    margin: "14px 0",
  },

  menuRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.08)",
    color: "#cbd5e1",
    fontSize: "13px",
    marginBottom: "12px",
  },

  menuPrimaryButton: {
    width: "100%",
    border: "none",
    borderRadius: "999px",
    padding: "12px 14px",
    background: "linear-gradient(135deg, #facc15, #22d3ee)",
    color: "#111827",
    fontWeight: 950,
    cursor: "pointer",
  },

  menuSecondaryButton: {
    width: "100%",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "999px",
    padding: "12px 14px",
    background: "rgba(255,255,255,0.09)",
    color: "#ffffff",
    fontWeight: 950,
    cursor: "pointer",
  },
};
