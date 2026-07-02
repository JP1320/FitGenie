import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";
import { callApi } from "../services/api";

function getSafeValue(value, fallback = "Not provided") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : fallback;
  }

  if (typeof value === "object") {
    return Object.keys(value).length > 0 ? value : fallback;
  }

  return value;
}

function getNowText() {
  return new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getSelectedOutfit(state) {
  return state.recommendations?.selectedOutfit || state.selectedOutfit || {};
}

function getSelectedExpert(state) {
  return state.selectedExpert || state.marketplace?.selectedExpert || {};
}

function getDeliverySchedule(state) {
  return state.deliverySchedule || state.schedule || state.delivery?.schedule || "";
}

function getDeliveryMode(state) {
  return state.deliveryMode || state.delivery?.mode || "";
}

function getBodyType(state) {
  return (
    state.bodyType ||
    state.body?.bodyType ||
    state.scanResult?.bodyType ||
    state.scanResult?.bodyProportion ||
    "Not provided"
  );
}

function getRecommendedSize(state) {
  return (
    state.size ||
    state.body?.size ||
    state.scanResult?.recommendedSize ||
    "Not provided"
  );
}

function getHeight(state) {
  if (state.heightCm) return `${state.heightCm} cm`;
  if (state.body?.heightCm) return `${state.body.heightCm} cm`;
  if (state.scanResult?.detectedHeightCm) {
    return `${state.scanResult.detectedHeightCm} cm`;
  }
  if (state.heightRange) return state.heightRange;
  if (state.body?.heightRange) return state.body.heightRange;

  return "Not provided";
}

function buildFitCard(state) {
  const selectedOutfit = getSelectedOutfit(state);
  const selectedExpert = getSelectedExpert(state);
  const deliveryMode = getDeliveryMode(state);
  const deliverySchedule = getDeliverySchedule(state);

  return {
    fitCardId: state.fitCard?.fitCardId || `FIT-${Date.now()}`,
    generatedAt: getNowText(),

    basicProfile: {
      ageRange: getSafeValue(state.ageRange || state.age || state.profile?.ageRange),
      gender: getSafeValue(state.gender || state.profile?.gender),
      forWhom: getSafeValue(state.forWhom || state.intent),
      relation: getSafeValue(state.relation || state.intentSubType, "Not applicable"),
      occasion: getSafeValue(state.occasion || state.intentSubType, "Not applicable"),
    },

    measurements: {
      bodyType: getBodyType(state),
      recommendedSize: getRecommendedSize(state),
      height: getHeight(state),
      source: state.scanResult ? "AI scanner + manual inputs" : "Manual inputs",
    },

    stylePreferences: {
      style: getSafeValue(state.style || state.preferences?.style),
      budget: getSafeValue(state.budget || state.preferences?.budget),
      fabric: getSafeValue(state.fabric || state.preferences?.fabric),
      sleeve: getSafeValue(state.fitDetails?.sleeve || state.preferences?.fitDetails?.sleeve),
      length: getSafeValue(state.fitDetails?.length || state.preferences?.fitDetails?.length),
      fit: getSafeValue(state.fitDetails?.fit || state.preferences?.fitDetails?.fit),
    },

    selectedOutfit: {
      title: getSafeValue(selectedOutfit.title || selectedOutfit.name),
      category: getSafeValue(selectedOutfit.category),
      priceRange: getSafeValue(selectedOutfit.priceRange || selectedOutfit.price),
      recommendedSize: getSafeValue(selectedOutfit.recommendedSize || getRecommendedSize(state)),
      fitType: getSafeValue(selectedOutfit.fitType || state.fitDetails?.fit),
      sizeConfidence: getSafeValue(selectedOutfit.sizeConfidence, "Pending"),
      reason: getSafeValue(
        selectedOutfit.whyThisSuitsYou || selectedOutfit.reason,
        "Matched using profile, style, budget, size, and fit preferences."
      ),
    },

    service: {
      type: getSafeValue(state.serviceType),
    },

    selectedExpert: {
      name: getSafeValue(selectedExpert.name),
      rating: getSafeValue(selectedExpert.rating),
      phone: getSafeValue(selectedExpert.phone),
      address: getSafeValue(selectedExpert.address),
      priceRange: getSafeValue(selectedExpert.priceRange),
      deliveryTime: getSafeValue(selectedExpert.deliveryTime),
      specialization: getSafeValue(selectedExpert.specialization),
    },

    delivery: {
      mode: getSafeValue(deliveryMode),
      schedule: getSafeValue(deliverySchedule),
      chatEnabled: Boolean(state.chatEnabled),
      notes: getSafeValue(state.deliveryNotes, "No extra notes added."),
    },

    tailorNotes:
      "Use this Fit Card for measurement confirmation, outfit planning, service discussion, and delivery coordination.",
  };
}

function SectionCard({ icon, title, children }) {
  return (
    <section style={styles.sectionCard}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionIcon}>{icon}</span>

        <h2 style={styles.sectionTitle}>{title}</h2>
      </div>

      <div style={styles.sectionBody}>{children}</div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span>{label}</span>
      <strong>{typeof value === "object" ? JSON.stringify(value) : value}</strong>
    </div>
  );
}

