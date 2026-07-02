import mongoose from 'mongoose';

// Subdocument for verified PR data — stored directly on the SavedItem
// so we never need a separate collection or extra query to show PR status.
const verifiedPRSchema = new mongoose.Schema(
  {
    url:        { type: String },
    title:      { type: String },
    number:     { type: Number },
    // 'open' = PR exists but not merged yet
    // 'merged' = PR was accepted and merged
    // 'closed' = PR was closed without merging
    state:      { type: String, enum: ['open', 'merged', 'closed'] },
    verifiedAt: { type: Date },
  },
  { _id: false }
);

const savedItemSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  githubIssueUrl: String,   // denormalized for fast lookup
  issueTitle:     String,   // denormalized
  repoFullName:   String,   // denormalized
  difficultyTag:  String,   // denormalized
  language:       String,   // denormalized
  score:          Number,   // denormalized

  status: {
    type:    String,
    enum:    ['Saved', 'Exploring', 'In Progress', 'PR Opened', 'Merged', 'Dropped'],
    default: 'Saved',
  },

  note: { type: String, default: '' },

  // PR Verification — null until the user clicks "Verify PR"
  verifiedPR: { type: verifiedPRSchema, default: null },

  savedAt:   { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-update updatedAt on every .save() call
savedItemSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Prevent duplicate saves by the same user
savedItemSchema.index({ userId: 1, issueId: 1 }, { unique: true });

export default mongoose.model('SavedItem', savedItemSchema);
