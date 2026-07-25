import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StepShell from "../components/StepShell";
import { callApi } from "../services/api";
import { useFlowStore } from "../store/useFlowStore";

const GOOGLE_SCRIPT_ID = "google-identity-services";

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID);

    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;

    document.head.appendChild(script);
  });
}

function emailToDisplayName(email) {
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!cleanEmail.includes("@")) {
    return "User";
  }

  const localPart = cleanEmail.split("@")[0] || "User";

  return localPart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeUser(user, fallbackEmail = "") {
  const email = String(user?.email || fallbackEmail || "").trim().toLowerCase();
  const fallbackName = emailToDisplayName(email);

  return {
    id: user?.id || email || "email-user",
    name:
      user?.name && user.name !== email && user.name !== "Guest user"
        ? user.name
        : fallbackName,
    email,
    picture: user?.picture || "",
    provider: user?.provider || "email",
  };
}

export default function LoginEmail() {
  const nav = useNavigate();
  const { patch } = useFlowStore();

  const googleButtonRef = useRef(null);

  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [manualEmail, setManualEmail] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [manualRequestId, setManualRequestId] = useState("");
  const [manualStep, setManualStep] = useState("email");

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    let mounted = true;

    async function setupGoogle() {
      try {
        if (!googleClientId) {
          setError("Google login is not configured yet.");
          return;
        }

        await loadGoogleScript();

        if (!mounted || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredential,
        });

        if (googleButtonRef.current) {
          googleButtonRef.current.innerHTML = "";

          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            shape: "pill",
            text: "continue_with",
            logo_alignment: "left",
            width: 340,
          });
        }

        setGoogleReady(true);
      } catch (_error) {
        setError("Unable to load Google sign-in.");
      }
    }

    setupGoogle();

    return () => {
      mounted = false;
    };
  }, [googleClientId]);

  async function handleGoogleCredential(response) {
    setError("");
    setInfo("");
    setGoogleLoading(true);

    try {
      const res = await callApi("/auth/google", "POST", {
        credential: response.credential,
      });

      if (!res.ok) {
        setError(res.data?.message || "Unable to complete Google sign-in.");
        return;
      }

      patch({
        loginMode: "google",
        authUser: normalizeUser(res.data.user),
        authToken: res.data.token,
      });

      nav("/intent");
    } catch (_error) {
      setError("Unable to complete Google sign-in.");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function sendManualEmailCode() {
    const cleanEmail = manualEmail.trim().toLowerCase();

    setError("");
    setInfo("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await callApi("/auth/email/request-code", "POST", {
        email: cleanEmail,
      });

      if (!res.ok) {
        setError(res.data?.message || "Unable to send verification code.");
        return;
      }

      setManualRequestId(res.data.requestId || "");
      setManualStep("code");
      setInfo(res.data.message || `Verification code sent to ${cleanEmail}.`);
    } catch (_error) {
      setError("Unable to send verification code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyManualEmailCode() {
    const cleanEmail = manualEmail.trim().toLowerCase();

    setError("");
    setInfo("");

    if (!manualRequestId) {
      setError("Please request a verification code first.");
      return;
    }

    if (!/^\d{6}$/.test(manualCode)) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const res = await callApi("/auth/email/verify-code", "POST", {
        email: cleanEmail,
        requestId: manualRequestId,
        code: manualCode,
      });

      if (!res.ok) {
        setError(res.data?.message || "Email verification failed.");
        return;
      }

      const emailUser = normalizeUser(res.data.user, cleanEmail);

      localStorage.removeItem("fitgenie-flow-store");

      patch({
        loginMode: "email",
        authUser: {
          id: emailUser.id || cleanEmail,
          name: emailUser.name || cleanEmail.split("@")[0],
          email: cleanEmail,
          picture: "",
          provider: "email",
        },
        authToken: res.data.token || "",
      });

      nav("/intent");
    } catch (_error) {
      setError("Unable to verify email code.");
    } finally {
      setLoading(false);
    }
  }

  function resetManualEmail() {
    setManualStep("email");
    setManualCode("");
    setManualRequestId("");
    setInfo("");
    setError("");
  }

  return (
    <StepShell step="Login" title="Choose your account">
      <main style={styles.page}>
        <section style={styles.card}>
          <div style={styles.glowOne} />
          <div style={styles.glowTwo} />

          <div style={styles.header}>
            <span style={styles.badge}>FitGenie secure login</span>

            <h1 style={styles.title}>Choose your account</h1>

            <p style={styles.subtitle}>
              Continue with Gmail or use another email address manually.
            </p>
          </div>

          <div style={styles.optionGrid}>
            <section style={styles.optionCard}>
              <div style={styles.optionIcon}>G</div>

              <div style={styles.optionContent}>
                <h2 style={styles.optionTitle}>Continue with Gmail</h2>

                <p style={styles.optionText}>
                  Select your Google account and continue instantly.
                </p>

                <div style={styles.googleButtonWrap}>
                  <div ref={googleButtonRef} style={styles.googleButtonOnly} />
                </div>

                {!googleReady && googleClientId ? (
                  <p style={styles.helperText}>Loading Google sign-in...</p>
                ) : null}

                {googleLoading ? (
                  <p style={styles.helperText}>Completing Google sign-in...</p>
                ) : null}
              </div>
            </section>

            <section style={styles.optionCard}>
              <div style={styles.optionIcon}>@</div>

              <div style={styles.optionContent}>
                <h2 style={styles.optionTitle}>Continue with other mail</h2>

                <p style={styles.optionText}>
                  Type any email address and receive a secure verification code.
                </p>

                {manualStep === "email" ? (
                  <>
                    <label style={styles.label}>Email address</label>

                    <input
                      value={manualEmail}
                      onChange={(event) => setManualEmail(event.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                      style={styles.input}
                    />

                    <button
                      type="button"
                      onClick={sendManualEmailCode}
                      disabled={loading}
                      style={{
                        ...styles.primaryButton,
                        opacity: loading ? 0.72 : 1,
                      }}
                    >
                      {loading ? "Sending code..." : "Send verification code"}
                    </button>
                  </>
                ) : (
                  <>
                    <label style={styles.label}>Verification code</label>

                    <input
                      value={manualCode}
                      onChange={(event) =>
                        setManualCode(
                          event.target.value.replace(/[^\d]/g, "").slice(0, 6)
                        )
                      }
                      placeholder="Enter 6-digit code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      style={styles.input}
                    />

                    <button
                      type="button"
                      onClick={verifyManualEmailCode}
                      disabled={loading}
                      style={{
                        ...styles.primaryButton,
                        opacity: loading ? 0.72 : 1,
                      }}
                    >
                      {loading ? "Verifying..." : "Verify & continue"}
                    </button>

                    <button
                      type="button"
                      onClick={resetManualEmail}
                      style={styles.secondaryButton}
                    >
                      Change email address
                    </button>
                  </>
                )}
              </div>
            </section>

          </div>

          {info ? <div style={styles.infoBox}>{info}</div> : null}
          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <button
            type="button"
            onClick={() => nav("/welcome")}
            style={styles.backButton}
          >
            Back to welcome
          </button>
        </section>
      </main>
    </StepShell>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 110px)",
    display: "grid",
    placeItems: "center",
    padding: "28px",
    borderRadius: "34px",
    background:
      "radial-gradient(circle at 12% 10%, rgba(250,204,21,0.17), transparent 26%), radial-gradient(circle at 88% 18%, rgba(34,211,238,0.24), transparent 30%), radial-gradient(circle at 42% 96%, rgba(124,58,237,0.26), transparent 34%), linear-gradient(135deg, #050816 0%, #0f172a 42%, #1e1b4b 100%)",
  },

  card: {
    position: "relative",
    overflow: "hidden",
    width: "min(780px, 100%)",
    borderRadius: "34px",
    padding: "32px",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08), rgba(124,58,237,0.12))",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 36px 100px rgba(0,0,0,0.42)",
    color: "#ffffff",
    backdropFilter: "blur(24px)",
  },

  glowOne: {
    position: "absolute",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(34,211,238,0.16)",
    filter: "blur(20px)",
    top: "-90px",
    right: "-80px",
  },

  glowTwo: {
    position: "absolute",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(250,204,21,0.12)",
    filter: "blur(24px)",
    bottom: "-110px",
    left: "-80px",
  },

  header: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    marginBottom: "28px",
  },

  badge: {
    display: "inline-flex",
    padding: "8px 13px",
    borderRadius: "999px",
    background: "rgba(34,211,238,0.14)",
    border: "1px solid rgba(34,211,238,0.24)",
    color: "#67e8f9",
    fontSize: "12px",
    fontWeight: 950,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "14px",
  },

  title: {
    margin: "0 0 10px",
    fontSize: "clamp(34px, 5vw, 52px)",
    lineHeight: 1,
    letterSpacing: "-0.06em",
  },

  subtitle: {
    width: "min(620px, 100%)",
    margin: "0 auto",
    color: "#cbd5e1",
    lineHeight: 1.65,
    fontSize: "15px",
  },

  optionGrid: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gap: "18px",
  },

  optionCard: {
    display: "grid",
    gridTemplateColumns: "58px 1fr",
    gap: "16px",
    padding: "20px",
    borderRadius: "28px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.13), rgba(255,255,255,0.07))",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 18px 45px rgba(0,0,0,0.18)",
  },

  optionIcon: {
    width: "58px",
    height: "58px",
    display: "grid",
    placeItems: "center",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, rgba(250,204,21,0.95), rgba(34,211,238,0.92), rgba(124,58,237,0.9))",
    color: "#111827",
    fontSize: "24px",
    fontWeight: 1000,
    boxShadow: "0 14px 34px rgba(34,211,238,0.2)",
  },

  optionContent: {
    minWidth: 0,
  },

  optionTitle: {
    margin: "0 0 7px",
    fontSize: "21px",
    lineHeight: 1.2,
    letterSpacing: "-0.025em",
  },

  optionText: {
    margin: "0 0 14px",
    color: "#cbd5e1",
    lineHeight: 1.55,
    fontSize: "14px",
  },

  googleButtonWrap: {
    minHeight: "44px",
    display: "flex",
    alignItems: "center",
  },

  googleButtonOnly: {
    display: "inline-flex",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#e2e8f0",
    fontSize: "13px",
    fontWeight: 950,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "18px",
    padding: "14px 15px",
    background: "rgba(255,255,255,0.95)",
    color: "#111827",
    fontWeight: 850,
    outline: "none",
    marginBottom: "12px",
    boxShadow: "0 10px 28px rgba(0,0,0,0.14)",
  },

  primaryButton: {
    width: "100%",
    border: "none",
    borderRadius: "999px",
    padding: "14px 18px",
    background:
      "linear-gradient(135deg, #facc15 0%, #22d3ee 52%, #7c3aed 100%)",
    color: "#111827",
    fontWeight: 1000,
    cursor: "pointer",
    boxShadow: "0 18px 45px rgba(34,211,238,0.16)",
  },

  secondaryButton: {
    width: "100%",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "999px",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    marginTop: "10px",
  },

  helperText: {
    margin: "10px 0 0",
    color: "#cbd5e1",
    fontSize: "13px",
  },

  infoBox: {
    position: "relative",
    zIndex: 1,
    marginTop: "18px",
    padding: "13px 14px",
    borderRadius: "18px",
    background: "rgba(34,197,94,0.14)",
    border: "1px solid rgba(34,197,94,0.24)",
    color: "#bbf7d0",
    lineHeight: 1.5,
    fontSize: "14px",
  },

  errorBox: {
    position: "relative",
    zIndex: 1,
    marginTop: "18px",
    padding: "13px 14px",
    borderRadius: "18px",
    background: "rgba(239,68,68,0.14)",
    border: "1px solid rgba(239,68,68,0.24)",
    color: "#fecaca",
    lineHeight: 1.5,
    fontSize: "14px",
  },

  backButton: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "999px",
    padding: "13px 16px",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    marginTop: "18px",
  },
};
