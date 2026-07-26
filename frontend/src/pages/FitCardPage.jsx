import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

function valueOrFallback(value, fallback = "Not selected") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : fallback;
  }

  return value;
}

function getUserLabel(authUser) {
  if (authUser?.email) return authUser.email;
  if (authUser?.name) return authUser.name;
  return "Guest user";
}

function getServiceLabel(serviceType) {
  return (
    serviceType?.type ||
    serviceType?.serviceType ||
    serviceType?.title ||
    serviceType?.name ||
    ""
  );
}

function getExpertLabel(selectedExpert) {
  return (
    selectedExpert?.name ||
    selectedExpert?.title ||
    selectedExpert?.expertName ||
    ""
  );
}

export default function FitCardPage() {
  const nav = useNavigate();
  const flow = useFlowStore();
  const fitCardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const {
    authUser,
    intent,
    basicProfile,
    bodyType,
    size,
    heightCm,
    heightRange,
    sizeBody,
    guidedFilters,
    serviceType,
    qualityLocation,
    selectedExpert,
    delivery,
    fitCard,
    scanner,
  } = flow;

  const aiFit = scanner?.aiFit || {};

  const finalSize = size || sizeBody?.size || aiFit?.estimatedSize || "";
  const finalBodyType =
    bodyType || sizeBody?.bodyType || aiFit?.bodyType || "";
  const finalFit =
    sizeBody?.fitPreference || aiFit?.fitPreference || "Regular fit";

  const finalHeight = heightCm
    ? `${heightCm} cm`
    : heightRange || sizeBody?.heightRange || "Not selected";

  const lookPreferences = guidedFilters || {};
  const deliveryData = delivery || {};
  const fitCardData = fitCard || {};

  const [customerName, setCustomerName] = useState(
    fitCardData.customerName || ""
  );

  async function downloadFitCard() {
    if (!fitCardRef.current) return;

    setDownloading(true);

    try {
      const canvas = await html2canvas(fitCardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      const link = document.createElement("a");
      const safeName = customerName
        ? customerName.trim().replace(/[^a-z0-9]/gi, "-").toLowerCase()
        : "fitgenie-user";

      link.download = `fitgenie-fit-card-${safeName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <PageShell>
      <main style={styles.page}>
        <section style={styles.outer}>
          <div ref={fitCardRef} style={styles.inviteCard}>
            <div style={styles.topGoldWave} />
            <div style={styles.topGoldWaveTwo} />
            <div style={styles.bottomGoldWave} />
            <div style={styles.bottomGoldWaveTwo} />
            <div style={styles.goldDustTop} />
            <div style={styles.goldDustBottom} />

            <div style={styles.cardContent}>
              <p style={styles.kicker}>FitGenie</p>

              <h1 style={styles.title}>Your AI Fit Card</h1>

              <p style={styles.dateLine}>
                Generated Fit Profile ·{" "}
                {fitCardData.generatedAt
                  ? new Date(fitCardData.generatedAt).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </p>

              <div style={styles.heroDivider}>
                <span style={styles.dividerLine} />
                <span style={styles.dividerDot}>✦</span>
                <span style={styles.dividerLine} />
              </div>

              <section style={styles.primaryDetails}>
                <div style={styles.mainNameBlock}>
                  <span style={styles.smallLabel}>Account</span>
                  <strong style={styles.mainName}>{getUserLabel(authUser)}</strong>
                </div>

                <div style={styles.miniGrid}>
                  <div style={styles.miniItem}>
                    <span>Buying for</span>
                    <strong>{valueOrFallback(intent, "Myself")}</strong>
                  </div>

                  <div style={styles.miniItem}>
                    <span>Status</span>
                    <strong>{valueOrFallback(fitCardData.status, "Generated")}</strong>
                  </div>
                </div>
              </section>

              <section style={styles.detailGrid}>
                <div style={styles.detailBox}>
                  <h2 style={styles.sectionTitle}>Basic Profile</h2>

                  <p style={styles.detailRow}>
                    <span>Age Range</span>
                    <strong>{valueOrFallback(basicProfile?.ageRange)}</strong>
                  </p>

                  <p style={styles.detailRow}>
                    <span>Gender</span>
                    <strong>{valueOrFallback(basicProfile?.gender)}</strong>
                  </p>
                </div>

                <div style={styles.detailBox}>
                  <h2 style={styles.sectionTitle}>AI Fit Scanner</h2>

                  <p style={styles.detailRow}>
                    <span>Scan Status</span>
                    <strong>
                      {scanner?.completed
                        ? "Completed"
                        : scanner?.skipped
                        ? "Skipped"
                        : "Not used"}
                    </strong>
                  </p>

                  <p style={styles.detailRow}>
                    <span>AI Confidence</span>
                    <strong>
                      {aiFit?.confidence
                        ? `${Math.round(aiFit.confidence * 100)}%`
                        : "Not available"}
                    </strong>
                  </p>
                </div>

                <div style={styles.detailBox}>
                  <h2 style={styles.sectionTitle}>Fit Details</h2>

                  <p style={styles.detailRow}>
                    <span>Size</span>
                    <strong>{valueOrFallback(finalSize)}</strong>
                  </p>

                  <p style={styles.detailRow}>
                    <span>Body Type</span>
                    <strong>{valueOrFallback(finalBodyType)}</strong>
                  </p>

                  <p style={styles.detailRow}>
                    <span>Fit Preference</span>
                    <strong>{valueOrFallback(finalFit)}</strong>
                  </p>

                  <p style={styles.detailRow}>
                    <span>Height</span>
                    <strong>{finalHeight}</strong>
                  </p>
                </div>

                <div style={styles.detailBox}>
                  <h2 style={styles.sectionTitle}>Look Preferences</h2>

                  <p style={styles.detailRow}>
                    <span>Style</span>
                    <strong>
                      {valueOrFallback(
                        lookPreferences.style ||
                          lookPreferences.look ||
                          lookPreferences.selectedLook
                      )}
                    </strong>
                  </p>

                  <p style={styles.detailRow}>
                    <span>Budget</span>
                    <strong>{valueOrFallback(lookPreferences.budget)}</strong>
                  </p>

                  <p style={styles.detailRow}>
                    <span>Fabric</span>
                    <strong>{valueOrFallback(lookPreferences.fabric)}</strong>
                  </p>
                </div>

                <div style={styles.detailBox}>
                  <h2 style={styles.sectionTitle}>Service & Expert</h2>

                  <p style={styles.detailRow}>
                    <span>Service</span>
                    <strong>{valueOrFallback(getServiceLabel(serviceType))}</strong>
                  </p>

                  <p style={styles.detailRow}>
                    <span>Quality</span>
                    <strong>
                      {valueOrFallback(
                        qualityLocation?.quality ||
                          qualityLocation?.qualityLevel
                      )}
                    </strong>
                  </p>

                  <p style={styles.detailRow}>
                    <span>Expert</span>
                    <strong>{valueOrFallback(getExpertLabel(selectedExpert))}</strong>
                  </p>
                </div>

                <div style={styles.detailBox}>
                  <h2 style={styles.sectionTitle}>Delivery & Interaction</h2>

                  <p style={styles.detailRow}>
                    <span>Delivery</span>
                    <strong>
                      {valueOrFallback(
                        deliveryData.deliveryMode || deliveryData.mode
                      )}
                    </strong>
                  </p>

                  <p style={styles.detailRow}>
                    <span>Interaction</span>
                    <strong>
                      {valueOrFallback(
                        deliveryData.interactionMode ||
                          deliveryData.interaction
                      )}
                    </strong>
                  </p>

                  <p style={styles.detailRow}>
                    <span>Timeline</span>
                    <strong>{valueOrFallback(deliveryData.timeline)}</strong>
                  </p>
                </div>
              </section>

              <section style={styles.notesBox}>
                <span style={styles.notesLabel}>Notes</span>
                <p style={styles.notesText}>
                  {valueOrFallback(
                    deliveryData.notes,
                    "No extra delivery notes added."
                  )}
                </p>
              </section>

              <p style={styles.footerText}>
                This Fit Card can be shared with the selected expert, tailor, or
                designer for outfit planning and fit reference.
              </p>
            </div>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => nav("/delivery")}
              style={styles.backButton}
            >
              ← Back to Delivery
            </button>

            <button
              type="button"
              onClick={() => nav("/tracking")}
              style={styles.nextButton}
            >
              Continue to Order Tracking →
            </button>
          </div>
        </section>
      </main>
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

  outer: {
    width: "min(860px, 100%)",
  },

  inviteCard: {
    position: "relative",
    overflow: "hidden",
    minHeight: "900px",
    borderRadius: "18px",
    background:
      "linear-gradient(180deg, rgba(255,253,247,0.98), rgba(255,250,239,0.97))",
    border: "1px solid rgba(214,170,61,0.32)",
    boxShadow:
      "0 34px 90px rgba(15,23,42,0.22), inset 0 0 0 1px rgba(255,255,255,0.75)",
  },

  topGoldWave: {
    position: "absolute",
    top: "-120px",
    left: "-80px",
    width: "760px",
    height: "260px",
    borderRadius: "50%",
    border: "2px solid rgba(202,158,54,0.22)",
    transform: "rotate(-12deg)",
    boxShadow:
      "0 0 0 7px rgba(202,158,54,0.045), 0 0 0 15px rgba(202,158,54,0.035), 0 0 0 24px rgba(202,158,54,0.025)",
  },

  topGoldWaveTwo: {
    position: "absolute",
    top: "-90px",
    right: "-160px",
    width: "700px",
    height: "230px",
    borderRadius: "50%",
    border: "1px solid rgba(202,158,54,0.2)",
    transform: "rotate(8deg)",
    boxShadow:
      "0 0 0 9px rgba(202,158,54,0.04), 0 0 0 18px rgba(202,158,54,0.03), 0 0 0 28px rgba(202,158,54,0.02)",
  },

  bottomGoldWave: {
    position: "absolute",
    bottom: "-115px",
    right: "-110px",
    width: "780px",
    height: "260px",
    borderRadius: "50%",
    border: "2px solid rgba(202,158,54,0.23)",
    transform: "rotate(-10deg)",
    boxShadow:
      "0 0 0 8px rgba(202,158,54,0.045), 0 0 0 17px rgba(202,158,54,0.035), 0 0 0 27px rgba(202,158,54,0.025)",
  },

  bottomGoldWaveTwo: {
    position: "absolute",
    bottom: "-95px",
    left: "-180px",
    width: "720px",
    height: "230px",
    borderRadius: "50%",
    border: "1px solid rgba(202,158,54,0.19)",
    transform: "rotate(8deg)",
    boxShadow:
      "0 0 0 9px rgba(202,158,54,0.04), 0 0 0 18px rgba(202,158,54,0.03), 0 0 0 28px rgba(202,158,54,0.02)",
  },

  goldDustTop: {
    position: "absolute",
    top: "28px",
    left: "34px",
    width: "170px",
    height: "120px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle at 12% 20%, rgba(202,158,54,0.48) 0 2px, transparent 3px), radial-gradient(circle at 40% 42%, rgba(202,158,54,0.38) 0 1.5px, transparent 2.5px), radial-gradient(circle at 72% 18%, rgba(202,158,54,0.42) 0 2px, transparent 3px), radial-gradient(circle at 88% 72%, rgba(202,158,54,0.32) 0 1.5px, transparent 2.5px)",
  },

  goldDustBottom: {
    position: "absolute",
    bottom: "26px",
    right: "36px",
    width: "190px",
    height: "130px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle at 14% 22%, rgba(202,158,54,0.42) 0 2px, transparent 3px), radial-gradient(circle at 42% 48%, rgba(202,158,54,0.34) 0 1.5px, transparent 2.5px), radial-gradient(circle at 76% 18%, rgba(202,158,54,0.4) 0 2px, transparent 3px), radial-gradient(circle at 88% 72%, rgba(202,158,54,0.32) 0 1.5px, transparent 2.5px)",
  },

  cardContent: {
    position: "relative",
    zIndex: 2,
    padding: "92px 56px 72px",
    textAlign: "center",
  },

  kicker: {
    margin: "0 0 16px",
    color: "#111827",
    fontSize: "15px",
    fontWeight: 950,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
  },

  title: {
    margin: 0,
    color: "#caa03a",
    fontSize: "56px",
    lineHeight: 1,
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: "italic",
    fontWeight: 500,
    letterSpacing: "-0.04em",
  },

  dateLine: {
    margin: "18px 0 0",
    color: "#111827",
    fontSize: "14px",
    fontWeight: 900,
    letterSpacing: "0.04em",
  },

  heroDivider: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: "14px",
    margin: "28px 0",
  },

  dividerLine: {
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, rgba(202,158,54,0.68), transparent)",
  },

  dividerDot: {
    color: "#caa03a",
    fontSize: "20px",
  },

  primaryDetails: {
    display: "grid",
    gap: "16px",
    marginBottom: "22px",
  },

  mainNameBlock: {
    padding: "18px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(202,158,54,0.18)",
  },

  smallLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 950,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginBottom: "7px",
  },

  mainName: {
    display: "block",
    color: "#111827",
    fontSize: "19px",
    wordBreak: "break-word",
  },

  miniGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },

  miniItem: {
    padding: "14px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.54)",
    border: "1px solid rgba(202,158,54,0.16)",
    display: "grid",
    gap: "5px",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
    textAlign: "left",
  },

  detailBox: {
    padding: "16px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(202,158,54,0.16)",
  },

  sectionTitle: {
    margin: "0 0 12px",
    color: "#caa03a",
    fontSize: "16px",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontWeight: 700,
  },

  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    margin: 0,
    padding: "8px 0",
    borderBottom: "1px solid rgba(202,158,54,0.12)",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 700,
  },

  notesBox: {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(202,158,54,0.16)",
    textAlign: "left",
  },

  notesLabel: {
    display: "block",
    color: "#caa03a",
    fontSize: "15px",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontWeight: 700,
    marginBottom: "8px",
  },

  notesText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
    fontSize: "13px",
    fontWeight: 700,
  },

  footerText: {
    maxWidth: "620px",
    margin: "24px auto 0",
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.6,
    fontWeight: 700,
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "22px",
    flexWrap: "wrap",
  },

  backButton: {
    minWidth: "190px",
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "14px 22px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(15,23,42,0.08)",
  },

  nextButton: {
    minWidth: "260px",
    border: "1px solid rgba(255,255,255,0.72)",
    borderRadius: "999px",
    padding: "14px 22px",
    background:
      "linear-gradient(135deg, #ff7a59 0%, #facc15 52%, #fff7ad 100%)",
    color: "#111827",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow:
      "0 18px 45px rgba(255,122,89,0.34), 0 8px 24px rgba(250,204,21,0.24)",
  },
};
