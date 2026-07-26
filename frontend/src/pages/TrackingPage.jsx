import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const ORDER_STEPS = [
  {
    value: "Accepted",
    title: "Order Accepted",
    subtitle: "Your expert has received the Fit Card.",
    icon: "✅",
    description:
      "The selected expert can now review outfit details, profile, delivery mode, and notes.",
    gradient: "linear-gradient(135deg, #dcfce7, #cffafe, #e0e7ff)",
    accent: "#059669",
  },
  {
    value: "In Progress",
    title: "In Progress",
    subtitle: "Expert is reviewing fit and service details.",
    icon: "🧾",
    description:
      "Measurements, outfit choice, fabric preference, and delivery details are being checked.",
    gradient: "linear-gradient(135deg, #dbeafe, #e0e7ff, #ede9fe)",
    accent: "#4f46e5",
  },
  {
    value: "Stitching",
    title: "Stitching",
    subtitle: "Your outfit work has started.",
    icon: "🧵",
    description:
      "The tailor, designer, boutique, or stylist is working on the outfit or fit adjustment.",
    gradient: "linear-gradient(135deg, #fce7f3, #ffe4e6, #fed7aa)",
    accent: "#db2777",
  },
  {
    value: "Ready",
    title: "Ready",
    subtitle: "Your outfit is ready for final handoff.",
    icon: "👗",
    description:
      "The expert has completed the outfit or service and it is ready for delivery or pickup.",
    gradient: "linear-gradient(135deg, #fef3c7, #ffedd5, #ffe4e6)",
    accent: "#f97316",
  },
  {
    value: "Shipped / Ready for Pickup",
    title: "Shipped / Ready for Pickup",
    subtitle: "Final delivery or pickup stage.",
    icon: "📦",
    description:
      "Your outfit is shipped, out for delivery, or ready to be picked up from the expert.",
    gradient: "linear-gradient(135deg, #ecfccb, #dcfce7, #cffafe)",
    accent: "#65a30d",
  },
];

function getCurrentStatus(state) {
  return state.order?.status || state.trackingStatus || "Accepted";
}

function getStatusIndex(status) {
  const index = ORDER_STEPS.findIndex((step) => step.value === status);
  return index >= 0 ? index : 0;
}

function getProgressPercent(status) {
  const index = getStatusIndex(status);
  return Math.round(((index + 1) / ORDER_STEPS.length) * 100);
}

function getSelectedOutfit(state) {
  return state.recommendations?.selectedOutfit || state.selectedOutfit || {};
}

function getSelectedExpert(state) {
  return state.selectedExpert || state.marketplace?.selectedExpert || {};
}

function getDeliverySchedule(state) {
  return state.deliverySchedule || state.schedule || state.delivery?.schedule || "";
}

function getDeliveryMode(state) {
  return state.deliveryMode || state.delivery?.mode || "";
}

function getOrderId(state) {
  return (
    state.order?.bookingId ||
    state.order?.orderId ||
    state.fitCard?.fitCardId ||
    "ORD-PREVIEW"
  );
}

function buildTimeline(status) {
  const currentIndex = getStatusIndex(status);

  return ORDER_STEPS.map((step, index) => ({
    status: step.value,
    title: step.title,
    completed: index <= currentIndex,
    active: index === currentIndex,
  }));
}

