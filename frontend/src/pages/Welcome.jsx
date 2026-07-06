import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useFlowStore } from "../store/useFlowStore";

export default function Welcome() {
  const nav = useNavigate();
  const { patch } = useFlowStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);

    return () => clearTimeout(timer);
  }, []);

  function continueWithGoogle() {
    patch({ loginMode: "google" });
    nav("/login/email");
  }

  function continueAsGuest() {
    patch({ loginMode: "guest" });
    nav("/intent");
  }

  return (
    <main style={styles.page}>
      <style>
        {`
          @keyframes fitGenieFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          @keyframes fitGeniePulse {
            0%, 100% { opacity: 0.7; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.16); }
          }

          @media (max-width: 900px) {
            .fitgenie-welcome-grid {
              grid-template-columns: 1fr !important;
            }

            .fitgenie-welcome-title {
              font-size: 42px !important;
            }

            .fitgenie-mini-timeline {
              flex-direction: column !important;
              align-items: flex-start !important;
            }

            .fitgenie-timeline-line {
              display: none !important;
            }
          }

          @media (max-width: 560px) {
            .fitgenie-visual-card {
              grid-template-columns: 1fr !important;
            }

            .fitgenie-welcome-title {
              font-size: 36px !important;
            }

            .fitgenie-panel-title {
              font-size: 26px !important;
            }
          }
        `}
      </style>

      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />
      <div style={styles.backgroundGlowThree} />
      <div style={styles.backgroundGrid} />

      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.section
            key="splash"
            style={styles.splash}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.55 }}
          >
            <div style={styles.splashLogo}>
              <span style={styles.splashLogoIcon}>✦</span>
            </div>

            <h1 style={styles.splashTitle}>FitGenie</h1>

            <p style={styles.splashSubtitle}>Find your perfect fit in seconds</p>

            <div style={styles.loadingBar}>
              <motion.div
                style={styles.loadingShine}
                initial={{ x: "-80px" }}
                animate={{ x: "260px" }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="welcome"
            style={styles.container}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="fitgenie-welcome-grid" style={styles.grid}>
              <section style={styles.heroSection}>
                <div style={styles.badge}>
                  <span style={styles.badgeDot} />
                  AI-powered fit discovery
                </div>

                <h1 className="fitgenie-welcome-title" style={styles.title}>
                  Your perfect outfit starts with one smart sign-in.
                </h1>

                <p style={styles.subtitle}>
                  Save your body profile, size recommendations, style choices,
                  expert bookings, fit card, and order tracking in one seamless
                  FitGenie journey.
                </p>

                <div className="fitgenie-visual-card" style={styles.visualCard}>
                  <div style={styles.avatarCluster}>
                    <div style={{ ...styles.avatar, ...styles.avatarOne }}>
                      XS
                    </div>

                    <div style={{ ...styles.avatar, ...styles.avatarTwo }}>
                      M
                    </div>

                    <div style={{ ...styles.avatar, ...styles.avatarThree }}>
                      XL
                    </div>
                  </div>

                  <div style={styles.fitPreview}>
                    <div style={styles.previewTop}>
                      <span style={styles.previewLabel}>Fit Confidence</span>
                      <strong style={styles.previewScore}>92%</strong>
                    </div>

                    <div style={styles.progressTrack}>
                      <div style={styles.progressFill} />
                    </div>

                    <div style={styles.previewTags}>
                      <span style={styles.previewTag}>Regular Fit</span>
                      <span style={styles.previewTag}>Cotton</span>
                      <span style={styles.previewTag}>₹1k–₹2k</span>
                    </div>
                  </div>
                </div>

                <div style={styles.featureGrid}>
                  <span style={styles.featureItem}>
                    <span style={styles.featureIcon}>🧠</span>
                    Smart size memory
                  </span>

                  <span style={styles.featureItem}>
                    <span style={styles.featureIcon}>🪡</span>
                    Expert-ready fit card
                  </span>

                  <span style={styles.featureItem}>
                    <span style={styles.featureIcon}>📦</span>
                    Order tracking
                  </span>
                </div>
              </section>

              <section style={styles.authPanel}>
                <div style={styles.panelHeader}>
                  <span style={styles.panelPill}>Get started</span>

                  <h2 className="fitgenie-panel-title" style={styles.panelTitle}>
                    Choose how to continue
                  </h2>

                  <p style={styles.panelText}>
                    Continue with your Gmail account or explore FitGenie as a
                    guest first.
                  </p>
                </div>

                <div style={styles.authGrid}>
                  <button
                    type="button"
                    style={styles.authButtonPrimary}
                    onClick={continueWithGoogle}
                  >
                    <span style={styles.providerIconGoogle}>G</span>

                    <span style={styles.buttonCopy}>
                      <strong>Continue with Gmail</strong>
                      <small>Choose your Google account</small>
                    </span>

                    <span style={styles.buttonArrow}>→</span>
                  </button>

                  <button
                    type="button"
                    style={styles.guestButton}
                    onClick={continueAsGuest}
                  >
                    <span style={styles.providerIconGuest}>✨</span>

                    <span style={styles.buttonCopy}>
                      <strong>Explore as guest</strong>
                      <small>No sign-in required</small>
                    </span>

                    <span style={styles.buttonArrow}>→</span>
                  </button>
                </div>

                <div style={styles.securityNote}>
                  <span style={styles.securityIcon}>🔒</span>

                  <span>
                    Your fit profile is used only to personalize size,
                    recommendations, and expert matching.
                  </span>
                </div>

                <div className="fitgenie-mini-timeline" style={styles.miniTimeline}>
                  <span style={styles.timelineStep}>
                    <strong>1</strong> Sign in
                  </span>

                  <span
                    className="fitgenie-timeline-line"
                    style={styles.timelineLine}
                  />

                  <span style={styles.timelineStep}>
                    <strong>2</strong> Share fit details
                  </span>

                  <span
                    className="fitgenie-timeline-line"
                    style={styles.timelineLine}
                  />

                  <span style={styles.timelineStep}>
                    <strong>3</strong> Get matched
                  </span>
                </div>
              </section>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background:
      "radial-gradient(circle at 12% 12%, rgba(255, 183, 77, 0.34), transparent 30%), radial-gradient(circle at 88% 16%, rgba(109, 93, 252, 0.32), transparent 30%), radial-gradient(circle at 50% 94%, rgba(0, 188, 212, 0.26), transparent 34%), linear-gradient(135deg, #fff7ed 0%, #eef6ff 38%, #f5f3ff 72%, #ecfeff 100%)",
    color: "#14213d",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },

  backgroundGlowOne: {
    position: "absolute",
    width: "430px",
    height: "430px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, rgba(255, 138, 76, 0.28), rgba(255, 214, 102, 0.2))",
    filter: "blur(70px)",
    top: "-130px",
    left: "-120px",
    pointerEvents: "none",
  },

  backgroundGlowTwo: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, rgba(109, 93, 252, 0.26), rgba(0, 188, 212, 0.2))",
    filter: "blur(78px)",
    bottom: "-140px",
    right: "-120px",
    pointerEvents: "none",
  },

  backgroundGlowThree: {
    position: "absolute",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    background: "rgba(45, 212, 191, 0.18)",
    filter: "blur(70px)",
    top: "42%",
    left: "48%",
    pointerEvents: "none",
  },

  backgroundGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)",
    backgroundSize: "42px 42px",
    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.86), transparent)",
    pointerEvents: "none",
  },

  splash: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    textAlign: "center",
    padding: "28px",
    position: "relative",
    zIndex: 2,
  },

  splashLogo: {
    width: "96px",
    height: "96px",
    borderRadius: "30px",
    display: "grid",
    placeItems: "center",
    marginBottom: "22px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.86), rgba(238,246,255,0.72))",
    border: "1px solid rgba(109, 93, 252, 0.16)",
    boxShadow:
      "0 25px 60px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,0.8)",
    animation: "fitGenieFloat 3s ease-in-out infinite",
  },

  splashLogoIcon: {
    fontSize: "42px",
    color: "#6d5dfc",
    textShadow: "0 0 22px rgba(0,188,212,0.55)",
  },

  splashTitle: {
    margin: 0,
    fontSize: "64px",
    lineHeight: 1,
    letterSpacing: "-2px",
    color: "#111827",
  },

  splashSubtitle: {
    margin: "14px 0 28px",
    color: "#475569",
    fontSize: "18px",
  },

  loadingBar: {
    position: "relative",
    width: "260px",
    height: "8px",
    borderRadius: "999px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
  },

  loadingShine: {
    width: "70px",
    height: "100%",
    background:
      "linear-gradient(90deg, transparent, rgba(109,93,252,0.95), transparent)",
  },

  container: {
    width: "min(1180px, calc(100% - 32px))",
    minHeight: "100vh",
    margin: "0 auto",
    display: "grid",
    alignItems: "center",
    padding: "36px 0",
    position: "relative",
    zIndex: 2,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: "28px",
    alignItems: "center",
  },

  heroSection: {
    padding: "10px",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    border: "1px solid rgba(109, 93, 252, 0.16)",
    background: "rgba(255,255,255,0.74)",
    padding: "9px 13px",
    borderRadius: "999px",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 900,
    marginBottom: "18px",
    boxShadow: "0 12px 24px rgba(15,23,42,0.06)",
  },

  badgeDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#00bcd4",
    boxShadow: "0 0 18px rgba(0,188,212,0.75)",
    animation: "fitGeniePulse 2s ease-in-out infinite",
  },

  title: {
    margin: 0,
    maxWidth: "680px",
    fontSize: "58px",
    lineHeight: 1.02,
    letterSpacing: "-2px",
    color: "#111827",
  },

  subtitle: {
    maxWidth: "650px",
    margin: "20px 0 26px",
    color: "#475569",
    fontSize: "17px",
    lineHeight: 1.7,
  },

  visualCard: {
    display: "grid",
    gridTemplateColumns: "150px minmax(0, 1fr)",
    gap: "18px",
    alignItems: "center",
    maxWidth: "600px",
    borderRadius: "28px",
    padding: "18px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.84), rgba(238,246,255,0.78), rgba(245,243,255,0.7))",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    boxShadow: "0 18px 45px rgba(15,23,42,0.1)",
    backdropFilter: "blur(16px)",
  },

  avatarCluster: {
    position: "relative",
    height: "112px",
  },

  avatar: {
    position: "absolute",
    width: "72px",
    height: "72px",
    borderRadius: "24px",
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.56)",
    boxShadow: "0 16px 34px rgba(15,23,42,0.16)",
  },

  avatarOne: {
    top: "16px",
    left: "0px",
    background: "linear-gradient(135deg,#ff9f7c,#ff5f8f)",
    transform: "rotate(-10deg)",
  },

  avatarTwo: {
    top: "0px",
    left: "42px",
    background: "linear-gradient(135deg,#6d5dfc,#00bcd4)",
    zIndex: 2,
  },

  avatarThree: {
    top: "34px",
    left: "82px",
    background: "linear-gradient(135deg,#1ed7a6,#8cffd3)",
    transform: "rotate(10deg)",
  },

  fitPreview: {
    minWidth: 0,
  },

  previewTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
  },

  previewLabel: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 900,
  },

  previewScore: {
    color: "#111827",
  },

  progressTrack: {
    height: "11px",
    borderRadius: "999px",
    background: "#e2e8f0",
    overflow: "hidden",
    marginBottom: "13px",
  },

  progressFill: {
    width: "92%",
    height: "100%",
    borderRadius: "inherit",
    background: "linear-gradient(90deg,#6d5dfc,#00bcd4)",
  },

  previewTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  previewTag: {
    fontSize: "12px",
    padding: "7px 9px",
    borderRadius: "999px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#475569",
    fontWeight: 800,
  },

  featureGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "18px",
  },

  featureItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    padding: "10px 13px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.76)",
    border: "1px solid rgba(109, 93, 252, 0.12)",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 900,
    boxShadow: "0 10px 22px rgba(15,23,42,0.05)",
  },

  featureIcon: {
    fontSize: "16px",
  },

  authPanel: {
    borderRadius: "34px",
    padding: "30px",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.88), rgba(238,246,255,0.82), rgba(245,243,255,0.78))",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    boxShadow:
      "0 30px 80px rgba(15,23,42,0.14), inset 0 1px 0 rgba(255,255,255,0.86)",
    backdropFilter: "blur(18px)",
  },

  panelHeader: {
    marginBottom: "20px",
  },

  panelPill: {
    display: "inline-flex",
    borderRadius: "999px",
    padding: "7px 10px",
    background: "rgba(0,188,212,0.12)",
    border: "1px solid rgba(0,188,212,0.22)",
    color: "#155e75",
    fontSize: "12px",
    fontWeight: 950,
    marginBottom: "12px",
  },

  panelTitle: {
    margin: "0 0 9px",
    fontSize: "30px",
    lineHeight: 1.15,
    color: "#111827",
  },

  panelText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
  },

  authGrid: {
    display: "grid",
    gap: "13px",
  },

  authButtonPrimary: {
    width: "100%",
    border: 0,
    borderRadius: "22px",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    boxShadow: "0 16px 32px rgba(15,23,42,0.12)",
  },

  guestButton: {
    width: "100%",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "22px",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.84), rgba(236,254,255,0.72))",
    color: "#111827",
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(15,23,42,0.08)",
  },

  providerIconGoogle: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "#f3f4f6",
    color: "#111827",
    fontSize: "22px",
    fontWeight: 950,
    flex: "0 0 auto",
  },

  providerIconGuest: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg,#6d5dfc,#00bcd4)",
    color: "#ffffff",
    fontSize: "20px",
    flex: "0 0 auto",
  },

  buttonCopy: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    textAlign: "left",
    flex: 1,
  },

  buttonArrow: {
    fontSize: "24px",
    fontWeight: 950,
    opacity: 0.72,
  },

  securityNote: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    marginTop: "18px",
    padding: "13px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.74)",
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.5,
    border: "1px solid rgba(109, 93, 252, 0.1)",
  },

  securityIcon: {
    flex: "0 0 auto",
  },

  miniTimeline: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "18px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
  },

  timelineStep: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    whiteSpace: "nowrap",
  },

  timelineLine: {
    height: "1px",
    flex: 1,
    minWidth: "20px",
    background: "#cbd5e1",
  },
};
