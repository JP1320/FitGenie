import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";
import { callApi } from "../services/api";

function getNowText() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSafeValue(value, fallback = "Not provided") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : fallback;
  }

  return value;
}

function getSelectedOutfit(state) {
  return state.recommendations?.selectedOutfit || state.selectedOutfit || null;
}

function getSelectedExpert(state) {
  return state.selectedExpert || state.marketplace?.selectedExpert || null;
}

function getDeliveryMode(state) {
  return state.deliveryMode || state.delivery?.mode || "Not selected";
}

function getDeliverySchedule(state) {
  return (
    state.deliverySchedule ||
    state.schedule ||
    state.delivery?.schedule ||
    "Not selected"
  );
}

function getBodyType(state) {
  return (
    state.bodyType ||
    state.body?.bodyType ||
    state.scanResult?.bodyType ||
    state.body?.scanResult?.bodyType ||
    "Not provided"
  );
}

function getRecommendedSize(state) {
  return (
    state.size ||
    state.body?.size ||
    state.scanResult?.recommendedSize ||
    state.body?.scanResult?.recommendedSize ||
    "Not provided"
  );
}

function getHeight(state) {
  const exactHeight =
    state.heightCm ||
    state.body?.heightCm ||
    state.scanResult?.detectedHeightCm ||
    state.scanResult?.height ||
    state.body?.scanResult?.detectedHeightCm ||
    state.body?.scanResult?.height;

  if (exactHeight) {
    return `${exactHeight} cm`;
  }

  return state.heightRange || state.body?.heightRange || "Not provided";
}

function buildFitCard(state) {
  const selectedOutfit = getSelectedOutfit(state);
  const selectedExpert = getSelectedExpert(state);

  const deliveryMode = getDeliveryMode(state);
  const deliverySchedule = getDeliverySchedule(state);

  return {
    fitCardId: `FC-${Date.now()}`,
    generatedAt: getNowText(),

    userIntent: {
      purchaseFor:
        state.forWhom ||
        state.intent?.type ||
        "Not provided",
      relation:
        state.relation ||
        state.intent?.subType ||
        "Not provided",
      occasion:
        state.occasion ||
        state.intent?.subType ||
        "Not provided",
    },

    basicProfile: {
      ageRange:
        state.ageRange ||
        state.age ||
        state.profile?.ageRange ||
        "Not provided",
      gender:
        state.gender ||
        state.profile?.gender ||
        "Not provided",
    },

    measurements: {
      bodyType: getBodyType(state),
      size: getRecommendedSize(state),
      height: getHeight(state),
      scanConfidence:
        state.scanResult?.confidence ||
        state.body?.scanResult?.confidence ||
        "Manual / Not scanned",
      fitType:
        state.scanResult?.fitType ||
        state.body?.scanResult?.fitType ||
        state.fitDetails?.fit ||
        state.preferences?.fit ||
        "Not provided",
    },

    stylePreferences: {
      style:
        state.style ||
        state.preferences?.style ||
        "Not provided",
      budget:
        state.budget ||
        state.preferences?.budget ||
        "Not provided",
      fabric:
        state.fabric ||
        state.preferences?.fabric ||
        [],
      sleeve:
        state.fitDetails?.sleeve ||
        state.preferences?.sleeve ||
        "Not provided",
      length:
        state.fitDetails?.length ||
        state.preferences?.length ||
        "Not provided",
      fit:
        state.fitDetails?.fit ||
        state.preferences?.fit ||
        "Not provided",
    },

    selectedOutfit: selectedOutfit
      ? {
          title: selectedOutfit.title || selectedOutfit.name || "Selected outfit",
          recommendedSize:
            selectedOutfit.recommendedSize || getRecommendedSize(state),
          fitType:
            selectedOutfit.fitType ||
            state.fitDetails?.fit ||
            state.preferences?.fit ||
            "Regular",
          priceRange:
            selectedOutfit.priceRange ||
            selectedOutfit.price ||
            "Price on request",
          matchScore:
            selectedOutfit.matchScore ||
            selectedOutfit.fitScore ||
            "Not provided",
          sizeConfidence:
            selectedOutfit.sizeConfidence ||
            state.recommendations?.confidenceScore ||
            "Not provided",
          whyThisSuitsYou:
            selectedOutfit.whyThisSuitsYou ||
            selectedOutfit.reason ||
            "Selected from FitGenie recommendations.",
        }
      : null,

    selectedService:
      state.serviceType ||
      state.marketplace?.serviceType ||
      "Not provided",

    selectedExpert: selectedExpert
      ? {
          name: selectedExpert.name || "Selected expert",
          phone: selectedExpert.phone || "Not provided",
          address: selectedExpert.address || selectedExpert.location || "Not provided",
          rating: selectedExpert.rating || "Not provided",
          priceRange: selectedExpert.priceRange || "Not provided",
          deliveryTime: selectedExpert.deliveryTime || "Not provided",
          specialization: selectedExpert.specialization || "Not provided",
        }
      : null,

    delivery: {
      mode: deliveryMode,
      schedule: deliverySchedule,
      chatEnabled:
        state.chatEnabled ||
        state.delivery?.chatEnabled ||
        false,
      notes:
        state.deliveryNotes ||
        "No additional delivery notes added.",
    },

    tailorNotes: [
      "Use the measurement and body type details before cutting or alteration.",
      "Confirm final size and fit type with the user before stitching.",
      "Use style, fabric, sleeve, length, and budget preferences while suggesting final options.",
      "If online delivery is selected, send regular updates for accepted, in progress, stitching, ready, and shipped/pickup stages.",
    ],
  };
}

