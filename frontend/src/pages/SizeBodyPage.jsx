import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const { scanner } = useFlowStore();
const aiFit = scanner?.aiFit;
const BODY_TYPES = [
  {
    value: "Rectangle",
    title: "Rectangle",
    subtitle: "Similar shoulder, waist and hip balance.",
    icon: "▭",
    note: "Works well with layered styling and structured fits.",
    gradient: "linear-gradient(135deg, #dbeafe, #ede9fe, #fce7f3)",
    accent: "#6d5dfc",
  },
  {
    value: "Triangle / Pear",
    title: "Triangle / Pear",
    subtitle: "Wider hips with comparatively narrower shoulders.",
    icon: "▽",
    note: "Balanced upper-body styling and comfortable lower fit.",
    gradient: "linear-gradient(135deg, #ffe4e6, #fed7aa, #fef3c7)",
    accent: "#f97316",
  },
  {
    value: "Inverted Triangle",
    title: "Inverted Triangle",
    subtitle: "Broader shoulders with comparatively narrower hips.",
    icon: "△",
    note: "Clean shoulder lines and balanced lower silhouettes.",
    gradient: "linear-gradient(135deg, #dcfce7, #cffafe, #e0e7ff)",
    accent: "#059669",
  },
  {
    value: "Oval / Round",
    title: "Oval / Round",
    subtitle: "Fuller midsection with a softer body outline.",
    icon: "◯",
    note: "Relaxed structure and smooth midsection comfort.",
    gradient: "linear-gradient(135deg, #fef3c7, #ffedd5, #ffe4e6)",
    accent: "#ca8a04",
  },
  {
    value: "Hourglass",
    title: "Hourglass",
    subtitle: "Balanced bust/shoulders and hips with defined waist.",
    icon: "⌛",
    note: "Balanced cuts and waist-aware fits usually work well.",
    gradient: "linear-gradient(135deg, #fce7f3, #ede9fe, #dbeafe)",
    accent: "#db2777",
  },
];

const SIZE_OPTIONS = [
  { value: "XS", label: "XS", title: "Extra Small" },
  { value: "S", label: "S", title: "Small" },
  { value: "M", label: "M", title: "Medium" },
  { value: "L", label: "L", title: "Large" },
  { value: "XL", label: "XL", title: "Extra Large" },
  { value: "2XL", label: "2XL", title: "Double Extra Large" },
  { value: "3XL", label: "3XL", title: "Triple Extra Large" },
  { value: "4XL", label: "4XL", title: "Plus Size" },
  { value: "5XL", label: "5XL", title: "Plus Size" },
];

const HEIGHT_RANGES = [
  { value: "Below 150 cm", label: "Below 150 cm", icon: "🌱" },
  { value: "150-160 cm", label: "150 – 160 cm", icon: "📏" },
  { value: "161-170 cm", label: "161 – 170 cm", icon: "📐" },
  { value: "171-180 cm", label: "171 – 180 cm", icon: "🧍" },
  { value: "181-190 cm", label: "181 – 190 cm", icon: "🧍‍♂️" },
  { value: "Above 190 cm", label: "Above 190 cm", icon: "⬆️" },
];

function getHeightHint(heightCm, heightRange) {
  const numericHeight = Number(heightCm);

  if (Number.isFinite(numericHeight) && numericHeight > 0) {
    if (numericHeight < 150) return "Petite / shorter-height fit guidance";
    if (numericHeight <= 160) return "Short-to-average height fit guidance";
    if (numericHeight <= 170) return "Average height fit guidance";
    if (numericHeight <= 180) return "Tall-average fit guidance";
    if (numericHeight <= 190) return "Tall fit guidance";
    return "Extra-tall fit guidance";
  }

  if (heightRange) return `${heightRange} selected`;

  return "Height not selected yet";
}

function getCompletionScore({ bodyType, size, heightCm, heightRange }) {
  let score = 0;

  if (bodyType) score += 34;
  if (size) score += 33;
  if (heightCm || heightRange) score += 33;

  return score;
}

