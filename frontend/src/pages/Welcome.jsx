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

  function continueWithMobile() {
    patch({ loginMode: "mobile" });
    nav("/login/mobile");
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
            0% { transform: translateY(0px); }
            50% { transform: translateY(-14px); }
            100% { transform: translateY(0px); }
          }

          @keyframes fitGeniePulse {
            0% { opacity: 0.45; transform: scale(0.96); }
            50% { opacity: 0.9; transform: scale(1.03); }
            100% { opacity: 0.45; transform: scale(0.96); }
          }

          @keyframes fitGenieShine {
            0% { transform: translateX(-140%); }
            100% { transform: translateX(140%); }
          }

          @media (max-width: 840px) {
            .welcome-grid {
              grid-template-columns: 1fr !important;
            }

            .welcome-title {
              font-size: 42px !important;
            }

            .welcome-panel {
              padding: 22px !important;
            }

            .welcome-auth-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />
      <div style={styles.backgroundGrid} />

      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.section
            key="splash"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.65 }}
            style={styles.splash}
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.65 }}
              style={styles.splashLogo}
            >
              <span style={styles.splashLogoIcon}>✦</span>
            </motion.div>

            <motion.h1
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.28, duration: 0.65 }}
              style={styles.splashTitle}
            >
              FitGenie
            </motion.h1>

            <motion.p
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.42, duration: 0.65 }}
              style={styles.splashSubtitle}
            >
              Find your perfect fit in seconds
            </motion.p>

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 210, opacity: 1 }}
              transition={{ delay: 0.72, duration: 0.8 }}
              style={styles.loadingBar}
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  delay: 0.95,
                  duration: 1.25,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                style={styles.loadingShine}
              />
            </motion.div>
          </motion.section>
        ) : (
          <motion.section
            key="auth-choice"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            style={styles.container}
          >
            <div className="welcome-grid" style={styles.grid}>
              <section style={styles.heroSection}>
                <div style={styles.badge}>
                  <span style={styles.badgeDot} />
                  AI-powered fit discovery
                </div>

                <h1 className="welcome-title" style={styles.title}>
                  Your perfect outfit starts with one smart sign-in.
                </h1>

                <p style={styles.subtitle}>
                  Save your body profile, size recommendations, style choices,
                  expert bookings, fit card, and order tracking in one seamless
                  FitGenie journey.
                </p>

                <div style={styles.visualCard}>
                  <div style={styles.avatarCluster}>
                    <span style={{ ...styles.avatar, ...styles.avatarOne }}>
                      XS
                    </span>
                    <span style={{ ...styles.avatar, ...styles.avatarTwo }}>
                      M
                    </span>
                    <span style={{ ...styles.avatar, ...styles.avatarThree }}>
                      XL
                    </span>
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
                  <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>📏</span>
                    Smart size memory
                  </div>

                  <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>🧵</span>
                    Expert-ready fit card
                  </div>

                  <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>🚚</span>
                    Order tracking
                  </div>
                </div>
              </section>

              <section className="welcome-panel" style={styles.authPanel}>
                <div style={styles.panelHeader}>
                  <span style={styles.panelPill}>Get started</span>
                  <h2 style={styles.panelTitle}>Choose how to continue</h2>
                  <p style={styles.panelText}>
                    Pick a sign-in method. You can still explore as a guest if
                    you want to see the flow first.
                  </p>
                </div>

                <div className="welcome-auth-grid" style={styles.authGrid}>
                  <button
                    type="button"
                    onClick={continueWithGoogle}
                    style={styles.authButtonPrimary}
                  >
                    <span style={styles.providerIconGoogle}>G</span>

                    <span style={styles.buttonCopy}>
                      <strong>Continue with Google</strong>
                      <small>Choose your Gmail account</small>
                    </span>

                    <span style={styles.buttonArrow}>→</span>
                  </button>

                  <button
                    type="button"
                    onClick={continueWithMobile}
                    style={styles.authButton}
                  >
                    <span style={styles.providerIconMobile}>📱</span>

                    <span style={styles.buttonCopy}>
                      <strong>Continue with mobile</strong>
                      <small>Country code + OTP login</small>
                    </span>

                    <span style={styles.buttonArrow}>→</span>
                  </button>

                  <button
                    type="button"
                    onClick={continueAsGuest}
                    style={styles.guestButton}
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
                  <span style={styles.securityIcon}>🔐</span>
                  <span>
                    Your fit profile is used only to personalize size,
                    recommendations, and expert matching.
                  </span>
                </div>

                <div style={styles.miniTimeline}>
                  <div style={styles.timelineStep}>
                    <span>1</span>
                    Sign in
                  </div>

                  <div style={styles.timelineLine} />

                  <div style={styles.timelineStep}>
                    <span>2</span>
                    Share fit details
                  </div>

                  <div style={styles.timelineLine} />

                  <div style={styles.timelineStep}>
                    <span>3</span>
                    Get matched
                  </div>
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
      "radial-gradient(circle at 18% 10%, rgba(124,92,255,0.36), transparent 30%), radial-gradient(circle at 85% 18%, rgba(0,212,255,0.30), transparent 28%), linear-gradient(135deg, #080d1f 0%, #111936 52%, #080d1f 100%)",
    color: "#f7f8ff",
  },
  backgroundGlowOne: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "rgba(124,92,255,0.22)",
    filter: "blur(80px)",
    top: "-120px",
    left: "-120px",
    pointerEvents: "none",
  },
  backgroundGlowTwo: {
    position: "absolute",
    width: "380px",
    height: "380px",
    borderRadius: "50%",
    background: "rgba(0,212,255,0.18)",
    filter: "blur(82px)",
    bottom: "-120px",
    right: "-120px",
    pointerEvents: "none",
  },
  backgroundGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
    backgroundSize: "42px 42px",
    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.95), transparent)",
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
      "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.07))",
    border: "1px solid rgba(255,255,255,0.22)",
    boxShadow:
      "0 25px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.28)",
    animation: "fitGenieFloat 3s ease-in-out infinite",
  },
  splashLogoIcon: {
    fontSize: "42px",
    color: "#fff",
    textShadow: "0 0 22px rgba(0,212,255,0.9)",
  },
  splashTitle: {
    margin: 0,
    fontSize: "64px",
    lineHeight: 1,
    letterSpacing: "-2px",
  },
  splashSubtitle: {
    margin: "14px 0 28px",
    color: "rgba(247,248,255,0.76)",
    fontSize: "18px",
  },
  loadingBar: {
    position: "relative",
    height: "8px",
    borderRadius: "999px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
  },
  loadingShine: {
    width: "70px",
    height: "100%",
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)",
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
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.08)",
    padding: "9px 13px",
    borderRadius: "999px",
    color: "rgba(255,255,255,0.86)",
    fontSize: "13px",
    fontWeight: 800,
    marginBottom: "18px",
  },
  badgeDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#00d4ff",
    boxShadow: "0 0 18px rgba(0,212,255,0.95)",
    animation: "fitGeniePulse 2s ease-in-out infinite",
  },
  title: {
    margin: 0,
    maxWidth: "680px",
    fontSize: "58px",
    lineHeight: 1.02,
    letterSpacing: "-2px",
  },
  subtitle: {
    maxWidth: "650px",
    margin: "20px 0 26px",
    color: "rgba(247,248,255,0.78)",
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
      "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "0 18px 45px rgba(0,0,0,0.22)",
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
    fontWeight: 900,
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.24)",
    boxShadow: "0 16px 34px rgba(0,0,0,0.28)",
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
    background: "linear-gradient(135deg,#7c5cff,#00d4ff)",
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
    color: "rgba(247,248,255,0.70)",
    fontSize: "13px",
    fontWeight: 800,
  },
  previewScore: {
    color: "#d9fbff",
  },
  progressTrack: {
    height: "11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    overflow: "hidden",
    marginBottom: "13px",
  },
  progressFill: {
    width: "92%",
    height: "100%",
    borderRadius: "inherit",
    background: "linear-gradient(90deg,#7c5cff,#00d4ff)",
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
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.12)",
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
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(247,248,255,0.84)",
    fontSize: "13px",
    fontWeight: 800,
  },
  featureIcon: {
    fontSize: "16px",
  },
  authPanel: {
    borderRadius: "34px",
    padding: "30px",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.07))",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.22)",
    backdropFilter: "blur(18px)",
  },
  panelHeader: {
    marginBottom: "20px",
  },
  panelPill: {
    display: "inline-flex",
    borderRadius: "999px",
    padding: "7px 10px",
    background: "rgba(0,212,255,0.13)",
    border: "1px solid rgba(0,212,255,0.30)",
    color: "#d9fbff",
    fontSize: "12px",
    fontWeight: 900,
    marginBottom: "12px",
  },
  panelTitle: {
    margin: "0 0 9px",
    fontSize: "30px",
    lineHeight: 1.15,
  },
  panelText: {
    margin: 0,
    color: "rgba(247,248,255,0.72)",
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
    background: "#fff",
    color: "#111827",
    cursor: "pointer",
    boxShadow: "0 16px 32px rgba(0,0,0,0.22)",
  },
  authButton: {
    width: "100%",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "22px",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "rgba(255,255,255,0.09)",
    color: "#fff",
    cursor: "pointer",
  },
  guestButton: {
    width: "100%",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "22px",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "rgba(255,255,255,0.045)",
    color: "#fff",
    cursor: "pointer",
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
    fontWeight: 900,
    flex: "0 0 auto",
  },
  providerIconMobile: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg,#7c5cff,#00d4ff)",
    fontSize: "22px",
    flex: "0 0 auto",
  },
  providerIconGuest: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.14)",
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
    fontWeight: 900,
    opacity: 0.72,
  },
  securityNote: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    marginTop: "18px",
    padding: "13px",
    borderRadius: "18px",
    background: "rgba(0,0,0,0.16)",
    color: "rgba(247,248,255,0.76)",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  securityIcon: {
    flex: "0 0 auto",
  },
  miniTimeline: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "18px",
    color: "rgba(247,248,255,0.72)",
    fontSize: "12px",
    fontWeight: 800,
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
    background: "rgba(255,255,255,0.18)",
  },
};
