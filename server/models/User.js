import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';

const preferencesSchema = new mongoose.Schema(
  {
    languages:            { type: [String], default: [] },
    frameworks:           { type: [String], default: [] },
    difficultyPreference: {
      type:    String,
      enum:    ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    interests: { type: [String], default: [] },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, select: false }, // bcrypt hash — never returned in API

  // Optional — user can add their GitHub username/PAT in Profile
  // so PR Verification still works without OAuth
  githubUsername: { type: String, trim: true, default: '' },
  githubToken:    { type: String, select: false, default: '' }, // personal access token

  avatarUrl:          String,
  bio:                String,
  preferences:        { type: preferencesSchema, default: () => ({}) },
  onboardingComplete: { type: Boolean, default: false },
  createdAt:          { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method — compare plain password against stored hash
userSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);
