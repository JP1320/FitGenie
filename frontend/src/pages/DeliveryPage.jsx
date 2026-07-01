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
    gradient:
      "linear-gradient(135deg, rgba(124,92,255,0.95), rgba(0,212,255,0.82))",
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
    gradient:
      "linear-gradient(135deg, rgba(255,122,162,0.95), rgba(255,170,91,0.82))",
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
    gradient:
      "linear-gradient(135deg, rgba(30,215,166,0.95), rgba(0,212,255,0.82))",
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

function getDefaultSchedule() {
  const today = getTodayDateString();
  return `${today} · Evening · 4 PM - 8 PM`;
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

  function selectDeliveryMode(value) {
    setError("");

    patch({
      deliveryMode: value,
    });
  }

  function toggleChat(value) {
    setError("");

    patch({
      chatEnabled: value,
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
          @keyframes deliveryFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes deliveryPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 1050px) {
            .delivery-header {
              grid-template-columns: 1fr !important;
            }

            .delivery-title {
              font-size: 36px !important;
            }

            .delivery-layout {
              grid-template-columns: 1fr !important;
            }

            .delivery-grid {
              grid-template-columns: 1fr !important;
            }

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
              <div style={styles.previewIcon}>
                {selectedDelivery?.icon || "📦"}
              </div>

              <div>
                <p style={styles.previewLabel}>Selected delivery mode</p>
                <h2 style={styles.previewTitle}>
                  {selectedDelivery?.title || "Mode pending"}
                </h2>
                <p style={styles.previewText}>
                  {selectedDelivery?.bestFor ||
                    "Pick a delivery mode to prepare the Fit Card handoff."}
                </p>
              </div>

              <div style={styles.previewLine} />

              <div style={styles.previewChips}>
                <span style={styles.previewChip}>
                  {selectedDate || "Date pending"}
                </span>
                <span style={styles.previewChip}>
                  {selectedSlot || "Slot pending"}
                </span>
                <span style={styles.previewChip}>
                  {chatEnabled ? "Chat enabled" : "Chat optional"}
                </span>
              </div>
            </aside>
          </section>

          <section className="delivery-layout" style={styles.layout}>
            <main style={styles.mainPanel}>
              <section style={styles.filterBlock}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>🚚</span>

                  <div>
                    <h2 style={styles.blockTitle}>
                      How do you want your delivery?
                    </h2>
                    <p style={styles.blockText}>
                      Choose the way you prefer to interact with the expert and
                      receive the final outfit/service.
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
                          ...(selected ? styles.deliveryCardSelected : {}),
                        }}
                      >
                        <div
                          style={{
                            ...styles.deliveryVisual,
                            background: option.gradient,
                          }}
                        >
                          <span style={styles.deliveryIcon}>{option.icon}</span>
                          <span style={styles.deliveryBadge}>{option.badge}</span>
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
                                ...(selected ? styles.checkCircleSelected : {}),
                              }}
                            >
                              {selected ? "✓" : ""}
                            </span>
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

              <section style={styles.filterBlock}>
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

              <section style={styles.filterBlock}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>💬</span>

                  <div>
                    <h2 style={styles.blockTitle}>Chat with expert</h2>
                    <p style={styles.blockText}>
                      Enable chat if you want the expert to ask questions,
                      confirm measurements, and discuss design notes.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleChat(!chatEnabled)}
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

                  <span style={styles.togglePill}>
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
                  <strong>{selectedExpert?.phone || "Available after selection"}</strong>
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
                      : getDefaultSchedule()}
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
                  FitGenie will create a shareable card containing measurements,
                  body type, style preferences, selected outfit, delivery mode,
                  schedule, and notes for the selected expert.
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
            <div style={styles.finalIcon}>
              {selectedDelivery?.icon || "🪄"}
            </div>

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
              className="btn ghost"
              onClick={() => nav("/experts")}
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
              Generate Fit Card
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
    animation: "deliveryPulse 2s ease-in-out infinite",
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
    animation: "deliveryFloat 3.2s ease-in-out infinite",
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
    gridTemplateColumns: "minmax(0, 1fr) 350px",
    gap: "18px",
    alignItems: "start",
  },
  mainPanel: {
    display: "grid",
    gap: "18px",
  },
  filterBlock: {
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
  deliveryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },
  deliveryCard: {
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
  deliveryCardSelected: {
    border: "2px solid rgba(0,212,255,0.95)",
    boxShadow: "0 22px 50px rgba(0,212,255,0.14)",
  },
  deliveryVisual: {
    height: "96px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px",
  },
  deliveryIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "21px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.22)",
    border: "1px solid rgba(255,255,255,0.24)",
    fontSize: "31px",
    boxShadow: "0 14px 28px rgba(0,0,0,0.22)",
  },
  deliveryBadge: {
    padding: "8px 11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.22)",
    border: "1px solid rgba(255,255,255,0.22)",
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
    fontWeight: 900,
    fontSize: "14px",
  },
  input: {
    width: "100%",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "18px",
    padding: "14px",
    background: "rgba(255,255,255,0.08)",
    color: "inherit",
    outline: "none",
    fontWeight: 800,
  },
  slotCards: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  slotCard: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "999px",
    padding: "11px 13px",
    background: "rgba(255,255,255,0.07)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: 900,
  },
  slotCardSelected: {
    border: "1px solid rgba(0,212,255,0.85)",
    background: "rgba(0,212,255,0.12)",
    color: "#d9fbff",
  },
  chatToggle: {
    width: "100%",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "22px",
    padding: "15px",
    background: "rgba(255,255,255,0.07)",
    color: "inherit",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    textAlign: "left",
  },
  chatToggleEnabled: {
    border: "1px solid rgba(0,212,255,0.85)",
    background: "rgba(0,212,255,0.12)",
    boxShadow: "0 14px 30px rgba(0,212,255,0.10)",
  },
  chatIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "17px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.11)",
    border: "1px solid rgba(255,255,255,0.14)",
    fontSize: "24px",
    flex: "0 0 auto",
  },
  chatCopy: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    flex: 1,
  },
  togglePill: {
    padding: "7px 10px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.20)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontWeight: 900,
    fontSize: "12px",
  },
  optionalText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: "13px",
  },
  textarea: {
    width: "100%",
    minHeight: "105px",
    resize: "vertical",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "18px",
    padding: "14px",
    background: "rgba(255,255,255,0.08)",
    color: "inherit",
    outline: "none",
    lineHeight: 1.5,
    fontFamily: "inherit",
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
  nextCard: {
    marginTop: "14px",
    padding: "14px",
    borderRadius: "20px",
    background: "rgba(0,212,255,0.10)",
    border: "1px solid rgba(0,212,255,0.22)",
  },
  nextBadge: {
    display: "inline-flex",
    marginBottom: "8px",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.10)",
    color: "#d9fbff",
    fontSize: "11px",
    fontWeight: 900,
  },
  nextTitle: {
    margin: "0 0 8px",
    fontSize: "18px",
  },
  nextText: {
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
    minWidth: "210px",
  },
};
