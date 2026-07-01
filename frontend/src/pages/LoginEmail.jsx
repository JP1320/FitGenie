import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StepShell from "../components/StepShell";
import { callApi } from "../services/api";
import { useFlowStore } from "../store/useFlowStore";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const DEMO_ACCOUNTS = [
  {
    name: "Personal Gmail",
    email: "yourname@gmail.com",
    avatar: "YG",
    type: "Google Account",
  },
  {
    name: "Shopping Account",
    email: "shopping.user@gmail.com",
    avatar: "SU",
    type: "Google Account",
  },
];

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(
      decodeURIComponent(
        decoded
          .split("")
          .map((char) => {
            return `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`;
          })
          .join("")
      )
    );
  } catch (_error) {
    return {};
  }
}

export default function LoginEmail() {
  const navigate = useNavigate();
  const { patch } = useFlowStore();

  const googleButtonRef = useRef(null);

  const [manualEmail, setManualEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      return undefined;
    }

    let cancelled = false;

    function loadGoogleScript() {
      return new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
          resolve();
          return;
        }

        const existingScript = document.querySelector(
          'script[src="https://accounts.google.com/gsi/client"]'
        );

        if (existingScript) {
          existingScript.addEventListener("load", resolve);
          existingScript.addEventListener("error", reject);
          return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }

    async function initializeGoogle() {
      try {
        await loadGoogleScript();

        if (cancelled || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false,
          ux_mode: "popup",
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            width: 320,
            text: "continue_with",
            shape: "pill",
          });
        }

        setGoogleReady(true);
      } catch (_error) {
        setGoogleReady(false);
        setError(
          "Google Sign-In could not be loaded. You can still continue with demo account selection."
        );
      }
    }

    initializeGoogle();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGoogleCredential(response) {
    setError("");
    setLoading(true);

    const profile = decodeJwtPayload(response?.credential || "");

    try {
      const result = await callApi("/auth/google", "POST", {
        credential: response?.credential || "",
        profile,
      });

      if (!result.ok) {
        setError(result.data?.message || "Google sign-in failed.");
        return;
      }

      patch({
        loginMode: "google",
        authUser: result.data.user,
        authToken: result.data.token,
      });

      navigate("/intent");
    } catch (_error) {
      setError("Unable to complete Google sign-in.");
    } finally {
      setLoading(false);
    }
  }

  async function continueWithDemoAccount(account) {
    setError("");
    setLoading(true);

    try {
      const result = await callApi("/auth/google", "POST", {
        profile: {
          name: account.name,
          email: account.email,
          picture: "",
        },
        mode: "demo",
      });

      if (!result.ok) {
        setError(result.data?.message || "Unable to continue with this account.");
        return;
      }

      patch({
        loginMode: "google",
        authUser: result.data.user,
        authToken: result.data.token,
      });

      navigate("/intent");
    } catch (_error) {
      setError("Unable to continue with this account.");
    } finally {
      setLoading(false);
    }
  }

  async function continueWithManualEmail() {
    const email = manualEmail.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    await continueWithDemoAccount({
      name: "Google User",
      email,
    });
  }

  function openGooglePrompt() {
    setError("");

    if (window.google?.accounts?.id && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.prompt();
      return;
    }

    setError(
      "Real Google account chooser needs VITE_GOOGLE_CLIENT_ID. Use the account cards below for now."
    );
  }

  return (
    <StepShell step={1} title="Choose your Google account" className="bg-login">
      <div style={styles.page}>
        <div style={styles.heroCard}>
          <div style={styles.logoCircle}>G</div>

          <div>
            <h2 style={styles.heading}>Continue with Google</h2>
            <p style={styles.subText}>
              Choose the email account you want to use for FitGenie. This keeps
              your fit card, recommendations, and order updates connected.
            </p>
          </div>

          {GOOGLE_CLIENT_ID ? (
            <div style={styles.realGoogleBox}>
              <div ref={googleButtonRef} style={styles.googleButtonMount} />

              <button
                type="button"
                className="btn ghost"
                onClick={openGooglePrompt}
                disabled={loading || !googleReady}
                style={styles.fullWidthButton}
              >
                Open Google account chooser
              </button>
            </div>
          ) : (
            <div style={styles.noticeBox}>
              <strong>Demo mode active</strong>
              <span>
                Add <code>VITE_GOOGLE_CLIENT_ID</code> in Vercel to enable the
                real Google account chooser.
              </span>
            </div>
          )}
        </div>

        <div style={styles.accountPanel}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Choose an account</h3>
            <p style={styles.sectionSub}>
              Select an account below or use another email.
            </p>
          </div>

          <div style={styles.accountList}>
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                style={styles.accountButton}
                onClick={() => continueWithDemoAccount(account)}
                disabled={loading}
              >
                <span style={styles.avatar}>{account.avatar}</span>

                <span style={styles.accountText}>
                  <strong>{account.email}</strong>
                  <span>{account.type}</span>
                </span>

                <span style={styles.arrow}>›</span>
              </button>
            ))}
          </div>

          <div style={styles.divider}>
            <span>or</span>
          </div>

          <label style={styles.label}>
            Use another Gmail address
            <input
              style={styles.input}
              type="email"
              placeholder="example@gmail.com"
              value={manualEmail}
              onChange={(event) => setManualEmail(event.target.value)}
            />
          </label>

          {error ? <div style={styles.error}>{error}</div> : null}

          <div style={styles.actionRow}>
            <button
              type="button"
              className="btn ghost"
              onClick={() => navigate("/welcome")}
              disabled={loading}
            >
              Back
            </button>

            <button
              type="button"
              className="btn"
              onClick={continueWithManualEmail}
              disabled={loading}
            >
              {loading ? "Continuing..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </StepShell>
  );
}

