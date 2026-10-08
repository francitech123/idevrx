import crypto from 'node:crypto';
import { User } from '../models/User.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { DataExportRequest } from '../models/DataExportRequest.js';
import { AccountDeletionRequest } from '../models/AccountDeletionRequest.js';
import { hashPassword, verifyPassword } from './passwordService.js';

const RESET_TOKEN_TTL_MS = 1000 * 60 * 30;
const DELETION_GRACE_DAYS = 14;

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const AccountService = {
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      const err: any = new Error('User not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    const ok = await verifyPassword(user.passwordHash, currentPassword);
    if (!ok) {
      const err: any = new Error('Current password is incorrect');
      err.status = 401;
      err.code = 'AUTH_INVALID';
      throw err;
    }
    user.passwordHash = await hashPassword(newPassword);
    await user.save();
    return { changed: true };
  },

  async requestPasswordReset(email: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return { requested: true };

    const raw = crypto.randomBytes(32).toString('base64url');
    await PasswordResetToken.create({
      userId: user._id,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    return { requested: true, _token: raw };
  },

  async confirmPasswordReset(rawToken: string, newPassword: string) {
    const tokenHash = hashToken(rawToken);
    const record = await PasswordResetToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (!record) {
      const err: any = new Error('Invalid or expired reset token');
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    const user = await User.findById(record.userId).select('+passwordHash');
    if (!user) {
      const err: any = new Error('User not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    user.passwordHash = await hashPassword(newPassword);
    await user.save();
    record.usedAt = new Date();
    await record.save();
    return { reset: true };
  },

  async requestDataExport(userId: string) {
    const existing = await DataExportRequest.findOne({ userId, status: 'pending' });
    if (existing) {
      return { id: existing._id.toString(), status: existing.status };
    }
    const req = await DataExportRequest.create({ userId, status: 'pending' });
    return { id: req._id.toString(), status: req.status };
  },

  async getLatestExport(userId: string) {
    const req = await DataExportRequest.findOne({ userId }).sort({ createdAt: -1 });
    if (!req) return null;
    return {
      id: req._id.toString(),
      status: req.status,
      downloadUrl: req.downloadUrl || null,
      expiresAt: req.expiresAt?.toISOString() ?? null,
      completedAt: req.completedAt?.toISOString() ?? null,
      createdAt: req.createdAt.toISOString(),
    };
  },

  async requestAccountDeletion(userId: string, reason: string) {
    const scheduledFor = new Date(Date.now() + DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000);
    await AccountDeletionRequest.updateOne(
      { userId, status: 'pending' },
      { $set: { userId, status: 'pending', scheduledFor, reason } },
      { upsert: true }
    );
    return { scheduled: true, scheduledFor: scheduledFor.toISOString() };
  },

  async cancelAccountDeletion(userId: string) {
    await AccountDeletionRequest.updateOne(
      { userId, status: 'pending' },
      { $set: { status: 'cancelled' } }
    );
    return { cancelled: true };
  },

  async getAccountStatus(userId: string) {
    const deletion = await AccountDeletionRequest.findOne({ userId, status: 'pending' });
    return {
      deletionPending: !!deletion,
      scheduledFor: deletion?.scheduledFor?.toISOString() ?? null,
    };
  },
};
