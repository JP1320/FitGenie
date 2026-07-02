import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const RATING_CATEGORIES = [
  {
    key: "fit",
    title: "Fit Accuracy",
    subtitle: "How well did the outfit fit compared to the FitGenie recommendation?",
    icon: "📏",
    lowLabel: "Poor fit",
    highLabel: "Perfect fit",
  },
  {
    key: "service",
    title: "Service Quality",
    subtitle: "How was the tailor, designer, boutique, or stylist experience?",
    icon: "🧵",
    lowLabel: "Not good",
    highLabel: "Excellent",
  },
  {
    key: "delivery",
    title: "Delivery Experience",
    subtitle: "How smooth was the delivery, pickup, or consultation process?",
    icon: "📦",
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

function getSafeValue(value, fallback = "Not available") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return value;
}

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
    state.bookingId ||
    "FitGenie order"
  );
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

function StarRating({ value, onChange }) {
  return (
    <div style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((number) => {
        const active = number <= Number(value || 0);

        return (
          <motion.button
            key={number}
            type="button"
            whileHover={{ y: -3, scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(number)}
            style={{
              ...styles.starButton,
              ...(active ? styles.starButtonActive : {}),
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

  const averageRating = useMemo(
    () => getAverageRating(feedback),
    [feedback]
  );

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
          @keyframes feedbackFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @keyframes feedbackPulse {
            0% { opacity: 0.55; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
            100% { opacity: 0.55; transform: scale(0.96); }
          }

          @media (max-width: 1080px) {
            .feedback-header {
              grid-template-columns: 1fr !important;
            }

            .feedback-title {
              font-size: 36px !important;
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
                Rate the fit accuracy, expert service, and delivery experience.
                Your feedback helps improve future outfit matching and expert
                recommendations.
              </p>
            </div>

            <aside style={styles.previewCard}>
              <div style={styles.previewIcon}>
                {submitted ? "🎉" : "⭐"}
              </div>

              <div>
                <p style={styles.previewLabel}>Feedback completion</p>
                <h2 style={styles.previewScore}>{completionScore}%</h2>
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
                  ? "Thank you. Your feedback has been submitted successfully."
                  : completionScore < 75
                  ? "Rate all three categories to submit your feedback."
                  : "Almost ready. Add comments or submit your feedback."}
              </p>
            </aside>
          </section>

          <section className="feedback-layout" style={styles.layout}>
            <main style={styles.mainPanel}>
              <section style={styles.thankYouCard}>
                <div>
                  <p style={styles.thankYouLabel}>Delivery confirmed</p>
                  <h2 style={styles.thankYouTitle}>
                    {submitted ? "Thank you for your feedback!" : "Final step before completion"}
                  </h2>

                  <p style={styles.thankYouText}>
                    {submitted
                      ? "Your ratings are saved to the order and can be used to improve future expert matching."
                      : "Share how accurate the fit was and how smooth the expert service felt."}
                  </p>
                </div>

                <div style={styles.scoreBubble}>
                  <strong>{averageRating || "—"}</strong>
                  <span>{getExperienceLabel(averageRating)}</span>
                </div>
              </section>

              <section style={styles.ratingBlock}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>⭐</span>

                  <div>
                    <h2 style={styles.blockTitle}>Rate your experience</h2>
                    <p style={styles.blockText}>
                      These ratings are required before submitting feedback.
                    </p>
                  </div>
                </div>

                <div className="feedback-rating-grid" style={styles.ratingGrid}>
                  {RATING_CATEGORIES.map((category) => (
                    <motion.div
                      key={category.key}
                      whileHover={{ y: -5 }}
                      style={styles.ratingCard}
                    >
                      <div style={styles.ratingTop}>
                        <span style={styles.ratingIcon}>{category.icon}</span>

                        <div>
                          <h3 style={styles.ratingTitle}>{category.title}</h3>
                          <p style={styles.ratingSubtitle}>
                            {category.subtitle}
                          </p>
                        </div>
                      </div>

                      <StarRating
                        value={feedback[category.key]}
                        onChange={(value) => updateRating(category.key, value)}
                      />

                      <div style={styles.ratingLabels}>
                        <span>{category.lowLabel}</span>
                        <strong>
                          {feedback[category.key]
                            ? `${feedback[category.key]} / 5`
                            : "Not rated"}
                        </strong>
                        <span>{category.highLabel}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section style={styles.ratingBlock}>
                <div style={styles.blockHeader}>
                  <span style={styles.blockIcon}>🏷️</span>

                  <div>
                    <h2 style={styles.blockTitle}>
                      Quick feedback tags{" "}
                      <span style={styles.optionalText}>(optional)</span>
                    </h2>
                    <p style={styles.blockText}>
                      Select tags that describe your experience.
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

              <section style={styles.ratingBlock}>
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
                      placeholder="Example: The fit was accurate and the tailor delivered on time."
                      style={styles.textarea}
                    />
                  </div>

                  <div style={styles.inputBlock}>
                    <label style={styles.inputLabel}>Photo URL</label>

                    <input
                      value={photoUrl}
                      onChange={(event) => updatePhotoUrl(event.target.value)}
                      placeholder="Paste image URL for optional photo proof"
                      style={styles.input}
                    />

                    {photoUrl ? (
                      <div style={styles.photoPreview}>
                        <img
                          src={photoUrl}
                          alt="Feedback upload preview"
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
                <span style={styles.sideIcon}>🧞</span>

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

              <div style={styles.socialCard}>
                <span style={styles.socialBadge}>Social proof</span>

                <h3 style={styles.socialTitle}>Optional photo feedback</h3>

                <p style={styles.socialText}>
                  Later, this can support real upload, fit accuracy stories, and
                  customer reviews on expert profiles.
                </p>

                <div style={styles.socialPills}>
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
            <div style={styles.finalIcon}>
              {submitted ? "🎉" : "⭐"}
            </div>

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
              className="btn ghost"
              onClick={() => nav("/tracking")}
              style={styles.footerButton}
            >
              Back
            </button>

            <button
              type="button"
              className="btn"
              onClick={submitFeedback}
              style={styles.footerButton}
            >
              Submit Feedback
            </button>

            <button
              type="button"
              className="btn ghost"
              onClick={startNewJourney}
              style={styles.footerButton}
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
    background:
      "radial-gradient(circle at 12% 10%, rgba(124,92,255,0.28), transparent 30%), radial-gradient(circle at 88% 8%, rgba(0,212,255,0.22), transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  glowOne: {
    position: "absolute",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background: "rgba(124,92,255,0.18)",
    filter: "blur(72px)",
    top: "-120px",
    left: "-100px",
    pointerEvents: "none",
  },
  glowTwo: {
    position: "absolute",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background: "rgba(0,212,255,0.14)",
    filter: "blur(72px)",
    right: "-130px",
    bottom: "-140px",
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
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.84)",
    fontSize: "13px",
    fontWeight: 800,
    marginBottom: "16px",
  },
  stepDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#00d4ff",
    boxShadow: "0 0 18px rgba(0,212,255,0.9)",
    animation: "feedbackPulse 2s ease-in-out infinite",
  },
  title: {
    margin: 0,
    fontSize: "48px",
    lineHeight: 1.04,
    letterSpacing: "-1.5px",
  },
  subtitle: {
    maxWidth: "760px",
    margin: "14px 0 0",
    color: "rgba(255,255,255,0.74)",
    lineHeight: 1.65,
    fontSize: "16px",
  },
  previewCard: {
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "26px",
    padding: "20px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))",
    boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
  },
  previewIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "22px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.11)",
    border: "1px solid rgba(255,255,255,0.14)",
    fontSize: "31px",
    marginBottom: "15px",
    animation: "feedbackFloat 3.2s ease-in-out infinite",
  },
  previewLabel: {
    margin: "0 0 4px",
    color: "rgba(255,255,255,0.62)",
    fontWeight: 900,
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  previewScore: {
    margin: 0,
    fontSize: "36px",
    lineHeight: 1,
  },
  progressTrack: {
    height: "11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    overflow: "hidden",
    margin: "14px 0",
  },
  progressFill: {
    height: "100%",
    borderRadius: "inherit",
    background: "linear-gradient(90deg,#7c5cff,#00d4ff)",
  },
  previewText: {
    margin: 0,
    color: "rgba(255,255,255,0.70)",
    lineHeight: 1.5,
    fontSize: "14px",
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
  thankYouCard: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "30px",
    padding: "24px",
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.24), rgba(0,212,255,0.10))",
    boxShadow: "0 22px 52px rgba(0,0,0,0.20)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
  },
  thankYouLabel: {
    margin: "0 0 6px",
    color: "rgba(255,255,255,0.62)",
    fontWeight: 900,
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  thankYouTitle: {
    margin: 0,
    fontSize: "30px",
  },
  thankYouText: {
    margin: "8px 0 0",
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.5,
    maxWidth: "620px",
  },
  scoreBubble: {
    width: "132px",
    height: "132px",
    borderRadius: "34px",
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    padding: "15px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
  },
  ratingBlock: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "28px",
    padding: "22px",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
  },
  blockHeader: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "18px",
  },
  blockIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.90), rgba(0,212,255,0.78))",
    border: "1px solid rgba(255,255,255,0.18)",
    fontSize: "22px",
    flex: "0 0 auto",
  },
  blockTitle: {
    margin: "0 0 6px",
    fontSize: "25px",
  },
  blockText: {
    margin: 0,
    color: "rgba(255,255,255,0.68)",
    lineHeight: 1.55,
  },
  ratingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },
  ratingCard: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "24px",
    padding: "16px",
    background: "rgba(255,255,255,0.065)",
    boxShadow: "0 16px 36px rgba(0,0,0,0.18)",
  },
  ratingTop: {
    display: "flex",
    alignItems: "flex-start",
    gap: "13px",
    marginBottom: "14px",
  },
  ratingIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "17px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.13)",
    fontSize: "24px",
    flex: "0 0 auto",
  },
  ratingTitle: {
    margin: 0,
    fontSize: "19px",
  },
  ratingSubtitle: {
    margin: "6px 0 0",
    color: "rgba(255,255,255,0.68)",
    fontSize: "13px",
    lineHeight: 1.45,
  },
  starRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  starButton: {
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.13)",
    background: "rgba(255,255,255,0.07)",
    color: "rgba(255,255,255,0.34)",
    cursor: "pointer",
    fontSize: "23px",
  },
  starButtonActive: {
    background: "rgba(255,211,107,0.18)",
    borderColor: "rgba(255,211,107,0.45)",
    color: "#ffd36b",
    boxShadow: "0 10px 24px rgba(255,211,107,0.08)",
  },
  ratingLabels: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    color: "rgba(255,255,255,0.58)",
    fontSize: "12px",
  },
  optionalText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: "15px",
  },
  tagGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  tagButton: {
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "999px",
    padding: "11px 13px",
    background: "rgba(255,255,255,0.07)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: 900,
  },
  tagButtonSelected: {
    border: "1px solid rgba(0,212,255,0.85)",
    background: "rgba(0,212,255,0.12)",
    color: "#d9fbff",
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
    fontWeight: 900,
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    resize: "vertical",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "18px",
    padding: "14px",
    background: "rgba(255,255,255,0.08)",
    color: "inherit",
    outline: "none",
    lineHeight: 1.5,
    fontFamily: "inherit",
  },
  input: {
    width: "100%",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "18px",
    padding: "14px",
    background: "rgba(255,255,255,0.08)",
    color: "inherit",
    outline: "none",
    fontWeight: 800,
  },
  photoPreview: {
    height: "190px",
    overflow: "hidden",
    borderRadius: "22px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
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
    border: "1px dashed rgba(255,255,255,0.22)",
    background: "rgba(0,0,0,0.12)",
    color: "rgba(255,255,255,0.58)",
    textAlign: "center",
    padding: "16px",
  },
  sidePanel: {
    position: "sticky",
    top: "18px",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "28px",
    padding: "22px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))",
    boxShadow: "0 22px 52px rgba(0,0,0,0.20)",
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
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.90), rgba(0,212,255,0.78))",
    border: "1px solid rgba(255,255,255,0.18)",
    fontSize: "28px",
  },
  sideLabel: {
    margin: "0 0 4px",
    color: "rgba(255,255,255,0.60)",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  sideTitle: {
    margin: 0,
    fontSize: "22px",
  },
  summaryList: {
    display: "grid",
    gap: "10px",
  },
  summaryItem: {
    padding: "12px",
    borderRadius: "16px",
    background: "rgba(0,0,0,0.16)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: "4px",
  },
  socialCard: {
    marginTop: "14px",
    padding: "14px",
    borderRadius: "20px",
    background: "rgba(0,212,255,0.10)",
    border: "1px solid rgba(0,212,255,0.22)",
  },
  socialBadge: {
    display: "inline-flex",
    marginBottom: "8px",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.10)",
    color: "#d9fbff",
    fontSize: "11px",
    fontWeight: 900,
  },
  socialTitle: {
    margin: "0 0 8px",
    fontSize: "18px",
  },
  socialText: {
    margin: 0,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.5,
    fontSize: "13px",
  },
  socialPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
  },
  successBox: {
    marginTop: "14px",
    padding: "13px 15px",
    borderRadius: "16px",
    background: "rgba(0,212,255,0.10)",
    border: "1px solid rgba(0,212,255,0.25)",
    color: "#d9fbff",
    lineHeight: 1.45,
  },
  errorBox: {
    marginTop: "16px",
    padding: "13px 15px",
    borderRadius: "16px",
    background: "rgba(255, 86, 86, 0.16)",
    border: "1px solid rgba(255, 120, 120, 0.35)",
    color: "#ffdede",
  },
  finalSummary: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    marginTop: "18px",
    padding: "16px",
    borderRadius: "22px",
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  finalIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.9), rgba(0,212,255,0.8))",
    fontSize: "22px",
    flex: "0 0 auto",
  },
  finalLabel: {
    margin: "0 0 4px",
    color: "rgba(255,255,255,0.58)",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  finalText: {
    fontSize: "16px",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "22px",
    flexWrap: "wrap",
  },
  footerButton: {
    minWidth: "210px",
  },
};
