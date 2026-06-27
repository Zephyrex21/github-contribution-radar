import mongoose from 'mongoose';

const preferencesSchema = new mongoose.Schema(
  {
    languages: { type: [String], default: [] },
    frameworks: { type: [String], default: [] },
    difficultyPreference: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    interests: { type: [String], default: [] },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatarUrl: String,
  email: String,
  bio: String,
  githubAccessToken: { type: String, select: false }, // never returned in API
  preferences: { type: preferencesSchema, default: () => ({}) },
  onboardingComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
