import type { Request } from 'express';
import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../config/logger.js';

interface AuditInput {
  actorId: string;
  actorRoles: string[];
  action: string;
  resourceType: string;
  resourceId?: string | null;
  outcome: 'success' | 'failure';
  metadata?: Record<string, unknown>;
  req?: Request;
}

export const AuditService = {
  async record(input: AuditInput): Promise<void> {
    try {
      const ipAddress =
        (input.req?.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        input.req?.ip ||
        '';
      const userAgent = input.req?.headers['user-agent'] || '';

      await AuditLog.create({
        actorId: input.actorId,
        actorRoles: input.actorRoles,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId ?? null,
        outcome: input.outcome,
        metadata: input.metadata ?? {},
        ipAddress,
        userAgent,
      });
    } catch (err) {
      // Never let audit failure break the request — log it and move on
      logger.error({ err, action: input.action }, 'Failed to write audit log');
    }
  },
};
