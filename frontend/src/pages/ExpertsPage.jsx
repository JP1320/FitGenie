import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";
import { callApi } from "../services/api";

const FALLBACK_EXPERTS = [
  {
    id: "expert-1",
    name: "Urban Tailor Studio",
    rating: 4.8,
    location: "Near Me",
    address: "MG Road, City Center",
    phone: "+91 98765 43210",
    portfolio: [
      "https://images.unsplash.com/photo-1506629905607-d9d297d9aa84?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=900&auto=format&fit=crop",
    ],
    priceRange: "₹1,500 - ₹5,000",
    reviews: 128,
    deliveryTime: "3 - 7 days",
    specialization: "Custom Stitching / Casual / Formal",
    serviceTypes: ["Custom Stitching (Tailor)", "Ready-made + Alteration (Boutique)"],
    description:
      "Best for accurate measurements, everyday tailoring, alterations, and clean finishing.",
  },
  {
    id: "expert-2",
    name: "Regal Designer Boutique",
    rating: 4.9,
    location: "Within City",
    address: "Fashion Street, Main Market",
    phone: "+91 99887 77665",
    portfolio: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=900&auto=format&fit=crop",
    ],
    priceRange: "₹4,000 - ₹18,000",
    reviews: 212,
    deliveryTime: "7 - 15 days",
    specialization: "Designer Wear / Wedding / Festive",
    serviceTypes: ["Designer Wear", "Personal Styling"],
    description:
      "Best for premium events, festive outfits, portfolio-led designer guidance, and occasion styling.",
  },
  {
    id: "expert-3",
    name: "QuickFit Alteration Lounge",
    rating: 4.4,
    location: "Near Me",
    address: "Local Market, Sector 12",
    phone: "+91 91234 56789",
    portfolio: [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=900&auto=format&fit=crop",
    ],
    priceRange: "₹500 - ₹2,500",
    reviews: 96,
    deliveryTime: "1 - 4 days",
    specialization: "Alteration / Ready-made Fit Fix",
    serviceTypes: ["Ready-made + Alteration (Boutique)", "Custom Stitching (Tailor)"],
    description:
      "Best for fast alterations, ready-made outfit fixes, urgent fitting changes, and pickup orders.",
  },
  {
    id: "expert-4",
    name: "Aura Personal Styling",
    rating: 4.7,
    location: "Anywhere (online)",
    address: "Online Consultation",
    phone: "+91 90000 11223",
    portfolio: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?q=80&w=900&auto=format&fit=crop",
    ],
    priceRange: "₹999 - ₹4,999",
    reviews: 154,
    deliveryTime: "Same day - 3 days",
    specialization: "Personal Styling / Wardrobe Guidance",
    serviceTypes: ["Personal Styling", "Designer Wear"],
    description:
      "Best for virtual styling, outfit confusion, event looks, wardrobe advice, and online consults.",
  },
];

function getSelectedOutfit(flow) {
  return flow.recommendations?.selectedOutfit || flow.selectedOutfit || null;
}

function getRatingNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function getReviewCount(expert) {
  if (typeof expert.reviews === "number") return expert.reviews;
  if (Array.isArray(expert.reviews)) return expert.reviews.length;
  if (typeof expert.reviewCount === "number") return expert.reviewCount;
  return 0;
}

function getPortfolioImages(expert) {
  if (Array.isArray(expert.portfolio) && expert.portfolio.length > 0) {
    return expert.portfolio;
  }

  if (Array.isArray(expert.portfolioImages) && expert.portfolioImages.length > 0) {
    return expert.portfolioImages;
  }

  return FALLBACK_EXPERTS[0].portfolio;
}

