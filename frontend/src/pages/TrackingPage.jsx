import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const ORDER_STEPS = [
  {
    key: "Accepted",
    title: "Accepted",
    subtitle: "Your Fit Card and order request have been received.",
    icon: "✅",
    customerMessage: "Your request has been accepted.",
    expertMessage: "Expert has received your Fit Card and order details.",
  },
  {
    key: "In Progress",
    title: "In Progress",
    subtitle: "The expert is reviewing your size, style, and service details.",
    icon: "🧾",
    customerMessage: "Your expert is reviewing the fit details.",
    expertMessage: "Expert is checking the measurements and preferences.",
  },
  {
    key: "Stitching",
    title: "Stitching",
    subtitle: "Your outfit is being stitched, altered, or prepared.",
    icon: "🧵",
    customerMessage: "Your outfit work is currently in progress.",
    expertMessage: "Stitching or alteration stage is active.",
  },
  {
    key: "Ready",
    title: "Ready",
    subtitle: "Your outfit is ready for final delivery or pickup.",
    icon: "🎉",
    customerMessage: "Your outfit is ready.",
    expertMessage: "Expert has marked the outfit as ready.",
  },
  {
    key: "Shipped / Ready for Pickup",
    title: "Shipped / Ready for Pickup",
    subtitle: "Your outfit has been shipped or is ready for pickup.",
    icon: "📦",
    customerMessage: "Your outfit is shipped or ready for pickup.",
    expertMessage: "Final handoff stage has started.",
  },
];

function getCurrentStatus(state) {
  return (
    state.order?.status ||
    state.trackingStatus ||
    "Accepted"
  );
}

function getStatusIndex(status) {
  const foundIndex = ORDER_STEPS.findIndex((step) => step.key === status);
  return foundIndex >= 0 ? foundIndex : 0;
}

function getProgressPercent(status) {
  const index = getStatusIndex(status);
  return Math.round((index / (ORDER_STEPS.length - 1)) * 100);
}

function getSafeValue(value, fallback = "Not available") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return value;
}

function getSelectedOutfit(state) {
  return state.recommendations?.selectedOutfit || state.selectedOutfit || null;
}

function getSelectedExpert(state) {
  return state.selectedExpert || state.marketplace?.selectedExpert || null;
}

function getDeliveryMode(state) {
  return state.deliveryMode || state.delivery?.mode || "Not selected";
}

function getDeliverySchedule(state) {
  return (
    state.deliverySchedule ||
    state.schedule ||
    state.delivery?.schedule ||
    "Not selected"
  );
}

function getOrderId(state) {
  return (
    state.order?.bookingId ||
    state.order?.orderId ||
    state.bookingId ||
    `ORD-${Date.now()}`
  );
}

function buildTimeline(status) {
  const currentIndex = getStatusIndex(status);

  return ORDER_STEPS.map((step, index) => ({
    ...step,
    completed: index <= currentIndex,
    active: index === currentIndex,
    timestamp:
      index <= currentIndex
        ? new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
  }));
}

