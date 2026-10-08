import mongoose, { Schema } from 'mongoose';

const preferencesSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },

    notifications: {
      newUploads: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      replies: { type: Boolean, default: true },
      likes: { type: Boolean, default: false },
      follows: { type: Boolean, default: true },
      learning: { type: Boolean, default: true },
      emailDigest: { type: Boolean, default: false },
    },

    playback: {
      autoplay: { type: Boolean, default: true },
      captions: { type: Boolean, default: false },
      dataSaver: { type: Boolean, default: false },
      quality: { type: String, enum: ['Auto', '1080p', '720p', '480p', '360p'], default: 'Auto' },
      speed: { type: String, enum: ['0.5x', '1x', '1.25x', '1.5x', '2x'], default: '1x' },
    },

    privacy: {
      publicProfile: { type: Boolean, default: true },
      showLikes: { type: Boolean, default: false },
      showHistory: { type: Boolean, default: false },
      allowComments: { type: Boolean, default: true },
      personalisedRecommendations: { type: Boolean, default: true },
    },

    appearance: {
      theme: { type: String, enum: ['System', 'Light', 'Dark'], default: 'System' },
      language: { type: String, enum: ['English', 'French', 'Yoruba', 'Hausa', 'Igbo'], default: 'English' },
    },
  },
  { timestamps: true }
);

export const UserPreferences = mongoose.model('UserPreferences', preferencesSchema);
