import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const STYLE_OPTIONS = [
  {
    value: "Ethnic",
    title: "Ethnic",
    subtitle: "Traditional Indian looks for festivals, family events, and occasions.",
    icon: "🪔",
    gradient:
      "linear-gradient(135deg, rgba(255,122,162,0.95), rgba(255,170,91,0.84))",
    tags: ["Kurta", "Saree", "Festive"],
  },
  {
    value: "Western",
    title: "Western",
    subtitle: "Modern outfits with clean cuts, trendy silhouettes, and stylish layering.",
    icon: "👗",
    gradient:
      "linear-gradient(135deg, rgba(124,92,255,0.95), rgba(0,212,255,0.82))",
    tags: ["Dresses", "Co-ords", "Tops"],
  },
  {
    value: "Indo-Western",
    title: "Indo-Western",
    subtitle: "Fusion looks combining ethnic detailing with modern styling.",
    icon: "✨",
    gradient:
      "linear-gradient(135deg, rgba(174,92,255,0.95), rgba(255,122,236,0.82))",
    tags: ["Fusion", "Jackets", "Occasion"],
  },
  {
    value: "Casual",
    title: "Casual",
    subtitle: "Easy daily wear focused on comfort, movement, and simple styling.",
    icon: "👕",
    gradient:
      "linear-gradient(135deg, rgba(30,215,166,0.95), rgba(0,212,255,0.82))",
    tags: ["Daily", "Comfort", "Cotton"],
  },
  {
    value: "Formal",
    title: "Formal",
    subtitle: "Sharp and polished looks for office, meetings, events, and interviews.",
    icon: "👔",
    gradient:
      "linear-gradient(135deg, rgba(80,111,255,0.95), rgba(124,92,255,0.82))",
    tags: ["Office", "Tailored", "Sharp"],
  },
  {
    value: "Sportswear",
    title: "Sportswear",
    subtitle: "Flexible outfits for active use, travel, gym, and casual movement.",
    icon: "🏃",
    gradient:
      "linear-gradient(135deg, rgba(255,191,71,0.95), rgba(30,215,166,0.82))",
    tags: ["Active", "Stretch", "Lightweight"],
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
    title: "₹500 – ₹1,000",
    subtitle: "Affordable essentials",
    icon: "🛍️",
  },
  {
    value: "₹1,000-₹2,000",
    title: "₹1,000 – ₹2,000",
    subtitle: "Good quality range",
    icon: "⭐",
  },
  {
    value: "₹2,000-₹5,000",
    title: "₹2,000 – ₹5,000",
    subtitle: "Premium styling range",
    icon: "💎",
  },
  {
    value: "Above ₹5,000",
    title: "Above ₹5,000",
    subtitle: "Designer or custom premium",
    icon: "👑",
  },
];

