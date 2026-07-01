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
  },
  {
    value: "4-10",
    label: "4 - 10",
    title: "Child",
    icon: "🧸",
    note: "Comfortable sizing for active daily wear.",
  },
  {
    value: "11-18",
    label: "11 - 18",
    title: "Teen",
    icon: "🎒",
    note: "Trendy and flexible fit recommendations.",
  },
  {
    value: "19-29",
    label: "19 - 29",
    title: "Young Adult",
    icon: "✨",
    note: "Style-forward choices with smart fit matching.",
  },
  {
    value: "30-45",
    label: "30 - 45",
    title: "Adult",
    icon: "👔",
    note: "Balanced comfort, occasion and styling fit.",
  },
  {
    value: "46-60",
    label: "46 - 60",
    title: "Mature Adult",
    icon: "🌿",
    note: "Comfort-aware and refined recommendations.",
  },
  {
    value: "60+",
    label: "60+",
    title: "Senior",
    icon: "🕊️",
    note: "Ease, comfort and relaxed fit priority.",
  },
];

const GENDER_OPTIONS = [
  {
    value: "Male",
    title: "Male",
    icon: "👨",
    note: "Recommended sizing and silhouettes tuned for male fits.",
    gradient:
      "linear-gradient(135deg, rgba(124,92,255,0.95), rgba(0,212,255,0.85))",
  },
  {
    value: "Female",
    title: "Female",
    icon: "👩",
    note: "Recommended sizing and silhouettes tuned for female fits.",
    gradient:
      "linear-gradient(135deg, rgba(255,122,162,0.95), rgba(255,170,91,0.85))",
  },
];

