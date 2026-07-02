import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const DELIVERY_OPTIONS = [
  {
    value: "Online",
    title: "Online",
    subtitle: "Virtual consult and order from home.",
    icon: "💻",
    badge: "Remote",
    bestFor: "Virtual consultation, online order, home delivery",
    details: [
      "Chat or call with expert",
      "Share Fit Card digitally",
      "Track delivery updates online",
    ],
    gradient: "linear-gradient(135deg, #dbeafe, #ede9fe, #fce7f3)",
    accent: "#6d5dfc",
  },
  {
    value: "Offline",
    title: "Offline",
    subtitle: "Visit store or meet expert in person.",
    icon: "🏬",
    badge: "In-person",
    bestFor: "Measurements, trials, pickup, physical consultation",
    details: [
      "Visit tailor/designer store",
      "In-person measurement check",
      "Pickup or local delivery support",
    ],
    gradient: "linear-gradient(135deg, #fce7f3, #ffe4e6, #fed7aa)",
    accent: "#db2777",
  },
  {
    value: "Both",
    title: "Both",
    subtitle: "Stay flexible with online and offline options.",
    icon: "🔁",
    badge: "Flexible",
    bestFor: "Open to any consultation or delivery method",
    details: [
      "Best expert availability",
      "Flexible consultation mode",
      "Choose final mode after expert confirmation",
    ],
    gradient: "linear-gradient(135deg, #dcfce7, #cffafe, #e0e7ff)",
    accent: "#059669",
  },
];

const TIME_SLOT_OPTIONS = [
  "Morning · 9 AM - 12 PM",
  "Afternoon · 12 PM - 4 PM",
  "Evening · 4 PM - 8 PM",
];

function getTodayDateString() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60 * 1000);

  return localDate.toISOString().split("T")[0];
}

function parseSchedule(schedule) {
  if (!schedule) {
    return {
      date: "",
      slot: "",
    };
  }

  const parts = String(schedule).split(" · ");

  return {
    date: parts[0] || "",
    slot: parts.slice(1).join(" · ") || "",
  };
}

