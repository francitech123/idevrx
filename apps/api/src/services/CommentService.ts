import { Comment } from '../models/Comment.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';

interface CreateCommentInput {
  projectId: string;
  authorId: string;
  body: string;
  parentId?: string | null;
}

function toPublicComment(c: any, author?: any) {
  return {
    id: c._id.toString(),
    projectId: c.projectId.toString(),
    authorId: c.authorId.toString(),
    parentId: c.parentId?.toString() ?? null,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    editedAt: c.editedAt?.toISOString() ?? null,
    author: author
      ? {
          id: author._id.toString(),
          username: author.username,
          displayName: author.displayName,
        }
      : null,
  };
}

export const CommentService = {
  async listForProject(projectId: string) {
    const project = await Project.findById(projectId);
    if (!project) {
      const err: any = new Error('Project not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const comments = await Comment.find({ projectId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(200);

    const authorIds = Array.from(new Set(comments.map((c) => c.authorId.toString())));
    const authors = await User.find({ _id: { $in: authorIds } }).select(
      'username displayName'
    );
    const authorMap = new Map(authors.map((a) => [a._id.toString(), a]));

    return comments.map((c) => toPublicComment(c, authorMap.get(c.authorId.toString())));
  },

  async create(input: CreateCommentInput) {
    const project = await Project.findById(input.projectId);
    if (!project) {
      const err: any = new Error('Project not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const comment = await Comment.create({
      projectId: input.projectId,
      authorId: input.authorId,
      body: input.body,
      parentId: input.parentId ?? null,
    });

    const count = await Comment.countDocuments({
      projectId: input.projectId,
      deletedAt: null,
    });
    await Project.updateOne(
      { _id: input.projectId },
      { $set: { 'counts.comments': count } }
    );

    if (input.parentId) {
      const parent = await Comment.findById(input.parentId);
      if (parent && parent.authorId.toString() !== input.authorId) {
        await Notification.create({
          userId: parent.authorId,
          type: 'reply',
          actorId: input.authorId,
          projectId: project._id,
          commentId: comment._id,
          message: 'Someone replied to your comment',
          link: `/ide/project-${String(project.projectNumber).padStart(3, '0')}/${project.slug}`,
        });
      }
    } else if (project.authorId.toString() !== input.authorId) {
      await Notification.create({
        userId: project.authorId,
        type: 'comment',
        actorId: input.authorId,
        projectId: project._id,
        commentId: comment._id,
        message: 'Someone commented on your project',
        link: `/ide/project-${String(project.projectNumber).padStart(3, '0')}/${project.slug}`,
      });
    }

    const author = await User.findById(input.authorId).select('username displayName');
    return toPublicComment(comment, author);
  },

  async update(commentId: string, userId: string, body: string) {
    const comment = await Comment.findById(commentId);
    if (!comment || comment.deletedAt) {
      const err: any = new Error('Comment not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    if (comment.authorId.toString() !== userId) {
      const err: any = new Error('Forbidden');
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }
    comment.body = body;
    comment.editedAt = new Date();
    await comment.save();
    return toPublicComment(comment);
  },

  async remove(commentId: string, userId: string, roles: string[]) {
    const comment = await Comment.findById(commentId);
    if (!comment || comment.deletedAt) {
      const err: any = new Error('Comment not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const isOwner = comment.authorId.toString() === userId;
    const isModerator =
      roles.includes('moderator') || roles.includes('admin') || roles.includes('ceo');

    if (!isOwner && !isModerator) {
      const err: any = new Error('Forbidden');
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    comment.deletedAt = new Date();
    await comment.save();

    const count = await Comment.countDocuments({
      projectId: comment.projectId,
      deletedAt: null,
    });
    await Project.updateOne(
      { _id: comment.projectId },
      { $set: { 'counts.comments': count } }
    );

    return { removed: true };
  },
};
