import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const SERVICE_OPTIONS = [
  {
    value: "Custom Stitching (Tailor)",
    title: "Custom Stitching",
    subtitle: "Get your outfit stitched from scratch by a tailor.",
    icon: "🧵",
    badge: "Tailor",
    bestFor: "Perfect fit, measurements, custom design",
    timeline: "5 - 12 days",
    priceHint: "Flexible pricing",
    gradient:
      "linear-gradient(135deg, rgba(124,92,255,0.95), rgba(0,212,255,0.82))",
    points: [
      "Made according to your fit card",
      "Best for exact measurements",
      "Useful for ethnic, formal and custom outfits",
    ],
  },
  {
    value: "Designer Wear",
    title: "Designer Wear",
    subtitle: "Discover curated premium outfits from designers.",
    icon: "👑",
    badge: "Designer",
    bestFor: "Wedding, festive, statement pieces",
    timeline: "7 - 20 days",
    priceHint: "Premium range",
    gradient:
      "linear-gradient(135deg, rgba(255,122,162,0.95), rgba(255,170,91,0.82))",
    points: [
      "Premium design guidance",
      "Best for occasions and events",
      "Portfolio-based expert selection",
    ],
  },
  {
    value: "Ready-made + Alteration (Boutique)",
    title: "Ready-made + Alteration",
    subtitle: "Buy ready-made outfits and adjust them for better fit.",
    icon: "🛍️",
    badge: "Boutique",
    bestFor: "Quick purchase, minor fitting, alterations",
    timeline: "2 - 7 days",
    priceHint: "Fast and affordable",
    gradient:
      "linear-gradient(135deg, rgba(30,215,166,0.95), rgba(0,212,255,0.82))",
    points: [
      "Faster than custom stitching",
      "Good for size adjustments",
      "Best for ready-made shoppers",
    ],
  },
  {
    value: "Personal Styling",
    title: "Personal Styling",
    subtitle: "Get outfit guidance from a stylist before final selection.",
    icon: "✨",
    badge: "Stylist",
    bestFor: "Confusion, events, wardrobe guidance",
    timeline: "Same day - 3 days",
    priceHint: "Consultation based",
    gradient:
      "linear-gradient(135deg, rgba(174,92,255,0.95), rgba(255,122,236,0.82))",
    points: [
      "Helps choose the right look",
      "Useful before tailoring or designer wear",
      "Best for complete outfit planning",
    ],
  },
];

