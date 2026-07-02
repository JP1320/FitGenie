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
    gradient: "linear-gradient(135deg, #dbeafe, #ede9fe, #fce7f3)",
    accent: "#6d5dfc",
    points: [
      "Made according to your Fit Card",
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
    gradient: "linear-gradient(135deg, #fce7f3, #ffe4e6, #fed7aa)",
    accent: "#db2777",
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
    gradient: "linear-gradient(135deg, #dcfce7, #cffafe, #e0e7ff)",
    accent: "#059669",
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
    gradient: "linear-gradient(135deg, #fef3c7, #ffedd5, #ffe4e6)",
    accent: "#f97316",
    points: [
      "Helps choose the right look",
      "Useful before tailoring or designer wear",
      "Best for complete outfit planning",
    ],
  },
];

function getSelectedOutfit(flow) {
  return flow.recommendations?.selectedOutfit || flow.selectedOutfit || null;
}

export default function ServiceTypePage() {
  const nav = useNavigate();
  const flow = useFlowStore();

  const { serviceType, patch } = flow;
  const [error, setError] = useState("");

  const selectedService = useMemo(
    () => SERVICE_OPTIONS.find((item) => item.value === serviceType),
    [serviceType]
  );

  const selectedOutfit = getSelectedOutfit(flow);

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
          @keyframes serviceSoftFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes serviceSoftPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 1080px) {
            .service-header {
              grid-template-columns: 1fr !important;
            }

            .service-title {
              font-size: 38px !important;
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
        <div style={styles.glowThree} />

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
              <div style={styles.previewTop}>
                <span style={styles.previewIcon}>
                  {selectedService?.icon || "🧵"}
                </span>

                <div>
                  <p style={styles.previewLabel}>Selected service</p>
                  <h2 style={styles.previewTitle}>
                    {selectedService?.title || "Service pending"}
                  </h2>
                </div>
              </div>

              <p style={styles.previewText}>
                {selectedService?.bestFor ||
                  "Pick a service type to unlock expert matching."}
              </p>

              <div style={styles.previewTags}>
                <span style={styles.previewTag}>
                  {selectedOutfit?.title ||
                    selectedOutfit?.name ||
                    "Outfit selected"}
                </span>
                <span style={styles.previewTag}>
                  {selectedService?.timeline || "Timeline pending"}
                </span>
              </div>
            </aside>
          </section>

          <section className="service-layout" style={styles.layout}>
            <main style={styles.mainPanel}>
              <section style={styles.block}>
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
                          ...(selected
                            ? {
                                borderColor: option.accent,
                                boxShadow: `0 22px 45px ${option.accent}24`,
                              }
                            : {}),
                        }}
                      >
                        <div
                          style={{
                            ...styles.serviceVisual,
                            background: option.gradient,
                          }}
                        >
                          <span style={styles.serviceIcon}>{option.icon}</span>

                          <span
                            style={{
                              ...styles.serviceBadge,
                              color: option.accent,
                            }}
                          >
                            {selected ? "Selected" : option.badge}
                          </span>
                        </div>

                        <div style={styles.serviceBody}>
                          <div style={styles.cardTitleRow}>
                            <div>
                              <h3 style={styles.cardTitle}>{option.title}</h3>
                              <p style={styles.cardText}>{option.subtitle}</p>
                            </div>

                            <span
                              style={{
                                ...styles.checkCircle,
                                ...(selected
                                  ? {
                                      background: option.accent,
                                      borderColor: option.accent,
                                      color: "#ffffff",
                                    }
                                  : {}),
                              }}
                            >
                              {selected ? "✓" : ""}
                            </span>
                          </div>

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
              </section>
            </main>

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

              <div style={styles.nextCard}>
                <span style={styles.nextBadge}>Next step</span>

                <h3 style={styles.nextTitle}>Quality & Location Filters</h3>

                <p style={styles.nextText}>
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
              onClick={() => nav("/recommendations")}
              style={styles.backButton}
            >
              ← Back
            </button>

            <button type="button" onClick={continueNext} style={styles.nextButton}>
              Continue to Quality & Location →
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
    color: "#14213d",
    background:
      "linear-gradient(135deg, #fff7ed 0%, #eef6ff 40%, #f5f3ff 72%, #ecfeff 100%)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.12)",
  },
  glowOne: {
    position: "absolute",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background: "rgba(255, 214, 165, 0.55)",
    filter: "blur(68px)",
    top: "-110px",
    left: "-90px",
    pointerEvents: "none",
  },
  glowTwo: {
    position: "absolute",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background: "rgba(191, 219, 254, 0.72)",
    filter: "blur(72px)",
    right: "-120px",
    top: "60px",
    pointerEvents: "none",
  },
  glowThree: {
    position: "absolute",
    width: "340px",
    height: "340px",
    borderRadius: "50%",
    background: "rgba(221, 214, 254, 0.72)",
    filter: "blur(74px)",
    bottom: "-140px",
    left: "34%",
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
    padding: "9px 13px",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(109, 93, 252, 0.16)",
    color: "#4f46e5",
    fontSize: "13px",
    fontWeight: 900,
    marginBottom: "16px",
    boxShadow: "0 10px 24px rgba(79, 70, 229, 0.08)",
  },
  stepDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#6d5dfc",
    boxShadow: "0 0 18px rgba(109, 93, 252, 0.7)",
    animation: "serviceSoftPulse 2s ease-in-out infinite",
  },
  title: {
    margin: 0,
    color: "#111827",
    fontSize: "50px",
    lineHeight: 1.04,
    letterSpacing: "-1.6px",
  },
  subtitle: {
    maxWidth: "760px",
    margin: "14px 0 0",
    color: "#475569",
    lineHeight: 1.7,
    fontSize: "16px",
    fontWeight: 600,
  },
  previewCard: {
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "28px",
    padding: "20px",
    background: "rgba(255,255,255,0.76)",
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.10)",
    backdropFilter: "blur(18px)",
  },
  previewTop: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  previewIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "22px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #ffffff, #eef2ff)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    fontSize: "30px",
    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.10)",
    animation: "serviceSoftFloat 3.2s ease-in-out infinite",
  },
  previewLabel: {
    margin: "0 0 4px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  previewTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "21px",
  },
  previewText: {
    margin: "14px 0",
    color: "#475569",
    lineHeight: 1.55,
    fontSize: "14px",
    fontWeight: 600,
  },
  previewTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  previewTag: {
    padding: "7px 10px",
    borderRadius: "999px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 900,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 350px",
    gap: "18px",
    alignItems: "start",
  },
  mainPanel: {
    display: "grid",
    gap: "18px",
  },
  block: {
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "30px",
    padding: "22px",
    background: "rgba(255,255,255,0.76)",
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.09)",
  },
  blockHeader: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "18px",
  },
  blockIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "17px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #ede9fe, #cffafe)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    fontSize: "22px",
    flex: "0 0 auto",
  },
  blockTitle: {
    margin: "0 0 6px",
    color: "#111827",
    fontSize: "25px",
  },
  blockText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
    fontWeight: 600,
  },
  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },
  serviceCard: {
    border: "2px solid rgba(148, 163, 184, 0.22)",
    borderRadius: "26px",
    overflow: "hidden",
    padding: 0,
    background: "rgba(255,255,255,0.86)",
    color: "#111827",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.07)",
  },
  serviceVisual: {
    height: "106px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px",
  },
  serviceIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "23px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.68)",
    border: "1px solid rgba(255,255,255,0.72)",
    fontSize: "33px",
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.08)",
  },
  serviceBadge: {
    padding: "8px 11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(255,255,255,0.72)",
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
    color: "#111827",
    fontSize: "20px",
    lineHeight: 1.25,
  },
  cardText: {
    margin: "8px 0 12px",
    color: "#475569",
    lineHeight: 1.48,
    fontSize: "14px",
    fontWeight: 600,
  },
  checkCircle: {
    width: "27px",
    height: "27px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 900,
    flex: "0 0 auto",
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
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontSize: "12px",
    color: "#334155",
    fontWeight: 900,
  },
  pointsList: {
    display: "grid",
    gap: "8px",
  },
  pointItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.45,
    fontWeight: 600,
  },
  pointDot: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "#ecfeff",
    color: "#0891b2",
    fontSize: "10px",
    fontWeight: 900,
    flex: "0 0 auto",
  },
  sidePanel: {
    position: "sticky",
    top: "18px",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "30px",
    padding: "22px",
    background: "rgba(255,255,255,0.78)",
    boxShadow: "0 20px 48px rgba(15, 23, 42, 0.10)",
    backdropFilter: "blur(18px)",
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
    background: "linear-gradient(135deg, #ede9fe, #cffafe)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    fontSize: "28px",
  },
  sideLabel: {
    margin: "0 0 4px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  sideTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "22px",
  },
  summaryList: {
    display: "grid",
    gap: "10px",
  },
  summaryItem: {
    padding: "12px",
    borderRadius: "16px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    display: "grid",
    gap: "4px",
    color: "#111827",
  },
  nextCard: {
    marginTop: "14px",
    padding: "14px",
    borderRadius: "20px",
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
  },
  nextBadge: {
    display: "inline-flex",
    marginBottom: "8px",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#0891b2",
    fontSize: "11px",
    fontWeight: 900,
  },
  nextTitle: {
    margin: "0 0 8px",
    color: "#111827",
    fontSize: "18px",
  },
  nextText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.5,
    fontSize: "13px",
    fontWeight: 700,
  },
  nextPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
    color: "#334155",
    fontWeight: 800,
  },
  errorBox: {
    marginTop: "16px",
    padding: "13px 15px",
    borderRadius: "16px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#be123c",
    fontWeight: 800,
  },
  finalSummary: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    marginTop: "18px",
    padding: "16px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
  },
  finalIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #ede9fe, #cffafe)",
    fontSize: "22px",
    flex: "0 0 auto",
  },
  finalLabel: {
    margin: "0 0 4px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  finalText: {
    color: "#111827",
    fontSize: "16px",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "22px",
  },
  backButton: {
    minWidth: "170px",
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "14px 22px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.08)",
  },
  nextButton: {
    minWidth: "280px",
    border: "0",
    borderRadius: "999px",
    padding: "14px 24px",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 16px 34px rgba(79, 70, 229, 0.28)",
  },
};
