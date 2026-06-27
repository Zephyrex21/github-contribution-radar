import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  githubIssueId: { type: Number, required: true, unique: true },
  repoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repo' },
  repoFullName: { type: String, index: true },
  title: String,
  bodyPreview: String, // first 300 chars of body
  labels: [String],
  state: { type: String, enum: ['open', 'closed'] },
  score: Number,
  scoreBand: { type: String, enum: ['Strong Match', 'Possible Match', 'Low Match'] },
  difficultyTag: { type: String, enum: ['Beginner', 'Moderate', 'Advanced'] },
  language: String,
  updatedAt: Date,
  url: String,
  cachedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Issue', issueSchema);
