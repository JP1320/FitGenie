import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";
import { callApi } from "../services/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200&auto=format&fit=crop";

function getRecommendationsArray(recommendations) {
  if (!recommendations) return [];

  if (Array.isArray(recommendations.list)) {
    return recommendations.list;
  }

  if (Array.isArray(recommendations.recommendations)) {
    return recommendations.recommendations;
  }

  return [];
}

function formatScore(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return "—";
  }

  const numeric = Number(value);

  if (numeric <= 1) {
    return `${Math.round(numeric * 100)}%`;
  }

  return `${Math.round(numeric)}%`;
}

function getScoreNumber(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return 0;
  }

  const numeric = Number(value);

  if (numeric <= 1) {
    return Math.round(numeric * 100);
  }

  return Math.round(numeric);
}

function getOutfitImage(outfit) {
  return outfit?.imageUrl || outfit?.img || outfit?.image || FALLBACK_IMAGE;
}

function getSelectedPreferences(flow) {
  return {
    style: flow.style || flow.preferences?.style || "Not selected",
    budget: flow.budget || flow.preferences?.budget || "Not selected",
    fabric: Array.isArray(flow.fabric)
      ? flow.fabric
      : Array.isArray(flow.preferences?.fabric)
      ? flow.preferences.fabric
      : [],
    fit:
      flow.fitDetails?.fit ||
      flow.preferences?.fitDetails?.fit ||
      flow.preferences?.fit ||
      flow.body?.scanResult?.fitType ||
      flow.scanResult?.fitType ||
      "Not selected",
    sleeve:
      flow.fitDetails?.sleeve ||
      flow.preferences?.fitDetails?.sleeve ||
      "Not selected",
    length:
      flow.fitDetails?.length ||
      flow.preferences?.fitDetails?.length ||
      "Not selected",
  };
}

function getSelectedBody(flow) {
  return {
    size:
      flow.body?.scanResult?.recommendedSize ||
      flow.scanResult?.recommendedSize ||
      flow.body?.size ||
      flow.size ||
      "Not selected",
    bodyType:
      flow.body?.scanResult?.bodyType ||
      flow.scanResult?.bodyType ||
      flow.body?.bodyType ||
      flow.bodyType ||
      "Not selected",
    height:
      flow.body?.scanResult?.detectedHeightCm ||
      flow.scanResult?.detectedHeightCm ||
      flow.body?.heightCm ||
      flow.heightCm ||
      flow.body?.heightRange ||
      flow.heightRange ||
      "Not selected",
  };
}

