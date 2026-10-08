import type { RequestHandler } from 'express';
import { User } from '../models/User.js';
import { UserPreferences } from '../models/UserPreferences.js';
import { ok } from '../utils/apiResponse.js';
import { AuthRequiredError, ValidationError, NotFoundError } from '../utils/errors.js';

function toPublicProfile(u: any) {
  return {
    id: u._id.toString(),
    username: u.username,
    displayName: u.displayName,
    bio: u.bio ?? '',
    avatarUrl: null,
    roles: u.roles,
    creatorStatus: u.creatorStatus,
    createdAt: u.createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export const getProfile: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    return ok(res, { profile: toPublicProfile(user) });
  } catch (err) { next(err); }
};

export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();

    const { displayName, bio } = req.body;
    if (displayName !== undefined) {
      if (typeof displayName !== 'string' || displayName.length < 1 || displayName.length > 64) {
        throw new ValidationError({ displayName: 'Must be 1-64 characters' });
      }
      user.displayName = displayName.trim();
    }
    if (bio !== undefined) {
      if (typeof bio !== 'string' || bio.length > 500) {
        throw new ValidationError({ bio: 'Must be 500 characters or fewer' });
      }
      user.bio = bio.trim();
    }
    await user.save();
    return ok(res, { profile: toPublicProfile(user) });
  } catch (err) { next(err); }
};

export const getPreferences: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    let prefs = await UserPreferences.findOne({ userId: user._id });
    if (!prefs) prefs = await UserPreferences.create({ userId: user._id });
    return ok(res, { preferences: prefs });
  } catch (err) { next(err); }
};

export const updatePreferences: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    let prefs = await UserPreferences.findOne({ userId: user._id });
    if (!prefs) prefs = await UserPreferences.create({ userId: user._id });

    const body = req.body ?? {};

    const setSection = (section: 'notifications' | 'playback' | 'privacy' | 'appearance', patch: any) => {
      if (!patch || typeof patch !== 'object') return;
      for (const [key, value] of Object.entries(patch)) {
        prefs!.set(`${section}.${key}`, value);
      }
    };

    setSection('notifications', body.notifications);
    setSection('playback', body.playback);
    setSection('privacy', body.privacy);
    setSection('appearance', body.appearance);

    await prefs.save();
    return ok(res, { preferences: prefs });
  } catch (err) { next(err); }
};

export const getPublicProfile: RequestHandler = async (req, res, next) => {
  try {
    const username = req.params.username as string;
    const user = await User.findOne({ username });
    if (!user) throw new NotFoundError();
    return ok(res, { profile: toPublicProfile(user) });
  } catch (err) { next(err); }
};
