import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const RATING_OPTIONS = [
  {
    value: "3+",
    title: "3+ Stars",
    subtitle: "More choices with basic quality filter.",
    icon: "⭐",
    level: "Flexible",
    matchText: "Good for budget-first browsing",
    gradient:
      "linear-gradient(135deg, rgba(255,191,71,0.95), rgba(255,170,91,0.82))",
  },
  {
    value: "4+",
    title: "4+ Stars",
    subtitle: "Balanced quality with enough expert options.",
    icon: "🌟",
    level: "Recommended",
    matchText: "Best balance of quality and availability",
    gradient:
      "linear-gradient(135deg, rgba(124,92,255,0.95), rgba(0,212,255,0.82))",
  },
  {
    value: "4.5+",
    title: "4.5+ Stars",
    subtitle: "Premium experts with stronger review trust.",
    icon: "💎",
    level: "Premium",
    matchText: "Best for designer, wedding, and high-trust work",
    gradient:
      "linear-gradient(135deg, rgba(255,122,162,0.95), rgba(255,122,236,0.82))",
  },
];

const LOCATION_OPTIONS = [
  {
    value: "Near Me",
    title: "Near Me",
    subtitle: "Find experts close to your current location.",
    icon: "📍",
    detail: "Best for quick visits, measurements, and pickup.",
    deliveryHint: "Usually supports offline visit",
    gradient:
      "linear-gradient(135deg, rgba(30,215,166,0.95), rgba(0,212,255,0.82))",
  },
  {
    value: "Within City",
    title: "Within City",
    subtitle: "View experts available anywhere in your city.",
    icon: "🏙️",
    detail: "Good balance between choice and convenience.",
    deliveryHint: "Useful for boutique or tailor visits",
    gradient:
      "linear-gradient(135deg, rgba(124,92,255,0.95), rgba(0,212,255,0.82))",
  },
  {
    value: "Anywhere (online)",
    title: "Anywhere Online",
    subtitle: "Explore experts who support remote consultation.",
    icon: "🌐",
    detail: "Best when you are open to virtual consults and delivery.",
    deliveryHint: "Best for online orders",
    gradient:
      "linear-gradient(135deg, rgba(174,92,255,0.95), rgba(255,122,236,0.82))",
  },
];

function getRatingNumber(value) {
  if (!value) return 0;
  return Number(String(value).replace("+", "")) || 0;
}

function getCompletionScore({ ratingFilter, locationFilter }) {
  let score = 0;

  if (ratingFilter) score += 50;
  if (locationFilter) score += 50;

  return score;
}

