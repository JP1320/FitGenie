import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const BODY_TYPES = [
  {
    value: "Rectangle",
    title: "Rectangle",
    subtitle: "Straight body with similar shoulder, waist and hip balance.",
    icon: "▭",
    note: "Great with layered styling, structured fits, and shape-defining details.",
    gradient:
      "linear-gradient(135deg, rgba(124,92,255,0.95), rgba(0,212,255,0.82))",
  },
  {
    value: "Triangle / Pear",
    title: "Triangle / Pear",
    subtitle: "Wider hips with comparatively narrower shoulders.",
    icon: "▽",
    note: "Balanced upper-body styling and comfortable lower fit work well.",
    gradient:
      "linear-gradient(135deg, rgba(255,122,162,0.95), rgba(255,170,91,0.82))",
  },
  {
    value: "Inverted Triangle",
    title: "Inverted Triangle",
    subtitle: "Broader shoulders with comparatively narrower hips.",
    icon: "△",
    note: "Clean shoulder lines and balanced lower silhouettes are helpful.",
    gradient:
      "linear-gradient(135deg, rgba(30,215,166,0.95), rgba(0,212,255,0.82))",
  },
  {
    value: "Oval / Round",
    title: "Oval / Round",
    subtitle: "Fuller midsection with a softer body outline.",
    icon: "◯",
    note: "Relaxed structure and smooth midsection comfort are prioritized.",
    gradient:
      "linear-gradient(135deg, rgba(255,191,71,0.95), rgba(255,122,162,0.82))",
  },
  {
    value: "Hourglass",
    title: "Hourglass",
    subtitle: "Balanced bust/shoulders and hips with defined waist.",
    icon: "⌛",
    note: "Balanced cuts and waist-aware fits usually work beautifully.",
    gradient:
      "linear-gradient(135deg, rgba(174,92,255,0.95), rgba(255,122,236,0.82))",
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
  {
    value: "Below 150 cm",
    label: "Below 150 cm",
    icon: "🌱",
  },
  {
    value: "150-160 cm",
    label: "150 – 160 cm",
    icon: "📏",
  },
  {
    value: "161-170 cm",
    label: "161 – 170 cm",
    icon: "📐",
  },
  {
    value: "171-180 cm",
    label: "171 – 180 cm",
    icon: "🧍",
  },
  {
    value: "181-190 cm",
    label: "181 – 190 cm",
    icon: "🧍‍♂️",
  },
  {
    value: "Above 190 cm",
    label: "Above 190 cm",
    icon: "⬆️",
  },
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

  if (heightRange) {
    return `${heightRange} selected`;
  }

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
  const { bodyType, size, heightCm, heightRange, scanResult, patch } =
    useFlowStore();

  const [heightMode, setHeightMode] = useState(heightCm ? "exact" : "range");
  const [error, setError] = useState("");

  const selectedBody = useMemo(
    () => BODY_TYPES.find((item) => item.value === bodyType),
    [bodyType]
  );

  const selectedSize = useMemo(
    () => SIZE_OPTIONS.find((item) => item.value === size),
    [size]
  );

  const selectedHeightRange = useMemo(
    () => HEIGHT_RANGES.find((item) => item.value === heightRange),
    [heightRange]
  );

  const completionScore = getCompletionScore({
    bodyType,
    size,
    heightCm,
    heightRange,
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
      heightRange: cleaned ? "" : heightRange,
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
    const numericHeight = Number(heightCm);

    if (heightCm && (!Number.isFinite(numericHeight) || numericHeight < 50)) {
      setError("Please enter a valid height in cm, or use the height range option.");
      return;
    }

    if (heightCm && numericHeight > 250) {
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
          @keyframes sizeBodyFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes sizeBodyPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 980px) {
            .size-body-header {
              grid-template-columns: 1fr !important;
            }

            .size-body-title {
              font-size: 36px !important;
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

          @media (max-width: 620px) {
            .size-body-grid {
              grid-template-columns: 1fr !important;
            }

            .size-chip-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .height-mode-row {
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
                These fields are optional, but they make the outfit
                recommendation, size confidence, and tailor fit card much more
                useful.
              </p>
            </div>

            <aside style={styles.scannerCard}>
              <div style={styles.scannerIcon}>📸</div>

              <div>
                <p style={styles.scannerLabel}>Not sure about height or size?</p>
                <h2 style={styles.scannerTitle}>Use AI Fit Scanner</h2>
                <p style={styles.scannerText}>
                  Scan your body using the camera to estimate height, body
                  proportions, recommended size, and fit type.
                </p>
              </div>

              <button type="button" className="btn" onClick={openScanner}>
                Scan using camera
              </button>

              <p style={styles.scannerHint}>
                Tip: use the back camera and stand straight for better precision.
              </p>
            </aside>
          </section>

          <section className="size-body-layout" style={styles.layout}>
            <div style={styles.leftColumn}>
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
                    const selected = bodyType === option.value;

                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        whileHover={{ y: -5, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectBodyType(option.value)}
                        style={{
                          ...styles.bodyCard,
                          ...(selected ? styles.bodyCardSelected : {}),
                        }}
                      >
                        <div
                          style={{
                            ...styles.bodyVisual,
                            background: option.gradient,
                          }}
                        >
                          <span style={styles.bodyShape}>{option.icon}</span>
                        </div>

                        <div style={styles.bodyCardContent}>
                          <div style={styles.cardTitleRow}>
                            <h3 style={styles.bodyCardTitle}>{option.title}</h3>

                            <span
                              style={{
                                ...styles.checkCircle,
                                ...(selected ? styles.checkCircleSelected : {}),
                              }}
                            >
                              {selected ? "✓" : ""}
                            </span>
                          </div>

                          <p style={styles.bodyCardSubtitle}>{option.subtitle}</p>

                          <small style={styles.bodyCardNote}>{option.note}</small>
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
                    <h2 style={styles.blockTitle}>What is your size?</h2>
                    <p style={styles.blockText}>
                      Select the size you usually wear. The scanner can refine
                      this later.
                    </p>
                  </div>
                </div>

                <div className="size-chip-grid" style={styles.sizeGrid}>
                  {SIZE_OPTIONS.map((option) => {
                    const selected = size === option.value;

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
                          value={heightCm || ""}
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
                          const selected = heightRange === option.value;

                          return (
                            <motion.button
                              key={option.value}
                              type="button"
                              whileHover={{ y: -4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => selectHeightRange(option.value)}
                              style={{
                                ...styles.heightButton,
                                ...(selected ? styles.heightButtonSelected : {}),
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
            </div>

            <aside style={styles.summaryPanel}>
              <div style={styles.summaryTop}>
                <div style={styles.summaryIcon}>
                  {selectedBody?.icon || selectedHeightRange?.icon || "🪄"}
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
                  <span style={styles.summaryItemLabel}>Body Type</span>
                  <strong>{selectedBody?.title || "Optional"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span style={styles.summaryItemLabel}>Usual Size</span>
                  <strong>
                    {selectedSize
                      ? `${selectedSize.label} · ${selectedSize.title}`
                      : "Optional"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span style={styles.summaryItemLabel}>Height</span>
                  <strong>
                    {heightCm
                      ? `${heightCm} cm`
                      : selectedHeightRange?.label || "Optional"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span style={styles.summaryItemLabel}>Height Hint</span>
                  <strong>{getHeightHint(heightCm, heightRange)}</strong>
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
              className="btn ghost"
              onClick={() => nav("/basic-profile")}
              style={styles.footerButton}
            >
              Back
            </button>

            <div style={styles.footerRight}>
              <button
                type="button"
                className="btn ghost"
                onClick={skipSection}
                style={styles.footerButton}
              >
                Skip for now
              </button>

              <button
                type="button"
                className="btn"
                onClick={continueManually}
                style={styles.footerButton}
              >
                Continue with manual inputs
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
    animation: "sizeBodyPulse 2s ease-in-out infinite",
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
  scannerCard: {
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "26px",
    padding: "20px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))",
    boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
  },
  scannerIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "22px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.11)",
    border: "1px solid rgba(255,255,255,0.14)",
    fontSize: "30px",
    marginBottom: "15px",
    animation: "sizeBodyFloat 3.2s ease-in-out infinite",
  },
  scannerLabel: {
    margin: "0 0 4px",
    fontSize: "12px",
    color: "rgba(255,255,255,0.62)",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  scannerTitle: {
    margin: 0,
    fontSize: "22px",
  },
  scannerText: {
    margin: "9px 0 14px",
    color: "rgba(255,255,255,0.70)",
    lineHeight: 1.5,
    fontSize: "14px",
  },
  scannerHint: {
    margin: "12px 0 0",
    color: "rgba(255,255,255,0.58)",
    fontSize: "12px",
    lineHeight: 1.45,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 340px",
    gap: "18px",
    alignItems: "start",
  },
  leftColumn: {
    display: "grid",
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
  bodyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "13px",
  },
  bodyCard: {
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
  bodyCardSelected: {
    border: "2px solid rgba(0,212,255,0.95)",
    boxShadow: "0 22px 50px rgba(0,212,255,0.14)",
  },
  bodyVisual: {
    height: "84px",
    display: "grid",
    placeItems: "center",
  },
  bodyShape: {
    width: "54px",
    height: "54px",
    borderRadius: "20px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.22)",
    border: "1px solid rgba(255,255,255,0.24)",
    fontSize: "30px",
    fontWeight: 900,
    boxShadow: "0 14px 28px rgba(0,0,0,0.22)",
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
    fontSize: "18px",
  },
  bodyCardSubtitle: {
    margin: "8px 0",
    color: "rgba(255,255,255,0.70)",
    lineHeight: 1.45,
    fontSize: "13px",
  },
  bodyCardNote: {
    display: "block",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.4,
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
  sizeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
    gap: "11px",
  },
  sizeButton: {
    minHeight: "74px",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "18px",
    padding: "12px",
    background: "rgba(255,255,255,0.07)",
    color: "inherit",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "4px",
  },
  sizeButtonSelected: {
    border: "1px solid rgba(0,212,255,0.85)",
    background: "rgba(0,212,255,0.12)",
    boxShadow: "0 12px 26px rgba(0,212,255,0.12)",
  },
  heightModeRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "16px",
  },
  modeButton: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "16px",
    padding: "13px",
    background: "rgba(255,255,255,0.07)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: 900,
  },
  modeButtonSelected: {
    border: "1px solid rgba(0,212,255,0.85)",
    background: "rgba(0,212,255,0.12)",
  },
  inputLabel: {
    display: "block",
    marginBottom: "8px",
    fontWeight: 900,
    fontSize: "14px",
  },
  heightInputWrap: {
    display: "flex",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "18px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.08)",
  },
  heightInput: {
    width: "100%",
    border: 0,
    outline: "none",
    background: "transparent",
    color: "inherit",
    padding: "16px",
    fontSize: "18px",
    fontWeight: 800,
  },
  cmBadge: {
    padding: "0 16px",
    color: "rgba(255,255,255,0.72)",
    fontWeight: 900,
  },
  inputHint: {
    margin: "9px 0 0",
    color: "rgba(255,255,255,0.58)",
    fontSize: "13px",
  },
  heightGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "11px",
  },
  heightButton: {
    minHeight: "70px",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "18px",
    padding: "12px",
    background: "rgba(255,255,255,0.07)",
    color: "inherit",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    justifyContent: "center",
  },
  heightButtonSelected: {
    border: "1px solid rgba(0,212,255,0.85)",
    background: "rgba(0,212,255,0.12)",
    boxShadow: "0 12px 26px rgba(0,212,255,0.12)",
  },
  summaryPanel: {
    position: "sticky",
    top: "18px",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "28px",
    padding: "22px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))",
    boxShadow: "0 22px 52px rgba(0,0,0,0.20)",
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
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.90), rgba(0,212,255,0.78))",
    border: "1px solid rgba(255,255,255,0.18)",
    fontSize: "28px",
    fontWeight: 900,
  },
  summaryLabel: {
    margin: "0 0 4px",
    color: "rgba(255,255,255,0.62)",
    fontWeight: 900,
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  summaryScore: {
    margin: 0,
    fontSize: "34px",
    lineHeight: 1,
  },
  progressTrack: {
    height: "11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    overflow: "hidden",
    marginBottom: "16px",
  },
  progressFill: {
    height: "100%",
    borderRadius: "inherit",
    background: "linear-gradient(90deg,#7c5cff,#00d4ff)",
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
  summaryItemLabel: {
    color: "rgba(255,255,255,0.56)",
    fontSize: "12px",
    fontWeight: 900,
  },
  scanResultCard: {
    marginTop: "14px",
    padding: "13px",
    borderRadius: "18px",
    background: "rgba(0,212,255,0.10)",
    border: "1px solid rgba(0,212,255,0.22)",
  },
  scanBadge: {
    display: "inline-flex",
    marginBottom: "8px",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.10)",
    color: "#d9fbff",
    fontSize: "11px",
    fontWeight: 900,
  },
  scanResultText: {
    margin: 0,
    color: "rgba(255,255,255,0.76)",
    lineHeight: 1.5,
    fontSize: "13px",
  },
  tailorNote: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    marginTop: "14px",
    padding: "13px",
    borderRadius: "18px",
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  tailorIcon: {
    flex: "0 0 auto",
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
  footerRight: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  footerButton: {
    minWidth: "190px",
  },
};