export default function DeliveryPage() {
  const nav = useNavigate();

  const {
    deliveryMode,
    deliverySchedule,
    schedule,
    chatEnabled,
    selectedExpert,
    recommendations,
    serviceType,
    patch,
  } = useFlowStore();

  const existingSchedule = deliverySchedule || schedule || "";
  const parsedSchedule = parseSchedule(existingSchedule);

  const [selectedDate, setSelectedDate] = useState(
    parsedSchedule.date || getTodayDateString()
  );
  const [selectedSlot, setSelectedSlot] = useState(
    parsedSchedule.slot || "Evening · 4 PM - 8 PM"
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const selectedDelivery = useMemo(
    () => DELIVERY_OPTIONS.find((item) => item.value === deliveryMode),
    [deliveryMode]
  );

  const selectedOutfit = recommendations?.selectedOutfit || null;

  const readinessScore = useMemo(() => {
    let score = 0;

    if (deliveryMode) score += 40;
    if (selectedDate) score += 25;
    if (selectedSlot) score += 25;
    if (chatEnabled) score += 10;

    return score;
  }, [deliveryMode, selectedDate, selectedSlot, chatEnabled]);

  function selectDeliveryMode(value) {
    setError("");

    patch({
      deliveryMode: value,
    });
  }

  function saveSchedule(dateValue, slotValue) {
    const finalDate = dateValue || selectedDate;
    const finalSlot = slotValue || selectedSlot;
    const finalSchedule = `${finalDate} · ${finalSlot}`;

    patch({
      schedule: finalSchedule,
      deliverySchedule: finalSchedule,
    });
  }

  function updateDate(value) {
    setError("");
    setSelectedDate(value);
    saveSchedule(value, selectedSlot);
  }

  function updateSlot(value) {
    setError("");
    setSelectedSlot(value);
    saveSchedule(selectedDate, value);
  }

  function toggleChat() {
    setError("");

    patch({
      chatEnabled: !chatEnabled,
    });
  }

  function continueNext() {
    if (!deliveryMode) {
      setError("Please choose how you want your delivery or consultation.");
      return;
    }

    if (!selectedDate || !selectedSlot) {
      setError("Please choose a preferred date and time slot.");
      return;
    }

    saveSchedule(selectedDate, selectedSlot);

    patch({
      deliveryNotes: notes,
    });

    nav("/fit-card");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes deliverySoftFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes deliverySoftPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 1080px) {
            .delivery-header {
              grid-template-columns: 1fr !important;
            }

            .delivery-title {
              font-size: 38px !important;
            }

            .delivery-layout {
              grid-template-columns: 1fr !important;
            }

            .delivery-grid,
            .delivery-schedule-grid {
              grid-template-columns: 1fr !important;
            }

            .delivery-footer {
              flex-direction: column !important;
            }

            .delivery-footer button {
              width: 100% !important;
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
          <section className="delivery-header" style={styles.header}>
            <div>
              <div style={styles.stepPill}>
                <span style={styles.stepDot} />
                Step 9 of 12 · Delivery & Interaction
              </div>

              <h1 className="delivery-title" style={styles.title}>
                Choose delivery and interaction mode.
              </h1>

              <p style={styles.subtitle}>
                Decide whether you want a virtual consultation, in-person visit,
                or both. Then choose your preferred schedule and chat option.
              </p>
            </div>

            <aside style={styles.previewCard}>
              <div style={styles.previewTop}>
                <span style={styles.previewIcon}>
                  {selectedDelivery?.icon || "📦"}
                </span>

                <div>
                  <p style={styles.previewLabel}>Delivery readiness</p>
                  <h2 style={styles.previewScore}>{readinessScore}%</h2>
                </div>
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${readinessScore}%`,
                  }}
                />
              </div>

              <p style={styles.previewText}>
                {selectedDelivery
                  ? selectedDelivery.bestFor
                  : "Pick a delivery mode to prepare the Fit Card handoff."}
              </p>

              <div style={styles.previewTags}>
                <span style={styles.previewTag}>
                  {selectedDelivery?.title || "Mode pending"}
                </span>
                <span style={styles.previewTag}>
                  {selectedDate || "Date pending"}
                </span>
                <span style={styles.previewTag}>
                  {chatEnabled ? "Chat enabled" : "Chat optional"}
                </span>
              </div>
            </aside>
          </section>

          <section className="delivery-layout" style={styles.layout}>
            <main style={styles.mainPanel}>
              <section style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>🚚</span>

                  <div>
                    <h2 style={styles.blockTitle}>
                      How do you want your delivery?
                    </h2>
                    <p style={styles.blockText}>
                      Choose the way you prefer to interact with the expert and
                      receive the final outfit or service.
                    </p>
                  </div>
                </div>

                <div className="delivery-grid" style={styles.deliveryGrid}>
                  {DELIVERY_OPTIONS.map((option) => {
                    const selected = deliveryMode === option.value;

                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        whileHover={{ y: -6, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectDeliveryMode(option.value)}
                        style={{
                          ...styles.deliveryCard,
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
                            ...styles.deliveryVisual,
                            background: option.gradient,
                          }}
                        >
                          <span style={styles.deliveryIcon}>{option.icon}</span>

                          <span
                            style={{
                              ...styles.deliveryBadge,
                              color: option.accent,
                            }}
                          >
                            {selected ? "Selected" : option.badge}
                          </span>
                        </div>

                        <div style={styles.deliveryBody}>
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

                          <div style={styles.bestForBox}>
                            <span>Best for</span>
                            <strong>{option.bestFor}</strong>
                          </div>

                          <div style={styles.pointsList}>
                            {option.details.map((detail) => (
                              <span key={detail} style={styles.pointItem}>
                                <span style={styles.pointDot}>✓</span>
                                {detail}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              <section style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>🗓️</span>

                  <div>
                    <h2 style={styles.blockTitle}>Calendar Scheduling</h2>
                    <p style={styles.blockText}>
                      Select a preferred date and time slot for consultation,
                      store visit, or order confirmation.
                    </p>
                  </div>
                </div>

                <div className="delivery-schedule-grid" style={styles.scheduleGrid}>
                  <div style={styles.inputBlock}>
                    <label style={styles.inputLabel}>Preferred date</label>

                    <input
                      type="date"
                      value={selectedDate}
                      min={getTodayDateString()}
                      onChange={(event) => updateDate(event.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.inputBlock}>
                    <label style={styles.inputLabel}>Preferred time slot</label>

                    <select
                      value={selectedSlot}
                      onChange={(event) => updateSlot(event.target.value)}
                      style={styles.input}
                    >
                      {TIME_SLOT_OPTIONS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={styles.slotCards}>
                  {TIME_SLOT_OPTIONS.map((slot) => {
                    const selected = selectedSlot === slot;

                    return (
                      <motion.button
                        key={slot}
                        type="button"
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateSlot(slot)}
                        style={{
                          ...styles.slotCard,
                          ...(selected ? styles.slotCardSelected : {}),
                        }}
                      >
                        {slot}
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              <section style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>💬</span>

                  <div>
                    <h2 style={styles.blockTitle}>Chat with expert</h2>
                    <p style={styles.blockText}>
                      Enable chat if you want the expert to confirm measurements,
                      ask questions, and discuss design notes.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleChat}
                  style={{
                    ...styles.chatToggle,
                    ...(chatEnabled ? styles.chatToggleEnabled : {}),
                  }}
                >
                  <span style={styles.chatIcon}>
                    {chatEnabled ? "✅" : "💬"}
                  </span>

                  <span style={styles.chatCopy}>
                    <strong>
                      {chatEnabled
                        ? "Chat is enabled"
                        : "Enable chat with expert"}
                    </strong>
                    <small>
                      {chatEnabled
                        ? "The selected expert can contact the user for fit details."
                        : "Recommended for custom stitching, designer wear, and alterations."}
                    </small>
                  </span>

                  <span
                    style={{
                      ...styles.togglePill,
                      ...(chatEnabled ? styles.togglePillOn : {}),
                    }}
                  >
                    {chatEnabled ? "ON" : "OFF"}
                  </span>
                </button>

                <div style={styles.inputBlock}>
                  <label style={styles.inputLabel}>
                    Additional notes for expert{" "}
                    <span style={styles.optionalText}>(optional)</span>
                  </label>

                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Example: Please confirm sleeve length before stitching. Prefer relaxed fit around shoulders."
                    style={styles.textarea}
                  />
                </div>
              </section>
            </main>

            <aside style={styles.sidePanel}>
              <div style={styles.sideTop}>
                <span style={styles.sideIcon}>🧞</span>

                <div>
                  <p style={styles.sideLabel}>Handoff summary</p>
                  <h2 style={styles.sideTitle}>
                    {selectedDelivery?.title || "Pending"}
                  </h2>
                </div>
              </div>

              <div style={styles.summaryList}>
                <div style={styles.summaryItem}>
                  <span>Selected Expert</span>
                  <strong>{selectedExpert?.name || "From previous step"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Expert Contact</span>
                  <strong>
                    {selectedExpert?.phone || "Available after selection"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Shop Address</span>
                  <strong>{selectedExpert?.address || "Address pending"}</strong>
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
                  <span>Service Type</span>
                  <strong>{serviceType || "From service step"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Schedule</span>
                  <strong>
                    {selectedDate && selectedSlot
                      ? `${selectedDate} · ${selectedSlot}`
                      : "Not selected"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Chat</span>
                  <strong>{chatEnabled ? "Enabled" : "Disabled"}</strong>
                </div>
              </div>

              <div style={styles.nextCard}>
                <span style={styles.nextBadge}>Next step</span>

                <h3 style={styles.nextTitle}>Generate Fit Card</h3>

                <p style={styles.nextText}>
                  FitGenie will create a shareable card with measurements, body
                  type, style preferences, selected outfit, expert details,
                  delivery mode, schedule, and notes.
                </p>

                <div style={styles.nextPills}>
                  <span>📏 Measurements</span>
                  <span>👗 Outfit</span>
                  <span>🧵 Expert</span>
                  <span>📦 Delivery</span>
                </div>
              </div>
            </aside>
          </section>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <section style={styles.finalSummary}>
            <div style={styles.finalIcon}>{selectedDelivery?.icon || "🪄"}</div>

            <div>
              <p style={styles.finalLabel}>Delivery interaction summary</p>
              <strong style={styles.finalText}>
                {deliveryMode
                  ? `${deliveryMode} · ${selectedDate} · ${selectedSlot} · ${
                      chatEnabled ? "Chat enabled" : "Chat disabled"
                    }`
                  : "No delivery mode selected yet"}
              </strong>
            </div>
          </section>

          <div className="delivery-footer" style={styles.footer}>
            <button
              type="button"
              onClick={() => nav("/experts")}
              style={styles.backButton}
            >
              ← Back
            </button>

            <button type="button" onClick={continueNext} style={styles.nextButton}>
              Generate Fit Card →
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
    animation: "deliverySoftPulse 2s ease-in-out infinite",
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
    animation: "deliverySoftFloat 3.2s ease-in-out infinite",
  },
  previewLabel: {
    margin: "0 0 4px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  previewScore: {
    margin: 0,
    color: "#111827",
    fontSize: "36px",
    lineHeight: 1,
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
  deliveryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },
  deliveryCard: {
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
  deliveryVisual: {
    height: "106px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px",
  },
  deliveryIcon: {
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
  deliveryBadge: {
    padding: "8px 11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(255,255,255,0.72)",
    fontSize: "12px",
    fontWeight: 900,
  },
  deliveryBody: {
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
  bestForBox: {
    padding: "11px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "grid",
    gap: "4px",
    marginBottom: "12px",
    color: "#111827",
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
  scheduleGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "14px",
  },
  inputBlock: {
    display: "grid",
    gap: "8px",
    marginTop: "14px",
  },
  inputLabel: {
    color: "#111827",
    fontWeight: 900,
    fontSize: "14px",
  },
  input: {
    width: "100%",
    border: "1px solid #dbe4ee",
    borderRadius: "18px",
    padding: "14px",
    background: "#ffffff",
    color: "#111827",
    outline: "none",
    fontWeight: 800,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  slotCards: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  slotCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "999px",
    padding: "11px 13px",
    background: "#ffffff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: 900,
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.06)",
  },
  slotCardSelected: {
    border: "1px solid rgba(109, 93, 252, 0.58)",
    background: "#f5f3ff",
    color: "#4f46e5",
    boxShadow: "0 14px 30px rgba(109, 93, 252, 0.12)",
  },
  chatToggle: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: "15px",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    textAlign: "left",
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.06)",
  },
  chatToggleEnabled: {
    border: "1px solid rgba(109, 93, 252, 0.58)",
    background: "#f5f3ff",
    boxShadow: "0 14px 30px rgba(109, 93, 252, 0.12)",
  },
  chatIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "17px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #ede9fe, #cffafe)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    fontSize: "24px",
    flex: "0 0 auto",
  },
  chatCopy: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    flex: 1,
    color: "#111827",
  },
  togglePill: {
    padding: "7px 10px",
    borderRadius: "999px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#64748b",
    fontWeight: 900,
    fontSize: "12px",
  },
  togglePillOn: {
    background: "#ecfeff",
    borderColor: "#a5f3fc",
    color: "#0891b2",
  },
  optionalText: {
    color: "#64748b",
    fontSize: "13px",
  },
  textarea: {
    width: "100%",
    minHeight: "105px",
    resize: "vertical",
    border: "1px solid #dbe4ee",
    borderRadius: "18px",
    padding: "14px",
    background: "#ffffff",
    color: "#111827",
    outline: "none",
    lineHeight: 1.5,
    fontFamily: "inherit",
    fontWeight: 700,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
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
    minWidth: "230px",
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
