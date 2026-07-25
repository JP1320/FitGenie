import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StepShell from "../components/StepShell";
import { useFlowStore } from "../store/useFlowStore";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Custom"];

const BODY_TYPE_OPTIONS = [
  "Balanced",
  "Straight balanced",
  "Soft balanced",
  "Slim",
  "Curvy",
  "Athletic",
  "Broad shoulder",
  "Pear shaped",
];

const FIT_OPTIONS = [
  "Regular fit",
  "Smart comfort fit",
  "Comfort fit",
  "Slim fit",
  "Relaxed fit",
  "Oversized fit",
];

const SHOULDER_OPTIONS = [
  "Standard shoulder",
  "Structured shoulder",
  "Narrow shoulder",
  "Broad shoulder",
  "Dropped shoulder",
];

const LENGTH_OPTIONS = [
  "Regular length",
  "Short regular",
  "Cropped",
  "Longline",
  "Tunic length",
];

function getInitialForm(sizeBody = {}, scanner = {}) {
  const aiFit = scanner?.aiFit || {};

  return {
    size: sizeBody.size || aiFit.estimatedSize || "",
    bodyType: sizeBody.bodyType || aiFit.bodyType || "",
    fitPreference: sizeBody.fitPreference || aiFit.fitPreference || "",
    shoulderProfile: sizeBody.shoulderProfile || aiFit.shoulderProfile || "",
    lengthPreference: sizeBody.lengthPreference || aiFit.lengthPreference || "",
    notes: sizeBody.notes || "",
  };
}

