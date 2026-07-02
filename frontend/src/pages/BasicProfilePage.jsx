import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const AGE_OPTIONS = [
  {
    value: "0-3",
    label: "0 - 3",
    title: "Baby / Toddler",
    icon: "🍼",
    note: "Soft, safe and comfort-first fit guidance.",
    gradient: "linear-gradient(135deg, #fef3c7, #ffedd5, #ffe4e6)",
    accent: "#f97316",
  },
  {
    value: "4-10",
    label: "4 - 10",
    title: "Child",
    icon: "🧸",
    note: "Comfortable sizing for active daily wear.",
    gradient: "linear-gradient(135deg, #dcfce7, #d1fae5, #cffafe)",
    accent: "#059669",
  },
  {
    value: "11-18",
    label: "11 - 18",
    title: "Teen",
    icon: "🎒",
    note: "Trendy and flexible fit recommendations.",
    gradient: "linear-gradient(135deg, #dbeafe, #e0e7ff, #ede9fe)",
    accent: "#4f46e5",
  },
  {
    value: "19-29",
    label: "19 - 29",
    title: "Young Adult",
    icon: "✨",
    note: "Style-forward choices with smart fit matching.",
    gradient: "linear-gradient(135deg, #fce7f3, #ede9fe, #dbeafe)",
    accent: "#9333ea",
  },
  {
    value: "30-45",
    label: "30 - 45",
    title: "Adult",
    icon: "👔",
    note: "Balanced comfort, occasion and styling fit.",
    gradient: "linear-gradient(135deg, #e0f2fe, #ecfeff, #f0fdfa)",
    accent: "#0284c7",
  },
  {
    value: "46-60",
    label: "46 - 60",
    title: "Mature Adult",
    icon: "🌿",
    note: "Comfort-aware and refined recommendations.",
    gradient: "linear-gradient(135deg, #ecfccb, #dcfce7, #f0fdfa)",
    accent: "#65a30d",
  },
  {
    value: "60+",
    label: "60+",
    title: "Senior",
    icon: "🕊️",
    note: "Ease, comfort and relaxed fit priority.",
    gradient: "linear-gradient(135deg, #f8fafc, #e0f2fe, #ede9fe)",
    accent: "#64748b",
  },
];

const GENDER_OPTIONS = [
  {
    value: "Male",
    title: "Male",
    icon: "👨",
    note: "Recommended sizing and silhouettes tuned for male fits.",
    gradient: "linear-gradient(135deg, #dbeafe, #e0e7ff, #ede9fe)",
    accent: "#4f46e5",
  },
  {
    value: "Female",
    title: "Female",
    icon: "👩",
    note: "Recommended sizing and silhouettes tuned for female fits.",
    gradient: "linear-gradient(135deg, #fce7f3, #ffe4e6, #fed7aa)",
    accent: "#db2777",
  },
];

