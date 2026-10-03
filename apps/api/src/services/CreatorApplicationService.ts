import { CreatorApplication, type ApplicationStatus } from '../models/CreatorApplication.js';
import { User } from '../models/User.js';
import { AuditService } from './AuditService.js';
import { ConflictError, ForbiddenError, NotFoundError, AppError } from '../utils/errors.js';

const COOLDOWN_DAYS = 7;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

interface ApplyInput {
  userId: string;
  motivation: string;
  experience?: string;
  portfolioUrl?: string;
}

interface ReviewInput {
  applicationId: string;
  reviewerId: string;
  reviewerRoles: string[];
  decision: 'approved' | 'denied';
  note?: string;
}

function toPublic(a: any) {
  return {
    id: a._id.toString(),
    userId: a.userId.toString(),
    motivation: a.motivation,
    experience: a.experience,
    portfolioUrl: a.portfolioUrl,
    status: a.status,
    reviewedBy: a.reviewedBy?.toString() ?? null,
    reviewedAt: a.reviewedAt?.toISOString() ?? null,
    reviewNote: a.reviewNote,
    submittedAt: a.submittedAt.toISOString(),
    createdAt: a.createdAt.toISOString(),
  };
}

export const CreatorApplicationService = {
  async apply(input: ApplyInput, req?: any) {
    const user = await User.findById(input.userId);
    if (!user) throw new NotFoundError();

    // If already a creator, no need to apply
    if (user.roles.includes('creator')) {
      throw new ConflictError('You already have Creator access.');
    }

    // Check for existing pending application
    const pending = await CreatorApplication.findOne({
      userId: input.userId,
      status: 'pending',
    });
    if (pending) {
      throw new ConflictError('You already have a pending application.');
    }

    // Check cooldown from most recent denied application
    const lastDenied = await CreatorApplication.findOne({
      userId: input.userId,
      status: 'denied',
    }).sort({ reviewedAt: -1 });

    if (lastDenied?.reviewedAt) {
      const elapsed = Date.now() - lastDenied.reviewedAt.getTime();
      if (elapsed < COOLDOWN_MS) {
        const daysRemaining = Math.ceil((COOLDOWN_MS - elapsed) / (24 * 60 * 60 * 1000));
        throw new AppError(
          429,
          'RATE_LIMITED',
          `You can re-apply in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`
        );
      }
    }

    const application = await CreatorApplication.create({
      userId: input.userId,
      motivation: input.motivation,
      experience: input.experience ?? '',
      portfolioUrl: input.portfolioUrl ?? '',
      status: 'pending',
    });

    await AuditService.record({
      actorId: input.userId,
      actorRoles: user.roles,
      action: 'creator_application.submitted',
      resourceType: 'CreatorApplication',
      resourceId: application._id.toString(),
      outcome: 'success',
      req,
    });

    return toPublic(application);
  },

  async getOwnApplication(userId: string) {
    const application = await CreatorApplication.findOne({ userId }).sort({ createdAt: -1 });
    if (!application) return null;
    return toPublic(application);
  },

  async listForReview(filter: { status?: ApplicationStatus } = {}) {
    const query: Record<string, unknown> = {};
    if (filter.status) query.status = filter.status;

    const applications = await CreatorApplication.find(query)
      .sort({ submittedAt: -1 })
      .limit(200)
      .populate('userId', 'username displayName email');

    return applications.map((a: any) => ({
      ...toPublic(a),
      user: a.userId
        ? {
            id: a.userId._id.toString(),
            username: a.userId.username,
            displayName: a.userId.displayName,
            email: a.userId.email,
          }
        : null,
    }));
  },

  async review(input: ReviewInput, req?: any) {
    const application = await CreatorApplication.findById(input.applicationId);
    if (!application) throw new NotFoundError();

    if (application.status !== 'pending') {
      throw new ConflictError(`This application has already been ${application.status}.`);
    }

    const applicant = await User.findById(application.userId);
    if (!applicant) throw new NotFoundError();

    // Update application
    application.status = input.decision;
    application.reviewedBy = input.reviewerId as any;
    application.reviewedAt = new Date();
    application.reviewNote = input.note ?? '';
    await application.save();

    // If approved, add creator role to the user's roles (idempotent)
    if (input.decision === 'approved') {
      if (!applicant.roles.includes('creator')) {
        applicant.roles.push('creator');
      }
      applicant.creatorStatus = 'approved';
      await applicant.save();
    } else {
      applicant.creatorStatus = 'revoked';
      await applicant.save();
    }

    await AuditService.record({
      actorId: input.reviewerId,
      actorRoles: input.reviewerRoles,
      action: `creator_application.${input.decision}`,
      resourceType: 'CreatorApplication',
      resourceId: application._id.toString(),
      outcome: 'success',
      metadata: {
        applicantId: application.userId.toString(),
        note: input.note ?? '',
      },
      req,
    });

    return toPublic(application);
  },

  toPublic,
};