export default function SizeBodyPage() {
  const nav = useNavigate();

  const { scanner, sizeBody, patch } = useFlowStore();

  const aiFit = scanner?.aiFit;

  const initialForm = useMemo(
    () => getInitialForm(sizeBody, scanner),
    [sizeBody, scanner]
  );

  const [form, setForm] = useState(initialForm);

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleContinue() {
    patch({
      sizeBody: {
        ...form,
        fitSource: aiFit ? "ai-fit-scanner-confirmed" : "manual",
        confirmedAt: new Date().toISOString(),
      },
    });

    nav("/guided-filters");
  }

  function goBackToScanner() {
    nav("/camera-scan");
  }

  return (
    <StepShell step="Fit Details" title="Help us understand the fit better">
      <main style={styles.page}>
        <section style={styles.card}>
          <div style={styles.header}>
            <span style={styles.badge}>Fit profile</span>

            <h1 style={styles.title}>Help us understand the fit better</h1>

            <p style={styles.subtitle}>
              Confirm the AI-scanned details or adjust them manually so FitGenie
              can recommend better outfits for your body profile and fit
              preference.
            </p>

            {aiFit ? (
              <div style={styles.aiNotice}>
                <strong>AI Fit Scanner detected:</strong>{" "}
                {aiFit.estimatedSize} size, {aiFit.bodyType},{" "}
                {aiFit.fitPreference}. You can confirm or adjust the details
                below.
              </div>
            ) : (
              <div style={styles.manualNotice}>
                <strong>Manual fit mode:</strong> Enter your fit details below.
                These details will be used for outfit recommendations.
              </div>
            )}
          </div>

          <div style={styles.grid}>
            <section style={styles.panel}>
              <h2 style={styles.panelTitle}>Your size</h2>

              <div style={styles.chipGrid}>
                {SIZE_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => updateField("size", item)}
                    style={{
                      ...styles.chip,
                      ...(form.size === item ? styles.chipActive : {}),
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section style={styles.panel}>
              <h2 style={styles.panelTitle}>Body profile</h2>

              <div style={styles.chipGrid}>
                {BODY_TYPE_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => updateField("bodyType", item)}
                    style={{
                      ...styles.chip,
                      ...(form.bodyType === item ? styles.chipActive : {}),
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section style={styles.panel}>
              <h2 style={styles.panelTitle}>Preferred fit</h2>

              <div style={styles.chipGrid}>
                {FIT_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => updateField("fitPreference", item)}
                    style={{
                      ...styles.chip,
                      ...(form.fitPreference === item ? styles.chipActive : {}),
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section style={styles.panel}>
              <h2 style={styles.panelTitle}>Shoulder profile</h2>

              <div style={styles.chipGrid}>
                {SHOULDER_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => updateField("shoulderProfile", item)}
                    style={{
                      ...styles.chip,
                      ...(form.shoulderProfile === item
                        ? styles.chipActive
                        : {}),
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section style={styles.panel}>
              <h2 style={styles.panelTitle}>Length preference</h2>

              <div style={styles.chipGrid}>
                {LENGTH_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => updateField("lengthPreference", item)}
                    style={{
                      ...styles.chip,
                      ...(form.lengthPreference === item
                        ? styles.chipActive
                        : {}),
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section style={styles.panel}>
              <h2 style={styles.panelTitle}>Extra fit notes</h2>

              <textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Example: I prefer loose sleeves, longer tops, or comfortable waist fitting."
                style={styles.textarea}
              />
            </section>
          </div>

          <div style={styles.summary}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Size</span>
              <strong style={styles.summaryValue}>{form.size || "Not set"}</strong>
            </div>

            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Body profile</span>
              <strong style={styles.summaryValue}>
                {form.bodyType || "Not set"}
              </strong>
            </div>

            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Fit</span>
              <strong style={styles.summaryValue}>
                {form.fitPreference || "Not set"}
              </strong>
            </div>
          </div>

          <div style={styles.actions}>
            <button type="button" onClick={goBackToScanner} style={styles.backButton}>
              Back to AI Scanner
            </button>

            <button
              type="button"
              onClick={handleContinue}
              style={styles.nextButton}
            >
              Continue to Choose Look
            </button>
          </div>
        </section>
      </main>
    </StepShell>
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

  card: {
    width: "min(1040px, 100%)",
    padding: "30px",
    borderRadius: "34px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(255,255,255,0.74)",
    boxShadow: "0 28px 80px rgba(15,23,42,0.18)",
    backdropFilter: "blur(18px)",
  },

  header: {
    marginBottom: "22px",
  },

  badge: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(14,165,233,0.14)",
    border: "1px solid rgba(14,165,233,0.28)",
    color: "#0369a1",
    fontSize: "12px",
    fontWeight: 950,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "14px",
  },

  title: {
    margin: "0 0 10px",
    fontSize: "clamp(34px, 5vw, 56px)",
    lineHeight: 0.98,
    letterSpacing: "-0.07em",
    color: "#0f172a",
  },

  subtitle: {
    width: "min(760px, 100%)",
    margin: 0,
    color: "#475569",
    fontSize: "16px",
    lineHeight: 1.7,
    fontWeight: 700,
  },

  aiNotice: {
    marginTop: "16px",
    padding: "13px 15px",
    borderRadius: "18px",
    background: "rgba(14,165,233,0.12)",
    border: "1px solid rgba(14,165,233,0.22)",
    color: "#075985",
    fontWeight: 800,
    lineHeight: 1.5,
  },

  manualNotice: {
    marginTop: "16px",
    padding: "13px 15px",
    borderRadius: "18px",
    background: "rgba(250,204,21,0.16)",
    border: "1px solid rgba(250,204,21,0.28)",
    color: "#854d0e",
    fontWeight: 800,
    lineHeight: 1.5,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  panel: {
    padding: "18px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(255,255,255,0.72)",
    boxShadow: "0 14px 38px rgba(15,23,42,0.08)",
  },

  panelTitle: {
    margin: "0 0 14px",
    color: "#0f172a",
    fontSize: "18px",
    fontWeight: 950,
    letterSpacing: "-0.025em",
  },

  chipGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  chip: {
    border: "1px solid rgba(15,23,42,0.12)",
    borderRadius: "999px",
    padding: "10px 14px",
    background: "rgba(255,255,255,0.82)",
    color: "#334155",
    fontSize: "13px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 10px 26px rgba(15,23,42,0.06)",
  },

  chipActive: {
    border: "1px solid rgba(14,165,233,0.36)",
    background:
      "linear-gradient(135deg, rgba(34,211,238,0.95), rgba(167,139,250,0.95), rgba(244,114,182,0.92))",
    color: "#ffffff",
    boxShadow: "0 14px 34px rgba(14,165,233,0.22)",
  },

  textarea: {
    width: "100%",
    minHeight: "118px",
    resize: "vertical",
    boxSizing: "border-box",
    border: "1px solid rgba(15,23,42,0.12)",
    borderRadius: "18px",
    padding: "14px",
    background: "rgba(255,255,255,0.9)",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.55,
    outline: "none",
    fontFamily: "inherit",
  },

  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    marginTop: "18px",
  },

  summaryItem: {
    padding: "14px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(255,255,255,0.72)",
  },

  summaryLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    marginBottom: "5px",
  },

  summaryValue: {
    display: "block",
    color: "#0f172a",
    fontSize: "15px",
    fontWeight: 950,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "22px",
    flexWrap: "wrap",
  },

  backButton: {
    flex: "1 1 220px",
    border: "1px solid rgba(15,23,42,0.12)",
    borderRadius: "999px",
    padding: "14px 20px",
    background: "rgba(255,255,255,0.82)",
    color: "#0f172a",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 14px 34px rgba(15,23,42,0.08)",
  },

  nextButton: {
    flex: "1 1 260px",
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
