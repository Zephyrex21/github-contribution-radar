import mongoose from 'mongoose';

const repoSchema = new mongoose.Schema({
  githubRepoId: { type: Number, required: true, unique: true },
  name: String,
  fullName: { type: String, index: true },
  description: String,
  language: String,
  stars: Number,
  forks: Number,
  openIssuesCount: Number,
  updatedAt: Date,
  url: String,
  cachedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Repo', repoSchema);