export default function FitCardPage() {
  const nav = useNavigate();
  const state = useFlowStore();
  const { patch } = state;

  const [loading, setLoading] = useState(false);
  const [sentStatus, setSentStatus] = useState("");
  const [error, setError] = useState("");

  const currentFitCard = state.fitCard || buildFitCard(state);

  const selectedOutfit = getSelectedOutfit(state);
  const selectedExpert = getSelectedExpert(state);

  const fitCardStats = useMemo(() => {
    let completed = 0;
    const total = 6;

    if (currentFitCard.userIntent.purchaseFor !== "Not provided") completed += 1;
    if (currentFitCard.basicProfile.ageRange !== "Not provided") completed += 1;
    if (currentFitCard.measurements.size !== "Not provided") completed += 1;
    if (currentFitCard.stylePreferences.style !== "Not provided") completed += 1;
    if (currentFitCard.selectedOutfit) completed += 1;
    if (currentFitCard.selectedExpert) completed += 1;

    return {
      completed,
      total,
      score: Math.round((completed / total) * 100),
    };
  }, [currentFitCard]);

  function generateFitCard() {
    setError("");
    setSentStatus("");

    const card = buildFitCard(state);

    patch({
      fitCard: card,
    });

    setSentStatus("Fit Card generated and refreshed successfully.");
  }

  async function sendFitCard() {
    setLoading(true);
    setError("");
    setSentStatus("");

    const card = state.fitCard || buildFitCard(state);

    patch({
      fitCard: card,
    });

    try {
      const response = await callApi("/fit-card", "POST", {
        userId: state.userId || "guest_user",
        measurements: card.measurements,
        selectedOutfit: card.selectedOutfit,
        selectedExpert: card.selectedExpert,
        delivery: card.delivery,
        stylePreferences: card.stylePreferences,
        notes: card.tailorNotes.join(" "),
      });

      if (!response.ok) {
        setError(
          response.data?.message ||
            "Fit Card was generated, but sharing could not be confirmed."
        );
        return;
      }

      setSentStatus(
        "Fit Card shared with the selected expert and saved to the user dashboard."
      );
    } catch (_error) {
      setSentStatus(
        "Fit Card generated locally. Backend sharing is unavailable right now."
      );
    } finally {
      setLoading(false);
    }
  }

  function continueToTracking() {
    const card = state.fitCard || buildFitCard(state);

    patch({
      fitCard: card,
      order: {
        bookingId: `ORD-${Date.now()}`,
        status: "Accepted",
        timeline: [
          "Accepted",
          "In Progress",
          "Stitching",
          "Ready",
          card.delivery.mode === "Offline"
            ? "Ready for Pickup"
            : "Shipped / Ready for Pickup",
        ],
      },
    });

    nav("/tracking");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes fitCardFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes fitCardPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 1080px) {
            .fit-card-header {
              grid-template-columns: 1fr !important;
            }

            .fit-card-title {
              font-size: 36px !important;
            }

            .fit-card-layout {
              grid-template-columns: 1fr !important;
            }

            .fit-card-grid {
              grid-template-columns: 1fr !important;
            }

            .fit-card-footer {
              flex-direction: column !important;
            }

            .fit-card-footer button {
              width: 100% !important;
            }
          }

          @media print {
            body {
              background: #ffffff !important;
            }

            .fit-card-actions,
            .fit-card-footer,
            .fit-card-hide-print {
              display: none !important;
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
          <section className="fit-card-header" style={styles.header}>
            <div>
              <div style={styles.stepPill}>
                <span style={styles.stepDot} />
                Step 10 of 12 · Auto-generated Fit Card
              </div>

              <h1 className="fit-card-title" style={styles.title}>
                Your Fit Card is ready.
              </h1>

              <p style={styles.subtitle}>
                FitGenie creates a shareable card with measurements, body type,
                style preferences, selected outfit, expert details, delivery
                schedule, and tailor notes.
              </p>
            </div>

            <aside style={styles.previewCard}>
              <div style={styles.previewIcon}>📇</div>

              <div>
                <p style={styles.previewLabel}>Fit Card completeness</p>
                <h2 style={styles.previewScore}>{fitCardStats.score}%</h2>
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${fitCardStats.score}%`,
                  }}
                />
              </div>

              <p style={styles.previewText}>
                {fitCardStats.score >= 85
                  ? "Great. This card is ready to share with the expert."
                  : "Some details are missing, but the card can still be generated."}
              </p>
            </aside>
          </section>

          <section className="fit-card-layout" style={styles.layout}>
            <main style={styles.mainPanel}>
              <section style={styles.cardShell}>
                <div style={styles.cardTopBand}>
                  <div>
                    <p style={styles.cardLabel}>FitGenie Fit Card</p>
                    <h2 style={styles.cardTitle}>
                      {currentFitCard.fitCardId || "Auto-generated card"}
                    </h2>
                    <p style={styles.cardGenerated}>
                      Generated: {currentFitCard.generatedAt}
                    </p>
                  </div>

                  <div style={styles.cardLogo}>FG</div>
                </div>

                <div className="fit-card-grid" style={styles.cardGrid}>
                  <section style={styles.sectionCard}>
                    <h3 style={styles.sectionTitle}>Basic Profile</h3>

                    <div style={styles.dataList}>
                      <div style={styles.dataRow}>
                        <span>Purchase For</span>
                        <strong>
                          {getSafeValue(currentFitCard.userIntent.purchaseFor)}
                        </strong>
                      </div>

                      <div style={styles.dataRow}>
                        <span>Relation / Occasion</span>
                        <strong>
                          {currentFitCard.userIntent.purchaseFor === "gift"
                            ? getSafeValue(currentFitCard.userIntent.occasion)
                            : getSafeValue(currentFitCard.userIntent.relation)}
                        </strong>
                      </div>

                      <div style={styles.dataRow}>
                        <span>Age Range</span>
                        <strong>
                          {getSafeValue(currentFitCard.basicProfile.ageRange)}
                        </strong>
                      </div>

                      <div style={styles.dataRow}>
                        <span>Gender</span>
                        <strong>
                          {getSafeValue(currentFitCard.basicProfile.gender)}
                        </strong>
                      </div>
                    </div>
                  </section>

                  <section style={styles.sectionCard}>
                    <h3 style={styles.sectionTitle}>Measurements</h3>

                    <div style={styles.dataList}>
                      <div style={styles.dataRow}>
                        <span>Body Type</span>
                        <strong>
                          {getSafeValue(currentFitCard.measurements.bodyType)}
                        </strong>
                      </div>

                      <div style={styles.dataRow}>
                        <span>Recommended Size</span>
                        <strong>
                          {getSafeValue(currentFitCard.measurements.size)}
                        </strong>
                      </div>

                      <div style={styles.dataRow}>
                        <span>Height</span>
                        <strong>
                          {getSafeValue(currentFitCard.measurements.height)}
                        </strong>
                      </div>

                      <div style={styles.dataRow}>
                        <span>Fit Type</span>
                        <strong>
                          {getSafeValue(currentFitCard.measurements.fitType)}
                        </strong>
                      </div>

                      <div style={styles.dataRow}>
                        <span>Scan Confidence</span>
                        <strong>
                          {getSafeValue(currentFitCard.measurements.scanConfidence)}
                        </strong>
                      </div>
                    </div>
                  </section>

                  <section style={styles.sectionCard}>
                    <h3 style={styles.sectionTitle}>Style Preferences</h3>

                    <div style={styles.dataList}>
                      <div style={styles.dataRow}>
                        <span>Style</span>
                        <strong>
                          {getSafeValue(currentFitCard.stylePreferences.style)}
                        </strong>
                      </div>

                      <div style={styles.dataRow}>
                        <span>Budget</span>
                        <strong>
                          {getSafeValue(currentFitCard.stylePreferences.budget)}
                        </strong>
                      </div>

                      <div style={styles.dataRow}>
                        <span>Fabric</span>
                        <strong>
                          {getSafeValue(currentFitCard.stylePreferences.fabric)}
                        </strong>
                      </div>

                      <div style={styles.dataRow}>
                        <span>Sleeve</span>
                        <strong>
                          {getSafeValue(currentFitCard.stylePreferences.sleeve)}
                        </strong>
                      </div>

                      <div style={styles.dataRow}>
                        <span>Length</span>
                        <strong>
                          {getSafeValue(currentFitCard.stylePreferences.length)}
                        </strong>
                      </div>

                      <div style={styles.dataRow}>
                        <span>Fit</span>
                        <strong>
                          {getSafeValue(currentFitCard.stylePreferences.fit)}
                        </strong>
                      </div>
                    </div>
                  </section>

                  <section style={styles.sectionCard}>
                    <h3 style={styles.sectionTitle}>Selected Outfit</h3>

                    {currentFitCard.selectedOutfit ? (
                      <div style={styles.dataList}>
                        <div style={styles.dataRow}>
                          <span>Outfit</span>
                          <strong>{currentFitCard.selectedOutfit.title}</strong>
                        </div>

                        <div style={styles.dataRow}>
                          <span>Recommended Size</span>
                          <strong>
                            {currentFitCard.selectedOutfit.recommendedSize}
                          </strong>
                        </div>

                        <div style={styles.dataRow}>
                          <span>Fit Type</span>
                          <strong>{currentFitCard.selectedOutfit.fitType}</strong>
                        </div>

                        <div style={styles.dataRow}>
                          <span>Price Range</span>
                          <strong>{currentFitCard.selectedOutfit.priceRange}</strong>
                        </div>

                        <div style={styles.dataRow}>
                          <span>Match Score</span>
                          <strong>{currentFitCard.selectedOutfit.matchScore}</strong>
                        </div>

                        <div style={styles.reasonBox}>
                          {currentFitCard.selectedOutfit.whyThisSuitsYou}
                        </div>
                      </div>
                    ) : (
                      <p style={styles.emptyText}>No outfit selected.</p>
                    )}
                  </section>

                  <section style={styles.sectionCard}>
                    <h3 style={styles.sectionTitle}>Selected Expert</h3>

                    {currentFitCard.selectedExpert ? (
                      <div style={styles.dataList}>
                        <div style={styles.dataRow}>
                          <span>Name</span>
                          <strong>{currentFitCard.selectedExpert.name}</strong>
                        </div>

                        <div style={styles.dataRow}>
                          <span>Mobile</span>
                          <strong>{currentFitCard.selectedExpert.phone}</strong>
                        </div>

                        <div style={styles.dataRow}>
                          <span>Address</span>
                          <strong>{currentFitCard.selectedExpert.address}</strong>
                        </div>

                        <div style={styles.dataRow}>
                          <span>Rating</span>
                          <strong>⭐ {currentFitCard.selectedExpert.rating}</strong>
                        </div>

                        <div style={styles.dataRow}>
                          <span>Price Range</span>
                          <strong>{currentFitCard.selectedExpert.priceRange}</strong>
                        </div>

                        <div style={styles.dataRow}>
                          <span>Delivery Time</span>
                          <strong>{currentFitCard.selectedExpert.deliveryTime}</strong>
                        </div>

                        <div style={styles.reasonBox}>
                          Specialization:{" "}
                          {currentFitCard.selectedExpert.specialization}
                        </div>
                      </div>
                    ) : (
                      <p style={styles.emptyText}>No expert selected.</p>
                    )}
                  </section>

                  <section style={styles.sectionCard}>
                    <h3 style={styles.sectionTitle}>Delivery & Interaction</h3>

                    <div style={styles.dataList}>
                      <div style={styles.dataRow}>
                        <span>Mode</span>
                        <strong>{getSafeValue(currentFitCard.delivery.mode)}</strong>
                      </div>

                      <div style={styles.dataRow}>
                        <span>Schedule</span>
                        <strong>
                          {getSafeValue(currentFitCard.delivery.schedule)}
                        </strong>
                      </div>

                      <div style={styles.dataRow}>
                        <span>Chat</span>
                        <strong>
                          {currentFitCard.delivery.chatEnabled
                            ? "Enabled"
                            : "Disabled"}
                        </strong>
                      </div>

                      <div style={styles.reasonBox}>
                        Notes: {currentFitCard.delivery.notes}
                      </div>
                    </div>
                  </section>
                </div>

                <section style={styles.notesCard}>
                  <h3 style={styles.sectionTitle}>Notes for Tailor / Designer</h3>

                  <div style={styles.noteList}>
                    {currentFitCard.tailorNotes.map((note) => (
                      <div key={note} style={styles.noteItem}>
                        <span style={styles.noteCheck}>✓</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </section>
            </main>

            <aside style={styles.sidePanel}>
              <div style={styles.sideTop}>
                <span style={styles.sideIcon}>📤</span>

                <div>
                  <p style={styles.sideLabel}>Share status</p>
                  <h2 style={styles.sideTitle}>
                    {sentStatus ? "Ready" : "Not sent yet"}
                  </h2>
                </div>
              </div>

              <div className="fit-card-actions" style={styles.actions}>
                <button
                  type="button"
                  className="btn"
                  onClick={generateFitCard}
                  style={styles.actionButton}
                >
                  Generate / Refresh Fit Card
                </button>

                <button
                  type="button"
                  className="btn ghost"
                  onClick={sendFitCard}
                  disabled={loading}
                  style={styles.actionButton}
                >
                  {loading ? "Sharing..." : "Share with Expert & User"}
                </button>

                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => window.print()}
                  style={styles.actionButton}
                >
                  Print / Save Card
                </button>
              </div>

              {error ? <div style={styles.errorBox}>{error}</div> : null}
              {sentStatus ? <div style={styles.successBox}>{sentStatus}</div> : null}

              <div style={styles.messagePreview}>
                <span style={styles.messageBadge}>User message</span>

                <p style={styles.messageText}>
                  Your Fit Card has been generated. Expert{" "}
                  <strong>{selectedExpert?.name || "selected expert"}</strong>{" "}
                  will receive your size, style, outfit and schedule details.
                </p>
              </div>

              <div style={styles.messagePreview}>
                <span style={styles.messageBadge}>Expert message</span>

                <p style={styles.messageText}>
                  New FitGenie request received for{" "}
                  <strong>
                    {selectedOutfit?.title || selectedOutfit?.name || "selected outfit"}
                  </strong>
                  . Please review measurements, style preferences and notes before
                  accepting.
                </p>
              </div>

              <div style={styles.summaryList}>
                <div style={styles.summaryItem}>
                  <span>Expert</span>
                  <strong>{selectedExpert?.name || "Not selected"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>User receives</span>
                  <strong>Fit Card + shop/contact details</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Expert receives</span>
                  <strong>Measurements + style notes</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Next page</span>
                  <strong>Order Tracking</strong>
                </div>
              </div>
            </aside>
          </section>

          <section style={styles.finalSummary}>
            <div style={styles.finalIcon}>📇</div>

            <div>
              <p style={styles.finalLabel}>Fit Card handoff summary</p>
              <strong style={styles.finalText}>
                {currentFitCard.selectedExpert
                  ? `Fit Card prepared for ${currentFitCard.selectedExpert.name}`
                  : "Fit Card prepared, expert details missing"}
              </strong>
            </div>
          </section>

          <div className="fit-card-footer" style={styles.footer}>
            <button
              type="button"
              className="btn ghost"
              onClick={() => nav("/delivery")}
              style={styles.footerButton}
            >
              Back
            </button>

            <button
              type="button"
              className="btn"
              onClick={continueToTracking}
              style={styles.footerButton}
            >
              Continue to Order Tracking
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
    animation: "fitCardPulse 2s ease-in-out infinite",
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
    animation: "fitCardFloat 3.2s ease-in-out infinite",
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
    gridTemplateColumns: "minmax(0, 1fr) 350px",
    gap: "18px",
    alignItems: "start",
  },
  mainPanel: {
    display: "grid",
    gap: "18px",
  },
  cardShell: {
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.065)",
    boxShadow: "0 22px 52px rgba(0,0,0,0.20)",
  },
  cardTopBand: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    padding: "24px",
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.95), rgba(0,212,255,0.82))",
  },
  cardLabel: {
    margin: "0 0 6px",
    color: "rgba(255,255,255,0.78)",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  cardTitle: {
    margin: 0,
    fontSize: "26px",
  },
  cardGenerated: {
    margin: "7px 0 0",
    color: "rgba(255,255,255,0.76)",
    fontSize: "13px",
  },
  cardLogo: {
    width: "62px",
    height: "62px",
    borderRadius: "22px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.20)",
    border: "1px solid rgba(255,255,255,0.26)",
    fontWeight: 900,
    fontSize: "22px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
    padding: "18px",
  },
  sectionCard: {
    padding: "16px",
    borderRadius: "22px",
    background: "rgba(0,0,0,0.16)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  sectionTitle: {
    margin: "0 0 12px",
    fontSize: "19px",
  },
  dataList: {
    display: "grid",
    gap: "9px",
  },
  dataRow: {
    display: "grid",
    gridTemplateColumns: "130px minmax(0, 1fr)",
    gap: "12px",
    padding: "10px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.06)",
    alignItems: "start",
  },
  reasonBox: {
    marginTop: "4px",
    padding: "11px",
    borderRadius: "14px",
    background: "rgba(0,212,255,0.10)",
    border: "1px solid rgba(0,212,255,0.20)",
    color: "#d9fbff",
    lineHeight: 1.5,
    fontSize: "13px",
  },
  emptyText: {
    margin: 0,
    color: "rgba(255,255,255,0.66)",
  },
  notesCard: {
    margin: "0 18px 18px",
    padding: "16px",
    borderRadius: "22px",
    background: "rgba(0,212,255,0.09)",
    border: "1px solid rgba(0,212,255,0.20)",
  },
  noteList: {
    display: "grid",
    gap: "10px",
  },
  noteItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.78)",
  },
  noteCheck: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "rgba(0,212,255,0.16)",
    color: "#d9fbff",
    fontSize: "12px",
    fontWeight: 900,
    flex: "0 0 auto",
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
  actions: {
    display: "grid",
    gap: "10px",
    marginBottom: "14px",
  },
  actionButton: {
    width: "100%",
  },
  successBox: {
    marginBottom: "14px",
    padding: "13px 15px",
    borderRadius: "16px",
    background: "rgba(0,212,255,0.10)",
    border: "1px solid rgba(0,212,255,0.25)",
    color: "#d9fbff",
    lineHeight: 1.45,
  },
  errorBox: {
    marginBottom: "14px",
    padding: "13px 15px",
    borderRadius: "16px",
    background: "rgba(255, 86, 86, 0.16)",
    border: "1px solid rgba(255, 120, 120, 0.35)",
    color: "#ffdede",
  },
  messagePreview: {
    marginBottom: "12px",
    padding: "14px",
    borderRadius: "20px",
    background: "rgba(0,0,0,0.16)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  messageBadge: {
    display: "inline-flex",
    marginBottom: "8px",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.10)",
    color: "#d9fbff",
    fontSize: "11px",
    fontWeight: 900,
  },
  messageText: {
    margin: 0,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.5,
    fontSize: "13px",
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
    minWidth: "230px",
  },
};