export default function ServiceTypePage() {
  const nav = useNavigate();
  const { serviceType, recommendations, patch } = useFlowStore();

  const [error, setError] = useState("");

  const selectedService = useMemo(
    () => SERVICE_OPTIONS.find((item) => item.value === serviceType),
    [serviceType]
  );

  const selectedOutfit = recommendations?.selectedOutfit || null;

  function selectService(value) {
    setError("");
    patch({
      serviceType: value,
    });
  }

  function continueNext() {
    if (!serviceType) {
      setError("Please choose how you want your outfit before continuing.");
      return;
    }

    nav("/quality-location");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes serviceFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes servicePulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 1000px) {
            .service-header {
              grid-template-columns: 1fr !important;
            }

            .service-title {
              font-size: 36px !important;
            }

            .service-layout {
              grid-template-columns: 1fr !important;
            }

            .service-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .service-footer {
              flex-direction: column !important;
            }

            .service-footer button {
              width: 100% !important;
            }
          }

          @media (max-width: 640px) {
            .service-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      <div style={styles.page}>
        <div style={styles.glowOne} />
        <div style={styles.glowTwo} />

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          style={styles.content}
        >
          <section className="service-header" style={styles.header}>
            <div>
              <div style={styles.stepPill}>
                <span style={styles.stepDot} />
                Step 6 of 12 · Marketplace Layer
              </div>

              <h1 className="service-title" style={styles.title}>
                How do you want your outfit?
              </h1>

              <p style={styles.subtitle}>
                Choose the service type so FitGenie can match you with the right
                tailor, designer, boutique, or stylist for your selected outfit.
              </p>
            </div>

            <aside style={styles.previewCard}>
              <div style={styles.previewIcon}>
                {selectedService?.icon || "🧵"}
              </div>

              <div>
                <p style={styles.previewLabel}>Selected service</p>
                <h2 style={styles.previewTitle}>
                  {selectedService?.title || "Service pending"}
                </h2>
                <p style={styles.previewText}>
                  {selectedService?.bestFor ||
                    "Pick a service type to unlock expert matching."}
                </p>
              </div>

              <div style={styles.previewLine} />

              <div style={styles.previewChips}>
                <span style={styles.previewChip}>
                  {selectedOutfit?.title || selectedOutfit?.name || "Outfit selected"}
                </span>
                <span style={styles.previewChip}>
                  {selectedService?.timeline || "Timeline pending"}
                </span>
              </div>
            </aside>
          </section>

          <section className="service-layout" style={styles.layout}>
            <div style={styles.mainPanel}>
              <div style={styles.blockHeader}>
                <span style={styles.blockIcon}>🛒</span>

                <div>
                  <h2 style={styles.blockTitle}>Choose Service Type</h2>
                  <p style={styles.blockText}>
                    This controls what kind of experts you will see in the next
                    step.
                  </p>
                </div>
              </div>

              <div className="service-grid" style={styles.serviceGrid}>
                {SERVICE_OPTIONS.map((option) => {
                  const selected = serviceType === option.value;

                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      whileHover={{ y: -6, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectService(option.value)}
                      style={{
                        ...styles.serviceCard,
                        ...(selected ? styles.serviceCardSelected : {}),
                      }}
                    >
                      <div
                        style={{
                          ...styles.serviceVisual,
                          background: option.gradient,
                        }}
                      >
                        <span style={styles.serviceIcon}>{option.icon}</span>
                        <span style={styles.serviceBadge}>{option.badge}</span>
                      </div>

                      <div style={styles.serviceBody}>
                        <div style={styles.cardTitleRow}>
                          <h3 style={styles.cardTitle}>{option.title}</h3>

                          <span
                            style={{
                              ...styles.checkCircle,
                              ...(selected ? styles.checkCircleSelected : {}),
                            }}
                          >
                            {selected ? "✓" : ""}
                          </span>
                        </div>

                        <p style={styles.cardText}>{option.subtitle}</p>

                        <div style={styles.infoRow}>
                          <span style={styles.infoPill}>⏱ {option.timeline}</span>
                          <span style={styles.infoPill}>₹ {option.priceHint}</span>
                        </div>

                        <div style={styles.pointsList}>
                          {option.points.map((point) => (
                            <span key={point} style={styles.pointItem}>
                              <span style={styles.pointDot}>✓</span>
                              {point}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <aside style={styles.sidePanel}>
              <div style={styles.sideTop}>
                <span style={styles.sideIcon}>🧞</span>

                <div>
                  <p style={styles.sideLabel}>FitGenie will match</p>
                  <h2 style={styles.sideTitle}>
                    {selectedService?.badge || "Expert"}
                  </h2>
                </div>
              </div>

              <div style={styles.summaryList}>
                <div style={styles.summaryItem}>
                  <span>Selected Outfit</span>
                  <strong>
                    {selectedOutfit?.title ||
                      selectedOutfit?.name ||
                      "From recommendations"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Service Type</span>
                  <strong>{selectedService?.value || "Required"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Best For</span>
                  <strong>{selectedService?.bestFor || "Choose a service"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Expected Timeline</span>
                  <strong>{selectedService?.timeline || "Pending"}</strong>
                </div>
              </div>

              <div style={styles.expertPreview}>
                <span style={styles.expertBadge}>Next step</span>

                <h3 style={styles.expertTitle}>Quality & Location Filters</h3>

                <p style={styles.expertText}>
                  After choosing a service type, you will filter experts by
                  ratings and location preference.
                </p>

                <div style={styles.nextPills}>
                  <span>⭐ Ratings</span>
                  <span>📍 Location</span>
                  <span>🧵 Experts</span>
                </div>
              </div>
            </aside>
          </section>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <section style={styles.finalSummary}>
            <div style={styles.finalIcon}>{selectedService?.icon || "🪄"}</div>

            <div>
              <p style={styles.finalLabel}>Selected marketplace path</p>
              <strong style={styles.finalText}>
                {selectedService
                  ? `${selectedService.title} · ${selectedService.bestFor}`
                  : "No service type selected yet"}
              </strong>
            </div>
          </section>

          <div className="service-footer" style={styles.footer}>
            <button
              type="button"
              className="btn ghost"
              onClick={() => nav("/recommendations")}
              style={styles.footerButton}
            >
              Back
            </button>

            <button
              type="button"
              className="btn"
              onClick={continueNext}
              style={styles.footerButton}
            >
              Continue to Quality & Location
            </button>
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "calc(100vh - 40px)",
    overflow: "hidden",
    borderRadius: "34px",
    padding: "34px",
    background:
      "radial-gradient(circle at 12% 10%, rgba(124,92,255,0.28), transparent 30%), radial-gradient(circle at 88% 8%, rgba(0,212,255,0.22), transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  glowOne: {
    position: "absolute",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background: "rgba(124,92,255,0.18)",
    filter: "blur(72px)",
    top: "-120px",
    left: "-100px",
    pointerEvents: "none",
  },
  glowTwo: {
    position: "absolute",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background: "rgba(0,212,255,0.14)",
    filter: "blur(72px)",
    right: "-130px",
    bottom: "-140px",
    pointerEvents: "none",
  },
  content: {
    position: "relative",
    zIndex: 2,
  },
  header: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 350px",
    gap: "22px",
    alignItems: "stretch",
    marginBottom: "24px",
  },
  stepPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.84)",
    fontSize: "13px",
    fontWeight: 800,
    marginBottom: "16px",
  },
  stepDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#00d4ff",
    boxShadow: "0 0 18px rgba(0,212,255,0.9)",
    animation: "servicePulse 2s ease-in-out infinite",
  },
  title: {
    margin: 0,
    fontSize: "48px",
    lineHeight: 1.04,
    letterSpacing: "-1.5px",
  },
  subtitle: {
    maxWidth: "760px",
    margin: "14px 0 0",
    color: "rgba(255,255,255,0.74)",
    lineHeight: 1.65,
    fontSize: "16px",
  },
  previewCard: {
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "26px",
    padding: "20px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))",
    boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
  },
  previewIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "22px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.11)",
    border: "1px solid rgba(255,255,255,0.14)",
    fontSize: "31px",
    marginBottom: "15px",
    animation: "serviceFloat 3.2s ease-in-out infinite",
  },
  previewLabel: {
    margin: "0 0 4px",
    color: "rgba(255,255,255,0.62)",
    fontWeight: 900,
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  previewTitle: {
    margin: 0,
    fontSize: "22px",
  },
  previewText: {
    margin: "9px 0 0",
    color: "rgba(255,255,255,0.70)",
    lineHeight: 1.5,
    fontSize: "14px",
  },
  previewLine: {
    height: "1px",
    margin: "18px 0",
    background: "rgba(255,255,255,0.13)",
  },
  previewChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  previewChip: {
    padding: "7px 9px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontSize: "12px",
    color: "rgba(255,255,255,0.78)",
    fontWeight: 800,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 340px",
    gap: "18px",
    alignItems: "start",
  },
  mainPanel: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "28px",
    padding: "22px",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
  },
  blockHeader: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "18px",
  },
  blockIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.90), rgba(0,212,255,0.78))",
    border: "1px solid rgba(255,255,255,0.18)",
    fontSize: "22px",
    flex: "0 0 auto",
  },
  blockTitle: {
    margin: "0 0 6px",
    fontSize: "25px",
  },
  blockText: {
    margin: 0,
    color: "rgba(255,255,255,0.68)",
    lineHeight: 1.55,
  },
  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },
  serviceCard: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "24px",
    overflow: "hidden",
    padding: 0,
    background: "rgba(255,255,255,0.065)",
    color: "inherit",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 16px 36px rgba(0,0,0,0.18)",
  },
  serviceCardSelected: {
    border: "2px solid rgba(0,212,255,0.95)",
    boxShadow: "0 22px 50px rgba(0,212,255,0.14)",
  },
  serviceVisual: {
    height: "100px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px",
  },
  serviceIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "22px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.22)",
    border: "1px solid rgba(255,255,255,0.24)",
    fontSize: "34px",
    boxShadow: "0 14px 28px rgba(0,0,0,0.22)",
  },
  serviceBadge: {
    padding: "8px 11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.22)",
    border: "1px solid rgba(255,255,255,0.22)",
    fontSize: "12px",
    fontWeight: 900,
  },
  serviceBody: {
    padding: "16px",
  },
  cardTitleRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
  },
  cardText: {
    margin: "8px 0 12px",
    color: "rgba(255,255,255,0.70)",
    lineHeight: 1.45,
    fontSize: "14px",
  },
  checkCircle: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(255,255,255,0.22)",
    color: "#061224",
    fontSize: "13px",
    fontWeight: 900,
    flex: "0 0 auto",
  },
  checkCircleSelected: {
    background: "#00d4ff",
    borderColor: "#00d4ff",
    boxShadow: "0 0 20px rgba(0,212,255,0.5)",
  },
  infoRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "12px",
  },
  infoPill: {
    padding: "7px 9px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontSize: "12px",
    color: "rgba(255,255,255,0.78)",
    fontWeight: 800,
  },
  pointsList: {
    display: "grid",
    gap: "8px",
  },
  pointItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    color: "rgba(255,255,255,0.72)",
    fontSize: "13px",
    lineHeight: 1.4,
  },
  pointDot: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "rgba(0,212,255,0.13)",
    color: "#d9fbff",
    fontSize: "10px",
    fontWeight: 900,
    flex: "0 0 auto",
  },
  sidePanel: {
    position: "sticky",
    top: "18px",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "28px",
    padding: "22px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))",
    boxShadow: "0 22px 52px rgba(0,0,0,0.20)",
  },
  sideTop: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "16px",
  },
  sideIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "20px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.90), rgba(0,212,255,0.78))",
    border: "1px solid rgba(255,255,255,0.18)",
    fontSize: "28px",
  },
  sideLabel: {
    margin: "0 0 4px",
    color: "rgba(255,255,255,0.60)",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  sideTitle: {
    margin: 0,
    fontSize: "22px",
  },
  summaryList: {
    display: "grid",
    gap: "10px",
  },
  summaryItem: {
    padding: "12px",
    borderRadius: "16px",
    background: "rgba(0,0,0,0.16)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: "4px",
  },
  expertPreview: {
    marginTop: "14px",
    padding: "14px",
    borderRadius: "20px",
    background: "rgba(0,212,255,0.10)",
    border: "1px solid rgba(0,212,255,0.22)",
  },
  expertBadge: {
    display: "inline-flex",
    marginBottom: "8px",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.10)",
    color: "#d9fbff",
    fontSize: "11px",
    fontWeight: 900,
  },
  expertTitle: {
    margin: "0 0 8px",
    fontSize: "18px",
  },
  expertText: {
    margin: 0,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.5,
    fontSize: "13px",
  },
  nextPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
  },
  errorBox: {
    marginTop: "16px",
    padding: "13px 15px",
    borderRadius: "16px",
    background: "rgba(255, 86, 86, 0.16)",
    border: "1px solid rgba(255, 120, 120, 0.35)",
    color: "#ffdede",
  },
  finalSummary: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    marginTop: "18px",
    padding: "16px",
    borderRadius: "22px",
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  finalIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.9), rgba(0,212,255,0.8))",
    fontSize: "22px",
    flex: "0 0 auto",
  },
  finalLabel: {
    margin: "0 0 4px",
    color: "rgba(255,255,255,0.58)",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  finalText: {
    fontSize: "16px",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "22px",
  },
  footerButton: {
    minWidth: "220px",
  },
};
