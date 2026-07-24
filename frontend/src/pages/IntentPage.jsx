import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const MAIN_OPTIONS = [
  {
    key: "myself",
    title: "For Myself",
    subtitle:
      "Build your own fit profile and get personalized outfit recommendations.",
    icon: "🪞",
    gradient: "linear-gradient(135deg, #dbeafe, #ede9fe, #fce7f3)",
    accent: "#6d5dfc",
    preview: ["My size", "My style", "My fit card"],
  },
  {
    key: "someone",
    title: "For Someone Else",
    subtitle:
      "Shop for a partner, friend, child, or family member with guided inputs.",
    icon: "🎁",
    gradient: "linear-gradient(135deg, #ffe4e6, #fed7aa, #fef3c7)",
    accent: "#f97316",
    preview: ["Relation", "Gift fit", "Expert notes"],
  },
  {
    key: "gift",
    title: "Gift / Occasion",
    subtitle:
      "Find the right outfit for birthdays, weddings, festivals, and events.",
    icon: "✨",
    gradient: "linear-gradient(135deg, #dcfce7, #cffafe, #e0e7ff)",
    accent: "#059669",
    preview: ["Occasion", "Budget", "Delivery"],
  },
];

const SOMEONE_OPTIONS = [
  {
    label: "Partner",
    icon: "💙",
    description: "Thoughtful styling for someone special.",
  },
  {
    label: "Family Member",
    icon: "🏡",
    description: "Comfortable and occasion-ready choices.",
  },
  {
    label: "Friend",
    icon: "🤝",
    description: "Trendy picks based on use and personality.",
  },
  {
    label: "Child",
    icon: "🧸",
    description: "Age-friendly and comfort-first fit guidance.",
  },
];

const GIFT_OPTIONS = [
  {
    label: "Birthday",
    icon: "🎂",
    description: "Stylish looks for celebration moments.",
  },
  {
    label: "Wedding",
    icon: "💍",
    description: "Elegant outfits for ceremonies and events.",
  },
  {
    label: "Festival",
    icon: "🪔",
    description: "Festive outfits with ethnic and fusion styling.",
  },
];

function getIntentValue(intent) {
  if (typeof intent === "string") return intent;
  return intent?.type || "";
}

function getIntentSubValue(intent) {
  if (typeof intent === "object" && intent !== null) {
    return intent.subType || "";
  }

  return "";
}

