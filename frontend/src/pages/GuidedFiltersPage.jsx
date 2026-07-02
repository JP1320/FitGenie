import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const STYLE_OPTIONS = [
  {
    value: "Ethnic",
    title: "Ethnic",
    subtitle: "Traditional Indian looks for festive and cultural moments.",
    icon: "🪔",
    tags: ["Kurta", "Saree", "Festive"],
    gradient: "linear-gradient(135deg, #fef3c7, #ffedd5, #ffe4e6)",
    accent: "#f97316",
  },
  {
    value: "Western",
    title: "Western",
    subtitle: "Modern outfits, dresses, tops, co-ords and sharp casual looks.",
    icon: "👗",
    tags: ["Dresses", "Tops", "Co-ords"],
    gradient: "linear-gradient(135deg, #fce7f3, #ede9fe, #dbeafe)",
    accent: "#db2777",
  },
  {
    value: "Indo-Western",
    title: "Indo-Western",
    subtitle: "Fusion looks that mix traditional details with modern styling.",
    icon: "✨",
    tags: ["Fusion", "Jackets", "Occasion"],
    gradient: "linear-gradient(135deg, #dcfce7, #cffafe, #e0e7ff)",
    accent: "#059669",
  },
  {
    value: "Casual",
    title: "Casual",
    subtitle: "Easy daily wear focused on comfort, movement and simplicity.",
    icon: "👕",
    tags: ["Daily", "Comfort", "Cotton"],
    gradient: "linear-gradient(135deg, #dbeafe, #e0e7ff, #ede9fe)",
    accent: "#4f46e5",
  },
  {
    value: "Formal",
    title: "Formal",
    subtitle: "Clean, polished and professional outfits for work or meetings.",
    icon: "👔",
    tags: ["Office", "Sharp", "Tailored"],
    gradient: "linear-gradient(135deg, #e0f2fe, #ecfeff, #f0fdfa)",
    accent: "#0284c7",
  },
  {
    value: "Sportswear",
    title: "Sportswear",
    subtitle: "Flexible, lightweight and movement-friendly active looks.",
    icon: "🏃",
    tags: ["Active", "Stretch", "Light"],
    gradient: "linear-gradient(135deg, #ecfccb, #dcfce7, #cffafe)",
    accent: "#65a30d",
  },
];

const BUDGET_OPTIONS = [
  {
    value: "Under ₹500",
    title: "Under ₹500",
    subtitle: "Budget-friendly picks",
    icon: "💸",
  },
  {
    value: "₹500-₹1,000",
    title: "₹500 - ₹1,000",
    subtitle: "Everyday value range",
    icon: "🛍️",
  },
  {
    value: "₹1,000-₹2,000",
    title: "₹1,000 - ₹2,000",
    subtitle: "Balanced quality range",
    icon: "✨",
  },
  {
    value: "₹2,000-₹5,000",
    title: "₹2,000 - ₹5,000",
    subtitle: "Premium styling range",
    icon: "💎",
  },
  {
    value: "Above ₹5,000",
    title: "Above ₹5,000",
    subtitle: "Designer-ready range",
    icon: "👑",
  },
];

const FABRIC_OPTIONS = [
  {
    value: "Cotton",
    icon: "☁️",
    note: "Soft, breathable and daily-wear friendly.",
  },
  {
    value: "Linen",
    icon: "🌿",
    note: "Light, airy and elegant for warm weather.",
  },
  {
    value: "Silk",
    icon: "✨",
    note: "Premium, festive and occasion-ready.",
  },
  {
    value: "Wool",
    icon: "🧶",
    note: "Warm and structured for cooler weather.",
  },
  {
    value: "Denim",
    icon: "👖",
    note: "Casual, durable and easy to style.",
  },
  {
    value: "Polyester / Blends",
    icon: "🧵",
    note: "Flexible, affordable and easy maintenance.",
  },
];

const SLEEVE_OPTIONS = [
  "Sleeveless",
  "Short Sleeve",
  "Half Sleeve",
  "Three-Quarter",
  "Full Sleeve",
];

const LENGTH_OPTIONS = [
  "Crop",
  "Waist Length",
  "Hip Length",
  "Knee Length",
  "Ankle Length",
  "Full Length",
];