export default function TrackingPage() {
  const nav = useNavigate();
  const state = useFlowStore();
  const { patch } = state;

  const selectedOutfit = getSelectedOutfit(state);
  const selectedExpert = getSelectedExpert(state);
  const deliveryMode = getDeliveryMode(state);
  const deliverySchedule = getDeliverySchedule(state);
  const orderId = getOrderId(state);

  const currentStatus = getCurrentStatus(state);
  const currentIndex = getStatusIndex(currentStatus);
  const currentStep = ORDER_STEPS[currentIndex] || ORDER_STEPS[0];
  const progressPercent = getProgressPercent(currentStatus);

  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  const nextStep = useMemo(() => {
    return ORDER_STEPS[currentIndex + 1] || null;
  }, [currentIndex]);

  function updateStatus(nextStatus) {
    setError("");
    setStatusMessage(`${nextStatus} status saved.`);

    patch({
      trackingStatus: nextStatus,
      order: {
        ...(state.order || {}),
        bookingId: orderId,
        orderId,
        status: nextStatus,
        timeline: buildTimeline(nextStatus),
        updatedAt: new Date().toISOString(),
      },
    });
  }

  function moveToNextStatus() {
    if (!nextStep) {
      setStatusMessage("Order is already at the final delivery stage.");
      return;
    }

    updateStatus(nextStep.value);
  }

  function markAsDelivered() {
    updateStatus("Shipped / Ready for Pickup");

    patch({
      order: {
        ...(state.order || {}),
        bookingId: orderId,
        orderId,
        status: "Shipped / Ready for Pickup",
        timeline: buildTimeline("Shipped / Ready for Pickup"),
        deliveredAt: new Date().toISOString(),
      },
    });

    nav("/feedback");
  }

  function goToFeedback() {
    if (currentStatus !== "Shipped / Ready for Pickup") {
      setError("Please mark the outfit as shipped or ready for pickup before feedback.");
      return;
    }

    nav("/feedback");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes trackingSoftFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes trackingSoftPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 1080px) {
            .tracking-header {
              grid-template-columns: 1fr !important;
            }

            .tracking-title {
              font-size: 38px !important;
            }

            .tracking-layout {
              grid-template-columns: 1fr !important;
            }

            .tracking-status-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .tracking-footer {
              flex-direction: column !important;
            }

            .tracking-footer button {
              width: 100% !important;
            }
          }

          @media (max-width: 650px) {
            .tracking-status-grid,
            .tracking-actions-grid {
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
          <section className="tracking-header" style={styles.header}>
            <div>
              <div style={styles.stepPill}>
                <span style={styles.stepDot} />
                Step 11 of 12 · Order Tracking
              </div>

              <h1 className="tracking-title" style={styles.title}>
                Track your outfit journey.
              </h1>

              <p style={styles.subtitle}>
                Follow the complete order journey from Fit Card handoff to
                expert acceptance, stitching, readiness, shipping, pickup, and
                final feedback.
              </p>
            </div>

            <aside style={styles.previewCard}>
              <div style={styles.previewTop}>
                <span style={styles.previewIcon}>{currentStep.icon}</span>

                <div>
                  <p style={styles.previewLabel}>Current status</p>
                  <h2 style={styles.previewTitle}>{currentStep.title}</h2>
                </div>
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${progressPercent}%`,
                  }}
                />
              </div>

              <p style={styles.previewText}>
                {progressPercent}% complete · {currentStep.subtitle}
              </p>

              <div style={styles.previewTags}>
                <span style={styles.previewTag}>{orderId}</span>
                <span style={styles.previewTag}>{deliveryMode || "Delivery mode"}</span>
              </div>
            </aside>
          </section>

          <section className="tracking-layout" style={styles.layout}>
            <main style={styles.mainPanel}>
              <section style={styles.heroCard}>
                <div>
                  <p style={styles.heroLabel}>Live order status</p>
                  <h2 style={styles.heroTitle}>{currentStep.title}</h2>
                  <p style={styles.heroText}>{currentStep.description}</p>
                </div>

                <div style={styles.statusBubble}>
                  <strong>{progressPercent}%</strong>
                  <span>Journey progress</span>
                </div>
              </section>

              <section style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>🛤️</span>

                  <div>
                    <h2 style={styles.blockTitle}>Order Timeline</h2>
                    <p style={styles.blockText}>
                      Each stage shows where your outfit is in the FitGenie
                      service journey.
                    </p>
                  </div>
                </div>

                <div style={styles.timeline}>
                  {ORDER_STEPS.map((step, index) => {
                    const completed = index <= currentIndex;
                    const active = index === currentIndex;

                    return (
                      <motion.div
                        key={step.value}
                        whileHover={{ y: -4 }}
                        style={{
                          ...styles.timelineItem,
                          ...(active
                            ? {
                                borderColor: step.accent,
                                boxShadow: `0 18px 36px ${step.accent}22`,
                              }
                            : {}),
                        }}
                      >
                        <div
                          style={{
                            ...styles.timelineVisual,
                            background: step.gradient,
                          }}
                        >
                          <span style={styles.timelineIcon}>{step.icon}</span>

                          <span
                            style={{
                              ...styles.timelineBadge,
                              color: step.accent,
                            }}
                          >
                            {completed ? "Done" : "Pending"}
                          </span>
                        </div>

                        <div style={styles.timelineBody}>
                          <div style={styles.timelineTitleRow}>
                            <div>
                              <h3 style={styles.timelineTitle}>{step.title}</h3>
                              <p style={styles.timelineText}>{step.subtitle}</p>
                            </div>

                            <span
                              style={{
                                ...styles.checkCircle,
                                ...(completed
                                  ? {
                                      background: step.accent,
                                      borderColor: step.accent,
                                      color: "#ffffff",
                                    }
                                  : {}),
                              }}
                            >
                              {completed ? "✓" : ""}
                            </span>
                          </div>

                          <p style={styles.timelineDescription}>
                            {step.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              <section style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>⚙️</span>

                  <div>
                    <h2 style={styles.blockTitle}>Update Status</h2>
                    <p style={styles.blockText}>
                      Demo controls for moving the order through the tracking
                      timeline.
                    </p>
                  </div>
                </div>

                <div className="tracking-status-grid" style={styles.statusGrid}>
                  {ORDER_STEPS.map((step) => {
                    const selected = currentStatus === step.value;

                    return (
                      <motion.button
                        key={step.value}
                        type="button"
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateStatus(step.value)}
                        style={{
                          ...styles.statusButton,
                          ...(selected
                            ? {
                                borderColor: step.accent,
                                background: "#ffffff",
                                boxShadow: `0 14px 30px ${step.accent}20`,
                              }
                            : {}),
                        }}
                      >
                        <span>{step.icon}</span>
                        <strong>{step.value}</strong>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="tracking-actions-grid" style={styles.quickActions}>
                  <button
                    type="button"
                    onClick={moveToNextStatus}
                    style={styles.secondaryButton}
                  >
                    Move to Next Status
                  </button>

                  <button
                    type="button"
                    onClick={markAsDelivered}
                    style={styles.primaryButton}
                  >
                    Delivery Confirmed
                  </button>
                </div>
              </section>

              <section style={styles.messageGrid}>
                <div style={styles.messageCard}>
                  <span style={styles.messageIcon}>📲</span>

                  <div>
                    <h3 style={styles.messageTitle}>User notification</h3>
                    <p style={styles.messageText}>
                      Your order is currently at “{currentStep.value}”. FitGenie
                      will keep your delivery and pickup details ready.
                    </p>
                  </div>
                </div>

                <div style={styles.messageCard}>
                  <span style={styles.messageIcon}>🧵</span>

                  <div>
                    <h3 style={styles.messageTitle}>Expert update</h3>
                    <p style={styles.messageText}>
                      The expert can use this status to coordinate stitching,
                      readiness, shipping, pickup, or delivery confirmation.
                    </p>
                  </div>
                </div>
              </section>
            </main>

            <aside style={styles.sidePanel}>
              <div style={styles.sideTop}>
                <span style={styles.sideIcon}>{currentStep.icon}</span>

                <div>
                  <p style={styles.sideLabel}>Order summary</p>
                  <h2 style={styles.sideTitle}>{currentStatus}</h2>
                </div>
              </div>

              <div style={styles.summaryList}>
                <div style={styles.summaryItem}>
                  <span>Order ID</span>
                  <strong>{orderId}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Selected Outfit</span>
                  <strong>
                    {selectedOutfit?.title ||
                      selectedOutfit?.name ||
                      "From recommendations"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Selected Expert</span>
                  <strong>{selectedExpert?.name || "From expert step"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Expert Contact</span>
                  <strong>{selectedExpert?.phone || "Available after selection"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Shop Address</span>
                  <strong>{selectedExpert?.address || "Address pending"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Delivery Mode</span>
                  <strong>{deliveryMode || "From delivery step"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Schedule</span>
                  <strong>{deliverySchedule || "Schedule pending"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Current Stage</span>
                  <strong>{currentStep.title}</strong>
                </div>
              </div>

              {statusMessage ? (
                <div style={styles.successBox}>{statusMessage}</div>
              ) : null}

              <div style={styles.nextCard}>
                <span style={styles.nextBadge}>Final step</span>

                <h3 style={styles.nextTitle}>Delivery + Feedback</h3>

                <p style={styles.nextText}>
                  Once delivery is confirmed or pickup is ready, collect ratings
                  for fit accuracy, service quality, and delivery experience.
                </p>

                <div style={styles.nextPills}>
                  <span>⭐ Fit</span>
                  <span>🧵 Service</span>
                  <span>📦 Delivery</span>
                </div>
              </div>
            </aside>
          </section>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <section style={styles.finalSummary}>
            <div style={styles.finalIcon}>{currentStep.icon}</div>

            <div>
              <p style={styles.finalLabel}>Tracking status</p>
              <strong style={styles.finalText}>
                {currentStep.title} · {progressPercent}% complete
              </strong>
            </div>
          </section>

          <div className="tracking-footer" style={styles.footer}>
            <button
              type="button"
              onClick={() => nav("/fit-card")}
              style={styles.backButton}
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={goToFeedback}
              style={styles.secondaryButton}
            >
              Delivery & Feedback
            </button>

            <button
              type="button"
              onClick={markAsDelivered}
              style={styles.nextButton}
            >
              Continue to Feedback →
            </button>
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 110px)",
    display: "grid",
    placeItems: "center",
    padding: "28px",
    borderRadius: "34px",

    backgroundImage: "url('/rainbow-cloud-bg.png?v=4')",
    backgroundSize: "cover",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    backgroundColor: "#ffffff",
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
    animation: "trackingSoftPulse 2s ease-in-out infinite",
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
    animation: "trackingSoftFloat 3.2s ease-in-out infinite",
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
  progressTrack: {
    height: "11px",
    borderRadius: "999px",
    background: "#e2e8f0",
    overflow: "hidden",
    margin: "14px 0",
  },
  progressFill: {
    height: "100%",
    borderRadius: "inherit",
    background: "linear-gradient(90deg, #6d5dfc, #00bcd4)",
  },
  previewText: {
    margin: "0 0 14px",
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
  heroCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "30px",
    padding: "24px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.88), rgba(236,254,255,0.86))",
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.09)",
  },
  heroLabel: {
    margin: "0 0 6px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  heroTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "32px",
  },
  heroText: {
    maxWidth: "680px",
    margin: "8px 0 0",
    color: "#475569",
    fontWeight: 700,
    lineHeight: 1.6,
  },
  statusBubble: {
    width: "138px",
    height: "138px",
    borderRadius: "34px",
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    padding: "14px",
    background: "linear-gradient(135deg, #ede9fe, #cffafe)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    color: "#111827",
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
  timeline: {
    display: "grid",
    gap: "14px",
  },
  timelineItem: {
    border: "2px solid rgba(148, 163, 184, 0.22)",
    borderRadius: "26px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.86)",
    color: "#111827",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.07)",
  },
  timelineVisual: {
    height: "92px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px",
  },
  timelineIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "22px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.68)",
    border: "1px solid rgba(255,255,255,0.72)",
    fontSize: "31px",
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.08)",
  },
  timelineBadge: {
    padding: "8px 11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(255,255,255,0.72)",
    fontSize: "12px",
    fontWeight: 900,
  },
  timelineBody: {
    padding: "16px",
  },
  timelineTitleRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  },
  timelineTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "20px",
  },
  timelineText: {
    margin: "6px 0 0",
    color: "#64748b",
    fontWeight: 800,
    fontSize: "13px",
  },
  timelineDescription: {
    margin: "11px 0 0",
    color: "#475569",
    lineHeight: 1.5,
    fontWeight: 600,
  },
  checkCircle: {
    width: "28px",
    height: "28px",
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
  statusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "10px",
  },
  statusButton: {
    minHeight: "74px",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "12px",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    display: "grid",
    gap: "5px",
    placeItems: "center",
    fontWeight: 900,
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.06)",
  },
  quickActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "14px",
  },
  messageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },
  messageCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "13px",
    padding: "16px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
  },
  messageIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #fef3c7, #dbeafe)",
    fontSize: "21px",
    flex: "0 0 auto",
  },
  messageTitle: {
    margin: "0 0 7px",
    color: "#111827",
    fontSize: "17px",
  },
  messageText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.55,
    fontSize: "13px",
    fontWeight: 700,
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
  successBox: {
    marginTop: "14px",
    padding: "13px",
    borderRadius: "17px",
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
    color: "#0891b2",
    fontWeight: 800,
    lineHeight: 1.5,
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
    flexWrap: "wrap",
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
  secondaryButton: {
    minWidth: "220px",
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "14px 22px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.08)",
  },
  primaryButton: {
    border: 0,
    borderRadius: "999px",
    padding: "14px 22px",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 16px 34px rgba(79, 70, 229, 0.25)",
  },
  nextButton: {
    minWidth: "230px",
    border: "1px solid rgba(255,255,255,0.72)",
    borderRadius: "999px",
    padding: "14px 24px",
    background: "linear-gradient(135deg, #ff7a59 0%, #facc15 52%, #fff7ad 100%)",
    color: "#111827",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 18px 45px rgba(255,122,89,0.34), 0 8px 24px rgba(250,204,21,0.24)",
  },
};