export default function BasicProfilePage() {
  const nav = useNavigate();
  const flow = useFlowStore();

  const { ageRange, age, gender, profile, patch } = flow;

  const selectedAgeValue = ageRange || age || profile?.ageRange || "";
  const selectedGenderValue = gender || profile?.gender || "";

  const [error, setError] = useState("");

  const selectedAge = useMemo(
    () => AGE_OPTIONS.find((item) => item.value === selectedAgeValue),
    [selectedAgeValue]
  );

  const selectedGender = useMemo(
    () => GENDER_OPTIONS.find((item) => item.value === selectedGenderValue),
    [selectedGenderValue]
  );

  function selectAge(value) {
    setError("");

    patch({
      ageRange: value,
      age: value,
    });
  }

  function selectGender(value) {
    setError("");

    patch({
      gender: value,
    });
  }

  function continueNext() {
    if (!selectedAgeValue) {
      setError("Please select an age range to continue.");
      return;
    }

    if (!selectedGenderValue) {
      setError("Please select gender to continue.");
      return;
    }

    nav("/size-body");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes basicSoftFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes basicSoftPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 980px) {
            .basic-profile-header {
              grid-template-columns: 1fr !important;
            }

            .basic-profile-title {
              font-size: 38px !important;
            }

            .basic-profile-layout {
              grid-template-columns: 1fr !important;
            }

            .basic-age-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .basic-footer {
              flex-direction: column !important;
            }

            .basic-footer button {
              width: 100% !important;
            }
          }

          @media (max-width: 600px) {
            .basic-age-grid {
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
          <section className="basic-profile-header" style={styles.header}>
            <div>
              <div style={styles.stepPill}>
                <span style={styles.stepDot} />
                Step 2 of 12 · Basic Profile
              </div>

              <h1 className="basic-profile-title" style={styles.title}>
                Tell us the basic profile.
              </h1>

              <p style={styles.subtitle}>
                These details help FitGenie tune age-appropriate sizing,
                recommended silhouettes, expert notes, and the final fit card.
              </p>
            </div>

            <aside style={styles.previewCard}>
              <div style={styles.previewTop}>
                <span style={styles.previewIcon}>
                  {selectedGender?.icon || selectedAge?.icon || "🧵"}
                </span>

                <div>
                  <p style={styles.previewLabel}>Profile preview</p>
                  <h2 style={styles.previewTitle}>
                    {selectedAge?.label || "Age"} ·{" "}
                    {selectedGender?.title || "Gender"}
                  </h2>
                </div>
              </div>

              <p style={styles.previewText}>
                {selectedAge?.note ||
                  "Choose age and gender to unlock better recommendations."}
              </p>

              <div style={styles.previewTags}>
                <span style={styles.previewTag}>
                  {selectedAgeValue ? `Age ${selectedAgeValue}` : "Age pending"}
                </span>
                <span style={styles.previewTag}>
                  {selectedGenderValue || "Gender pending"}
                </span>
                <span style={styles.previewTag}>Fit profile</span>
              </div>
            </aside>
          </section>

          <section className="basic-profile-layout" style={styles.layout}>
            <main style={styles.mainPanel}>
              <section style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>🎯</span>

                  <div>
                    <h2 style={styles.blockTitle}>What is your age?</h2>
                    <p style={styles.blockText}>
                      Choose the closest age range. This keeps the next size,
                      outfit, and expert questions more relevant.
                    </p>
                  </div>
                </div>

                <div className="basic-age-grid" style={styles.ageGrid}>
                  {AGE_OPTIONS.map((option) => {
                    const selected = selectedAgeValue === option.value;

                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        whileHover={{ y: -5, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectAge(option.value)}
                        style={{
                          ...styles.ageCard,
                          ...(selected
                            ? {
                                borderColor: option.accent,
                                background: "#ffffff",
                                boxShadow: `0 18px 34px ${option.accent}24`,
                              }
                            : {}),
                        }}
                      >
                        <div
                          style={{
                            ...styles.ageIconWrap,
                            background: option.gradient,
                          }}
                        >
                          <span style={styles.ageIcon}>{option.icon}</span>
                        </div>

                        <div style={styles.ageContent}>
                          <div style={styles.ageTitleRow}>
                            <div>
                              <strong style={styles.ageLabel}>
                                {option.label}
                              </strong>
                              <small style={styles.ageTitle}>
                                {option.title}
                              </small>
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

                          <p style={styles.ageNote}>{option.note}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            </main>

            <aside style={styles.sidePanel}>
              <section style={styles.genderBlock}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>🧬</span>

                  <div>
                    <h2 style={styles.blockTitle}>Gender</h2>
                    <p style={styles.blockText}>
                      This helps personalize size mapping, cuts, and fit
                      recommendations.
                    </p>
                  </div>
                </div>

                <div style={styles.genderGrid}>
                  {GENDER_OPTIONS.map((option) => {
                    const selected = selectedGenderValue === option.value;

                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        whileHover={{ y: -5, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectGender(option.value)}
                        style={{
                          ...styles.genderCard,
                          ...(selected
                            ? {
                                borderColor: option.accent,
                                boxShadow: `0 18px 34px ${option.accent}24`,
                              }
                            : {}),
                        }}
                      >
                        <div
                          style={{
                            ...styles.genderVisual,
                            background: option.gradient,
                          }}
                        >
                          <span style={styles.genderIcon}>{option.icon}</span>
                          <span
                            style={{
                              ...styles.genderBadge,
                              color: option.accent,
                            }}
                          >
                            {selected ? "Selected" : "Choose"}
                          </span>
                        </div>

                        <div style={styles.genderBody}>
                          <div style={styles.genderTitleRow}>
                            <h3 style={styles.genderTitle}>{option.title}</h3>

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

                          <p style={styles.genderNote}>{option.note}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              <section style={styles.tipCard}>
                <span style={styles.tipIcon}>💡</span>

                <div>
                  <h3 style={styles.tipTitle}>Why this matters</h3>
                  <p style={styles.tipText}>
                    Later, the AI Fit Scanner can refine this with height, body
                    proportions, recommended size, and size confidence.
                  </p>
                </div>
              </section>
            </aside>
          </section>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <section style={styles.summaryCard}>
            <div style={styles.summaryIcon}>🪄</div>

            <div>
              <p style={styles.summaryLabel}>Selected basic profile</p>
              <strong style={styles.summaryText}>
                {selectedAgeValue || selectedGenderValue
                  ? `${selectedAgeValue || "Age not selected"} · ${
                      selectedGenderValue || "Gender not selected"
                    }`
                  : "No basic profile selected yet"}
              </strong>
            </div>
          </section>

          <div className="basic-footer" style={styles.footer}>
            <button
              type="button"
              onClick={() => nav("/intent")}
              style={styles.backButton}
            >
              ← Back
            </button>

            <button type="button" onClick={continueNext} style={styles.nextButton}>
              Continue to Size & Body →
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
    animation: "basicSoftPulse 2s ease-in-out infinite",
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
    animation: "basicSoftFloat 3.2s ease-in-out infinite",
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
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 360px",
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
  ageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "13px",
  },
  ageCard: {
    border: "2px solid rgba(148, 163, 184, 0.22)",
    borderRadius: "24px",
    padding: 0,
    overflow: "hidden",
    background: "rgba(255,255,255,0.82)",
    color: "#111827",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.07)",
  },
  ageIconWrap: {
    height: "82px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  ageIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "20px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.68)",
    border: "1px solid rgba(255,255,255,0.72)",
    fontSize: "28px",
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.08)",
  },
  ageContent: {
    padding: "14px",
  },
  ageTitleRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "10px",
  },
  ageLabel: {
    display: "block",
    color: "#111827",
    fontSize: "18px",
  },
  ageTitle: {
    display: "block",
    marginTop: "3px",
    color: "#64748b",
    fontWeight: 800,
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
  ageNote: {
    minHeight: "44px",
    margin: "10px 0 0",
    color: "#475569",
    lineHeight: 1.45,
    fontSize: "13px",
    fontWeight: 600,
  },
  sidePanel: {
    display: "grid",
    gap: "16px",
  },
  genderBlock: {
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "30px",
    padding: "22px",
    background: "rgba(255,255,255,0.76)",
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.09)",
  },
  genderGrid: {
    display: "grid",
    gap: "13px",
  },
  genderCard: {
    border: "2px solid rgba(148, 163, 184, 0.22)",
    borderRadius: "24px",
    overflow: "hidden",
    padding: 0,
    background: "rgba(255,255,255,0.86)",
    color: "#111827",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.07)",
  },
  genderVisual: {
    height: "92px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px",
  },
  genderIcon: {
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
  genderBadge: {
    padding: "8px 11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(255,255,255,0.72)",
    fontSize: "12px",
    fontWeight: 900,
  },
  genderBody: {
    padding: "15px",
  },
  genderTitleRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  },
  genderTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "20px",
  },
  genderNote: {
    margin: "8px 0 0",
    color: "#475569",
    lineHeight: 1.5,
    fontSize: "14px",
    fontWeight: 600,
  },
  tipCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "13px",
    padding: "16px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.76)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
  },
  tipIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #fef3c7, #dbeafe)",
    fontSize: "22px",
    flex: "0 0 auto",
  },
  tipTitle: {
    margin: "0 0 6px",
    color: "#111827",
    fontSize: "17px",
  },
  tipText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.55,
    fontSize: "13px",
    fontWeight: 600,
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
