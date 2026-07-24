import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useFlowStore } from "../store/useFlowStore";

export default function Welcome() {
  const nav = useNavigate();
  const { patch } = useFlowStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4200);

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
            50% { transform: translateY(-12px); }
          }

          @keyframes fitGeniePulse {
            0%, 100% { opacity: 0.65; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.18); }
          }

          @keyframes premiumShimmer {
            0% { transform: translateX(-130%); }
            100% { transform: translateX(130%); }
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
              font-size: 35px !important;
            }

            .fitgenie-panel-title {
              font-size: 26px !important;
            }

            .fitgenie-creator-block {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      <div style={styles.deepGlowOne} />
      <div style={styles.deepGlowTwo} />
      <div style={styles.deepGlowThree} />
      <div style={styles.backgroundGrid} />
      <div style={styles.noiseLayer} />

      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.section
            key="splash"
            style={styles.splash}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              style={styles.splashLogo}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <span style={styles.splashLogoIcon}>✦</span>
              <span style={styles.logoRing} />
            </motion.div>

            <motion.h1
              style={styles.splashTitle}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.28 }}
            >
              FitGenie
            </motion.h1>

            <motion.p
              style={styles.splashSubtitle}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.42 }}
            >
              Find your perfect fit in seconds
            </motion.p>

            <motion.div
              className="fitgenie-creator-block"
              style={styles.creatorBlock}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.68 }}
            >
              <motion.div
                style={styles.creatorCard}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.82 }}
              >
                <span style={styles.creatorLabel}>Founder</span>
                <strong style={styles.creatorName}>Janvi Patel</strong>
              </motion.div>

              <motion.div
                style={styles.creatorCard}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.02 }}
              >
                <span style={styles.creatorLabel}>Co-Founder</span>
                <strong style={styles.creatorName}>Jafar Kachhi</strong>
              </motion.div>
            </motion.div>

            <motion.div
              style={styles.splashPremiumLine}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              transition={{ duration: 0.7, delay: 1.22 }}
            >
              <span style={styles.splashPremiumLineGlow} />
            </motion.div>

            <motion.div
              style={styles.loadingBar}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.42 }}
            >
              <motion.div
                style={styles.loadingShine}
                initial={{ x: "-90px" }}
                animate={{ x: "310px" }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.section>
        ) : (
          <motion.section
            key="welcome"
            style={styles.container}
            initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65 }}
          >
            <div className="fitgenie-welcome-grid" style={styles.grid}>
              <section style={styles.heroSection}>
                <div style={styles.badge}>
                  <span style={styles.badgeDot} />
                  AI-powered premium fit discovery
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
                <div style={styles.panelGlow} />

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
                      <strong>Continue with Email</strong>
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
      "radial-gradient(circle at 12% 10%, rgba(124, 58, 237, 0.44), transparent 28%), radial-gradient(circle at 86% 16%, rgba(14, 165, 233, 0.34), transparent 30%), radial-gradient(circle at 50% 94%, rgba(20, 184, 166, 0.26), transparent 34%), linear-gradient(135deg, #070a18 0%, #111827 34%, #1e1b4b 66%, #0f172a 100%)",
    color: "#f8fafc",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },

  deepGlowOne: {
    position: "absolute",
    width: "520px",
    height: "520px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, rgba(124, 58, 237, 0.35), rgba(236, 72, 153, 0.18))",
    filter: "blur(80px)",
    top: "-180px",
    left: "-160px",
    pointerEvents: "none",
  },

  deepGlowTwo: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, rgba(14, 165, 233, 0.32), rgba(45, 212, 191, 0.18))",
    filter: "blur(86px)",
    bottom: "-170px",
    right: "-150px",
    pointerEvents: "none",
  },

  deepGlowThree: {
    position: "absolute",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background: "rgba(250, 204, 21, 0.12)",
    filter: "blur(78px)",
    top: "42%",
    left: "48%",
    pointerEvents: "none",
  },

  backgroundGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
    backgroundSize: "44px 44px",
    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.82), transparent)",
    pointerEvents: "none",
  },

  noiseLayer: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.04), transparent 40%, rgba(255,255,255,0.025))",
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
    position: "relative",
    width: "112px",
    height: "112px",
    borderRadius: "34px",
    display: "grid",
    placeItems: "center",
    marginBottom: "24px",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))",
    border: "1px solid rgba(255,255,255,0.24)",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.38), 0 0 60px rgba(109,93,252,0.32), inset 0 1px 0 rgba(255,255,255,0.32)",
    backdropFilter: "blur(18px)",
    animation: "fitGenieFloat 3s ease-in-out infinite",
  },

  splashLogoIcon: {
    position: "relative",
    zIndex: 2,
    fontSize: "48px",
    color: "#facc15",
    textShadow:
      "0 0 24px rgba(250,204,21,0.65), 0 0 44px rgba(0,188,212,0.45)",
  },

  logoRing: {
    position: "absolute",
    inset: "-10px",
    borderRadius: "40px",
    border: "1px solid rgba(250,204,21,0.25)",
    boxShadow:
      "0 0 40px rgba(250,204,21,0.18), inset 0 0 34px rgba(109,93,252,0.2)",
  },

  splashTitle: {
    margin: 0,
    fontSize: "72px",
    lineHeight: 1,
    letterSpacing: "-3px",
    color: "#ffffff",
    textShadow: "0 18px 55px rgba(0,0,0,0.5)",
  },

  splashSubtitle: {
    margin: "16px 0 22px",
    color: "#cbd5e1",
    fontSize: "18px",
    letterSpacing: "0.02em",
  },

  creatorBlock: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    width: "min(480px, 92vw)",
    margin: "0 auto 24px",
  },

  creatorCard: {
    padding: "14px 18px",
    borderRadius: "22px",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow:
      "0 20px 50px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.16)",
    backdropFilter: "blur(18px)",
  },

  creatorLabel: {
    display: "block",
    marginBottom: "6px",
    color: "#fde68a",
    fontSize: "11px",
    fontWeight: 950,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },

  creatorName: {
    display: "block",
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: 950,
    letterSpacing: "-0.02em",
    textShadow: "0 10px 28px rgba(0,0,0,0.35)",
  },

  splashPremiumLine: {
    position: "relative",
    height: "1px",
    marginBottom: "24px",
    background:
      "linear-gradient(90deg, transparent, rgba(250,204,21,0.92), rgba(0,188,212,0.72), transparent)",
    overflow: "hidden",
  },

  splashPremiumLineGlow: {
    position: "absolute",
    inset: "-10px 0",
    background:
      "linear-gradient(90deg, transparent, rgba(250,204,21,0.65), transparent)",
    animation: "premiumShimmer 1.6s linear infinite",
  },

  loadingBar: {
    position: "relative",
    width: "280px",
    height: "9px",
    borderRadius: "999px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "inset 0 1px 8px rgba(0,0,0,0.32)",
  },

  loadingShine: {
    width: "82px",
    height: "100%",
    background:
      "linear-gradient(90deg, transparent, rgba(250,204,21,0.95), rgba(0,188,212,0.95), transparent)",
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
    gap: "30px",
    alignItems: "center",
  },

  heroSection: {
    padding: "10px",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid rgba(250,204,21,0.26)",
    background:
      "linear-gradient(135deg, rgba(250,204,21,0.14), rgba(255,255,255,0.06))",
    padding: "10px 14px",
    borderRadius: "999px",
    color: "#fde68a",
    fontSize: "13px",
    fontWeight: 900,
    marginBottom: "20px",
    boxShadow: "0 16px 34px rgba(0,0,0,0.18)",
    backdropFilter: "blur(16px)",
  },

  badgeDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#22d3ee",
    boxShadow: "0 0 20px rgba(34,211,238,0.85)",
    animation: "fitGeniePulse 2s ease-in-out infinite",
  },

  title: {
    margin: 0,
    maxWidth: "700px",
    fontSize: "60px",
    lineHeight: 1.02,
    letterSpacing: "-2.4px",
    color: "#ffffff",
    textShadow: "0 20px 60px rgba(0,0,0,0.4)",
  },

  subtitle: {
    maxWidth: "650px",
    margin: "22px 0 28px",
    color: "#cbd5e1",
    fontSize: "17px",
    lineHeight: 1.72,
  },

  visualCard: {
    display: "grid",
    gridTemplateColumns: "150px minmax(0, 1fr)",
    gap: "18px",
    alignItems: "center",
    maxWidth: "610px",
    borderRadius: "30px",
    padding: "19px",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08), rgba(14,165,233,0.1))",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow:
      "0 26px 70px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
    backdropFilter: "blur(20px)",
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
    border: "1px solid rgba(255,255,255,0.4)",
    boxShadow: "0 18px 38px rgba(0,0,0,0.28)",
  },

  avatarOne: {
    top: "16px",
    left: "0px",
    background: "linear-gradient(135deg,#f97316,#ec4899)",
    transform: "rotate(-10deg)",
  },

  avatarTwo: {
    top: "0px",
    left: "42px",
    background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
    zIndex: 2,
  },

  avatarThree: {
    top: "34px",
    left: "82px",
    background: "linear-gradient(135deg,#10b981,#22d3ee)",
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
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: 900,
  },

  previewScore: {
    color: "#facc15",
    textShadow: "0 0 20px rgba(250,204,21,0.3)",
  },

  progressTrack: {
    height: "11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.14)",
    overflow: "hidden",
    marginBottom: "13px",
  },

  progressFill: {
    width: "92%",
    height: "100%",
    borderRadius: "inherit",
    background: "linear-gradient(90deg,#facc15,#22d3ee,#7c3aed)",
    boxShadow: "0 0 18px rgba(34,211,238,0.36)",
  },

  previewTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  previewTag: {
    fontSize: "12px",
    padding: "7px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "#e2e8f0",
    fontWeight: 800,
  },

  featureGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "20px",
  },

  featureItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    padding: "11px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.09)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#e2e8f0",
    fontSize: "13px",
    fontWeight: 900,
    boxShadow: "0 16px 34px rgba(0,0,0,0.16)",
    backdropFilter: "blur(16px)",
  },

  featureIcon: {
    fontSize: "16px",
  },

  authPanel: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "36px",
    padding: "32px",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.09), rgba(124,58,237,0.12))",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow:
      "0 34px 90px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.2)",
    backdropFilter: "blur(22px)",
  },

  panelGlow: {
    position: "absolute",
    top: "-120px",
    right: "-120px",
    width: "260px",
    height: "260px",
    borderRadius: "999px",
    background:
      "linear-gradient(135deg, rgba(250,204,21,0.22), rgba(34,211,238,0.2))",
    filter: "blur(20px)",
    pointerEvents: "none",
  },

  panelHeader: {
    position: "relative",
    zIndex: 1,
    marginBottom: "22px",
  },

  panelPill: {
    display: "inline-flex",
    borderRadius: "999px",
    padding: "8px 11px",
    background: "rgba(34,211,238,0.14)",
    border: "1px solid rgba(34,211,238,0.24)",
    color: "#67e8f9",
    fontSize: "12px",
    fontWeight: 950,
    marginBottom: "13px",
  },

  panelTitle: {
    margin: "0 0 10px",
    fontSize: "31px",
    lineHeight: 1.15,
    color: "#ffffff",
    letterSpacing: "-0.04em",
  },

  panelText: {
    margin: 0,
    color: "#cbd5e1",
    lineHeight: 1.62,
  },

  authGrid: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gap: "14px",
  },

  authButtonPrimary: {
    width: "100%",
    border: "1px solid rgba(250,204,21,0.28)",
    borderRadius: "24px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(253,230,138,0.92))",
    color: "#111827",
    cursor: "pointer",
    boxShadow:
      "0 20px 46px rgba(0,0,0,0.28), 0 0 34px rgba(250,204,21,0.12)",
  },

  guestButton: {
    width: "100%",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "24px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(34,211,238,0.12), rgba(124,58,237,0.14))",
    color: "#ffffff",
    cursor: "pointer",
    boxShadow: "0 18px 42px rgba(0,0,0,0.22)",
    backdropFilter: "blur(16px)",
  },

  providerIconGoogle: {
    width: "48px",
    height: "48px",
    borderRadius: "17px",
    display: "grid",
    placeItems: "center",
    background: "#ffffff",
    color: "#111827",
    fontSize: "22px",
    fontWeight: 950,
    flex: "0 0 auto",
    boxShadow: "0 12px 24px rgba(0,0,0,0.16)",
  },

  providerIconGuest: {
    width: "48px",
    height: "48px",
    borderRadius: "17px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg,#facc15,#22d3ee,#7c3aed)",
    color: "#ffffff",
    fontSize: "20px",
    flex: "0 0 auto",
    boxShadow: "0 14px 26px rgba(34,211,238,0.18)",
  },

  buttonCopy: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    textAlign: "left",
    flex: 1,
  },

  buttonArrow: {
    fontSize: "24px",
    fontWeight: 950,
    opacity: 0.78,
  },

  securityNote: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    marginTop: "19px",
    padding: "14px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.1)",
    color: "#cbd5e1",
    fontSize: "13px",
    lineHeight: 1.52,
    border: "1px solid rgba(255,255,255,0.13)",
    backdropFilter: "blur(16px)",
  },

  securityIcon: {
    flex: "0 0 auto",
  },

  miniTimeline: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "19px",
    color: "#cbd5e1",
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
    background: "rgba(255,255,255,0.2)",
  },
};