export default function SizeBodyPage() {
  const nav = useNavigate();
  const flow = useFlowStore();

  const {
    bodyType,
    size,
    heightCm,
    heightRange,
    scanResult,
    body,
    patch,
  } = flow;

  const selectedBodyTypeValue =
    bodyType || body?.bodyType || scanResult?.bodyType || "";
  const selectedSizeValue =
    size || body?.size || scanResult?.recommendedSize || "";
  const selectedHeightCm =
    heightCm || body?.heightCm || scanResult?.detectedHeightCm || "";
  const selectedHeightRange = heightRange || body?.heightRange || "";

  const [heightMode, setHeightMode] = useState(
    selectedHeightCm ? "exact" : "range"
  );
  const [error, setError] = useState("");

  const selectedBody = useMemo(
    () => BODY_TYPES.find((item) => item.value === selectedBodyTypeValue),
    [selectedBodyTypeValue]
  );

  const selectedSize = useMemo(
    () => SIZE_OPTIONS.find((item) => item.value === selectedSizeValue),
    [selectedSizeValue]
  );

  const selectedHeightRangeOption = useMemo(
    () => HEIGHT_RANGES.find((item) => item.value === selectedHeightRange),
    [selectedHeightRange]
  );

  const completionScore = getCompletionScore({
    bodyType: selectedBodyTypeValue,
    size: selectedSizeValue,
    heightCm: selectedHeightCm,
    heightRange: selectedHeightRange,
  });

  function selectBodyType(value) {
    setError("");

    patch({
      bodyType: value,
    });
  }

  function selectSize(value) {
    setError("");

    patch({
      size: value,
    });
  }

  function updateHeightCm(value) {
    const cleaned = value.replace(/[^\d]/g, "").slice(0, 3);

    setError("");

    patch({
      heightCm: cleaned,
      heightRange: cleaned ? "" : selectedHeightRange,
    });
  }

  function selectHeightRange(value) {
    setError("");

    patch({
      heightRange: value,
      heightCm: "",
    });
  }

  function continueManually() {
    const numericHeight = Number(selectedHeightCm);

    if (
      selectedHeightCm &&
      (!Number.isFinite(numericHeight) || numericHeight < 50)
    ) {
      setError("Please enter a valid height in cm, or use the height range option.");
      return;
    }

    if (selectedHeightCm && numericHeight > 250) {
      setError("Please enter height in cm correctly. Example: 172.");
      return;
    }

    nav("/guided-filters");
  }

  function skipSection() {
    nav("/guided-filters");
  }

  function openScanner() {
    nav("/camera-scan");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes sizeSoftFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes sizeSoftPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 1060px) {
            .size-body-header {
              grid-template-columns: 1fr !important;
            }

            .size-body-title {
              font-size: 38px !important;
            }

            .size-body-layout {
              grid-template-columns: 1fr !important;
            }

            .size-body-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .size-body-footer {
              flex-direction: column !important;
            }

            .size-body-footer button {
              width: 100% !important;
            }
          }

          @media (max-width: 640px) {
            .size-body-grid {
              grid-template-columns: 1fr !important;
            }

            .size-chip-grid,
            .height-mode-row {
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
          <section className="size-body-header" style={styles.header}>
            <div>
              <div style={styles.stepPill}>
                <span style={styles.stepDot} />
                Step 3 of 12 · Smart Size & Body Input
              </div>

              <h1 className="size-body-title" style={styles.title}>
                Help us understand the fit better.
              </h1>

              <p style={styles.subtitle}>
                These details are optional, but they improve the outfit
                recommendation, size confidence, expert notes, and final Fit Card.
              </p>
            </div>

            <aside style={styles.scannerCard}>
              <div style={styles.scannerTop}>
                <span style={styles.scannerIcon}>📸</span>

                <div>
                  <p style={styles.scannerLabel}>AI Fit Scanner</p>
                  <h2 style={styles.scannerTitle}>Not sure about size?</h2>
                </div>
              </div>

              <p style={styles.scannerText}>
                Scan using camera to estimate height, body proportions,
                recommended size, and fit type.
              </p>

              <button type="button" onClick={openScanner} style={styles.scanButton}>
                Scan using camera →
              </button>

              <p style={styles.scannerHint}>
                Tip: use the back camera and stand straight for better precision.
              </p>
            </aside>
          </section>

          <section className="size-body-layout" style={styles.layout}>
            <main style={styles.mainPanel}>
              <section style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>🧍</span>

                  <div>
                    <h2 style={styles.blockTitle}>What is your body type?</h2>
                    <p style={styles.blockText}>
                      Choose the closest shape. You can skip this if you are not
                      sure.
                    </p>
                  </div>
                </div>

                <div className="size-body-grid" style={styles.bodyGrid}>
                  {BODY_TYPES.map((option) => {
                    const selected = selectedBodyTypeValue === option.value;

                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        whileHover={{ y: -5, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectBodyType(option.value)}
                        style={{
                          ...styles.bodyCard,
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
                            ...styles.bodyVisual,
                            background: option.gradient,
                          }}
                        >
                          <span style={styles.bodyShape}>{option.icon}</span>
                          <span
                            style={{
                              ...styles.bodyBadge,
                              color: option.accent,
                            }}
                          >
                            {selected ? "Selected" : "Choose"}
                          </span>
                        </div>

                        <div style={styles.bodyCardContent}>
                          <div style={styles.cardTitleRow}>
                            <h3 style={styles.bodyCardTitle}>{option.title}</h3>

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

                          <p style={styles.bodyCardSubtitle}>
                            {option.subtitle}
                          </p>

                          <small style={styles.bodyCardNote}>
                            {option.note}
                          </small>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              <section style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>🏷️</span>

                  <div>
                    <h2 style={styles.blockTitle}>What is your usual size?</h2>
                    <p style={styles.blockText}>
                      Select the size you usually wear. The scanner can refine
                      this later.
                    </p>
                  </div>
                </div>

                <div className="size-chip-grid" style={styles.sizeGrid}>
                  {SIZE_OPTIONS.map((option) => {
                    const selected = selectedSizeValue === option.value;

                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectSize(option.value)}
                        style={{
                          ...styles.sizeButton,
                          ...(selected ? styles.sizeButtonSelected : {}),
                        }}
                      >
                        <strong>{option.label}</strong>
                        <small>{option.title}</small>
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              <section style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>📏</span>

                  <div>
                    <h2 style={styles.blockTitle}>Enter your height</h2>
                    <p style={styles.blockText}>
                      Add exact height in cm, or choose an approximate range.
                    </p>
                  </div>
                </div>

                <div className="height-mode-row" style={styles.heightModeRow}>
                  <button
                    type="button"
                    onClick={() => setHeightMode("exact")}
                    style={{
                      ...styles.modeButton,
                      ...(heightMode === "exact" ? styles.modeButtonSelected : {}),
                    }}
                  >
                    Exact height
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeightMode("range")}
                    style={{
                      ...styles.modeButton,
                      ...(heightMode === "range" ? styles.modeButtonSelected : {}),
                    }}
                  >
                    Height range
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {heightMode === "exact" ? (
                    <motion.div
                      key="exact"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                    >
                      <label style={styles.inputLabel}>Height in cm</label>

                      <div style={styles.heightInputWrap}>
                        <input
                          value={selectedHeightCm || ""}
                          onChange={(event) => updateHeightCm(event.target.value)}
                          placeholder="e.g., 172"
                          inputMode="numeric"
                          style={styles.heightInput}
                        />

                        <span style={styles.cmBadge}>cm</span>
                      </div>

                      <p style={styles.inputHint}>
                        Example: enter 172 for 172 cm.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="range"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="size-chip-grid" style={styles.heightGrid}>
                        {HEIGHT_RANGES.map((option) => {
                          const selected = selectedHeightRange === option.value;

                          return (
                            <motion.button
                              key={option.value}
                              type="button"
                              whileHover={{ y: -4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => selectHeightRange(option.value)}
                              style={{
                                ...styles.heightButton,
                                ...(selected
                                  ? styles.heightButtonSelected
                                  : {}),
                              }}
                            >
                              <span>{option.icon}</span>
                              <strong>{option.label}</strong>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </main>

            <aside style={styles.summaryPanel}>
              <div style={styles.summaryTop}>
                <div style={styles.summaryIcon}>
                  {selectedBody?.icon || selectedHeightRangeOption?.icon || "🪄"}
                </div>

                <div>
                  <p style={styles.summaryLabel}>Fit data confidence</p>
                  <h2 style={styles.summaryScore}>{completionScore}%</h2>
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

              <div style={styles.summaryList}>
                <div style={styles.summaryItem}>
                  <span>Body Type</span>
                  <strong>{selectedBody?.title || "Optional"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Usual Size</span>
                  <strong>
                    {selectedSize
                      ? `${selectedSize.label} · ${selectedSize.title}`
                      : "Optional"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Height</span>
                  <strong>
                    {selectedHeightCm
                      ? `${selectedHeightCm} cm`
                      : selectedHeightRangeOption?.label || "Optional"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Height Hint</span>
                  <strong>
                    {getHeightHint(selectedHeightCm, selectedHeightRange)}
                  </strong>
                </div>
              </div>

              {scanResult ? (
                <div style={styles.scanResultCard}>
                  <span style={styles.scanBadge}>AI scan available</span>
                  <p style={styles.scanResultText}>
                    Recommended size:{" "}
                    <strong>{scanResult.recommendedSize || "M"}</strong>
                    <br />
                    Fit type: <strong>{scanResult.fitType || "Regular"}</strong>
                  </p>
                </div>
              ) : (
                <div style={styles.scanResultCard}>
                  <span style={styles.scanBadge}>Manual mode</span>
                  <p style={styles.scanResultText}>
                    Add manual details now, or use the AI Fit Scanner for a more
                    confident recommendation.
                  </p>
                </div>
              )}

              <div style={styles.tailorNote}>
                <span style={styles.tailorIcon}>🧵</span>
                <p>
                  These details will later be included in the Fit Card sent to
                  the tailor or designer.
                </p>
              </div>
            </aside>
          </section>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <div className="size-body-footer" style={styles.footer}>
            <button
              type="button"
              onClick={() => nav("/basic-profile")}
              style={styles.backButton}
            >
              ← Back
            </button>

            <div style={styles.footerRight}>
              <button type="button" onClick={skipSection} style={styles.skipButton}>
                Skip for now
              </button>

              <button
                type="button"
                onClick={continueManually}
                style={styles.nextButton}
              >
                Continue with manual inputs →
              </button>
            </div>
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

  aiNotice: {
    margin: "16px 0",
    padding: "13px 15px",
    borderRadius: "18px",
    background: "rgba(14,165,233,0.12)",
    border: "1px solid rgba(14,165,233,0.22)",
    color: "#075985",
    fontWeight: 800,
    lineHeight: 1.5,
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
    animation: "sizeSoftPulse 2s ease-in-out infinite",
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
  
  {aiFit ? (
    <div style={styles.aiNotice}>
      <strong>AI Fit Scanner detected:</strong>{" "}
      {aiFit.estimatedSize} size, {aiFit.bodyType}, {aiFit.fitPreference}.
      You can confirm or adjust the details below.
    </div>
  ) : null}

  scannerCard: {
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "28px",
    padding: "20px",
    background: "rgba(255,255,255,0.76)",
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.10)",
    backdropFilter: "blur(18px)",
  },
  scannerTop: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  scannerIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "22px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #ffffff, #eef2ff)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    fontSize: "30px",
    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.10)",
    animation: "sizeSoftFloat 3.2s ease-in-out infinite",
  },
  scannerLabel: {
    margin: "0 0 4px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  scannerTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "21px",
  },
  scannerText: {
    margin: "14px 0",
    color: "#475569",
    lineHeight: 1.55,
    fontSize: "14px",
    fontWeight: 600,
  },
  scannerHint: {
    margin: "12px 0 0",
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.45,
    fontWeight: 700,
  },
  scanButton: {
    width: "100%",
    border: "0",
    borderRadius: "999px",
    padding: "13px 18px",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 14px 30px rgba(79, 70, 229, 0.24)",
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
  bodyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "13px",
  },
  bodyCard: {
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
  bodyVisual: {
    height: "92px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px",
  },
  bodyShape: {
    width: "58px",
    height: "58px",
    borderRadius: "22px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.68)",
    border: "1px solid rgba(255,255,255,0.72)",
    fontSize: "31px",
    fontWeight: 900,
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.08)",
  },
  bodyBadge: {
    padding: "8px 11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(255,255,255,0.72)",
    fontSize: "12px",
    fontWeight: 900,
  },
  bodyCardContent: {
    padding: "15px",
  },
  cardTitleRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  },
  bodyCardTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "19px",
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
  bodyCardSubtitle: {
    margin: "8px 0",
    color: "#475569",
    lineHeight: 1.45,
    fontSize: "13px",
    fontWeight: 600,
  },
  bodyCardNote: {
    display: "block",
    color: "#64748b",
    lineHeight: 1.4,
    fontWeight: 700,
  },
  sizeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
    gap: "11px",
  },
  sizeButton: {
    minHeight: "76px",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "12px",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "4px",
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.06)",
  },
  sizeButtonSelected: {
    border: "1px solid rgba(109, 93, 252, 0.58)",
    background: "#f5f3ff",
    color: "#4f46e5",
    boxShadow: "0 14px 30px rgba(109, 93, 252, 0.12)",
  },
  heightModeRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "16px",
  },
  modeButton: {
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "13px",
    background: "#ffffff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: 900,
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.05)",
  },
  modeButtonSelected: {
    border: "1px solid rgba(109, 93, 252, 0.58)",
    background: "#f5f3ff",
    color: "#4f46e5",
  },
  inputLabel: {
    display: "block",
    marginBottom: "8px",
    color: "#111827",
    fontWeight: 900,
    fontSize: "14px",
  },
  heightInputWrap: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #dbe4ee",
    borderRadius: "20px",
    overflow: "hidden",
    background: "#ffffff",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  heightInput: {
    width: "100%",
    border: 0,
    outline: "none",
    background: "transparent",
    color: "#111827",
    padding: "16px",
    fontSize: "18px",
    fontWeight: 900,
  },
  cmBadge: {
    padding: "0 16px",
    color: "#64748b",
    fontWeight: 900,
  },
  inputHint: {
    margin: "9px 0 0",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 700,
  },
  heightGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "11px",
  },
  heightButton: {
    minHeight: "72px",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "12px",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    justifyContent: "center",
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.06)",
  },
  heightButtonSelected: {
    border: "1px solid rgba(109, 93, 252, 0.58)",
    background: "#f5f3ff",
    color: "#4f46e5",
    boxShadow: "0 14px 30px rgba(109, 93, 252, 0.12)",
  },
  summaryPanel: {
    position: "sticky",
    top: "18px",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "30px",
    padding: "22px",
    background: "rgba(255,255,255,0.78)",
    boxShadow: "0 20px 48px rgba(15, 23, 42, 0.10)",
    backdropFilter: "blur(18px)",
  },
  summaryTop: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "14px",
  },
  summaryIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "20px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #ede9fe, #cffafe)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    fontSize: "28px",
    fontWeight: 900,
  },
  summaryLabel: {
    margin: "0 0 4px",
    color: "#64748b",
    fontWeight: 900,
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  summaryScore: {
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
    marginBottom: "16px",
  },
  progressFill: {
    height: "100%",
    borderRadius: "inherit",
    background: "linear-gradient(90deg, #6d5dfc, #00bcd4)",
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
  scanResultCard: {
    marginTop: "14px",
    padding: "13px",
    borderRadius: "18px",
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
  },
  scanBadge: {
    display: "inline-flex",
    marginBottom: "8px",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#0891b2",
    fontSize: "11px",
    fontWeight: 900,
  },
  scanResultText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.5,
    fontSize: "13px",
    fontWeight: 700,
  },
  tailorNote: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    marginTop: "14px",
    padding: "13px",
    borderRadius: "18px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#475569",
    fontWeight: 700,
  },
  tailorIcon: {
    flex: "0 0 auto",
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
  footerRight: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
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
  skipButton: {
    minWidth: "160px",
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "14px 22px",
    background: "#ffffff",
    color: "#475569",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.08)",
  },
  nextButton: {
    minWidth: "260px",
    border: "1px solid rgba(255,255,255,0.72)",
    borderRadius: "999px",
    padding: "14px 22px",
    background: "linear-gradient(135deg, #ff7a59 0%, #facc15 52%, #fff7ad 100%)",
    color: "#111827",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 18px 45px rgba(255,122,89,0.34), 0 8px 24px rgba(250,204,21,0.24)",
  },
};