export default function BasicProfilePage() {
  const nav = useNavigate();
  const { ageRange, gender, patch } = useFlowStore();

  const [error, setError] = useState("");

  const selectedAge = useMemo(
    () => AGE_OPTIONS.find((item) => item.value === ageRange),
    [ageRange]
  );

  const selectedGender = useMemo(
    () => GENDER_OPTIONS.find((item) => item.value === gender),
    [gender]
  );

  function selectAge(value) {
    setError("");
    patch({
      ageRange: value,
    });
  }

  function selectGender(value) {
    setError("");
    patch({
      gender: value,
    });
  }

  function continueNext() {
    if (!ageRange) {
      setError("Please select an age range to continue.");
      return;
    }

    if (!gender) {
      setError("Please select gender to continue.");
      return;
    }

    nav("/size-body");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes basicProfileFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes basicProfilePulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 900px) {
            .basic-profile-header {
              grid-template-columns: 1fr !important;
            }

            .basic-profile-title {
              font-size: 36px !important;
            }

            .basic-profile-grid {
              grid-template-columns: 1fr !important;
            }

            .basic-profile-age-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .basic-profile-footer {
              flex-direction: column !important;
            }

            .basic-profile-footer button {
              width: 100% !important;
            }
          }

          @media (max-width: 560px) {
            .basic-profile-age-grid {
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

            <aside style={styles.profilePreview}>
              <div style={styles.previewIcon}>
                {selectedGender?.icon || selectedAge?.icon || "🧵"}
              </div>

              <div>
                <p style={styles.previewLabel}>Profile preview</p>
                <h2 style={styles.previewTitle}>
                  {selectedAge?.label || "Age"} · {selectedGender?.title || "Gender"}
                </h2>
                <p style={styles.previewText}>
                  {selectedAge?.note ||
                    "Choose age and gender to unlock better recommendations."}
                </p>
              </div>

              <div style={styles.previewLine} />

              <div style={styles.previewChips}>
                <span style={styles.previewChip}>
                  {ageRange ? `Age ${ageRange}` : "Age pending"}
                </span>
                <span style={styles.previewChip}>
                  {gender || "Gender pending"}
                </span>
              </div>
            </aside>
          </section>

          <section className="basic-profile-grid" style={styles.mainGrid}>
            <div style={styles.block}>
              <div style={styles.blockHeader}>
                <span style={styles.blockIcon}>🎯</span>

                <div>
                  <h2 style={styles.blockTitle}>What is your age?</h2>
                  <p style={styles.blockText}>
                    Choose the closest age range. This keeps the next size and
                    outfit questions more relevant.
                  </p>
                </div>
              </div>

              <div className="basic-profile-age-grid" style={styles.ageGrid}>
                {AGE_OPTIONS.map((option) => {
                  const selected = ageRange === option.value;

                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectAge(option.value)}
                      style={{
                        ...styles.ageCard,
                        ...(selected ? styles.ageCardSelected : {}),
                      }}
                    >
                      <span style={styles.ageIcon}>{option.icon}</span>

                      <span style={styles.ageCopy}>
                        <strong>{option.label}</strong>
                        <small>{option.title}</small>
                      </span>

                      <span
                        style={{
                          ...styles.checkCircle,
                          ...(selected ? styles.checkCircleSelected : {}),
                        }}
                      >
                        {selected ? "✓" : ""}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div style={styles.block}>
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
                  const selected = gender === option.value;

                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      whileHover={{ y: -6, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectGender(option.value)}
                      style={{
                        ...styles.genderCard,
                        ...(selected ? styles.genderCardSelected : {}),
                      }}
                    >
                      <div
                        style={{
                          ...styles.genderVisual,
                          background: option.gradient,
                        }}
                      >
                        <span style={styles.genderIcon}>{option.icon}</span>
                      </div>

                      <div style={styles.genderBody}>
                        <div style={styles.genderTitleRow}>
                          <h3 style={styles.genderTitle}>{option.title}</h3>

                          <span
                            style={{
                              ...styles.radioCircle,
                              ...(selected ? styles.radioCircleSelected : {}),
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

              <div style={styles.tipCard}>
                <span style={styles.tipIcon}>💡</span>

                <p style={styles.tipText}>
                  Later, the AI Fit Scanner can refine this with height, body
                  proportions, and recommended size confidence.
                </p>
              </div>
            </div>
          </section>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <section style={styles.selectionSummary}>
            <div style={styles.summaryIcon}>🪄</div>

            <div>
              <p style={styles.summaryLabel}>Selected basic profile</p>
              <strong style={styles.summaryText}>
                {ageRange || gender
                  ? `${ageRange || "Age not selected"} · ${
                      gender || "Gender not selected"
                    }`
                  : "No basic profile selected yet"}
              </strong>
            </div>
          </section>

          <div className="basic-profile-footer" style={styles.footer}>
            <button
              type="button"
              className="btn ghost"
              onClick={() => nav("/intent")}
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
              Continue to Size & Body
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
    animation: "basicProfilePulse 2s ease-in-out infinite",
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
  profilePreview: {
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
    animation: "basicProfileFloat 3.2s ease-in-out infinite",
  },
  previewLabel: {
    margin: "0 0 4px",
    fontSize: "12px",
    color: "rgba(255,255,255,0.62)",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  previewTitle: {
    margin: 0,
    fontSize: "20px",
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
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.25fr 0.75fr",
    gap: "18px",
  },
  block: {
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
  ageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },
  ageCard: {
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
  ageCardSelected: {
    border: "1px solid rgba(0,212,255,0.8)",
    background: "rgba(0,212,255,0.10)",
    boxShadow: "0 14px 30px rgba(0,212,255,0.10)",
  },
  ageIcon: {
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
  ageCopy: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  checkCircle: {
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
  checkCircleSelected: {
    background: "#00d4ff",
    color: "#061224",
    borderColor: "#00d4ff",
  },
  genderGrid: {
    display: "grid",
    gap: "14px",
  },
  genderCard: {
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
  genderCardSelected: {
    border: "2px solid rgba(0,212,255,0.95)",
    boxShadow: "0 22px 50px rgba(0,212,255,0.14)",
  },
  genderVisual: {
    height: "86px",
    display: "grid",
    placeItems: "center",
  },
  genderIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "20px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.22)",
    border: "1px solid rgba(255,255,255,0.24)",
    fontSize: "30px",
    boxShadow: "0 14px 28px rgba(0,0,0,0.22)",
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
    fontSize: "20px",
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
  genderNote: {
    margin: "8px 0 0",
    color: "rgba(255,255,255,0.70)",
    lineHeight: 1.5,
    fontSize: "14px",
  },
  tipCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "11px",
    marginTop: "14px",
    padding: "13px",
    borderRadius: "18px",
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  tipIcon: {
    flex: "0 0 auto",
  },
  tipText: {
    margin: 0,
    color: "rgba(255,255,255,0.74)",
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
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.9), rgba(0,212,255,0.8))",
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
  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "22px",
  },
  footerButton: {
    minWidth: "190px",
  },
};