function getRecommendationPayload(flow) {
  return {
    userId: flow.userId || "guest_user",
    profile: {
      ...(flow.profile || {}),
      ageRange: flow.ageRange || flow.age || flow.profile?.ageRange || "",
      gender: flow.gender || flow.profile?.gender || "",
    },
    body: {
      ...(flow.body || {}),
      bodyType: flow.bodyType || flow.body?.bodyType || "",
      size: flow.size || flow.body?.size || "",
      heightCm: flow.heightCm || flow.body?.heightCm || "",
      heightRange: flow.heightRange || flow.body?.heightRange || "",
      scanResult: flow.scanResult || flow.body?.scanResult || null,
    },
    preferences: {
      ...(flow.preferences || {}),
      style: flow.style || flow.preferences?.style || "",
      budget: flow.budget || flow.preferences?.budget || "",
      fabric: Array.isArray(flow.fabric)
        ? flow.fabric
        : flow.preferences?.fabric || [],
      fitDetails: flow.fitDetails || flow.preferences?.fitDetails || {},
    },
  };
}

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const flow = useFlowStore();
  const { recommendations, patch } = flow;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const recommendationList = useMemo(
    () => getRecommendationsArray(recommendations),
    [recommendations]
  );

  const selectedOutfit = recommendations?.selectedOutfit || null;
  const selectedPreferences = getSelectedPreferences(flow);
  const selectedBody = getSelectedBody(flow);

  const topRecommendation = recommendationList[0] || null;

  const readinessScore = useMemo(() => {
    let score = 0;

    if (selectedPreferences.style !== "Not selected") score += 30;
    if (selectedPreferences.budget !== "Not selected") score += 25;
    if (selectedPreferences.fit !== "Not selected") score += 15;
    if (selectedBody.size !== "Not selected") score += 15;
    if (selectedBody.bodyType !== "Not selected") score += 15;

    return score;
  }, [
    selectedPreferences.style,
    selectedPreferences.budget,
    selectedPreferences.fit,
    selectedBody.size,
    selectedBody.bodyType,
  ]);

  async function generateRecommendations() {
    setLoading(true);
    setError("");

    try {
      const response = await callApi(
        "/recommendations",
        "POST",
        getRecommendationPayload(flow)
      );

      if (!response.ok) {
        setError(
          response?.data?.message ||
            "Unable to generate recommendations. Please try again."
        );
        return;
      }

      const list = response?.data?.recommendations || response?.data?.list || [];

      patch("recommendations", {
        list,
        selectedOutfit: null,
        confidenceScore:
          response?.data?.confidenceScore ||
          response?.data?.overallConfidence ||
          null,
        generatedAt: response?.data?.generatedAt || new Date().toISOString(),
      });
    } catch (_error) {
      setError("Unable to connect to the recommendation engine.");
    } finally {
      setLoading(false);
    }
  }

  function selectOutfit(outfit) {
    setError("");

    patch("recommendations", {
      ...recommendations,
      list: recommendationList,
      selectedOutfit: outfit,
    });
  }

  function continueToServiceType() {
    if (!selectedOutfit) {
      setError("Please select one outfit before continuing.");
      return;
    }

    navigate("/service-type");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes recommendationSoftFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes recommendationSoftPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 1080px) {
            .recommendation-header {
              grid-template-columns: 1fr !important;
            }

            .recommendation-title {
              font-size: 38px !important;
            }

            .recommendation-layout {
              grid-template-columns: 1fr !important;
            }

            .recommendation-summary-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .recommendation-footer {
              flex-direction: column !important;
            }

            .recommendation-footer button {
              width: 100% !important;
            }
          }

          @media (max-width: 680px) {
            .recommendation-summary-grid,
            .recommendation-grid,
            .metric-grid {
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
          <section className="recommendation-header" style={styles.header}>
            <div>
              <div style={styles.stepPill}>
                <span style={styles.stepDot} />
                Step 5 of 12 · AI Recommendation Engine
              </div>

              <h1 className="recommendation-title" style={styles.title}>
                AI Recommendation Engine
              </h1>

              <p style={styles.subtitle}>
                FitGenie analyzes style, budget, fit inputs, body profile, and
                size details to suggest outfits with size confidence, fit type,
                and a clear reason why each outfit suits you.
              </p>
            </div>

            <aside style={styles.previewCard}>
              <div style={styles.previewTop}>
                <span style={styles.previewIcon}>🧞</span>

                <div>
                  <p style={styles.previewLabel}>Recommendation readiness</p>
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
                {recommendationList.length > 0
                  ? `${recommendationList.length} outfit recommendation${
                      recommendationList.length === 1 ? "" : "s"
                    } generated.`
                  : readinessScore < 55
                  ? "Add style, budget, size, and fit details for stronger recommendations."
                  : "Ready to generate outfit recommendations."}
              </p>

              <button
                type="button"
                onClick={generateRecommendations}
                disabled={loading}
                style={{
                  ...styles.generateButton,
                  ...(loading ? styles.disabledButton : {}),
                }}
              >
                {loading ? "Generating..." : "Generate Recommendations"}
              </button>
            </aside>
          </section>

          <section className="recommendation-summary-grid" style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <span style={styles.summaryIcon}>🎨</span>
              <span style={styles.summaryLabel}>Style</span>
              <strong>{selectedPreferences.style}</strong>
            </div>

            <div style={styles.summaryCard}>
              <span style={styles.summaryIcon}>💰</span>
              <span style={styles.summaryLabel}>Budget</span>
              <strong>{selectedPreferences.budget}</strong>
            </div>

            <div style={styles.summaryCard}>
              <span style={styles.summaryIcon}>📐</span>
              <span style={styles.summaryLabel}>Preferred Fit</span>
              <strong>{selectedPreferences.fit}</strong>
            </div>

            <div style={styles.summaryCard}>
              <span style={styles.summaryIcon}>🏷️</span>
              <span style={styles.summaryLabel}>Current Size Input</span>
              <strong>{selectedBody.size}</strong>
            </div>
          </section>

          <section className="recommendation-layout" style={styles.layout}>
            <main style={styles.mainPanel}>
              {error ? <div style={styles.errorBox}>{error}</div> : null}

              <AnimatePresence mode="wait">
                {recommendationList.length === 0 && !loading ? (
                  <motion.section
                    key="empty"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    style={styles.emptyState}
                  >
                    <div style={styles.emptyIcon}>👗</div>

                    <h2 style={styles.emptyTitle}>
                      No recommendations generated yet
                    </h2>

                    <p style={styles.emptyText}>
                      Click “Generate Recommendations” to analyze your profile,
                      size, body inputs, style preference, and budget.
                    </p>

                    <button
                      type="button"
                      onClick={generateRecommendations}
                      disabled={loading}
                      style={{
                        ...styles.emptyButton,
                        ...(loading ? styles.disabledButton : {}),
                      }}
                    >
                      {loading ? "Generating..." : "Generate Recommendations"}
                    </button>
                  </motion.section>
                ) : null}
              </AnimatePresence>

              {loading ? (
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={styles.loadingCard}
                >
                  <div style={styles.loadingOrb}>🧞</div>

                  <h2 style={styles.loadingTitle}>
                    Finding your best outfit matches...
                  </h2>

                  <p style={styles.loadingText}>
                    FitGenie is checking style, budget, size confidence, fit
                    type, and body profile details.
                  </p>
                </motion.section>
              ) : null}

              {recommendationList.length > 0 ? (
                <div className="recommendation-grid" style={styles.grid}>
                  {recommendationList.map((outfit, index) => {
                    const isSelected =
                      selectedOutfit?.outfitId === outfit.outfitId ||
                      selectedOutfit?.id === outfit.id ||
                      selectedOutfit?.title === outfit.title;

                    const matchScore = getScoreNumber(
                      outfit.matchScore || outfit.fitScore
                    );

                    return (
                      <motion.article
                        key={outfit.outfitId || outfit.id || outfit.title || index}
                        whileHover={{ y: -8 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          ...styles.outfitCard,
                          ...(isSelected ? styles.selectedCard : {}),
                        }}
                      >
                        <div style={styles.imageWrap}>
                          <img
                            src={getOutfitImage(outfit)}
                            alt={outfit.title || outfit.name || "Recommended outfit"}
                            style={styles.image}
                          />

                          <span style={styles.matchBadge}>
                            {formatScore(outfit.matchScore || outfit.fitScore)} match
                          </span>

                          <span style={styles.rankBadge}>#{index + 1}</span>
                        </div>

                        <div style={styles.cardBody}>
                          <div style={styles.cardTop}>
                            <div>
                              <h2 style={styles.cardTitle}>
                                {outfit.title || outfit.name || "Recommended Outfit"}
                              </h2>

                              <p style={styles.cardSubtitle}>
                                {outfit.category ||
                                  selectedPreferences.style ||
                                  "Personalized outfit"}
                              </p>
                            </div>

                            <span style={styles.price}>
                              {outfit.priceRange || outfit.price || "Price on request"}
                            </span>
                          </div>

                          <div className="metric-grid" style={styles.metrics}>
                            <div style={styles.metricBox}>
                              <span style={styles.metricLabel}>Size</span>
                              <strong>
                                {outfit.recommendedSize || selectedBody.size || "M"}
                              </strong>
                            </div>

                            <div style={styles.metricBox}>
                              <span style={styles.metricLabel}>Fit</span>
                              <strong>
                                {outfit.fitType || selectedPreferences.fit || "Regular"}
                              </strong>
                            </div>

                            <div style={styles.metricBox}>
                              <span style={styles.metricLabel}>Confidence</span>
                              <strong>{formatScore(outfit.sizeConfidence)}</strong>
                            </div>
                          </div>

                          <div style={styles.scoreBarBox}>
                            <div style={styles.scoreBarTop}>
                              <span>AI match strength</span>
                              <strong>{matchScore || "—"}%</strong>
                            </div>

                            <div style={styles.miniProgressTrack}>
                              <div
                                style={{
                                  ...styles.miniProgressFill,
                                  width: `${Math.min(matchScore || 0, 100)}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div style={styles.reasonBox}>
                            <span style={styles.reasonLabel}>
                              Why this suits you
                            </span>

                            <p style={styles.reasonText}>
                              {outfit.whyThisSuitsYou ||
                                outfit.reason ||
                                "This outfit matches the selected style, budget, fit preference, and body profile."}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => selectOutfit(outfit)}
                            style={{
                              ...styles.selectButton,
                              ...(isSelected ? styles.selectedButton : {}),
                            }}
                          >
                            {isSelected ? "Selected Outfit" : "Select this outfit"}
                          </button>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              ) : null}
            </main>

            <aside style={styles.sidePanel}>
              <div style={styles.sideTop}>
                <span style={styles.sideIcon}>
                  {selectedOutfit ? "✅" : "👗"}
                </span>

                <div>
                  <p style={styles.sideLabel}>Selected outfit</p>
                  <h2 style={styles.sideTitle}>
                    {selectedOutfit?.title ||
                      selectedOutfit?.name ||
                      "Pending"}
                  </h2>
                </div>
              </div>

              <div style={styles.summaryList}>
                <div style={styles.summaryItem}>
                  <span>Top Match</span>
                  <strong>
                    {topRecommendation?.title ||
                      topRecommendation?.name ||
                      "Generate first"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Selected Outfit</span>
                  <strong>
                    {selectedOutfit?.title ||
                      selectedOutfit?.name ||
                      "Required"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Recommended Size</span>
                  <strong>
                    {selectedOutfit?.recommendedSize ||
                      selectedBody.size ||
                      "Not selected"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Fit Type</span>
                  <strong>
                    {selectedOutfit?.fitType ||
                      selectedPreferences.fit ||
                      "Not selected"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Fabric Preference</span>
                  <strong>
                    {selectedPreferences.fabric.length > 0
                      ? selectedPreferences.fabric.join(", ")
                      : "Optional"}
                  </strong>
                </div>
              </div>

              <div style={styles.tipCard}>
                <span style={styles.tipBadge}>Next step</span>

                <h3 style={styles.tipTitle}>Choose Service Type</h3>

                <p style={styles.tipText}>
                  After selecting one outfit, FitGenie will ask whether you want
                  custom stitching, designer wear, ready-made alteration, or
                  personal styling.
                </p>

                <div style={styles.tipPills}>
                  <span>🧵 Tailor</span>
                  <span>👑 Designer</span>
                  <span>🛍️ Boutique</span>
                  <span>✨ Stylist</span>
                </div>
              </div>
            </aside>
          </section>

          {selectedOutfit ? (
            <section style={styles.selectedSummary}>
              <div style={styles.selectedSummaryIcon}>✅</div>

              <div>
                <p style={styles.selectedSummaryLabel}>Selected outfit</p>
                <strong style={styles.selectedSummaryText}>
                  {selectedOutfit.title || selectedOutfit.name || "Recommended Outfit"}
                </strong>
              </div>
            </section>
          ) : null}

          <div className="recommendation-footer" style={styles.footer}>
            <button
              type="button"
              onClick={() => navigate("/guided-filters")}
              style={styles.backButton}
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={continueToServiceType}
              style={styles.nextButton}
            >
              Confirm & Continue →
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
    animation: "recommendationSoftPulse 2s ease-in-out infinite",
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
    animation: "recommendationSoftFloat 3.2s ease-in-out infinite",
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
  generateButton: {
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
  disabledButton: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "13px",
    marginBottom: "20px",
  },
  summaryCard: {
    padding: "15px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
    display: "grid",
    gap: "6px",
    color: "#111827",
  },
  summaryIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "15px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #ede9fe, #cffafe)",
    fontSize: "21px",
  },
  summaryLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 350px",
    gap: "18px",
    alignItems: "start",
  },
  mainPanel: {
    display: "grid",
    gap: "16px",
  },
  errorBox: {
    padding: "13px 15px",
    borderRadius: "16px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#be123c",
    fontWeight: 800,
  },
  emptyState: {
    border: "1px dashed rgba(109, 93, 252, 0.28)",
    borderRadius: "30px",
    padding: "34px",
    textAlign: "center",
    background: "rgba(255,255,255,0.76)",
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)",
  },
  emptyIcon: {
    width: "72px",
    height: "72px",
    borderRadius: "26px",
    display: "grid",
    placeItems: "center",
    margin: "0 auto 16px",
    background: "linear-gradient(135deg, #ede9fe, #cffafe)",
    fontSize: "34px",
  },
  emptyTitle: {
    margin: "0 0 8px",
    color: "#111827",
    fontSize: "26px",
  },
  emptyText: {
    maxWidth: "560px",
    margin: "0 auto 20px",
    color: "#475569",
    lineHeight: 1.6,
    fontWeight: 600,
  },
  emptyButton: {
    border: "0",
    borderRadius: "999px",
    padding: "13px 20px",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 14px 30px rgba(79, 70, 229, 0.24)",
  },
  loadingCard: {
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "30px",
    padding: "34px",
    background: "rgba(255,255,255,0.76)",
    textAlign: "center",
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)",
  },
  loadingOrb: {
    width: "72px",
    height: "72px",
    borderRadius: "26px",
    display: "grid",
    placeItems: "center",
    margin: "0 auto 16px",
    background: "linear-gradient(135deg, #ede9fe, #cffafe)",
    fontSize: "34px",
    animation: "recommendationSoftFloat 2.4s ease-in-out infinite",
  },
  loadingTitle: {
    margin: "0 0 8px",
    color: "#111827",
    fontSize: "25px",
  },
  loadingText: {
    margin: 0,
    color: "#475569",
    fontWeight: 600,
    lineHeight: 1.6,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
    gap: "18px",
  },
  outfitCard: {
    overflow: "hidden",
    border: "2px solid rgba(148, 163, 184, 0.22)",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.86)",
    boxShadow: "0 16px 38px rgba(15, 23, 42, 0.10)",
    color: "#111827",
  },
  selectedCard: {
    border: "2px solid #6d5dfc",
    boxShadow: "0 22px 48px rgba(109, 93, 252, 0.18)",
  },
  imageWrap: {
    position: "relative",
    height: "230px",
    overflow: "hidden",
    background: "#eef2ff",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  matchBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    padding: "8px 11px",
    borderRadius: "999px",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 900,
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.22)",
  },
  rankBadge: {
    position: "absolute",
    left: "12px",
    top: "12px",
    width: "38px",
    height: "38px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    color: "#111827",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(255,255,255,0.72)",
    fontWeight: 900,
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.12)",
  },
  cardBody: {
    padding: "16px",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  cardTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "21px",
    lineHeight: 1.25,
  },
  cardSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontWeight: 800,
    fontSize: "13px",
  },
  price: {
    whiteSpace: "nowrap",
    fontSize: "12px",
    fontWeight: 900,
    padding: "7px 9px",
    borderRadius: "999px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#334155",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    margin: "16px 0",
  },
  metricBox: {
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "10px",
    background: "#ffffff",
    display: "grid",
    gap: "4px",
  },
  metricLabel: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  scoreBarBox: {
    padding: "12px",
    borderRadius: "17px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    marginBottom: "12px",
  },
  scoreBarTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "8px",
    color: "#475569",
    fontWeight: 900,
    fontSize: "13px",
  },
  miniProgressTrack: {
    height: "9px",
    borderRadius: "999px",
    background: "#e2e8f0",
    overflow: "hidden",
  },
  miniProgressFill: {
    height: "100%",
    borderRadius: "inherit",
    background: "linear-gradient(90deg, #6d5dfc, #00bcd4)",
  },
  reasonBox: {
    borderRadius: "18px",
    padding: "13px",
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
    marginBottom: "14px",
  },
  reasonLabel: {
    display: "block",
    color: "#0891b2",
    fontSize: "12px",
    fontWeight: 900,
    marginBottom: "5px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  reasonText: {
    margin: 0,
    color: "#475569",
    fontSize: "14px",
    lineHeight: 1.55,
    fontWeight: 600,
  },
  selectButton: {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "13px 18px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.08)",
  },
  selectedButton: {
    border: "0",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    color: "#ffffff",
    boxShadow: "0 16px 34px rgba(79, 70, 229, 0.25)",
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
    fontSize: "21px",
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
  tipPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
  },
  selectedSummary: {
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
  selectedSummaryIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #ede9fe, #cffafe)",
    fontSize: "22px",
    flex: "0 0 auto",
  },
  selectedSummaryLabel: {
    margin: "0 0 4px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  selectedSummaryText: {
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
