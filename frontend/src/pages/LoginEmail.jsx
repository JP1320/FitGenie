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
            width: 330,
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
      <main style={styles.pageShell}>
        <div style={styles.blurOne} />
        <div style={styles.blurTwo} />
        <div style={styles.gridPattern} />

        <section style={styles.page}>
          <article style={styles.heroCard}>
            <div style={styles.badgeRow}>
              <span style={styles.badge}>FitGenie secure login</span>
              <span style={styles.badgeLight}>Real Google account</span>
            </div>

            <div>
              <div style={styles.logoWrap}>
                <div style={styles.logoCircle}>G</div>
                <div style={styles.logoGlow} />
              </div>

              <p style={styles.eyebrow}>Personalized fashion starts here</p>

              <h2 style={styles.heading}>Continue with your Google account</h2>

              <p style={styles.subText}>
                Sign in securely to save your preferences, AI recommendations,
                fit card, selected expert, bookings, and delivery updates.
              </p>
            </div>

            <div style={styles.founderBox}>
              <div style={styles.founderItem}>
                <span style={styles.founderLabel}>Founder</span>
                <strong style={styles.founderName}>JANVI PATEL</strong>
              </div>

              <div style={styles.founderDivider} />

              <div style={styles.founderItem}>
                <span style={styles.founderLabel}>Co-founder</span>
                <strong style={styles.founderName}>JAFAR KACHHI</strong>
              </div>
            </div>
          </article>

          <article style={styles.accountPanel}>
            <div style={styles.sectionHeader}>
              <span style={styles.stepChip}>01</span>

              <div>
                <h3 style={styles.sectionTitle}>Sign in with Google</h3>

                <p style={styles.sectionSub}>
                  The official Google account chooser will open and show the
                  Google accounts available on the user’s device or browser.
                </p>
              </div>
            </div>

            <div style={styles.googleCard}>
              <div style={styles.googleIconBox}>
                <span style={styles.googleLetter}>G</span>
              </div>

              <div style={styles.googleTextArea}>
                <h4 style={styles.googleTitle}>Google Sign-In</h4>

                <p style={styles.googleDescription}>
                  Fast, secure, and connected to your FitGenie profile.
                </p>
              </div>

              <div style={styles.googleButtonArea}>
                {GOOGLE_CLIENT_ID ? (
                  <>
                    <div ref={googleButtonRef} style={styles.googleButtonMount} />

                    {!googleReady ? (
                      <p style={styles.helperText}>Loading Google Sign-In...</p>
                    ) : null}
                  </>
                ) : (
                  <div style={styles.setupBox}>
                    <strong>Google login setup required</strong>

                    <p>
                      Add <code>VITE_GOOGLE_CLIENT_ID</code> in Vercel to enable
                      the real Google account chooser.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={styles.infoStrip}>
              <span style={styles.infoIcon}>✨</span>

              <p>
                Your login helps FitGenie keep your fit preferences, outfit
                suggestions, expert selection, and order journey in one place.
              </p>
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
                style={{
                  ...styles.primaryButton,
                  opacity: loading || !GOOGLE_CLIENT_ID ? 0.68 : 1,
                  cursor:
                    loading || !GOOGLE_CLIENT_ID ? "not-allowed" : "pointer",
                }}
                onClick={openGooglePrompt}
                disabled={loading || !GOOGLE_CLIENT_ID}
              >
                {loading ? "Signing in..." : "Continue with Google"}
              </button>
            </div>
          </article>
        </section>
      </main>
    </StepShell>
  );
}