export default function IntentPage() {
  const nav = useNavigate();
  const flow = useFlowStore();
  const {
    intent,
    intentSubType,
    forWhom,
    relation,
    occasion,
    patch,
  } = flow;

  const [error, setError] = useState("");

  const selectedMain = forWhom || getIntentValue(intent);
  const selectedSub =
    selectedMain === "someone"
      ? relation || intentSubType || getIntentSubValue(intent)
      : selectedMain === "gift"
      ? occasion || intentSubType || getIntentSubValue(intent)
      : "";

  const selectedMainOption = useMemo(
    () => MAIN_OPTIONS.find((option) => option.key === selectedMain),
    [selectedMain]
  );

  const subOptions = selectedMain === "someone" ? SOMEONE_OPTIONS : GIFT_OPTIONS;

  function selectMainOption(optionKey) {
    setError("");

    patch({
      intent: optionKey,
      intentSubType: "",
      forWhom: optionKey,
      relation: "",
      occasion: "",
    });
  }

  function selectSubOption(value) {
    setError("");

    if (selectedMain === "someone") {
      patch({
        intent: "someone",
        intentSubType: value,
        forWhom: "someone",
        relation: value,
        occasion: "",
      });
      return;
    }

    if (selectedMain === "gift") {
      patch({
        intent: "gift",
        intentSubType: value,
        forWhom: "gift",
        occasion: value,
        relation: "",
      });
    }
  }

  function continueNext() {
    if (!selectedMain) {
      setError("Please choose one option to continue.");
      return;
    }

    if (selectedMain === "someone" && !selectedSub) {
      setError("Please select who you are purchasing for.");
      return;
    }

    if (selectedMain === "gift" && !selectedSub) {
      setError("Please select the occasion.");
      return;
    }

    nav("/basic-profile");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes intentSoftFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes intentSoftPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 900px) {
            .intent-header {
              grid-template-columns: 1fr !important;
            }

            .intent-title {
              font-size: 38px !important;
            }

            .intent-main-grid {
              grid-template-columns: 1fr !important;
            }

            .intent-sub-grid {
              grid-template-columns: 1fr !important;
            }

            .intent-footer {
              flex-direction: column !important;
            }

            .intent-footer button {
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
          <section className="intent-header" style={styles.header}>
            <div>
              <div style={styles.stepPill}>
                <span style={styles.stepDot} />
                Step 1 of 12 · User Intent
              </div>

              <h1 className="intent-title" style={styles.title}>
                For whom do you want to purchase?
              </h1>

              <p style={styles.subtitle}>
                Choose the shopping journey first. FitGenie will personalize the
                next questions, outfit recommendations, expert matching, and fit
                card based on this choice.
              </p>
            </div>

            <aside style={styles.previewCard}>
              <div style={styles.previewTop}>
                <span style={styles.previewIcon}>
                  {selectedMainOption?.icon || "🧵"}
                </span>

                <div>
                  <p style={styles.previewLabel}>Current path</p>
                  <h2 style={styles.previewTitle}>
                    {selectedMainOption?.title || "Choose an option"}
                  </h2>
                </div>
              </div>

              <p style={styles.previewText}>
                {selectedMainOption?.subtitle ||
                  "Your selection helps us guide the perfect fit journey."}
              </p>

              <div style={styles.previewTags}>
                {(selectedMainOption?.preview || [
                  "Intent",
                  "Profile",
                  "Recommendation",
                ]).map((tag) => (
                  <span key={tag} style={styles.previewTag}>
                    {tag}
                  </span>
                ))}
              </div>
            </aside>
          </section>

          <section className="intent-main-grid" style={styles.mainGrid}>
            {MAIN_OPTIONS.map((option) => {
              const selected = selectedMain === option.key;

              return (
                <motion.button
                  key={option.key}
                  type="button"
                  whileHover={{ y: -6, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectMainOption(option.key)}
                  style={{
                    ...styles.mainCard,
                    ...(selected
                      ? {
                          borderColor: option.accent,
                          boxShadow: `0 22px 45px ${option.accent}26`,
                        }
                      : {}),
                  }}
                >
                  <div
                    style={{
                      ...styles.cardVisual,
                      background: option.gradient,
                    }}
                  >
                    <span style={styles.cardIcon}>{option.icon}</span>
                    <span
                      style={{
                        ...styles.cardBadge,
                        color: option.accent,
                      }}
                    >
                      {selected ? "Selected" : "Choose"}
                    </span>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.cardTitleRow}>
                      <h2 style={styles.cardTitle}>{option.title}</h2>

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

                    <p style={styles.cardSubtitle}>{option.subtitle}</p>

                    <div style={styles.cardTags}>
                      {option.preview.map((tag) => (
                        <span key={tag} style={styles.cardTag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </section>

          <AnimatePresence mode="wait">
            {(selectedMain === "someone" || selectedMain === "gift") && (
              <motion.section
                key={selectedMain}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                style={styles.subSection}
              >
                <div style={styles.subHeader}>
                  <h2 style={styles.subTitle}>
                    {selectedMain === "someone"
                      ? "Who are you shopping for?"
                      : "What is the occasion?"}
                  </h2>

                  <p style={styles.subText}>
                    {selectedMain === "someone"
                      ? "This helps us tune the recommendation tone, profile details, and expert notes."
                      : "This helps us recommend outfits that match the mood, budget, and delivery timing."}
                  </p>
                </div>

                <div className="intent-sub-grid" style={styles.subGrid}>
                  {subOptions.map((option) => {
                    const selected = selectedSub === option.label;

                    return (
                      <motion.button
                        key={option.label}
                        type="button"
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectSubOption(option.label)}
                        style={{
                          ...styles.subCard,
                          ...(selected ? styles.subCardSelected : {}),
                        }}
                      >
                        <span style={styles.subIcon}>{option.icon}</span>

                        <span style={styles.subContent}>
                          <strong>{option.label}</strong>
                          <small>{option.description}</small>
                        </span>

                        <span
                          style={{
                            ...styles.smallCheck,
                            ...(selected ? styles.smallCheckSelected : {}),
                          }}
                        >
                          {selected ? "✓" : ""}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <section style={styles.summaryCard}>
            <div style={styles.summaryIcon}>🪄</div>

            <div>
              <p style={styles.summaryLabel}>Selected journey</p>
              <strong style={styles.summaryText}>
                {!selectedMain
                  ? "No option selected yet"
                  : selectedMain === "myself"
                  ? "Purchasing for myself"
                  : selectedMain === "someone"
                  ? `Purchasing for someone else${
                      selectedSub ? ` · ${selectedSub}` : ""
                    }`
                  : `Gift / occasion${selectedSub ? ` · ${selectedSub}` : ""}`}
              </strong>
            </div>
          </section>

          <div className="intent-footer" style={styles.footer}>
            <button
              type="button"
              onClick={() => nav("/welcome")}
              style={styles.backButton}
            >
              ← Back
            </button>

            <button type="button" onClick={continueNext} style={styles.nextButton}>
              Continue to Basic Profile →
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
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.08), rgba(255,255,255,0.10)), url('/backgrounds/rainbow-cloud-bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
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
    gridTemplateColumns: "minmax(0, 1fr) 340px",
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
    animation: "intentSoftPulse 2s ease-in-out infinite",
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
    animation: "intentSoftFloat 3.2s ease-in-out infinite",
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
    fontSize: "20px",
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
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  },
  mainCard: {
    minHeight: "270px",
    border: "2px solid rgba(148, 163, 184, 0.22)",
    borderRadius: "30px",
    padding: "0",
    overflow: "hidden",
    background: "rgba(255,255,255,0.82)",
    color: "#111827",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 18px 44px rgba(15, 23, 42, 0.10)",
  },
  cardVisual: {
    height: "116px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "22px",
  },
  cardIcon: {
    width: "70px",
    height: "70px",
    borderRadius: "26px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.62)",
    border: "1px solid rgba(255,255,255,0.72)",
    fontSize: "36px",
    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.10)",
  },
  cardBadge: {
    padding: "8px 11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(255,255,255,0.72)",
    fontSize: "12px",
    fontWeight: 900,
  },
  cardBody: {
    padding: "18px",
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
    fontSize: "21px",
    lineHeight: 1.25,
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
    fontSize: "14px",
    fontWeight: 900,
    flex: "0 0 auto",
  },
  cardSubtitle: {
    minHeight: "70px",
    margin: "10px 0 14px",
    color: "#475569",
    lineHeight: 1.55,
    fontSize: "14px",
    fontWeight: 600,
  },
  cardTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
  },
  cardTag: {
    padding: "6px 8px",
    borderRadius: "999px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: "11px",
    fontWeight: 900,
  },
  subSection: {
    marginTop: "20px",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "28px",
    padding: "22px",
    background: "rgba(255,255,255,0.74)",
    boxShadow: "0 16px 38px rgba(15, 23, 42, 0.08)",
  },
  subHeader: {
    marginBottom: "16px",
  },
  subTitle: {
    margin: "0 0 7px",
    color: "#111827",
    fontSize: "25px",
  },
  subText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
    fontWeight: 600,
  },
  subGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  subCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "14px",
    background: "#ffffff",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.06)",
  },
  subCardSelected: {
    border: "1px solid rgba(109, 93, 252, 0.58)",
    background: "#f5f3ff",
    boxShadow: "0 14px 30px rgba(109, 93, 252, 0.12)",
  },
  subIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontSize: "24px",
    flex: "0 0 auto",
  },
  subContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
    color: "#111827",
  },
  smallCheck: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    border: "1px solid #cbd5e1",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 900,
    flex: "0 0 auto",
  },
  smallCheckSelected: {
    background: "#6d5dfc",
    borderColor: "#6d5dfc",
    color: "#ffffff",
  },
  summaryCard: {
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
  summaryIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #ede9fe, #cffafe)",
    fontSize: "22px",
    flex: "0 0 auto",
  },
  summaryLabel: {
    margin: "0 0 4px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  summaryText: {
    color: "#111827",
    fontSize: "16px",
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
    minWidth: "240px",
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