function normalizeExpert(expert, index) {
  return {
    id: expert.id || expert._id || `expert-${index + 1}`,
    name: expert.name || expert.shopName || expert.title || "FitGenie Expert",
    rating: getRatingNumber(expert.rating || expert.averageRating || 4.2),
    location: expert.location || expert.area || "Within City",
    address: expert.address || expert.location || "Address available after selection",
    phone: expert.phone || expert.mobile || "Available after selection",
    portfolio: getPortfolioImages(expert),
    priceRange: expert.priceRange || expert.price || "Price on request",
    reviews: getReviewCount(expert) || 80 + index * 21,
    deliveryTime: expert.deliveryTime || expert.timeline || "3 - 7 days",
    specialization:
      expert.specialization || expert.category || "Custom Stitching / Styling",
    serviceTypes:
      Array.isArray(expert.serviceTypes) && expert.serviceTypes.length > 0
        ? expert.serviceTypes
        : ["Custom Stitching (Tailor)", "Designer Wear", "Ready-made + Alteration (Boutique)", "Personal Styling"],
    description:
      expert.description ||
      "Experienced fashion expert matched with your FitGenie preferences.",
  };
}

function getMinimumRatingValue(ratingFilter) {
  if (!ratingFilter) return 0;
  if (String(ratingFilter).includes("4.5")) return 4.5;
  if (String(ratingFilter).includes("4")) return 4;
  if (String(ratingFilter).includes("3")) return 3;
  return 0;
}

function serviceMatches(expert, serviceType) {
  if (!serviceType) return true;

  const serviceText = String(serviceType).toLowerCase();
  const specializationText = String(expert.specialization).toLowerCase();
  const expertServices = expert.serviceTypes.map((item) => String(item).toLowerCase());

  return (
    expertServices.some((item) => item.includes(serviceText) || serviceText.includes(item)) ||
    specializationText.includes(serviceText.split(" ")[0])
  );
}

function locationMatches(expert, locationFilter) {
  if (!locationFilter) return true;

  const location = String(expert.location).toLowerCase();
  const filter = String(locationFilter).toLowerCase();

  if (filter.includes("anywhere")) return true;
  if (filter.includes("within city")) {
    return (
      location.includes("within city") ||
      location.includes("near") ||
      location.includes("city")
    );
  }

  if (filter.includes("near")) {
    return location.includes("near") || location.includes("near me");
  }

  return true;
}

function filterExperts(experts, ratingFilter, locationFilter, serviceType) {
  const minimumRating = getMinimumRatingValue(ratingFilter);

  return experts.filter((expert) => {
    const ratingOk = expert.rating >= minimumRating;
    const locationOk = locationMatches(expert, locationFilter);
    const serviceOk = serviceMatches(expert, serviceType);

    return ratingOk && locationOk && serviceOk;
  });
}

