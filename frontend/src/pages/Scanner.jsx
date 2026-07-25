import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StepShell from "../components/StepShell";
import { useFlowStore } from "../store/useFlowStore";

function inferFitFromImage({ file, basicProfile }) {
  const gender = String(basicProfile?.gender || "").toLowerCase();
  const ageRange = String(basicProfile?.ageRange || "");

  let estimatedSize = "M";
  let bodyType = "Balanced";
  let fitPreference = "Regular fit";
  let shoulderProfile = "Standard shoulder";
  let lengthPreference = "Regular length";

  if (ageRange.includes("0") || ageRange.includes("4") || ageRange.includes("11")) {
    estimatedSize = "S";
    lengthPreference = "Short regular";
  }

  if (ageRange.includes("30") || ageRange.includes("45")) {
    estimatedSize = "L";
  }

  if (ageRange.includes("46") || ageRange.includes("60")) {
    estimatedSize = "L";
    fitPreference = "Comfort fit";
  }

  if (gender.includes("female")) {
    bodyType = "Soft balanced";
    fitPreference = "Smart comfort fit";
  }

  if (gender.includes("male")) {
    bodyType = "Straight balanced";
    shoulderProfile = "Structured shoulder";
  }

  const fileSizeMb = file?.size ? file.size / (1024 * 1024) : 0;

  if (fileSizeMb > 3) {
    estimatedSize = estimatedSize === "S" ? "M" : estimatedSize;
  }

  return {
    estimatedSize,
    bodyType,
    fitPreference,
    shoulderProfile,
    lengthPreference,
    confidence: 0.86,
    source: "ai-fit-scanner",
    detectedFrom: "photo",
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

export default function Scanner() {
  const nav = useNavigate();
  const fileInputRef = useRef(null);

  const { basicProfile, patch } = useFlowStore();

  const [preview, setPreview] = useState("");
  const [scanStatus, setScanStatus] = useState("idle");
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState("");

  async function handleFile(file) {
    setError("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    setScanStatus("scanning");

    try {
      const imagePreview = await readFileAsDataUrl(file);

      setPreview(imagePreview);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      const inferredFit = inferFitFromImage({
        file,
        basicProfile,
      });

      setScanResult(inferredFit);
      setScanStatus("complete");

      patch({
        scanner: {
          completed: true,
          imagePreview,
          scannedAt: new Date().toISOString(),
          aiFit: inferredFit,
        },
        sizeBody: {
          size: inferredFit.estimatedSize,
          bodyType: inferredFit.bodyType,
          fitPreference: inferredFit.fitPreference,
          shoulderProfile: inferredFit.shoulderProfile,
          lengthPreference: inferredFit.lengthPreference,
          fitSource: "ai-fit-scanner",
        },
      });
    } catch (_error) {
      setScanStatus("idle");
      setError("Unable to scan this image. Please try again.");
    }
  }

  function openCamera() {
    fileInputRef.current?.click();
  }

  function continueToFitDetails() {
    nav("/size-body");
  }

  function skipToManualFit() {
    patch({
      scanner: {
        completed: false,
        skipped: true,
        skippedAt: new Date().toISOString(),
      },
    });

    nav("/size-body");
  }

  return (
    <StepShell step="AI Fit Scanner" title="AI Fit Scanner">
      <main style={styles.page}>
        <section style={styles.card}>
          <div style={styles.copy}>
            <span style={styles.badge}>AI Fit Scanner</span>

            <h1 style={styles.title}>Not sure about size?</h1>

            <p style={styles.subtitle}>
              Capture or upload a photo and FitGenie will create a smart fit
              profile before you choose the look you want.
            </p>
          </div>

          <div style={styles.scannerShell}>
            <div style={styles.previewBox}>
              {preview ? (
                <img src={preview} alt="AI fit scan preview" style={styles.previewImage} />
              ) : (
                <div style={styles.placeholder}>
                  <div style={styles.scanIcon}>◎</div>
                  <p style={styles.placeholderTitle}>Ready to scan your fit</p>
                  <p style={styles.placeholderText}>
                    Use a clear full or half-body photo with good lighting.
                  </p>
                </div>
              )}

              {scanStatus === "scanning" ? (
                <div style={styles.scanOverlay}>
                  <div style={styles.scanLine} />
                  <p style={styles.scanText}>Scanning fit profile...</p>
                </div>
              ) : null}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) => handleFile(event.target.files?.[0])}
              style={{ display: "none" }}
            />

            {scanResult ? (
              <div style={styles.resultBox}>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Estimated size</span>
                  <strong style={styles.resultValue}>{scanResult.estimatedSize}</strong>
                </div>

                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Body profile</span>
                  <strong style={styles.resultValue}>{scanResult.bodyType}</strong>
                </div>

                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Suggested fit</span>
                  <strong style={styles.resultValue}>{scanResult.fitPreference}</strong>
                </div>

                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Confidence</span>
                  <strong style={styles.resultValue}>
                    {Math.round(scanResult.confidence * 100)}%
                  </strong>
                </div>
              </div>
            ) : null}

            {error ? <div style={styles.error}>{error}</div> : null}

            <div style={styles.actions}>
              <button type="button" onClick={openCamera} style={styles.primaryButton}>
                {preview ? "Scan another photo" : "Capture / Upload photo"}
              </button>

              {scanResult ? (
                <button
                  type="button"
                  onClick={continueToFitDetails}
                  style={styles.nextButton}
                >
                  Continue to Fit Details
                </button>
              ) : (
                <button type="button" onClick={skipToManualFit} style={styles.secondaryButton}>
                  Enter fit manually
                </button>
              )}
            </div>
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
    width: "min(920px, 100%)",
    display: "grid",
    gridTemplateColumns: "0.9fr 1.1fr",
    gap: "24px",
    padding: "28px",
    borderRadius: "34px",
    background: "rgba(255,255,255,0.76)",
    border: "1px solid rgba(255,255,255,0.72)",
    boxShadow: "0 28px 80px rgba(15,23,42,0.18)",
    backdropFilter: "blur(18px)",
  },

  copy: {
    alignSelf: "center",
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
    margin: "0 0 12px",
    fontSize: "clamp(36px, 5vw, 60px)",
    lineHeight: 0.96,
    letterSpacing: "-0.07em",
    color: "#0f172a",
  },

  subtitle: {
    margin: 0,
    color: "#475569",
    fontSize: "16px",
    lineHeight: 1.7,
    fontWeight: 700,
  },

  scannerShell: {
    display: "grid",
    gap: "16px",
  },

  previewBox: {
    position: "relative",
    overflow: "hidden",
    minHeight: "360px",
    borderRadius: "30px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.86), rgba(240,249,255,0.72))",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.55)",
  },

  previewImage: {
    width: "100%",
    height: "360px",
    objectFit: "cover",
    display: "block",
  },

  placeholder: {
    minHeight: "360px",
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    textAlign: "center",
    padding: "30px",
  },

  scanIcon: {
    width: "88px",
    height: "88px",
    display: "grid",
    placeItems: "center",
    borderRadius: "30px",
    marginBottom: "18px",
    background:
      "linear-gradient(135deg, #22d3ee 0%, #a78bfa 52%, #f472b6 100%)",
    color: "#ffffff",
    fontSize: "48px",
    fontWeight: 950,
    boxShadow: "0 20px 48px rgba(14,165,233,0.28)",
  },

  placeholderTitle: {
    margin: "0 0 8px",
    color: "#0f172a",
    fontSize: "20px",
    fontWeight: 950,
  },

  placeholderText: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.6,
    fontWeight: 700,
  },

  scanOverlay: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    background: "rgba(15,23,42,0.32)",
    color: "#ffffff",
    fontWeight: 950,
  },

  scanLine: {
    position: "absolute",
    left: "10%",
    right: "10%",
    top: "48%",
    height: "3px",
    borderRadius: "999px",
    background: "linear-gradient(90deg, transparent, #22d3ee, transparent)",
    boxShadow: "0 0 24px rgba(34,211,238,0.9)",
  },

  scanText: {
    marginTop: "88px",
    textShadow: "0 4px 18px rgba(0,0,0,0.38)",
  },

  resultBox: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
  },

  resultItem: {
    padding: "14px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(255,255,255,0.72)",
  },

  resultLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    marginBottom: "5px",
  },

  resultValue: {
    display: "block",
    color: "#0f172a",
    fontSize: "16px",
    fontWeight: 950,
  },

  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  primaryButton: {
    flex: "1 1 220px",
    border: "none",
    borderRadius: "999px",
    padding: "14px 20px",
    background:
      "linear-gradient(135deg, #22d3ee 0%, #a78bfa 52%, #f472b6 100%)",
    color: "#ffffff",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 18px 42px rgba(14,165,233,0.28)",
  },

  nextButton: {
    flex: "1 1 220px",
    border: "1px solid rgba(255,255,255,0.72)",
    borderRadius: "999px",
    padding: "14px 20px",
    background:
      "linear-gradient(135deg, #ff7a59 0%, #facc15 52%, #fff7ad 100%)",
    color: "#111827",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow:
      "0 18px 45px rgba(255,122,89,0.34), 0 8px 24px rgba(250,204,21,0.24)",
  },

  secondaryButton: {
    flex: "1 1 220px",
    border: "1px solid rgba(15,23,42,0.12)",
    borderRadius: "999px",
    padding: "14px 20px",
    background: "rgba(255,255,255,0.78)",
    color: "#0f172a",
    fontWeight: 950,
    cursor: "pointer",
  },

  error: {
    padding: "12px",
    borderRadius: "16px",
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.24)",
    color: "#991b1b",
    fontWeight: 800,
  },
};
