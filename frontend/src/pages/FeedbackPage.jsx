import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const RATING_CATEGORIES = [
  {
    key: "fit",
    title: "Fit Accuracy",
    subtitle: "How accurate was the recommended size and final outfit fit?",
    icon: "📏",
    gradient: "linear-gradient(135deg, #dbeafe, #ede9fe, #fce7f3)",
    accent: "#6d5dfc",
    lowLabel: "Poor fit",
    highLabel: "Perfect fit",
  },
  {
    key: "service",
    title: "Service Quality",
    subtitle: "How was the tailor, designer, boutique, or stylist experience?",
    icon: "🧵",
    gradient: "linear-gradient(135deg, #fce7f3, #ffe4e6, #fed7aa)",
    accent: "#db2777",
    lowLabel: "Not good",
    highLabel: "Excellent",
  },
  {
    key: "delivery",
    title: "Delivery Experience",
    subtitle: "How smooth was delivery, pickup, or consultation scheduling?",
    icon: "📦",
    gradient: "linear-gradient(135deg, #dcfce7, #cffafe, #e0e7ff)",
    accent: "#059669",
    lowLabel: "Delayed",
    highLabel: "Smooth",
  },
];

const FEEDBACK_TAGS = [
  "Perfect fit",
  "Good stitching",
  "Fast delivery",
  "Helpful expert",
  "Good fabric suggestion",
  "Easy consultation",
  "Needs better sizing",
  "Delivery was late",
  "Communication issue",
];

function getSelectedOutfit(state) {
  return state.recommendations?.selectedOutfit || state.selectedOutfit || null;
}

function getSelectedExpert(state) {
  return state.selectedExpert || state.marketplace?.selectedExpert || null;
}

function getOrderId(state) {
  return (
    state.order?.bookingId ||
    state.order?.orderId ||
    state.fitCard?.fitCardId ||
    "ORD-PREVIEW"
  );
}

function getSafeValue(value, fallback = "Not available") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return value;
}

function getAverageRating(feedback) {
  const values = [
    Number(feedback?.fit || 0),
    Number(feedback?.service || 0),
    Number(feedback?.delivery || 0),
  ].filter((value) => value > 0);

  if (values.length === 0) return 0;

  const total = values.reduce((sum, value) => sum + value, 0);
  return Number((total / values.length).toFixed(1));
}

function getExperienceLabel(score) {
  if (score >= 4.5) return "Excellent experience";
  if (score >= 4) return "Very good experience";
  if (score >= 3) return "Good, but can improve";
  if (score > 0) return "Needs improvement";
  return "Waiting for rating";
}

function StarRating({ value, accent, onChange }) {
  return (
    <div style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((number) => {
        const active = number <= Number(value || 0);

        return (
          <motion.button
            key={number}
            type="button"
            whileHover={{ y: -3, scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(number)}
            style={{
              ...styles.starButton,
              ...(active
                ? {
                    color: "#ffffff",
                    background: accent,
                    borderColor: accent,
                    boxShadow: `0 12px 24px ${accent}30`,
                  }
                : {}),
            }}
            aria-label={`Rate ${number} star${number === 1 ? "" : "s"}`}
          >
            ★
          </motion.button>
        );
      })}
    </div>
  );
}

