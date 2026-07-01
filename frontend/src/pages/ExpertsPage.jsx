import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";
import { callApi } from "../services/api";

const FALLBACK_EXPERTS = [
  {
    id: "expert_tailor_001",
    name: "Urban Tailor Studio",
    rating: 4.7,
    location: "Near Me",
    priceRange: "₹1,500 - ₹4,000",
    deliveryTime: "5 - 7 days",
    specialization: "Casual, formal, alterations",
    serviceTypes: ["Custom Stitching (Tailor)", "Ready-made + Alteration (Boutique)"],
    phone: "+91 90000 00001",
    address: "City Center, Main Road",
    portfolioImages: [
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop",
    ],
    reviews: [
      {
        user: "Aarav",
        rating: 4.7,
        text: "Excellent fit and fast delivery. The alteration was very clean.",
      },
    ],
  },
  {
    id: "expert_designer_001",
    name: "Regal Designer Boutique",
    rating: 4.8,
    location: "Within City",
    priceRange: "₹3,000 - ₹8,000",
    deliveryTime: "7 - 12 days",
    specialization: "Wedding, festive, designer wear",
    serviceTypes: ["Designer Wear", "Custom Stitching (Tailor)"],
    phone: "+91 90000 00002",
    address: "Boutique Street, Central Market",
    portfolioImages: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop",
    ],
    reviews: [
      {
        user: "Meera",
        rating: 4.8,
        text: "Beautiful finishing and premium fabric suggestion.",
      },
    ],
  },
  {
    id: "expert_boutique_001",
    name: "QuickFit Alteration Lounge",
    rating: 4.4,
    location: "Near Me",
    priceRange: "₹600 - ₹2,500",
    deliveryTime: "2 - 5 days",
    specialization: "Ready-made fitting, hemming, resizing",
    serviceTypes: ["Ready-made + Alteration (Boutique)"],
    phone: "+91 90000 00003",
    address: "Market Road, Near City Mall",
    portfolioImages: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop",
    ],
    reviews: [
      {
        user: "Riya",
        rating: 4.4,
        text: "Good for quick alterations and pickup.",
      },
    ],
  },
  {
    id: "expert_stylist_001",
    name: "Aura Personal Styling",
    rating: 4.6,
    location: "Anywhere (online)",
    priceRange: "₹999 - ₹3,999",
    deliveryTime: "Same day - 3 days",
    specialization: "Personal styling, events, wardrobe planning",
    serviceTypes: ["Personal Styling"],
    phone: "+91 90000 00004",
    address: "Online consultation available",
    portfolioImages: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=1200&auto=format&fit=crop",
    ],
    reviews: [
      {
        user: "Kabir",
        rating: 4.6,
        text: "The styling suggestions were practical and event-ready.",
      },
    ],
  },
];

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getRatingNumber(value) {
  return Number(String(value || "").replace("+", "")) || 0;
}

function getReviewCount(reviews) {
  if (Array.isArray(reviews)) return reviews.length;
  if (typeof reviews === "number") return reviews;
  return 0;
}

function getFirstReview(expert) {
  if (Array.isArray(expert.reviews) && expert.reviews.length > 0) {
    return expert.reviews[0];
  }

  return {
    user: "Verified customer",
    rating: expert.rating || 4.5,
    text: "Good service quality and reliable fitting experience.",
  };
}

function getPortfolioImages(expert) {
  if (Array.isArray(expert.portfolioImages) && expert.portfolioImages.length > 0) {
    return expert.portfolioImages;
  }

  if (Array.isArray(expert.portfolio) && expert.portfolio.length > 0) {
    return expert.portfolio;
  }

  return [
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
  ];
}

function normalizeExpert(expert, index) {
  return {
    id: expert.id || expert._id || `expert_${index + 1}`,
    name: expert.name || "FitGenie Expert",
    rating: Number(expert.rating || 4.5),
    location: expert.location || "Within City",
    priceRange: expert.priceRange || "₹1,500 - ₹5,000",
    deliveryTime: expert.deliveryTime || "3 - 7 days",
    specialization: expert.specialization || "Custom stitching and alteration",
    serviceTypes: expert.serviceTypes || [],
    phone: expert.phone || "+91 90000 00000",
    address: expert.address || expert.location || "Address available after booking",
    portfolioImages: getPortfolioImages(expert),
    reviews: expert.reviews || 0,
  };
}