export default function ExpertsPage() {
  const nav = useNavigate();
  const flow = useFlowStore();

  const {
    selectedExpert,
    serviceType,
    ratingFilter,
    locationFilter,
    patch,
  } = flow;

  const selectedOutfit = getSelectedOutfit(flow);

  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadSource, setLoadSource] = useState("fallback");
  const [error, setError] = useState("");

  useEffect(() => {
    loadExperts();
  }, []);

  const filteredExperts = useMemo(
    () => filterExperts(experts, ratingFilter, locationFilter, serviceType),
    [experts, ratingFilter, locationFilter, serviceType]
  );

  const bestExpert = filteredExperts[0] || null;

  const readinessScore = useMemo(() => {
    let score = 0;

    if (serviceType) score += 25;
    if (ratingFilter) score += 25;
    if (locationFilter) score += 25;
    if (selectedExpert) score += 25;

    return score;
  }, [serviceType, ratingFilter, locationFilter, selectedExpert]);

  async function loadExperts() {
    setLoading(true);
    setError("");

    try {
      const response = await callApi("/tailors");

      const apiList = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.tailors)
        ? response.data.tailors
        : Array.isArray(response?.data?.experts)
        ? response.data.experts
        : [];

      if (response.ok && apiList.length > 0) {
        setExperts(apiList.map(normalizeExpert));
        setLoadSource("api");
        return;
      }

      setExperts(FALLBACK_EXPERTS.map(normalizeExpert));
      setLoadSource("fallback");
    } catch (_error) {
      setExperts(FALLBACK_EXPERTS.map(normalizeExpert));
      setLoadSource("fallback");
    } finally {
      setLoading(false);
    }
  }

  function selectExpert(expert) {
    setError("");

    patch({
      selectedExpert: expert,
    });
  }

  function continueNext() {
    if (!selectedExpert) {
      setError("Please select one expert before continuing.");
      return;
    }

    nav("/delivery");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes expertSoftFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes expertSoftPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @keyframes expertSpin {
            to { transform: rotate(360deg); }
          }

          @media (max-width: 1080px) {
            .expert-header {
              grid-template-columns: 1fr !important;
            }

            .expert-title {
              font-size: 38px !important;
            }

            .expert-layout {
              grid-template-columns: 1fr !important;
            }

            .expert-grid {
              grid-template-columns: 1fr !important;
            }

            .expert-footer {
              flex-direction: column !important;
            }

            .expert-footer button {
              width: 100% !important;
            }
          }

          @media (max-width: 680px) {
            .expert-meta-grid {
              grid-template-columns: 1fr !important;
            }

            .expert-toolbar {
              flex-direction: column !important;
              align-items: stretch !important;
            }

            .expert-toolbar button {
              width: 100% !important;
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
          <section className="expert-header" style={styles.header}>
            <div>
              <div style={styles.stepPill}>
                <span style={styles.stepDot} />
                Step 8 of 12 · Select Expert
              </div>

              <h1 className="expert-title" style={styles.title}>
                Select the best expert for your fit.
              </h1>

              <p style={styles.subtitle}>
                Compare expert ratings, portfolio images, price range, reviews,
                delivery time, specialization, and location before choosing who
                receives your Fit Card.
              </p>
            </div>

            <aside style={styles.previewCard}>
              <div style={styles.previewTop}>
                <span style={styles.previewIcon}>
                  {selectedExpert ? "✅" : "🧵"}
                </span>

                <div>
                  <p style={styles.previewLabel}>Expert selection readiness</p>
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
                {selectedExpert
                  ? `${selectedExpert.name} is selected for the Fit Card handoff.`
                  : "Choose one expert to continue to delivery and interaction."}
              </p>

              <div style={styles.previewTags}>
                <span style={styles.previewTag}>
                  {ratingFilter || "Rating filter"}
                </span>
                <span style={styles.previewTag}>
                  {locationFilter || "Location filter"}
                </span>
              </div>
            </aside>
          </section>

          <section className="expert-layout" style={styles.layout}>
            <main style={styles.mainPanel}>
              <section style={styles.toolbarCard}>
                <div>
                  <p style={styles.toolbarLabel}>Available experts</p>
                  <h2 style={styles.toolbarTitle}>
                    {loading
                      ? "Loading experts..."
                      : `${filteredExperts.length} expert${
                          filteredExperts.length === 1 ? "" : "s"
                        } matched`}
                  </h2>
                </div>

                <div className="expert-toolbar" style={styles.toolbarActions}>
                  <span style={styles.sourceBadge}>
                    {loadSource === "api" ? "Live experts" : "Demo experts"}
                  </span>

                  <button
                    type="button"
                    onClick={loadExperts}
                    disabled={loading}
                    style={{
                      ...styles.refreshButton,
                      ...(loading ? styles.disabledButton : {}),
                    }}
                  >
                    {loading ? "Refreshing..." : "Refresh Experts"}
                  </button>
                </div>
              </section>

              {loadSource === "fallback" ? (
                <section style={styles.infoBox}>
                  <span style={styles.infoIcon}>ℹ️</span>
                  <p>
                    Showing polished demo experts because live expert data is not
                    available right now.
                  </p>
                </section>
              ) : null}

              {error ? <div style={styles.errorBox}>{error}</div> : null}

              {loading ? (
                <section style={styles.loadingCard}>
                  <div style={styles.spinner} />
                  <h2 style={styles.loadingTitle}>Finding experts...</h2>
                  <p style={styles.loadingText}>
                    FitGenie is matching rating, location, service type, and
                    outfit needs.
                  </p>
                </section>
              ) : null}

              {!loading && filteredExperts.length === 0 ? (
                <section style={styles.emptyCard}>
                  <div style={styles.emptyIcon}>🔎</div>
                  <h2 style={styles.emptyTitle}>No experts matched</h2>
                  <p style={styles.emptyText}>
                    Try lowering the rating filter or choosing a wider location
                    reach from the previous page.
                  </p>
                  <button
                    type="button"
                    onClick={() => nav("/quality-location")}
                    style={styles.emptyButton}
                  >
                    Adjust Filters
                  </button>
                </section>
              ) : null}

              {!loading && filteredExperts.length > 0 ? (
                <div className="expert-grid" style={styles.expertGrid}>
                  {filteredExperts.map((expert, index) => {
                    const selected = selectedExpert?.id === expert.id;
                    const portfolio = getPortfolioImages(expert);

                    return (
                      <motion.article
                        key={expert.id}
                        whileHover={{ y: -8 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          ...styles.expertCard,
                          ...(selected ? styles.expertCardSelected : {}),
                        }}
                      >
                        <div style={styles.portfolioWrap}>
                          <img
                            src={portfolio[0]}
                            alt={`${expert.name} portfolio`}
                            style={styles.mainPortfolioImage}
                          />

                          <div style={styles.portfolioOverlay}>
                            <span style={styles.rankBadge}>#{index + 1}</span>
                            <span style={styles.ratingBadge}>
                              ⭐ {expert.rating.toFixed(1)}
                            </span>
                          </div>

                          <div style={styles.miniPortfolioRow}>
                            {portfolio.slice(0, 3).map((image, imageIndex) => (
                              <img
                                key={`${expert.id}-${imageIndex}`}
                                src={image}
                                alt={`${expert.name} work ${imageIndex + 1}`}
                                style={styles.miniPortfolioImage}
                              />
                            ))}
                          </div>
                        </div>

                        <div style={styles.expertBody}>
                          <div style={styles.expertTitleRow}>
                            <div>
                              <h2 style={styles.expertName}>{expert.name}</h2>

                              <p style={styles.expertLocation}>
                                📍 {expert.location} · {expert.address}
                              </p>
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

                          <p style={styles.expertDescription}>
                            {expert.description}
                          </p>

                          <div className="expert-meta-grid" style={styles.metaGrid}>
                            <div style={styles.metaBox}>
                              <span>Price Range</span>
                              <strong>{expert.priceRange}</strong>
                            </div>

                            <div style={styles.metaBox}>
                              <span>Delivery Time</span>
                              <strong>{expert.deliveryTime}</strong>
                            </div>

                            <div style={styles.metaBox}>
                              <span>Reviews</span>
                              <strong>{expert.reviews} reviews</strong>
                            </div>

                            <div style={styles.metaBox}>
                              <span>Specialization</span>
                              <strong>{expert.specialization}</strong>
                            </div>
                          </div>

                          <div style={styles.reviewBox}>
                            <span style={styles.reviewBadge}>Customer highlight</span>
                            <p style={styles.reviewText}>
                              “Great communication, clean finishing, and helpful
                              size guidance.”
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => selectExpert(expert)}
                            style={{
                              ...styles.selectButton,
                              ...(selected ? styles.selectButtonSelected : {}),
                            }}
                          >
                            {selected ? "Selected Expert" : "Select Expert"}
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
                  {selectedExpert ? "✅" : "🧞"}
                </span>

                <div>
                  <p style={styles.sideLabel}>Selection summary</p>
                  <h2 style={styles.sideTitle}>
                    {selectedExpert?.name || "Pending"}
                  </h2>
                </div>
              </div>

              <div style={styles.summaryList}>
                <div style={styles.summaryItem}>
                  <span>Selected Outfit</span>
                  <strong>
                    {selectedOutfit?.title ||
                      selectedOutfit?.name ||
                      "From recommendations"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Service Type</span>
                  <strong>{serviceType || "From service step"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Rating Filter</span>
                  <strong>{ratingFilter || "From filter step"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Location Filter</span>
                  <strong>{locationFilter || "From filter step"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Best Match</span>
                  <strong>{bestExpert?.name || "No expert yet"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Selected Expert</span>
                  <strong>{selectedExpert?.name || "Required"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Expert Contact</span>
                  <strong>{selectedExpert?.phone || "After selection"}</strong>
                </div>
              </div>

              <div style={styles.nextCard}>
                <span style={styles.nextBadge}>Next step</span>

                <h3 style={styles.nextTitle}>Delivery & Interaction</h3>

                <p style={styles.nextText}>
                  Choose online, offline, or both. Then schedule consultation
                  and decide whether to enable chat with the expert.
                </p>

                <div style={styles.nextPills}>
                  <span>💻 Online</span>
                  <span>🏬 Offline</span>
                  <span>💬 Chat</span>
                  <span>🗓️ Schedule</span>
                </div>
              </div>
            </aside>
          </section>

          <section style={styles.finalSummary}>
            <div style={styles.finalIcon}>
              {selectedExpert ? "✅" : "🧵"}
            </div>

            <div>
              <p style={styles.finalLabel}>Selected expert status</p>
              <strong style={styles.finalText}>
                {selectedExpert
                  ? `${selectedExpert.name} · ${selectedExpert.rating.toFixed(
                      1
                    )} stars · ${selectedExpert.deliveryTime}`
                  : "No expert selected yet"}
              </strong>
            </div>
          </section>

          <div className="expert-footer" style={styles.footer}>
            <button
              type="button"
              onClick={() => nav("/quality-location")}
              style={styles.backButton}
            >
              ← Back
            </button>

            <button type="button" onClick={continueNext} style={styles.nextButton}>
              Continue to Delivery →
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
    animation: "expertSoftPulse 2s ease-in-out infinite",
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
    animation: "expertSoftFloat 3.2s ease-in-out infinite",
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
    gridTemplateColumns: "minmax(0, 1fr) 350px",
    gap: "18px",
    alignItems: "start",
  },
  mainPanel: {
    display: "grid",
    gap: "16px",
  },
  toolbarCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "26px",
    padding: "18px",
    background: "rgba(255,255,255,0.76)",
    boxShadow: "0 16px 38px rgba(15, 23, 42, 0.08)",
  },
  toolbarLabel: {
    margin: "0 0 5px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  toolbarTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "24px",
  },
  toolbarActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  sourceBadge: {
    padding: "9px 11px",
    borderRadius: "999px",
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
    color: "#0891b2",
    fontSize: "12px",
    fontWeight: 900,
  },
  refreshButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "11px 15px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.06)",
  },
  disabledButton: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
  infoBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "13px 15px",
    borderRadius: "18px",
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
    color: "#475569",
    fontWeight: 700,
  },
  infoIcon: {
    fontSize: "19px",
  },
  errorBox: {
    padding: "13px 15px",
    borderRadius: "16px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#be123c",
    fontWeight: 800,
  },
  loadingCard: {
    padding: "34px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.76)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    textAlign: "center",
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)",
  },
  spinner: {
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    border: "5px solid #e2e8f0",
    borderTopColor: "#6d5dfc",
    margin: "0 auto 16px",
    animation: "expertSpin 1s linear infinite",
  },
  loadingTitle: {
    margin: "0 0 8px",
    color: "#111827",
    fontSize: "24px",
  },
  loadingText: {
    margin: 0,
    color: "#475569",
    fontWeight: 600,
  },
  emptyCard: {
    padding: "34px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.76)",
    border: "1px dashed rgba(109, 93, 252, 0.28)",
    textAlign: "center",
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)",
  },
  emptyIcon: {
    width: "70px",
    height: "70px",
    borderRadius: "25px",
    display: "grid",
    placeItems: "center",
    margin: "0 auto 16px",
    background: "linear-gradient(135deg, #ede9fe, #cffafe)",
    fontSize: "34px",
  },
  emptyTitle: {
    margin: "0 0 8px",
    color: "#111827",
    fontSize: "25px",
  },
  emptyText: {
    margin: "0 auto 18px",
    maxWidth: "520px",
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
  expertGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
    gap: "18px",
  },
  expertCard: {
    overflow: "hidden",
    border: "2px solid rgba(148, 163, 184, 0.22)",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.86)",
    boxShadow: "0 16px 38px rgba(15, 23, 42, 0.10)",
    color: "#111827",
  },
  expertCardSelected: {
    border: "2px solid #6d5dfc",
    boxShadow: "0 22px 48px rgba(109, 93, 252, 0.18)",
  },
  portfolioWrap: {
    position: "relative",
    height: "250px",
    overflow: "hidden",
    background: "#eef2ff",
  },
  mainPortfolioImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  portfolioOverlay: {
    position: "absolute",
    inset: "12px 12px auto 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rankBadge: {
    width: "40px",
    height: "40px",
    borderRadius: "15px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.84)",
    border: "1px solid rgba(255,255,255,0.72)",
    color: "#111827",
    fontWeight: 900,
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.14)",
  },
  ratingBadge: {
    padding: "8px 11px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 900,
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.18)",
  },
  miniPortfolioRow: {
    position: "absolute",
    left: "12px",
    right: "12px",
    bottom: "12px",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
  },
  miniPortfolioImage: {
    height: "58px",
    width: "100%",
    objectFit: "cover",
    borderRadius: "16px",
    border: "2px solid rgba(255,255,255,0.82)",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.18)",
  },
  expertBody: {
    padding: "17px",
  },
  expertTitleRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
  },
  expertName: {
    margin: 0,
    color: "#111827",
    fontSize: "22px",
    lineHeight: 1.24,
  },
  expertLocation: {
    margin: "7px 0 0",
    color: "#64748b",
    lineHeight: 1.4,
    fontSize: "13px",
    fontWeight: 800,
  },
  checkCircle: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 900,
    flex: "0 0 auto",
  },
  checkCircleSelected: {
    background: "#6d5dfc",
    borderColor: "#6d5dfc",
    color: "#ffffff",
  },
  expertDescription: {
    margin: "0 0 14px",
    color: "#475569",
    lineHeight: 1.55,
    fontSize: "14px",
    fontWeight: 600,
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
    marginBottom: "13px",
  },
  metaBox: {
    padding: "11px",
    borderRadius: "16px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    display: "grid",
    gap: "4px",
  },
  reviewBox: {
    padding: "13px",
    borderRadius: "18px",
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
    marginBottom: "14px",
  },
  reviewBadge: {
    display: "inline-flex",
    marginBottom: "7px",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#0891b2",
    fontSize: "11px",
    fontWeight: 900,
  },
  reviewText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.5,
    fontSize: "13px",
    fontWeight: 700,
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
  selectButtonSelected: {
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
  nextCard: {
    marginTop: "14px",
    padding: "14px",
    borderRadius: "20px",
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
  },
  nextBadge: {
    display: "inline-flex",
    marginBottom: "8px",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#0891b2",
    fontSize: "11px",
    fontWeight: 900,
  },
  nextTitle: {
    margin: "0 0 8px",
    color: "#111827",
    fontSize: "18px",
  },
  nextText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.5,
    fontSize: "13px",
    fontWeight: 700,
  },
  nextPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
    color: "#334155",
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
