import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const MAIN_OPTIONS = [
  {
    key: "myself",
    title: "For Myself",
    subtitle: "Create your own fit profile and get personalized recommendations.",
    icon: "🪞",
    gradient: "linear-gradient(135deg, rgba(124,92,255,0.95), rgba(0,212,255,0.85))",
    preview: ["Personal size", "Style match", "Fit card"],
  },
  {
    key: "someone",
    title: "For Someone Else",
    subtitle: "Shop for a partner, friend, child, or family member with guided inputs.",
    icon: "🎁",
    gradient: "linear-gradient(135deg, rgba(255,122,162,0.95), rgba(255,170,91,0.85))",
    preview: ["Relationship", "Body inputs", "Expert notes"],
  },
  {
    key: "gift",
    title: "Gift / Occasion",
    subtitle: "Find the right outfit for birthdays, weddings, festivals, and more.",
    icon: "✨",
    gradient: "linear-gradient(135deg, rgba(30,215,166,0.95), rgba(0,212,255,0.82))",
    preview: ["Occasion", "Budget", "Delivery"],
  },
];

const SOMEONE_OPTIONS = [
  {
    label: "Partner",
    icon: "💙",
    description: "Thoughtful styling for your special person.",
  },
  {
    label: "Family Member",
    icon: "🏡",
    description: "Comfortable and occasion-ready choices.",
  },
  {
    label: "Friend",
    icon: "🤝",
    description: "Trendy picks based on personality and use case.",
  },
  {
    label: "Child",
    icon: "🧸",
    description: "Age-appropriate sizing and comfortable fits.",
  },
];

const GIFT_OPTIONS = [
  {
    label: "Birthday",
    icon: "🎂",
    description: "Personalized outfits for celebration moments.",
  },
  {
    label: "Wedding",
    icon: "💍",
    description: "Elegant looks for ceremonies and events.",
  },
  {
    label: "Festival",
    icon: "🪔",
    description: "Ethnic and festive-ready recommendations.",
  },
];