function locationMatches(expertLocation, selectedLocation) {
  const expert = normalizeText(expertLocation);
  const selected = normalizeText(selectedLocation);

  if (!selected) return true;
  if (selected.includes("anywhere")) return true;

  if (selected.includes("near")) {
    return (
      expert.includes("near") ||
      expert.includes("city center") ||
      expert.includes("local") ||
      expert.includes("market")
    );
  }

  if (selected.includes("within city")) {
    return (
      expert.includes("within") ||
      expert.includes("city") ||
      expert.includes("near") ||
      expert.includes("market") ||
      expert.includes("center")
    );
  }

  return expert.includes(selected);
}

function serviceMatches(expert, serviceType) {
  if (!serviceType) return true;

  const service = normalizeText(serviceType);
  const expertServiceTypes = Array.isArray(expert.serviceTypes)
    ? expert.serviceTypes.map(normalizeText)
    : [];

  if (expertServiceTypes.some((item) => item === service)) return true;

  const specialization = normalizeText(expert.specialization);
  const name = normalizeText(expert.name);

  if (service.includes("designer")) {
    return specialization.includes("designer") || name.includes("designer") || name.includes("boutique");
  }

  if (service.includes("tailor") || service.includes("custom")) {
    return specialization.includes("stitch") || specialization.includes("tailor") || name.includes("tailor");
  }

  if (service.includes("alteration") || service.includes("boutique")) {
    return specialization.includes("alteration") || name.includes("boutique");
  }

  if (service.includes("styling")) {
    return specialization.includes("styling") || name.includes("styling") || name.includes("stylist");
  }

  return true;
}

function filterExperts(experts, { ratingFilter, locationFilter, serviceType }) {
  const minimumRating = getRatingNumber(ratingFilter);

  const filtered = experts.filter((expert) => {
    const ratingOk = minimumRating ? Number(expert.rating || 0) >= minimumRating : true;
    const locationOk = locationMatches(expert.location, locationFilter);
    const serviceOk = serviceMatches(expert, serviceType);

    return ratingOk && locationOk && serviceOk;
  });

  if (filtered.length > 0) return filtered;

  return experts.filter((expert) => {
    const ratingOk = minimumRating ? Number(expert.rating || 0) >= minimumRating : true;
    const locationOk = locationMatches(expert.location, locationFilter);

    return ratingOk && locationOk;
  });
}