export default function FeedbackPage() {
  const nav = useNavigate();
  const state = useFlowStore();
  const { feedback = {}, patch, reset } = state;

  const selectedOutfit = getSelectedOutfit(state);
  const selectedExpert = getSelectedExpert(state);
  const orderId = getOrderId(state);

  const [comment, setComment] = useState(feedback.comment || "");
  const [photoUrl, setPhotoUrl] = useState(feedback.photoUrl || "");
  const [selectedTags, setSelectedTags] = useState(feedback.tags || []);
  const [submitted, setSubmitted] = useState(Boolean(feedback.submittedAt));
  const [error, setError] = useState("");

  const averageRating = useMemo(() => getAverageRating(feedback), [feedback]);

  const completionScore = useMemo(() => {
    let score = 0;

    if (feedback.fit) score += 25;
    if (feedback.service) score += 25;
    if (feedback.delivery) score += 25;
    if (comment.trim() || selectedTags.length > 0 || photoUrl.trim()) score += 25;

    return score;
  }, [feedback, comment, selectedTags, photoUrl]);

  function updateRating(key, value) {
    setError("");
    setSubmitted(false);

    patch({
      feedback: {
        ...feedback,
        [key]: value,
      },
    });
  }

  function toggleTag(tag) {
    setError("");
    setSubmitted(false);

    const nextTags = selectedTags.includes(tag)
      ? selectedTags.filter((item) => item !== tag)
      : [...selectedTags, tag];

    setSelectedTags(nextTags);

    patch({
      feedback: {
        ...feedback,
        tags: nextTags,
      },
    });
  }

  function updateComment(value) {
    setComment(value);
    setSubmitted(false);

    patch({
      feedback: {
        ...feedback,
        comment: value,
      },
    });
  }

  function updatePhotoUrl(value) {
    setPhotoUrl(value);
    setSubmitted(false);

    patch({
      feedback: {
        ...feedback,
        photoUrl: value,
      },
    });
  }

  function submitFeedback() {
    if (!feedback.fit || !feedback.service || !feedback.delivery) {
      setError("Please rate fit accuracy, service quality, and delivery experience.");
      return;
    }

    const submittedFeedback = {
      ...feedback,
      fit: feedback.fit,
      service: feedback.service,
      delivery: feedback.delivery,
      comment: comment.trim(),
      photoUrl: photoUrl.trim(),
      tags: selectedTags,
      averageRating: getAverageRating(feedback),
      submittedAt: new Date().toISOString(),
      orderId,
      expertName: selectedExpert?.name || "",
      outfitName: selectedOutfit?.title || selectedOutfit?.name || "",
    };

    patch({
      feedback: submittedFeedback,
      order: {
        ...(state.order || {}),
        feedbackSubmitted: true,
        feedbackRating: submittedFeedback.averageRating,
        completedAt: new Date().toISOString(),
      },
    });

    setSubmitted(true);
    setError("");
  }

  function startNewJourney() {
    reset();
    nav("/welcome");
  }

  return (
    <PageShell>
      <style>
        {`
          @keyframes feedbackSoftFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes feedbackSoftPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 1080px) {
            .feedback-header {
              grid-template-columns: 1fr !important;
            }

            .feedback-title {
              font-size: 38px !important;
            }

            .feedback-layout {
              grid-template-columns: 1fr !important;
            }

            .feedback-rating-grid {
              grid-template-columns: 1fr !important;
            }

            .feedback-footer {
              flex-direction: column !important;
            }

            .feedback-footer button {
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
          <section className="feedback-header" style={styles.header}>
            <div>
              <div style={styles.stepPill}>
                <span style={styles.stepDot} />
                Step 12 of 12 · Delivery + Feedback
              </div>

              <h1 className="feedback-title" style={styles.title}>
                How was your FitGenie experience?
              </h1>

              <p style={styles.subtitle}>
                Rate fit accuracy, service quality, and delivery experience.
                Your feedback helps improve outfit matching, expert selection,
                size confidence, and future FitGenie recommendations.
              </p>
            </div>

            <aside style={styles.previewCard}>
              <div style={styles.previewTop}>
                <span style={styles.previewIcon}>{submitted ? "🎉" : "⭐"}</span>

                <div>
                  <p style={styles.previewLabel}>Feedback completion</p>
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
                {submitted
                  ? "Thank you. Your feedback has been saved successfully."
                  : completionScore < 75
                  ? "Rate all three categories to submit your feedback."
                  : "Almost ready. Add optional details or submit feedback."}
              </p>

              <div style={styles.previewTags}>
                <span style={styles.previewTag}>
                  {averageRating ? `${averageRating} / 5` : "Rating pending"}
                </span>
                <span style={styles.previewTag}>
                  {submitted ? "Submitted" : "Pending"}
                </span>
              </div>
            </aside>
          </section>

          <section className="feedback-layout" style={styles.layout}>
            <main style={styles.mainPanel}>
              <section style={styles.heroCard}>
                <div>
                  <p style={styles.heroLabel}>Delivery confirmed</p>
                  <h2 style={styles.heroTitle}>
                    {submitted ? "Feedback submitted successfully" : "Final step before completion"}
                  </h2>
                  <p style={styles.heroText}>
                    {submitted
                      ? "Your rating is now connected to this order and expert experience."
                      : "Share how accurate the fit was and how smooth the expert service felt."}
                  </p>
                </div>

                <div style={styles.scoreBubble}>
                  <strong>{averageRating || "—"}</strong>
                  <span>{getExperienceLabel(averageRating)}</span>
                </div>
              </section>

              <section style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>⭐</span>

                  <div>
                    <h2 style={styles.blockTitle}>Rate your experience</h2>
                    <p style={styles.blockText}>
                      These three ratings are required before submitting feedback.
                    </p>
                  </div>
                </div>

                <div className="feedback-rating-grid" style={styles.ratingGrid}>
                  {RATING_CATEGORIES.map((category) => (
                    <motion.div
                      key={category.key}
                      whileHover={{ y: -6, scale: 1.01 }}
                      style={styles.ratingCard}
                    >
                      <div
                        style={{
                          ...styles.ratingVisual,
                          background: category.gradient,
                        }}
                      >
                        <span style={styles.ratingIcon}>{category.icon}</span>

                        <span
                          style={{
                            ...styles.ratingBadge,
                            color: category.accent,
                          }}
                        >
                          {feedback[category.key]
                            ? `${feedback[category.key]} / 5`
                            : "Rate"}
                        </span>
                      </div>

                      <div style={styles.ratingBody}>
                        <h3 style={styles.ratingTitle}>{category.title}</h3>
                        <p style={styles.ratingText}>{category.subtitle}</p>

                        <StarRating
                          value={feedback[category.key]}
                          accent={category.accent}
                          onChange={(value) => updateRating(category.key, value)}
                        />

                        <div style={styles.ratingLabels}>
                          <span>{category.lowLabel}</span>
                          <strong>
                            {feedback[category.key]
                              ? `${feedback[category.key]} stars`
                              : "Not rated"}
                          </strong>
                          <span>{category.highLabel}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>🏷️</span>

                  <div>
                    <h2 style={styles.blockTitle}>
                      Quick feedback tags{" "}
                      <span style={styles.optionalText}>(optional)</span>
                    </h2>
                    <p style={styles.blockText}>
                      Select tags that best describe your experience.
                    </p>
                  </div>
                </div>

                <div style={styles.tagGrid}>
                  {FEEDBACK_TAGS.map((tag) => {
                    const selected = selectedTags.includes(tag);

                    return (
                      <motion.button
                        key={tag}
                        type="button"
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleTag(tag)}
                        style={{
                          ...styles.tagButton,
                          ...(selected ? styles.tagButtonSelected : {}),
                        }}
                      >
                        {selected ? "✓ " : ""}
                        {tag}
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              <section style={styles.block}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>📝</span>

                  <div>
                    <h2 style={styles.blockTitle}>
                      Add review details{" "}
                      <span style={styles.optionalText}>(optional)</span>
                    </h2>
                    <p style={styles.blockText}>
                      Add a short review or photo URL for social proof.
                    </p>
                  </div>
                </div>

                <div style={styles.inputGrid}>
                  <div style={styles.inputBlock}>
                    <label style={styles.inputLabel}>Review comment</label>

                    <textarea
                      value={comment}
                      onChange={(event) => updateComment(event.target.value)}
                      placeholder="Example: The fit was accurate, the expert was helpful, and delivery was smooth."
                      style={styles.textarea}
                    />
                  </div>

                  <div style={styles.inputBlock}>
                    <label style={styles.inputLabel}>Photo URL</label>

                    <input
                      value={photoUrl}
                      onChange={(event) => updatePhotoUrl(event.target.value)}
                      placeholder="Paste image URL for optional outfit photo"
                      style={styles.input}
                    />

                    {photoUrl ? (
                      <div style={styles.photoPreview}>
                        <img
                          src={photoUrl}
                          alt="Feedback preview"
                          style={styles.photoImage}
                        />
                      </div>
                    ) : (
                      <div style={styles.photoPlaceholder}>
                        📸 Optional photo preview will appear here
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </main>

            <aside style={styles.sidePanel}>
              <div style={styles.sideTop}>
                <span style={styles.sideIcon}>{submitted ? "🎉" : "🧞"}</span>

                <div>
                  <p style={styles.sideLabel}>Feedback summary</p>
                  <h2 style={styles.sideTitle}>
                    {submitted ? "Submitted" : "Pending"}
                  </h2>
                </div>
              </div>

              <div style={styles.summaryList}>
                <div style={styles.summaryItem}>
                  <span>Order</span>
                  <strong>{orderId}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Outfit</span>
                  <strong>
                    {getSafeValue(
                      selectedOutfit?.title || selectedOutfit?.name,
                      "Selected outfit"
                    )}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Expert</span>
                  <strong>{getSafeValue(selectedExpert?.name)}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Fit Accuracy</span>
                  <strong>{feedback.fit ? `${feedback.fit} / 5` : "Required"}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Service</span>
                  <strong>
                    {feedback.service ? `${feedback.service} / 5` : "Required"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Delivery</span>
                  <strong>
                    {feedback.delivery ? `${feedback.delivery} / 5` : "Required"}
                  </strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Average Rating</span>
                  <strong>
                    {averageRating ? `${averageRating} / 5` : "Not calculated"}
                  </strong>
                </div>
              </div>

              <div style={styles.nextCard}>
                <span style={styles.nextBadge}>Social proof</span>

                <h3 style={styles.nextTitle}>Optional photo feedback</h3>

                <p style={styles.nextText}>
                  Later, this can support real uploads, customer fit stories,
                  and expert profile reviews.
                </p>

                <div style={styles.nextPills}>
                  <span>📸 Photo</span>
                  <span>⭐ Rating</span>
                  <span>💬 Review</span>
                </div>
              </div>

              {submitted ? (
                <div style={styles.successBox}>
                  Feedback submitted successfully. You can now start a new
                  FitGenie journey.
                </div>
              ) : null}
            </aside>
          </section>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <section style={styles.finalSummary}>
            <div style={styles.finalIcon}>{submitted ? "🎉" : "⭐"}</div>

            <div>
              <p style={styles.finalLabel}>Final feedback status</p>
              <strong style={styles.finalText}>
                {submitted
                  ? `${getExperienceLabel(averageRating)} · ${averageRating} / 5`
                  : averageRating
                  ? `${getExperienceLabel(averageRating)} · ready to submit`
                  : "No feedback submitted yet"}
              </strong>
            </div>
          </section>

          <div className="feedback-footer" style={styles.footer}>
            <button
              type="button"
              onClick={() => nav("/tracking")}
              style={styles.backButton}
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={submitFeedback}
              style={styles.nextButton}
            >
              Submit Feedback
            </button>

            <button
              type="button"
              onClick={startNewJourney}
              style={styles.secondaryButton}
            >
              Start New Journey
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
    animation: "feedbackSoftPulse 2s ease-in-out infinite",
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
    animation: "feedbackSoftFloat 3.2s ease-in-out infinite",
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
    maxWidth: "680px",
    margin: "8px 0 0",
    color: "#475569",
    fontWeight: 700,
    lineHeight: 1.6,
  },
  scoreBubble: {
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
  block: {
    border: "1px solid rgba(109, 93, 252, 0.14)",
    borderRadius: "30px",
    padding: "22px",
    background: "rgba(255,255,255,0.76)",
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.09)",
  },
  blockHeader: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "18px",
  },
  blockIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "17px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #ede9fe, #cffafe)",
    border: "1px solid rgba(109, 93, 252, 0.14)",
    fontSize: "22px",
    flex: "0 0 auto",
  },
  blockTitle: {
    margin: "0 0 6px",
    color: "#111827",
    fontSize: "25px",
  },
  blockText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
    fontWeight: 600,
  },
  ratingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },
  ratingCard: {
    overflow: "hidden",
    border: "2px solid rgba(148, 163, 184, 0.22)",
    borderRadius: "26px",
    background: "rgba(255,255,255,0.86)",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.07)",
    color: "#111827",
  },
  ratingVisual: {
    height: "102px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px",
  },
  ratingIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "23px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.68)",
    border: "1px solid rgba(255,255,255,0.72)",
    fontSize: "33px",
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.08)",
  },
  ratingBadge: {
    padding: "8px 11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(255,255,255,0.72)",
    fontSize: "12px",
    fontWeight: 900,
  },
  ratingBody: {
    padding: "16px",
  },
  ratingTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "20px",
  },
  ratingText: {
    minHeight: "58px",
    margin: "8px 0 12px",
    color: "#475569",
    lineHeight: 1.5,
    fontSize: "14px",
    fontWeight: 600,
  },
  starRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  starButton: {
    width: "43px",
    height: "43px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#cbd5e1",
    cursor: "pointer",
    fontSize: "22px",
    fontWeight: 900,
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.05)",
  },
  ratingLabels: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 800,
  },
  optionalText: {
    color: "#64748b",
    fontSize: "14px",
  },
  tagGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  tagButton: {
    border: "1px solid #e2e8f0",
    borderRadius: "999px",
    padding: "11px 13px",
    background: "#ffffff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: 900,
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.05)",
  },
  tagButtonSelected: {
    border: "1px solid rgba(109, 93, 252, 0.58)",
    background: "#f5f3ff",
    color: "#4f46e5",
    boxShadow: "0 14px 30px rgba(109, 93, 252, 0.12)",
  },
  inputGrid: {
    display: "grid",
    gap: "16px",
  },
  inputBlock: {
    display: "grid",
    gap: "8px",
  },
  inputLabel: {
    color: "#111827",
    fontWeight: 900,
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    resize: "vertical",
    border: "1px solid #dbe4ee",
    borderRadius: "18px",
    padding: "14px",
    background: "#ffffff",
    color: "#111827",
    outline: "none",
    lineHeight: 1.5,
    fontFamily: "inherit",
    fontWeight: 700,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  input: {
    width: "100%",
    border: "1px solid #dbe4ee",
    borderRadius: "18px",
    padding: "14px",
    background: "#ffffff",
    color: "#111827",
    outline: "none",
    fontWeight: 800,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  photoPreview: {
    height: "190px",
    overflow: "hidden",
    borderRadius: "22px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  photoPlaceholder: {
    minHeight: "120px",
    display: "grid",
    placeItems: "center",
    borderRadius: "22px",
    border: "1px dashed #cbd5e1",
    background: "#f8fafc",
    color: "#64748b",
    textAlign: "center",
    padding: "16px",
    fontWeight: 800,
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
    flexWrap: "wrap",
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
  secondaryButton: {
    minWidth: "220px",
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
    minWidth: "220px",
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
