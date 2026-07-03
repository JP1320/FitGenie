import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StepShell from "../components/StepShell";
import { callApi } from "../services/api";
import { useFlowStore } from "../store/useFlowStore";

const COUNTRIES = [
  { name: "India", code: "+91", flag: "🇮🇳", digits: 10 },
  { name: "United States", code: "+1", flag: "🇺🇸", digits: 10 },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧", digits: 10 },
  { name: "United Arab Emirates", code: "+971", flag: "🇦🇪", digits: 9 },
  { name: "Canada", code: "+1", flag: "🇨🇦", digits: 10 },
  { name: "Australia", code: "+61", flag: "🇦🇺", digits: 9 },
  { name: "Singapore", code: "+65", flag: "🇸🇬", digits: 8 },
];

export default function LoginMobile() {
  const nav = useNavigate();
  const { patch } = useFlowStore();

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [requestId, setRequestId] = useState("");
  const [step, setStep] = useState("phone");
  const [loading, setLoading] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const otpInputRef = useRef(null);

  const cleanPhone = useMemo(() => phone.replace(/\D/g, ""), [phone]);
  const fullPhone = `${selectedCountry.code}${cleanPhone}`;

  const isPhoneValid =
    cleanPhone.length >= Math.min(selectedCountry.digits, 8) &&
    cleanPhone.length <= 12;

  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  useEffect(() => {
    async function verifyAutomatically() {
      if (step !== "otp") return;
      if (otp.length !== 6) return;
      if (autoVerifying) return;

      setAutoVerifying(true);
      await verifyOtp(otp);
      setAutoVerifying(false);
    }

    verifyAutomatically();
  }, [otp, step]);

  async function sendOtp() {
    setError("");
    setInfo("");

    if (!isPhoneValid) {
      setError(
        `Please enter a valid ${selectedCountry.name} mobile number before requesting OTP.`
      );
      return;
    }

    setLoading(true);

    try {
      const res = await callApi("/auth/mobile/request-otp", "POST", {
        countryCode: selectedCountry.code,
        countryName: selectedCountry.name,
        phone: cleanPhone,
        fullPhone,
      });

      if (!res.ok) {
        setError(res.data?.message || "Unable to send OTP. Please try again.");
        return;
      }

      setRequestId(res.data.requestId || "");
      setStep("otp");

      if (res.data.developmentOtp) {
        setInfo(`OTP generated. Use ${res.data.developmentOtp}.`);
      } else {
        setInfo(res.data?.message || `OTP has been sent to ${fullPhone}.`);
      }
    } catch (_error) {
      setError("Unable to connect to OTP service.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(valueFromAutoVerify) {
    const otpToVerify = valueFromAutoVerify || otp;

    setError("");

    if (!requestId) {
      setError("Please request an OTP first.");
      return;
    }

    if (otpToVerify.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const res = await callApi("/auth/mobile/verify-otp", "POST", {
        requestId,
        countryCode: selectedCountry.code,
        phone: cleanPhone,
        fullPhone,
        otp: otpToVerify,
      });

      if (!res.ok) {
        setError(res.data?.message || "OTP verification failed.");
        setLoading(false);
        return;
      }

      patch({
        loginMode: "mobile",
        authUser: res.data.user,
        authToken: res.data.token,
      });

      nav("/intent");
    } catch (_error) {
      setError("Unable to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function editPhoneNumber() {
    setStep("phone");
    setOtp("");
    setRequestId("");
    setError("");
    setInfo("");
  }

  return (
    <StepShell
      step="Login"
      title={
        step === "phone"
          ? "Continue with mobile number"
          : "Verify your mobile number"
      }
    >
      <main style={styles.pageShell}>
        <div style={styles.orbOne} />
        <div style={styles.orbTwo} />
        <div style={styles.orbThree} />
        <div style={styles.gridPattern} />

        <section style={styles.page}>
          <article style={styles.heroCard}>
            <div style={styles.heroOverlay} />

            <div style={styles.badgeRow}>
              <span style={styles.badge}>FitGenie secure login</span>
              <span style={styles.badgeLight}>Mobile OTP</span>
            </div>

            <div style={styles.heroContent}>
              <div style={styles.logoWrap}>
                <div style={styles.logoCircle}>📱</div>
                <div style={styles.logoGlow} />
              </div>

              <p style={styles.eyebrow}>Quick mobile access</p>

              <h2 style={styles.heading}>
                {step === "phone"
                  ? "Continue with your mobile number"
                  : "Enter the OTP sent to your phone"}
              </h2>

              <p style={styles.subText}>
                {step === "phone"
                  ? "Use your phone number to access FitGenie, save your style preferences, fit card, expert selection, and order updates."
                  : `Enter the 6-digit OTP sent to ${fullPhone}. FitGenie will continue automatically once verification is complete.`}
              </p>
            </div>

            <div style={styles.featureGrid}>
              <div style={styles.featureTile}>
                <span style={styles.featureIcon}>🔐</span>
                <strong>Secure OTP</strong>
                <p>Private login flow for your FitGenie account.</p>
              </div>

              <div style={styles.featureTile}>
                <span style={styles.featureIcon}>✨</span>
                <strong>Saved fit journey</strong>
                <p>Your profile, fit card, and order updates stay connected.</p>
              </div>
            </div>
          </article>

          <article style={styles.accountPanel}>
            <div style={styles.panelGlow} />

            <div style={styles.sectionHeader}>
              <span style={styles.stepChip}>{step === "phone" ? "01" : "02"}</span>

              <div>
                <h3 style={styles.sectionTitle}>
                  {step === "phone"
                    ? "Add your mobile number"
                    : "Verify OTP"}
                </h3>

                <p style={styles.sectionSub}>
                  {step === "phone"
                    ? "Choose your country code, enter your mobile number, and request a one-time password."
                    : "Enter the 6-digit code to securely continue your FitGenie journey."}
                </p>
              </div>
            </div>

            {step === "phone" ? (
              <div style={styles.formCard}>
                <label style={styles.label}>Country code</label>

                <select
                  value={`${selectedCountry.name}-${selectedCountry.code}`}
                  onChange={(event) => {
                    const found = COUNTRIES.find(
                      (country) =>
                        `${country.name}-${country.code}` === event.target.value
                    );

                    if (found) {
                      setSelectedCountry(found);
                      setPhone("");
                    }
                  }}
                  style={styles.select}
                >
                  {COUNTRIES.map((country) => (
                    <option
                      key={`${country.name}-${country.code}`}
                      value={`${country.name}-${country.code}`}
                    >
                      {country.flag} {country.name} ({country.code})
                    </option>
                  ))}
                </select>

                <label style={styles.label}>Mobile number</label>

                <div style={styles.phoneRow}>
                  <div style={styles.countryBadge}>
                    <span>{selectedCountry.flag}</span>
                    <strong>{selectedCountry.code}</strong>
                  </div>

                  <input
                    value={phone}
                    onChange={(event) => {
                      const nextValue = event.target.value.replace(/[^\d]/g, "");
                      setPhone(nextValue);
                    }}
                    placeholder="Enter mobile number"
                    inputMode="numeric"
                    autoComplete="tel"
                    style={styles.phoneInput}
                  />
                </div>

                <p style={styles.hint}>
                  Example: {selectedCountry.code}{" "}
                  {selectedCountry.name === "India"
                    ? "9876543210"
                    : "5551234567"}
                </p>

                {error ? <div style={styles.errorBox}>{error}</div> : null}
                {info ? <div style={styles.infoBox}>{info}</div> : null}

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading || !isPhoneValid}
                  style={{
                    ...styles.primaryButton,
                    opacity: loading || !isPhoneValid ? 0.68 : 1,
                    cursor: loading || !isPhoneValid ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            ) : (
              <div style={styles.formCard}>
                <label style={styles.label}>6-digit OTP</label>

                <input
                  ref={otpInputRef}
                  value={otp}
                  onChange={(event) => {
                    const nextValue = event.target.value
                      .replace(/[^\d]/g, "")
                      .slice(0, 6);

                    setOtp(nextValue);
                  }}
                  placeholder="••••••"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  style={styles.otpInput}
                />

                <div style={styles.otpDots}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <span
                      key={index}
                      style={{
                        ...styles.otpDot,
                        ...(otp.length > index ? styles.otpDotFilled : {}),
                      }}
                    />
                  ))}
                </div>

                {error ? <div style={styles.errorBox}>{error}</div> : null}
                {info ? <div style={styles.infoBox}>{info}</div> : null}

                <button
                  type="button"
                  onClick={() => verifyOtp()}
                  disabled={loading || otp.length !== 6}
                  style={{
                    ...styles.primaryButton,
                    opacity: loading || otp.length !== 6 ? 0.68 : 1,
                    cursor:
                      loading || otp.length !== 6 ? "not-allowed" : "pointer",
                  }}
                >
                  {loading || autoVerifying
                    ? "Verifying..."
                    : "Verify & Continue"}
                </button>

                <div style={styles.actionRow}>
                  <button
                    type="button"
                    onClick={editPhoneNumber}
                    style={styles.secondaryButton}
                    disabled={loading}
                  >
                    Change number
                  </button>

                  <button
                    type="button"
                    onClick={sendOtp}
                    style={styles.secondaryButton}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            <div style={styles.infoStrip}>
              <span style={styles.infoIcon}>💫</span>

              <p>
                Mobile login helps FitGenie keep your recommendations, selected
                expert, fit card, and delivery updates connected to your account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => nav("/welcome")}
              style={styles.backButton}
              disabled={loading}
            >
              Back
            </button>
          </article>
        </section>
      </main>
    </StepShell>
  );
}

const styles = {
  pageShell: {
    position: "relative",
    overflow: "hidden",
    minHeight: "calc(100vh - 120px)",
    padding: "30px",
    borderRadius: "36px",
    background:
      "radial-gradient(circle at 8% 12%, rgba(255, 183, 77, 0.42), transparent 28%), radial-gradient(circle at 88% 18%, rgba(109, 93, 252, 0.34), transparent 30%), radial-gradient(circle at 50% 95%, rgba(0, 188, 212, 0.34), transparent 34%), linear-gradient(135deg, #fff7ed 0%, #dbeafe 32%, #ede9fe 62%, #ccfbf1 100%)",
    color: "#14213d",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },

  orbOne: {
    position: "absolute",
    top: "-110px",
    left: "-90px",
    width: "310px",
    height: "310px",
    borderRadius: "999px",
    background:
      "linear-gradient(135deg, rgba(255, 138, 76, 0.48), rgba(255, 214, 102, 0.3))",
    filter: "blur(18px)",
    pointerEvents: "none",
  },

  orbTwo: {
    position: "absolute",
    right: "-120px",
    top: "70px",
    width: "360px",
    height: "360px",
    borderRadius: "999px",
    background:
      "linear-gradient(135deg, rgba(109, 93, 252, 0.38), rgba(0, 188, 212, 0.3))",
    filter: "blur(20px)",
    pointerEvents: "none",
  },

  orbThree: {
    position: "absolute",
    left: "38%",
    bottom: "-150px",
    width: "340px",
    height: "340px",
    borderRadius: "999px",
    background:
      "linear-gradient(135deg, rgba(45, 212, 191, 0.34), rgba(186, 230, 253, 0.38))",
    filter: "blur(22px)",
    pointerEvents: "none",
  },

  gridPattern: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)",
    backgroundSize: "34px 34px",
    maskImage:
      "linear-gradient(135deg, rgba(0,0,0,0.58), rgba(0,0,0,0.06))",
    pointerEvents: "none",
  },

  page: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
    gap: "26px",
    alignItems: "stretch",
  },

  heroCard: {
    position: "relative",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.68)",
    borderRadius: "34px",
    padding: "30px",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.82) 0%, rgba(255,237,213,0.86) 28%, rgba(219,234,254,0.9) 58%, rgba(221,214,254,0.88) 100%)",
    boxShadow: "0 28px 70px rgba(79, 70, 229, 0.18)",
    backdropFilter: "blur(20px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "30px",
    minHeight: "500px",
  },

  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 18% 20%, rgba(255,255,255,0.75), transparent 25%), radial-gradient(circle at 86% 12%, rgba(0,188,212,0.16), transparent 24%), radial-gradient(circle at 72% 88%, rgba(109,93,252,0.15), transparent 28%)",
    pointerEvents: "none",
  },

  badgeRow: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "9px 13px",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 950,
    letterSpacing: "0.04em",
    boxShadow: "0 12px 26px rgba(109, 93, 252, 0.22)",
  },

  badgeLight: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "9px 13px",
    background: "rgba(255,255,255,0.78)",
    color: "#475569",
    border: "1px solid rgba(255,255,255,0.86)",
    fontSize: "12px",
    fontWeight: 950,
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
  },

  logoWrap: {
    position: "relative",
    width: "92px",
    height: "92px",
    marginBottom: "24px",
  },

  logoCircle: {
    position: "relative",
    zIndex: 2,
    width: "92px",
    height: "92px",
    borderRadius: "30px",
    display: "grid",
    placeItems: "center",
    fontSize: "40px",
    background:
      "linear-gradient(135deg, #6d5dfc 0%, #00bcd4 52%, #2dd4bf 100%)",
    boxShadow: "0 20px 44px rgba(0, 188, 212, 0.28)",
  },

  logoGlow: {
    position: "absolute",
    inset: "-12px",
    borderRadius: "38px",
    background:
      "linear-gradient(135deg, rgba(109,93,252,0.24), rgba(0,188,212,0.2), rgba(255,183,77,0.18))",
    filter: "blur(10px)",
  },

  eyebrow: {
    margin: "0 0 11px",
    color: "#6d5dfc",
    fontWeight: 950,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontSize: "12px",
  },

  heading: {
    margin: "0 0 14px",
    fontSize: "clamp(30px, 4vw, 46px)",
    lineHeight: 1.04,
    letterSpacing: "-0.045em",
    color: "#111827",
    fontWeight: 950,
  },

  subText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.72,
    fontSize: "15px",
    maxWidth: "570px",
  },

  featureGrid: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },

  featureTile: {
    border: "1px solid rgba(255,255,255,0.8)",
    borderRadius: "24px",
    padding: "16px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(236,254,255,0.62))",
    boxShadow: "0 16px 32px rgba(15, 23, 42, 0.08)",
    color: "#111827",
  },

  featureIcon: {
    display: "block",
    fontSize: "22px",
    marginBottom: "8px",
  },

  accountPanel: {
    position: "relative",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.72)",
    borderRadius: "34px",
    padding: "28px",
    background:
      "linear-gradient(150deg, rgba(255,255,255,0.92) 0%, rgba(238,246,255,0.94) 42%, rgba(245,243,255,0.92) 72%, rgba(236,254,255,0.9) 100%)",
    boxShadow: "0 28px 70px rgba(14, 165, 233, 0.16)",
    backdropFilter: "blur(20px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "18px",
  },

  panelGlow: {
    position: "absolute",
    top: "-90px",
    right: "-90px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background:
      "linear-gradient(135deg, rgba(109,93,252,0.18), rgba(0,188,212,0.16))",
    filter: "blur(10px)",
    pointerEvents: "none",
  },

  sectionHeader: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
  },

  stepChip: {
    flex: "0 0 auto",
    width: "46px",
    height: "46px",
    borderRadius: "17px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    color: "#ffffff",
    fontWeight: 950,
    boxShadow: "0 14px 28px rgba(109,93,252,0.24)",
  },

  sectionTitle: {
    margin: "0 0 7px",
    fontSize: "25px",
    color: "#111827",
    fontWeight: 950,
    letterSpacing: "-0.025em",
  },

  sectionSub: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
    fontSize: "14px",
  },

  formCard: {
    position: "relative",
    zIndex: 1,
    borderRadius: "28px",
    border: "1px solid rgba(255,255,255,0.9)",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.86), rgba(248,250,252,0.92), rgba(236,254,255,0.62))",
    padding: "20px",
    boxShadow: "0 18px 42px rgba(15,23,42,0.09)",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: 950,
    fontSize: "14px",
    color: "#111827",
  },

  select: {
    width: "100%",
    border: "1px solid rgba(148, 163, 184, 0.72)",
    borderRadius: "18px",
    padding: "14px",
    background: "rgba(255,255,255,0.94)",
    color: "#14213d",
    marginBottom: "16px",
    outline: "none",
    fontWeight: 850,
    boxShadow: "0 10px 20px rgba(15,23,42,0.04)",
  },

  phoneRow: {
    display: "flex",
    gap: "10px",
    alignItems: "stretch",
  },

  countryBadge: {
    minWidth: "104px",
    border: "1px solid rgba(148, 163, 184, 0.72)",
    borderRadius: "18px",
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(238,246,255,0.86))",
    color: "#111827",
    boxShadow: "0 10px 20px rgba(15,23,42,0.04)",
  },

  phoneInput: {
    width: "100%",
    border: "1px solid rgba(148, 163, 184, 0.72)",
    borderRadius: "18px",
    padding: "15px",
    background: "rgba(255,255,255,0.94)",
    color: "#14213d",
    outline: "none",
    fontSize: "16px",
    fontWeight: 850,
    boxShadow: "0 10px 20px rgba(15,23,42,0.04)",
  },

  hint: {
    marginTop: "10px",
    marginBottom: "16px",
    fontSize: "13px",
    color: "#64748b",
    lineHeight: 1.5,
  },

  otpInput: {
    width: "100%",
    border: "1px solid rgba(148, 163, 184, 0.72)",
    borderRadius: "20px",
    padding: "16px",
    background: "rgba(255,255,255,0.94)",
    color: "#111827",
    outline: "none",
    fontSize: "28px",
    letterSpacing: "12px",
    textAlign: "center",
    fontWeight: 950,
    boxShadow: "0 12px 24px rgba(15,23,42,0.06)",
  },

  otpDots: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "14px",
    marginBottom: "16px",
  },

  otpDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#cbd5e1",
  },

  otpDotFilled: {
    background: "#00bcd4",
    boxShadow: "0 0 18px rgba(0,188,212,0.45)",
  },

  errorBox: {
    padding: "12px 14px",
    borderRadius: "17px",
    background: "#fef2f2",
    border: "1px solid rgba(239, 68, 68, 0.26)",
    color: "#991b1b",
    marginBottom: "14px",
    lineHeight: 1.45,
    fontWeight: 750,
  },

  infoBox: {
    padding: "12px 14px",
    borderRadius: "17px",
    background: "#ecfeff",
    border: "1px solid rgba(0, 188, 212, 0.22)",
    color: "#155e75",
    marginBottom: "14px",
    lineHeight: 1.45,
    fontWeight: 750,
  },

  primaryButton: {
    width: "100%",
    border: "none",
    borderRadius: "999px",
    padding: "14px 22px",
    background:
      "linear-gradient(135deg, #6d5dfc 0%, #00bcd4 58%, #2dd4bf 100%)",
    color: "#ffffff",
    fontWeight: 950,
    boxShadow: "0 18px 38px rgba(0,188,212,0.25)",
  },

  actionRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "12px",
  },

  secondaryButton: {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "12px 14px",
    background: "rgba(255,255,255,0.92)",
    color: "#334155",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(15,23,42,0.05)",
  },

  infoStrip: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    borderRadius: "22px",
    padding: "15px",
    background:
      "linear-gradient(135deg, rgba(236,254,255,0.86), rgba(238,242,255,0.76))",
    border: "1px solid rgba(0, 188, 212, 0.16)",
    color: "#475569",
    lineHeight: 1.55,
    fontSize: "14px",
  },

  infoIcon: {
    flex: "0 0 auto",
  },

  backButton: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "13px 20px",
    background: "rgba(255,255,255,0.94)",
    color: "#334155",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(15,23,42,0.07)",
  },
};
