import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

function valueOrFallback(value, fallback = "Not selected") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return value;
}

function getUserLabel(authUser) {
  if (authUser?.email) return authUser.email;
  if (authUser?.name) return authUser.name;
  return "Guest user";
}

export default function FitCardPage() {
  const nav = useNavigate();
  const flow = useFlowStore();

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

  return (
    <PageShell>
      <div style={styles.page}>
        <div style={styles.content}>
          <section style={styles.header}>
            <div>
              <div style={styles.stepPill}>Step 10 of 12 · Auto Fit Card</div>

              <h1 style={styles.title}>Your FitGenie Fit Card</h1>

              <p style={styles.subtitle}>
                This card summarizes your profile, AI scan, outfit preferences,
                expert choice, and delivery mode.
              </p>
            </div>

            <div style={styles.statusCard}>
              <span style={styles.statusLabel}>Fit Card Status</span>
              <strong style={styles.statusValue}>
                {valueOrFallback(fitCardData.status, "Generated")}
              </strong>
              <small style={styles.statusHint}>
                {fitCardData.generatedAt
                  ? `Generated at ${new Date(
                      fitCardData.generatedAt
                    ).toLocaleString()}`
                  : "Ready to share with expert"}
              </small>
            </div>
          </section>

          <section style={styles.grid}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Account</h2>

              <div style={styles.row}>
                <span>User</span>
                <strong>{getUserLabel(authUser)}</strong>
              </div>

              <div style={styles.row}>
                <span>Buying for</span>
                <strong>{valueOrFallback(intent, "Myself")}</strong>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Basic Profile</h2>

              <div style={styles.row}>
                <span>Age range</span>
                <strong>{valueOrFallback(basicProfile?.ageRange)}</strong>
              </div>

              <div style={styles.row}>
                <span>Gender</span>
                <strong>{valueOrFallback(basicProfile?.gender)}</strong>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>AI Fit Scanner</h2>

              <div style={styles.row}>
                <span>Scan status</span>
                <strong>
                  {scanner?.completed
                    ? "Completed"
                    : scanner?.skipped
                    ? "Skipped"
                    : "Not used"}
                </strong>
              </div>

              <div style={styles.row}>
                <span>AI confidence</span>
                <strong>
                  {aiFit?.confidence
                    ? `${Math.round(aiFit.confidence * 100)}%`
                    : "Not available"}
                </strong>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Fit Details</h2>

              <div style={styles.row}>
                <span>Size</span>
                <strong>{valueOrFallback(finalSize)}</strong>
              </div>

              <div style={styles.row}>
                <span>Body type</span>
                <strong>{valueOrFallback(finalBodyType)}</strong>
              </div>

              <div style={styles.row}>
                <span>Fit preference</span>
                <strong>{valueOrFallback(finalFit)}</strong>
              </div>

              <div style={styles.row}>
                <span>Height</span>
                <strong>{finalHeight}</strong>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Look Preferences</h2>

              <div style={styles.row}>
                <span>Style</span>
                <strong>
                  {valueOrFallback(
                    lookPreferences.style ||
                      lookPreferences.look ||
                      lookPreferences.selectedLook
                  )}
                </strong>
              </div>

              <div style={styles.row}>
                <span>Budget</span>
                <strong>{valueOrFallback(lookPreferences.budget)}</strong>
              </div>

              <div style={styles.row}>
                <span>Fabric</span>
                <strong>
                  {Array.isArray(lookPreferences.fabric)
                    ? lookPreferences.fabric.join(", ")
                    : valueOrFallback(lookPreferences.fabric)}
                </strong>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Service & Expert</h2>

              <div style={styles.row}>
                <span>Service type</span>
                <strong>
                  {valueOrFallback(
                    serviceType?.type ||
                      serviceType?.serviceType ||
                      serviceType?.title
                  )}
                </strong>
              </div>

              <div style={styles.row}>
                <span>Quality</span>
                <strong>
                  {valueOrFallback(
                    qualityLocation?.quality || qualityLocation?.qualityLevel
                  )}
                </strong>
              </div>

              <div style={styles.row}>
                <span>Expert</span>
                <strong>
                  {valueOrFallback(
                    selectedExpert?.name ||
                      selectedExpert?.title ||
                      selectedExpert?.expertName
                  )}
                </strong>
              </div>
            </div>

            <div style={styles.cardWide}>
              <h2 style={styles.cardTitle}>Delivery & Interaction</h2>

              <div style={styles.row}>
                <span>Delivery mode</span>
                <strong>
                  {valueOrFallback(
                    deliveryData.deliveryMode || deliveryData.mode
                  )}
                </strong>
              </div>

              <div style={styles.row}>
                <span>Interaction mode</span>
                <strong>
                  {valueOrFallback(
                    deliveryData.interactionMode || deliveryData.interaction
                  )}
                </strong>
              </div>

              <div style={styles.row}>
                <span>Timeline</span>
                <strong>{valueOrFallback(deliveryData.timeline)}</strong>
              </div>

              <div style={styles.row}>
                <span>Notes</span>
                <strong>{valueOrFallback(deliveryData.notes, "No notes")}</strong>
              </div>
            </div>
          </section>

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
        </div>
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

  content: {
    width: "min(1080px, 100%)",
  },

  header: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 300px",
    gap: "20px",
    alignItems: "stretch",
    marginBottom: "22px",
  },

  stepPill: {
    display: "inline-flex",
    padding: "9px 13px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.76)",
    border: "1px solid rgba(109,93,252,0.16)",
    color: "#4f46e5",
    fontSize: "13px",
    fontWeight: 900,
    marginBottom: "16px",
    boxShadow: "0 10px 24px rgba(79,70,229,0.08)",
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

  statusCard: {
    border: "1px solid rgba(109,93,252,0.14)",
    borderRadius: "28px",
    padding: "20px",
    background: "rgba(255,255,255,0.78)",
    boxShadow: "0 18px 42px rgba(15,23,42,0.1)",
    backdropFilter: "blur(18px)",
  },

  statusLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "8px",
  },

  statusValue: {
    display: "block",
    color: "#111827",
    fontSize: "28px",
    marginBottom: "8px",
  },

  statusHint: {
    color: "#64748b",
    lineHeight: 1.5,
    fontWeight: 700,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  card: {
    border: "1px solid rgba(109,93,252,0.14)",
    borderRadius: "26px",
    padding: "20px",
    background: "rgba(255,255,255,0.78)",
    boxShadow: "0 18px 42px rgba(15,23,42,0.09)",
    backdropFilter: "blur(18px)",
  },

  cardWide: {
    gridColumn: "1 / -1",
    border: "1px solid rgba(109,93,252,0.14)",
    borderRadius: "26px",
    padding: "20px",
    background: "rgba(255,255,255,0.78)",
    boxShadow: "0 18px 42px rgba(15,23,42,0.09)",
    backdropFilter: "blur(18px)",
  },

  cardTitle: {
    margin: "0 0 14px",
    color: "#111827",
    fontSize: "21px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    padding: "11px 0",
    borderBottom: "1px solid rgba(226,232,240,0.88)",
    color: "#475569",
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
