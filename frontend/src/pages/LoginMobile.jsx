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

      setRequestId(res.data.requestId);
      setStep("otp");

      if (res.data.developmentOtp) {
        setInfo(
          `Demo OTP sent. Use ${res.data.developmentOtp}. Real SMS delivery needs SMS provider setup.`
        );
      } else {
        setInfo(`OTP has been sent to ${fullPhone}.`);
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
    <StepShell step="Auth" title="Continue with mobile number">
      <div style={styles.authLayout}>
        <section style={styles.mainCard}>
          <div style={styles.iconCircle}>📱</div>

          <h2 style={styles.title}>
            {step === "phone" ? "Enter your mobile number" : "Verify OTP"}
          </h2>

          <p style={styles.subtitle}>
            {step === "phone"
              ? "Choose your country code, add your mobile number, and we will send a one-time password."
              : `Enter the 6-digit OTP sent to ${fullPhone}. It will verify automatically once all digits are entered.`}
          </p>

          {step === "phone" ? (
            <>
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

              <div style={styles.hint}>
                Example: {selectedCountry.code}{" "}
                {selectedCountry.name === "India" ? "9876543210" : "5551234567"}
              </div>

              {error ? <div style={styles.errorBox}>{error}</div> : null}
              {info ? <div style={styles.infoBox}>{info}</div> : null}

              <button
                type="button"
                className="btn"
                onClick={sendOtp}
                disabled={loading || !isPhoneValid}
                style={{
                  ...styles.primaryButton,
                  ...(!isPhoneValid ? styles.disabledButton : {}),
                }}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
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
                      ...(otp[index] ? styles.otpDotFilled : {}),
                    }}
                  />
                ))}
              </div>

              {error ? <div style={styles.errorBox}>{error}</div> : null}
              {info ? <div style={styles.infoBox}>{info}</div> : null}

              <button
                type="button"
                className="btn"
                onClick={() => verifyOtp()}
                disabled={loading || otp.length !== 6}
                style={{
                  ...styles.primaryButton,
                  ...(otp.length !== 6 ? styles.disabledButton : {}),
                }}
              >
                {loading || autoVerifying ? "Verifying..." : "Verify & Continue"}
              </button>

              <div style={styles.actionRow}>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={editPhoneNumber}
                  style={styles.smallButton}
                >
                  Change number
                </button>

                <button
                  type="button"
                  className="btn ghost"
                  onClick={sendOtp}
                  disabled={loading}
                  style={styles.smallButton}
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            className="btn ghost"
            onClick={() => nav("/welcome")}
            style={styles.backButton}
          >
            Back
          </button>
        </section>

        <section style={styles.sideCard}>
          <h3 style={styles.sideTitle}>Secure sign-in</h3>

          <div style={styles.timeline}>
            <div style={styles.timelineItem}>
              <span style={styles.timelineNumber}>1</span>
              <div>
                <strong>Add number</strong>
                <p>Choose country code and enter your mobile number.</p>
              </div>
            </div>

            <div style={styles.timelineItem}>
              <span style={styles.timelineNumber}>2</span>
              <div>
                <strong>Receive OTP</strong>
                <p>We send a one-time password to your selected number.</p>
              </div>
            </div>

            <div style={styles.timelineItem}>
              <span style={styles.timelineNumber}>3</span>
              <div>
                <strong>Auto verify</strong>
                <p>Once the 6 digits are entered, FitGenie verifies and proceeds.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </StepShell>
  );
}

const styles = {
  authLayout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, 0.9fr)",
    gap: "20px",
  },
  mainCard: {
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "28px",
    padding: "28px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
    boxShadow: "0 18px 45px rgba(0,0,0,0.22)",
  },
  iconCircle: {
    width: "60px",
    height: "60px",
    borderRadius: "20px",
    display: "grid",
    placeItems: "center",
    fontSize: "28px",
    background: "rgba(0,212,255,0.16)",
    border: "1px solid rgba(0,212,255,0.35)",
    marginBottom: "18px",
  },
  title: {
    margin: "0 0 10px",
    fontSize: "30px",
    lineHeight: 1.1,
  },
  subtitle: {
    margin: "0 0 22px",
    opacity: 0.82,
    lineHeight: 1.6,
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: 800,
    fontSize: "14px",
  },
  select: {
    width: "100%",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "16px",
    padding: "14px",
    background: "rgba(255,255,255,0.1)",
    color: "inherit",
    marginBottom: "16px",
    outline: "none",
  },
  phoneRow: {
    display: "flex",
    gap: "10px",
    alignItems: "stretch",
  },
  countryBadge: {
    minWidth: "104px",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "16px",
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.08)",
  },
  phoneInput: {
    width: "100%",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "16px",
    padding: "15px",
    background: "rgba(255,255,255,0.1)",
    color: "inherit",
    outline: "none",
    fontSize: "16px",
  },
  hint: {
    marginTop: "8px",
    marginBottom: "16px",
    fontSize: "13px",
    opacity: 0.68,
  },
  otpInput: {
    width: "100%",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "18px",
    padding: "16px",
    background: "rgba(255,255,255,0.1)",
    color: "inherit",
    outline: "none",
    fontSize: "28px",
    letterSpacing: "12px",
    textAlign: "center",
    fontWeight: 900,
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
    background: "rgba(255,255,255,0.25)",
  },
  otpDotFilled: {
    background: "#00d4ff",
    boxShadow: "0 0 18px rgba(0,212,255,0.55)",
  },
  errorBox: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(255, 86, 86, 0.16)",
    border: "1px solid rgba(255, 120, 120, 0.35)",
    color: "#ffdede",
    marginBottom: "14px",
  },
  infoBox: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(0, 212, 255, 0.12)",
    border: "1px solid rgba(0, 212, 255, 0.32)",
    color: "#d9fbff",
    marginBottom: "14px",
  },
  primaryButton: {
    width: "100%",
    marginTop: "4px",
  },
  disabledButton: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
  actionRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "12px",
  },
  smallButton: {
    width: "100%",
  },
  backButton: {
    width: "100%",
    marginTop: "12px",
  },
  sideCard: {
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "28px",
    padding: "24px",
    background:
      "radial-gradient(circle at top right, rgba(124,92,255,0.24), transparent 36%), rgba(255,255,255,0.06)",
  },
  sideTitle: {
    margin: "0 0 20px",
    fontSize: "22px",
  },
  timeline: {
    display: "grid",
    gap: "18px",
  },
  timelineItem: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
  },
  timelineNumber: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    flex: "0 0 auto",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    fontWeight: 900,
  },
};