const styles = {
  page: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "22px",
    alignItems: "stretch",
  },
  heroCard: {
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "28px",
    padding: "28px",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
    boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "24px",
    minHeight: "430px",
  },
  logoCircle: {
    width: "72px",
    height: "72px",
    borderRadius: "24px",
    display: "grid",
    placeItems: "center",
    fontSize: "34px",
    fontWeight: 900,
    color: "#fff",
    background:
      "conic-gradient(from 90deg, #4285f4, #34a853, #fbbc05, #ea4335, #4285f4)",
    boxShadow: "0 16px 34px rgba(0,0,0,0.28)",
  },
  heading: {
    margin: "0 0 10px",
    fontSize: "30px",
    lineHeight: 1.1,
  },
  subText: {
    margin: 0,
    opacity: 0.82,
    lineHeight: 1.6,
  },
  realGoogleBox: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  googleButtonMount: {
    minHeight: "44px",
  },
  noticeBox: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "18px",
    padding: "14px",
    background: "rgba(0,0,0,0.18)",
    lineHeight: 1.5,
  },
  accountPanel: {
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "28px",
    padding: "24px",
    background: "rgba(255,255,255,0.08)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
  },
  sectionHeader: {
    marginBottom: "18px",
  },
  sectionTitle: {
    margin: "0 0 6px",
    fontSize: "22px",
  },
  sectionSub: {
    margin: 0,
    opacity: 0.74,
  },
  accountList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  accountButton: {
    width: "100%",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "18px",
    padding: "14px",
    background: "rgba(255,255,255,0.08)",
    color: "inherit",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    textAlign: "left",
  },
  avatar: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    background: "linear-gradient(135deg,#7c5cff,#00d4ff)",
    display: "grid",
    placeItems: "center",
    color: "#fff",
    fontWeight: 900,
  },
  accountText: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  arrow: {
    fontSize: "28px",
    opacity: 0.7,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "18px 0",
    opacity: 0.72,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "16px",
    padding: "14px 16px",
    background: "rgba(0,0,0,0.22)",
    color: "inherit",
    outline: "none",
    fontSize: "15px",
  },
  error: {
    marginTop: "14px",
    border: "1px solid rgba(255,120,120,0.38)",
    background: "rgba(255,70,70,0.14)",
    color: "#ffdede",
    borderRadius: "16px",
    padding: "12px 14px",
    lineHeight: 1.45,
  },
  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "20px",
    flexWrap: "wrap",
  },
  fullWidthButton: {
    width: "100%",
  },
};