const FIT_OPTIONS = [
  {
    value: "Slim",
    icon: "📐",
    note: "Closer body shape and sharper silhouette.",
  },
  {
    value: "Regular",
    icon: "🧍",
    note: "Balanced comfort and structure.",
  },
  {
    value: "Oversized",
    icon: "☁️",
    note: "Relaxed, roomy and trend-forward.",
  },
];

function getCompletionScore({ style, budget, fabric, fitDetails }) {
  let score = 0;

  if (style) score += 30;
  if (budget) score += 25;
  if (Array.isArray(fabric) && fabric.length > 0) score += 15;
  if (fitDetails?.sleeve) score += 10;
  if (fitDetails?.length) score += 10;
  if (fitDetails?.fit) score += 10;

  return score;
}

export default function GuidedFiltersPage() {
  const nav = useNavigate();

  const {
    style,
    budget,
    fabric,
    fitDetails,
    preferences,
    patch,
  } = useFlowStore();

  const selectedStyleValue = style || preferences?.style || "";
  const selectedBudgetValue = budget || preferences?.budget || "";
  const selectedFabric = Array.isArray(fabric)
    ? fabric
    : Array.isArray(preferences?.fabric)
    ? preferences.fabric
    : [];
  const selectedFitDetails = fitDetails || preferences?.fitDetails || {};

  const [activeSection, setActiveSection] = useState("style");
  const [error, setError] = useState("");

  const selectedStyle = useMemo(
    () => STYLE_OPTIONS.find((item) => item.value === selectedStyleValue),
    [selectedStyleValue]
  );

  const selectedBudget = useMemo(
    () => BUDGET_OPTIONS.find((item) => item.value === selectedBudgetValue),
    [selectedBudgetValue]
  );

  const completionScore = getCompletionScore({
    style: selectedStyleValue,
    budget: selectedBudgetValue,
    fabric: selectedFabric,
    fitDetails: selectedFitDetails,
  });

  function selectStyle(value) {
    setError("");
    patch({
      style: value,
    });
  }

  function selectBudget(value) {
    setError("");
    patch({
      budget: value,
    });
  }

  function toggleFabric(item) {
    setError("");

    const nextFabric = selectedFabric.includes(item)
      ? selectedFabric.filter((value) => value !== item)
      : [...selectedFabric, item];

    patch({
      fabric: nextFabric,
    });
  }

  function updateFitDetails(key, value) {
    setError("");

    patch({
      fitDetails: {
        ...selectedFitDetails,
        [key]: value,
      },
    });
  }

  function clearOptionalFilters() {
    patch({
      fabric: [],
      fitDetails: {},
    });
  }

  function analyzeBestMatch() {
    if (!selectedStyleValue) {
      setError("Please choose a style before analyzing the best match.");
      setActiveSection("style");
      return;
    }

    if (!selectedBudgetValue) {
      setError("Please choose a budget before analyzing the best match.");
      setActiveSection("budget");
      return;
    }

    nav("/recommendations");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes filterSoftFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes filterSoftPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 1080px) {
            .filters-header {
              grid-template-columns: 1fr !important;
            }

            .filters-title {
              font-size: 38px !important;
            }

            .filters-layout {
              grid-template-columns: 1fr !important;
            }

            .filters-style-grid,
            .filters-budget-grid,
            .filters-fabric-grid,
            .filters-fit-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .filters-footer {
              flex-direction: column !important;
            }

            .filters-footer button {
              width: 100% !important;
            }
          }

          @media (max-width: 640px) {
            .filters-style-grid,
            .filters-budget-grid,
            .filters-fabric-grid,
            .filters-fit-grid {
              grid-template-columns: 1fr !important;
            }

            .filters-tab-row {
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
          <section className="filters-header" style={styles.header}>
            <div>
              <div style={styles.stepPill}>
                <span style={styles.stepDot} />
                Step 4 of 12 · Guided Visual Filters
              </div>

              <h1 className="filters-title" style={styles.title}>
                Choose the look you want.
              </h1>

              <p style={styles.subtitle}>
                Pick your style and budget first. Fabric and fit details are
                optional, but they help FitGenie create sharper recommendations
                and a better Fit Card for the expert.
              </p>
            </div>

            <aside style={styles.previewCard}>
              <div style={styles.previewTop}>
                <span style={styles.previewIcon}>
                  {selectedStyle?.icon || "🎨"}
                </span>

                <div>
                  <p style={styles.previewLabel}>Style readiness</p>
                  <h2 style={styles.previewScore}>{completionScore}%</h2>
                </div>
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${completionScore}%`,
                  }}
                />
              </div>

              <p style={styles.previewText}>
                {completionScore < 55
                  ? "Choose style and budget to continue."
                  : "Great. Your look preferences are becoming clear."}
              </p>

              <div style={styles.previewTags}>
                <span style={styles.previewTag}>
                  {selectedStyle?.title || "Style pending"}
                </span>
                <span style={styles.previewTag}>
                  {selectedBudget?.title || "Budget pending"}
                </span>
              </div>
            </aside>
          </section>

          <section className="filters-layout" style={styles.layout}>
            <aside style={styles.sidePanel}>
              <div style={styles.sideTop}>
                <span style={styles.sideIcon}>🧞</span>

                <div>
                  <p style={styles.sideLabel}>Preference summary</p>
                  <h2 style={styles.sideTitle}>
                    {selectedStyle?.title || "Pending"}
                  </h2>
                </div>
              </div>

              <div style={styles.summaryList}>
                <div style={styles.summaryItem}>
                  <span>Style</span>
                  <strong>{selectedStyle?.title || "Required"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Budget</span>
                  <strong>{selectedBudget?.title || "Required"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Fabric</span>
                  <strong>
                    {selectedFabric.length > 0
                      ? selectedFabric.join(", ")
                      : "Optional"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Sleeve</span>
                  <strong>{selectedFitDetails.sleeve || "Optional"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Length</span>
                  <strong>{selectedFitDetails.length || "Optional"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Fit</span>
                  <strong>{selectedFitDetails.fit || "Optional"}</strong>
                </div>
              </div>

              <div style={styles.tipCard}>
                <span style={styles.tipBadge}>Next</span>
                <h3 style={styles.tipTitle}>AI Recommendation Engine</h3>
                <p style={styles.tipText}>
                  FitGenie will use these choices to suggest outfits, fit type,
                  size confidence, and “why this suits you.”
                </p>
              </div>
            </aside>

            <main style={styles.mainPanel}>
              <div className="filters-tab-row" style={styles.tabRow}>
                {[
                  ["style", "🎨 Style"],
                  ["budget", "💰 Budget"],
                  ["fabric", "🧵 Fabric"],
                  ["fit", "📐 Fit Details"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveSection(key)}
                    style={{
                      ...styles.tabButton,
                      ...(activeSection === key ? styles.tabButtonActive : {}),
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeSection === "style" && (
                  <motion.section
                    key="style"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    style={styles.block}
                  >
                    <div style={styles.blockHeader}>
                      <span style={styles.blockIcon}>🎨</span>

                      <div>
                        <h2 style={styles.blockTitle}>Choose your style</h2>
                        <p style={styles.blockText}>
                          Select the main look you want FitGenie to prioritize.
                        </p>
                      </div>
                    </div>

                    <div className="filters-style-grid" style={styles.styleGrid}>
                      {STYLE_OPTIONS.map((option) => {
                        const selected = selectedStyleValue === option.value;

                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            whileHover={{ y: -5, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => selectStyle(option.value)}
                            style={{
                              ...styles.styleCard,
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
                                <h3 style={styles.cardTitle}>{option.title}</h3>

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

                              <p style={styles.cardText}>{option.subtitle}</p>

                              <div style={styles.cardTags}>
                                {option.tags.map((tag) => (
                                  <span key={tag} style={styles.cardTag}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.section>
                )}

                {activeSection === "budget" && (
                  <motion.section
                    key="budget"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    style={styles.block}
                  >
                    <div style={styles.blockHeader}>
                      <span style={styles.blockIcon}>💰</span>

                      <div>
                        <h2 style={styles.blockTitle}>Choose your budget</h2>
                        <p style={styles.blockText}>
                          This helps us suggest outfits and experts within your
                          preferred spending range.
                        </p>
                      </div>
                    </div>

                    <div className="filters-budget-grid" style={styles.budgetGrid}>
                      {BUDGET_OPTIONS.map((option) => {
                        const selected = selectedBudgetValue === option.value;

                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => selectBudget(option.value)}
                            style={{
                              ...styles.budgetCard,
                              ...(selected ? styles.budgetCardSelected : {}),
                            }}
                          >
                            <span style={styles.budgetIcon}>{option.icon}</span>

                            <div>
                              <h3 style={styles.budgetTitle}>{option.title}</h3>
                              <p style={styles.budgetText}>{option.subtitle}</p>
                            </div>

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

                {activeSection === "fabric" && (
                  <motion.section
                    key="fabric"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    style={styles.block}
                  >
                    <div style={styles.blockHeader}>
                      <span style={styles.blockIcon}>🧵</span>

                      <div>
                        <h2 style={styles.blockTitle}>
                          Fabric Preference{" "}
                          <span style={styles.optionalText}>(optional)</span>
                        </h2>
                        <p style={styles.blockText}>
                          Select one or more fabrics you like.
                        </p>
                      </div>
                    </div>

                    <div className="filters-fabric-grid" style={styles.fabricGrid}>
                      {FABRIC_OPTIONS.map((option) => {
                        const selected = selectedFabric.includes(option.value);

                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleFabric(option.value)}
                            style={{
                              ...styles.fabricCard,
                              ...(selected ? styles.fabricCardSelected : {}),
                            }}
                          >
                            <span style={styles.fabricIcon}>{option.icon}</span>

                            <div>
                              <h3 style={styles.fabricTitle}>{option.value}</h3>
                              <p style={styles.fabricText}>{option.note}</p>
                            </div>

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

                {activeSection === "fit" && (
                  <motion.section
                    key="fit"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    style={styles.block}
                  >
                    <div style={styles.blockHeader}>
                      <span style={styles.blockIcon}>📐</span>

                      <div>
                        <h2 style={styles.blockTitle}>
                          Fit Details{" "}
                          <span style={styles.optionalText}>(optional)</span>
                        </h2>
                        <p style={styles.blockText}>
                          Add sleeve, length and fit preference for a more
                          specific recommendation.
                        </p>
                      </div>
                    </div>

                    <div style={styles.formGrid}>
                      <div style={styles.inputBlock}>
                        <label style={styles.inputLabel}>Sleeve type</label>

                        <select
                          value={selectedFitDetails.sleeve || ""}
                          onChange={(event) =>
                            updateFitDetails("sleeve", event.target.value)
                          }
                          style={styles.input}
                        >
                          <option value="">Select sleeve type</option>
                          {SLEEVE_OPTIONS.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={styles.inputBlock}>
                        <label style={styles.inputLabel}>Length</label>

                        <select
                          value={selectedFitDetails.length || ""}
                          onChange={(event) =>
                            updateFitDetails("length", event.target.value)
                          }
                          style={styles.input}
                        >
                          <option value="">Select length</option>
                          {LENGTH_OPTIONS.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="filters-fit-grid" style={styles.fitGrid}>
                      {FIT_OPTIONS.map((option) => {
                        const selected = selectedFitDetails.fit === option.value;

                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateFitDetails("fit", option.value)}
                            style={{
                              ...styles.fitCard,
                              ...(selected ? styles.fitCardSelected : {}),
                            }}
                          >
                            <span style={styles.fitIcon}>{option.icon}</span>

                            <div>
                              <h3 style={styles.fitTitle}>{option.value}</h3>
                              <p style={styles.fitText}>{option.note}</p>
                            </div>

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

                    <button
                      type="button"
                      onClick={clearOptionalFilters}
                      style={styles.clearButton}
                    >
                      Clear optional filters
                    </button>
                  </motion.section>
                )}
              </AnimatePresence>
            </main>
          </section>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <section style={styles.finalSummary}>
            <div style={styles.finalIcon}>{selectedStyle?.icon || "🪄"}</div>

            <div>
              <p style={styles.finalLabel}>Selected look summary</p>
              <strong style={styles.finalText}>
                {selectedStyleValue || selectedBudgetValue
                  ? `${selectedStyleValue || "Style pending"} · ${
                      selectedBudgetValue || "Budget pending"
                    }`
                  : "No style or budget selected yet"}
              </strong>
            </div>
          </section>

          <div className="filters-footer" style={styles.footer}>
            <button
              type="button"
              onClick={() => nav("/size-body")}
              style={styles.backButton}
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={analyzeBestMatch}
              style={styles.nextButton}
            >
              Analyze Best Match →
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
    animation: "filterSoftPulse 2s ease-in-out infinite",
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
    animation: "filterSoftFloat 3.2s ease-in-out infinite",
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
    gridTemplateColumns: "330px minmax(0, 1fr)",
    gap: "18px",
    alignItems: "start",
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
  tipCard: {
    marginTop: "14px",
    padding: "14px",
    borderRadius: "20px",
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
  },
  tipBadge: {
    display: "inline-flex",
    marginBottom: "8px",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#0891b2",
    fontSize: "11px",
    fontWeight: 900,
  },
  tipTitle: {
    margin: "0 0 8px",
    color: "#111827",
    fontSize: "18px",
  },
  tipText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.5,
    fontSize: "13px",
    fontWeight: 700,
  },
  mainPanel: {
    display: "grid",
    gap: "16px",
  },
  tabRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "10px",
  },
  tabButton: {
    border: "1px solid #e2e8f0",
    borderRadius: "999px",
    padding: "13px 12px",
    background: "#ffffff",
    color: "#475569",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.06)",
  },
  tabButtonActive: {
    border: "1px solid rgba(109, 93, 252, 0.58)",
    background: "#f5f3ff",
    color: "#4f46e5",
    boxShadow: "0 14px 30px rgba(109, 93, 252, 0.12)",
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
  styleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "13px",
  },
  styleCard: {
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
  cardVisual: {
    height: "96px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px",
  },
  cardIcon: {
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
  cardBadge: {
    padding: "8px 11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(255,255,255,0.72)",
    fontSize: "12px",
    fontWeight: 900,
  },
  cardBody: {
    padding: "15px",
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
  },
  cardText: {
    minHeight: "48px",
    margin: "8px 0 12px",
    color: "#475569",
    lineHeight: 1.45,
    fontSize: "13px",
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
  budgetGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  budgetCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: "15px",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "48px minmax(0, 1fr) 28px",
    alignItems: "center",
    gap: "13px",
    textAlign: "left",
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.06)",
  },
  budgetCardSelected: {
    border: "1px solid rgba(109, 93, 252, 0.58)",
    background: "#f5f3ff",
    boxShadow: "0 14px 30px rgba(109, 93, 252, 0.12)",
  },
  budgetIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "17px",
    display: "grid",
    placeItems: "center",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontSize: "24px",
  },
  budgetTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "18px",
  },
  budgetText: {
    margin: "5px 0 0",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 600,
  },
  fabricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },
  fabricCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: "15px",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "48px minmax(0, 1fr) 28px",
    alignItems: "center",
    gap: "13px",
    textAlign: "left",
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.06)",
  },
  fabricCardSelected: {
    border: "1px solid rgba(109, 93, 252, 0.58)",
    background: "#f5f3ff",
    boxShadow: "0 14px 30px rgba(109, 93, 252, 0.12)",
  },
  fabricIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "17px",
    display: "grid",
    placeItems: "center",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontSize: "24px",
  },
  fabricTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "18px",
  },
  fabricText: {
    margin: "5px 0 0",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  smallCheck: {
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
  },
  smallCheckSelected: {
    background: "#6d5dfc",
    borderColor: "#6d5dfc",
    color: "#ffffff",
  },
  optionalText: {
    color: "#64748b",
    fontSize: "15px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "14px",
  },
  inputBlock: {
    display: "grid",
    gap: "8px",
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
  fitGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
  },
  fitCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: "15px",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "48px minmax(0, 1fr) 28px",
    alignItems: "center",
    gap: "13px",
    textAlign: "left",
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.06)",
  },
  fitCardSelected: {
    border: "1px solid rgba(109, 93, 252, 0.58)",
    background: "#f5f3ff",
    boxShadow: "0 14px 30px rgba(109, 93, 252, 0.12)",
  },
  fitIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "17px",
    display: "grid",
    placeItems: "center",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontSize: "24px",
  },
  fitTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "18px",
  },
  fitText: {
    margin: "5px 0 0",
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.4,
    fontWeight: 600,
  },
  clearButton: {
    marginTop: "14px",
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "12px 16px",
    background: "#ffffff",
    color: "#475569",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.06)",
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
