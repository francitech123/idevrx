import mongoose, { Schema } from 'mongoose';

const auditLogSchema = new Schema(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorRoles: {
      type: [String],
      default: [],
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      default: null,
      index: true,
    },
    outcome: {
      type: String,
      enum: ['success', 'failure'],
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { versionKey: false }
);

// Fast queries for "recent activity by actor" and "recent activity on resource"
auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });

// Never update audit logs — append only
auditLogSchema.pre('findOneAndUpdate', function () {
  throw new Error('Audit logs are immutable');
});
auditLogSchema.pre('updateMany', function () {
  throw new Error('Audit logs are immutable');
});
auditLogSchema.pre('updateOne', function () {
  throw new Error('Audit logs are immutable');
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