const styles = {
  pageShell: {
    position: "relative",
    overflow: "hidden",
    minHeight: "calc(100vh - 120px)",
    padding: "28px",
    borderRadius: "34px",
    background:
      "linear-gradient(135deg, #fff7ed 0%, #eef6ff 40%, #f5f3ff 72%, #ecfeff 100%)",
    color: "#14213d",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },

  blurOne: {
    position: "absolute",
    top: "-90px",
    left: "-80px",
    width: "260px",
    height: "260px",
    borderRadius: "999px",
    background: "rgba(109, 93, 252, 0.2)",
    filter: "blur(24px)",
    pointerEvents: "none",
  },

  blurTwo: {
    position: "absolute",
    right: "-90px",
    bottom: "-90px",
    width: "300px",
    height: "300px",
    borderRadius: "999px",
    background: "rgba(0, 188, 212, 0.18)",
    filter: "blur(28px)",
    pointerEvents: "none",
  },

  gridPattern: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)",
    backgroundSize: "34px 34px",
    maskImage:
      "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.08))",
    pointerEvents: "none",
  },

  page: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
    alignItems: "stretch",
  },

  heroCard: {
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "30px",
    padding: "28px",
    background: "rgba(255,255,255,0.76)",
    boxShadow: "0 24px 58px rgba(15, 23, 42, 0.12)",
    backdropFilter: "blur(18px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "28px",
    minHeight: "460px",
  },

  badgeRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "8px 12px",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.04em",
  },

  badgeLight: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "8px 12px",
    background: "#ffffff",
    color: "#475569",
    border: "1px solid #dbeafe",
    fontSize: "12px",
    fontWeight: 900,
  },

  logoWrap: {
    position: "relative",
    width: "84px",
    height: "84px",
    marginBottom: "22px",
  },

  logoCircle: {
    position: "relative",
    zIndex: 2,
    width: "84px",
    height: "84px",
    borderRadius: "28px",
    display: "grid",
    placeItems: "center",
    fontSize: "38px",
    fontWeight: 950,
    color: "#ffffff",
    background:
      "conic-gradient(from 90deg, #4285f4, #34a853, #fbbc05, #ea4335, #4285f4)",
    boxShadow: "0 18px 38px rgba(66, 133, 244, 0.28)",
  },

  logoGlow: {
    position: "absolute",
    inset: "-10px",
    borderRadius: "34px",
    background:
      "linear-gradient(135deg, rgba(66,133,244,0.18), rgba(52,168,83,0.12), rgba(251,188,5,0.12))",
    filter: "blur(8px)",
  },

  eyebrow: {
    margin: "0 0 10px",
    color: "#6d5dfc",
    fontWeight: 950,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontSize: "12px",
  },

  heading: {
    margin: "0 0 12px",
    fontSize: "clamp(28px, 4vw, 42px)",
    lineHeight: 1.06,
    letterSpacing: "-0.04em",
    color: "#111827",
    fontWeight: 950,
  },

  subText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.7,
    fontSize: "15px",
    maxWidth: "560px",
  },

  founderBox: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    gap: "16px",
    alignItems: "center",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "24px",
    padding: "18px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.86), rgba(238,246,255,0.72))",
    color: "#111827",
  },

  founderItem: {
    minWidth: 0,
  },

  founderLabel: {
    display: "block",
    marginBottom: "5px",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 950,
    textTransform: "uppercase",
    letterSpacing: "0.09em",
  },

  founderName: {
    display: "block",
    color: "#111827",
    fontSize: "15px",
    letterSpacing: "0.02em",
  },

  founderDivider: {
    width: "1px",
    height: "46px",
    background: "#cbd5e1",
  },

  accountPanel: {
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "30px",
    padding: "26px",
    background: "rgba(255,255,255,0.78)",
    boxShadow: "0 24px 58px rgba(15, 23, 42, 0.12)",
    backdropFilter: "blur(18px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "18px",
  },

  sectionHeader: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
  },

  stepChip: {
    flex: "0 0 auto",
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    color: "#ffffff",
    fontWeight: 950,
    boxShadow: "0 14px 28px rgba(109,93,252,0.22)",
  },

  sectionTitle: {
    margin: "0 0 7px",
    fontSize: "24px",
    color: "#111827",
    fontWeight: 950,
    letterSpacing: "-0.02em",
  },

  sectionSub: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.58,
    fontSize: "14px",
  },

  googleCard: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: "16px",
    alignItems: "center",
    borderRadius: "26px",
    border: "1px solid rgba(203, 213, 225, 0.9)",
    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
    padding: "18px",
    boxShadow: "0 14px 34px rgba(15,23,42,0.08)",
  },

  googleIconBox: {
    width: "56px",
    height: "56px",
    borderRadius: "20px",
    display: "grid",
    placeItems: "center",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 22px rgba(15,23,42,0.08)",
  },

  googleLetter: {
    fontSize: "28px",
    fontWeight: 950,
    background:
      "linear-gradient(135deg, #4285f4, #34a853, #fbbc05, #ea4335)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },

  googleTextArea: {
    minWidth: 0,
  },

  googleTitle: {
    margin: "0 0 5px",
    color: "#111827",
    fontSize: "18px",
    fontWeight: 950,
  },

  googleDescription: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  googleButtonArea: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "10px",
    paddingTop: "4px",
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
    fontWeight: 700,
  },

  infoStrip: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    borderRadius: "20px",
    padding: "14px",
    background: "rgba(236, 254, 255, 0.8)",
    border: "1px solid rgba(0, 188, 212, 0.16)",
    color: "#475569",
    lineHeight: 1.55,
    fontSize: "14px",
  },

  infoIcon: {
    flex: "0 0 auto",
  },

  error: {
    border: "1px solid rgba(239, 68, 68, 0.26)",
    background: "#fef2f2",
    color: "#991b1b",
    borderRadius: "18px",
    padding: "13px 15px",
    lineHeight: 1.45,
    fontWeight: 700,
  },

  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "4px",
    flexWrap: "wrap",
  },

  backButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "13px 20px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(15,23,42,0.07)",
  },

  primaryButton: {
    border: "none",
    borderRadius: "999px",
    padding: "13px 22px",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    color: "#ffffff",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 16px 34px rgba(0,188,212,0.24)",
  },
};
