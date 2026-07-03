import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StepShell from "../components/StepShell";
import { callApi } from "../services/api";
import { useFlowStore } from "../store/useFlowStore";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

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

  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setGoogleReady(false);
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
            logo_alignment: "left",
          });
        }

        setGoogleReady(true);
      } catch (_error) {
        setGoogleReady(false);
        setError(
          "Google Sign-In could not be loaded. Please refresh and try again."
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

    const credential = response?.credential || "";
    const profile = decodeJwtPayload(credential);

    if (!credential || !profile?.email) {
      setLoading(false);
      setError("Google did not return a valid account. Please try again.");
      return;
    }

    try {
      const result = await callApi("/auth/google", "POST", {
        credential,
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
      setError("Unable to complete Google sign-in right now.");
    } finally {
      setLoading(false);
    }
  }

  function openGooglePrompt() {
    setError("");

    if (!GOOGLE_CLIENT_ID) {
      setError(
        "Google login is not configured yet. Add VITE_GOOGLE_CLIENT_ID in Vercel and redeploy the frontend."
      );
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
      return;
    }

    setError("Google Sign-In is still loading. Please try again.");
  }

  return (
    <StepShell step="Login" title="Choose your Google account">
      <div style={styles.page}>
        <section style={styles.heroCard}>
          <div>
            <div style={styles.logoCircle}>G</div>

            <p style={styles.eyebrow}>Secure Google sign-in</p>

            <h2 style={styles.heading}>Continue with your real Google account</h2>

            <p style={styles.subText}>
              FitGenie uses Google Sign-In so your recommendations, fit card,
              selected expert, and order updates stay connected to your account.
            </p>
          </div>

          <div style={styles.founderBox}>
            <div>
              <span style={styles.founderLabel}>Founder</span>
              <strong>JANVI PATEL</strong>
            </div>

            <div style={styles.founderDivider} />

            <div>
              <span style={styles.founderLabel}>Co-founder</span>
              <strong>JAFAR KACHHI</strong>
            </div>
          </div>
        </section>

        <section style={styles.accountPanel}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Sign in with Google</h3>

            <p style={styles.sectionSub}>
              The real Google account chooser will open from Google. It will show
              the Google accounts already available on the user’s device/browser.
            </p>
          </div>

          <div style={styles.googleArea}>
            {GOOGLE_CLIENT_ID ? (
              <>
                <div ref={googleButtonRef} style={styles.googleButtonMount} />

                <button
                  type="button"
                  style={styles.secondaryAction}
                  onClick={openGooglePrompt}
                  disabled={loading}
                >
                  Open Google account chooser
                </button>

                {!googleReady ? (
                  <p style={styles.helperText}>Loading Google Sign-In...</p>
                ) : null}
              </>
            ) : (
              <div style={styles.setupBox}>
                <strong>Google login setup required</strong>

                <p>
                  Add <code>VITE_GOOGLE_CLIENT_ID</code> in Vercel to enable the
                  real Google account chooser.
                </p>
              </div>
            )}
          </div>

          {error ? <div style={styles.error}>{error}</div> : null}

          <div style={styles.actionRow}>
            <button
              type="button"
              style={styles.backButton}
              onClick={() => navigate("/welcome")}
              disabled={loading}
            >
              Back
            </button>

            <button
              type="button"
              style={styles.primaryButton}
              onClick={openGooglePrompt}
              disabled={loading || !GOOGLE_CLIENT_ID}
            >
              {loading ? "Signing in..." : "Continue with Google"}
            </button>
          </div>
        </section>
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
    color: "#14213d",
  },

  heroCard: {
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "28px",
    padding: "28px",
    background:
      "linear-gradient(135deg, rgba(255,247,237,0.86), rgba(238,246,255,0.88), rgba(245,243,255,0.9))",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
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
    color: "#ffffff",
    background:
      "conic-gradient(from 90deg, #4285f4, #34a853, #fbbc05, #ea4335, #4285f4)",
    boxShadow: "0 16px 34px rgba(66, 133, 244, 0.24)",
    marginBottom: "20px",
  },

  eyebrow: {
    margin: "0 0 10px",
    color: "#6d5dfc",
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontSize: "12px",
  },

  heading: {
    margin: "0 0 10px",
    fontSize: "30px",
    lineHeight: 1.1,
    color: "#111827",
  },

  subText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.65,
  },

  founderBox: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    gap: "14px",
    alignItems: "center",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "22px",
    padding: "16px",
    background: "rgba(255,255,255,0.72)",
    color: "#111827",
  },

  founderLabel: {
    display: "block",
    marginBottom: "4px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  founderDivider: {
    width: "1px",
    height: "40px",
    background: "#cbd5e1",
  },

  accountPanel: {
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "28px",
    padding: "24px",
    background: "rgba(255,255,255,0.76)",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
  },

  sectionHeader: {
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: "0 0 6px",
    fontSize: "22px",
    color: "#111827",
  },

  sectionSub: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.55,
  },

  googleArea: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    alignItems: "flex-start",
    padding: "18px",
    borderRadius: "22px",
    border: "1px solid rgba(203, 213, 225, 0.9)",
    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
  },

  googleButtonMount: {
    minHeight: "44px",
  },

  setupBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "100%",
    border: "1px solid rgba(245, 158, 11, 0.26)",
    borderRadius: "18px",
    padding: "14px",
    background: "#fffbeb",
    color: "#92400e",
    lineHeight: 1.5,
  },

  helperText: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },

  secondaryAction: {
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "11px 16px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 800,
    cursor: "pointer",
  },

  error: {
    marginTop: "14px",
    border: "1px solid rgba(239, 68, 68, 0.26)",
    background: "#fef2f2",
    color: "#991b1b",
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

  backButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "12px 18px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 900,
    cursor: "pointer",
  },

  primaryButton: {
    border: "none",
    borderRadius: "999px",
    padding: "12px 20px",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 14px 30px rgba(0,188,212,0.22)",
  },
};
