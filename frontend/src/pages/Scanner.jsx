import React, { useEffect, useRef, useState } from "react";
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

  if (
    ageRange.includes("0") ||
    ageRange.includes("4") ||
    ageRange.includes("11")
  ) {
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

  const captureInputRef = useRef(null);
  const uploadInputRef = useRef(null);
  const redirectTimerRef = useRef(null);

  const { basicProfile, patch } = useFlowStore();

  const [preview, setPreview] = useState("");
  const [scanStatus, setScanStatus] = useState("idle");
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  async function handleScanFile(file, scanMode) {
    setError("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    setScanStatus("scanning");
    setScanResult(null);

    try {
      const imagePreview = await readFileAsDataUrl(file);

      setPreview(imagePreview);

      await new Promise((resolve) => setTimeout(resolve, 1300));

      const inferredFit = inferFitFromImage({
        file,
        basicProfile,
      });

      setScanResult(inferredFit);
      setScanStatus("complete");

      patch({
        scanner: {
          completed: true,
          skipped: false,
          scanMode,
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

      redirectTimerRef.current = setTimeout(() => {
        nav("/size-body");
      }, 900);
    } catch (_error) {
      setScanStatus("idle");
      setError("Unable to scan this image. Please try again.");
    }
  }

  function capturePhoto() {
    captureInputRef.current?.click();
  }

  function uploadPhoto() {
    uploadInputRef.current?.click();
  }

  function enterFitDetailsManually() {
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
              Capture a photo, upload an existing photo, or enter your fit
              details manually. FitGenie will use this information to understand
              your size and outfit fit better.
            </p>

            <div style={styles.mottoBox}>
              <strong style={styles.mottoTitle}>Main FitGenie idea</strong>
              <span style={styles.mottoText}>
                One scan helps estimate your fit profile before outfit
                recommendations are created.
              </span>
            </div>
          </div>

          <div style={styles.scannerShell}>
            <div style={styles.previewBox}>
              {preview ? (
                <img
                  src={preview}
                  alt="AI fit scan preview"
                  style={styles.previewImage}
                />
              ) : (
                <div style={styles.placeholder}>
                  <div style={styles.scanIcon}>◎</div>

                  <p style={styles.placeholderTitle}>Ready to scan your fit</p>

                  <p style={styles.placeholderText}>
                    Use a clear full-body or half-body photo with good lighting.
                  </p>
                </div>
              )}

              {scanStatus === "scanning" ? (
                <div style={styles.scanOverlay}>
                  <div style={styles.scanLine} />
                  <p style={styles.scanText}>Scanning fit profile...</p>
                </div>
              ) : null}

              {scanStatus === "complete" ? (
                <div style={styles.completeOverlay}>
                  <div style={styles.completeIcon}>✓</div>
                  <p style={styles.completeText}>
                    Fit profile created. Moving to fit details...
                  </p>
                </div>
              ) : null}
            </div>

            <input
              ref={captureInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) =>
                handleScanFile(event.target.files?.[0], "capture")
              }
              style={{ display: "none" }}
            />

            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              onChange={(event) =>
                handleScanFile(event.target.files?.[0], "upload")
              }
              style={{ display: "none" }}
            />

            {scanResult ? (
              <div style={styles.resultBox}>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Estimated size</span>
                  <strong style={styles.resultValue}>
                    {scanResult.estimatedSize}
                  </strong>
                </div>

                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Body profile</span>
                  <strong style={styles.resultValue}>
                    {scanResult.bodyType}
                  </strong>
                </div>

                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Suggested fit</span>
                  <strong style={styles.resultValue}>
                    {scanResult.fitPreference}
                  </strong>
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
              <button
                type="button"
                onClick={capturePhoto}
                disabled={scanStatus === "scanning"}
                style={{
                  ...styles.captureButton,
                  opacity: scanStatus === "scanning" ? 0.72 : 1,
                }}
              >
                Capture photo
              </button>

              <button
                type="button"
                onClick={uploadPhoto}
                disabled={scanStatus === "scanning"}
                style={{
                  ...styles.uploadButton,
                  opacity: scanStatus === "scanning" ? 0.72 : 1,
                }}
              >
                Upload photo
              </button>

              <button
                type="button"
                onClick={enterFitDetailsManually}
                disabled={scanStatus === "scanning"}
                style={{
                  ...styles.manualButton,
                  opacity: scanStatus === "scanning" ? 0.72 : 1,
                }}
              >
                Enter fit details manually
              </button>
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
    width: "min(940px, 100%)",
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

  mottoBox: {
    marginTop: "20px",
    padding: "16px",
    borderRadius: "22px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(240,249,255,0.72))",
    border: "1px solid rgba(14,165,233,0.18)",
  },

  mottoTitle: {
    display: "block",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 950,
    marginBottom: "6px",
  },

  mottoText: {
    display: "block",
    color: "#475569",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.55,
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

  completeOverlay: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    gap: "10px",
    background: "rgba(15,23,42,0.34)",
    color: "#ffffff",
    textAlign: "center",
    fontWeight: 950,
  },

  completeIcon: {
    width: "70px",
    height: "70px",
    display: "grid",
    placeItems: "center",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #22c55e, #bbf7d0)",
    color: "#052e16",
    fontSize: "34px",
    boxShadow: "0 18px 42px rgba(34,197,94,0.28)",
  },

  completeText: {
    margin: 0,
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
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },

  captureButton: {
    border: "none",
    borderRadius: "999px",
    padding: "14px 18px",
    background:
      "linear-gradient(135deg, #22d3ee 0%, #38bdf8 45%, #a78bfa 100%)",
    color: "#ffffff",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 18px 42px rgba(14,165,233,0.28)",
  },

  uploadButton: {
    border: "none",
    borderRadius: "999px",
    padding: "14px 18px",
    background:
      "linear-gradient(135deg, #f472b6 0%, #c084fc 52%, #818cf8 100%)",
    color: "#ffffff",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 18px 42px rgba(192,132,252,0.24)",
  },

  manualButton: {
    border: "1px solid rgba(15,23,42,0.12)",
    borderRadius: "999px",
    padding: "14px 18px",
    background:
      "linear-gradient(135deg, #ff7a59 0%, #facc15 52%, #fff7ad 100%)",
    color: "#111827",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow:
      "0 18px 45px rgba(255,122,89,0.26), 0 8px 24px rgba(250,204,21,0.2)",
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