export default function FitCardPage() {
  const nav = useNavigate();
  const state = useFlowStore();
  const { patch } = state;

  const [shareStatus, setShareStatus] = useState("");
  const [error, setError] = useState("");

  const fitCard = useMemo(() => {
    return state.fitCard || buildFitCard(state);
  }, [state]);

  const selectedExpert = getSelectedExpert(state);
  const selectedOutfit = getSelectedOutfit(state);

  const completionScore = useMemo(() => {
    let score = 0;

    if (fitCard.basicProfile.ageRange !== "Not provided") score += 15;
    if (fitCard.basicProfile.gender !== "Not provided") score += 15;
    if (fitCard.measurements.recommendedSize !== "Not provided") score += 15;
    if (fitCard.stylePreferences.style !== "Not provided") score += 15;
    if (fitCard.selectedOutfit.title !== "Not provided") score += 15;
    if (fitCard.selectedExpert.name !== "Not provided") score += 15;
    if (fitCard.delivery.mode !== "Not provided") score += 10;

    return score;
  }, [fitCard]);

  function generateFitCard() {
    const card = buildFitCard(state);

    patch({
      fitCard: card,
    });

    setShareStatus("Fit Card refreshed successfully.");
    setError("");
  }

  async function shareFitCard() {
    const card = state.fitCard || buildFitCard(state);

    patch({
      fitCard: card,
    });

    setError("");
    setShareStatus("Sharing Fit Card...");

    try {
      const response = await callApi("/fit-card", "POST", {
        fitCard: card,
        expert: selectedExpert,
        outfit: selectedOutfit,
      });

      if (!response.ok) {
        setShareStatus(
          "Fit Card saved locally. Backend sharing is not available right now."
        );
        return;
      }

      patch({
        fitCard: {
          ...card,
          shared: true,
          sharedAt: getNowText(),
          shareResponse: response.data,
        },
      });

      setShareStatus("Fit Card shared with user dashboard and selected expert.");
    } catch (_error) {
      setShareStatus(
        "Fit Card saved locally. Backend sharing is not available right now."
      );
    }
  }

  function printFitCard() {
    window.print();
  }

  function continueToTracking() {
    const card = state.fitCard || buildFitCard(state);

    patch({
      fitCard: card,
      order: {
        ...(state.order || {}),
        bookingId: state.order?.bookingId || `ORD-${Date.now()}`,
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
        createdAt: new Date().toISOString(),
      },
    });

    nav("/tracking");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes fitCardSoftFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes fitCardSoftPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media print {
            body * {
              visibility: hidden;
            }

            .print-fit-card,
            .print-fit-card * {
              visibility: visible;
            }

            .print-fit-card {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }

          @media (max-width: 1080px) {
            .fit-card-header {
              grid-template-columns: 1fr !important;
            }

            .fit-card-title {
              font-size: 38px !important;
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
                FitGenie created a shareable card with basic profile, size
                inputs, body type, style preferences, selected outfit, expert
                details, delivery mode, schedule, and notes.
              </p>
            </div>

            <aside style={styles.previewCard}>
              <div style={styles.previewTop}>
                <span style={styles.previewIcon}>🪄</span>

                <div>
                  <p style={styles.previewLabel}>Fit Card completion</p>
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
                Fit Card ID: <strong>{fitCard.fitCardId}</strong>
              </p>

              <div style={styles.previewTags}>
                <span style={styles.previewTag}>
                  {fitCard.selectedExpert.name}
                </span>
                <span style={styles.previewTag}>
                  {fitCard.delivery.mode}
                </span>
              </div>
            </aside>
          </section>

          <section className="fit-card-layout" style={styles.layout}>
            <main className="print-fit-card" style={styles.mainPanel}>
              <section style={styles.heroCard}>
                <div>
                  <p style={styles.heroLabel}>Generated Fit Card</p>
                  <h2 style={styles.heroTitle}>{fitCard.fitCardId}</h2>
                  <p style={styles.heroText}>
                    Generated on {fitCard.generatedAt}
                  </p>
                </div>

                <div style={styles.statusBubble}>
                  <strong>{completionScore}%</strong>
                  <span>Ready for expert handoff</span>
                </div>
              </section>

              <div className="fit-card-grid" style={styles.cardGrid}>
                <SectionCard icon="👤" title="Basic Profile">
                  <InfoRow label="For Whom" value={fitCard.basicProfile.forWhom} />
                  <InfoRow label="Age Range" value={fitCard.basicProfile.ageRange} />
                  <InfoRow label="Gender" value={fitCard.basicProfile.gender} />
                  <InfoRow label="Relation" value={fitCard.basicProfile.relation} />
                  <InfoRow label="Occasion" value={fitCard.basicProfile.occasion} />
                </SectionCard>

                <SectionCard icon="📏" title="Measurements">
                  <InfoRow label="Body Type" value={fitCard.measurements.bodyType} />
                  <InfoRow
                    label="Recommended Size"
                    value={fitCard.measurements.recommendedSize}
                  />
                  <InfoRow label="Height" value={fitCard.measurements.height} />
                  <InfoRow label="Input Source" value={fitCard.measurements.source} />
                </SectionCard>

                <SectionCard icon="🎨" title="Style Preferences">
                  <InfoRow label="Style" value={fitCard.stylePreferences.style} />
                  <InfoRow label="Budget" value={fitCard.stylePreferences.budget} />
                  <InfoRow label="Fabric" value={fitCard.stylePreferences.fabric} />
                  <InfoRow label="Sleeve" value={fitCard.stylePreferences.sleeve} />
                  <InfoRow label="Length" value={fitCard.stylePreferences.length} />
                  <InfoRow label="Fit" value={fitCard.stylePreferences.fit} />
                </SectionCard>

                <SectionCard icon="👗" title="Selected Outfit">
                  <InfoRow label="Outfit" value={fitCard.selectedOutfit.title} />
                  <InfoRow label="Category" value={fitCard.selectedOutfit.category} />
                  <InfoRow
                    label="Price Range"
                    value={fitCard.selectedOutfit.priceRange}
                  />
                  <InfoRow
                    label="Recommended Size"
                    value={fitCard.selectedOutfit.recommendedSize}
                  />
                  <InfoRow label="Fit Type" value={fitCard.selectedOutfit.fitType} />
                  <InfoRow
                    label="Size Confidence"
                    value={fitCard.selectedOutfit.sizeConfidence}
                  />
                </SectionCard>

                <SectionCard icon="🧵" title="Selected Expert">
                  <InfoRow label="Name" value={fitCard.selectedExpert.name} />
                  <InfoRow label="Rating" value={fitCard.selectedExpert.rating} />
                  <InfoRow label="Phone" value={fitCard.selectedExpert.phone} />
                  <InfoRow label="Address" value={fitCard.selectedExpert.address} />
                  <InfoRow
                    label="Specialization"
                    value={fitCard.selectedExpert.specialization}
                  />
                  <InfoRow
                    label="Delivery Time"
                    value={fitCard.selectedExpert.deliveryTime}
                  />
                </SectionCard>

                <SectionCard icon="📦" title="Delivery & Interaction">
                  <InfoRow label="Mode" value={fitCard.delivery.mode} />
                  <InfoRow label="Schedule" value={fitCard.delivery.schedule} />
                  <InfoRow
                    label="Chat"
                    value={fitCard.delivery.chatEnabled ? "Enabled" : "Disabled"}
                  />
                  <InfoRow label="Notes" value={fitCard.delivery.notes} />
                </SectionCard>
              </div>

              <section style={styles.reasonCard}>
                <span style={styles.reasonBadge}>Why this suits you</span>

                <p style={styles.reasonText}>{fitCard.selectedOutfit.reason}</p>
              </section>

              <section style={styles.messageGrid}>
                <div style={styles.messageCard}>
                  <span style={styles.messageIcon}>📲</span>

                  <div>
                    <h3 style={styles.messageTitle}>User dashboard message</h3>

                    <p style={styles.messageText}>
                      Your Fit Card is ready with outfit details, expert contact,
                      shop address, delivery mode, and schedule.
                    </p>
                  </div>
                </div>

                <div style={styles.messageCard}>
                  <span style={styles.messageIcon}>🧵</span>

                  <div>
                    <h3 style={styles.messageTitle}>Expert handoff message</h3>

                    <p style={styles.messageText}>
                      The selected expert receives measurements, style
                      preferences, selected outfit, delivery choice, and notes.
                    </p>
                  </div>
                </div>
              </section>
            </main>

            <aside style={styles.sidePanel}>
              <div style={styles.sideTop}>
                <span style={styles.sideIcon}>🧞</span>

                <div>
                  <p style={styles.sideLabel}>Fit Card actions</p>
                  <h2 style={styles.sideTitle}>Ready</h2>
                </div>
              </div>

              <div style={styles.summaryList}>
                <div style={styles.summaryItem}>
                  <span>Card ID</span>
                  <strong>{fitCard.fitCardId}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Expert</span>
                  <strong>{fitCard.selectedExpert.name}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Outfit</span>
                  <strong>{fitCard.selectedOutfit.title}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Service</span>
                  <strong>{fitCard.service.type}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Delivery</span>
                  <strong>{fitCard.delivery.mode}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Schedule</span>
                  <strong>{fitCard.delivery.schedule}</strong>
                </div>
              </div>

              <div style={styles.actionStack}>
                <button
                  type="button"
                  onClick={generateFitCard}
                  style={styles.secondaryButton}
                >
                  Generate / Refresh Fit Card
                </button>

                <button
                  type="button"
                  onClick={shareFitCard}
                  style={styles.primaryButton}
                >
                  Share with Expert & User
                </button>

                <button
                  type="button"
                  onClick={printFitCard}
                  style={styles.secondaryButton}
                >
                  Print / Save Card
                </button>
              </div>

              {shareStatus ? (
                <div style={styles.successBox}>{shareStatus}</div>
              ) : null}

              <div style={styles.nextCard}>
                <span style={styles.nextBadge}>Next step</span>

                <h3 style={styles.nextTitle}>Order Tracking</h3>

                <p style={styles.nextText}>
                  After Fit Card handoff, track order stages from Accepted to
                  In Progress, Stitching, Ready, and Delivery or Pickup.
                </p>

                <div style={styles.nextPills}>
                  <span>✅ Accepted</span>
                  <span>🧵 Stitching</span>
                  <span>📦 Delivery</span>
                </div>
              </div>
            </aside>
          </section>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <section style={styles.finalSummary}>
            <div style={styles.finalIcon}>✅</div>

            <div>
              <p style={styles.finalLabel}>Fit Card status</p>
              <strong style={styles.finalText}>
                Ready to share with {fitCard.selectedExpert.name} and the user
                dashboard.
              </strong>
            </div>
          </section>

          <div className="fit-card-footer" style={styles.footer}>
            <button
              type="button"
              onClick={() => nav("/delivery")}
              style={styles.backButton}
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={continueToTracking}
              style={styles.nextButton}
            >
              Track Order →
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
    animation: "fitCardSoftPulse 2s ease-in-out infinite",
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
    animation: "fitCardSoftFloat 3.2s ease-in-out infinite",
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
    gap: "18px",
  },
  heroCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "30px",
    padding: "24px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.88), rgba(236,254,255,0.86))",
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.09)",
  },
  heroLabel: {
    margin: "0 0 6px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  heroTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "32px",
  },
  heroText: {
    margin: "8px 0 0",
    color: "#475569",
    fontWeight: 700,
  },
  statusBubble: {
    width: "138px",
    height: "138px",
    borderRadius: "34px",
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    padding: "14px",
    background: "linear-gradient(135deg, #ede9fe, #cffafe)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    color: "#111827",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },
  sectionCard: {
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "26px",
    padding: "18px",
    background: "rgba(255,255,255,0.78)",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
  },
  sectionIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "17px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #ede9fe, #cffafe)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    fontSize: "22px",
  },
  sectionTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "21px",
  },
  sectionBody: {
    display: "grid",
    gap: "10px",
  },
  infoRow: {
    padding: "11px",
    borderRadius: "15px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    display: "grid",
    gap: "4px",
    color: "#111827",
  },
  reasonCard: {
    padding: "16px",
    borderRadius: "22px",
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
  },
  reasonBadge: {
    display: "inline-flex",
    marginBottom: "8px",
    padding: "6px 9px",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#0891b2",
    fontSize: "12px",
    fontWeight: 900,
  },
  reasonText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
    fontWeight: 700,
  },
  messageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },
  messageCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "13px",
    padding: "16px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
  },
  messageIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #fef3c7, #dbeafe)",
    fontSize: "21px",
    flex: "0 0 auto",
  },
  messageTitle: {
    margin: "0 0 7px",
    color: "#111827",
    fontSize: "17px",
  },
  messageText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.55,
    fontSize: "13px",
    fontWeight: 700,
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
  actionStack: {
    display: "grid",
    gap: "10px",
    marginTop: "14px",
  },
  primaryButton: {
    border: 0,
    borderRadius: "999px",
    padding: "13px 18px",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 16px 34px rgba(79, 70, 229, 0.25)",
  },
  secondaryButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "13px 18px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.08)",
  },
  successBox: {
    marginTop: "14px",
    padding: "13px",
    borderRadius: "17px",
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
    color: "#0891b2",
    fontWeight: 800,
    lineHeight: 1.5,
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