export default function QualityLocationPage() {
  const nav = useNavigate();

  const {
    ratingFilter,
    locationFilter,
    serviceType,
    recommendations,
    patch,
  } = useFlowStore();

  const [error, setError] = useState("");

  const selectedRating = useMemo(
    () => RATING_OPTIONS.find((item) => item.value === ratingFilter),
    [ratingFilter]
  );

  const selectedLocation = useMemo(
    () => LOCATION_OPTIONS.find((item) => item.value === locationFilter),
    [locationFilter]
  );

  const selectedOutfit = recommendations?.selectedOutfit || null;

  const completionScore = getCompletionScore({
    ratingFilter,
    locationFilter,
  });

  function selectRating(value) {
    setError("");
    patch({
      ratingFilter: value,
    });
  }

  function selectLocation(value) {
    setError("");
    patch({
      locationFilter: value,
    });
  }

  function findExperts() {
    if (!ratingFilter) {
      setError("Please select a rating filter before finding experts.");
      return;
    }

    if (!locationFilter) {
      setError("Please select a location preference before finding experts.");
      return;
    }

    nav("/experts");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes qualityFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes qualityPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 1000px) {
            .quality-header {
              grid-template-columns: 1fr !important;
            }

            .quality-title {
              font-size: 36px !important;
            }

            .quality-layout {
              grid-template-columns: 1fr !important;
            }

            .quality-rating-grid,
            .quality-location-grid {
              grid-template-columns: 1fr !important;
            }

            .quality-footer {
              flex-direction: column !important;
            }

            .quality-footer button {
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
          <section className="quality-header" style={styles.header}>
            <div>
              <div style={styles.stepPill}>
                <span style={styles.stepDot} />
                Step 7 of 12 · Quality & Location Filters
              </div>

              <h1 className="quality-title" style={styles.title}>
                Choose expert quality and reach.
              </h1>

              <p style={styles.subtitle}>
                FitGenie will use these filters to show the best matching
                tailors, designers, boutiques, or stylists based on your chosen
                service type.
              </p>
            </div>

            <aside style={styles.previewCard}>
              <div style={styles.previewIcon}>
                {selectedLocation?.icon || selectedRating?.icon || "⭐"}
              </div>

              <div>
                <p style={styles.previewLabel}>Expert search readiness</p>
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
                {completionScore < 100
                  ? "Select both rating and location to unlock expert matching."
                  : "Ready. FitGenie can now find experts matching your service preferences."}
              </p>
            </aside>
          </section>

          <section className="quality-layout" style={styles.layout}>
            <main style={styles.mainPanel}>
              <section style={styles.filterBlock}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>⭐</span>

                  <div>
                    <h2 style={styles.blockTitle}>Ratings / Quality Filter</h2>
                    <p style={styles.blockText}>
                      Choose the minimum rating level you want for the expert
                      list.
                    </p>
                  </div>
                </div>

                <div className="quality-rating-grid" style={styles.ratingGrid}>
                  {RATING_OPTIONS.map((option) => {
                    const selected = ratingFilter === option.value;

                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        whileHover={{ y: -6, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectRating(option.value)}
                        style={{
                          ...styles.ratingCard,
                          ...(selected ? styles.ratingCardSelected : {}),
                        }}
                      >
                        <div
                          style={{
                            ...styles.ratingVisual,
                            background: option.gradient,
                          }}
                        >
                          <span style={styles.ratingIcon}>{option.icon}</span>
                          <span style={styles.ratingBadge}>{option.level}</span>
                        </div>

                        <div style={styles.cardBody}>
                          <div style={styles.cardTitleRow}>
                            <div>
                              <h3 style={styles.cardTitle}>{option.title}</h3>
                              <p style={styles.cardText}>{option.subtitle}</p>
                            </div>

                            <span
                              style={{
                                ...styles.checkCircle,
                                ...(selected ? styles.checkCircleSelected : {}),
                              }}
                            >
                              {selected ? "✓" : ""}
                            </span>
                          </div>

                          <div style={styles.starRow}>
                            {[1, 2, 3, 4, 5].map((star) => {
                              const filled = star <= Math.floor(getRatingNumber(option.value));

                              return (
                                <span
                                  key={star}
                                  style={{
                                    ...styles.star,
                                    ...(filled ? styles.starFilled : {}),
                                  }}
                                >
                                  ★
                                </span>
                              );
                            })}
                            <span style={styles.starText}>{option.value}</span>
                          </div>

                          <p style={styles.matchText}>{option.matchText}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              <section style={styles.filterBlock}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>📍</span>

                  <div>
                    <h2 style={styles.blockTitle}>Location</h2>
                    <p style={styles.blockText}>
                      Choose how close or flexible the expert location should be.
                    </p>
                  </div>
                </div>

                <div className="quality-location-grid" style={styles.locationGrid}>
                  {LOCATION_OPTIONS.map((option) => {
                    const selected = locationFilter === option.value;

                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        whileHover={{ y: -6, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectLocation(option.value)}
                        style={{
                          ...styles.locationCard,
                          ...(selected ? styles.locationCardSelected : {}),
                        }}
                      >
                        <div
                          style={{
                            ...styles.locationVisual,
                            background: option.gradient,
                          }}
                        >
                          <span style={styles.locationIcon}>{option.icon}</span>
                        </div>

                        <div style={styles.locationBody}>
                          <div style={styles.cardTitleRow}>
                            <div>
                              <h3 style={styles.cardTitle}>{option.title}</h3>
                              <p style={styles.cardText}>{option.subtitle}</p>
                            </div>

                            <span
                              style={{
                                ...styles.checkCircle,
                                ...(selected ? styles.checkCircleSelected : {}),
                              }}
                            >
                              {selected ? "✓" : ""}
                            </span>
                          </div>

                          <p style={styles.locationDetail}>{option.detail}</p>

                          <span style={styles.deliveryHint}>
                            {option.deliveryHint}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            </main>

            <aside style={styles.sidePanel}>
              <div style={styles.sideTop}>
                <span style={styles.sideIcon}>🧞</span>

                <div>
                  <p style={styles.sideLabel}>Expert matching</p>
                  <h2 style={styles.sideTitle}>
                    {selectedRating && selectedLocation
                      ? "Ready"
                      : "Pending filters"}
                  </h2>
                </div>
              </div>

              <div style={styles.summaryList}>
                <div style={styles.summaryItem}>
                  <span>Selected Service</span>
                  <strong>{serviceType || "From previous step"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Selected Outfit</span>
                  <strong>
                    {selectedOutfit?.title ||
                      selectedOutfit?.name ||
                      "From recommendations"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Minimum Rating</span>
                  <strong>{selectedRating?.title || "Required"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Location Preference</span>
                  <strong>{selectedLocation?.title || "Required"}</strong>
                </div>
              </div>

              <div style={styles.nextCard}>
                <span style={styles.nextBadge}>Next step</span>

                <h3 style={styles.nextTitle}>Expert Listings</h3>

                <p style={styles.nextText}>
                  You will see expert cards with portfolio images, price range,
                  reviews, delivery time, and specialization.
                </p>

                <div style={styles.nextPills}>
                  <span>🖼 Portfolio</span>
                  <span>₹ Price</span>
                  <span>⭐ Reviews</span>
                  <span>⏱ Delivery</span>
                </div>
              </div>
            </aside>
          </section>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <section style={styles.finalSummary}>
            <div style={styles.finalIcon}>
              {selectedLocation?.icon || selectedRating?.icon || "🪄"}
            </div>

            <div>
              <p style={styles.finalLabel}>Selected expert filter</p>
              <strong style={styles.finalText}>
                {ratingFilter || locationFilter
                  ? `${ratingFilter || "Rating pending"} · ${
                      locationFilter || "Location pending"
                    }`
                  : "No quality or location filter selected yet"}
              </strong>
            </div>
          </section>

          <div className="quality-footer" style={styles.footer}>
            <button
              type="button"
              className="btn ghost"
              onClick={() => nav("/service-type")}
              style={styles.footerButton}
            >
              Back
            </button>

            <button
              type="button"
              className="btn"
              onClick={findExperts}
              style={styles.footerButton}
            >
              Find Experts
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
    animation: "qualityPulse 2s ease-in-out infinite",
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
    animation: "qualityFloat 3.2s ease-in-out infinite",
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
    gridTemplateColumns: "minmax(0, 1fr) 340px",
    gap: "18px",
    alignItems: "start",
  },
  mainPanel: {
    display: "grid",
    gap: "18px",
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
  ratingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },
  ratingCard: {
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
  ratingCardSelected: {
    border: "2px solid rgba(0,212,255,0.95)",
    boxShadow: "0 22px 50px rgba(0,212,255,0.14)",
  },
  ratingVisual: {
    height: "95px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px",
  },
  ratingIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "21px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.22)",
    border: "1px solid rgba(255,255,255,0.24)",
    fontSize: "31px",
    boxShadow: "0 14px 28px rgba(0,0,0,0.22)",
  },
  ratingBadge: {
    padding: "8px 11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.22)",
    border: "1px solid rgba(255,255,255,0.22)",
    fontSize: "12px",
    fontWeight: 900,
  },
  cardBody: {
    padding: "16px",
  },
  cardTitleRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
  },
  cardText: {
    margin: "8px 0 12px",
    color: "rgba(255,255,255,0.70)",
    lineHeight: 1.45,
    fontSize: "14px",
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
  starRow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginBottom: "10px",
  },
  star: {
    color: "rgba(255,255,255,0.28)",
    fontSize: "16px",
  },
  starFilled: {
    color: "#ffd36b",
  },
  starText: {
    marginLeft: "6px",
    color: "rgba(255,255,255,0.75)",
    fontSize: "13px",
    fontWeight: 900,
  },
  matchText: {
    margin: 0,
    padding: "10px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.07)",
    color: "rgba(255,255,255,0.72)",
    fontSize: "13px",
    lineHeight: 1.45,
  },
  locationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },
  locationCard: {
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
  locationCardSelected: {
    border: "2px solid rgba(0,212,255,0.95)",
    boxShadow: "0 22px 50px rgba(0,212,255,0.14)",
  },
  locationVisual: {
    height: "90px",
    display: "grid",
    placeItems: "center",
  },
  locationIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "21px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.22)",
    border: "1px solid rgba(255,255,255,0.24)",
    fontSize: "31px",
    boxShadow: "0 14px 28px rgba(0,0,0,0.22)",
  },
  locationBody: {
    padding: "16px",
  },
  locationDetail: {
    margin: "0 0 12px",
    color: "rgba(255,255,255,0.70)",
    fontSize: "13px",
    lineHeight: 1.45,
  },
  deliveryHint: {
    display: "inline-flex",
    padding: "7px 9px",
    borderRadius: "999px",
    background: "rgba(0,212,255,0.12)",
    border: "1px solid rgba(0,212,255,0.24)",
    color: "#d9fbff",
    fontSize: "12px",
    fontWeight: 900,
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
  nextCard: {
    marginTop: "14px",
    padding: "14px",
    borderRadius: "20px",
    background: "rgba(0,212,255,0.10)",
    border: "1px solid rgba(0,212,255,0.22)",
  },
  nextBadge: {
    display: "inline-flex",
    marginBottom: "8px",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.10)",
    color: "#d9fbff",
    fontSize: "11px",
    fontWeight: 900,
  },
  nextTitle: {
    margin: "0 0 8px",
    fontSize: "18px",
  },
  nextText: {
    margin: 0,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.5,
    fontSize: "13px",
  },
  nextPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
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