export default function TrackingPage() {
  const nav = useNavigate();
  const state = useFlowStore();
  const { patch } = state;

  const selectedOutfit = getSelectedOutfit(state);
  const selectedExpert = getSelectedExpert(state);

  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const currentStatus = getCurrentStatus(state);
  const currentIndex = getStatusIndex(currentStatus);
  const currentStep = ORDER_STEPS[currentIndex];
  const progressPercent = getProgressPercent(currentStatus);
  const timeline = useMemo(
    () => buildTimeline(currentStatus),
    [currentStatus]
  );

  const orderId = getOrderId(state);
  const deliveryMode = getDeliveryMode(state);
  const deliverySchedule = getDeliverySchedule(state);

  function updateStatus(nextStatus) {
    setError("");
    setStatusMessage("");

    const nextOrder = {
      ...(state.order || {}),
      bookingId: orderId,
      orderId,
      status: nextStatus,
      timeline: buildTimeline(nextStatus),
      updatedAt: new Date().toISOString(),
    };

    patch({
      trackingStatus: nextStatus,
      order: nextOrder,
    });

    setStatusMessage(`Order status updated to "${nextStatus}".`);
  }

  function moveToNextStatus() {
    const nextIndex = Math.min(currentIndex + 1, ORDER_STEPS.length - 1);
    updateStatus(ORDER_STEPS[nextIndex].key);
  }

  function markAsDelivered() {
    const finalStatus = "Shipped / Ready for Pickup";

    patch({
      trackingStatus: finalStatus,
      order: {
        ...(state.order || {}),
        bookingId: orderId,
        orderId,
        status: finalStatus,
        timeline: buildTimeline(finalStatus),
        deliveredAt: new Date().toISOString(),
      },
    });

    nav("/feedback");
  }

  function goToFeedback() {
    if (currentStatus !== "Shipped / Ready for Pickup") {
      setError(
        "Please mark the order as shipped or ready for pickup before giving feedback."
      );
      return;
    }

    nav("/feedback");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes trackingFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes trackingPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 1080px) {
            .tracking-header {
              grid-template-columns: 1fr !important;
            }

            .tracking-title {
              font-size: 36px !important;
            }

            .tracking-layout {
              grid-template-columns: 1fr !important;
            }

            .tracking-status-grid {
              grid-template-columns: 1fr !important;
            }

            .tracking-footer {
              flex-direction: column !important;
            }

            .tracking-footer button {
              width: 100% !important;
            }
          }

          @media (max-width: 720px) {
            .tracking-timeline-item {
              grid-template-columns: 48px minmax(0, 1fr) !important;
            }

            .tracking-timeline-meta {
              grid-column: 2 !important;
              text-align: left !important;
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
          <section className="tracking-header" style={styles.header}>
            <div>
              <div style={styles.stepPill}>
                <span style={styles.stepDot} />
                Step 11 of 12 · Order Tracking Timeline
              </div>

              <h1 className="tracking-title" style={styles.title}>
                Track your outfit journey.
              </h1>

              <p style={styles.subtitle}>
                Follow each order stage from accepted to stitching, ready, and
                final shipped or pickup status. The user and expert can both see
                the latest stage.
              </p>
            </div>

            <aside style={styles.previewCard}>
              <div style={styles.previewIcon}>{currentStep.icon}</div>

              <div>
                <p style={styles.previewLabel}>Current order status</p>
                <h2 style={styles.previewTitle}>{currentStep.title}</h2>
                <p style={styles.previewText}>{currentStep.customerMessage}</p>
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${progressPercent}%`,
                  }}
                />
              </div>

              <div style={styles.previewChips}>
                <span style={styles.previewChip}>{progressPercent}% complete</span>
                <span style={styles.previewChip}>{orderId}</span>
              </div>
            </aside>
          </section>

          <section className="tracking-layout" style={styles.layout}>
            <main style={styles.mainPanel}>
              <section style={styles.heroStatusCard}>
                <div style={styles.heroStatusTop}>
                  <div>
                    <p style={styles.heroLabel}>Live order status</p>
                    <h2 style={styles.heroTitle}>{currentStep.title}</h2>
                    <p style={styles.heroText}>{currentStep.subtitle}</p>
                  </div>

                  <div style={styles.heroIcon}>{currentStep.icon}</div>
                </div>

                <div style={styles.largeProgressTrack}>
                  <div
                    style={{
                      ...styles.largeProgressFill,
                      width: `${progressPercent}%`,
                    }}
                  />
                </div>

                <div style={styles.progressMeta}>
                  <span>Accepted</span>
                  <strong>{progressPercent}% complete</strong>
                  <span>Final handoff</span>
                </div>
              </section>

              <section style={styles.timelineCard}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>🗓️</span>

                  <div>
                    <h2 style={styles.blockTitle}>Order Timeline</h2>
                    <p style={styles.blockText}>
                      This timeline gives regular delivery updates to the user.
                    </p>
                  </div>
                </div>

                <div style={styles.timelineList}>
                  {timeline.map((step, index) => (
                    <motion.div
                      key={step.key}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="tracking-timeline-item"
                      style={{
                        ...styles.timelineItem,
                        ...(step.active ? styles.timelineItemActive : {}),
                      }}
                    >
                      <div
                        style={{
                          ...styles.timelineIcon,
                          ...(step.completed ? styles.timelineIconDone : {}),
                          ...(step.active ? styles.timelineIconActive : {}),
                        }}
                      >
                        {step.completed ? "✓" : index + 1}
                      </div>

                      <div>
                        <h3 style={styles.timelineTitle}>
                          {step.icon} {step.title}
                        </h3>

                        <p style={styles.timelineText}>{step.subtitle}</p>

                        <div style={styles.timelineMessages}>
                          <span>{step.customerMessage}</span>
                          <span>{step.expertMessage}</span>
                        </div>
                      </div>

                      <div
                        className="tracking-timeline-meta"
                        style={styles.timelineMeta}
                      >
                        <span
                          style={{
                            ...styles.statusPill,
                            ...(step.completed ? styles.statusPillDone : {}),
                            ...(step.active ? styles.statusPillActive : {}),
                          }}
                        >
                          {step.active
                            ? "Current"
                            : step.completed
                            ? "Done"
                            : "Pending"}
                        </span>

                        {step.timestamp ? (
                          <small style={styles.timestamp}>{step.timestamp}</small>
                        ) : null}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section style={styles.timelineCard}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>⚙️</span>

                  <div>
                    <h2 style={styles.blockTitle}>Update Status</h2>
                    <p style={styles.blockText}>
                      Demo control for moving the order through the tracking
                      stages. Later this can be controlled by the expert dashboard.
                    </p>
                  </div>
                </div>

                <div className="tracking-status-grid" style={styles.statusGrid}>
                  {ORDER_STEPS.map((step) => {
                    const selected = currentStatus === step.key;

                    return (
                      <motion.button
                        key={step.key}
                        type="button"
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateStatus(step.key)}
                        style={{
                          ...styles.statusButton,
                          ...(selected ? styles.statusButtonSelected : {}),
                        }}
                      >
                        <span style={styles.statusIcon}>{step.icon}</span>

                        <span style={styles.statusCopy}>
                          <strong>{step.title}</strong>
                          <small>{step.subtitle}</small>
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                <div style={styles.quickActions}>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={moveToNextStatus}
                    disabled={currentIndex === ORDER_STEPS.length - 1}
                    style={styles.quickButton}
                  >
                    Move to Next Stage
                  </button>

                  <button
                    type="button"
                    className="btn"
                    onClick={markAsDelivered}
                    style={styles.quickButton}
                  >
                    Mark Shipped / Ready
                  </button>
                </div>
              </section>
            </main>

            <aside style={styles.sidePanel}>
              <div style={styles.sideTop}>
                <span style={styles.sideIcon}>📦</span>

                <div>
                  <p style={styles.sideLabel}>Order summary</p>
                  <h2 style={styles.sideTitle}>{orderId}</h2>
                </div>
              </div>

              <div style={styles.summaryList}>
                <div style={styles.summaryItem}>
                  <span>Current Status</span>
                  <strong>{currentStatus}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Selected Outfit</span>
                  <strong>
                    {getSafeValue(
                      selectedOutfit?.title || selectedOutfit?.name,
                      "Selected outfit"
                    )}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Recommended Size</span>
                  <strong>
                    {getSafeValue(
                      selectedOutfit?.recommendedSize || state.size,
                      "Not available"
                    )}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Expert</span>
                  <strong>{getSafeValue(selectedExpert?.name)}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Expert Mobile</span>
                  <strong>{getSafeValue(selectedExpert?.phone)}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Shop Address</span>
                  <strong>
                    {getSafeValue(
                      selectedExpert?.address || selectedExpert?.location
                    )}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Delivery Mode</span>
                  <strong>{deliveryMode}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Schedule</span>
                  <strong>{deliverySchedule}</strong>
                </div>
              </div>

              <div style={styles.notificationCard}>
                <span style={styles.notificationBadge}>User notification</span>

                <h3 style={styles.notificationTitle}>
                  {currentStep.customerMessage}
                </h3>

                <p style={styles.notificationText}>
                  FitGenie will show this update to the user dashboard and order
                  tracking screen.
                </p>
              </div>

              <div style={styles.notificationCard}>
                <span style={styles.notificationBadge}>Expert update</span>

                <h3 style={styles.notificationTitle}>
                  {currentStep.expertMessage}
                </h3>

                <p style={styles.notificationText}>
                  Expert-side updates can later be synced from a dashboard or
                  backend order API.
                </p>
              </div>
            </aside>
          </section>

          {error ? <div style={styles.errorBox}>{error}</div> : null}
          {statusMessage ? (
            <div style={styles.successBox}>{statusMessage}</div>
          ) : null}

          <section style={styles.finalSummary}>
            <div style={styles.finalIcon}>{currentStep.icon}</div>

            <div>
              <p style={styles.finalLabel}>Delivery update summary</p>
              <strong style={styles.finalText}>
                {orderId} · {currentStatus} · {progressPercent}% complete
              </strong>
            </div>
          </section>

          <div className="tracking-footer" style={styles.footer}>
            <button
              type="button"
              className="btn ghost"
              onClick={() => nav("/fit-card")}
              style={styles.footerButton}
            >
              Back
            </button>

            <button
              type="button"
              className="btn ghost"
              onClick={goToFeedback}
              style={styles.footerButton}
            >
              Delivery Confirmed
            </button>

            <button
              type="button"
              className="btn"
              onClick={markAsDelivered}
              style={styles.footerButton}
            >
              Continue to Feedback
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
    animation: "trackingPulse 2s ease-in-out infinite",
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
    animation: "trackingFloat 3.2s ease-in-out infinite",
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
  previewChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "14px",
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
  progressTrack: {
    height: "11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    overflow: "hidden",
    marginTop: "14px",
  },
  progressFill: {
    height: "100%",
    borderRadius: "inherit",
    background: "linear-gradient(90deg,#7c5cff,#00d4ff)",
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
  heroStatusCard: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "30px",
    padding: "24px",
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.24), rgba(0,212,255,0.10))",
    boxShadow: "0 22px 52px rgba(0,0,0,0.20)",
  },
  heroStatusTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "18px",
  },
  heroLabel: {
    margin: "0 0 6px",
    color: "rgba(255,255,255,0.62)",
    fontWeight: 900,
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  heroTitle: {
    margin: 0,
    fontSize: "32px",
  },
  heroText: {
    margin: "8px 0 0",
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.5,
  },
  heroIcon: {
    width: "72px",
    height: "72px",
    borderRadius: "26px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    fontSize: "36px",
    flex: "0 0 auto",
  },
  largeProgressTrack: {
    height: "14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    overflow: "hidden",
    marginBottom: "12px",
  },
  largeProgressFill: {
    height: "100%",
    borderRadius: "inherit",
    background: "linear-gradient(90deg,#7c5cff,#00d4ff)",
  },
  progressMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    color: "rgba(255,255,255,0.68)",
    fontSize: "13px",
  },
  timelineCard: {
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
  timelineList: {
    display: "grid",
    gap: "12px",
  },
  timelineItem: {
    display: "grid",
    gridTemplateColumns: "52px minmax(0, 1fr) 130px",
    gap: "14px",
    alignItems: "start",
    padding: "15px",
    borderRadius: "22px",
    background: "rgba(0,0,0,0.16)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  timelineItemActive: {
    border: "1px solid rgba(0,212,255,0.45)",
    background: "rgba(0,212,255,0.09)",
    boxShadow: "0 14px 30px rgba(0,212,255,0.08)",
  },
  timelineIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontWeight: 900,
  },
  timelineIconDone: {
    background: "rgba(0,212,255,0.15)",
    borderColor: "rgba(0,212,255,0.36)",
    color: "#d9fbff",
  },
  timelineIconActive: {
    background: "#00d4ff",
    borderColor: "#00d4ff",
    color: "#061224",
    boxShadow: "0 0 22px rgba(0,212,255,0.45)",
  },
  timelineTitle: {
    margin: "0 0 6px",
    fontSize: "18px",
  },
  timelineText: {
    margin: "0 0 10px",
    color: "rgba(255,255,255,0.70)",
    lineHeight: 1.45,
    fontSize: "14px",
  },
  timelineMessages: {
    display: "grid",
    gap: "6px",
    color: "rgba(255,255,255,0.58)",
    fontSize: "12px",
  },
  timelineMeta: {
    display: "grid",
    gap: "8px",
    justifyItems: "end",
    textAlign: "right",
  },
  statusPill: {
    padding: "7px 9px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.72)",
    fontSize: "12px",
    fontWeight: 900,
  },
  statusPillDone: {
    background: "rgba(0,212,255,0.12)",
    borderColor: "rgba(0,212,255,0.24)",
    color: "#d9fbff",
  },
  statusPillActive: {
    background: "#00d4ff",
    borderColor: "#00d4ff",
    color: "#061224",
  },
  timestamp: {
    color: "rgba(255,255,255,0.52)",
  },
  statusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },
  statusButton: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "20px",
    padding: "14px",
    background: "rgba(255,255,255,0.07)",
    color: "inherit",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    textAlign: "left",
    cursor: "pointer",
  },
  statusButtonSelected: {
    border: "1px solid rgba(0,212,255,0.85)",
    background: "rgba(0,212,255,0.12)",
    boxShadow: "0 14px 30px rgba(0,212,255,0.10)",
  },
  statusIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.13)",
    fontSize: "23px",
    flex: "0 0 auto",
  },
  statusCopy: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  quickActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "16px",
  },
  quickButton: {
    minWidth: "190px",
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
  notificationCard: {
    marginTop: "14px",
    padding: "14px",
    borderRadius: "20px",
    background: "rgba(0,212,255,0.10)",
    border: "1px solid rgba(0,212,255,0.22)",
  },
  notificationBadge: {
    display: "inline-flex",
    marginBottom: "8px",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.10)",
    color: "#d9fbff",
    fontSize: "11px",
    fontWeight: 900,
  },
  notificationTitle: {
    margin: "0 0 8px",
    fontSize: "17px",
  },
  notificationText: {
    margin: 0,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.5,
    fontSize: "13px",
  },
  errorBox: {
    marginTop: "16px",
    padding: "13px 15px",
    borderRadius: "16px",
    background: "rgba(255, 86, 86, 0.16)",
    border: "1px solid rgba(255, 120, 120, 0.35)",
    color: "#ffdede",
  },
  successBox: {
    marginTop: "16px",
    padding: "13px 15px",
    borderRadius: "16px",
    background: "rgba(0,212,255,0.10)",
    border: "1px solid rgba(0,212,255,0.25)",
    color: "#d9fbff",
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
    flexWrap: "wrap",
  },
  footerButton: {
    minWidth: "210px",
  },
};
