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
        <div style={styles.blurOne} />
        <div style={styles.blurTwo} />
        <div style={styles.gridPattern} />

        <section style={styles.page}>
          <article style={styles.heroCard}>
            <div style={styles.badgeRow}>
              <span style={styles.badge}>FitGenie secure login</span>
              <span style={styles.badgeLight}>Mobile OTP</span>
            </div>

            <div>
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

            <div style={styles.founderBox}>
              <div style={styles.founderItem}>
                <span style={styles.founderLabel}>Founder</span>
                <strong style={styles.founderName}>JANVI PATEL</strong>
              </div>

              <div style={styles.founderDivider} />

              <div style={styles.founderItem}>
                <span style={styles.founderLabel}>Co-founder</span>
                <strong style={styles.founderName}>JAFAR KACHHI</strong>
              </div>
            </div>
          </article>

          <article style={styles.accountPanel}>
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
              <span style={styles.infoIcon}>✨</span>

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
    padding: "28px",
    borderRadius: "34px",
    background:
      "linear-gradient(135deg, #fff7ed 0%, #eef6ff 40%, #f5f3ff 72%, #ecfeff 100%)",
    color: "#14213d",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },

  blurOne: {
    position: "absolute",
    top: "-90px",
    left: "-80px",
    width: "260px",
    height: "260px",
    borderRadius: "999px",
    background: "rgba(109, 93, 252, 0.2)",
    filter: "blur(24px)",
    pointerEvents: "none",
  },

  blurTwo: {
    position: "absolute",
    right: "-90px",
    bottom: "-90px",
    width: "300px",
    height: "300px",
    borderRadius: "999px",
    background: "rgba(0, 188, 212, 0.18)",
    filter: "blur(28px)",
    pointerEvents: "none",
  },

  gridPattern: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)",
    backgroundSize: "34px 34px",
    maskImage:
      "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.08))",
    pointerEvents: "none",
  },

  page: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
    alignItems: "stretch",
  },

  heroCard: {
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "30px",
    padding: "28px",
    background: "rgba(255,255,255,0.76)",
    boxShadow: "0 24px 58px rgba(15, 23, 42, 0.12)",
    backdropFilter: "blur(18px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "28px",
    minHeight: "460px",
  },

  badgeRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "8px 12px",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.04em",
  },

  badgeLight: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "8px 12px",
    background: "#ffffff",
    color: "#475569",
    border: "1px solid #dbeafe",
    fontSize: "12px",
    fontWeight: 900,
  },

  logoWrap: {
    position: "relative",
    width: "84px",
    height: "84px",
    marginBottom: "22px",
  },

  logoCircle: {
    position: "relative",
    zIndex: 2,
    width: "84px",
    height: "84px",
    borderRadius: "28px",
    display: "grid",
    placeItems: "center",
    fontSize: "36px",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    boxShadow: "0 18px 38px rgba(109, 93, 252, 0.28)",
  },

  logoGlow: {
    position: "absolute",
    inset: "-10px",
    borderRadius: "34px",
    background:
      "linear-gradient(135deg, rgba(109,93,252,0.18), rgba(0,188,212,0.16), rgba(251,188,5,0.1))",
    filter: "blur(8px)",
  },

  eyebrow: {
    margin: "0 0 10px",
    color: "#6d5dfc",
    fontWeight: 950,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontSize: "12px",
  },

  heading: {
    margin: "0 0 12px",
    fontSize: "clamp(28px, 4vw, 42px)",
    lineHeight: 1.06,
    letterSpacing: "-0.04em",
    color: "#111827",
    fontWeight: 950,
  },

  subText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.7,
    fontSize: "15px",
    maxWidth: "560px",
  },

  founderBox: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    gap: "16px",
    alignItems: "center",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "24px",
    padding: "18px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.86), rgba(238,246,255,0.72))",
    color: "#111827",
  },

  founderItem: {
    minWidth: 0,
  },

  founderLabel: {
    display: "block",
    marginBottom: "5px",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 950,
    textTransform: "uppercase",
    letterSpacing: "0.09em",
  },

  founderName: {
    display: "block",
    color: "#111827",
    fontSize: "15px",
    letterSpacing: "0.02em",
  },

  founderDivider: {
    width: "1px",
    height: "46px",
    background: "#cbd5e1",
  },

  accountPanel: {
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "30px",
    padding: "26px",
    background: "rgba(255,255,255,0.78)",
    boxShadow: "0 24px 58px rgba(15, 23, 42, 0.12)",
    backdropFilter: "blur(18px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "18px",
  },

  sectionHeader: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
  },

  stepChip: {
    flex: "0 0 auto",
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    color: "#ffffff",
    fontWeight: 950,
    boxShadow: "0 14px 28px rgba(109,93,252,0.22)",
  },

  sectionTitle: {
    margin: "0 0 7px",
    fontSize: "24px",
    color: "#111827",
    fontWeight: 950,
    letterSpacing: "-0.02em",
  },

  sectionSub: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.58,
    fontSize: "14px",
  },

  formCard: {
    borderRadius: "26px",
    border: "1px solid rgba(203, 213, 225, 0.9)",
    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
    padding: "18px",
    boxShadow: "0 14px 34px rgba(15,23,42,0.08)",
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
    border: "1px solid #cbd5e1",
    borderRadius: "16px",
    padding: "14px",
    background: "#ffffff",
    color: "#14213d",
    marginBottom: "16px",
    outline: "none",
    fontWeight: 800,
  },

  phoneRow: {
    display: "flex",
    gap: "10px",
    alignItems: "stretch",
  },

  countryBadge: {
    minWidth: "104px",
    border: "1px solid #cbd5e1",
    borderRadius: "16px",
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#ffffff",
    color: "#111827",
  },

  phoneInput: {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: "16px",
    padding: "15px",
    background: "#ffffff",
    color: "#14213d",
    outline: "none",
    fontSize: "16px",
    fontWeight: 800,
  },

  hint: {
    marginTop: "9px",
    marginBottom: "16px",
    fontSize: "13px",
    color: "#64748b",
    lineHeight: 1.5,
  },

  otpInput: {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: "18px",
    padding: "16px",
    background: "#ffffff",
    color: "#111827",
    outline: "none",
    fontSize: "28px",
    letterSpacing: "12px",
    textAlign: "center",
    fontWeight: 950,
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
    borderRadius: "16px",
    background: "#fef2f2",
    border: "1px solid rgba(239, 68, 68, 0.26)",
    color: "#991b1b",
    marginBottom: "14px",
    lineHeight: 1.45,
    fontWeight: 700,
  },

  infoBox: {
    padding: "12px 14px",
    borderRadius: "16px",
    background: "#ecfeff",
    border: "1px solid rgba(0, 188, 212, 0.22)",
    color: "#155e75",
    marginBottom: "14px",
    lineHeight: 1.45,
    fontWeight: 700,
  },

  primaryButton: {
    width: "100%",
    border: "none",
    borderRadius: "999px",
    padding: "13px 22px",
    background: "linear-gradient(135deg, #6d5dfc, #00bcd4)",
    color: "#ffffff",
    fontWeight: 950,
    boxShadow: "0 16px 34px rgba(0,188,212,0.24)",
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
    background: "#ffffff",
    color: "#334155",
    fontWeight: 950,
    cursor: "pointer",
  },

  infoStrip: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    borderRadius: "20px",
    padding: "14px",
    background: "rgba(236, 254, 255, 0.8)",
    border: "1px solid rgba(0, 188, 212, 0.16)",
    color: "#475569",
    lineHeight: 1.55,
    fontSize: "14px",
  },

  infoIcon: {
    flex: "0 0 auto",
  },

  backButton: {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "13px 20px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(15,23,42,0.07)",
  },
};
