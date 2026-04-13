import mongoose, { Schema } from "mongoose";

const FitSubmissionSchema = new Schema({
  user: Object,
  intent: Object,
  profile: Object,
  body: Object,
  scan: Object,
  filters: Object,
  product: Object,
  service: Object,
  expert: Object,
  delivery: Object,
  fitCard: Object,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.FitSubmission || mongoose.model("FitSubmission", FitSubmissionSchema);
