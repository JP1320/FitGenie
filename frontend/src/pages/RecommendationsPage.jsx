import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";
import { callApi } from "../services/api";

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

function getOutfitImage(outfit) {
  return (
    outfit.imageUrl ||
    outfit.img ||
    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200&auto=format&fit=crop"
  );
}

export default function RecommendationsPage() {
  const navigate = useNavigate();

  const {
    userId,
    profile,
    body,
    preferences,
    recommendations,
    patch,
  } = useFlowStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const recommendationList = useMemo(
    () => getRecommendationsArray(recommendations),
    [recommendations]
  );

  const selectedOutfit = recommendations?.selectedOutfit || null;

  async function generateRecommendations() {
    setLoading(true);
    setError("");

    try {
      const response = await callApi("/recommendations", "POST", {
        userId: userId || "guest_user",
        profile: profile || {},
        body: body || {},
        preferences: preferences || {},
      });

      if (!response.ok) {
        setError(
          response?.data?.message ||
            "Unable to generate recommendations. Please try again."
        );
        return;
      }

      const list =
        response?.data?.recommendations ||
        response?.data?.list ||
        [];

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
      <div style={styles.header}>
        <div>
          <p style={styles.step}>Step 5 of 12</p>
          <h1 style={styles.title}>AI Recommendation Engine</h1>
          <p style={styles.subtitle}>
            Suggested outfits, size confidence, fit type, and a clear reason why
            each outfit suits the user.
          </p>
        </div>

        <button
          type="button"
          className="btn"
          onClick={generateRecommendations}
          disabled={loading}
          style={loading ? styles.disabledButton : undefined}
        >
          {loading ? "Generating..." : "Generate Recommendations"}
        </button>
      </div>

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Style</span>
          <strong>{preferences?.style || "Not selected"}</strong>
        </div>

        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Budget</span>
          <strong>{preferences?.budget || "Not selected"}</strong>
        </div>

        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Preferred Fit</span>
          <strong>
            {preferences?.fit ||
              body?.scanResult?.fitType ||
              "Not selected"}
          </strong>
        </div>

        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Current Size Input</span>
          <strong>
            {body?.scanResult?.recommendedSize ||
              body?.size ||
              "Not selected"}
          </strong>
        </div>
      </div>

      {error ? <div style={styles.errorBox}>{error}</div> : null}

      {recommendationList.length === 0 && !loading ? (
        <div style={styles.emptyState}>
          <h2 style={styles.emptyTitle}>No recommendations generated yet</h2>
          <p style={styles.emptyText}>
            Click “Generate Recommendations” to analyze the profile, size, body
            inputs, and style preferences.
          </p>
        </div>
      ) : null}

      {recommendationList.length > 0 ? (
        <div style={styles.grid}>
          {recommendationList.map((outfit, index) => {
            const isSelected =
              selectedOutfit?.outfitId === outfit.outfitId ||
              selectedOutfit?.id === outfit.id;

            return (
              <article
                key={outfit.outfitId || outfit.id || index}
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

                  <div style={styles.matchBadge}>
                    {formatScore(outfit.matchScore || outfit.fitScore)} match
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <h2 style={styles.cardTitle}>
                      {outfit.title || outfit.name || "Recommended Outfit"}
                    </h2>

                    <span style={styles.price}>
                      {outfit.priceRange || outfit.price || "Price on request"}
                    </span>
                  </div>

                  <div style={styles.metrics}>
                    <div style={styles.metricBox}>
                      <span style={styles.metricLabel}>Size</span>
                      <strong>
                        {outfit.recommendedSize ||
                          body?.scanResult?.recommendedSize ||
                          body?.size ||
                          "M"}
                      </strong>
                    </div>

                    <div style={styles.metricBox}>
                      <span style={styles.metricLabel}>Fit</span>
                      <strong>
                        {outfit.fitType ||
                          preferences?.fit ||
                          body?.scanResult?.fitType ||
                          "Regular"}
                      </strong>
                    </div>

                    <div style={styles.metricBox}>
                      <span style={styles.metricLabel}>Confidence</span>
                      <strong>{formatScore(outfit.sizeConfidence)}</strong>
                    </div>
                  </div>

                  <div style={styles.reasonBox}>
                    <span style={styles.reasonLabel}>Why this suits you</span>
                    <p style={styles.reasonText}>
                      {outfit.whyThisSuitsYou ||
                        outfit.reason ||
                        "This outfit matches the selected style, budget, fit preference, and body profile."}
                    </p>
                  </div>

                  <button
                    type="button"
                    className={isSelected ? "btn" : "btn ghost"}
                    onClick={() => selectOutfit(outfit)}
                    style={styles.selectButton}
                  >
                    {isSelected ? "Selected" : "Select this outfit"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {selectedOutfit ? (
        <div style={styles.selectedSummary}>
          <strong>Selected outfit:</strong>{" "}
          {selectedOutfit.title || selectedOutfit.name || "Recommended Outfit"}
        </div>
      ) : null}

      <div className="row" style={styles.footer}>
        <button
          type="button"
          className="btn ghost"
          onClick={() => navigate("/guided-filters")}
        >
          Back
        </button>

        <button type="button" className="btn" onClick={continueToServiceType}>
          Confirm & Continue
        </button>
      </div>
    </PageShell>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  step: {
    margin: "0 0 8px",
    fontSize: "13px",
    opacity: 0.75,
  },
  title: {
    margin: 0,
    fontSize: "32px",
    lineHeight: 1.1,
  },
  subtitle: {
    margin: "10px 0 0",
    maxWidth: "680px",
    opacity: 0.85,
    lineHeight: 1.5,
  },
  disabledButton: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  summaryCard: {
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "16px",
    padding: "14px",
    background: "rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  summaryLabel: {
    fontSize: "12px",
    opacity: 0.7,
  },
  errorBox: {
    padding: "14px 16px",
    borderRadius: "16px",
    background: "rgba(255, 86, 86, 0.16)",
    border: "1px solid rgba(255, 120, 120, 0.35)",
    color: "#ffdede",
    marginBottom: "18px",
  },
  emptyState: {
    border: "1px dashed rgba(255,255,255,0.28)",
    borderRadius: "20px",
    padding: "28px",
    textAlign: "center",
    background: "rgba(255,255,255,0.04)",
  },
  emptyTitle: {
    margin: "0 0 8px",
  },
  emptyText: {
    margin: 0,
    opacity: 0.78,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
    marginTop: "12px",
  },
  outfitCard: {
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.07)",
    boxShadow: "0 16px 34px rgba(0,0,0,0.22)",
    transition: "transform 0.18s ease, border-color 0.18s ease",
  },
  selectedCard: {
    border: "2px solid rgba(0, 212, 255, 0.95)",
    boxShadow: "0 18px 42px rgba(0, 212, 255, 0.18)",
  },
  imageWrap: {
    position: "relative",
    height: "240px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.08)",
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
    color: "#fff",
    fontSize: "13px",
    fontWeight: 800,
    background: "linear-gradient(135deg,#7c5cff,#00d4ff)",
    boxShadow: "0 10px 22px rgba(0,0,0,0.28)",
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
    fontSize: "20px",
    lineHeight: 1.25,
  },
  price: {
    whiteSpace: "nowrap",
    fontSize: "13px",
    fontWeight: 800,
    padding: "7px 9px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.1)",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    margin: "16px 0",
  },
  metricBox: {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "14px",
    padding: "10px",
    background: "rgba(0,0,0,0.14)",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  metricLabel: {
    fontSize: "11px",
    opacity: 0.68,
  },
  reasonBox: {
    borderRadius: "16px",
    padding: "13px",
    background: "rgba(255,255,255,0.08)",
    marginBottom: "14px",
  },
  reasonLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: 800,
    marginBottom: "5px",
    opacity: 0.82,
  },
  reasonText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.5,
    opacity: 0.86,
  },
  selectButton: {
    width: "100%",
  },
  selectedSummary: {
    marginTop: "18px",
    padding: "14px 16px",
    borderRadius: "16px",
    background: "rgba(0, 212, 255, 0.12)",
    border: "1px solid rgba(0, 212, 255, 0.32)",
  },
  footer: {
    justifyContent: "space-between",
    marginTop: "24px",
  },
};