const FABRIC_OPTIONS = [
  {
    value: "Cotton",
    icon: "🌿",
    note: "Breathable everyday comfort",
  },
  {
    value: "Linen",
    icon: "🍃",
    note: "Light, airy and elegant",
  },
  {
    value: "Silk",
    icon: "✨",
    note: "Premium festive finish",
  },
  {
    value: "Wool",
    icon: "🧶",
    note: "Warm structured comfort",
  },
  {
    value: "Denim",
    icon: "👖",
    note: "Durable casual styling",
  },
  {
    value: "Polyester / Blends",
    icon: "⚡",
    note: "Easy-care flexible wear",
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
    title: "Slim",
    icon: "📐",
    note: "Closer to body with a sharper silhouette.",
  },
  {
    value: "Regular",
    title: "Regular",
    icon: "🧍",
    note: "Balanced fit with comfortable movement.",
  },
  {
    value: "Oversized",
    title: "Oversized",
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

  return Math.min(score, 100);
}

export default function GuidedFiltersPage() {
  const nav = useNavigate();
  const { style, budget, fabric = [], fitDetails = {}, patch } = useFlowStore();

  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("style");

  const selectedStyle = useMemo(
    () => STYLE_OPTIONS.find((item) => item.value === style),
    [style]
  );

  const selectedBudget = useMemo(
    () => BUDGET_OPTIONS.find((item) => item.value === budget),
    [budget]
  );

  const selectedFit = useMemo(
    () => FIT_OPTIONS.find((item) => item.value === fitDetails?.fit),
    [fitDetails?.fit]
  );

  const completionScore = getCompletionScore({
    style,
    budget,
    fabric,
    fitDetails,
  });

  function selectStyle(value) {
    setError("");
    patch({ style: value });
  }

  function selectBudget(value) {
    setError("");
    patch({ budget: value });
  }

  function toggleFabric(item) {
    setError("");

    const currentFabric = Array.isArray(fabric) ? fabric : [];
    const nextFabric = currentFabric.includes(item)
      ? currentFabric.filter((selected) => selected !== item)
      : [...currentFabric, item];

    patch({ fabric: nextFabric });
  }

  function updateFitDetails(key, value) {
    setError("");

    patch({
      fitDetails: {
        ...fitDetails,
        [key]: value,
      },
    });
  }

  function clearOptionalFilters() {
    patch({
      fabric: [],
      fitDetails: {
        sleeve: "",
        length: "",
        fit: "",
      },
    });
  }

  function analyzeBestMatch() {
    if (!style) {
      setError("Please choose a style before analyzing the best match.");
      setActiveSection("style");
      return;
    }

    if (!budget) {
      setError("Please choose a budget range before analyzing the best match.");
      setActiveSection("budget");
      return;
    }

    nav("/recommendations");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes guidedFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes guidedPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 1000px) {
            .guided-header {
              grid-template-columns: 1fr !important;
            }

            .guided-title {
              font-size: 36px !important;
            }

            .guided-layout {
              grid-template-columns: 1fr !important;
            }

            .guided-style-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .guided-footer {
              flex-direction: column !important;
            }

            .guided-footer button {
              width: 100% !important;
            }
          }

          @media (max-width: 640px) {
            .guided-style-grid {
              grid-template-columns: 1fr !important;
            }

            .guided-budget-grid,
            .guided-fabric-grid,
            .guided-fit-grid,
            .guided-select-grid {
              grid-template-columns: 1fr !important;
            }

            .guided-section-tabs {
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
          <section className="guided-header" style={styles.header}>
            <div>
              <div style={styles.stepPill}>
                <span style={styles.stepDot} />
                Step 4 of 12 · Guided Visual Filters
              </div>

              <h1 className="guided-title" style={styles.title}>
                Choose the look you want.
              </h1>

              <p style={styles.subtitle}>
                Instead of raw filters, FitGenie uses guided visual choices to
                understand your style, budget, fabric comfort, and fit details.
              </p>
            </div>

            <aside style={styles.previewCard}>
              <div style={styles.previewIcon}>
                {selectedStyle?.icon || selectedFit?.icon || "🪄"}
              </div>

              <div>
                <p style={styles.previewLabel}>Recommendation readiness</p>
                <h2 style={styles.previewScore}>{completionScore}%</h2>
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
                  ? "Choose style and budget to unlock strong recommendations."
                  : completionScore < 85
                  ? "Good progress. Optional fabric and fit choices can improve accuracy."
                  : "Great. Your preferences are ready for outfit analysis."}
              </p>
            </aside>
          </section>

          <section className="guided-layout" style={styles.layout}>
            <aside style={styles.sidePanel}>
              <div style={styles.sideTop}>
                <span style={styles.sideIcon}>🧵</span>

                <div>
                  <p style={styles.sideLabel}>Preference summary</p>
                  <h2 style={styles.sideTitle}>
                    {selectedStyle?.title || "Style pending"}
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
                    {fabric.length > 0 ? `${fabric.length} selected` : "Optional"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Fit</span>
                  <strong>{fitDetails?.fit || "Optional"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Sleeve</span>
                  <strong>{fitDetails?.sleeve || "Optional"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Length</span>
                  <strong>{fitDetails?.length || "Optional"}</strong>
                </div>
              </div>

              <div style={styles.selectedChips}>
                {style ? <span style={styles.selectedChip}>{style}</span> : null}
                {budget ? <span style={styles.selectedChip}>{budget}</span> : null}
                {fabric.map((item) => (
                  <span key={item} style={styles.selectedChip}>
                    {item}
                  </span>
                ))}
                {fitDetails?.fit ? (
                  <span style={styles.selectedChip}>{fitDetails.fit} Fit</span>
                ) : null}
              </div>

              <button
                type="button"
                className="btn ghost"
                onClick={clearOptionalFilters}
                style={styles.clearButton}
              >
                Clear optional filters
              </button>
            </aside>

            <div style={styles.mainPanel}>
              <div className="guided-section-tabs" style={styles.sectionTabs}>
                {[
                  { key: "style", label: "Style", icon: "🎨" },
                  { key: "budget", label: "Budget", icon: "💰" },
                  { key: "fabric", label: "Fabric", icon: "🧶" },
                  { key: "fit", label: "Fit Details", icon: "📏" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveSection(tab.key)}
                    style={{
                      ...styles.tabButton,
                      ...(activeSection === tab.key ? styles.tabButtonActive : {}),
                    }}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeSection === "style" ? (
                  <motion.section
                    key="style"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    style={styles.filterBlock}
                  >
                    <div style={styles.blockHeader}>
                      <span style={styles.blockIcon}>🎨</span>

                      <div>
                        <h2 style={styles.blockTitle}>
                          What style are you looking for?
                        </h2>
                        <p style={styles.blockText}>
                          Choose the closest style category. This is required
                          for outfit analysis.
                        </p>
                      </div>
                    </div>

                    <div className="guided-style-grid" style={styles.styleGrid}>
                      {STYLE_OPTIONS.map((option) => {
                        const selected = style === option.value;

                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            whileHover={{ y: -5, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => selectStyle(option.value)}
                            style={{
                              ...styles.styleCard,
                              ...(selected ? styles.styleCardSelected : {}),
                            }}
                          >
                            <div
                              style={{
                                ...styles.styleVisual,
                                background: option.gradient,
                              }}
                            >
                              <span style={styles.styleIcon}>{option.icon}</span>
                            </div>

                            <div style={styles.styleBody}>
                              <div style={styles.cardTitleRow}>
                                <h3 style={styles.cardTitle}>{option.title}</h3>

                                <span
                                  style={{
                                    ...styles.checkCircle,
                                    ...(selected
                                      ? styles.checkCircleSelected
                                      : {}),
                                  }}
                                >
                                  {selected ? "✓" : ""}
                                </span>
                              </div>

                              <p style={styles.cardText}>{option.subtitle}</p>

                              <div style={styles.tagRow}>
                                {option.tags.map((tag) => (
                                  <span key={tag} style={styles.miniTag}>
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
                ) : null}

                {activeSection === "budget" ? (
                  <motion.section
                    key="budget"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    style={styles.filterBlock}
                  >
                    <div style={styles.blockHeader}>
                      <span style={styles.blockIcon}>💰</span>

                      <div>
                        <h2 style={styles.blockTitle}>Budget Range</h2>
                        <p style={styles.blockText}>
                          Choose the budget range so recommendations stay
                          practical and relevant.
                        </p>
                      </div>
                    </div>

                    <div className="guided-budget-grid" style={styles.budgetGrid}>
                      {BUDGET_OPTIONS.map((option) => {
                        const selected = budget === option.value;

                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => selectBudget(option.value)}
                            style={{
                              ...styles.budgetCard,
                              ...(selected ? styles.budgetCardSelected : {}),
                            }}
                          >
                            <span style={styles.budgetIcon}>{option.icon}</span>

                            <span style={styles.budgetCopy}>
                              <strong>{option.title}</strong>
                              <small>{option.subtitle}</small>
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
                ) : null}

                {activeSection === "fabric" ? (
                  <motion.section
                    key="fabric"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    style={styles.filterBlock}
                  >
                    <div style={styles.blockHeader}>
                      <span style={styles.blockIcon}>🧶</span>

                      <div>
                        <h2 style={styles.blockTitle}>
                          Fabric Preference{" "}
                          <span style={styles.optionalText}>(optional)</span>
                        </h2>
                        <p style={styles.blockText}>
                          Select one or more fabrics. These help improve comfort
                          and season suitability.
                        </p>
                      </div>
                    </div>

                    <div className="guided-fabric-grid" style={styles.fabricGrid}>
                      {FABRIC_OPTIONS.map((option) => {
                        const selected = fabric.includes(option.value);

                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleFabric(option.value)}
                            style={{
                              ...styles.fabricCard,
                              ...(selected ? styles.fabricCardSelected : {}),
                            }}
                          >
                            <span style={styles.fabricIcon}>{option.icon}</span>

                            <span style={styles.fabricCopy}>
                              <strong>{option.value}</strong>
                              <small>{option.note}</small>
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
                ) : null}

                {activeSection === "fit" ? (
                  <motion.section
                    key="fit"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    style={styles.filterBlock}
                  >
                    <div style={styles.blockHeader}>
                      <span style={styles.blockIcon}>📏</span>

                      <div>
                        <h2 style={styles.blockTitle}>Fit Details</h2>
                        <p style={styles.blockText}>
                          Optional details for sleeve type, outfit length, and
                          fit preference.
                        </p>
                      </div>
                    </div>

                    <div className="guided-fit-grid" style={styles.fitGrid}>
                      {FIT_OPTIONS.map((option) => {
                        const selected = fitDetails?.fit === option.value;

                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateFitDetails("fit", option.value)}
                            style={{
                              ...styles.fitCard,
                              ...(selected ? styles.fitCardSelected : {}),
                            }}
                          >
                            <span style={styles.fitIcon}>{option.icon}</span>

                            <span style={styles.fitCopy}>
                              <strong>{option.title}</strong>
                              <small>{option.note}</small>
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

                    <div className="guided-select-grid" style={styles.selectGrid}>
                      <div style={styles.selectBlock}>
                        <label style={styles.inputLabel}>Sleeve type</label>

                        <select
                          value={fitDetails?.sleeve || ""}
                          onChange={(event) =>
                            updateFitDetails("sleeve", event.target.value)
                          }
                          style={styles.select}
                        >
                          <option value="">Select sleeve type</option>
                          {SLEEVE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={styles.selectBlock}>
                        <label style={styles.inputLabel}>Length</label>

                        <select
                          value={fitDetails?.length || ""}
                          onChange={(event) =>
                            updateFitDetails("length", event.target.value)
                          }
                          style={styles.select}
                        >
                          <option value="">Select length</option>
                          {LENGTH_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.section>
                ) : null}
              </AnimatePresence>
            </div>
          </section>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <section style={styles.finalSummary}>
            <div style={styles.finalIcon}>🧞</div>

            <div>
              <p style={styles.finalLabel}>Ready for AI analysis</p>
              <strong style={styles.finalText}>
                {style || budget || fabric.length > 0 || fitDetails?.fit
                  ? `${style || "Style pending"} · ${
                      budget || "Budget pending"
                    } · ${fitDetails?.fit || "Fit optional"}`
                  : "No filters selected yet"}
              </strong>
            </div>
          </section>

          <div className="guided-footer" style={styles.footer}>
            <button
              type="button"
              className="btn ghost"
              onClick={() => nav("/size-body")}
              style={styles.footerButton}
            >
              Back
            </button>

            <button
              type="button"
              className="btn"
              onClick={analyzeBestMatch}
              style={styles.footerButton}
            >
              Analyze Best Match
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
    animation: "guidedPulse 2s ease-in-out infinite",
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
    animation: "guidedFloat 3.2s ease-in-out infinite",
  },
  previewLabel: {
    margin: "0 0 4px",
    color: "rgba(255,255,255,0.62)",
    fontWeight: 900,
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  previewScore: {
    margin: 0,
    fontSize: "36px",
    lineHeight: 1,
  },
  progressTrack: {
    height: "11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    overflow: "hidden",
    margin: "14px 0",
  },
  progressFill: {
    height: "100%",
    borderRadius: "inherit",
    background: "linear-gradient(90deg,#7c5cff,#00d4ff)",
  },
  previewText: {
    margin: 0,
    color: "rgba(255,255,255,0.70)",
    lineHeight: 1.5,
    fontSize: "14px",
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
  selectedChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "14px",
  },
  selectedChip: {
    padding: "7px 9px",
    borderRadius: "999px",
    background: "rgba(0,212,255,0.12)",
    border: "1px solid rgba(0,212,255,0.25)",
    color: "#d9fbff",
    fontSize: "12px",
    fontWeight: 900,
  },
  clearButton: {
    width: "100%",
    marginTop: "16px",
  },
  mainPanel: {
    display: "grid",
    gap: "16px",
  },
  sectionTabs: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "10px",
  },
  tabButton: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "18px",
    padding: "13px",
    background: "rgba(255,255,255,0.07)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  tabButtonActive: {
    border: "1px solid rgba(0,212,255,0.85)",
    background: "rgba(0,212,255,0.12)",
    boxShadow: "0 12px 26px rgba(0,212,255,0.10)",
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
  optionalText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: "16px",
  },
  styleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "13px",
  },
  styleCard: {
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
  styleCardSelected: {
    border: "2px solid rgba(0,212,255,0.95)",
    boxShadow: "0 22px 50px rgba(0,212,255,0.14)",
  },
  styleVisual: {
    height: "86px",
    display: "grid",
    placeItems: "center",
  },
  styleIcon: {
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
  styleBody: {
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
    fontSize: "19px",
  },
  cardText: {
    margin: "8px 0 12px",
    color: "rgba(255,255,255,0.70)",
    lineHeight: 1.45,
    fontSize: "13px",
  },
  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  miniTag: {
    padding: "6px 8px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.72)",
    fontSize: "11px",
    fontWeight: 900,
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
  budgetGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  budgetCard: {
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
  budgetCardSelected: {
    border: "1px solid rgba(0,212,255,0.8)",
    background: "rgba(0,212,255,0.10)",
    boxShadow: "0 14px 30px rgba(0,212,255,0.10)",
  },
  budgetIcon: {
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
  budgetCopy: {
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
  fabricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  fabricCard: {
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
  fabricCardSelected: {
    border: "1px solid rgba(0,212,255,0.8)",
    background: "rgba(0,212,255,0.10)",
    boxShadow: "0 14px 30px rgba(0,212,255,0.10)",
  },
  fabricIcon: {
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
  fabricCopy: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  fitGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  fitCard: {
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
  fitCardSelected: {
    border: "1px solid rgba(0,212,255,0.8)",
    background: "rgba(0,212,255,0.10)",
    boxShadow: "0 14px 30px rgba(0,212,255,0.10)",
  },
  fitIcon: {
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
  fitCopy: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  selectGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  selectBlock: {
    display: "grid",
    gap: "8px",
  },
  inputLabel: {
    fontWeight: 900,
    fontSize: "14px",
  },
  select: {
    width: "100%",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "18px",
    padding: "14px",
    background: "rgba(255,255,255,0.08)",
    color: "inherit",
    outline: "none",
    fontWeight: 800,
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
    minWidth: "190px",
  },
};