export default function ExpertsPage() {
  const nav = useNavigate();

  const {
    selectedExpert,
    serviceType,
    ratingFilter,
    locationFilter,
    recommendations,
    patch,
  } = useFlowStore();

  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadSource, setLoadSource] = useState("api");
  const [error, setError] = useState("");

  const selectedOutfit = recommendations?.selectedOutfit || null;

  useEffect(() => {
    loadExperts();
  }, []);

  async function loadExperts() {
    setLoading(true);
    setError("");

    try {
      const response = await callApi("/tailors");

      if (response.ok && Array.isArray(response.data)) {
        setExperts(response.data.map(normalizeExpert));
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

  const filteredExperts = useMemo(
    () =>
      filterExperts(experts, {
        ratingFilter,
        locationFilter,
        serviceType,
      }),
    [experts, ratingFilter, locationFilter, serviceType]
  );

  const selectedExpertFromList = useMemo(
    () => filteredExperts.find((expert) => expert.id === selectedExpert?.id),
    [filteredExperts, selectedExpert]
  );

  function selectExpert(expert) {
    setError("");
    patch({
      selectedExpert: expert,
    });
  }

  function continueNext() {
    if (!selectedExpert) {
      setError("Please select one expert before continuing to delivery.");
      return;
    }

    nav("/delivery");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes expertFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes expertPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 1100px) {
            .expert-header {
              grid-template-columns: 1fr !important;
            }

            .expert-title {
              font-size: 36px !important;
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

          @media (max-width: 640px) {
            .expert-meta-grid {
              grid-template-columns: 1fr !important;
            }

            .expert-portfolio {
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
                Choose from matched tailors, designers, boutiques, or stylists.
                Each listing includes portfolio images, price range, reviews,
                delivery time, and specialization.
              </p>
            </div>

            <aside style={styles.previewCard}>
              <div style={styles.previewIcon}>
                {selectedExpert ? "✅" : "🧵"}
              </div>

              <div>
                <p style={styles.previewLabel}>Selected expert</p>
                <h2 style={styles.previewTitle}>
                  {selectedExpert?.name || "Expert pending"}
                </h2>
                <p style={styles.previewText}>
                  {selectedExpert
                    ? `${selectedExpert.specialization} · ${selectedExpert.deliveryTime}`
                    : "Pick one expert to continue to delivery and consultation options."}
                </p>
              </div>

              <div style={styles.previewLine} />

              <div style={styles.previewChips}>
                <span style={styles.previewChip}>{ratingFilter || "Rating filter"}</span>
                <span style={styles.previewChip}>{locationFilter || "Location filter"}</span>
                <span style={styles.previewChip}>{serviceType || "Service type"}</span>
              </div>
            </aside>
          </section>

          <section className="expert-layout" style={styles.layout}>
            <main style={styles.mainPanel}>
              <div style={styles.toolbar}>
                <div>
                  <h2 style={styles.toolbarTitle}>
                    {loading
                      ? "Loading matched experts..."
                      : `${filteredExperts.length} expert${
                          filteredExperts.length === 1 ? "" : "s"
                        } found`}
                  </h2>

                  <p style={styles.toolbarText}>
                    Showing experts based on your selected service, rating, and
                    location filters.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn ghost"
                  onClick={loadExperts}
                  disabled={loading}
                  style={styles.refreshButton}
                >
                  {loading ? "Loading..." : "Refresh Experts"}
                </button>
              </div>

              {loadSource === "fallback" ? (
                <div style={styles.infoBox}>
                  Using demo expert listings because the backend expert API is
                  unavailable or returned no valid list.
                </div>
              ) : null}

              {loading ? (
                <div style={styles.loadingCard}>
                  <div style={styles.spinner} />
                  <h3 style={styles.loadingTitle}>Finding experts...</h3>
                  <p style={styles.loadingText}>
                    Matching your service type, quality preference, and location
                    filter.
                  </p>
                </div>
              ) : null}

              {!loading && filteredExperts.length === 0 ? (
                <div style={styles.emptyCard}>
                  <h3 style={styles.emptyTitle}>No exact expert matches found</h3>
                  <p style={styles.emptyText}>
                    Try lowering the rating filter or changing the location
                    preference.
                  </p>

                  <button
                    type="button"
                    className="btn"
                    onClick={() => nav("/quality-location")}
                  >
                    Adjust Filters
                  </button>
                </div>
              ) : null}

              {!loading && filteredExperts.length > 0 ? (
                <div className="expert-grid" style={styles.expertGrid}>
                  {filteredExperts.map((expert) => {
                    const selected = selectedExpert?.id === expert.id;
                    const firstReview = getFirstReview(expert);
                    const portfolioImages = getPortfolioImages(expert);

                    return (
                      <motion.article
                        key={expert.id}
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          ...styles.expertCard,
                          ...(selected ? styles.expertCardSelected : {}),
                        }}
                      >
                        <div className="expert-portfolio" style={styles.portfolioGrid}>
                          <div style={styles.mainImageWrap}>
                            <img
                              src={portfolioImages[0]}
                              alt={`${expert.name} portfolio`}
                              style={styles.portfolioImage}
                            />

                            <span style={styles.ratingBadge}>
                              ⭐ {Number(expert.rating || 0).toFixed(1)}
                            </span>
                          </div>

                          <div style={styles.smallImageStack}>
                            <img
                              src={portfolioImages[1] || portfolioImages[0]}
                              alt={`${expert.name} work sample`}
                              style={styles.smallImage}
                            />

                            <div style={styles.portfolioOverlay}>
                              Portfolio
                            </div>
                          </div>
                        </div>

                        <div style={styles.cardBody}>
                          <div style={styles.cardTitleRow}>
                            <div>
                              <h3 style={styles.expertName}>{expert.name}</h3>
                              <p style={styles.expertLocation}>📍 {expert.location}</p>
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

                          <p style={styles.specialization}>
                            {expert.specialization}
                          </p>

                          <div className="expert-meta-grid" style={styles.metaGrid}>
                            <div style={styles.metaItem}>
                              <span>Price Range</span>
                              <strong>{expert.priceRange}</strong>
                            </div>

                            <div style={styles.metaItem}>
                              <span>Delivery Time</span>
                              <strong>{expert.deliveryTime}</strong>
                            </div>

                            <div style={styles.metaItem}>
                              <span>Reviews</span>
                              <strong>{getReviewCount(expert.reviews)} reviews</strong>
                            </div>

                            <div style={styles.metaItem}>
                              <span>Phone</span>
                              <strong>{expert.phone}</strong>
                            </div>
                          </div>

                          <div style={styles.reviewBox}>
                            <div style={styles.reviewTop}>
                              <strong>{firstReview.user}</strong>
                              <span>⭐ {firstReview.rating}</span>
                            </div>

                            <p style={styles.reviewText}>{firstReview.text}</p>
                          </div>

                          <div style={styles.actionRow}>
                            <button
                              type="button"
                              className={selected ? "btn" : "btn ghost"}
                              onClick={() => selectExpert(expert)}
                              style={styles.selectButton}
                            >
                              {selected ? "Selected Expert" : "Select Expert"}
                            </button>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              ) : null}
            </main>

            <aside style={styles.sidePanel}>
              <div style={styles.sideTop}>
                <span style={styles.sideIcon}>🧞</span>

                <div>
                  <p style={styles.sideLabel}>Expert match summary</p>
                  <h2 style={styles.sideTitle}>
                    {selectedExpertFromList?.name ||
                      selectedExpert?.name ||
                      "Pending"}
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
                  <strong>{serviceType || "From previous step"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Rating Filter</span>
                  <strong>{ratingFilter || "Not selected"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Location Filter</span>
                  <strong>{locationFilter || "Not selected"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Selected Expert</span>
                  <strong>{selectedExpert?.name || "Required"}</strong>
                </div>
              </div>

              {selectedExpert ? (
                <div style={styles.selectedBox}>
                  <span style={styles.selectedBadge}>Selected</span>

                  <h3 style={styles.selectedTitle}>{selectedExpert.name}</h3>

                  <p style={styles.selectedText}>
                    {selectedExpert.address}
                    <br />
                    {selectedExpert.phone}
                  </p>
                </div>
              ) : (
                <div style={styles.selectedBox}>
                  <span style={styles.selectedBadge}>Next</span>

                  <h3 style={styles.selectedTitle}>Delivery preference</h3>

                  <p style={styles.selectedText}>
                    After selecting an expert, choose online, offline, or both
                    delivery/consultation mode.
                  </p>
                </div>
              )}

              <div style={styles.nextPills}>
                <span>🗓 Calendar</span>
                <span>💬 Chat</span>
                <span>📦 Delivery</span>
              </div>
            </aside>
          </section>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <section style={styles.finalSummary}>
            <div style={styles.finalIcon}>
              {selectedExpert ? "✅" : "🪄"}
            </div>

            <div>
              <p style={styles.finalLabel}>Selected expert card</p>
              <strong style={styles.finalText}>
                {selectedExpert
                  ? `${selectedExpert.name} · ${selectedExpert.priceRange} · ${selectedExpert.deliveryTime}`
                  : "No expert selected yet"}
              </strong>
            </div>
          </section>

          <div className="expert-footer" style={styles.footer}>
            <button
              type="button"
              className="btn ghost"
              onClick={() => nav("/quality-location")}
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
              Continue to Delivery
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
    animation: "expertPulse 2s ease-in-out infinite",
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
    animation: "expertFloat 3.2s ease-in-out infinite",
  },
  previewLabel: {
    margin: "0 0 4px",
    color: "rgba(255,255,255,0.62)",
    fontWeight: 900,
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  previewTitle: {
    margin: 0,
    fontSize: "22px",
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
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 340px",
    gap: "18px",
    alignItems: "start",
  },
  mainPanel: {
    display: "grid",
    gap: "16px",
  },
  toolbar: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "28px",
    padding: "20px",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  toolbarTitle: {
    margin: "0 0 6px",
    fontSize: "24px",
  },
  toolbarText: {
    margin: 0,
    color: "rgba(255,255,255,0.68)",
    lineHeight: 1.5,
  },
  refreshButton: {
    minWidth: "160px",
  },
  infoBox: {
    padding: "13px 15px",
    borderRadius: "16px",
    background: "rgba(0,212,255,0.10)",
    border: "1px solid rgba(0,212,255,0.25)",
    color: "#d9fbff",
  },
  loadingCard: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "28px",
    padding: "38px",
    background: "rgba(255,255,255,0.06)",
    textAlign: "center",
  },
  spinner: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    border: "4px solid rgba(255,255,255,0.18)",
    borderTopColor: "#fff",
    margin: "0 auto 16px",
    animation: "spin 1s linear infinite",
  },
  loadingTitle: {
    margin: "0 0 8px",
  },
  loadingText: {
    margin: 0,
    color: "rgba(255,255,255,0.68)",
  },
  emptyCard: {
    border: "1px dashed rgba(255,255,255,0.28)",
    borderRadius: "28px",
    padding: "34px",
    background: "rgba(255,255,255,0.05)",
    textAlign: "center",
  },
  emptyTitle: {
    margin: "0 0 8px",
  },
  emptyText: {
    margin: "0 0 18px",
    color: "rgba(255,255,255,0.68)",
  },
  expertGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },
  expertCard: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "28px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.065)",
    boxShadow: "0 18px 42px rgba(0,0,0,0.18)",
  },
  expertCardSelected: {
    border: "2px solid rgba(0,212,255,0.95)",
    boxShadow: "0 24px 60px rgba(0,212,255,0.16)",
  },
  portfolioGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 0.8fr",
    gap: "2px",
    height: "210px",
    background: "rgba(0,0,0,0.18)",
  },
  mainImageWrap: {
    position: "relative",
    overflow: "hidden",
  },
  portfolioImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  ratingBadge: {
    position: "absolute",
    left: "12px",
    top: "12px",
    padding: "8px 11px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.52)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(10px)",
    fontWeight: 900,
  },
  smallImageStack: {
    position: "relative",
    overflow: "hidden",
  },
  smallImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  portfolioOverlay: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,0.36)",
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
  expertName: {
    margin: 0,
    fontSize: "21px",
  },
  expertLocation: {
    margin: "6px 0 0",
    color: "rgba(255,255,255,0.66)",
    fontSize: "14px",
  },
  checkCircle: {
    width: "28px",
    height: "28px",
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
  specialization: {
    margin: "12px 0",
    padding: "10px 12px",
    borderRadius: "16px",
    background: "rgba(0,212,255,0.10)",
    border: "1px solid rgba(0,212,255,0.20)",
    color: "#d9fbff",
    fontSize: "13px",
    lineHeight: 1.45,
    fontWeight: 800,
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "12px",
  },
  metaItem: {
    padding: "10px",
    borderRadius: "14px",
    background: "rgba(0,0,0,0.16)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: "4px",
  },
  reviewBox: {
    padding: "12px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.09)",
    marginBottom: "14px",
  },
  reviewTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "6px",
  },
  reviewText: {
    margin: 0,
    color: "rgba(255,255,255,0.68)",
    lineHeight: 1.45,
    fontSize: "13px",
  },
  actionRow: {
    display: "flex",
  },
  selectButton: {
    width: "100%",
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
  selectedBox: {
    marginTop: "14px",
    padding: "14px",
    borderRadius: "20px",
    background: "rgba(0,212,255,0.10)",
    border: "1px solid rgba(0,212,255,0.22)",
  },
  selectedBadge: {
    display: "inline-flex",
    marginBottom: "8px",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.10)",
    color: "#d9fbff",
    fontSize: "11px",
    fontWeight: 900,
  },
  selectedTitle: {
    margin: "0 0 8px",
    fontSize: "18px",
  },
  selectedText: {
    margin: 0,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.5,
    fontSize: "13px",
  },
  nextPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "14px",
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
    minWidth: "210px",
  },
};
