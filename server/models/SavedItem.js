import mongoose from 'mongoose';

const savedItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  githubIssueUrl: String,  // denormalized
  issueTitle: String,      // denormalized
  repoFullName: String,    // denormalized
  difficultyTag: String,   // denormalized
  language: String,        // denormalized
  score: Number,           // denormalized
  status: {
    type: String,
    enum: ['Saved', 'Exploring', 'In Progress', 'PR Opened', 'Merged', 'Dropped'],
    default: 'Saved',
  },
  note: { type: String, default: '' },
  savedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Prevent duplicate saves by the same user
savedItemSchema.index({ userId: 1, issueId: 1 }, { unique: true });

export default mongoose.model('SavedItem', savedItemSchema);
