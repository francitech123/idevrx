import crypto from 'node:crypto';
import type { PublicUser, Role } from '@idevrx/types';
import { User, type UserDoc } from '../models/User.js';
import { Session } from '../models/Session.js';
import { hashPassword, verifyPassword } from './passwordService.js';
import { ConflictError, AuthInvalidError, ForbiddenError } from '../utils/errors.js';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function toPublicUser(u: UserDoc): PublicUser {
  return {
    id: u._id.toString(),
    email: u.email,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: null,
    bio: u.bio ?? '',
    roles: u.roles as Role[],
    accountStatus: u.accountStatus,
    creatorStatus: u.creatorStatus,
    createdAt: (u as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const AuthService = {
  async register(input: {
    email: string;
    username: string;
    displayName: string;
    password: string;
  }): Promise<{ user: PublicUser; sessionToken: string }> {
    const existing = await User.findOne({
      $or: [{ email: input.email.toLowerCase() }, { username: input.username }],
    });
    if (existing) {
      const field = existing.email === input.email.toLowerCase() ? 'email' : 'username';
      throw new ConflictError(`That ${field} is already registered.`);
    }

    const passwordHash = await hashPassword(input.password);

    // Registered users get 'user' role ONLY. Never auto-grant creator.
    const user = await User.create({
      email: input.email.toLowerCase(),
      username: input.username,
      displayName: input.displayName,
      passwordHash,
      roles: ['user'],
      accountStatus: 'active',
      creatorStatus: 'none',
    });

    const sessionToken = await AuthService.createSession(user, '', '');
    return { user: toPublicUser(user), sessionToken };
  },

  async login(
    email: string,
    password: string
  ): Promise<{ user: PublicUser; sessionToken: string }> {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) throw new AuthInvalidError();

    const ok = await verifyPassword(user.passwordHash, password);
    if (!ok) throw new AuthInvalidError();

    if (user.accountStatus === 'suspended' || user.accountStatus === 'deleted') {
      throw new ForbiddenError();
    }

    user.lastLoginAt = new Date();
    await user.save();

    const sessionToken = await AuthService.createSession(user, '', '');
    return { user: toPublicUser(user), sessionToken };
  },

  async createSession(user: UserDoc, ip: string, userAgent: string): Promise<string> {
    const raw = crypto.randomBytes(32).toString('base64url');
    await Session.create({
      userId: user._id,
      tokenHash: hashToken(raw),
      ipAddress: ip,
      userAgent,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    });
    return raw;
  },

  async validateSession(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    const session = await Session.findOne({
      tokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (!session) return null;

    const user = await User.findById(session.userId);
    if (!user || user.accountStatus !== 'active') return null;

    return { session, user };
  },

  async revokeSession(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    await Session.updateOne({ tokenHash, revokedAt: null }, { revokedAt: new Date() });
  },

  async revokeAllSessionsForUser(userId: string) {
    await Session.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() });
  },

  toPublicUser,
};