export default function IntentPage() {
  const nav = useNavigate();
  const { forWhom, relation, occasion, patch } = useFlowStore();

  const [error, setError] = useState("");

  const selectedMainOption = useMemo(
    () => MAIN_OPTIONS.find((option) => option.key === forWhom),
    [forWhom]
  );

  const subOptions = forWhom === "someone" ? SOMEONE_OPTIONS : GIFT_OPTIONS;

  const selectedSubType = forWhom === "someone" ? relation : occasion;

  function selectMainOption(optionKey) {
    setError("");

    if (optionKey === "myself") {
      patch({
        forWhom: "myself",
        relation: "",
        occasion: "",
      });
      return;
    }

    patch({
      forWhom: optionKey,
      relation: "",
      occasion: "",
    });
  }

  function selectSubOption(value) {
    setError("");

    if (forWhom === "someone") {
      patch({
        relation: value,
        occasion: "",
      });
      return;
    }

    if (forWhom === "gift") {
      patch({
        occasion: value,
        relation: "",
      });
    }
  }

  function continueNext() {
    if (!forWhom) {
      setError("Please choose one option to continue.");
      return;
    }

    if (forWhom === "someone" && !relation) {
      setError("Please select who you are purchasing for.");
      return;
    }

    if (forWhom === "gift" && !occasion) {
      setError("Please select the occasion.");
      return;
    }

    nav("/basic-profile");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes intentFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes intentGlow {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 860px) {
            .intent-header {
              grid-template-columns: 1fr !important;
            }

            .intent-title {
              font-size: 36px !important;
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
                FitGenie will personalize the size journey, outfit suggestions,
                expert matching, and fit card based on this choice.
              </p>
            </div>

            <div style={styles.sidePreview}>
              <div style={styles.previewTop}>
                <span style={styles.previewIcon}>
                  {selectedMainOption?.icon || "🧵"}
                </span>

                <div>
                  <p style={styles.previewLabel}>Current path</p>
                  <strong style={styles.previewTitle}>
                    {selectedMainOption?.title || "Choose an option"}
                  </strong>
                </div>
              </div>

              <div style={styles.previewLine} />

              <div style={styles.previewTags}>
                {(selectedMainOption?.preview || [
                  "Intent",
                  "Profile",
                  "Recommendations",
                ]).map((tag) => (
                  <span key={tag} style={styles.previewTag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="intent-main-grid" style={styles.mainGrid}>
            {MAIN_OPTIONS.map((option) => {
              const selected = forWhom === option.key;

              return (
                <motion.button
                  key={option.key}
                  type="button"
                  whileHover={{ y: -6, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectMainOption(option.key)}
                  style={{
                    ...styles.mainCard,
                    ...(selected ? styles.mainCardSelected : {}),
                  }}
                >
                  <div
                    style={{
                      ...styles.cardIconWrap,
                      background: option.gradient,
                    }}
                  >
                    <span style={styles.cardIcon}>{option.icon}</span>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.cardTitleRow}>
                      <h2 style={styles.cardTitle}>{option.title}</h2>
                      <span
                        style={{
                          ...styles.radioCircle,
                          ...(selected ? styles.radioCircleSelected : {}),
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
            {(forWhom === "someone" || forWhom === "gift") && (
              <motion.section
                key={forWhom}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                style={styles.subSection}
              >
                <div style={styles.subHeader}>
                  <div>
                    <h2 style={styles.subTitle}>
                      {forWhom === "someone"
                        ? "Who are you shopping for?"
                        : "What is the occasion?"}
                    </h2>

                    <p style={styles.subText}>
                      {forWhom === "someone"
                        ? "This helps us tune the recommendation tone, age flow, and fit-card notes."
                        : "This helps us recommend outfits that match the mood, styling, and delivery urgency."}
                    </p>
                  </div>
                </div>

                <div className="intent-sub-grid" style={styles.subGrid}>
                  {subOptions.map((option) => {
                    const selected = selectedSubType === option.label;

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

          <section style={styles.selectionSummary}>
            <div style={styles.summaryIcon}>🪄</div>

            <div>
              <p style={styles.summaryLabel}>Your selected journey</p>
              <strong style={styles.summaryText}>
                {!forWhom
                  ? "No option selected yet"
                  : forWhom === "myself"
                  ? "Purchasing for myself"
                  : forWhom === "someone"
                  ? `Purchasing for someone else${
                      relation ? ` · ${relation}` : ""
                    }`
                  : `Gift / occasion${occasion ? ` · ${occasion}` : ""}`}
              </strong>
            </div>
          </section>

          <div className="intent-footer" style={styles.footer}>
            <button
              type="button"
              className="btn ghost"
              onClick={() => nav("/welcome")}
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
              Continue to Basic Profile
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
      "radial-gradient(circle at 12% 10%, rgba(124,92,255,0.28), transparent 30%), radial-gradient(circle at 88% 8%, rgba(0,212,255,0.24), transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))",
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
    gridTemplateColumns: "minmax(0, 1fr) 330px",
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
    animation: "intentGlow 2s ease-in-out infinite",
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
  sidePreview: {
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "26px",
    padding: "20px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))",
    boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
  },
  previewTop: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
  },
  previewIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "20px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.11)",
    border: "1px solid rgba(255,255,255,0.14)",
    fontSize: "28px",
    animation: "intentFloat 3.2s ease-in-out infinite",
  },
  previewLabel: {
    margin: "0 0 4px",
    fontSize: "12px",
    color: "rgba(255,255,255,0.62)",
    fontWeight: 800,
  },
  previewTitle: {
    fontSize: "17px",
  },
  previewLine: {
    height: "1px",
    margin: "18px 0",
    background: "rgba(255,255,255,0.13)",
  },
  previewTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  previewTag: {
    padding: "7px 9px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontSize: "12px",
    color: "rgba(255,255,255,0.78)",
    fontWeight: 800,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  },
  mainCard: {
    minHeight: "260px",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "28px",
    padding: "0",
    overflow: "hidden",
    background: "rgba(255,255,255,0.065)",
    color: "inherit",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 18px 42px rgba(0,0,0,0.20)",
  },
  mainCardSelected: {
    border: "2px solid rgba(0,212,255,0.95)",
    boxShadow: "0 24px 60px rgba(0,212,255,0.16)",
  },
  cardIconWrap: {
    height: "112px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cardIcon: {
    width: "74px",
    height: "74px",
    borderRadius: "26px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.22)",
    border: "1px solid rgba(255,255,255,0.24)",
    fontSize: "38px",
    boxShadow: "0 16px 32px rgba(0,0,0,0.24)",
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
    fontSize: "21px",
    lineHeight: 1.2,
  },
  radioCircle: {
    width: "27px",
    height: "27px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(255,255,255,0.22)",
    color: "#061224",
    fontSize: "14px",
    fontWeight: 900,
    flex: "0 0 auto",
  },
  radioCircleSelected: {
    background: "#00d4ff",
    borderColor: "#00d4ff",
    boxShadow: "0 0 20px rgba(0,212,255,0.5)",
  },
  cardSubtitle: {
    minHeight: "66px",
    margin: "10px 0 14px",
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.5,
    fontSize: "14px",
  },
  cardTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
  },
  cardTag: {
    padding: "6px 8px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontSize: "11px",
    color: "rgba(255,255,255,0.78)",
    fontWeight: 800,
  },
  subSection: {
    marginTop: "20px",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "28px",
    padding: "22px",
    background: "rgba(255,255,255,0.06)",
  },
  subHeader: {
    marginBottom: "16px",
  },
  subTitle: {
    margin: "0 0 7px",
    fontSize: "25px",
  },
  subText: {
    margin: 0,
    color: "rgba(255,255,255,0.68)",
    lineHeight: 1.55,
  },
  subGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  subCard: {
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
  subCardSelected: {
    border: "1px solid rgba(0,212,255,0.8)",
    background: "rgba(0,212,255,0.10)",
    boxShadow: "0 14px 30px rgba(0,212,255,0.10)",
  },
  subIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.13)",
    fontSize: "24px",
    flex: "0 0 auto",
  },
  subContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  smallCheck: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(255,255,255,0.20)",
    fontSize: "12px",
    fontWeight: 900,
    flex: "0 0 auto",
  },
  smallCheckSelected: {
    background: "#00d4ff",
    color: "#061224",
    borderColor: "#00d4ff",
  },
  selectionSummary: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    marginTop: "18px",
    padding: "16px",
    borderRadius: "22px",
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  summaryIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, rgba(124,92,255,0.9), rgba(0,212,255,0.8))",
    fontSize: "22px",
    flex: "0 0 auto",
  },
  summaryLabel: {
    margin: "0 0 4px",
    color: "rgba(255,255,255,0.58)",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  summaryText: {
    fontSize: "16px",
  },
  errorBox: {
    marginTop: "16px",
    padding: "13px 15px",
    borderRadius: "16px",
    background: "rgba(255, 86, 86, 0.16)",
    border: "1px solid rgba(255, 120, 120, 0.35)",
    color: "#ffdede",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "22px",
  },
  footerButton: {
    minWidth: "180px",
  },
};
